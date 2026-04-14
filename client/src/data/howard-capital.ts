import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Howard Capital Management",
  companyAccent: "Capital",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Jan 2025 – Present",
  kpis: [
    { label: "FA Introductions", value: "10", subtext: "Completed introductions" },
    { label: "Podcast Episodes", value: "4", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "2", subtext: "Sponsored webinars" },
    { label: "Months Active", value: "4", subtext: "Since Jan 2025" }
  ],
  faIntroductions: {
    total: 10,
  },
  podcasts: {
    total: 4,
  },
  webinars: {
    total: 2,
  },
};

export default data;
