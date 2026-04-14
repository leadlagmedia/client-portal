import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Simplify Asset Management",
  companyAccent: "Simplify",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Aug 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "9", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "8", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "4", subtext: "Lead-Lag Live" },
    { label: "Months Active", value: "4", subtext: "Since Aug 2024" }
  ],
  faIntroductions: {
    total: 9,
    chartData: [
      { month: "Aug 24", monthly: 2, cumulative: 2 },
      { month: "Oct 24", monthly: 2, cumulative: 4 },
      { month: "Nov 24", monthly: 2, cumulative: 6 },
      { month: "Dec 24", monthly: 3, cumulative: 9 }
    ],
    advisors: [
      { num: 1, date: "8/29/24", name: "David Reidy", email: "", owner: "MG" },
      { num: 2, date: "8/30/24", name: "Kurt Altrichter", email: "", owner: "MG" },
      { num: 3, date: "10/10/24", name: "Christian Ravsten", email: "", owner: "MG" },
      { num: 4, date: "10/16/24", name: "Pat Antonetti", email: "", owner: "MG" },
      { num: 5, date: "11/26/24", name: "Jeff Kercorian", email: "", owner: "MG" },
      { num: 6, date: "12/3/24", name: "Dominick Ruiz", email: "", owner: "MG" },
      { num: 7, date: "12/6/24", name: "Matthew Mast", email: "", owner: "MG" },
      { num: 8, date: "12/6/24", name: "Ken Bauso", email: "", owner: "SR" },
      { num: 9, date: "11/22/24", name: "Mark Schlafer", email: "", owner: "MG" }
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
