import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "TradrETFs",
  companyAccent: "Tradr",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Oct 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "4", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "4", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "2", subtext: "Lead-Lag Live" },
    { label: "Months Active", value: "2", subtext: "Since Oct 2024" }
  ],
  faIntroductions: {
    total: 4,
    chartData: [
      { month: "Oct 24", monthly: 2, cumulative: 2 },
      { month: "Nov 24", monthly: 2, cumulative: 4 }
    ],
    advisors: [
      { num: 1, date: "10/24/24", name: "Justin Young", email: "", owner: "MG" },
      { num: 2, date: "10/24/24", name: "John Benedict", email: "", owner: "MG" },
      { num: 3, date: "11/19/24", name: "Tyler Foster", email: "", owner: "MG" },
      { num: 4, date: "11/21/24", name: "Christian Searcy", email: "", owner: "MG" }
    ],
  },
  emailBlasts: {
    total: 4,
  },
  podcasts: {
    total: 2,
  },
};

export default data;
