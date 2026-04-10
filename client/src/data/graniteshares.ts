import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "GraniteShares",
  companyAccent: "Shares",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Aug 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "85", subtext: "Oct 2024 – Mar 2026" },
    { label: "Lead-Lag Live", value: "7 Episodes", subtext: "43,127 total views" },
    { label: "Webinars", value: "8", subtext: "Confirmed webinar dates" },
    { label: "Total Invested", value: "$299K", subtext: "19 confirmed months" },
    { label: "Months Active", value: "19", subtext: "Since August 2024" },
    { label: "Media Outreach", value: "Active", subtext: "Since Aug 2025" },
  ],
  faIntroductions: {
    total: 85,
    chartData: [
      { month: "Oct 24", monthly: 2, cumulative: 2 },
      { month: "Nov 24", monthly: 2, cumulative: 4 },
      { month: "Dec 24", monthly: 2, cumulative: 6 },
      { month: "Jan 25", monthly: 2, cumulative: 8 },
      { month: "Feb 25", monthly: 5, cumulative: 13 },
      { month: "Mar 25", monthly: 5, cumulative: 18 },
      { month: "Apr 25", monthly: 5, cumulative: 23 },
      { month: "May 25", monthly: 5, cumulative: 28 },
      { month: "Jun 25", monthly: 5, cumulative: 33 },
      { month: "Jul 25", monthly: 5, cumulative: 38 },
      { month: "Aug 25", monthly: 5, cumulative: 43 },
      { month: "Sep 25", monthly: 5, cumulative: 48 },
      { month: "Oct 25", monthly: 5, cumulative: 53 },
      { month: "Nov 25", monthly: 5, cumulative: 58 },
      { month: "Dec 25", monthly: 5, cumulative: 63 },
      { month: "Jan 26", monthly: 5, cumulative: 68 },
      { month: "Feb 26", monthly: 7, cumulative: 75 },
      { month: "Mar 26", monthly: 10, cumulative: 85 },
    ],
  },
  podcasts: {
    total: "7 episodes + 5 shorts",
    episodes: [
      { date: "Nov 7, 2024", title: "Will Rhind on Gold & Commodities", featuring: "Will Rhind", views: 4200 },
      { date: "Feb 12, 2025", title: "GraniteShares & the ETF Landscape", featuring: "Will Rhind", views: 5800 },
      { date: "May 15, 2025", title: "Commodities in a Rising Rate World", featuring: "Will Rhind", views: 6100 },
      { date: "Aug 20, 2025", title: "Gold's Record Run: What's Next?", featuring: "Will Rhind", views: 7200 },
      { date: "Oct 30, 2025", title: "ETF Innovation & Market Access", featuring: "Will Rhind", views: 6800 },
      { date: "Jan 22, 2026", title: "2026 Commodity Outlook", featuring: "Will Rhind", views: 7400 },
      { date: "Mar 18, 2026", title: "Navigating Volatility with Gold", featuring: "Will Rhind", views: 5627 },
    ],
  },
  webinars: {
    total: 8,
    entries: [
      { date: "Dec 2024", title: "Gold & Commodities Outlook", status: "Completed" },
      { date: "Feb 2025", title: "ETF Distribution Strategies", status: "Completed" },
      { date: "Apr 2025", title: "Quarterly Market Review", status: "Completed" },
      { date: "Jun 2025", title: "Commodities Mid-Year Update", status: "Completed" },
      { date: "Aug 2025", title: "Gold Reaches New Highs", status: "Completed" },
      { date: "Nov 19, 2025", title: "CE Credit Webinar", status: "Completed" },
      { date: "Dec 4, 2025", title: "Year-End Review", status: "Completed" },
      { date: "Feb 17, 2026", title: "2026 Outlook", status: "Completed" },
    ],
  },
  investment: {
    total: "$299,004",
    months: 19,
    monthlyRate: "$16,500",
  },
};

export default data;
