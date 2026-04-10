import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Line
} from "recharts";
import { logoWhite } from "@/lib/images";

// ── Types ──

export interface ClientKpi {
  label: string;
  value: string;
  subtext: string;
}

export interface FaAdvisor {
  num?: number;
  date: string;
  name: string;
  email: string;
  firm?: string;
  owner?: string;
}

export interface FaChartPoint {
  month: string;
  monthly: number;
  cumulative: number;
}

export interface EmailBlast {
  date: string;
  title: string;
  recipients?: number;
  opens?: number;
  openRate?: string;
  totalViews?: number;
  clientClicks?: number;
}

export interface PodcastEpisode {
  date: string;
  title: string;
  featuring?: string;
  views?: number;
  url?: string;
}

export interface WebinarEntry {
  date: string;
  title: string;
  registrations?: number;
  status?: string;
}

export interface DeliverableMonth {
  month: string;
  categories: { label: string; owed: number; completed: number }[];
}

export interface ClientDashboardData {
  company: string;
  companyAccent?: string; // word to highlight in teal
  subtitle?: string;
  logoUrl?: string;
  dateRange: string;
  kpis: ClientKpi[];
  faIntroductions?: {
    total: number;
    chartData?: FaChartPoint[];
    advisors?: FaAdvisor[];
  };
  emailBlasts?: {
    total: number;
    blasts?: EmailBlast[];
    chartData?: { date: string; totalViews: number; clientClicks: number }[];
  };
  podcasts?: {
    total: number | string;
    episodes?: PodcastEpisode[];
  };
  webinars?: {
    total: number | string;
    entries?: WebinarEntry[];
  };
  articles?: {
    total: number;
    description?: string;
  };
  substack?: {
    active: boolean;
    subscribers?: number;
    openRate?: string;
    posts?: string;
  };
  smm?: {
    active: boolean;
    contact?: string;
  };
  youtube?: {
    active: boolean;
    description?: string;
    episodes?: PodcastEpisode[];
  };
  deliverables?: DeliverableMonth[];
  investment?: {
    total: string;
    months: number;
    monthlyRate?: string;
  };
}

// ── Shared Styles ──

const tooltipStyle = {
  background: "#1a2030",
  border: "1px solid #2a3a5c",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#e0e8f0",
};

// ── Sub-components ──

function KpiCard({ label, value, subtext }: ClientKpi) {
  return (
    <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-5">
      <div className="text-[11px] uppercase tracking-[0.1em] text-[#6677aa] mb-2 font-medium">{label}</div>
      <div className="text-2xl font-bold text-[#4ecdc4] font-mono leading-tight">{value}</div>
      <div className="text-[13px] text-[#6677aa] mt-1.5">{subtext}</div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 rounded-lg bg-[rgba(78,205,196,0.15)] flex items-center justify-center text-lg">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
  );
}

function TableBadge({ count, label }: { count: number | string; label: string }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(78,205,196,0.15)] text-[#4ecdc4]">
      {count} {label}
    </span>
  );
}

// ── Main Component ──

