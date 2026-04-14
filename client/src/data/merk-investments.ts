import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Merk Investments",
  companyAccent: "Investments",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Oct 2024 – Present",
  kpis: [
    { label: "FA Introductions", value: "23", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "9", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "4", subtext: "Lead-Lag Live" },
    { label: "Months Active", value: "4", subtext: "Since Oct 2024" }
  ],
  faIntroductions: {
    total: 23,
    chartData: [
      { month: "Oct 24", monthly: 2, cumulative: 2 },
      { month: "Nov 24", monthly: 12, cumulative: 14 },
      { month: "Dec 24", monthly: 9, cumulative: 23 }
    ],
    advisors: [
      { num: 1, date: "10/23/24", name: "Max Osbon", email: "", owner: "MG" },
      { num: 2, date: "10/25/24", name: "Eddy Gifford", email: "", owner: "MG" },
      { num: 3, date: "11/6/24", name: "Mario Hernandez", email: "", owner: "MG" },
      { num: 4, date: "11/6/24", name: "Stephen Heitzmann", email: "", owner: "MG" },
      { num: 5, date: "11/6/24", name: "Tyler Foster", email: "", owner: "MG" },
      { num: 6, date: "11/11/24", name: "Matt Topley", email: "", owner: "MG" },
      { num: 7, date: "11/15/24", name: "Ricky Biel", email: "", owner: "MG" },
      { num: 8, date: "11/15/24", name: "Lawrence Glazer", email: "", owner: "MG" },
      { num: 9, date: "11/15/24", name: "Michelle Connell", email: "", owner: "MG" },
      { num: 10, date: "11/19/24", name: "Derek Sinani", email: "", owner: "MG" },
      { num: 11, date: "11/19/24", name: "Todd Rustman", email: "", owner: "MG" },
      { num: 12, date: "11/21/24", name: "Jason Mertz", email: "", owner: "MG" },
      { num: 13, date: "11/22/24", name: "Bill Rice III", email: "", owner: "MG" },
      { num: 14, date: "11/22/24", name: "Scott Miller", email: "", owner: "MG" },
      { num: 15, date: "12/3/24", name: "Kurt Altrichter", email: "", owner: "MG" },
      { num: 16, date: "12/3/24", name: "Michael Germano", email: "", owner: "MG" },
      { num: 17, date: "12/3/24", name: "Victor Manlapaz", email: "", owner: "MG" },
      { num: 18, date: "12/4/24", name: "Tim Thielen", email: "", owner: "MG" },
      { num: 19, date: "12/5/24", name: "Michael Chadwick", email: "", owner: "MG" },
      { num: 20, date: "12/6/24", name: "Pat Antonetti", email: "", owner: "MG" },
      { num: 21, date: "12/6/24", name: "Thomas Hoffman", email: "", owner: "MG" },
      { num: 22, date: "12/6/24", name: "Zachary Youngblood", email: "", owner: "MG" },
      { num: 23, date: "12/6/24", name: "Stephen Weitzel", email: "", owner: "SR" }
    ],
  },
  emailBlasts: {
    total: 9,
  },
  podcasts: {
    total: 4,
  },
};

export default data;
