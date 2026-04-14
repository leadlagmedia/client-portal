import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Cambria Investments",
  companyAccent: "Cambria",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Nov 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "2", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "8", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "4", subtext: "Lead-Lag Live" },
    { label: "Months Active", value: "4", subtext: "Since Nov 2024" }
  ],
  faIntroductions: {
    total: 2,
    chartData: [
      { month: "Nov 24", monthly: 2, cumulative: 2 }
    ],
    advisors: [
      { num: 1, date: "11/19/24", name: "Christian Ravsten", email: "", owner: "MG" },
      { num: 2, date: "11/20/24", name: "Nicholas Zizzadoro", email: "", owner: "MG" }
    ],
  },
  emailBlasts: {
    total: 8,
  },
  podcasts: {
    total: 4,
  },
};

export default data;
