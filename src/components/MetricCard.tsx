import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  delta: string;
  tone: string;
  icon: LucideIcon;
};

const toneClasses: Record<string, string> = {
  cyan: "from-cyan-400/20 to-blue-500/10 text-cyan-200 shadow-cyan-500/10",
  amber: "from-amber-400/20 to-orange-500/10 text-amber-200 shadow-amber-500/10",
  emerald: "from-emerald-400/20 to-teal-500/10 text-emerald-200 shadow-emerald-500/10",
  rose: "from-rose-400/20 to-fuchsia-500/10 text-rose-200 shadow-rose-500/10",
};

export function MetricCard({ label, value, delta, tone, icon: Icon }: MetricCardProps) {
  return (
    <article className="glass-panel scanline group rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br p-3 shadow-lg ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-300">{delta}</p>
    </article>
  );
}
