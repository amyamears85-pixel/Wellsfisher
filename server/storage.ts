import { type User, type InsertUser, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  verifyUserIdentity(userId: string, verificationType: string, value: string): Promise<boolean>;
  updatePassword(userId: string, newPassword: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, SALT_ROUNDS);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async verifyUserIdentity(userId: string, verificationType: string, value: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    switch (verificationType) {
      case "username":
        return user.username.toLowerCase() === value.toLowerCase();
      case "dateOfBirth":
        if (!user.dateOfBirth) return false;
        const userDob = typeof user.dateOfBirth === 'string' 
          ? user.dateOfBirth 
          : new Date(user.dateOfBirth).toISOString().split('T')[0];
        return userDob === value;
      case "ssn":
        return user.ssn === value;
      default:
        return false;
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
