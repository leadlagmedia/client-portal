import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, desc } from "drizzle-orm";
import {
  users, kpiMetrics, activities, deliverables, monthlyStats,
  type User, type InsertUser,
  type KpiMetric, type InsertKpiMetric,
  type Activity, type InsertActivity,
  type Deliverable, type InsertDeliverable,
  type MonthlyStat, type InsertMonthlyStat,
} from "@shared/schema";

const sqlite = new Database("portal.db");
sqlite.pragma("journal_mode = WAL");

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
}

export const storage = new DatabaseStorage();
