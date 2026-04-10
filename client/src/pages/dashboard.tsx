import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Mail, Eye, Video, Film, MousePointerClick,
  Handshake, MessageSquare, TrendingUp, TrendingDown,
  Calendar, CheckCircle2, Clock, ArrowUpRight
} from "lucide-react";
import type { KpiMetric, Activity, Deliverable, MonthlyStat } from "@shared/schema";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";

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
  fa_intro: "FA Introduction",
  email_blast: "Email Blast",
  podcast: "Podcast",
  webinar: "Webinar",
  campaign: "Campaign",
  article: "Article",
  social: "Social",
  other: "Other",
};

function KpiCard({ kpi }: { kpi: KpiMetric }) {
  const Icon = iconMap[kpi.icon || ""] || TrendingUp;
  const isUp = kpi.changeDirection === "up";
  const isDown = kpi.changeDirection === "down";

  return (
    <Card className="bg-card border-border/40">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {kpi.label}
            </p>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {kpi.value}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        {kpi.change && (
          <div className="mt-2 flex items-center gap-1.5">
            {isUp && <ArrowUpRight className="h-3.5 w-3.5 text-green-400" />}
            {isDown && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
            <span className={`text-xs font-medium ${isUp ? "text-green-400" : isDown ? "text-red-400" : "text-muted-foreground"}`}>
              {kpi.change}
            </span>
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
      <div className="mt-0.5">
        <StatusIcon className={`h-4 w-4 ${activity.status === "completed" ? "text-green-400" : "text-amber-400"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-foreground truncate">{activity.title}</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 shrink-0 ${colorClass}`}>
            {label}
          </Badge>
        </div>
        {activity.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
        {new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </span>
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
                <div
                  className={`h-full rounded-full transition-all ${isFull ? "bg-green-500" : "bg-primary"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">
                {d.completed}/{d.owed}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: kpis, isLoading: kpiLoading } = useQuery<KpiMetric[]>({
    queryKey: ["/api/dashboard/kpis"],
  });

  const { data: activities, isLoading: actLoading } = useQuery<Activity[]>({
    queryKey: ["/api/dashboard/activities"],
  });

  const { data: deliverables, isLoading: delLoading } = useQuery<Deliverable[]>({
    queryKey: ["/api/dashboard/deliverables"],
  });

  const { data: stats } = useQuery<MonthlyStat[]>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Group deliverables by month
  const delByMonth = (deliverables || []).reduce((acc, d) => {
    (acc[d.month] = acc[d.month] || []).push(d);
    return acc;
  }, {} as Record<string, Deliverable[]>);
  const sortedMonths = Object.keys(delByMonth).sort().reverse();

  // Build chart data from stats
  const chartData = (stats || []).reduce((acc, s) => {
    const existing = acc.find((r) => r.month === s.month);
    if (existing) {
      existing[s.metric] = s.value;
    } else {
      acc.push({ month: s.month, [s.metric]: s.value });
    }
    return acc;
  }, [] as any[]).sort((a, b) => a.month.localeCompare(b.month));

  const chartMonthLabels = chartData.map((d) =>
    new Date(d.month + "-01").toLocaleDateString("en-US", { month: "short" })
  );

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {user?.company} — {user?.role === "issuer" ? "Fund Issuer" : user?.role === "advisor" ? "Financial Advisor" : user?.role === "sponsor" ? "Sponsor" : ""} Dashboard
        </p>
      </div>

      {/* KPI Cards */}
      {kpiLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" data-testid="kpi-grid">
          {(kpis || []).sort((a, b) => a.sortOrder - b.sortOrder).map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}

      {/* Charts + Activity */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Chart section */}
        <div className="lg:col-span-3 space-y-6">
          {chartData.length > 0 && (
            <>
              <Card className="bg-card border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Email Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(40, 80%, 55%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(40, 80%, 55%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(v) => new Date(v + "-01").toLocaleDateString("en-US", { month: "short" })}
                        stroke="hsl(220, 10%, 45%)"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="hsl(220, 10%, 45%)"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(220, 35%, 12%)",
                          border: "1px solid hsl(220, 20%, 18%)",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "hsl(40, 10%, 92%)",
                        }}
                        formatter={(value: number) => [value.toLocaleString(), "Views"]}
                        labelFormatter={(v) => new Date(v + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      />
                      <Area
                        type="monotone"
                        dataKey="email_views"
                        stroke="hsl(40, 80%, 55%)"
                        fill="url(#goldGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">FA Introductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(v) => new Date(v + "-01").toLocaleDateString("en-US", { month: "short" })}
                        stroke="hsl(220, 10%, 45%)"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="hsl(220, 10%, 45%)" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(220, 35%, 12%)",
                          border: "1px solid hsl(220, 20%, 18%)",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "hsl(40, 10%, 92%)",
                        }}
                        labelFormatter={(v) => new Date(v + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      />
                      <Bar dataKey="fa_intros" fill="hsl(180, 50%, 45%)" radius={[4, 4, 0, 0]} name="Introductions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border/40 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[480px] overflow-y-auto">
              {actLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded" />
                  ))}
                </div>
              ) : (
                (activities || []).map((a) => <ActivityItem key={a.id} activity={a} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deliverables */}
      {sortedMonths.length > 0 && (
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deliverables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {sortedMonths.map((m) => (
              <DeliverableRow key={m} month={m} items={delByMonth[m]} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
