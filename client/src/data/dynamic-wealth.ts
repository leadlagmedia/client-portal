import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Dynamic Wealth Group",
  companyAccent: "Wealth",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Nov 2024 – Present",
  kpis: [
    { label: "Email Blasts", value: "35", subtext: "Sponsored Substack blasts" },
    { label: "Total Views", value: "3.45M", subtext: "Across all sponsorships" },
    { label: "Client Clicks", value: "30,653", subtext: "From email blasts" },
    { label: "FA Introductions", value: "38", subtext: "All with email contacts" },
    { label: "YouTube Episodes", value: "4", subtext: "~20,762 combined views" },
  ],
  faIntroductions: {
    total: 38,
  },
  emailBlasts: {
    total: 35,
  },
  youtube: {
    active: true,
    description: "4 sponsored YouTube episodes featuring Brad Barrie & Matt O'Bryon — ~20,762 combined views",
    episodes: [
      { date: "Mar 5, 2024", title: "Navigate All Market Storms with this Investment Process", featuring: "Brad Barrie & Matt O'Bryon", url: "https://investresolve.com/podcasts/resolve-riffs-navigate-all-market-storms-with-this-investment-process/" },
      { date: "Nov 21, 2024", title: "Now Is The Time To Be Tactical", featuring: "Brad Barrie & Matt O'Bryon", url: "https://www.youtube.com/watch?v=Sp5kkJ1oqC8" },
      { date: "Jun 7, 2025", title: "Understanding Market Dynamics", featuring: "Brad Barrie & Matt O'Bryon", url: "https://dynamicwg.com/understanding-market-dynamics-a-conversation-with-industry-experts/" },
      { date: "Nov 6, 2025", title: "Fear and Fundamentals: Brad Barrie on Global Macro", featuring: "Brad Barrie", views: 16723, url: "https://www.youtube.com/watch?v=xqAAMkENNfk" },
    ],
  },
  investment: {
    total: "$155,000+",
    months: 18,
  },
};

export default data;
