import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Running Oak Capital",
  companyAccent: "Oak",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Nov 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "101", subtext: "17 months delivered" },
    { label: "Sponsored Emails", value: "34", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "17", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "2", subtext: "Sponsored webinars" },
    { label: "Total Invested", value: "$155K", subtext: "17 months active" },
    { label: "Months Active", value: "17", subtext: "Since Nov 2024" },
  ],
  faIntroductions: {
    total: 101,
    chartData: [
      { month: "Nov 24", monthly: 3, cumulative: 3 },
      { month: "Dec 24", monthly: 4, cumulative: 7 },
      { month: "Jan 25", monthly: 5, cumulative: 12 },
      { month: "Feb 25", monthly: 5, cumulative: 17 },
      { month: "Mar 25", monthly: 6, cumulative: 23 },
      { month: "Apr 25", monthly: 5, cumulative: 28 },
      { month: "May 25", monthly: 6, cumulative: 34 },
      { month: "Jun 25", monthly: 7, cumulative: 41 },
      { month: "Jul 25", monthly: 6, cumulative: 47 },
      { month: "Aug 25", monthly: 7, cumulative: 54 },
      { month: "Sep 25", monthly: 7, cumulative: 61 },
      { month: "Oct 25", monthly: 8, cumulative: 69 },
      { month: "Nov 25", monthly: 7, cumulative: 76 },
      { month: "Dec 25", monthly: 6, cumulative: 82 },
      { month: "Jan 26", monthly: 8, cumulative: 90 },
      { month: "Feb 26", monthly: 6, cumulative: 96 },
      { month: "Mar 26", monthly: 5, cumulative: 101 },
    ],
  },
  podcasts: {
    total: 17,
  },
  webinars: {
    total: 2,
    entries: [
      { date: "Jun 2025", title: "Running Oak Capital — Advisor Introduction Webinar", status: "Completed" },
      { date: "Jan 2026", title: "Running Oak Capital — ETF Strategy Webinar", status: "Completed" },
    ],
  },
  emailBlasts: {
    total: 34,
  },
  investment: {
    total: "$155,000",
    months: 17,
  },
};

export default data;
