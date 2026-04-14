import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Rayliant",
  companyAccent: "Rayliant",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Oct 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "4", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "8", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "4", subtext: "Lead-Lag Live" },
    { label: "Months Active", value: "4", subtext: "Since Oct 2024" }
  ],
  faIntroductions: {
    total: 4,
    chartData: [
      { month: "Oct 24", monthly: 2, cumulative: 2 },
      { month: "Nov 24", monthly: 2, cumulative: 4 }
    ],
    advisors: [
      { num: 1, date: "10/24/24", name: "Michelle Connell", email: "", owner: "MG" },
      { num: 2, date: "10/31/24", name: "Jeff Kercorian", email: "", owner: "MG" },
      { num: 3, date: "11/20/24", name: "Justin Young", email: "", owner: "MG" },
      { num: 4, date: "11/22/24", name: "Sampson Norton", email: "", owner: "MG" }
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
