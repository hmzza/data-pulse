import { Activity, AlertTriangle, BarChart3, BrainCircuit, Database, FileCode2, RefreshCw, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getHealth, listInvestigations, listReports } from "../api/client";
import type { Investigation, ReportSummary } from "../api/types";
import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionPanel } from "../components/SectionPanel";
import { getFieldSummary } from "../utils/investigation";
import { buildDashboardTrend, localDateKey, withinDateRange } from "../utils/dashboardDates";
import { priorityClass } from "../utils/status";

const pieColors = ["#fb7185", "#f59e0b", "#ec4899", "#94a3b8"];

type HealthPayload = {
  ok: boolean;
  service: string;
  openAiConfigured: boolean;
};

export function Dashboard() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    void refreshDashboard();
  }, []);

  async function refreshDashboard() {
    setLoading(true);
    try {
      const [nextInvestigations, nextReports, nextHealth] = await Promise.all([listInvestigations(), listReports(), getHealth()]);
      setInvestigations(nextInvestigations);
      setReports(nextReports);
      setHealth(nextHealth);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const invalidRange = Boolean(startDate && endDate && startDate > endDate);
  const filteredInvestigations = investigations.filter((item) => withinDateRange(item.createdAt, startDate, endDate));
  const filteredReports = reports.filter((item) => withinDateRange(item.createdAt, startDate, endDate));
  const rangeLabel = startDate || endDate ? `${startDate || "Beginning"} – ${endDate || "Present"}` : "All time";

  const priorityCounts = {
    Critical: filteredInvestigations.filter((item) => item.priority === "Critical").length,
    High: filteredInvestigations.filter((item) => item.priority === "High").length,
    Medium: filteredInvestigations.filter((item) => item.priority === "Medium").length,
    Low: filteredInvestigations.filter((item) => item.priority === "Low").length,
  };

  const highPriorityCount = priorityCounts.Critical + priorityCounts.High;
  const highConfidenceCount = filteredInvestigations.filter((item) => item.analysis.confidence === "High").length;
  const investigationsToday = filteredInvestigations.filter((item) => isSameDay(item.createdAt, new Date())).length;

  const metrics = [
    {
      label: "Total Investigations",
      value: String(filteredInvestigations.length),
      delta: `${investigationsToday} created today`,
      tone: "pink",
      icon: Activity,
    },
    {
      label: "Reports Uploaded",
      value: String(filteredReports.length),
      delta: filteredReports[0] ? `Last updated ${formatShortDate(filteredReports[0].updatedAt)}` : "No SQL reports yet",
      tone: "amber",
      icon: FileCode2,
    },
    {
      label: "High Priority",
      value: String(highPriorityCount),
      delta: `${priorityCounts.Critical} critical, ${priorityCounts.High} high`,
      tone: "rose",
      icon: ShieldAlert,
    },
    {
      label: "High Confidence RCA",
      value: String(highConfidenceCount),
      delta: health?.openAiConfigured ? "OpenAI analysis ready" : "AI key not configured",
      tone: "emerald",
      icon: BrainCircuit,
    },
  ];

  const issueTrendData = buildDashboardTrend(filteredInvestigations, startDate, endDate);
  const severityData = [
    { name: "Critical", value: priorityCounts.Critical },
    { name: "High", value: priorityCounts.High },
    { name: "Medium", value: priorityCounts.Medium },
    { name: "Low", value: priorityCounts.Low },
  ].filter((item) => item.value > 0);
  const investigationVolume = buildDashboardTrend(filteredInvestigations, startDate, endDate, true);
  const recentInvestigations = [...filteredInvestigations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-300/80">Operations dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Data RCA Command Center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Live backend view of uploaded reports, saved investigations, priority mix, and AI-driven SQL RCA throughput.
          </p>
        </div>
        <button
          onClick={refreshDashboard}
          className="flex items-center gap-2 rounded-2xl border border-pink-300/20 bg-pink-400/10 px-4 py-3 text-sm font-semibold text-pink-100 transition hover:border-pink-200/50 hover:bg-pink-400/15"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm text-slate-300">From date
            <input type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} className="mt-2 block rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white [color-scheme:dark]" />
          </label>
          <label className="text-sm text-slate-300">To date
            <input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} className="mt-2 block rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white [color-scheme:dark]" />
          </label>
          <button onClick={() => { const today = new Date(); const start = new Date(today); start.setDate(start.getDate() - 6); setStartDate(localDateKey(start)); setEndDate(localDateKey(today)); }} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-pink-100">Last 7 days</button>
          <button onClick={() => { setStartDate(""); setEndDate(""); }} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-pink-100">All time</button>
        </div>
        <p className="mt-3 text-xs text-slate-400" role="status">{rangeLabel} · {filteredInvestigations.length} investigations · Filters use creation dates in your local timezone.</p>
        {invalidRange ? <p role="alert" className="mt-2 text-sm text-rose-200">From date must be on or before To date.</p> : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}

      {health && !health.openAiConfigured ? (
        <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-50">
          OpenAI is not configured on the running backend. Investigation generation will fail until `OPENAI_API_KEY` is loaded and the backend is restarted.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionPanel title="Investigation Trend" eyebrow={rangeLabel} action={<BarChart3 className="h-5 w-5 text-pink-200" />}>
          <div className="h-80">
            {issueTrendData.some((item) => item.investigations > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={issueTrendData} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="investigations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.36} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="highPriority" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb7185" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#fb7185" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 14 }} />
                  <Area type="monotone" dataKey="investigations" stroke="#ec4899" strokeWidth={3} fill="url(#investigations)" />
                  <Area type="monotone" dataKey="highPriority" stroke="#fb7185" strokeWidth={2.5} fill="url(#highPriority)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyPanel message="No investigations in the selected date range." />
            )}
          </div>
        </SectionPanel>

        <SectionPanel title="Priority Mix" eyebrow="Live investigation distribution" action={<ShieldAlert className="h-5 w-5 text-rose-200" />}>
          <div className="grid min-h-80 place-items-center">
            {severityData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={245}>
                  <PieChart>
                    <Pie data={severityData} dataKey="value" innerRadius={62} outerRadius={94} paddingAngle={4}>
                      {severityData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 14 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid w-full grid-cols-2 gap-3">
                  {severityData.map((item, index) => (
                    <div key={item.name} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: pieColors[index] }} />
                        <span className="text-sm font-semibold text-slate-200">{item.name}</span>
                      </div>
                      <p className="mt-1 text-xl font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyPanel message="Priority distribution will appear once investigations are saved." />
            )}
          </div>
        </SectionPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <SectionPanel title="Investigation Volume" eyebrow={rangeLabel} action={<Database className="h-5 w-5 text-pink-200" />}>
          <div className="h-72">
            {investigationVolume.some((item) => item.investigations > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={investigationVolume} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 14 }} />
                  <Bar dataKey="investigations" radius={[10, 10, 0, 0]} fill="#c026d3" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyPanel message="Monthly volume appears after investigations are generated." />
            )}
          </div>
        </SectionPanel>

        <SectionPanel title="Recent Investigations" eyebrow="Latest RCA activity" action={<Activity className="h-5 w-5 text-pink-200" />}>
          <div className="overflow-x-auto">
            {recentInvestigations.length > 0 ? (
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Field</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Priority</th>
                    <th className="pb-3 font-semibold">RCA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentInvestigations.map((item) => (
                    <tr key={item.id} className="transition hover:bg-white/5">
                      <td className="py-4 font-semibold text-pink-100">
                        <Link to={`/result/${item.id}`} className="hover:text-pink-200">
                          {item.id}
                        </Link>
                      </td>
                      <td className="py-4 text-slate-300">{item.customerId || "Not provided"}</td>
                      <td className="py-4 text-slate-300">{getFieldSummary(item.fieldComparisons)}</td>
                      <td className="py-4">
                        <Badge>{item.status}</Badge>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass(item.priority)}`}>{item.priority}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <BrainCircuit className="h-4 w-4 text-pink-200" />
                          <span className="max-w-[240px] truncate">{item.analysis.summary}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
                No investigations in this date range. Create one from <Link to="/new" className="font-semibold text-pink-200 hover:text-pink-100">New Investigation</Link>.
              </div>
            )}
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="grid h-full min-h-[220px] place-items-center rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
      <div>
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-200" />
        <p className="mt-4">{message}</p>
      </div>
    </div>
  );
}

function isSameDay(iso: string, compare: Date) {
  const date = new Date(iso);
  return (
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth() &&
    date.getDate() === compare.getDate()
  );
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
