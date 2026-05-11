import { ArrowRight, CheckCircle2, FileSearch, Loader2, WandSparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { SectionPanel } from "../components/SectionPanel";

const fields = [
  { id: "customerId", label: "Customer ID", placeholder: "CUST-84721" },
  { id: "fieldName", label: "Field Name", placeholder: "customer_status" },
  { id: "expectedValue", label: "Expected Value", placeholder: "ACTIVE" },
  { id: "actualValue", label: "Actual Value", placeholder: "INACTIVE" },
  { id: "reportName", label: "Report Name", placeholder: "Customer Status Reconciliation" },
];

export function NewInvestigation() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 850);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Issue intake</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">New Investigation</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Capture the DWH issue context and generate a simulated RCA result for demo workflow review.
          </p>
        </div>

        <SectionPanel title="Investigation Details" eyebrow="Manual issue entry">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.id} className="block">
                  <span className="text-sm font-semibold text-slate-300">{field.label}</span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:shadow-glow"
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Priority</span>
                <select className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50 focus:shadow-glow">
                  <option>High</option>
                  <option>Critical</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Issue Description</span>
              <textarea
                className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:shadow-glow"
                placeholder="Customer shows ACTIVE in source data but INACTIVE in CSRTB after report load."
              />
            </label>
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 py-3.5 font-bold text-slate-950 shadow-glow-blue transition hover:-translate-y-0.5 hover:shadow-glow sm:w-auto">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <WandSparkles className="h-5 w-5" />}
              Generate Mock RCA Result
            </button>
          </form>
        </SectionPanel>
      </div>

      <div className="space-y-6">
        <SectionPanel title="Generated Result Preview" eyebrow="Simulated RCA output">
          {!submitted && !loading ? (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/35 p-8 text-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-100">
                  <FileSearch className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">Awaiting intake submission</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                  Submit the issue form to simulate trace analysis, validation checks, and AI explanation generation.
                </p>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-8 text-center">
              <div>
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-cyan-200" />
                <h2 className="mt-5 text-xl font-semibold text-white">Simulating RCA trace</h2>
                <p className="mt-3 text-sm text-slate-400">Checking source data, SQL logic, report output, and CSRTB values.</p>
              </div>
            </div>
          ) : null}

          {submitted ? (
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-100">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Mock RCA generated</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Transformation Logic Issue</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    CASE statement in report SQL converted ACTIVE to INACTIVE when dormant flag was null.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Confidence", "High"],
                  ["Suspect Layer", "Transformation"],
                  ["Suspicious SQL Line", "Line 6"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/result/RCA-1048"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5"
              >
                Open RCA Result
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </SectionPanel>

        <div className="glass-panel rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Workflow</p>
          <div className="mt-5 space-y-4">
            {["Capture DWH issue details", "Trace source and report output", "Highlight suspected SQL logic", "Summarize RCA with confidence"].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-sm font-bold text-cyan-100">
                  {index + 1}
                </div>
                <p className="text-sm font-medium text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
