import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Toews",
  companyAccent: "Toews",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Feb 2025 – Present",
  kpis: [
    { label: "Podcast Episodes", value: "2", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "2", subtext: "Sponsored webinars" },
    { label: "Cold Email", value: "Active", subtext: "FA cold email campaign" },
    { label: "Months Active", value: "2", subtext: "Since Feb 2025" }
  ],
  podcasts: {
    total: 2,
  },
  webinars: {
    total: 2,
  },
};

export default data;
