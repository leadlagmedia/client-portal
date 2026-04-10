import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Client types: issuer, sponsor, advisor
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(), // "admin" | "issuer" | "sponsor" | "advisor"
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").notNull().default(""),
});

// KPI metrics per client
export const kpiMetrics = sqliteTable("kpi_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  change: text("change"), // e.g. "+12%" or "-3%"
  changeDirection: text("change_direction"), // "up" | "down" | "flat"
  icon: text("icon"), // lucide icon name
  sortOrder: integer("sort_order").notNull().default(0),
});

// Activity log entries
export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "fa_intro" | "email_blast" | "podcast" | "webinar" | "article" | "social" | "campaign" | "other"
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  status: text("status").notNull().default("completed"), // "completed" | "scheduled" | "pending"
  metadata: text("metadata"), // JSON string for extra data
});

// Deliverables tracking
export const deliverables = sqliteTable("deliverables", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  month: text("month").notNull(), // "2026-03"
  category: text("category").notNull(), // "FA Introductions" | "Email Sponsorships" | "Podcast Appearances" | etc.
  owed: integer("owed").notNull().default(0),
  completed: integer("completed").notNull().default(0),
  notes: text("notes"),
});

// Password reset tokens
export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
});

// Monthly performance data for charts
export const monthlyStats = sqliteTable("monthly_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  month: text("month").notNull(),
  metric: text("metric").notNull(), // "fa_intros" | "email_views" | "clicks" | "podcast_views"
  value: integer("value").notNull().default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertKpiSchema = createInsertSchema(kpiMetrics).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertDeliverableSchema = createInsertSchema(deliverables).omit({ id: true });
export const insertMonthlyStatSchema = createInsertSchema(monthlyStats).omit({ id: true });
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type KpiMetric = typeof kpiMetrics.$inferSelect;
export type InsertKpiMetric = z.infer<typeof insertKpiSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Deliverable = typeof deliverables.$inferSelect;
export type InsertDeliverable = z.infer<typeof insertDeliverableSchema>;
export type MonthlyStat = typeof monthlyStats.$inferSelect;
export type InsertMonthlyStat = z.infer<typeof insertMonthlyStatSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
