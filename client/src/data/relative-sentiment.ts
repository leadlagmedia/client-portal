import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Relative Sentiment Technologies",
  companyAccent: "Sentiment",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Apr 2025 – Present",
  kpis: [
    { label: "Sponsored Emails", value: "2", subtext: "Substack blasts" },
    { label: "Podcast Episodes", value: "2", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "2", subtext: "Sponsored webinars" },
    { label: "Months Active", value: "2", subtext: "Since Apr 2025" }
  ],
  emailBlasts: {
    total: 2,
  },
  podcasts: {
    total: 2,
  },
  webinars: {
    total: 2,
  },
};

export default data;
