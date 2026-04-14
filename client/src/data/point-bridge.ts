import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Point Bridge Capital",
  companyAccent: "Bridge",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Aug 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "8", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "10", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "5", subtext: "Lead-Lag Live" },
    { label: "Months Active", value: "5", subtext: "Since Aug 2024" }
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
      { num: 1, date: "8/29/24", name: "Victor Manlapaz", email: "", owner: "MG" },
      { num: 2, date: "8/30/24", name: "Stephen Heitzmann", email: "", owner: "MG" },
      { num: 3, date: "10/3/24", name: "Kelly Compton", email: "", owner: "MG" },
      { num: 4, date: "10/3/24", name: "David Walter", email: "", owner: "MG" },
      { num: 5, date: "11/8/24", name: "Kurt Altrichter", email: "", owner: "MG" },
      { num: 6, date: "11/21/24", name: "Chris Hardy", email: "", owner: "MG" },
      { num: 7, date: "12/6/24", name: "Chad Seegers", email: "", owner: "SR" },
      { num: 8, date: "12/6/24", name: "Brad Rudkin", email: "", owner: "SR" }
    ],
  },
  emailBlasts: {
    total: 10,
  },
  podcasts: {
    total: 5,
  },
};

export default data;
