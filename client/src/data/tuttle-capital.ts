import type { ClientDashboardData } from "@/components/issuer-dashboard";

const data: ClientDashboardData = {
  company: "Tuttle Capital Management",
  companyAccent: "Capital",
  subtitle: "Client Activity Dashboard — Lead-Lag Media",
  dateRange: "Jan 2025 – Present",
  kpis: [
    { label: "Podcast Episodes", value: "2", subtext: "Lead-Lag Live" },
    { label: "Webinars", value: "2", subtext: "Sponsored webinars" },
    { label: "Media Outreach", value: "Active", subtext: "Podcast & media outreach" },
    { label: "Months Active", value: "2", subtext: "Since Jan 2025" }
  ],
  podcasts: {
    total: 2,
  },
  webinars: {
    total: 2,
  },
};

export default data;
