import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Davis Advisors",
  companyAccent: "Advisors",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Oct 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "4", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "10", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "6", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "1", subtext: "Sponsored webinars" },
    { label: "Months Active", value: "6", subtext: "Since Oct 2024" }
  ],
  faIntroductions: {
    total: 4,
    chartData: [
      { month: "Oct 24", monthly: 2, cumulative: 2 },
      { month: "Nov 24", monthly: 1, cumulative: 3 },
      { month: "Dec 24", monthly: 1, cumulative: 4 }
    ],
    advisors: [
      { num: 1, date: "10/22/24", name: "JC Corrigan", email: "", owner: "MG" },
      { num: 2, date: "10/24/24", name: "Jeff Hodges", email: "", owner: "MG" },
      { num: 3, date: "11/26/24", name: "David Nelson", email: "", owner: "MG" },
      { num: 4, date: "12/6/24", name: "Tim Thielen", email: "", owner: "SR" }
    ],
  },
  emailBlasts: {
    total: 10,
  },
  podcasts: {
    total: 6,
  },
  webinars: {
    total: 1,
  },
};

export default data;
