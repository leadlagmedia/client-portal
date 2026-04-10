import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Infrastructure Capital",
  companyAccent: "Capital",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Jan 2025 – Present",
  kpis: [
    { label: "Total Invested", value: "$182K", subtext: "16 months" },
    { label: "Lead-Lag Live", value: "12+", subtext: "~2/month through Jan 2026" },
    { label: "Webinars", value: "6+", subtext: "Monthly sponsored webinars" },
    { label: "Substack", value: "Active", subtext: "Monthly sponsorship" },
    { label: "SMM", value: "Active", subtext: "Jesse Oberoi" },
    { label: "Income Institute", value: "Active", subtext: "Weekly YouTube clips since Feb 2026" },
  ],
  faIntroductions: {
    total: 9,
    advisors: [
      { num: 1, date: "6/30/21", name: "Kapil Shiohare", email: "kapil.shiohare@thinagee.com", firm: "Thinagee" },
      { num: 2, date: "7/13/21", name: "Andy Wang", email: "awang@runnymede.com", firm: "Runnymede Capital" },
      { num: 3, date: "7/15/21", name: "Brian Walsh", email: "brian.walsh@wnfg.com", firm: "Wealth Network Financial" },
      { num: 4, date: "7/27/21", name: "Brandon Day", email: "bday@lpl.com", firm: "LPL" },
      { num: 5, date: "8/10/21", name: "David Pankiw", email: "david.pankiw@cubicadvisors.com", firm: "Cubic Advisors" },
      { num: 6, date: "8/12/21", name: "Mark Vincent", email: "Mvincent@stonebrookcapital.com", firm: "Stonebrook Capital" },
      { num: 7, date: "8/24/21", name: "Daren Blonski / Chris Sipes", email: "daren@sonomawealthadvisors.com", firm: "Sonoma Wealth Advisors" },
      { num: 8, date: "11/3/21", name: "Kurt Altrichter", email: "kurt@ivoryhill.com", firm: "Ivory Hill" },
      { num: 9, date: "11/3/21", name: "Charles Sizemore", email: "clsizemore@sizemorecapital.com", firm: "Sizemore Capital" },
    ],
  },
  podcasts: {
    total: "12+",
  },
  webinars: {
    total: "6+",
    entries: [
      { date: "Oct 30, 2025", title: "Monthly Sponsored Webinar", status: "Completed" },
      { date: "Dec 17, 2025", title: "Monthly Sponsored Webinar", status: "Completed" },
      { date: "Jan 14, 2026", title: "Monthly Sponsored Webinar", status: "Completed" },
      { date: "Jan 26, 2026", title: "Monthly Sponsored Webinar", status: "Completed" },
      { date: "Mar 19, 2026", title: "Post-Fed Outlook: Inflation Realities & Oil Risks", status: "Completed" },
      { date: "Apr 13, 2026", title: "Monthly Sponsored Webinar", status: "Scheduled" },
    ],
  },
  youtube: {
    active: true,
    description: "Weekly 30-minute Income Institute YouTube clips with Jay Hatfield — replaced Lead-Lag Live appearances starting Feb 2026",
  },
  substack: {
    active: true,
  },
  smm: {
    active: true,
    contact: "Jesse Oberoi",
  },
  investment: {
    total: "$182,000",
    months: 16,
    monthlyRate: "$10K–$12K",
  },
};

export default data;
