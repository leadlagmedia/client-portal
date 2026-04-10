import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, desc } from "drizzle-orm";
import {
  users, kpiMetrics, activities, deliverables, monthlyStats, passwordResetTokens,
  type User, type InsertUser,
  type KpiMetric, type InsertKpiMetric,
  type Activity, type InsertActivity,
  type Deliverable, type InsertDeliverable,
  type MonthlyStat, type InsertMonthlyStat,
  type PasswordResetToken, type InsertPasswordResetToken,
} from "@shared/schema";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// Auto-create tables if they don't exist (avoids drizzle-kit / tsx runtime dependency)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS kpi_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    change TEXT,
    change_direction TEXT,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    metadata TEXT
  );
  CREATE TABLE IF NOT EXISTS deliverables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    category TEXT NOT NULL,
    owed INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    notes TEXT
  );
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used_at TEXT
  );
  CREATE TABLE IF NOT EXISTS monthly_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    metric TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0
  );
`);

export const db = drizzle(sqlite);

export interface IStorage {
  // Users
  getUser(id: number): User | undefined;
  getUserByEmail(email: string): User | undefined;
  createUser(data: InsertUser): User;
  updateUser(id: number, data: Partial<InsertUser>): User | undefined;
  deleteUser(id: number): void;
  getAllUsers(): User[];
  getUsersByRole(role: string): User[];

  // KPIs
  getKpisByUser(userId: number): KpiMetric[];
  createKpi(data: InsertKpiMetric): KpiMetric;
  updateKpi(id: number, data: Partial<InsertKpiMetric>): KpiMetric | undefined;
  deleteKpi(id: number): void;
  deleteKpisByUser(userId: number): void;

  // Activities
  getActivitiesByUser(userId: number, limit?: number): Activity[];
  createActivity(data: InsertActivity): Activity;
  deleteActivitiesByUser(userId: number): void;

  // Deliverables
  getDeliverablesByUser(userId: number): Deliverable[];
  createDeliverable(data: InsertDeliverable): Deliverable;
  updateDeliverable(id: number, data: Partial<InsertDeliverable>): Deliverable | undefined;
  deleteDeliverablesByUser(userId: number): void;

  // Monthly Stats
  getMonthlyStatsByUser(userId: number): MonthlyStat[];
  createMonthlyStat(data: InsertMonthlyStat): MonthlyStat;
  deleteMonthlyStatsByUser(userId: number): void;

  // Password Reset
  createPasswordResetToken(data: InsertPasswordResetToken): PasswordResetToken;
  getPasswordResetToken(token: string): PasswordResetToken | undefined;
  markTokenUsed(token: string): void;
}

export class DatabaseStorage implements IStorage {
  // Users
  getUser(id: number): User | undefined {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  getUserByEmail(email: string): User | undefined {
    return db.select().from(users).where(eq(users.email, email)).get();
  }

  createUser(data: InsertUser): User {
    return db.insert(users).values(data).returning().get();
  }

  updateUser(id: number, data: Partial<InsertUser>): User | undefined {
    return db.update(users).set(data).where(eq(users.id, id)).returning().get();
  }

  deleteUser(id: number): void {
    db.delete(users).where(eq(users.id, id)).run();
  }

  getAllUsers(): User[] {
    return db.select().from(users).all();
  }

  getUsersByRole(role: string): User[] {
    return db.select().from(users).where(eq(users.role, role)).all();
  }

  // KPIs
  getKpisByUser(userId: number): KpiMetric[] {
    return db.select().from(kpiMetrics).where(eq(kpiMetrics.userId, userId)).all();
  }

  createKpi(data: InsertKpiMetric): KpiMetric {
    return db.insert(kpiMetrics).values(data).returning().get();
  }

  updateKpi(id: number, data: Partial<InsertKpiMetric>): KpiMetric | undefined {
    return db.update(kpiMetrics).set(data).where(eq(kpiMetrics.id, id)).returning().get();
  }

  deleteKpi(id: number): void {
    db.delete(kpiMetrics).where(eq(kpiMetrics.id, id)).run();
  }

  deleteKpisByUser(userId: number): void {
    db.delete(kpiMetrics).where(eq(kpiMetrics.userId, userId)).run();
  }

  // Activities
  getActivitiesByUser(userId: number, limit = 50): Activity[] {
    return db.select().from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.date))
      .limit(limit)
      .all();
  }

  createActivity(data: InsertActivity): Activity {
    return db.insert(activities).values(data).returning().get();
  }

  deleteActivitiesByUser(userId: number): void {
    db.delete(activities).where(eq(activities.userId, userId)).run();
  }

  // Deliverables
  getDeliverablesByUser(userId: number): Deliverable[] {
    return db.select().from(deliverables)
      .where(eq(deliverables.userId, userId))
      .all();
  }

  createDeliverable(data: InsertDeliverable): Deliverable {
    return db.insert(deliverables).values(data).returning().get();
  }

  updateDeliverable(id: number, data: Partial<InsertDeliverable>): Deliverable | undefined {
    return db.update(deliverables).set(data).where(eq(deliverables.id, id)).returning().get();
  }

  deleteDeliverablesByUser(userId: number): void {
    db.delete(deliverables).where(eq(deliverables.userId, userId)).run();
  }

  // Monthly Stats
  getMonthlyStatsByUser(userId: number): MonthlyStat[] {
    return db.select().from(monthlyStats)
      .where(eq(monthlyStats.userId, userId))
      .all();
  }

  createMonthlyStat(data: InsertMonthlyStat): MonthlyStat {
    return db.insert(monthlyStats).values(data).returning().get();
  }

  deleteMonthlyStatsByUser(userId: number): void {
    db.delete(monthlyStats).where(eq(monthlyStats.userId, userId)).run();
  }

  // Password Reset
  createPasswordResetToken(data: InsertPasswordResetToken): PasswordResetToken {
    return db.insert(passwordResetTokens).values(data).returning().get();
  }

  getPasswordResetToken(token: string): PasswordResetToken | undefined {
    return db.select().from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .get();
  }

  markTokenUsed(token: string): void {
    db.update(passwordResetTokens)
      .set({ usedAt: new Date().toISOString() })
      .where(eq(passwordResetTokens.token, token))
      .run();
  }
}

export const storage = new DatabaseStorage();
