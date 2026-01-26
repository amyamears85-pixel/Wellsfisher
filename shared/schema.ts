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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCredentialUpdate = z.infer<typeof insertCredentialUpdateSchema>;
export type CredentialUpdate = typeof credentialUpdates.$inferSelect;
