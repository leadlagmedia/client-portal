import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "TappAlpha",
  companyAccent: "Alpha",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Nov 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "122", subtext: "All-time system total" },
    { label: "FA (Tracked)", value: "27/30", subtext: "Sep 2025 – Feb 2026 window" },
    { label: "Email Blasts", value: "4+1/mo", subtext: "4 standard + 1 advertorial (Jan 2026+)" },
    { label: "Webinar", value: "1", subtext: "Mar 25, 2026 — Portfolio Construction" },
    { label: "Total Invested", value: "$104K", subtext: "18 months" },
    { label: "Contract Duration", value: "18 months", subtext: "Nov 2024 – Apr 2026" },
  ],
  faIntroductions: {
    total: 27,
    chartData: [
      { month: "Sep 25", monthly: 5, cumulative: 5 },
      { month: "Oct 25", monthly: 5, cumulative: 10 },
      { month: "Nov 25", monthly: 5, cumulative: 15 },
      { month: "Dec 25", monthly: 5, cumulative: 20 },
      { month: "Jan 26", monthly: 4, cumulative: 24 },
      { month: "Feb 26", monthly: 3, cumulative: 27 },
    ],
  },
  emailBlasts: {
    total: 14,
  },
  webinars: {
    total: 1,
    entries: [
      { date: "Mar 25, 2026", title: "The New Rules of Portfolio Construction for RIAs", status: "Completed" },
    ],
  },
  podcasts: {
    total: "6+",
  },
  investment: {
    total: "$104,000",
    months: 18,
    monthlyRate: "$3K–$7K",
  },
};

export default data;
