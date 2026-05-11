import { AlertTriangle, BrainCircuit, CheckCircle2, Database, Gauge, Sparkles } from "lucide-react";
import { AIAssistant } from "../components/AIAssistant";
import { Badge } from "../components/Badge";
import { DataLineage } from "../components/DataLineage";
import { SectionPanel } from "../components/SectionPanel";
import { SQLViewer } from "../components/SQLViewer";
import { comparisonRows, customerInfo, validationResults } from "../data/mockData";

export function InvestigationResult() {
  return (
    <div className="grid gap-6 2xl:grid-cols-[1fr_390px]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Investigation RCA-1048</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Customer Status Mismatch Analysis</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Simulated RCA result showing data comparison, suspected transformation logic, SQL evidence, lineage, and assistant explanation.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-right">
            <div className="flex items-center justify-end gap-2 text-emerald-100">
              <Gauge className="h-5 w-5" />
              <span className="text-sm font-semibold">Confidence</span>
            </div>
            <p className="mt-1 text-3xl font-extrabold text-white">High</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-200" />
              <p className="text-sm font-semibold text-slate-300">Possible Root Cause</p>
            </div>
            <p className="mt-4 text-xl font-bold text-white">Transformation Logic Issue</p>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-5 w-5 text-cyan-200" />
              <p className="text-sm font-semibold text-slate-300">AI Explanation</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-200">CASE statement in SQL converted ACTIVE to INACTIVE when dormant_flag was null.</p>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-200" />
              <p className="text-sm font-semibold text-slate-300">Recommended Action</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-200">Review line 6 mapping and align dormant flag handling with DWH business rule.</p>
          </div>
        </div>

        <SectionPanel title="Customer Information" eyebrow="Context snapshot" action={<Database className="h-5 w-5 text-cyan-200" />}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {customerInfo.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Data Comparison" eyebrow="Source data, report output, CSRTB data">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="pb-3">Layer</th>
                  <th className="pb-3">System</th>
                  <th className="pb-3">Field</th>
                  <th className="pb-3">Expected</th>
                  <th className="pb-3">Actual</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="transition hover:bg-white/5">
                    <td className="py-4 font-semibold text-white">{row.label}</td>
                    <td className="py-4 text-slate-300">{row.system}</td>
                    <td className="py-4 font-mono text-cyan-100">{row.field}</td>
                    <td className="py-4 text-slate-300">{row.expected}</td>
                    <td className={row.status === "Failed" ? "py-4 font-semibold text-rose-200" : "py-4 text-slate-300"}>{row.actual}</td>
                    <td className="py-4">
                      <Badge>{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionPanel>

        <SectionPanel title="Validation Results" eyebrow="Rule checks">
          <div className="grid gap-3 md:grid-cols-2">
            {validationResults.map((item) => (
              <div key={item.rule} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{item.rule}</p>
                  <Badge>{item.result}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.details}</p>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Data Flow Visualization" eyebrow="Lineage trace">
          <DataLineage />
        </SectionPanel>

        <SectionPanel title="SQL Script Viewer" eyebrow="Highlighted suspected logic" action={<Sparkles className="h-5 w-5 text-cyan-200" />}>
          <SQLViewer />
        </SectionPanel>
      </div>

      <div className="2xl:sticky 2xl:top-24 2xl:h-[calc(100vh-7rem)]">
        <AIAssistant />
      </div>
    </div>
  );
}
