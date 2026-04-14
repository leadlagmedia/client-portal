import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Quantify Funds",
  companyAccent: "Quantify",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Nov 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "1", subtext: "Completed introductions" },
    { label: "Podcast Episodes", value: "1", subtext: "Lead-Lag Live" },
    { label: "Months Active", value: "1", subtext: "Since Nov 2024" }
  ],
  faIntroductions: {
    total: 1,
    chartData: [
      { month: "Nov 24", monthly: 1, cumulative: 1 }
    ],
    advisors: [
      { num: 1, date: "11/21/24", name: "Michael Brusko", email: "", owner: "MG" }
    ],
  },
  podcasts: {
    total: 1,
  },
};

export default data;
