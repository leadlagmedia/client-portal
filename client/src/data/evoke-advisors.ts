import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Evoke Advisors",
  companyAccent: "Advisors",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Oct 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "9", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "5", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "5", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "1", subtext: "Sponsored webinars" },
    { label: "Months Active", value: "6", subtext: "Since Oct 2024" }
  ],
  faIntroductions: {
    total: 9,
    chartData: [
      { month: "Oct 24", monthly: 3, cumulative: 3 },
      { month: "Nov 24", monthly: 3, cumulative: 6 },
      { month: "Dec 24", monthly: 3, cumulative: 9 }
    ],
    advisors: [
      { num: 1, date: "10/3/24", name: "Alec Campbell", email: "", owner: "MG" },
      { num: 2, date: "10/10/24", name: "Dean Owen", email: "", owner: "MG" },
      { num: 3, date: "10/10/24", name: "Todd Stankiewicz", email: "", owner: "MG" },
      { num: 4, date: "11/12/24", name: "Chad Seegers", email: "", owner: "MG" },
      { num: 5, date: "11/15/24", name: "Tim Thielen", email: "", owner: "MG" },
      { num: 6, date: "11/15/24", name: "David Nelson", email: "", owner: "MG" },
      { num: 7, date: "12/3/24", name: "Derek Sensenig", email: "", owner: "SR" },
      { num: 8, date: "12/4/24", name: "Paul Garnett", email: "", owner: "MG" },
      { num: 9, date: "12/5/24", name: "Joe Fernandez", email: "", owner: "MG" }
    ],
  },
  emailBlasts: {
    total: 5,
  },
  podcasts: {
    total: 5,
  },
  webinars: {
    total: 1,
  },
};

export default data;
