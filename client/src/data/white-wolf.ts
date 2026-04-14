import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "White Wolf Capital",
  companyAccent: "Wolf",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Mar 2025 – Present",
  kpis: [
    { label: "FA Introductions", value: "8", subtext: "Completed introductions" },
    { label: "Sponsored Emails", value: "2", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "4", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "2", subtext: "Sponsored webinars" },
    { label: "Cold Email", value: "Active", subtext: "FA cold email campaign" },
    { label: "Months Active", value: "4", subtext: "Since Mar 2025" }
  ],
  faIntroductions: {
    total: 8,
  },
  emailBlasts: {
    total: 2,
  },
  podcasts: {
    total: 4,
  },
  webinars: {
    total: 2,
  },
};

export default data;
