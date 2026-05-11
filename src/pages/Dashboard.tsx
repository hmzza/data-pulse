import { ArrowUpRight, BarChart3, BrainCircuit, Database, Filter, Radar, ShieldAlert } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionPanel } from "../components/SectionPanel";
import { investigationVolume, issueTrendData, metrics, recentInvestigations, severityData } from "../data/mockData";
import { priorityClass } from "../utils/status";

const pieColors = ["#fb7185", "#f59e0b", "#ec4899", "#94a3b8"];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-300/80">Operations dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Data RCA Command Center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Monitor issue intake, RCA throughput, severity trends, and recent investigations with static demo data.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl border border-pink-300/20 bg-pink-400/10 px-4 py-3 text-sm font-semibold text-pink-100 transition hover:border-pink-200/50 hover:bg-pink-400/15">
          <Filter className="h-4 w-4" />
          Filter View
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionPanel title="Issue Trend" eyebrow="7-day RCA movement" action={<BarChart3 className="h-5 w-5 text-pink-200" />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={issueTrendData} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="open" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.36} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 14 }} />
                <Area type="monotone" dataKey="open" stroke="#ec4899" strokeWidth={3} fill="url(#open)" />
                <Area type="monotone" dataKey="resolved" stroke="#34d399" strokeWidth={3} fill="url(#resolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>

        <SectionPanel title="Severity Mix" eyebrow="Priority distribution" action={<ShieldAlert className="h-5 w-5 text-rose-200" />}>
          <div className="grid min-h-80 place-items-center">
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
          </div>
        </SectionPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <SectionPanel title="Investigation Volume" eyebrow="Monthly intake" action={<Radar className="h-5 w-5 text-emerald-200" />}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={investigationVolume} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 14 }} />
                <Bar dataKey="investigations" radius={[10, 10, 0, 0]} fill="#c026d3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>

        <SectionPanel title="Recent Investigations" eyebrow="Latest RCA activity" action={<Database className="h-5 w-5 text-pink-200" />}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Issue</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Priority</th>
                  <th className="pb-3 font-semibold">RCA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {recentInvestigations.slice(0, 5).map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/5">
                    <td className="py-4 font-semibold text-pink-100">{item.id}</td>
                    <td className="py-4 text-slate-300">{item.customerId}</td>
                    <td className="py-4 text-slate-300">{item.issueType}</td>
                    <td className="py-4">
                      <Badge>{item.status}</Badge>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass(item.priority)}`}>{item.priority}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <BrainCircuit className="h-4 w-4 text-pink-200" />
                        <span>{item.rcaResult}</span>
                        <ArrowUpRight className="h-4 w-4 text-slate-500" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
