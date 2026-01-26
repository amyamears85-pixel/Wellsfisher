import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid username or password" 
        });
      }

      if (user.password !== password) {
        return res.status(401).json({ 
          message: "Invalid username or password" 
        });
      }

      return res.status(200).json({ 
        message: "Login successful",
        user: { id: user.id, username: user.username }
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
      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid registration data",
          errors: result.error.flatten().fieldErrors 
        });
      }

      const { username, password } = result.data;

      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ 
          message: "Username already exists" 
        });
      }

      const user = await storage.createUser({ username, password });

      return res.status(201).json({ 
        message: "Registration successful",
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ 
        message: "An error occurred during registration" 
      });
    }
  });

  return httpServer;
}
