import { AlertCircle, Check, FileSearch, Loader2, Plus, Trash2, WandSparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createInvestigation, getHealth, listReports } from "../api/client";
import type { FieldComparison, InvestigationPayload, ReportSummary } from "../api/types";
import { SectionPanel } from "../components/SectionPanel";

const emptyFieldComparison: FieldComparison = {
  fieldName: "",
  expectedValue: "",
  actualValue: "",
};

const initialForm: InvestigationPayload = {
  customerId: "",
  priority: "High",
  issueDescription: "",
  fieldComparisons: [{ ...emptyFieldComparison }],
  reportIds: [],
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
        setForm((current) => ({
          ...current,
          reportIds:
            currentSelectionFilter(current.reportIds, nextReports).length > 0
              ? currentSelectionFilter(current.reportIds, nextReports)
              : nextReports[0]?.id
                ? [nextReports[0].id]
                : [],
        }));
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
      const payload: InvestigationPayload = {
        ...form,
        fieldComparisons: form.fieldComparisons
          .map((field) => ({
            fieldName: field.fieldName.trim(),
            expectedValue: field.expectedValue.trim(),
            actualValue: field.actualValue.trim(),
          }))
          .filter((field) => field.fieldName || field.expectedValue || field.actualValue),
        reportIds: currentSelectionFilter(form.reportIds, reports),
      };

      if (payload.reportIds.length === 0) {
        throw new Error("Select at least one valid report.");
      }
      if (payload.issueDescription.trim().length < 15) {
        throw new Error("Issue description must include enough detail for analysis.");
      }

      const investigation = await createInvestigation(payload);
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

  function updateFieldComparison(index: number, key: keyof FieldComparison, value: string) {
    setForm((current) => ({
      ...current,
      fieldComparisons: current.fieldComparisons.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, [key]: value } : field,
      ),
    }));
  }

  function addFieldComparison() {
    setForm((current) => ({
      ...current,
      fieldComparisons: [...current.fieldComparisons, { ...emptyFieldComparison }],
    }));
  }

  function removeFieldComparison(index: number) {
    setForm((current) => ({
      ...current,
      fieldComparisons:
        current.fieldComparisons.length === 1
          ? current.fieldComparisons
          : current.fieldComparisons.filter((_, fieldIndex) => fieldIndex !== index),
    }));
  }

  function toggleReport(reportId: string) {
    setForm((current) => ({
      ...current,
      reportIds: current.reportIds.includes(reportId)
        ? current.reportIds.filter((currentId) => currentId !== reportId)
        : [...current.reportIds, reportId],
    }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-300/80">Issue intake</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">New Investigation</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Capture issue context and select one or more uploaded report SQL files. Analysis is based only on these inputs for now.
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
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Customer ID</span>
                <input
                  value={form.customerId}
                  onChange={(event) => setForm({ ...form, customerId: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-pink-300/50 focus:shadow-glow"
                  placeholder="CUST-84721"
                />
              </label>
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
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-200">Field Comparisons</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Add one or more fields to compare in the same investigation.</p>
                </div>
                <button type="button" onClick={addFieldComparison} className="inline-flex items-center gap-2 rounded-2xl border border-pink-300/20 bg-pink-400/10 px-4 py-2.5 text-sm font-semibold text-pink-100 transition hover:bg-pink-400/15">
                  <Plus className="h-4 w-4" />
                  Add Field
                </button>
              </div>
              <div className="mt-5 space-y-4">
                {form.fieldComparisons.map((field, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">Field {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeFieldComparison(index)}
                        disabled={form.fieldComparisons.length === 1}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-rose-300/30 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Remove field ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <label className="block">
                        <span className="text-sm font-semibold text-slate-300">Field Name</span>
                        <input
                          value={field.fieldName}
                          onChange={(event) => updateFieldComparison(index, "fieldName", event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-pink-300/50 focus:shadow-glow"
                          placeholder="customer_status"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-slate-300">Expected Value</span>
                        <input
                          value={field.expectedValue}
                          onChange={(event) => updateFieldComparison(index, "expectedValue", event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-pink-300/50 focus:shadow-glow"
                          placeholder="ACTIVE"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-slate-300">Actual Value</span>
                        <input
                          value={field.actualValue}
                          onChange={(event) => updateFieldComparison(index, "actualValue", event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-pink-300/50 focus:shadow-glow"
                          placeholder="INACTIVE"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-200">Report SQL Files</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Select one or more uploaded reports for combined RCA analysis.</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {reportsLoading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Loading reports...</div>
                ) : null}
                {!reportsLoading && reports.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">No reports uploaded yet.</div>
                ) : null}
                {reports.map((report) => {
                  const selected = form.reportIds.includes(report.id);
                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => toggleReport(report.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-pink-300/30 bg-pink-400/10 shadow-glow"
                          : "border-white/10 bg-white/5 hover:border-pink-300/20 hover:bg-pink-400/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{report.name}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{report.filename}</p>
                        </div>
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${selected ? "border-pink-300/40 bg-pink-500 text-white" : "border-white/15 text-transparent"}`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block rounded-3xl border border-pink-300/20 bg-pink-400/10 p-5">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-200">Issue Description</span>
              <span className="mt-2 block text-sm leading-6 text-slate-400">
                This is the main guidance for the AI analysis. Describe what the DWH/CNC/portal team observed, which customers are missing or mismatched, and any email context.
              </span>
              <textarea
                value={form.issueDescription}
                onChange={(event) => setForm({ ...form, issueDescription: event.target.value })}
                minLength={15}
                className="mt-4 min-h-52 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-pink-300/50 focus:shadow-glow"
                placeholder="Example: CNC team reported that customer numbers 10231, 10239 and 10588 are missing from the report output. The portal shows these customers active for the May reporting cycle. Please inspect the selected report SQL for joins, filters, date windows, and null handling that could exclude these customers."
              />
            </label>
            <button
              disabled={loading || reports.length === 0 || form.reportIds.length === 0}
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
                  Submit the issue form to analyze the selected report SQL files. No source data, portal data, or SQL execution will be used.
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
                <p className="mt-3 text-sm text-slate-400">Using issue description, field comparisons, and selected SQL code only.</p>
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

function currentSelectionFilter(reportIds: string[], reports: ReportSummary[]) {
  const validIds = new Set(reports.map((report) => report.id).filter((reportId): reportId is string => typeof reportId === "string" && reportId.length > 0));
  return reportIds.filter((reportId): reportId is string => typeof reportId === "string" && validIds.has(reportId));
}
