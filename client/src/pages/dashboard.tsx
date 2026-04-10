import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import type { KpiMetric, Activity, Deliverable, MonthlyStat } from "@shared/schema";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Line, AreaChart, Area
} from "recharts";
import IssuerDashboard from "@/components/issuer-dashboard";
import { logoWhite, distillateLogoWhite } from "@/lib/images";

// ── Client data imports ──
import granitesharesData from "@/data/graniteshares";
import runningOakData from "@/data/running-oak";
import dynamicWealthData from "@/data/dynamic-wealth";
import sanjacAlphaData from "@/data/sanjac-alpha";
import kranesharesData from "@/data/kraneshares";
import uscfData from "@/data/uscf";
import infraCapData from "@/data/infrastructure-capital";
import tappalphaData from "@/data/tappalpha";

// ── Distillate data (extracted from the live Perplexity dashboard) ──

const DISTILLATE_FA_CHART = [
  { month: "Sep 25", monthly: 2, cumulative: 2 },
  { month: "Oct 25", monthly: 3, cumulative: 5 },
  { month: "Nov 25", monthly: 4, cumulative: 9 },
  { month: "Dec 25", monthly: 4, cumulative: 13 },
  { month: "Jan 26", monthly: 10, cumulative: 24 },
  { month: "Feb 26", monthly: 7, cumulative: 31 },
  { month: "Mar 26", monthly: 3, cumulative: 34 },
  { month: "Apr 26", monthly: 1, cumulative: 35 },
];

const DISTILLATE_ADVISORS = [
  { num: 1, date: "9/15/2025", name: "Jason Baum", email: "jason.baum@capitalwealthadvisors.com", owner: "DW" },
  { num: 2, date: "9/23/2025", name: "Robert Ebling", email: "robert_ebling@exitfour.com", owner: "DW" },
  { num: 3, date: "9/29/2025", name: "David Millet", email: "dmillet@thewestermangroup.com", owner: "SR" },
  { num: 4, date: "10/2/2025", name: "Gregory Goodlett", email: "ggoodlett@worthadvisors.com", owner: "SR" },
  { num: 5, date: "10/8/2025", name: "Steve Rumsey", email: "steve@optimusadvisory.com", owner: "MG" },
  { num: 6, date: "10/29/2025", name: "Chad Seegers", email: "cseegers@insight2wealth.com", owner: "SR" },
  { num: 7, date: "10/30/2025", name: "Patrick O'Marro & Ryan Young", email: "pomarro@sapientcapital.com", owner: "DW" },
  { num: 8, date: "10/31/2025", name: "Jeff Hodges", email: "jeff@januarycapital.co", owner: "SR" },
  { num: 9, date: "11/3/2025", name: "Christian Ravsten", email: "christian@foxstonefinancial.com", owner: "SR" },
  { num: 10, date: "11/4/2025", name: "Jeremy Ander", email: "jander@ufinadv.com", owner: "DW" },
  { num: 11, date: "11/7/2025", name: "Derek Sensenig", email: "derek@easadvice.com", owner: "SR" },
  { num: 12, date: "11/12/2025", name: "Tom Dowling", email: "tom@dowlingfinancial.com", owner: "SR" },
  { num: 13, date: "11/18/2025", name: "Mike Hennessy", email: "mhennessy@hennessyadvisors.com", owner: "DW" },
  { num: 14, date: "11/20/2025", name: "Brian Schreiner", email: "brian@schreinerwealth.com", owner: "SR" },
  { num: 15, date: "12/1/2025", name: "Scott Conley", email: "scott@conleywealth.com", owner: "DW" },
  { num: 16, date: "12/3/2025", name: "Dan Yerger", email: "dyerger@myassetmark.com", owner: "SR" },
  { num: 17, date: "12/8/2025", name: "Richard Steinberg", email: "rsteinberg@steinbergglobal.com", owner: "MG" },
  { num: 18, date: "12/15/2025", name: "Mark Belanger", email: "mbelanger@belangerfinancial.com", owner: "DW" },
  { num: 19, date: "1/6/2026", name: "Eric Clark", email: "eclark@accuvest.com", owner: "MG" },
  { num: 20, date: "1/7/2026", name: "James Mulvihill", email: "james@mulvihillcap.com", owner: "SR" },
  { num: 21, date: "1/8/2026", name: "Kevin Gahagan", email: "kevin@mosaicinvest.com", owner: "DW" },
  { num: 22, date: "1/10/2026", name: "Matt Forester", email: "mforester@lockwoodadvisors.com", owner: "SR" },
  { num: 23, date: "1/13/2026", name: "James Chen", email: "jchen@purewealth.com", owner: "DW" },
  { num: 24, date: "1/15/2026", name: "Daniel Cole", email: "dcole@coleandassociates.com", owner: "SR" },
  { num: 25, date: "1/20/2026", name: "Brandon Thomas", email: "bthomas@safeguardwealth.com", owner: "DW" },
  { num: 26, date: "1/22/2026", name: "Paul Engel", email: "pengel@engelwealth.com", owner: "SR" },
  { num: 27, date: "1/27/2026", name: "Ryan McMaken", email: "rmcmaken@capitalintel.com", owner: "MG" },
  { num: 28, date: "1/30/2026", name: "Steve Blumenthal", email: "steve@cmgwealth.com", owner: "DW" },
  { num: 29, date: "2/3/2026", name: "Michael Kramer", email: "mkramer@mottwealthmgmt.com", owner: "SR" },
  { num: 30, date: "2/5/2026", name: "Joe Fernandez", email: "joe@inveniowm.com", owner: "DW" },
  { num: 31, date: "2/10/2026", name: "Adam Grossman", email: "agrossman@mayportcapital.com", owner: "SR" },
  { num: 32, date: "2/18/2026", name: "Gary Pzegeo", email: "gpzegeo@ufinvest.com", owner: "DW" },
  { num: 33, date: "2/24/2026", name: "Chris Shea", email: "cshea@sheafinancial.com", owner: "SR" },
  { num: 34, date: "3/3/2026", name: "Dennis McNamara", email: "dmcnamara@windgatewealth.com", owner: "MG" },
];

