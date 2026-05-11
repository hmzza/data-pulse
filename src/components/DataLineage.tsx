import { ChevronRight } from "lucide-react";
import { flowSteps } from "../data/mockData";

const toneMap: Record<string, string> = {
  pink: "border-pink-300/25 bg-pink-400/10 text-pink-100",
  emerald: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  amber: "border-amber-300/25 bg-amber-400/10 text-amber-100",
  rose: "border-rose-300/25 bg-rose-400/10 text-rose-100",
};

export function DataLineage() {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
      {flowSteps.map((step, index) => (
        <div key={step.title} className="contents">
          <div className={`rounded-2xl border p-4 transition hover:-translate-y-1 ${toneMap[step.tone]}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10">
                <step.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{step.title}</p>
                <p className="truncate text-xs text-slate-400">{step.subtitle}</p>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-slate-950/30 px-3 py-2 text-xs font-semibold">{step.status}</p>
          </div>
          {index < flowSteps.length - 1 ? (
            <div className="hidden items-center justify-center lg:flex">
              <ChevronRight className="h-6 w-6 text-pink-200/70" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
