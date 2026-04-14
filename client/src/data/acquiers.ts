import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Acquiers Fund",
  companyAccent: "Acquiers",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Jan 2025 – Present",
  kpis: [
    { label: "Podcast Episodes", value: "1", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "1", subtext: "Sponsored webinars" },
    { label: "Months Active", value: "1", subtext: "Since Jan 2025" }
  ],
  podcasts: {
    total: 1,
  },
  webinars: {
    total: 1,
  },
};

export default data;
