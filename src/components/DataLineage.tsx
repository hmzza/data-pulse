import { BrainCircuit, ChevronRight, ClipboardList, FileCode2, SearchCheck } from "lucide-react";

const toneMap: Record<string, string> = {
  pink: "border-pink-300/25 bg-pink-400/10 text-pink-100",
  emerald: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  amber: "border-amber-300/25 bg-amber-400/10 text-amber-100",
  rose: "border-rose-300/25 bg-rose-400/10 text-rose-100",
};

type DataLineageProps = {
  reportLabel: string;
  fieldLabel?: string;
  customerId?: string;
  confidence: "Low" | "Medium" | "High";
};

export function DataLineage({ reportLabel, fieldLabel, customerId, confidence }: DataLineageProps) {
  const flowSteps = [
    {
      title: "Issue Intake",
      subtitle: customerId || "General investigation",
      status: fieldLabel ? `Fields: ${fieldLabel}` : "Issue description captured",
      tone: "pink",
      icon: ClipboardList,
    },
    {
      title: "Report SQL",
      subtitle: reportLabel,
      status: "Stored .sql file selected",
      tone: "amber",
      icon: FileCode2,
    },
    {
      title: "Logic Review",
      subtitle: "AI reads intake + SQL",
      status: "Join, filter, CASE, and date logic checked",
      tone: "emerald",
      icon: SearchCheck,
    },
    {
      title: "RCA Output",
      subtitle: `${confidence} confidence`,
      status: "SQL-based hypothesis generated",
      tone: "rose",
      icon: BrainCircuit,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
      {flowSteps.map((step, index) => (
        <div key={step.title} className="contents">
          <div className={`min-w-0 rounded-2xl border p-4 transition hover:-translate-y-1 ${toneMap[step.tone]}`}>
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
            <div className="hidden items-center justify-center 2xl:flex">
              <ChevronRight className="h-6 w-6 text-pink-200/70" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
