import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { loginSchema, insertUserSchema } from "@shared/schema";
import type { User } from "@shared/schema";

const SessionStore = MemoryStore(session);

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    passport: { user: number };
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not authenticated" });
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as User).role === "admin") return next();
  res.status(403).json({ error: "Admin access required" });
}

export async function registerRoutes(server: Server, app: Express) {
  // Session setup
  app.use(
    session({
      secret: "llm-portal-secret-" + Date.now(),
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "lax" },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport config
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      const user = storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) return done(null, false, { message: "Invalid credentials" });
      if (!bcrypt.compareSync(password, user.password)) return done(null, false, { message: "Invalid credentials" });
      return done(null, user);
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser((id: number, done) => {
    const user = storage.getUser(id);
    done(null, user || false);
  });

  // Seed admin user if none exists
  const existingAdmin = storage.getUserByEmail("michaelgayed@leadlagmedia.com");
  if (!existingAdmin) {
    const hash = bcrypt.hashSync("admin123", 10);
    const admin = storage.createUser({
      email: "michaelgayed@leadlagmedia.com",
      password: hash,
      name: "Michael Gayed",
      company: "Lead-Lag Media",
      role: "admin",
      createdAt: new Date().toISOString(),
    });

    // Seed demo issuer
    const issuerHash = bcrypt.hashSync("demo123", 10);
    const issuer = storage.createUser({
      email: "kai@sparklinecapital.com",
      password: issuerHash,
      name: "Kai Wu",
      company: "Sparkline Capital",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });

    // Seed KPIs for issuer
    const kpis = [
      { userId: issuer.id, label: "FA Introductions", value: "34", change: "+5", changeDirection: "up", icon: "Users", sortOrder: 0 },
      { userId: issuer.id, label: "Email Sponsorships", value: "19", change: "+2", changeDirection: "up", icon: "Mail", sortOrder: 1 },
      { userId: issuer.id, label: "Total Email Views", value: "1.4M", change: "+18%", changeDirection: "up", icon: "Eye", sortOrder: 2 },
      { userId: issuer.id, label: "YouTube Episodes", value: "6", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 3 },
      { userId: issuer.id, label: "Video Clips", value: "7", change: "+3", changeDirection: "up", icon: "Film", sortOrder: 4 },
      { userId: issuer.id, label: "Client Clicks", value: "8,240", change: "+22%", changeDirection: "up", icon: "MousePointerClick", sortOrder: 5 },
    ];
    kpis.forEach((k) => storage.createKpi(k));

    // Seed activities for issuer
    const acts = [
      { userId: issuer.id, type: "fa_intro", title: "FA Introduction: Derek Sensenig", description: "30-min call completed with Sparkline Capital team", date: "2026-04-08", status: "completed" },
      { userId: issuer.id, type: "email_blast", title: "Sponsored Email #19", description: "Lead-Lag Report blast — 78,200 views, 440 clicks", date: "2026-04-04", status: "completed" },
      { userId: issuer.id, type: "podcast", title: "Lead-Lag Live Ep. 6", description: "Kai Wu discusses thematic investing trends on YouTube", date: "2026-03-28", status: "completed" },
      { userId: issuer.id, type: "fa_intro", title: "FA Introduction: Paul Garnett", description: "Garnett Investments — call scheduled", date: "2026-03-25", status: "completed" },
      { userId: issuer.id, type: "email_blast", title: "Sponsored Email #18", description: "Lead-Lag Report blast — 74,100 views, 385 clicks", date: "2026-03-21", status: "completed" },
      { userId: issuer.id, type: "fa_intro", title: "FA Introduction: Joe Fernandez", description: "Invenio Wealth Management — 30-min call completed", date: "2026-03-18", status: "completed" },
      { userId: issuer.id, type: "webinar", title: "Monthly Webinar", description: "Sparkline Capital factor investing webinar — 45 attendees", date: "2026-03-15", status: "completed" },
      { userId: issuer.id, type: "podcast", title: "Lead-Lag Live Ep. 5", description: "Thematic vs factor investing deep dive", date: "2026-03-10", status: "completed" },
      { userId: issuer.id, type: "fa_intro", title: "FA Introduction: David Nelson", description: "Belpointe — completed introduction", date: "2026-03-05", status: "completed" },
      { userId: issuer.id, type: "campaign", title: "Cold Email Campaign Wave 3", description: "Targeting 120 financial advisors, 8.2% reply rate", date: "2026-03-01", status: "completed" },
    ];
    acts.forEach((a) => storage.createActivity(a));

    // Seed deliverables
    const months = ["2026-01", "2026-02", "2026-03", "2026-04"];
    months.forEach((m) => {
      storage.createDeliverable({ userId: issuer.id, month: m, category: "FA Introductions", owed: 5, completed: m === "2026-04" ? 3 : 5 });
      storage.createDeliverable({ userId: issuer.id, month: m, category: "Email Sponsorships", owed: 2, completed: m === "2026-04" ? 1 : 2 });
      storage.createDeliverable({ userId: issuer.id, month: m, category: "Podcast Appearances", owed: 1, completed: m === "2026-04" ? 0 : 1 });
      storage.createDeliverable({ userId: issuer.id, month: m, category: "Webinar", owed: 1, completed: m === "2026-04" ? 0 : 1 });
    });

    // Seed monthly stats
    const statsData = [
      { month: "2025-11", fa_intros: 4, email_views: 142000, clicks: 780, podcast_views: 8200 },
      { month: "2025-12", fa_intros: 5, email_views: 158000, clicks: 890, podcast_views: 9400 },
      { month: "2026-01", fa_intros: 5, email_views: 167000, clicks: 960, podcast_views: 11200 },
      { month: "2026-02", fa_intros: 5, email_views: 174000, clicks: 1050, podcast_views: 10800 },
      { month: "2026-03", fa_intros: 5, email_views: 182000, clicks: 1200, podcast_views: 12500 },
      { month: "2026-04", fa_intros: 3, email_views: 78200, clicks: 440, podcast_views: 0 },
    ];
    statsData.forEach((s) => {
      storage.createMonthlyStat({ userId: issuer.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: issuer.id, month: s.month, metric: "email_views", value: s.email_views });
      storage.createMonthlyStat({ userId: issuer.id, month: s.month, metric: "clicks", value: s.clicks });
      storage.createMonthlyStat({ userId: issuer.id, month: s.month, metric: "podcast_views", value: s.podcast_views });
    });

    // Seed demo advisor
    const advisorHash = bcrypt.hashSync("demo123", 10);
    const advisor = storage.createUser({
      email: "advisor@demo.com",
      password: advisorHash,
      name: "James Mitchell",
      company: "Mitchell Wealth Advisors",
      role: "advisor",
      createdAt: new Date().toISOString(),
    });

    // Seed advisor KPIs
    const advisorKpis = [
      { userId: advisor.id, label: "Issuer Introductions", value: "12", change: "+3", changeDirection: "up", icon: "Handshake", sortOrder: 0 },
      { userId: advisor.id, label: "LinkedIn Connections", value: "87", change: "+15", changeDirection: "up", icon: "Linkedin", sortOrder: 1 },
      { userId: advisor.id, label: "Campaign Replies", value: "24", change: "+6", changeDirection: "up", icon: "MessageSquare", sortOrder: 2 },
      { userId: advisor.id, label: "Profile Views", value: "340", change: "+28%", changeDirection: "up", icon: "Eye", sortOrder: 3 },
    ];
    advisorKpis.forEach((k) => storage.createKpi(k));

    const advisorActs = [
      { userId: advisor.id, type: "fa_intro", title: "Introduction: Sparkline Capital", description: "30-min discovery call with Kai Wu", date: "2026-04-02", status: "completed" },
      { userId: advisor.id, type: "campaign", title: "LinkedIn Campaign Active", description: "HeyReach campaign running — 15 connections this week", date: "2026-03-28", status: "completed" },
      { userId: advisor.id, type: "fa_intro", title: "Introduction: Running Oak Capital", description: "Introduction to Seth Cogswell", date: "2026-03-20", status: "completed" },
    ];
    advisorActs.forEach((a) => storage.createActivity(a));
  }

  // === AUTH ROUTES ===

  app.post("/api/auth/login", (req, res, next) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid email or password" });

    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });
      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const { password, ...safe } = user;
        return res.json(safe);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    const { password, ...safe } = req.user as User;
    res.json(safe);
  });

  // === CLIENT DASHBOARD ROUTES ===

  app.get("/api/dashboard/kpis", requireAuth, (req, res) => {
    const user = req.user as User;
    const kpis = storage.getKpisByUser(user.id);
    res.json(kpis);
  });

  app.get("/api/dashboard/activities", requireAuth, (req, res) => {
    const user = req.user as User;
    const acts = storage.getActivitiesByUser(user.id);
    res.json(acts);
  });

  app.get("/api/dashboard/deliverables", requireAuth, (req, res) => {
    const user = req.user as User;
    const delvs = storage.getDeliverablesByUser(user.id);
    res.json(delvs);
  });

  app.get("/api/dashboard/stats", requireAuth, (req, res) => {
    const user = req.user as User;
    const stats = storage.getMonthlyStatsByUser(user.id);
    res.json(stats);
  });

  // === ADMIN ROUTES ===

  app.get("/api/admin/users", requireAdmin, (req, res) => {
    const all = storage.getAllUsers().map(({ password, ...u }) => u);
    res.json(all);
  });

  app.post("/api/admin/users", requireAdmin, (req, res) => {
    const parsed = insertUserSchema.safeParse({
      ...req.body,
      password: bcrypt.hashSync(req.body.password, 10),
      createdAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ error: "Invalid user data", details: parsed.error.errors });
    const existing = storage.getUserByEmail(parsed.data.email.toLowerCase().trim());
    if (existing) return res.status(409).json({ error: "Email already exists" });
    const user = storage.createUser({ ...parsed.data, email: parsed.data.email.toLowerCase().trim() });
    const { password, ...safe } = user;
    res.status(201).json(safe);
  });

  app.patch("/api/admin/users/:id", requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const updates: any = { ...req.body };
    if (updates.password) {
      updates.password = bcrypt.hashSync(updates.password, 10);
    }
    const user = storage.updateUser(id, updates);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...safe } = user;
    res.json(safe);
  });

  app.delete("/api/admin/users/:id", requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    storage.deleteKpisByUser(id);
    storage.deleteActivitiesByUser(id);
    storage.deleteDeliverablesByUser(id);
    storage.deleteMonthlyStatsByUser(id);
    storage.deleteUser(id);
    res.json({ ok: true });
  });

  // Admin: manage client KPIs
  app.get("/api/admin/users/:id/kpis", requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    res.json(storage.getKpisByUser(id));
  });

  app.post("/api/admin/users/:id/kpis", requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    const kpi = storage.createKpi({ ...req.body, userId });
    res.status(201).json(kpi);
  });

  app.delete("/api/admin/kpis/:id", requireAdmin, (req, res) => {
    storage.deleteKpi(parseInt(req.params.id));
    res.json({ ok: true });
  });

  // Admin: manage client activities
  app.get("/api/admin/users/:id/activities", requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    res.json(storage.getActivitiesByUser(id));
  });

  app.post("/api/admin/users/:id/activities", requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    const activity = storage.createActivity({ ...req.body, userId });
    res.status(201).json(activity);
  });

  // Admin: manage client deliverables
  app.get("/api/admin/users/:id/deliverables", requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    res.json(storage.getDeliverablesByUser(id));
  });

  app.post("/api/admin/users/:id/deliverables", requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    const deliv = storage.createDeliverable({ ...req.body, userId });
    res.status(201).json(deliv);
  });

  app.patch("/api/admin/deliverables/:id", requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const updated = storage.updateDeliverable(id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  // Admin: manage client monthly stats
  app.get("/api/admin/users/:id/stats", requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    res.json(storage.getMonthlyStatsByUser(id));
  });

  app.post("/api/admin/users/:id/stats", requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    const stat = storage.createMonthlyStat({ ...req.body, userId });
    res.status(201).json(stat);
  });
}