const DISTILLATE_EMAILS = [
  { date: "10/15/25", title: "Gold at Records, Yields Sliding, Stocks Soaring – What's Wrong with This Picture?", recipients: 246020, opens: 79924, openRate: "33.74%", totalViews: 115698, clientClicks: 476 },
  { date: "10/26/25", title: "Underperforming but Undervalued: Can Healthcare's 2025 Slump Reverse?", recipients: 257647, opens: 80202, openRate: "32.56%", totalViews: 119992, clientClicks: 503 },
  { date: "10/29/25", title: "End of Year Melt-Up? Weak Utilities, Strong Seasonality, and the Calm Before the Storm", recipients: 257135, opens: 68582, openRate: "27.73%", totalViews: 99678, clientClicks: 224 },
  { date: "11/9/25", title: "Valuation Overhangs and the AI Hype: Are Tech Stocks Finally Paying the Price?", recipients: 254894, opens: 74708, openRate: "30.58%", totalViews: 109291, clientClicks: 174 },
  { date: "11/9/25", title: "Late-Year Seasonality: November-December Strength", recipients: 255073, opens: 76949, openRate: "31.42%", totalViews: 111856, clientClicks: 163 },
  { date: "12/20/25", title: "Prediction Markets vs. Traditional Investing: Disruptive Innovation or Threat to Market Integrity?", recipients: 226485, opens: 66843, openRate: "31.06%", totalViews: 95556, clientClicks: 178 },
  { date: "12/24/25", title: "Value vs. Growth: Signs of a Long-Awaited Turn", recipients: 226131, opens: 71361, openRate: "33.20%", totalViews: 105796, clientClicks: 148 },
  { date: "12/30/25", title: "Global Euphoria: Records, Rotation, and the Limits of Optimism", recipients: 228108, opens: 67865, openRate: "31.34%", totalViews: 101506, clientClicks: 441 },
  { date: "1/6/26", title: "Defense Is No Longer Cyclical: Where the Real Opportunities Are", recipients: 227657, opens: 68971, openRate: "31.96%", totalViews: 103846, clientClicks: 530 },
  { date: "1/14/26", title: "Risk-On Without Tech: What a Small-Cap Led Market Means for Sector Rotation", recipients: 234679, opens: 70182, openRate: "31.62%", totalViews: 104969, clientClicks: 313 },
  { date: "2/7/26", title: "Accelerant to Extinguisher", recipients: 238005, opens: 71430, openRate: "31.95%", totalViews: 102871, clientClicks: 556 },
  { date: "2/13/26", title: "When the Music Stops: Spotting the Cracks Before They Spread", recipients: 240120, opens: 72450, openRate: "30.17%", totalViews: 103139, clientClicks: 498 },
];

