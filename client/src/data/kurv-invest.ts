import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Kurv Investment Management",
  companyAccent: "Kurv",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Nov 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "2", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "6", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "3", subtext: "Lead-Lag Live" },
    { label: "Months Active", value: "3", subtext: "Since Nov 2024" }
  ],
  faIntroductions: {
    total: 2,
    chartData: [
      { month: "Nov 24", monthly: 1, cumulative: 1 },
      { month: "Dec 24", monthly: 1, cumulative: 2 }
    ],
    advisors: [
      { num: 1, date: "11/26/24", name: "Dean Owen", email: "", owner: "MG" },
      { num: 2, date: "12/6/24", name: "Mario Hernandez", email: "", owner: "MG" }
    ],
  },
  emailBlasts: {
    total: 6,
  },
  podcasts: {
    total: 3,
  },
};

export default data;
