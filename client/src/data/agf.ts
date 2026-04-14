import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "AGF Investments",
  companyAccent: "Investments",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Nov 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "3", subtext: "Completed introductions" },
    { label: "Podcast Episodes", value: "5", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "1", subtext: "Sponsored webinars" },
    { label: "Months Active", value: "5", subtext: "Since Nov 2024" }
  ],
  faIntroductions: {
    total: 3,
    chartData: [
      { month: "Nov 24", monthly: 3, cumulative: 3 }
    ],
    advisors: [
      { num: 1, date: "11/26/24", name: "Arthur Klugh", email: "", owner: "MG" },
      { num: 2, date: "11/26/24", name: "Nicholas Green", email: "", owner: "MG" },
      { num: 3, date: "11/26/24", name: "Jeffrey Kerr", email: "", owner: "MG" }
    ],
  },
  podcasts: {
    total: 5,
  },
  webinars: {
    total: 1,
  },
};

export default data;
