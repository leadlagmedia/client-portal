import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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

    // Seed Distillate Capital issuer
    const distillateHash = bcrypt.hashSync("distillate2026", 10);
    storage.createUser({
      email: "jolsen@distillatecapital.com",
      password: distillateHash,
      name: "John Olsen",
      company: "Distillate Capital",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });

    // Seed Greg Babij — FA Services advisor
    const gregHash = bcrypt.hashSync("sundial2026", 10);
    const gregUser = storage.createUser({
      email: "gb@sundial.io",
      password: gregHash,
      name: "Greg Babij",
      company: "Sundial",
      role: "advisor",
      createdAt: new Date().toISOString(),
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

    // ── Seed issuer accounts for all client dashboards ──

    // GraniteShares — Will Rhind
    storage.createUser({
      email: "wrhind@graniteshares.com",
      password: bcrypt.hashSync("granite2026", 10),
      name: "Will Rhind",
      company: "GraniteShares",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });

    // Running Oak — Seth Cogswell
    storage.createUser({
      email: "seth@runningoakcapital.com",
      password: bcrypt.hashSync("runningoak2026", 10),
      name: "Seth Cogswell",
      company: "Running Oak Capital",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });

    // Dynamic Wealth — Brad Barrie
    storage.createUser({
      email: "brad@dynamicwg.com",
      password: bcrypt.hashSync("dynamic2026", 10),
      name: "Brad Barrie",
      company: "Dynamic Wealth Group",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });

    // SanJac Alpha — Jimmy Kelly
    storage.createUser({
      email: "jimmy@sanjacalpha.com",
      password: bcrypt.hashSync("sanjac2026", 10),
      name: "Jimmy Kelly",
      company: "SanJac Alpha",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });

    // KraneShares — Joe Demmler
    storage.createUser({
      email: "joe.demmler@kraneshares.com",
      password: bcrypt.hashSync("krane2026", 10),
      name: "Joe Demmler",
      company: "KraneShares",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });

    // USCF — John Love
    storage.createUser({
      email: "jlove@uscfinvestments.com",
      password: bcrypt.hashSync("uscf2026", 10),
      name: "John Love",
      company: "USCF Investments",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });

    // Infrastructure Capital — Jay Hatfield
    storage.createUser({
      email: "jhatfield@infracapfunds.com",
      password: bcrypt.hashSync("infracap2026", 10),
      name: "Jay Hatfield",
      company: "Infrastructure Capital Advisors",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });

    // TappAlpha — Mike Loukas
    storage.createUser({
      email: "mloukas@tappalpha.com",
      password: bcrypt.hashSync("tapp2026", 10),
      name: "Mike Loukas",
      company: "TappAlpha",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });


    // ══════════════════════════════════════════════════
    // SEED DASHBOARD DATA FOR ALL CLIENTS
    // ══════════════════════════════════════════════════

    // ── GraniteShares ──
    const graniteshares = storage.getUserByEmail("wrhind@graniteshares.com")!;
    [
      { userId: graniteshares.id, label: "FA Introductions", value: "62", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: graniteshares.id, label: "Podcast Episodes", value: "4", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 1 },
      { userId: graniteshares.id, label: "Months Active", value: "12", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 2 },
      { userId: graniteshares.id, label: "Total Investment", value: "$215,836", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 3 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: graniteshares.id, type: "fa_intro", title: "FA Introductions — 10 scheduled", description: "10 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
      { userId: graniteshares.id, type: "fa_intro", title: "FA Introductions — 12 completed", description: "12 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: graniteshares.id, type: "fa_intro", title: "FA Introductions — 9 completed", description: "9 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: graniteshares.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 1/14/26", date: "2026-01-25", status: "completed" },
      { userId: graniteshares.id, type: "fa_intro", title: "FA Introductions — 6 completed", description: "6 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: graniteshares.id, type: "fa_intro", title: "FA Introductions — 6 completed", description: "6 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: graniteshares.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2025-10", date: "2025-10-15", status: "completed" },
      { userId: graniteshares.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 4/29/26", date: "2025-10-25", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: graniteshares.id, month: "2025-10", category: "FA Introductions", owed: 10, completed: 4 },
      { userId: graniteshares.id, month: "2025-10", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: graniteshares.id, month: "2025-11", category: "FA Introductions", owed: 10, completed: 6 },
      { userId: graniteshares.id, month: "2025-12", category: "FA Introductions", owed: 10, completed: 6 },
      { userId: graniteshares.id, month: "2026-01", category: "FA Introductions", owed: 10, completed: 9 },
      { userId: graniteshares.id, month: "2026-01", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: graniteshares.id, month: "2026-02", category: "FA Introductions", owed: 10, completed: 12 },
      { userId: graniteshares.id, month: "2026-04", category: "FA Introductions", owed: 10, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-02", fa_intros: 4, email_sends: 0, revenue: 16667 },
      { month: "2025-09", fa_intros: 11, email_sends: 0, revenue: 16667 },
      { month: "2025-10", fa_intros: 4, email_sends: 0, revenue: 16667 },
      { month: "2025-11", fa_intros: 6, email_sends: 0, revenue: 16667 },
      { month: "2025-12", fa_intros: 6, email_sends: 0, revenue: 16667 },
      { month: "2026-01", fa_intros: 9, email_sends: 0, revenue: 16667 },
      { month: "2026-02", fa_intros: 12, email_sends: 0, revenue: 16667 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 16667 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: graniteshares.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: graniteshares.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: graniteshares.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Running Oak Capital ──
    const runningoakcapital = storage.getUserByEmail("seth@runningoakcapital.com")!;
    [
      { userId: runningoakcapital.id, label: "FA Introductions", value: "59", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: runningoakcapital.id, label: "Sponsored Emails", value: "22", change: "0", changeDirection: "neutral", icon: "Mail", sortOrder: 1 },
      { userId: runningoakcapital.id, label: "Podcast Episodes", value: "11", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 2 },
      { userId: runningoakcapital.id, label: "Months Active", value: "12", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 3 },
      { userId: runningoakcapital.id, label: "Total Investment", value: "$105,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 4 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: runningoakcapital.id, type: "fa_intro", title: "FA Introductions — 4 scheduled", description: "4 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
      { userId: runningoakcapital.id, type: "fa_intro", title: "FA Introductions — 1 completed", description: "1 advisor introduction calls completed for 2026-03", date: "2026-03-15", status: "completed" },
      { userId: runningoakcapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-03", date: "2026-03-20", status: "completed" },
      { userId: runningoakcapital.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 4/15/26", date: "2026-03-25", status: "completed" },
      { userId: runningoakcapital.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: runningoakcapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-02", date: "2026-02-20", status: "completed" },
      { userId: runningoakcapital.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 3/25/26", date: "2026-02-25", status: "completed" },
      { userId: runningoakcapital.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: runningoakcapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-01", date: "2026-01-20", status: "completed" },
      { userId: runningoakcapital.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 2/5/26", date: "2026-01-25", status: "completed" },
      { userId: runningoakcapital.id, type: "fa_intro", title: "FA Introductions — 7 completed", description: "7 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: runningoakcapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-12", date: "2025-12-20", status: "completed" },
      { userId: runningoakcapital.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 1/22/26", date: "2025-12-25", status: "completed" },
      { userId: runningoakcapital.id, type: "fa_intro", title: "FA Introductions — 7 completed", description: "7 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: runningoakcapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-11", date: "2025-11-20", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: runningoakcapital.id, month: "2025-11", category: "FA Introductions", owed: 7, completed: 7 },
      { userId: runningoakcapital.id, month: "2025-11", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: runningoakcapital.id, month: "2025-11", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: runningoakcapital.id, month: "2025-12", category: "FA Introductions", owed: 7, completed: 7 },
      { userId: runningoakcapital.id, month: "2025-12", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: runningoakcapital.id, month: "2025-12", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: runningoakcapital.id, month: "2026-01", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: runningoakcapital.id, month: "2026-01", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: runningoakcapital.id, month: "2026-01", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: runningoakcapital.id, month: "2026-02", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: runningoakcapital.id, month: "2026-02", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: runningoakcapital.id, month: "2026-02", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: runningoakcapital.id, month: "2026-03", category: "FA Introductions", owed: 4, completed: 1 },
      { userId: runningoakcapital.id, month: "2026-03", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: runningoakcapital.id, month: "2026-03", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: runningoakcapital.id, month: "2026-04", category: "FA Introductions", owed: 4, completed: 0 },
      { userId: runningoakcapital.id, month: "2026-04", category: "Sponsored Emails", owed: 2, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 7, email_sends: 2, revenue: 10000 },
      { month: "2025-10", fa_intros: 7, email_sends: 2, revenue: 10000 },
      { month: "2025-11", fa_intros: 7, email_sends: 2, revenue: 10000 },
      { month: "2025-12", fa_intros: 7, email_sends: 2, revenue: 10000 },
      { month: "2026-01", fa_intros: 4, email_sends: 2, revenue: 10000 },
      { month: "2026-02", fa_intros: 4, email_sends: 2, revenue: 10000 },
      { month: "2026-03", fa_intros: 1, email_sends: 2, revenue: 10000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 10000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: runningoakcapital.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: runningoakcapital.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: runningoakcapital.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Dynamic Wealth Group ──
    const dynamicwealthgroup = storage.getUserByEmail("brad@dynamicwg.com")!;
    [
      { userId: dynamicwealthgroup.id, label: "FA Introductions", value: "27", change: "+1", changeDirection: "up", icon: "Users", sortOrder: 0 },
      { userId: dynamicwealthgroup.id, label: "Sponsored Emails", value: "23", change: "+1", changeDirection: "up", icon: "Mail", sortOrder: 1 },
      { userId: dynamicwealthgroup.id, label: "Podcast Episodes", value: "7", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 2 },
      { userId: dynamicwealthgroup.id, label: "Months Active", value: "11", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 3 },
      { userId: dynamicwealthgroup.id, label: "Total Investment", value: "$81,500", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 4 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: dynamicwealthgroup.id, type: "fa_intro", title: "FA Introductions — 1 completed", description: "1 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2026-02", date: "2026-02-20", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-01", date: "2026-01-20", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-12", date: "2025-12-20", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-11", date: "2025-11-20", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2025-10", date: "2025-10-15", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-10", date: "2025-10-20", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 10/30/25", date: "2025-10-25", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2025-09", date: "2025-09-15", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-09", date: "2025-09-20", status: "completed" },
      { userId: dynamicwealthgroup.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — Swapped FA Intro", date: "2025-09-25", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: dynamicwealthgroup.id, month: "2025-09", category: "FA Introductions", owed: 2, completed: 2 },
      { userId: dynamicwealthgroup.id, month: "2025-09", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: dynamicwealthgroup.id, month: "2025-09", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: dynamicwealthgroup.id, month: "2025-10", category: "FA Introductions", owed: 2, completed: 2 },
      { userId: dynamicwealthgroup.id, month: "2025-10", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: dynamicwealthgroup.id, month: "2025-10", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: dynamicwealthgroup.id, month: "2025-11", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: dynamicwealthgroup.id, month: "2025-11", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: dynamicwealthgroup.id, month: "2025-12", category: "FA Introductions", owed: 2, completed: 2 },
      { userId: dynamicwealthgroup.id, month: "2025-12", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: dynamicwealthgroup.id, month: "2026-01", category: "FA Introductions", owed: 2, completed: 2 },
      { userId: dynamicwealthgroup.id, month: "2026-01", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: dynamicwealthgroup.id, month: "2026-02", category: "FA Introductions", owed: 2, completed: 1 },
      { userId: dynamicwealthgroup.id, month: "2026-02", category: "Sponsored Emails", owed: 2, completed: 1 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-01", fa_intros: 2, email_sends: 2, revenue: 3000 },
      { month: "2025-02", fa_intros: 2, email_sends: 2, revenue: 9500 },
      { month: "2025-09", fa_intros: 2, email_sends: 2, revenue: 9500 },
      { month: "2025-10", fa_intros: 2, email_sends: 2, revenue: 9500 },
      { month: "2025-11", fa_intros: 5, email_sends: 2, revenue: 9500 },
      { month: "2025-12", fa_intros: 2, email_sends: 2, revenue: 9500 },
      { month: "2026-01", fa_intros: 2, email_sends: 2, revenue: 9500 },
      { month: "2026-02", fa_intros: 1, email_sends: 1, revenue: 9500 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: dynamicwealthgroup.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: dynamicwealthgroup.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: dynamicwealthgroup.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── SanJac Alpha ──
    const sanjacalpha = storage.getUserByEmail("jimmy@sanjacalpha.com")!;
    [
      { userId: sanjacalpha.id, label: "FA Introductions", value: "34", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: sanjacalpha.id, label: "Sponsored Emails", value: "16", change: "0", changeDirection: "neutral", icon: "Mail", sortOrder: 1 },
      { userId: sanjacalpha.id, label: "Months Active", value: "9", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 2 },
      { userId: sanjacalpha.id, label: "Total Investment", value: "$49,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 3 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: sanjacalpha.id, type: "fa_intro", title: "FA Introductions — 7 scheduled", description: "7 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
      { userId: sanjacalpha.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2026-03", date: "2026-03-15", status: "completed" },
      { userId: sanjacalpha.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-03", date: "2026-03-20", status: "completed" },
      { userId: sanjacalpha.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: sanjacalpha.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-02", date: "2026-02-20", status: "completed" },
      { userId: sanjacalpha.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: sanjacalpha.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-01", date: "2026-01-20", status: "completed" },
      { userId: sanjacalpha.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: sanjacalpha.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-12", date: "2025-12-20", status: "completed" },
      { userId: sanjacalpha.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: sanjacalpha.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-11", date: "2025-11-20", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: sanjacalpha.id, month: "2025-11", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: sanjacalpha.id, month: "2025-11", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: sanjacalpha.id, month: "2025-12", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: sanjacalpha.id, month: "2025-12", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: sanjacalpha.id, month: "2026-01", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: sanjacalpha.id, month: "2026-01", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: sanjacalpha.id, month: "2026-02", category: "FA Introductions", owed: 5, completed: 2 },
      { userId: sanjacalpha.id, month: "2026-02", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: sanjacalpha.id, month: "2026-03", category: "FA Introductions", owed: 7, completed: 2 },
      { userId: sanjacalpha.id, month: "2026-03", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: sanjacalpha.id, month: "2026-04", category: "FA Introductions", owed: 7, completed: 0 },
      { userId: sanjacalpha.id, month: "2026-04", category: "Sponsored Emails", owed: 2, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2025-10", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2025-11", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2025-12", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2026-01", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2026-02", fa_intros: 2, email_sends: 2, revenue: 5000 },
      { month: "2026-03", fa_intros: 2, email_sends: 2, revenue: 7000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 7000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: sanjacalpha.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: sanjacalpha.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: sanjacalpha.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── KraneShares ──
    const kraneshares = storage.getUserByEmail("joe.demmler@kraneshares.com")!;
    [
      { userId: kraneshares.id, label: "Podcast Episodes", value: "8", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 0 },
      { userId: kraneshares.id, label: "Months Active", value: "9", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 1 },
      { userId: kraneshares.id, label: "Total Investment", value: "$90,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 2 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: kraneshares.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 4/22/26", date: "2026-03-25", status: "completed" },
      { userId: kraneshares.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 7/1/25, 4/23/26", date: "2026-02-25", status: "completed" },
      { userId: kraneshares.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 2/11/26, 2/12/26", date: "2026-01-25", status: "completed" },
      { userId: kraneshares.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 2/18/26, 3/30/26", date: "2025-12-25", status: "completed" },
      { userId: kraneshares.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 12/3/25, 3/23/26", date: "2025-11-25", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: kraneshares.id, month: "2025-11", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: kraneshares.id, month: "2025-12", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: kraneshares.id, month: "2026-01", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: kraneshares.id, month: "2026-02", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: kraneshares.id, month: "2026-03", category: "Podcast Appearances", owed: 1, completed: 1 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 0, email_sends: 0, revenue: 10000 },
      { month: "2025-10", fa_intros: 0, email_sends: 0, revenue: 10000 },
      { month: "2025-11", fa_intros: 0, email_sends: 0, revenue: 10000 },
      { month: "2025-12", fa_intros: 0, email_sends: 0, revenue: 10000 },
      { month: "2026-01", fa_intros: 0, email_sends: 0, revenue: 10000 },
      { month: "2026-02", fa_intros: 0, email_sends: 0, revenue: 10000 },
      { month: "2026-03", fa_intros: 0, email_sends: 0, revenue: 10000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 10000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: kraneshares.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: kraneshares.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: kraneshares.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── USCF Investments ──
    const uscfinvestments = storage.getUserByEmail("jlove@uscfinvestments.com")!;
    [
      { userId: uscfinvestments.id, label: "FA Introductions", value: "4", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: uscfinvestments.id, label: "Months Active", value: "9", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 1 },
      { userId: uscfinvestments.id, label: "Total Investment", value: "$63,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 2 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: uscfinvestments.id, type: "fa_intro", title: "FA Introductions — 2 scheduled", description: "2 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
      { userId: uscfinvestments.id, type: "fa_intro", title: "FA Introductions — 2 scheduled", description: "2 advisor introductions in progress for 2026-03", date: "2026-03-15", status: "in_progress" },
      { userId: uscfinvestments.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: uscfinvestments.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: uscfinvestments.id, month: "2026-01", category: "FA Introductions", owed: 2, completed: 2 },
      { userId: uscfinvestments.id, month: "2026-02", category: "FA Introductions", owed: 2, completed: 2 },
      { userId: uscfinvestments.id, month: "2026-03", category: "FA Introductions", owed: 2, completed: 0 },
      { userId: uscfinvestments.id, month: "2026-04", category: "FA Introductions", owed: 2, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 0, email_sends: 0, revenue: 7000 },
      { month: "2025-10", fa_intros: 0, email_sends: 0, revenue: 7000 },
      { month: "2025-11", fa_intros: 0, email_sends: 0, revenue: 7000 },
      { month: "2025-12", fa_intros: 0, email_sends: 0, revenue: 7000 },
      { month: "2026-01", fa_intros: 2, email_sends: 0, revenue: 7000 },
      { month: "2026-02", fa_intros: 2, email_sends: 0, revenue: 7000 },
      { month: "2026-03", fa_intros: 0, email_sends: 0, revenue: 7000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 7000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: uscfinvestments.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: uscfinvestments.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: uscfinvestments.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Infrastructure Capital Advisors ──
    const infrastructurecapitaladvisors = storage.getUserByEmail("jhatfield@infracapfunds.com")!;
    [
      { userId: infrastructurecapitaladvisors.id, label: "Podcast Episodes", value: "10", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 0 },
      { userId: infrastructurecapitaladvisors.id, label: "Months Active", value: "10", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 1 },
      { userId: infrastructurecapitaladvisors.id, label: "Total Investment", value: "$118,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 2 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: infrastructurecapitaladvisors.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — Income Institute YouTube - weekly 30min clips w/ Jay Hatfield", date: "2026-04-25", status: "completed" },
      { userId: infrastructurecapitaladvisors.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — Transitioned to Income Institute YouTube (weekly 30min clips w/ Jay Hatfield) - replaces all LL Live owed", date: "2026-03-25", status: "completed" },
      { userId: infrastructurecapitaladvisors.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — Transitioned to Income Institute YouTube (weekly 30min clips w/ Jay Hatfield) - replaces all LL Live owed", date: "2026-02-25", status: "completed" },
      { userId: infrastructurecapitaladvisors.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 4/13/26, 3/26/26", date: "2026-01-25", status: "completed" },
      { userId: infrastructurecapitaladvisors.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 12/11/25, 4/13/26", date: "2025-12-25", status: "completed" },
      { userId: infrastructurecapitaladvisors.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 11/13/25, 11/20/25", date: "2025-11-25", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: infrastructurecapitaladvisors.id, month: "2025-11", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: infrastructurecapitaladvisors.id, month: "2025-12", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: infrastructurecapitaladvisors.id, month: "2026-01", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: infrastructurecapitaladvisors.id, month: "2026-02", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: infrastructurecapitaladvisors.id, month: "2026-03", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: infrastructurecapitaladvisors.id, month: "2026-04", category: "Podcast Appearances", owed: 1, completed: 1 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 0, email_sends: 0, revenue: 12000 },
      { month: "2025-10", fa_intros: 0, email_sends: 0, revenue: 12000 },
      { month: "2025-11", fa_intros: 0, email_sends: 0, revenue: 12000 },
      { month: "2025-12", fa_intros: 0, email_sends: 0, revenue: 12000 },
      { month: "2026-01", fa_intros: 0, email_sends: 0, revenue: 12000 },
      { month: "2026-02", fa_intros: 0, email_sends: 0, revenue: 12000 },
      { month: "2026-03", fa_intros: 0, email_sends: 0, revenue: 12000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 12000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: infrastructurecapitaladvisors.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: infrastructurecapitaladvisors.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: infrastructurecapitaladvisors.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── TappAlpha ──
    const tappalpha = storage.getUserByEmail("mloukas@tappalpha.com")!;
    [
      { userId: tappalpha.id, label: "FA Introductions", value: "52", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: tappalpha.id, label: "Sponsored Emails", value: "17", change: "0", changeDirection: "neutral", icon: "Mail", sortOrder: 1 },
      { userId: tappalpha.id, label: "Podcast Episodes", value: "2", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 2 },
      { userId: tappalpha.id, label: "Months Active", value: "12", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 3 },
      { userId: tappalpha.id, label: "Total Investment", value: "$62,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 4 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: tappalpha.id, type: "fa_intro", title: "FA Introductions — 5 scheduled", description: "5 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
      { userId: tappalpha.id, type: "fa_intro", title: "FA Introductions — 5 scheduled", description: "5 advisor introductions in progress for 2026-03", date: "2026-03-15", status: "in_progress" },
      { userId: tappalpha.id, type: "email_blast", title: "Sponsored Emails — 4 sent", description: "Lead-Lag Report email blasts for 2026-03", date: "2026-03-20", status: "completed" },
      { userId: tappalpha.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: tappalpha.id, type: "email_blast", title: "Sponsored Emails — 4 sent", description: "Lead-Lag Report email blasts for 2026-02", date: "2026-02-20", status: "completed" },
      { userId: tappalpha.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: tappalpha.id, type: "email_blast", title: "Sponsored Emails — 4 sent", description: "Lead-Lag Report email blasts for 2026-01", date: "2026-01-20", status: "completed" },
      { userId: tappalpha.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: tappalpha.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-12", date: "2025-12-20", status: "completed" },
      { userId: tappalpha.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: tappalpha.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-11", date: "2025-11-20", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: tappalpha.id, month: "2025-11", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: tappalpha.id, month: "2025-11", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: tappalpha.id, month: "2025-12", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: tappalpha.id, month: "2025-12", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: tappalpha.id, month: "2026-01", category: "FA Introductions", owed: 5, completed: 4 },
      { userId: tappalpha.id, month: "2026-01", category: "Sponsored Emails", owed: 4, completed: 4 },
      { userId: tappalpha.id, month: "2026-02", category: "FA Introductions", owed: 5, completed: 3 },
      { userId: tappalpha.id, month: "2026-02", category: "Sponsored Emails", owed: 4, completed: 4 },
      { userId: tappalpha.id, month: "2026-03", category: "FA Introductions", owed: 5, completed: 0 },
      { userId: tappalpha.id, month: "2026-03", category: "Sponsored Emails", owed: 4, completed: 4 },
      { userId: tappalpha.id, month: "2026-04", category: "FA Introductions", owed: 5, completed: 0 },
      { userId: tappalpha.id, month: "2026-04", category: "Sponsored Emails", owed: 4, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 5, email_sends: 1, revenue: 3000 },
      { month: "2025-10", fa_intros: 5, email_sends: 1, revenue: 5000 },
      { month: "2025-11", fa_intros: 5, email_sends: 1, revenue: 5000 },
      { month: "2025-12", fa_intros: 5, email_sends: 1, revenue: 5000 },
      { month: "2026-01", fa_intros: 4, email_sends: 4, revenue: 7000 },
      { month: "2026-02", fa_intros: 3, email_sends: 4, revenue: 5000 },
      { month: "2026-03", fa_intros: 0, email_sends: 4, revenue: 5000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 5000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: tappalpha.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: tappalpha.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: tappalpha.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Distillate Capital ──
    const distillatecapital = storage.getUserByEmail("jolsen@distillatecapital.com")!;
    [
      { userId: distillatecapital.id, label: "FA Introductions", value: "32", change: "+2", changeDirection: "up", icon: "Users", sortOrder: 0 },
      { userId: distillatecapital.id, label: "Sponsored Emails", value: "14", change: "+2", changeDirection: "up", icon: "Mail", sortOrder: 1 },
      { userId: distillatecapital.id, label: "Months Active", value: "7", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 2 },
      { userId: distillatecapital.id, label: "Total Investment", value: "$35,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 3 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: distillatecapital.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2026-03", date: "2026-03-15", status: "completed" },
      { userId: distillatecapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-03", date: "2026-03-20", status: "completed" },
      { userId: distillatecapital.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: distillatecapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-02", date: "2026-02-20", status: "completed" },
      { userId: distillatecapital.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: distillatecapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-01", date: "2026-01-20", status: "completed" },
      { userId: distillatecapital.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: distillatecapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-12", date: "2025-12-20", status: "completed" },
      { userId: distillatecapital.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: distillatecapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-11", date: "2025-11-20", status: "completed" },
      { userId: distillatecapital.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-10", date: "2025-10-15", status: "completed" },
      { userId: distillatecapital.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-10", date: "2025-10-20", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: distillatecapital.id, month: "2025-10", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: distillatecapital.id, month: "2025-10", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: distillatecapital.id, month: "2025-11", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: distillatecapital.id, month: "2025-11", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: distillatecapital.id, month: "2025-12", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: distillatecapital.id, month: "2025-12", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: distillatecapital.id, month: "2026-01", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: distillatecapital.id, month: "2026-01", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: distillatecapital.id, month: "2026-02", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: distillatecapital.id, month: "2026-02", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: distillatecapital.id, month: "2026-03", category: "FA Introductions", owed: 5, completed: 2 },
      { userId: distillatecapital.id, month: "2026-03", category: "Sponsored Emails", owed: 2, completed: 2 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2025-10", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2025-11", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2025-12", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2026-01", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2026-02", fa_intros: 5, email_sends: 2, revenue: 5000 },
      { month: "2026-03", fa_intros: 2, email_sends: 2, revenue: 5000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: distillatecapital.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: distillatecapital.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: distillatecapital.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── AGF ──
    const agf = storage.createUser({
      email: "kevin.collins@agf.com",
      password: bcrypt.hashSync("agf2026", 10),
      name: "Kevin Collins",
      company: "AGF",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: agf.id, label: "FA Introductions", value: "32", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: agf.id, label: "Months Active", value: "12", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 1 },
      { userId: agf.id, label: "Total Investment", value: "$48,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 2 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: agf.id, type: "fa_intro", title: "FA Introductions — 4 scheduled", description: "4 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
      { userId: agf.id, type: "fa_intro", title: "FA Introductions — 4 scheduled", description: "4 advisor introductions in progress for 2026-03", date: "2026-03-15", status: "in_progress" },
      { userId: agf.id, type: "fa_intro", title: "FA Introductions — 1 completed", description: "1 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: agf.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: agf.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: agf.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: agf.id, month: "2025-11", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: agf.id, month: "2025-12", category: "FA Introductions", owed: 4, completed: 3 },
      { userId: agf.id, month: "2026-01", category: "FA Introductions", owed: 4, completed: 2 },
      { userId: agf.id, month: "2026-02", category: "FA Introductions", owed: 4, completed: 1 },
      { userId: agf.id, month: "2026-03", category: "FA Introductions", owed: 4, completed: 0 },
      { userId: agf.id, month: "2026-04", category: "FA Introductions", owed: 4, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 6, email_sends: 0, revenue: 6000 },
      { month: "2025-10", fa_intros: 4, email_sends: 0, revenue: 4000 },
      { month: "2025-11", fa_intros: 4, email_sends: 0, revenue: 4000 },
      { month: "2025-12", fa_intros: 3, email_sends: 0, revenue: 4000 },
      { month: "2026-01", fa_intros: 2, email_sends: 0, revenue: 4000 },
      { month: "2026-02", fa_intros: 1, email_sends: 0, revenue: 4000 },
      { month: "2026-03", fa_intros: 0, email_sends: 0, revenue: 4000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 4000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: agf.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: agf.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: agf.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Tuttle Capital ──
    const tuttlecapital = storage.createUser({
      email: "matt@tuttlecap.com",
      password: bcrypt.hashSync("tuttle2026", 10),
      name: "Matt Tuttle",
      company: "Tuttle Capital",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: tuttlecapital.id, label: "Months Active", value: "3", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 0 },
      { userId: tuttlecapital.id, label: "Total Investment", value: "$12,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 1 },
    ].forEach((k) => storage.createKpi(k));
    [
      { month: "2026-02", fa_intros: 0, email_sends: 0, revenue: 4000 },
      { month: "2026-03", fa_intros: 0, email_sends: 0, revenue: 4000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 4000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: tuttlecapital.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: tuttlecapital.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: tuttlecapital.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Davis Advisors ──
    const davisadvisors = storage.createUser({
      email: "advisor@davisadvisors.com",
      password: bcrypt.hashSync("davis2026", 10),
      name: "Davis Advisors Team",
      company: "Davis Advisors",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: davisadvisors.id, label: "FA Introductions", value: "27", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: davisadvisors.id, label: "Sponsored Emails", value: "14", change: "0", changeDirection: "neutral", icon: "Mail", sortOrder: 1 },
      { userId: davisadvisors.id, label: "Podcast Episodes", value: "4", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 2 },
      { userId: davisadvisors.id, label: "Months Active", value: "13", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 3 },
      { userId: davisadvisors.id, label: "Total Investment", value: "$49,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 4 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: davisadvisors.id, type: "fa_intro", title: "FA Introductions — 3 scheduled", description: "3 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
      { userId: davisadvisors.id, type: "fa_intro", title: "FA Introductions — 3 scheduled", description: "3 advisor introductions in progress for 2026-03", date: "2026-03-15", status: "in_progress" },
      { userId: davisadvisors.id, type: "fa_intro", title: "FA Introductions — 3 scheduled", description: "3 advisor introductions in progress for 2026-02", date: "2026-02-15", status: "in_progress" },
      { userId: davisadvisors.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: davisadvisors.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: davisadvisors.id, month: "2025-12", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: davisadvisors.id, month: "2025-12", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: davisadvisors.id, month: "2026-01", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: davisadvisors.id, month: "2026-01", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: davisadvisors.id, month: "2026-02", category: "FA Introductions", owed: 3, completed: 0 },
      { userId: davisadvisors.id, month: "2026-02", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: davisadvisors.id, month: "2026-03", category: "FA Introductions", owed: 3, completed: 0 },
      { userId: davisadvisors.id, month: "2026-03", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: davisadvisors.id, month: "2026-04", category: "FA Introductions", owed: 3, completed: 0 },
      { userId: davisadvisors.id, month: "2026-04", category: "Sponsored Emails", owed: 2, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 3, email_sends: 1, revenue: 3500 },
      { month: "2025-10", fa_intros: 3, email_sends: 1, revenue: 3500 },
      { month: "2025-11", fa_intros: 0, email_sends: 0, revenue: 3500 },
      { month: "2025-12", fa_intros: 3, email_sends: 0, revenue: 3500 },
      { month: "2026-01", fa_intros: 3, email_sends: 0, revenue: 3500 },
      { month: "2026-02", fa_intros: 0, email_sends: 0, revenue: 3500 },
      { month: "2026-03", fa_intros: 0, email_sends: 0, revenue: 3500 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 3500 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: davisadvisors.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: davisadvisors.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: davisadvisors.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Evoke Advisors ──
    const evokeadvisors = storage.createUser({
      email: "ashahidi@evokeadvisors.com",
      password: bcrypt.hashSync("evoke2026", 10),
      name: "Amin Shahidi",
      company: "Evoke Advisors",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: evokeadvisors.id, label: "FA Introductions", value: "34", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: evokeadvisors.id, label: "Sponsored Emails", value: "12", change: "0", changeDirection: "neutral", icon: "Mail", sortOrder: 1 },
      { userId: evokeadvisors.id, label: "Podcast Episodes", value: "11", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 2 },
      { userId: evokeadvisors.id, label: "Months Active", value: "12", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 3 },
      { userId: evokeadvisors.id, label: "Total Investment", value: "$45,500", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 4 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: evokeadvisors.id, type: "fa_intro", title: "FA Introductions — 3 scheduled", description: "3 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
      { userId: evokeadvisors.id, type: "fa_intro", title: "FA Introductions — 1 completed", description: "1 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: evokeadvisors.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2026-02", date: "2026-02-20", status: "completed" },
      { userId: evokeadvisors.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 3/30/26", date: "2026-02-25", status: "completed" },
      { userId: evokeadvisors.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: evokeadvisors.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2026-01", date: "2026-01-20", status: "completed" },
      { userId: evokeadvisors.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 1/29/26", date: "2026-01-25", status: "completed" },
      { userId: evokeadvisors.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: evokeadvisors.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-12", date: "2025-12-20", status: "completed" },
      { userId: evokeadvisors.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 1/22/26", date: "2025-12-25", status: "completed" },
      { userId: evokeadvisors.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: evokeadvisors.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-11", date: "2025-11-20", status: "completed" },
      { userId: evokeadvisors.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 12/3/25", date: "2025-11-25", status: "completed" },
      { userId: evokeadvisors.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2025-10", date: "2025-10-15", status: "completed" },
      { userId: evokeadvisors.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-10", date: "2025-10-20", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: evokeadvisors.id, month: "2025-10", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: evokeadvisors.id, month: "2025-10", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: evokeadvisors.id, month: "2025-10", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: evokeadvisors.id, month: "2025-11", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: evokeadvisors.id, month: "2025-11", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: evokeadvisors.id, month: "2025-11", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: evokeadvisors.id, month: "2025-12", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: evokeadvisors.id, month: "2025-12", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: evokeadvisors.id, month: "2025-12", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: evokeadvisors.id, month: "2026-01", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: evokeadvisors.id, month: "2026-01", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: evokeadvisors.id, month: "2026-01", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: evokeadvisors.id, month: "2026-02", category: "FA Introductions", owed: 3, completed: 1 },
      { userId: evokeadvisors.id, month: "2026-02", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: evokeadvisors.id, month: "2026-02", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: evokeadvisors.id, month: "2026-04", category: "FA Introductions", owed: 3, completed: 0 },
      { userId: evokeadvisors.id, month: "2026-04", category: "Sponsored Emails", owed: 1, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-02", fa_intros: 3, email_sends: 1, revenue: 3500 },
      { month: "2025-09", fa_intros: 3, email_sends: 1, revenue: 3500 },
      { month: "2025-10", fa_intros: 3, email_sends: 1, revenue: 3500 },
      { month: "2025-11", fa_intros: 3, email_sends: 1, revenue: 3500 },
      { month: "2025-12", fa_intros: 3, email_sends: 1, revenue: 3500 },
      { month: "2026-01", fa_intros: 3, email_sends: 1, revenue: 3500 },
      { month: "2026-02", fa_intros: 1, email_sends: 1, revenue: 3500 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 3500 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: evokeadvisors.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: evokeadvisors.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: evokeadvisors.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Howard Capital Management ──
    const howardcapitalmanagement = storage.createUser({
      email: "eric@howardcm.com",
      password: bcrypt.hashSync("howard2026", 10),
      name: "Eric Nyquist",
      company: "Howard Capital Management",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: howardcapitalmanagement.id, label: "FA Introductions", value: "38", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: howardcapitalmanagement.id, label: "Podcast Episodes", value: "1", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 1 },
      { userId: howardcapitalmanagement.id, label: "Months Active", value: "10", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 2 },
      { userId: howardcapitalmanagement.id, label: "Total Investment", value: "$38,500", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 3 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: howardcapitalmanagement.id, type: "fa_intro", title: "FA Introductions — 4 scheduled", description: "4 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
      { userId: howardcapitalmanagement.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2026-03", date: "2026-03-15", status: "completed" },
      { userId: howardcapitalmanagement.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: howardcapitalmanagement.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: howardcapitalmanagement.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: howardcapitalmanagement.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: howardcapitalmanagement.id, month: "2025-11", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: howardcapitalmanagement.id, month: "2025-12", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: howardcapitalmanagement.id, month: "2026-01", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: howardcapitalmanagement.id, month: "2026-02", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: howardcapitalmanagement.id, month: "2026-03", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: howardcapitalmanagement.id, month: "2026-04", category: "FA Introductions", owed: 4, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 4, email_sends: 0, revenue: 3500 },
      { month: "2025-10", fa_intros: 4, email_sends: 0, revenue: 3500 },
      { month: "2025-11", fa_intros: 4, email_sends: 0, revenue: 3500 },
      { month: "2025-12", fa_intros: 4, email_sends: 0, revenue: 3500 },
      { month: "2026-01", fa_intros: 4, email_sends: 0, revenue: 3500 },
      { month: "2026-02", fa_intros: 4, email_sends: 0, revenue: 3500 },
      { month: "2026-03", fa_intros: 4, email_sends: 0, revenue: 3500 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 3500 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: howardcapitalmanagement.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: howardcapitalmanagement.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: howardcapitalmanagement.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── White Wolf Capital ──
    const whitewolfcapital = storage.createUser({
      email: "eazar@whitewolfcap.com",
      password: bcrypt.hashSync("whitewolf2026", 10),
      name: "Elie Azar",
      company: "White Wolf Capital",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: whitewolfcapital.id, label: "FA Introductions", value: "28", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: whitewolfcapital.id, label: "Sponsored Emails", value: "8", change: "0", changeDirection: "neutral", icon: "Mail", sortOrder: 1 },
      { userId: whitewolfcapital.id, label: "Months Active", value: "11", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 2 },
      { userId: whitewolfcapital.id, label: "Total Investment", value: "$33,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 3 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: whitewolfcapital.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: whitewolfcapital.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2026-01", date: "2026-01-20", status: "completed" },
      { userId: whitewolfcapital.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: whitewolfcapital.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-12", date: "2025-12-20", status: "completed" },
      { userId: whitewolfcapital.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: whitewolfcapital.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-11", date: "2025-11-20", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: whitewolfcapital.id, month: "2025-11", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: whitewolfcapital.id, month: "2025-11", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: whitewolfcapital.id, month: "2025-12", category: "FA Introductions", owed: 4, completed: 3 },
      { userId: whitewolfcapital.id, month: "2025-12", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: whitewolfcapital.id, month: "2026-01", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: whitewolfcapital.id, month: "2026-01", category: "Sponsored Emails", owed: 1, completed: 1 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 3, email_sends: 1, revenue: 3000 },
      { month: "2025-10", fa_intros: 3, email_sends: 1, revenue: 3000 },
      { month: "2025-11", fa_intros: 4, email_sends: 1, revenue: 3000 },
      { month: "2025-12", fa_intros: 3, email_sends: 1, revenue: 3000 },
      { month: "2026-01", fa_intros: 3, email_sends: 1, revenue: 3000 },
      { month: "2026-02", fa_intros: 0, email_sends: 0, revenue: 3000 },
      { month: "2026-03", fa_intros: 0, email_sends: 0, revenue: 3000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 3000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: whitewolfcapital.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: whitewolfcapital.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: whitewolfcapital.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── DWS ──
    const dws = storage.createUser({
      email: "aram.babikian@dws.com",
      password: bcrypt.hashSync("dws2026", 10),
      name: "Aram Babikian",
      company: "DWS",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: dws.id, label: "FA Introductions", value: "28", change: "+5", changeDirection: "up", icon: "Users", sortOrder: 0 },
      { userId: dws.id, label: "Sponsored Emails", value: "6", change: "+1", changeDirection: "up", icon: "Mail", sortOrder: 1 },
      { userId: dws.id, label: "Podcast Episodes", value: "3", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 2 },
      { userId: dws.id, label: "Months Active", value: "6", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 3 },
      { userId: dws.id, label: "Total Investment", value: "$30,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 4 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: dws.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: dws.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2026-02", date: "2026-02-20", status: "completed" },
      { userId: dws.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: dws.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2026-01", date: "2026-01-20", status: "completed" },
      { userId: dws.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: dws.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-12", date: "2025-12-20", status: "completed" },
      { userId: dws.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: dws.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-11", date: "2025-11-20", status: "completed" },
      { userId: dws.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 1/13/26", date: "2025-11-25", status: "completed" },
      { userId: dws.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-10", date: "2025-10-15", status: "completed" },
      { userId: dws.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-10", date: "2025-10-20", status: "completed" },
      { userId: dws.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 12/9/25, 12/2/25", date: "2025-10-25", status: "completed" },
      { userId: dws.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-09", date: "2025-09-15", status: "completed" },
      { userId: dws.id, type: "email_blast", title: "Sponsored Emails — 1 sent", description: "Lead-Lag Report email blasts for 2025-09", date: "2025-09-20", status: "completed" },
      { userId: dws.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 11/6/25,11/6/25", date: "2025-09-25", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: dws.id, month: "2025-09", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: dws.id, month: "2025-09", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: dws.id, month: "2025-09", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: dws.id, month: "2025-10", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: dws.id, month: "2025-10", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: dws.id, month: "2025-10", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: dws.id, month: "2025-11", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: dws.id, month: "2025-11", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: dws.id, month: "2025-11", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: dws.id, month: "2025-12", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: dws.id, month: "2025-12", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: dws.id, month: "2026-01", category: "FA Introductions", owed: 5, completed: 3 },
      { userId: dws.id, month: "2026-01", category: "Sponsored Emails", owed: 1, completed: 1 },
      { userId: dws.id, month: "2026-02", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: dws.id, month: "2026-02", category: "Sponsored Emails", owed: 1, completed: 1 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 5, email_sends: 1, revenue: 5000 },
      { month: "2025-10", fa_intros: 5, email_sends: 1, revenue: 5000 },
      { month: "2025-11", fa_intros: 5, email_sends: 1, revenue: 5000 },
      { month: "2025-12", fa_intros: 5, email_sends: 1, revenue: 5000 },
      { month: "2026-01", fa_intros: 3, email_sends: 1, revenue: 5000 },
      { month: "2026-02", fa_intros: 5, email_sends: 1, revenue: 5000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: dws.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: dws.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: dws.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Relative Sentiment ──
    const relativesentiment = storage.createUser({
      email: "ray@relativesentiment.com",
      password: bcrypt.hashSync("mood2026", 10),
      name: "Ray Micaletti",
      company: "Relative Sentiment",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: relativesentiment.id, label: "FA Introductions", value: "20", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: relativesentiment.id, label: "Sponsored Emails", value: "12", change: "0", changeDirection: "neutral", icon: "Mail", sortOrder: 1 },
      { userId: relativesentiment.id, label: "Months Active", value: "7", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 2 },
      { userId: relativesentiment.id, label: "Total Investment", value: "$28,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 3 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: relativesentiment.id, type: "fa_intro", title: "FA Introductions — 4 scheduled", description: "4 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
      { userId: relativesentiment.id, type: "fa_intro", title: "FA Introductions — 4 scheduled", description: "4 advisor introductions in progress for 2026-03", date: "2026-03-15", status: "in_progress" },
      { userId: relativesentiment.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-03", date: "2026-03-20", status: "completed" },
      { userId: relativesentiment.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: relativesentiment.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-02", date: "2026-02-20", status: "completed" },
      { userId: relativesentiment.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: relativesentiment.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2026-01", date: "2026-01-20", status: "completed" },
      { userId: relativesentiment.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: relativesentiment.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-12", date: "2025-12-20", status: "completed" },
      { userId: relativesentiment.id, type: "fa_intro", title: "FA Introductions — 4 completed", description: "4 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: relativesentiment.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-11", date: "2025-11-20", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: relativesentiment.id, month: "2025-11", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: relativesentiment.id, month: "2025-11", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: relativesentiment.id, month: "2025-12", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: relativesentiment.id, month: "2025-12", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: relativesentiment.id, month: "2026-01", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: relativesentiment.id, month: "2026-01", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: relativesentiment.id, month: "2026-02", category: "FA Introductions", owed: 4, completed: 4 },
      { userId: relativesentiment.id, month: "2026-02", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: relativesentiment.id, month: "2026-03", category: "FA Introductions", owed: 4, completed: 0 },
      { userId: relativesentiment.id, month: "2026-03", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: relativesentiment.id, month: "2026-04", category: "FA Introductions", owed: 4, completed: 0 },
      { userId: relativesentiment.id, month: "2026-04", category: "Sponsored Emails", owed: 2, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-10", fa_intros: 4, email_sends: 2, revenue: 4000 },
      { month: "2025-11", fa_intros: 4, email_sends: 2, revenue: 4000 },
      { month: "2025-12", fa_intros: 4, email_sends: 2, revenue: 4000 },
      { month: "2026-01", fa_intros: 4, email_sends: 2, revenue: 4000 },
      { month: "2026-02", fa_intros: 4, email_sends: 2, revenue: 4000 },
      { month: "2026-03", fa_intros: 0, email_sends: 2, revenue: 4000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 4000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: relativesentiment.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: relativesentiment.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: relativesentiment.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Teucrium ──
    const teucrium = storage.createUser({
      email: "sal@teucrium.com",
      password: bcrypt.hashSync("teucrium2026", 10),
      name: "Sal Gilbertie",
      company: "Teucrium",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: teucrium.id, label: "FA Introductions", value: "18", change: "+3", changeDirection: "up", icon: "Users", sortOrder: 0 },
      { userId: teucrium.id, label: "Sponsored Emails", value: "10", change: "0", changeDirection: "neutral", icon: "Mail", sortOrder: 1 },
      { userId: teucrium.id, label: "Podcast Episodes", value: "5", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 2 },
      { userId: teucrium.id, label: "Months Active", value: "13", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 3 },
      { userId: teucrium.id, label: "Total Investment", value: "$93,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 4 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: teucrium.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2026-04", date: "2026-04-15", status: "completed" },
      { userId: teucrium.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2026-03", date: "2026-03-15", status: "completed" },
      { userId: teucrium.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: teucrium.id, month: "2026-02", category: "FA Introductions", owed: 5, completed: 2 },
      { userId: teucrium.id, month: "2026-03", category: "FA Introductions", owed: 5, completed: 3 },
      { userId: teucrium.id, month: "2026-04", category: "FA Introductions", owed: 5, completed: 3 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-09", fa_intros: 0, email_sends: 0, revenue: 9000 },
      { month: "2025-10", fa_intros: 0, email_sends: 0, revenue: 9000 },
      { month: "2025-11", fa_intros: 0, email_sends: 0, revenue: 9000 },
      { month: "2025-12", fa_intros: 0, email_sends: 0, revenue: 9000 },
      { month: "2026-01", fa_intros: 0, email_sends: 0, revenue: 9000 },
      { month: "2026-02", fa_intros: 2, email_sends: 0, revenue: 9000 },
      { month: "2026-03", fa_intros: 3, email_sends: 0, revenue: 9000 },
      { month: "2026-04", fa_intros: 3, email_sends: 0, revenue: 9000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: teucrium.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: teucrium.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: teucrium.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Columbia Threadneedle ──
    const columbiathreadneedle = storage.createUser({
      email: "contact@columbiathreadneedle.com",
      password: bcrypt.hashSync("columbia2026", 10),
      name: "Columbia Threadneedle Team",
      company: "Columbia Threadneedle",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: columbiathreadneedle.id, label: "FA Introductions", value: "34", change: "0", changeDirection: "neutral", icon: "Users", sortOrder: 0 },
      { userId: columbiathreadneedle.id, label: "Sponsored Emails", value: "26", change: "0", changeDirection: "neutral", icon: "Mail", sortOrder: 1 },
      { userId: columbiathreadneedle.id, label: "Podcast Episodes", value: "4", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 2 },
      { userId: columbiathreadneedle.id, label: "Months Active", value: "18", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 3 },
      { userId: columbiathreadneedle.id, label: "Total Investment", value: "$66,500", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 4 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: columbiathreadneedle.id, type: "fa_intro", title: "FA Introductions — 3 scheduled", description: "3 advisor introductions in progress for 2026-09", date: "2026-09-15", status: "in_progress" },
      { userId: columbiathreadneedle.id, type: "fa_intro", title: "FA Introductions — 3 scheduled", description: "3 advisor introductions in progress for 2026-08", date: "2026-08-15", status: "in_progress" },
      { userId: columbiathreadneedle.id, type: "fa_intro", title: "FA Introductions — 3 scheduled", description: "3 advisor introductions in progress for 2026-07", date: "2026-07-15", status: "in_progress" },
      { userId: columbiathreadneedle.id, type: "fa_intro", title: "FA Introductions — 3 scheduled", description: "3 advisor introductions in progress for 2026-06", date: "2026-06-15", status: "in_progress" },
      { userId: columbiathreadneedle.id, type: "fa_intro", title: "FA Introductions — 3 scheduled", description: "3 advisor introductions in progress for 2026-05", date: "2026-05-15", status: "in_progress" },
      { userId: columbiathreadneedle.id, type: "fa_intro", title: "FA Introductions — 3 scheduled", description: "3 advisor introductions in progress for 2026-04", date: "2026-04-15", status: "in_progress" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: columbiathreadneedle.id, month: "2026-04", category: "FA Introductions", owed: 3, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-04", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-05", category: "FA Introductions", owed: 3, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-05", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-06", category: "FA Introductions", owed: 3, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-06", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-07", category: "FA Introductions", owed: 3, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-07", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-08", category: "FA Introductions", owed: 3, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-08", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-09", category: "FA Introductions", owed: 3, completed: 0 },
      { userId: columbiathreadneedle.id, month: "2026-09", category: "Sponsored Emails", owed: 2, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2026-02", fa_intros: 3, email_sends: 2, revenue: 3500 },
      { month: "2026-03", fa_intros: 3, email_sends: 2, revenue: 3500 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 3500 },
      { month: "2026-05", fa_intros: 0, email_sends: 0, revenue: 3500 },
      { month: "2026-06", fa_intros: 0, email_sends: 0, revenue: 3500 },
      { month: "2026-07", fa_intros: 0, email_sends: 0, revenue: 3500 },
      { month: "2026-08", fa_intros: 0, email_sends: 0, revenue: 3500 },
      { month: "2026-09", fa_intros: 0, email_sends: 0, revenue: 3500 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: columbiathreadneedle.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: columbiathreadneedle.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: columbiathreadneedle.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Point Bridge ──
    const pointbridge = storage.createUser({
      email: "contact@pointbridgecapital.com",
      password: bcrypt.hashSync("pointbridge2026", 10),
      name: "Point Bridge Team",
      company: "Point Bridge",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: pointbridge.id, label: "FA Introductions", value: "24", change: "+3", changeDirection: "up", icon: "Users", sortOrder: 0 },
      { userId: pointbridge.id, label: "Sponsored Emails", value: "14", change: "0", changeDirection: "neutral", icon: "Mail", sortOrder: 1 },
      { userId: pointbridge.id, label: "Podcast Episodes", value: "5", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 2 },
      { userId: pointbridge.id, label: "Months Active", value: "10", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 3 },
      { userId: pointbridge.id, label: "Total Investment", value: "$30,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 4 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: pointbridge.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: pointbridge.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2025-12", date: "2025-12-15", status: "completed" },
      { userId: pointbridge.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
      { userId: pointbridge.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2025-10", date: "2025-10-15", status: "completed" },
      { userId: pointbridge.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2025-09", date: "2025-09-15", status: "completed" },
      { userId: pointbridge.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-09", date: "2025-09-20", status: "completed" },
      { userId: pointbridge.id, type: "fa_intro", title: "FA Introductions — 3 completed", description: "3 advisor introduction calls completed for 2025-02", date: "2025-02-15", status: "completed" },
      { userId: pointbridge.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-02", date: "2025-02-20", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: pointbridge.id, month: "2025-02", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: pointbridge.id, month: "2025-02", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: pointbridge.id, month: "2025-09", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: pointbridge.id, month: "2025-09", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: pointbridge.id, month: "2025-10", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: pointbridge.id, month: "2025-10", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: pointbridge.id, month: "2025-11", category: "FA Introductions", owed: 3, completed: 2 },
      { userId: pointbridge.id, month: "2025-11", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: pointbridge.id, month: "2025-12", category: "FA Introductions", owed: 3, completed: 2 },
      { userId: pointbridge.id, month: "2025-12", category: "Sponsored Emails", owed: 2, completed: 0 },
      { userId: pointbridge.id, month: "2026-01", category: "FA Introductions", owed: 3, completed: 3 },
      { userId: pointbridge.id, month: "2026-01", category: "Sponsored Emails", owed: 2, completed: 0 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2024-12", fa_intros: 2, email_sends: 2, revenue: 3000 },
      { month: "2025-01", fa_intros: 2, email_sends: 2, revenue: 3000 },
      { month: "2025-02", fa_intros: 3, email_sends: 2, revenue: 3000 },
      { month: "2025-09", fa_intros: 3, email_sends: 2, revenue: 3000 },
      { month: "2025-10", fa_intros: 3, email_sends: 0, revenue: 3000 },
      { month: "2025-11", fa_intros: 2, email_sends: 0, revenue: 3000 },
      { month: "2025-12", fa_intros: 2, email_sends: 0, revenue: 3000 },
      { month: "2026-01", fa_intros: 3, email_sends: 0, revenue: 3000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: pointbridge.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: pointbridge.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: pointbridge.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Cambria ──
    const cambria = storage.createUser({
      email: "contact@cambriainvestments.com",
      password: bcrypt.hashSync("cambria2026", 10),
      name: "Cambria Team",
      company: "Cambria",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: cambria.id, label: "FA Introductions", value: "28", change: "+5", changeDirection: "up", icon: "Users", sortOrder: 0 },
      { userId: cambria.id, label: "Sponsored Emails", value: "12", change: "+4", changeDirection: "up", icon: "Mail", sortOrder: 1 },
      { userId: cambria.id, label: "Podcast Episodes", value: "3", change: "+1", changeDirection: "up", icon: "Video", sortOrder: 2 },
      { userId: cambria.id, label: "Months Active", value: "6", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 3 },
      { userId: cambria.id, label: "Total Investment", value: "$33,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 4 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: cambria.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-10", date: "2025-10-15", status: "completed" },
      { userId: cambria.id, type: "email_blast", title: "Sponsored Emails — 4 sent", description: "Lead-Lag Report email blasts for 2025-10", date: "2025-10-20", status: "completed" },
      { userId: cambria.id, type: "fa_intro", title: "FA Introductions — 5 completed", description: "5 advisor introduction calls completed for 2025-09", date: "2025-09-15", status: "completed" },
      { userId: cambria.id, type: "fa_intro", title: "FA Introductions — 10 completed", description: "10 advisor introduction calls completed for 2025-02", date: "2025-02-15", status: "completed" },
      { userId: cambria.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2025-01", date: "2025-01-15", status: "completed" },
      { userId: cambria.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2025-01", date: "2025-01-20", status: "completed" },
      { userId: cambria.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 2/25/25", date: "2025-01-25", status: "completed" },
      { userId: cambria.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2024-12", date: "2024-12-15", status: "completed" },
      { userId: cambria.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2024-12", date: "2024-12-20", status: "completed" },
      { userId: cambria.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 12/10/24", date: "2024-12-25", status: "completed" },
      { userId: cambria.id, type: "fa_intro", title: "FA Introductions — 2 completed", description: "2 advisor introduction calls completed for 2024-11", date: "2024-11-15", status: "completed" },
      { userId: cambria.id, type: "email_blast", title: "Sponsored Emails — 2 sent", description: "Lead-Lag Report email blasts for 2024-11", date: "2024-11-20", status: "completed" },
      { userId: cambria.id, type: "podcast", title: "Lead-Lag Live Appearance", description: "Podcast recorded — 11/21/24", date: "2024-11-25", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: cambria.id, month: "2024-11", category: "FA Introductions", owed: 2, completed: 2 },
      { userId: cambria.id, month: "2024-11", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: cambria.id, month: "2024-11", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: cambria.id, month: "2024-12", category: "FA Introductions", owed: 2, completed: 2 },
      { userId: cambria.id, month: "2024-12", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: cambria.id, month: "2024-12", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: cambria.id, month: "2025-01", category: "FA Introductions", owed: 2, completed: 2 },
      { userId: cambria.id, month: "2025-01", category: "Sponsored Emails", owed: 2, completed: 2 },
      { userId: cambria.id, month: "2025-01", category: "Podcast Appearances", owed: 1, completed: 1 },
      { userId: cambria.id, month: "2025-02", category: "FA Introductions", owed: 10, completed: 10 },
      { userId: cambria.id, month: "2025-09", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: cambria.id, month: "2025-10", category: "FA Introductions", owed: 5, completed: 5 },
      { userId: cambria.id, month: "2025-10", category: "Sponsored Emails", owed: 4, completed: 4 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2024-11", fa_intros: 2, email_sends: 2, revenue: 3000 },
      { month: "2024-12", fa_intros: 2, email_sends: 2, revenue: 3000 },
      { month: "2025-01", fa_intros: 2, email_sends: 2, revenue: 3000 },
      { month: "2025-02", fa_intros: 10, email_sends: 0, revenue: 7000 },
      { month: "2025-09", fa_intros: 5, email_sends: 0, revenue: 7000 },
      { month: "2025-10", fa_intros: 5, email_sends: 4, revenue: 7000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: cambria.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: cambria.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: cambria.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Acquiers Fund ──
    const acquiersfund = storage.createUser({
      email: "contact@acquiersfund.com",
      password: bcrypt.hashSync("acquiers2026", 10),
      name: "Acquiers Fund Team",
      company: "Acquiers Fund",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: acquiersfund.id, label: "FA Introductions", value: "5", change: "+1", changeDirection: "up", icon: "Users", sortOrder: 0 },
    ].forEach((k) => storage.createKpi(k));
    [
      { userId: acquiersfund.id, type: "fa_intro", title: "FA Introductions — 1 completed", description: "1 advisor introduction calls completed for 2026-04", date: "2026-04-15", status: "completed" },
      { userId: acquiersfund.id, type: "fa_intro", title: "FA Introductions — 1 completed", description: "1 advisor introduction calls completed for 2026-03", date: "2026-03-15", status: "completed" },
      { userId: acquiersfund.id, type: "fa_intro", title: "FA Introductions — 1 completed", description: "1 advisor introduction calls completed for 2026-02", date: "2026-02-15", status: "completed" },
      { userId: acquiersfund.id, type: "fa_intro", title: "FA Introductions — 1 completed", description: "1 advisor introduction calls completed for 2026-01", date: "2026-01-15", status: "completed" },
      { userId: acquiersfund.id, type: "fa_intro", title: "FA Introductions — 1 completed", description: "1 advisor introduction calls completed for 2025-11", date: "2025-11-15", status: "completed" },
    ].forEach((a) => storage.createActivity(a));
    [
      { userId: acquiersfund.id, month: "2025-11", category: "FA Introductions", owed: 1, completed: 1 },
      { userId: acquiersfund.id, month: "2026-01", category: "FA Introductions", owed: 1, completed: 1 },
      { userId: acquiersfund.id, month: "2026-02", category: "FA Introductions", owed: 1, completed: 1 },
      { userId: acquiersfund.id, month: "2026-03", category: "FA Introductions", owed: 1, completed: 1 },
      { userId: acquiersfund.id, month: "2026-04", category: "FA Introductions", owed: 1, completed: 1 },
    ].forEach((d) => storage.createDeliverable(d));
    [
      { month: "2025-11", fa_intros: 1, email_sends: 0, revenue: 0 },
      { month: "2025-12", fa_intros: 0, email_sends: 0, revenue: 0 },
      { month: "2026-01", fa_intros: 1, email_sends: 0, revenue: 0 },
      { month: "2026-02", fa_intros: 1, email_sends: 0, revenue: 0 },
      { month: "2026-03", fa_intros: 1, email_sends: 0, revenue: 0 },
      { month: "2026-04", fa_intros: 1, email_sends: 0, revenue: 0 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: acquiersfund.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: acquiersfund.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: acquiersfund.id, month: s.month, metric: "revenue", value: s.revenue });
    });

    // ── Toews ──
    const toews = storage.createUser({
      email: "contact@toews.com",
      password: bcrypt.hashSync("toews2026", 10),
      name: "Toews Team",
      company: "Toews",
      role: "issuer",
      createdAt: new Date().toISOString(),
    });
    [
      { userId: toews.id, label: "Months Active", value: "4", change: "+1", changeDirection: "up", icon: "Calendar", sortOrder: 0 },
      { userId: toews.id, label: "Total Investment", value: "$8,000", change: "", changeDirection: "neutral", icon: "DollarSign", sortOrder: 1 },
    ].forEach((k) => storage.createKpi(k));
    [
      { month: "2026-01", fa_intros: 0, email_sends: 0, revenue: 2000 },
      { month: "2026-02", fa_intros: 0, email_sends: 0, revenue: 2000 },
      { month: "2026-03", fa_intros: 0, email_sends: 0, revenue: 2000 },
      { month: "2026-04", fa_intros: 0, email_sends: 0, revenue: 2000 },
    ].forEach((s) => {
      storage.createMonthlyStat({ userId: toews.id, month: s.month, metric: "fa_intros", value: s.fa_intros });
      storage.createMonthlyStat({ userId: toews.id, month: s.month, metric: "email_sends", value: s.email_sends });
      storage.createMonthlyStat({ userId: toews.id, month: s.month, metric: "revenue", value: s.revenue });
    });

  }

  // === PASSWORD RESET ROUTES ===

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = storage.getUserByEmail(email.toLowerCase().trim());
    // Always return success to prevent email enumeration
    if (!user) return res.json({ ok: true });

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    storage.createPasswordResetToken({ userId: user.id, token, expiresAt });

    // Store the token in a file so the admin can send the reset email via Outlook
    const resetUrl = `portal.leadlagmedia.com/#/reset-password?token=${token}`;
    const fs = require("fs");
    const resetInfo = {
      email: user.email,
      name: user.name,
      token,
      resetUrl,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    try {
      const logPath = require("path").resolve("password-reset-requests.json");
      let existing: any[] = [];
      try { existing = JSON.parse(fs.readFileSync(logPath, "utf-8")); } catch {}
      existing.push(resetInfo);
      fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));
    } catch {}

    res.json({ ok: true });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const resetToken = storage.getPasswordResetToken(token);
    if (!resetToken) return res.status(400).json({ error: "Invalid or expired reset link" });
    if (resetToken.usedAt) return res.status(400).json({ error: "This reset link has already been used" });
    if (new Date(resetToken.expiresAt) < new Date()) return res.status(400).json({ error: "This reset link has expired" });

    const hash = bcrypt.hashSync(password, 10);
    storage.updateUser(resetToken.userId, { password: hash });
    storage.markTokenUsed(token);

    res.json({ ok: true });
  });

  app.get("/api/auth/verify-reset-token", (req, res) => {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ valid: false });

    const resetToken = storage.getPasswordResetToken(token);
    if (!resetToken || resetToken.usedAt || new Date(resetToken.expiresAt) < new Date()) {
      return res.json({ valid: false });
    }
    res.json({ valid: true });
  });

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
