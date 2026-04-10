import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "KraneShares",
  companyAccent: "Shares",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Mar 2025 – Present",
  kpis: [
    { label: "Appearances", value: "27", subtext: "Lead-Lag Live + external" },
    { label: "Webinars", value: "8", subtext: "Sponsored webinars hosted" },
    { label: "Articles", value: "21", subtext: "Weekly articles published" },
    { label: "Total Invested", value: "$140K", subtext: "14 × $10,000/month" },
    { label: "Months Active", value: "14", subtext: "Mar 2025 – Apr 2026" },
    { label: "Substack + SMM", value: "Active", subtext: "Monthly content + social" },
  ],
  podcasts: {
    total: 27,
  },
  webinars: {
    total: 8,
    entries: [
      { date: "Jul 1, 2025", title: "Lead-Lag Live Webinar (Sponsored)", status: "Completed" },
      { date: "Aug 2025", title: "KraneShares Monthly Webinar", status: "Completed" },
      { date: "Sep 2025", title: "KraneShares Monthly Webinar", status: "Completed" },
      { date: "Oct 2025", title: "KraneShares Monthly Webinar", status: "Completed" },
      { date: "Nov 2025", title: "KraneShares Monthly Webinar", status: "Completed" },
      { date: "Jan 29, 2026", title: "Quarterly Outlook Webinar", status: "Completed" },
      { date: "Mar 6, 2026", title: "China Market Deep Dive", status: "Completed" },
      { date: "Mar 26, 2026", title: "ETF Strategy Webinar", status: "Completed" },
    ],
  },
  articles: {
    total: 21,
    description: "Weekly articles covering KraneShares ETF strategies and China market analysis",
  },
  substack: {
    active: true,
  },
  smm: {
    active: true,
    contact: "Mohamad Saqib",
  },
  investment: {
    total: "$140,000",
    months: 14,
    monthlyRate: "$10,000",
  },
};

export default data;