const DISTILLATE_EMAIL_CHART = DISTILLATE_EMAILS.map((e) => ({
  date: e.date,
  totalViews: e.totalViews,
  clientClicks: e.clientClicks,
}));

// ── Shared Styles ──

const customTooltipStyle = {
  background: "#1a2030",
  border: "1px solid #2a3a5c",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#e0e8f0",
};

function KpiCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
      <div className="text-[11px] uppercase tracking-[0.1em] text-[#6677aa] mb-2 font-medium">{label}</div>
      <div className="text-[2rem] font-bold text-[#4ecdc4] font-mono leading-tight">{value}</div>
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

// ── Company → Data mapping ──

function getClientData(company: string, email: string) {
  const c = company.toLowerCase();
  if (c.includes("granite")) return granitesharesData;
  if (c.includes("running oak")) return runningOakData;
  if (c.includes("dynamic")) return dynamicWealthData;
  if (c.includes("sanjac")) return sanjacAlphaData;
  if (c.includes("krane")) return kranesharesData;
  if (c.includes("uscf")) return uscfData;
  if (c.includes("infrastructure") || c.includes("infracap")) return infraCapData;
  if (c.includes("tapp")) return tappalphaData;
  return null;
}

// ── Main Export ──

export default function DashboardPage() {
  const { user } = useAuth();

  const isDistillate = user?.company?.toLowerCase().includes("distillate");
  const isGregBabij = user?.email === "gb@sundial.io" || user?.company?.toLowerCase() === "sundial";

  if (isGregBabij) return <GregBabijDashboard />;
  if (isDistillate) return <DistillateDashboard />;

  // Try matching to a client data file
  const clientData = user?.company ? getClientData(user.company, user.email || "") : null;
  if (clientData) return <IssuerDashboard data={clientData} />;

  // Fallback to generic dashboard
  return <GenericDashboard />;
}

// ── Distillate Dashboard (preserved from original) ──

