import { AlertCircle, FileSearch, Loader2, WandSparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createInvestigation, getHealth, listReports } from "../api/client";
import type { InvestigationPayload, ReportSummary } from "../api/types";
import { SectionPanel } from "../components/SectionPanel";

const fields = [
  { id: "customerId", label: "Customer ID", placeholder: "CUST-84721" },
  { id: "fieldName", label: "Field Name", placeholder: "customer_status" },
  { id: "expectedValue", label: "Expected Value", placeholder: "ACTIVE" },
  { id: "actualValue", label: "Actual Value", placeholder: "INACTIVE" },
] as const;

const initialForm: InvestigationPayload = {
  customerId: "",
  fieldName: "",
  expectedValue: "",
  actualValue: "",
  priority: "High",
  issueDescription: "",
  reportId: "",
};

export function NewInvestigation() {
  const navigate = useNavigate();
  const [form, setForm] = useState<InvestigationPayload>(initialForm);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [openAiConfigured, setOpenAiConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      setReportsLoading(true);
      setError("");
      try {
        const nextReports = await listReports();
        const health = await getHealth();
        setReports(nextReports);
        setOpenAiConfigured(health.openAiConfigured);
        setForm((current) => ({ ...current, reportId: current.reportId || nextReports[0]?.id || "" }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load report list.");
      } finally {
        setReportsLoading(false);
      }
    }

    void loadReports();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const investigation = await createInvestigation(form);
      navigate(`/result/${investigation.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate RCA analysis.";
      setError(
        message.includes("OPENAI_API_KEY")
          ? "OpenAI API key is not loaded by the backend. If you just edited .env, restart the backend with `npm run server` or `npm run dev:all`."
          : message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-300/80">Issue intake</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">New Investigation</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Capture issue context and select an uploaded report SQL file. Analysis is based only on these inputs for now.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {openAiConfigured === false ? (
          <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-50">
            OpenAI is not configured on the running backend. Add `OPENAI_API_KEY` to `.env`, then restart the backend.
          </div>
        ) : null}

        <SectionPanel title="Investigation Details" eyebrow="Manual issue entry">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.id} className="block">
                  <span className="text-sm font-semibold text-slate-300">{field.label}</span>
                  <input
                    value={form[field.id]}
                    onChange={(event) => setForm({ ...form, [field.id]: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-pink-300/50 focus:shadow-glow"
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Priority</span>
                <select
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value as InvestigationPayload["priority"] })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition focus:border-pink-300/50 focus:shadow-glow"
                >
                  <option>High</option>
                  <option>Critical</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Report SQL</span>
                <select
                  value={form.reportId}
                  disabled={reportsLoading || reports.length === 0}
                  onChange={(event) => setForm({ ...form, reportId: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition focus:border-pink-300/50 focus:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reportsLoading ? <option>Loading reports...</option> : null}
                  {!reportsLoading && reports.length === 0 ? <option>No reports uploaded</option> : null}
                  {reports.map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block rounded-3xl border border-pink-300/20 bg-pink-400/10 p-5">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-200">Issue Description</span>
              <span className="mt-2 block text-sm leading-6 text-slate-400">
                This is the main guidance for the AI analysis. Describe what the DWH/CNC/portal team observed, which customers are missing or mismatched, and any email context.
              </span>
              <textarea
                value={form.issueDescription}
                onChange={(event) => setForm({ ...form, issueDescription: event.target.value })}
                className="mt-4 min-h-52 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-pink-300/50 focus:shadow-glow"
                placeholder="Example: CNC team reported that customer numbers 10231, 10239 and 10588 are missing from the report output. The portal shows these customers active for the May reporting cycle. Please inspect the selected report SQL for joins, filters, date windows, and null handling that could exclude these customers."
              />
            </label>
            <button
              disabled={loading || reports.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b00062] px-5 py-3.5 font-bold text-white shadow-[0_0_32px_rgba(176,0,98,0.34)] transition hover:-translate-y-0.5 hover:bg-[#c01878] hover:shadow-[0_0_42px_rgba(176,0,98,0.45)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <WandSparkles className="h-5 w-5" />}
              Generate SQL-Based RCA
            </button>
          </form>
        </SectionPanel>
      </div>

      <div className="space-y-6">
        <SectionPanel title="Generated Result Preview" eyebrow="Backend RCA output">
          {!loading ? (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/35 p-8 text-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-pink-400/10 text-pink-100">
                  <FileSearch className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">Awaiting SQL-based analysis</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                  Submit the issue form to analyze the selected report SQL. No source data, portal data, or SQL execution will be used.
                </p>
                {reports.length === 0 ? (
                  <Link to="/reports" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#b00062] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c01878]">
                    Upload Report First
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-pink-300/15 bg-pink-400/10 p-8 text-center">
              <div>
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-pink-200" />
                <h2 className="mt-5 text-xl font-semibold text-white">Analyzing report SQL</h2>
                <p className="mt-3 text-sm text-slate-400">Using issue description, intake values, and selected SQL code only.</p>
              </div>
            </div>
          ) : null}
        </SectionPanel>

        <div className="glass-panel rounded-2xl p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-300/80">Workflow</p>
          <div className="mt-5 space-y-4">
            {["Upload report SQL", "Describe DWH/CNC/portal issue in detail", "Analyze SQL logic with AI", "Review hypotheses and manual checks"].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full border border-pink-300/25 bg-pink-400/10 text-sm font-bold text-pink-100">
                  {index + 1}
                </div>
                <p className="text-sm font-medium text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <p className="text-sm leading-6 text-amber-50">
              Results are SQL-based hypotheses only. Data Pulse cannot verify source data, report output, portal values, or CSRTB records until those integrations are added.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
