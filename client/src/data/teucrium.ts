import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Teucrium",
  companyAccent: "Teucrium",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Aug 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "8", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "10", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "7", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "2", subtext: "Sponsored webinars" },
    { label: "Media Outreach", value: "Active", subtext: "Podcast & media outreach" },
    { label: "Months Active", value: "7", subtext: "Since Aug 2024" }
  ],
  faIntroductions: {
    total: 8,
    chartData: [
      { month: "Aug 24", monthly: 2, cumulative: 2 },
      { month: "Oct 24", monthly: 2, cumulative: 4 },
      { month: "Nov 24", monthly: 2, cumulative: 6 },
      { month: "Dec 24", monthly: 2, cumulative: 8 }
    ],
    advisors: [
      { num: 1, date: "8/29/24", name: "Aaron Soderstrom", email: "", owner: "MG" },
      { num: 2, date: "8/29/24", name: "Brian Krukiel", email: "", owner: "MG" },
      { num: 3, date: "10/3/24", name: "Derek Sinani", email: "", owner: "MG" },
      { num: 4, date: "10/4/24", name: "Erik Jefferson", email: "", owner: "MG" },
      { num: 5, date: "11/12/24", name: "Pat Antonetti", email: "", owner: "MG" },
      { num: 6, date: "11/26/24", name: "Jared Walker", email: "", owner: "MG" },
      { num: 7, date: "12/5/24", name: "Seth Krussman", email: "", owner: "MG" },
      { num: 8, date: "12/5/24", name: "Tyler Foster", email: "", owner: "MG" }
    ],
  },
  emailBlasts: {
    total: 10,
  },
  podcasts: {
    total: 7,
  },
  webinars: {
    total: 2,
  },
};

export default data;