function DistillateDashboard() {
  return (
    <div className="min-h-full" style={{ background: "#0f1117" }}>
      <div
        className="flex items-center justify-between px-10 py-8"
        style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a2744 100%)", borderBottom: "1px solid #2a3a5c" }}
      >
        <div className="flex items-center gap-5">
          <img src={distillateLogoWhite} alt="Distillate Capital" className="h-12 w-auto brightness-100" />
          <div className="w-px h-10 bg-[#2a3a5c]" />
          <img src={logoWhite} alt="Lead-Lag Media" className="h-7 w-auto" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Distillate <span className="text-[#4ecdc4]">Capital</span>
          </h1>
          <p className="text-sm text-[#8899aa] mt-1">Client Activity Dashboard — Lead-Lag Media</p>
        </div>
        <div className="px-5 py-2 rounded-full text-sm text-[#4ecdc4] border border-[rgba(78,205,196,0.3)] bg-[rgba(78,205,196,0.1)]">
          Sep 2025 – Present
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 px-10 py-8" style={{ background: "#0f1117" }}>
        <KpiCard label="FA Introductions" value="34" subtext="Sep 2025 – Apr 2026" />
        <KpiCard label="Email Sponsorships" value="12" subtext="Oct 2025 – Feb 2026" />
        <KpiCard label="Total Views" value="1,273,202" subtext="Across all sponsorships" />
        <KpiCard label="Client Clicks" value="4,224" subtext="From email sponsorships" />
      </div>

      <div className="px-10 py-8" style={{ background: "#0f1117" }}>
        <SectionHeader icon="👥" title="Financial Advisor Introductions" />
        <p className="text-sm text-[#6677aa] mb-6 ml-12">
          34 financial advisor introductions delivered from September 2025 through April 2026
        </p>

        <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#ccddee]">Monthly FA Introductions</h3>
            <div className="flex items-center gap-4 text-xs text-[#8899aa]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#4ecdc4]" /> Monthly</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f0a500]" /> Cumulative</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={DISTILLATE_FA_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2840" />
              <XAxis dataKey="month" stroke="#556677" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#556677" fontSize={11} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#556677" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar yAxisId="left" dataKey="monthly" fill="#4ecdc4" radius={[4, 4, 0, 0]} name="Monthly" />
              <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#f0a500" strokeWidth={2} dot={{ fill: "#f0a500", r: 4 }} name="Cumulative" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e2840] border-b border-[#2a3a5c]">
            <h3 className="text-sm font-semibold text-white">All FA Introductions</h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(78,205,196,0.15)] text-[#4ecdc4]">34 Total</span>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-[#2a3a5c] bg-[#1a2030]">
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">#</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Advisor Name</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">LinkedIn</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {DISTILLATE_ADVISORS.map((a, i) => (
                  <tr key={a.num} className={`border-b border-[rgba(42,58,92,0.5)] ${i % 2 === 1 ? "bg-[rgba(26,32,48,0.5)]" : ""}`}>
                    <td className="px-4 py-3 text-sm text-[#4ecdc4] font-medium">{a.num}</td>
                    <td className="px-4 py-3 text-sm text-[#ccd6f6]">{a.date}</td>
                    <td className="px-4 py-3 text-sm text-[#ccd6f6] font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-sm"><a href={`mailto:${a.email}`} className="text-[#4ecdc4] hover:underline">{a.email}</a></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#0077b5] text-white text-[11px] font-bold">in</span></td>
                    <td className="px-4 py-3"><span className="inline-block px-2 py-0.5 rounded text-xs text-[#aabbcc] bg-[rgba(78,205,196,0.1)]">{a.owner}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
        <SectionHeader icon="📧" title="Email Sponsorships & Substack Reach" />
        <p className="text-sm text-[#6677aa] mb-6 ml-12">12 sponsored email placements through The Lead-Lag Report with 1,273,202 total views</p>

        <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#ccddee]">Email Sponsorship Performance</h3>
            <div className="flex items-center gap-4 text-xs text-[#8899aa]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#4ecdc4]" /> Total Views</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f0a500]" /> Client Clicks</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={DISTILLATE_EMAIL_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2840" />
              <XAxis dataKey="date" stroke="#556677" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#556677" fontSize={11} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <YAxis yAxisId="right" orientation="right" stroke="#556677" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(value: number, name: string) => [value.toLocaleString(), name === "totalViews" ? "Total Views" : "Client Clicks"]} />
              <Bar yAxisId="left" dataKey="totalViews" fill="#4ecdc4" radius={[4, 4, 0, 0]} name="totalViews" />
              <Line yAxisId="right" type="monotone" dataKey="clientClicks" stroke="#f0a500" strokeWidth={2} dot={{ fill: "#f0a500", r: 4 }} name="clientClicks" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e2840] border-b border-[#2a3a5c]">
            <h3 className="text-sm font-semibold text-white">All Email Sponsorships</h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(78,205,196,0.15)] text-[#4ecdc4]">12 Blasts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3a5c]">
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Post Title</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Recipients</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Opens</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Open Rate</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Total Views</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Client Clicks</th>
                </tr>
              </thead>
              <tbody>
                {DISTILLATE_EMAILS.map((e, i) => (
                  <tr key={i} className={`border-b border-[rgba(42,58,92,0.5)] ${i % 2 === 1 ? "bg-[rgba(26,32,48,0.5)]" : ""}`}>
                    <td className="px-4 py-3.5 text-sm text-[#ccd6f6] whitespace-nowrap">{e.date}</td>
                    <td className="px-4 py-3.5 text-sm text-[#ccd6f6] max-w-md">{e.title}</td>
                    <td className="px-4 py-3.5 text-sm text-[#ccd6f6] text-right tabular-nums">{e.recipients.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-sm text-[#ccd6f6] text-right tabular-nums">{e.opens.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-sm text-[#ccd6f6] text-right tabular-nums">{e.openRate}</td>
                    <td className="px-4 py-3.5 text-sm text-[#4ecdc4] text-right tabular-nums font-semibold">{e.totalViews.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-sm text-[#ccd6f6] text-right tabular-nums">{e.clientClicks.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="px-10 py-8 border-t border-[#1a2030] text-center text-[13px] text-[#556677]" style={{ background: "#0d1117" }}>
        <p>Prepared by Lead-Lag Media · Data as of April 7, 2026</p>
        <p className="mt-1">Dashboard auto-generated — data sourced from Substack and internal tracking</p>
      </div>
    </div>
  );
}

// ── Greg Babij Advisor Dashboard ──

import { Megaphone, MailCheck, BarChart3, CalendarCheck, Timer, Pause, Play } from "lucide-react";

const GREG_AD_MANAGEMENT = {
  status: "Paused",
  consultant: "Mircea Andrei Cotofana",
  engagementEnd: "Mid-March 2026",
  platform: "Google Ads",
  summary: [
    { label: "Total Ad Spend", value: "$4,200" },
    { label: "Impressions", value: "148,500" },
    { label: "Clicks", value: "2,340" },
    { label: "CTR", value: "1.58%" },
    { label: "Leads Generated", value: "42" },
    { label: "Cost Per Lead", value: "$100" },
  ],
};

const GREG_WEBINAR = {
  title: "Money in Motion: What High-Net-Worth Investors Need to Know Before Making Their Next Move",
  date: "April 29, 2026",
  time: "12:00 PM ET",
  zoomId: "823 6652 3745",
  registrations: 0,
  ceCredit: true,
  campaignStatus: "Pending Launch",
  targetLaunch: "April 15, 2026",
  campaignSequence: [
    { step: 1, subject: "Are You Prepared for the Wealth Transfer?", dayOffset: 0, status: "Draft Approved" },
    { step: 2, subject: "[Reminder] Join Greg Babij, CFA — Live CE Webinar", dayOffset: 5, status: "Draft Approved" },
    { step: 3, subject: "Final Spots: Money in Motion CE Webinar", dayOffset: 10, status: "Draft Approved" },
    { step: 4, subject: "Tomorrow: Join Us Live", dayOffset: 13, status: "Draft Approved" },
  ],
  emailStats: { totalSent: 0, opened: 0, clicked: 0, replied: 0 },
};

const GREG_TIMELINE = [
  { date: "Apr 5, 2026", event: "Webinar created on Zoom (ID 823 6652 3745)", type: "webinar" },
  { date: "Apr 3, 2026", event: "Greg approved 4-step cold email sequence copy", type: "campaign" },
  { date: "Mar 15, 2026", event: "Mircea engagement ended — ads paused", type: "ad" },
  { date: "Mar 1, 2026", event: "Ad campaign performance review completed", type: "ad" },
  { date: "Feb 15, 2026", event: "Ad campaign optimizations applied", type: "ad" },
  { date: "Jan 20, 2026", event: "Google Ads campaign launched", type: "ad" },
  { date: "Jan 10, 2026", event: "Greg Babij joined Lead-Lag Media advisor network", type: "milestone" },
];

function GregBabijDashboard() {
  const timelineColors: Record<string, string> = {
    webinar: "bg-blue-500", campaign: "bg-amber-500", ad: "bg-purple-500", milestone: "bg-green-500", booking: "bg-teal-500",
  };

  return (
    <div className="min-h-full" style={{ background: "#0f1117" }}>
      <div className="flex items-center justify-between px-10 py-8" style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a2744 100%)", borderBottom: "1px solid #2a3a5c" }}>
        <div className="flex items-center gap-5">
          <div className="w-11 h-11 rounded-full bg-[rgba(78,205,196,0.2)] flex items-center justify-center text-[#4ecdc4] text-lg font-bold">GB</div>
          <div className="w-px h-10 bg-[#2a3a5c]" />
          <img src={logoWhite} alt="Lead-Lag Media" className="h-7 w-auto" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Greg <span className="text-[#4ecdc4]">Babij</span></h1>
          <p className="text-sm text-[#8899aa] mt-1">Advisor Dashboard — Lead-Lag Media</p>
        </div>
        <div className="px-5 py-2 rounded-full text-sm text-[#4ecdc4] border border-[rgba(78,205,196,0.3)] bg-[rgba(78,205,196,0.1)]">Sundial · FA Services</div>
      </div>

      <div className="grid grid-cols-4 gap-5 px-10 py-8" style={{ background: "#0f1117" }}>
        <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
          <div className="text-[11px] uppercase tracking-[0.1em] text-[#6677aa] mb-2 font-medium">Ad Campaign</div>
          <div className="flex items-center gap-2"><Pause className="h-5 w-5 text-amber-400" /><span className="text-xl font-bold text-amber-400">Paused</span></div>
          <div className="text-[13px] text-[#6677aa] mt-1.5">Since Mar 2026</div>
        </div>
        <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
          <div className="text-[11px] uppercase tracking-[0.1em] text-[#6677aa] mb-2 font-medium">Webinar Registrations</div>
          <div className="text-[2rem] font-bold text-[#4ecdc4] font-mono leading-tight">{GREG_WEBINAR.registrations}</div>
          <div className="text-[13px] text-[#6677aa] mt-1.5">Campaign launches Apr 15</div>
        </div>
        <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
          <div className="text-[11px] uppercase tracking-[0.1em] text-[#6677aa] mb-2 font-medium">Emails Sent</div>
          <div className="text-[2rem] font-bold text-[#4ecdc4] font-mono leading-tight">{GREG_WEBINAR.emailStats.totalSent}</div>
          <div className="text-[13px] text-[#6677aa] mt-1.5">Cold email sequence</div>
        </div>
        <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
          <div className="text-[11px] uppercase tracking-[0.1em] text-[#6677aa] mb-2 font-medium">Days to Webinar</div>
          <div className="text-[2rem] font-bold text-[#4ecdc4] font-mono leading-tight">
            {Math.max(0, Math.ceil((new Date("2026-04-29T16:00:00Z").getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
          </div>
          <div className="text-[13px] text-[#6677aa] mt-1.5">Apr 29, 2026 · 12pm ET</div>
        </div>
      </div>

      <div className="px-10 py-8" style={{ background: "#0f1117" }}>
        <SectionHeader icon="📊" title="Programmatic Ad Management" />
        <div className="flex items-center gap-2 ml-12 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20"><Pause className="h-3 w-3" /> Paused</span>
          <span className="text-sm text-[#6677aa]">Managed by {GREG_AD_MANAGEMENT.consultant} · Engagement ended {GREG_AD_MANAGEMENT.engagementEnd}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {GREG_AD_MANAGEMENT.summary.map((s) => (
            <div key={s.label} className="bg-[#1a2030] border border-[#2a3a5c] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#6677aa] mb-1">{s.label}</div>
              <div className="text-lg font-bold text-[#ccd6f6] font-mono">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
        <SectionHeader icon="🎓" title="CE-Credit Webinar Campaign" />
        <p className="text-sm text-[#6677aa] mb-6 ml-12">"{GREG_WEBINAR.title}" — {GREG_WEBINAR.date} at {GREG_WEBINAR.time}</p>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-[#ccddee] mb-4">Webinar Details</h3>
            <div className="space-y-3">
              {[["Date", GREG_WEBINAR.date], ["Time", GREG_WEBINAR.time], ["Zoom ID", GREG_WEBINAR.zoomId], ["CE Credit", "CFP® CE Eligible"], ["Registrations", String(GREG_WEBINAR.registrations)]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm"><span className="text-[#6677aa]">{k}</span><span className="text-[#ccd6f6] font-medium">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-[#ccddee] mb-4">Email Campaign Status</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20"><Timer className="h-3 w-3" /> {GREG_WEBINAR.campaignStatus}</span>
              <span className="text-xs text-[#6677aa]">Target: {GREG_WEBINAR.targetLaunch}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Sent", GREG_WEBINAR.emailStats.totalSent], ["Opened", GREG_WEBINAR.emailStats.opened], ["Clicked", GREG_WEBINAR.emailStats.clicked], ["Replied", GREG_WEBINAR.emailStats.replied]].map(([label, val]) => (
                <div key={label as string} className="bg-[#141c2b] rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-[0.1em] text-[#6677aa] mb-0.5">{label}</div>
                  <div className="text-lg font-bold text-[#ccd6f6] font-mono">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e2840] border-b border-[#2a3a5c]">
            <h3 className="text-sm font-semibold text-white">4-Step Email Sequence</h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(78,205,196,0.15)] text-[#4ecdc4]">14-Day Cadence</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3a5c]">
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Step</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Subject Line</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Day</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.1em] text-[#6677aa] font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {GREG_WEBINAR.campaignSequence.map((s, i) => (
                  <tr key={s.step} className={`border-b border-[rgba(42,58,92,0.5)] ${i % 2 === 1 ? "bg-[rgba(26,32,48,0.5)]" : ""}`}>
                    <td className="px-4 py-3 text-sm text-[#4ecdc4] font-medium">{s.step}</td>
                    <td className="px-4 py-3 text-sm text-[#ccd6f6]">{s.subject}</td>
                    <td className="px-4 py-3 text-sm text-[#ccd6f6] text-right tabular-nums">Day {s.dayOffset}</td>
                    <td className="px-4 py-3 text-right"><span className="inline-block px-2 py-0.5 rounded text-xs bg-green-500/15 text-green-400">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
        <SectionHeader icon="📅" title="Booking Pipeline" />
        <p className="text-sm text-[#6677aa] mb-6 ml-12">Discovery call bookings via Cal.com</p>
        <div className="bg-[#1a2030] border border-[#2a3a5c] rounded-xl p-6">
          <div className="flex items-center gap-3 text-[#6677aa]">
            <CalendarCheck className="h-5 w-5" />
            <span className="text-sm">Booking link: <span className="text-[#4ecdc4]">cal.com/gregbabij/sundial-discovery-call-multi-family-office</span></span>
          </div>
          <div className="mt-4 text-center py-6 text-[#556677] text-sm">Booking data will populate once the webinar campaign launches and discovery calls are scheduled.</div>
        </div>
      </div>

      <div className="px-10 py-8 border-t border-[#1a2030]" style={{ background: "#0f1117" }}>
        <SectionHeader icon="⏱" title="Activity Timeline" />
        <div className="ml-12 mt-4">
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#2a3a5c]" />
            <div className="space-y-6">
              {GREG_TIMELINE.map((item, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className={`w-[15px] h-[15px] rounded-full ${timelineColors[item.type] || "bg-gray-500"} mt-0.5 z-10 shrink-0`} />
                  <div>
                    <div className="text-sm text-[#ccd6f6]">{item.event}</div>
                    <div className="text-xs text-[#556677] mt-0.5">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-10 py-8 border-t border-[#1a2030] text-center text-[13px] text-[#556677]" style={{ background: "#0d1117" }}>
        <p>Prepared by Lead-Lag Media · Data as of April 10, 2026</p>
        <p className="mt-1">Dashboard updated weekly — next refresh April 17, 2026</p>
      </div>
    </div>
  );
}

// ── Generic Dashboard (for non-matched users) ──

import {
  Users, Mail, Eye, Video, Film, MousePointerClick,
  Handshake, MessageSquare, TrendingUp, TrendingDown,
  Calendar, CheckCircle2, Clock, ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, any> = {
  Users, Mail, Eye, Video, Film, MousePointerClick,
  Handshake, MessageSquare, Linkedin: Users,
};

const typeColors: Record<string, string> = {
  fa_intro: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  email_blast: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  podcast: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  webinar: "bg-green-500/15 text-green-400 border-green-500/20",
  campaign: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  article: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  social: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  other: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

const typeLabels: Record<string, string> = {
  fa_intro: "FA Introduction", email_blast: "Email Blast", podcast: "Podcast", webinar: "Webinar",
  campaign: "Campaign", article: "Article", social: "Social", other: "Other",
};

function GenericKpiCard({ kpi }: { kpi: KpiMetric }) {
  const Icon = iconMap[kpi.icon || ""] || TrendingUp;
  const isUp = kpi.changeDirection === "up";
  const isDown = kpi.changeDirection === "down";
  return (
    <Card className="bg-card border-border/40">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{kpi.value}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-4 w-4 text-primary" /></div>
        </div>
        {kpi.change && (
          <div className="mt-2 flex items-center gap-1.5">
            {isUp && <ArrowUpRight className="h-3.5 w-3.5 text-green-400" />}
            {isDown && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
            <span className={`text-xs font-medium ${isUp ? "text-green-400" : isDown ? "text-red-400" : "text-muted-foreground"}`}>{kpi.change}</span>
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const colorClass = typeColors[activity.type] || typeColors.other;
  const label = typeLabels[activity.type] || activity.type;
  const StatusIcon = activity.status === "completed" ? CheckCircle2 : Clock;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
      <div className="mt-0.5"><StatusIcon className={`h-4 w-4 ${activity.status === "completed" ? "text-green-400" : "text-amber-400"}`} /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-foreground truncate">{activity.title}</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 shrink-0 ${colorClass}`}>{label}</Badge>
        </div>
        {activity.description && <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>}
      </div>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
    </div>
  );
}

function DeliverableRow({ month, items }: { month: string; items: Deliverable[] }) {
  const monthLabel = new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{monthLabel}</h4>
      <div className="grid gap-2">
        {items.map((d) => {
          const pct = d.owed > 0 ? Math.round((d.completed / d.owed) * 100) : 100;
          const isFull = pct >= 100;
          return (
            <div key={d.id} className="flex items-center gap-3 text-sm">
              <span className="flex-1 text-foreground">{d.category}</span>
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${isFull ? "bg-green-500" : "bg-primary"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">{d.completed}/{d.owed}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GenericDashboard() {
  const { user } = useAuth();
  const { data: kpis, isLoading: kpiLoading } = useQuery<KpiMetric[]>({ queryKey: ["/api/dashboard/kpis"] });
  const { data: activities, isLoading: actLoading } = useQuery<Activity[]>({ queryKey: ["/api/dashboard/activities"] });
  const { data: deliverables, isLoading: delLoading } = useQuery<Deliverable[]>({ queryKey: ["/api/dashboard/deliverables"] });
  const { data: stats } = useQuery<MonthlyStat[]>({ queryKey: ["/api/dashboard/stats"] });

  const delByMonth = (deliverables || []).reduce((acc, d) => { (acc[d.month] = acc[d.month] || []).push(d); return acc; }, {} as Record<string, Deliverable[]>);
  const sortedMonths = Object.keys(delByMonth).sort().reverse();

  const chartData = (stats || []).reduce((acc, s) => {
    const existing = acc.find((r) => r.month === s.month);
    if (existing) { existing[s.metric] = s.value; } else { acc.push({ month: s.month, [s.metric]: s.value }); }
    return acc;
  }, [] as any[]).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{user?.company} — {user?.role === "issuer" ? "Fund Issuer" : user?.role === "advisor" ? "Financial Advisor" : user?.role === "sponsor" ? "Sponsor" : ""} Dashboard</p>
      </div>

      {kpiLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" data-testid="kpi-grid">
          {(kpis || []).sort((a, b) => a.sortOrder - b.sortOrder).map((kpi) => <GenericKpiCard key={kpi.id} kpi={kpi} />)}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {chartData.length > 0 && (
            <>
              <Card className="bg-card border-border/40">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Email Views</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs><linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(40, 80%, 55%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(40, 80%, 55%)" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                      <XAxis dataKey="month" tickFormatter={(v) => new Date(v + "-01").toLocaleDateString("en-US", { month: "short" })} stroke="hsl(220, 10%, 45%)" fontSize={11} tickLine={false} />
                      <YAxis stroke="hsl(220, 10%, 45%)" fontSize={11} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                      <Tooltip contentStyle={{ background: "hsl(220, 35%, 12%)", border: "1px solid hsl(220, 20%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(40, 10%, 92%)" }} formatter={(value: number) => [value.toLocaleString(), "Views"]} labelFormatter={(v) => new Date(v + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })} />
                      <Area type="monotone" dataKey="email_views" stroke="hsl(40, 80%, 55%)" fill="url(#goldGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/40">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">FA Introductions</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                      <XAxis dataKey="month" tickFormatter={(v) => new Date(v + "-01").toLocaleDateString("en-US", { month: "short" })} stroke="hsl(220, 10%, 45%)" fontSize={11} tickLine={false} />
                      <YAxis stroke="hsl(220, 10%, 45%)" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(220, 35%, 12%)", border: "1px solid hsl(220, 20%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(40, 10%, 92%)" }} labelFormatter={(v) => new Date(v + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })} />
                      <Bar dataKey="fa_intros" fill="hsl(180, 50%, 45%)" radius={[4, 4, 0, 0]} name="Introductions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        <div className="lg:col-span-2">
          <Card className="bg-card border-border/40 h-full">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" />Recent Activity</CardTitle></CardHeader>
            <CardContent className="max-h-[480px] overflow-y-auto">
              {actLoading ? (<div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}</div>) : ((activities || []).map((a) => <ActivityItem key={a.id} activity={a} />))}
            </CardContent>
          </Card>
        </div>
      </div>

      {sortedMonths.length > 0 && (
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Deliverables</CardTitle></CardHeader>
          <CardContent className="space-y-5">{sortedMonths.map((m) => <DeliverableRow key={m} month={m} items={delByMonth[m]} />)}</CardContent>
        </Card>
      )}
    </div>
  );
}
