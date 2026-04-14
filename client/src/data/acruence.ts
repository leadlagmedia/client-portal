import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Acruence Capital",
  companyAccent: "Acruence",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Dec 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "1", subtext: "Completed introductions" },
    { label: "Podcast Episodes", value: "3", subtext: "Lead-Lag Live" },
    { label: "Months Active", value: "3", subtext: "Since Dec 2024" }
  ],
  faIntroductions: {
    total: 1,
    chartData: [
      { month: "Dec 24", monthly: 1, cumulative: 1 }
    ],
    advisors: [
      { num: 1, date: "12/6/24", name: "Nicholas Green", email: "", owner: "SR" }
    ],
  },
  podcasts: {
    total: 3,
  },
};

export default data;
