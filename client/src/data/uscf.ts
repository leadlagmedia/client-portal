import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "USCF Investments",
  companyAccent: "Investments",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Jun 2025 – Present",
  kpis: [
    { label: "FA Introductions", value: "4", subtext: "Jan–Feb 2026" },
    { label: "Substack Posts", value: "20+", subtext: "Monthly sponsorship" },
    { label: "Subscribers", value: "875", subtext: "Lead-Lag Report reach" },
    { label: "Open Rate", value: "34.2%", subtext: "Email open rate" },
    { label: "Podcast Bookings", value: "3", subtext: "Outside podcast appearances" },
    { label: "Total Invested", value: "$77K", subtext: "11 × $7,000/month" },
  ],
  faIntroductions: {
    total: 4,
    chartData: [
      { month: "Jan 26", monthly: 2, cumulative: 2 },
      { month: "Feb 26", monthly: 2, cumulative: 4 },
    ],
    advisors: [
      { num: 1, date: "2/5/26", name: "Aaron Soderstrom", email: "Aaron@omega2capital.com", firm: "Omega2 Capital" },
      { num: 2, date: "2/27/26", name: "Mario Hernandez", email: "mario@longevitywealthmanagement.com", firm: "Longevity Wealth Management" },
      { num: 3, date: "3/6/26", name: "Kurt Altrichter", email: "kurt@ivoryhill.com", firm: "Ivory Hill" },
    ],
  },
  substack: {
    active: true,
    posts: "20+",
    subscribers: 875,
    openRate: "34.2%",
  },
  smm: {
    active: true,
    contact: "Mohamad Saqib",
  },
  podcasts: {
    total: 3,
  },
  investment: {
    total: "$77,000",
    months: 11,
    monthlyRate: "$7,000",
  },
};

export default data;
