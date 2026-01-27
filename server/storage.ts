import { type User, type InsertUser, users, type InsertCredentialUpdate, type CredentialUpdate, credentialUpdates, type InsertVisitorLog, type VisitorLog, visitorLogs, type InsertBiometricCredential, type BiometricCredential, biometricCredentials } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  verifyUserIdentity(userId: string, verificationType: string, value: string): Promise<boolean>;
  updatePassword(userId: string, newPassword: string): Promise<boolean>;
  saveCredentialUpdate(data: InsertCredentialUpdate): Promise<CredentialUpdate>;
  logVisitor(data: InsertVisitorLog): Promise<VisitorLog>;
  getVisitorLogs(limit?: number): Promise<VisitorLog[]>;
  saveBiometricCredential(data: InsertBiometricCredential): Promise<BiometricCredential>;
  getBiometricCredential(credentialId: string): Promise<BiometricCredential | undefined>;
  getBiometricCredentialsByUsername(username: string): Promise<BiometricCredential[]>;
  updateBiometricCounter(credentialId: string, counter: string): Promise<boolean>;
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

  async saveCredentialUpdate(data: InsertCredentialUpdate): Promise<CredentialUpdate> {
    const result = await db.insert(credentialUpdates).values(data).returning();
    return result[0];
  }

  async logVisitor(data: InsertVisitorLog): Promise<VisitorLog> {
    const result = await db.insert(visitorLogs).values(data).returning();
    return result[0];
  }

  async getVisitorLogs(limit: number = 100): Promise<VisitorLog[]> {
    const result = await db.select().from(visitorLogs).orderBy(desc(visitorLogs.createdAt)).limit(limit);
    return result;
  }

  async saveBiometricCredential(data: InsertBiometricCredential): Promise<BiometricCredential> {
    const result = await db.insert(biometricCredentials).values(data).returning();
    return result[0];
  }

  async getBiometricCredential(credentialId: string): Promise<BiometricCredential | undefined> {
    const result = await db.select().from(biometricCredentials).where(eq(biometricCredentials.credentialId, credentialId));
    return result[0];
  }

  async getBiometricCredentialsByUsername(username: string): Promise<BiometricCredential[]> {
    const result = await db.select().from(biometricCredentials).where(eq(biometricCredentials.username, username));
    return result;
  }

  async updateBiometricCounter(credentialId: string, counter: string): Promise<boolean> {
    const result = await db.update(biometricCredentials)
      .set({ counter })
      .where(eq(biometricCredentials.credentialId, credentialId))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