export default function IssuerDashboard({ data }: { data: ClientDashboardData }) {
  const companyParts = data.companyAccent
    ? data.company.split(data.companyAccent)
    : [data.company];

  return (
    <div className="min-h-full" style={{ background: "#0f1117" }}>
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-10 py-8"
        style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a2744 100%)", borderBottom: "1px solid #2a3a5c" }}
      >
        <div className="flex items-center gap-5">
          {data.logoUrl ? (
            <img src={data.logoUrl} alt={data.company} className="h-10 w-auto max-w-[160px] object-contain" />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-[rgba(78,205,196,0.2)] flex items-center justify-center text-[#4ecdc4] text-lg font-bold">
              {data.company.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
          )}
          <div className="w-px h-10 bg-[#2a3a5c]" />
          <img src={logoWhite} alt="Lead-Lag Media" className="h-7 w-auto" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            {data.companyAccent ? (
              <>{companyParts[0]}<span className="text-[#4ecdc4]">{data.companyAccent}</span>{companyParts[1] || ""}</>
            ) : (
              data.company
            )}
          </h1>
          <p className="text-sm text-[#8899aa] mt-1">{data.subtitle || "Client Activity Dashboard — Lead-Lag Media"}</p>
        </div>
        <div className="px-5 py-2 rounded-full text-sm text-[#4ecdc4] border border-[rgba(78,205,196,0.3)] bg-[rgba(78,205,196,0.1)]">
          {data.dateRange}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className={`grid gap-5 px-10 py-8 ${data.kpis.length <= 4 ? "grid-cols-4" : data.kpis.length <= 6 ? "grid-cols-3 lg:grid-cols-6" : "grid-cols-3 lg:grid-cols-4"}`} style={{ background: "#0f1117" }}>
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ── FA Introductions ── */}
      {data.faIntroductions && data.faIntroductions.total > 0 && (
        <div className="px-10 py-8" style={{ background: "#0f1117" }}>
          <SectionHeader icon="👥" title="Financial Advisor Introductions" />
          <p className="text-sm text-[#6677aa] mb-6 ml-12">
            {data.faIntroductions.total} financial advisor introductions delivered
          </p>

          {/* Chart */}
          {data.faIntroductions.chartData && data.faIntroductions.chartData.length > 0 && (
            <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#ccddee]">Monthly FA Introductions</h3>
                <div className="flex items-center gap-4 text-xs text-[#8899aa]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#4ecdc4]" /> Monthly
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#f0a500]" /> Cumulative
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={data.faIntroductions.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2840" />
                  <XAxis dataKey="month" stroke="#556677" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#556677" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#556677" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar yAxisId="left" dataKey="monthly" fill="#4ecdc4" radius={[4, 4, 0, 0]} name="Monthly" />
                  <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#f0a500" strokeWidth={2} dot={{ fill: "#f0a500", r: 4 }} name="Cumulative" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Advisor Table */}
          {data.faIntroductions.advisors && data.faIntroductions.advisors.length > 0 && (
            <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e2840] border-b border-[#2a3a5c]">
                <h3 className="text-sm font-semibold text-white">All FA Introductions</h3>
                <TableBadge count={data.faIntroductions.advisors.length} label="Total" />
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#2a3a5c] bg-[#1a2030]">
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">#</th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Advisor</th>
                      {data.faIntroductions.advisors[0]?.firm && (
                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Firm</th>
                      )}
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Email</th>
                      {data.faIntroductions.advisors[0]?.owner && (
                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Owner</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.faIntroductions.advisors.map((a, i) => (
                      <tr key={i} className={`border-b border-[rgba(42,58,92,0.5)] ${i % 2 === 1 ? "bg-[rgba(26,32,48,0.5)]" : ""}`}>
                        <td className="px-4 py-2.5 text-sm text-[#4ecdc4] font-medium">{a.num ?? i + 1}</td>
                        <td className="px-4 py-2.5 text-sm text-[#ccd6f6] whitespace-nowrap">{a.date}</td>
                        <td className="px-4 py-2.5 text-sm text-[#ccd6f6] font-medium">{a.name}</td>
                        {a.firm !== undefined && (
                          <td className="px-4 py-2.5 text-sm text-[#8899bb]">{a.firm}</td>
                        )}
                        <td className="px-4 py-2.5 text-sm">
                          <a href={`mailto:${a.email}`} className="text-[#4ecdc4] hover:underline text-xs">{a.email}</a>
                        </td>
                        {a.owner !== undefined && (
                          <td className="px-4 py-2.5">
                            <span className="inline-block px-2 py-0.5 rounded text-xs text-[#aabbcc] bg-[rgba(78,205,196,0.1)]">{a.owner}</span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Email Sponsorships ── */}
      {data.emailBlasts && data.emailBlasts.total > 0 && (
        <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
          <SectionHeader icon="📧" title="Email Sponsorships & Substack Reach" />
          <p className="text-sm text-[#6677aa] mb-6 ml-12">
            {data.emailBlasts.total} sponsored email placements through The Lead-Lag Report
          </p>

          {data.emailBlasts.chartData && data.emailBlasts.chartData.length > 0 && (
            <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#ccddee]">Email Performance</h3>
                <div className="flex items-center gap-4 text-xs text-[#8899aa]">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#4ecdc4]" /> Views</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f0a500]" /> Clicks</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={data.emailBlasts.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2840" />
                  <XAxis dataKey="date" stroke="#556677" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#556677" fontSize={11} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                  <YAxis yAxisId="right" orientation="right" stroke="#556677" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar yAxisId="left" dataKey="totalViews" fill="#4ecdc4" radius={[4, 4, 0, 0]} name="Total Views" />
                  <Line yAxisId="right" type="monotone" dataKey="clientClicks" stroke="#f0a500" strokeWidth={2} dot={{ fill: "#f0a500", r: 4 }} name="Client Clicks" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {data.emailBlasts.blasts && data.emailBlasts.blasts.length > 0 && (
            <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e2840] border-b border-[#2a3a5c]">
                <h3 className="text-sm font-semibold text-white">All Email Sponsorships</h3>
                <TableBadge count={data.emailBlasts.total} label="Blasts" />
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#2a3a5c] bg-[#1a2030]">
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Title</th>
                      {data.emailBlasts.blasts[0]?.recipients && <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Recipients</th>}
                      {data.emailBlasts.blasts[0]?.opens && <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Opens</th>}
                      {data.emailBlasts.blasts[0]?.openRate && <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Open Rate</th>}
                      {data.emailBlasts.blasts[0]?.totalViews && <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Views</th>}
                      {data.emailBlasts.blasts[0]?.clientClicks !== undefined && <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Clicks</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.emailBlasts.blasts.map((e, i) => (
                      <tr key={i} className={`border-b border-[rgba(42,58,92,0.5)] ${i % 2 === 1 ? "bg-[rgba(26,32,48,0.5)]" : ""}`}>
                        <td className="px-4 py-2.5 text-sm text-[#ccd6f6] whitespace-nowrap">{e.date}</td>
                        <td className="px-4 py-2.5 text-sm text-[#ccd6f6] max-w-md">{e.title}</td>
                        {e.recipients && <td className="px-4 py-2.5 text-sm text-[#ccd6f6] text-right tabular-nums">{e.recipients.toLocaleString()}</td>}
                        {e.opens && <td className="px-4 py-2.5 text-sm text-[#ccd6f6] text-right tabular-nums">{e.opens.toLocaleString()}</td>}
                        {e.openRate && <td className="px-4 py-2.5 text-sm text-[#ccd6f6] text-right tabular-nums">{e.openRate}</td>}
                        {e.totalViews && <td className="px-4 py-2.5 text-sm text-[#4ecdc4] text-right tabular-nums font-semibold">{e.totalViews.toLocaleString()}</td>}
                        {e.clientClicks !== undefined && <td className="px-4 py-2.5 text-sm text-[#ccd6f6] text-right tabular-nums">{e.clientClicks.toLocaleString()}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Lead-Lag Live / Podcasts ── */}
      {data.podcasts && (
        <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
          <SectionHeader icon="🎙" title="Lead-Lag Live & Podcast Appearances" />
          <p className="text-sm text-[#6677aa] mb-6 ml-12">
            {data.podcasts.total} appearances
          </p>

          {data.podcasts.episodes && data.podcasts.episodes.length > 0 && (
            <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e2840] border-b border-[#2a3a5c]">
                <h3 className="text-sm font-semibold text-white">Episode History</h3>
                <TableBadge count={data.podcasts.episodes.length} label="Episodes" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a3a5c]">
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Title</th>
                      {data.podcasts.episodes[0]?.featuring && <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Featuring</th>}
                      {data.podcasts.episodes.some(e => e.views) && <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Views</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.podcasts.episodes.map((ep, i) => (
                      <tr key={i} className={`border-b border-[rgba(42,58,92,0.5)] ${i % 2 === 1 ? "bg-[rgba(26,32,48,0.5)]" : ""}`}>
                        <td className="px-4 py-2.5 text-sm text-[#ccd6f6] whitespace-nowrap">{ep.date}</td>
                        <td className="px-4 py-2.5 text-sm text-[#ccd6f6]">
                          {ep.url ? <a href={ep.url} target="_blank" rel="noopener noreferrer" className="text-[#4ecdc4] hover:underline">{ep.title}</a> : ep.title}
                        </td>
                        {ep.featuring && <td className="px-4 py-2.5 text-sm text-[#8899bb]">{ep.featuring}</td>}
                        {ep.views !== undefined && <td className="px-4 py-2.5 text-sm text-[#ccd6f6] text-right tabular-nums">{ep.views.toLocaleString()}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── YouTube ── */}
      {data.youtube && data.youtube.active && (
        <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
          <SectionHeader icon="📹" title="YouTube Content" />
          <p className="text-sm text-[#6677aa] mb-6 ml-12">{data.youtube.description}</p>

          {data.youtube.episodes && data.youtube.episodes.length > 0 && (
            <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e2840] border-b border-[#2a3a5c]">
                <h3 className="text-sm font-semibold text-white">Episodes</h3>
                <TableBadge count={data.youtube.episodes.length} label="Videos" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a3a5c]">
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Title</th>
                      {data.youtube.episodes[0]?.featuring && <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Featuring</th>}
                      {data.youtube.episodes.some(e => e.views) && <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Views</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.youtube.episodes.map((ep, i) => (
                      <tr key={i} className={`border-b border-[rgba(42,58,92,0.5)] ${i % 2 === 1 ? "bg-[rgba(26,32,48,0.5)]" : ""}`}>
                        <td className="px-4 py-2.5 text-sm text-[#ccd6f6] whitespace-nowrap">{ep.date}</td>
                        <td className="px-4 py-2.5 text-sm">
                          {ep.url ? <a href={ep.url} target="_blank" rel="noopener noreferrer" className="text-[#4ecdc4] hover:underline">{ep.title}</a> : <span className="text-[#ccd6f6]">{ep.title}</span>}
                        </td>
                        {ep.featuring && <td className="px-4 py-2.5 text-sm text-[#8899bb]">{ep.featuring}</td>}
                        {ep.views !== undefined && <td className="px-4 py-2.5 text-sm text-[#ccd6f6] text-right tabular-nums">{ep.views.toLocaleString()}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Webinars ── */}
      {data.webinars && (
        <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
          <SectionHeader icon="🎓" title="Webinars" />
          <p className="text-sm text-[#6677aa] mb-6 ml-12">
            {data.webinars.total} webinar{data.webinars.total !== 1 ? "s" : ""}
          </p>

          {data.webinars.entries && data.webinars.entries.length > 0 && (
            <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a3a5c]">
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Title</th>
                      <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.webinars.entries.map((w, i) => (
                      <tr key={i} className={`border-b border-[rgba(42,58,92,0.5)] ${i % 2 === 1 ? "bg-[rgba(26,32,48,0.5)]" : ""}`}>
                        <td className="px-4 py-2.5 text-sm text-[#ccd6f6] whitespace-nowrap">{w.date}</td>
                        <td className="px-4 py-2.5 text-sm text-[#ccd6f6]">{w.title}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${w.status === "Completed" ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"}`}>
                            {w.status || "Completed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Articles ── */}
      {data.articles && data.articles.total > 0 && (
        <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
          <SectionHeader icon="📝" title="Articles & Content" />
          <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-[#4ecdc4] font-mono">{data.articles.total}</div>
              <div>
                <div className="text-sm font-semibold text-[#ccddee]">Articles Published</div>
                {data.articles.description && <div className="text-xs text-[#6677aa] mt-0.5">{data.articles.description}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Substack & SMM ── */}
      {(data.substack?.active || data.smm?.active) && (
        <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
          <SectionHeader icon="📊" title="Content & Social Management" />
          <div className="grid grid-cols-2 gap-6">
            {data.substack?.active && (
              <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[#ccddee] mb-3">Substack Sponsorship</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#6677aa]">Status</span><span className="text-green-400">Active</span></div>
                  {data.substack.posts && <div className="flex justify-between"><span className="text-[#6677aa]">Posts</span><span className="text-[#ccd6f6]">{data.substack.posts}</span></div>}
                  {data.substack.subscribers && <div className="flex justify-between"><span className="text-[#6677aa]">Subscribers</span><span className="text-[#ccd6f6]">{data.substack.subscribers.toLocaleString()}</span></div>}
                  {data.substack.openRate && <div className="flex justify-between"><span className="text-[#6677aa]">Open Rate</span><span className="text-[#4ecdc4]">{data.substack.openRate}</span></div>}
                </div>
              </div>
            )}
            {data.smm?.active && (
              <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[#ccddee] mb-3">Social Media Management</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#6677aa]">Status</span><span className="text-green-400">Active</span></div>
                  {data.smm.contact && <div className="flex justify-between"><span className="text-[#6677aa]">Manager</span><span className="text-[#ccd6f6]">{data.smm.contact}</span></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Deliverables Summary ── */}
      {data.deliverables && data.deliverables.length > 0 && (
        <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
          <SectionHeader icon="📋" title="Monthly Deliverables" />
          <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-[#2a3a5c] bg-[#1e2840]">
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Month</th>
                    {data.deliverables[0]?.categories.map(c => (
                      <th key={c.label} className="px-4 py-3 text-center text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.deliverables.map((m, i) => (
                    <tr key={m.month} className={`border-b border-[rgba(42,58,92,0.5)] ${i % 2 === 1 ? "bg-[rgba(26,32,48,0.5)]" : ""}`}>
                      <td className="px-4 py-2.5 text-sm text-[#ccd6f6] font-medium whitespace-nowrap">{m.month}</td>
                      {m.categories.map(c => {
                        const pct = c.owed > 0 ? (c.completed / c.owed) * 100 : 100;
                        return (
                          <td key={c.label} className="px-4 py-2.5 text-center">
                            <span className={`text-sm font-mono tabular-nums ${pct >= 100 ? "text-green-400" : pct > 0 ? "text-amber-400" : "text-[#556677]"}`}>
                              {c.completed}/{c.owed}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Investment Summary ── */}
      {data.investment && (
        <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
          <SectionHeader icon="💰" title="Investment Summary" />
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6 text-center">
              <div className="text-[11px] uppercase tracking-[0.1em] text-[#6677aa] mb-2 font-medium">Total Invested</div>
              <div className="text-2xl font-bold text-[#4ecdc4] font-mono">{data.investment.total}</div>
            </div>
            <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6 text-center">
              <div className="text-[11px] uppercase tracking-[0.1em] text-[#6677aa] mb-2 font-medium">Months Active</div>
              <div className="text-2xl font-bold text-[#ccd6f6] font-mono">{data.investment.months}</div>
            </div>
            {data.investment.monthlyRate && (
              <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6 text-center">
                <div className="text-[11px] uppercase tracking-[0.1em] text-[#6677aa] mb-2 font-medium">Monthly Rate</div>
                <div className="text-2xl font-bold text-[#ccd6f6] font-mono">{data.investment.monthlyRate}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-10 py-8 border-t border-[#1a2030] text-center text-[13px] text-[#556677]" style={{ background: "#0d1117" }}>
        <p>Prepared by Lead-Lag Media · Data as of April 10, 2026</p>
        <p className="mt-1">Dashboard auto-generated — data sourced from internal tracking</p>
      </div>
    </div>
  );
}
