import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Columbia Threadneedle",
  companyAccent: "Threadneedle",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Oct 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "5", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "10", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "11", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "6", subtext: "Sponsored webinars" },
    { label: "Months Active", value: "11", subtext: "Since Oct 2024" }
  ],
  faIntroductions: {
    total: 5,
    chartData: [
      { month: "Oct 24", monthly: 2, cumulative: 2 },
      { month: "Nov 24", monthly: 2, cumulative: 4 },
      { month: "Dec 24", monthly: 1, cumulative: 5 }
    ],
    advisors: [
      { num: 1, date: "10/10/24", name: "Whitney Massey", email: "", owner: "MG" },
      { num: 2, date: "10/24/24", name: "Stephen Weitzel", email: "", owner: "MG" },
      { num: 3, date: "11/6/24", name: "Thomas Hoffman", email: "", owner: "MG" },
      { num: 4, date: "11/6/24", name: "Ken Bauso", email: "", owner: "MG" },
      { num: 5, date: "12/3/24", name: "Nate White", email: "", owner: "MG" }
    ],
  },
  emailBlasts: {
    total: 10,
  },
  podcasts: {
    total: 11,
  },
  webinars: {
    total: 6,
  },
};

export default data;
