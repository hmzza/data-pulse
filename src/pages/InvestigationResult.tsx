import { AlertTriangle, ArrowLeft, BrainCircuit, Database, FileSearch, Gauge, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getInvestigation } from "../api/client";
import type { Investigation } from "../api/types";
import { AIAssistant } from "../components/AIAssistant";
import { Badge } from "../components/Badge";
import { DataLineage } from "../components/DataLineage";
import { SectionPanel } from "../components/SectionPanel";
import { SQLViewer } from "../components/SQLViewer";
import { getFieldSummary, getReportSummary } from "../utils/investigation";

function ListPanel({ title, items, tone = "pink" }: { title: string; items: string[]; tone?: "pink" | "amber" | "rose" | "emerald" }) {
  const toneClass = {
    pink: "border-pink-300/15 bg-pink-400/10 text-pink-50",
    amber: "border-amber-300/15 bg-amber-400/10 text-amber-50",
    rose: "border-rose-300/15 bg-rose-400/10 text-rose-50",
    emerald: "border-emerald-300/15 bg-emerald-400/10 text-emerald-50",
  }[tone];

  return (
    <div className={`min-w-0 rounded-2xl border p-4 ${toneClass}`}>
      <h3 className="font-semibold text-white">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 opacity-80">No findings were returned for this section.</p>
      )}
    </div>
  );
}

export function InvestigationResult() {
  const { id } = useParams();
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvestigation() {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        setInvestigation(await getInvestigation(id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load investigation.");
      } finally {
        setLoading(false);
      }
    }

    void loadInvestigation();
  }, [id]);

  const suspiciousLines = useMemo(
    () => investigation?.analysis.suspiciousSqlSnippets.map((item) => item.lineNumber).filter((line) => line > 0) ?? [],
    [investigation],
  );

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-pink-200" />
          <p className="mt-4 text-sm text-slate-400">Loading SQL-based RCA...</p>
        </div>
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="glass-panel rounded-2xl p-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-200" />
          <h1 className="mt-4 text-2xl font-bold text-white">Investigation not available</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{error || "This RCA result was not found in backend storage."}</p>
          <Link to="/new" className="mt-6 inline-flex rounded-2xl bg-[#b00062] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c01878]">
            Create Investigation
          </Link>
        </div>
      </div>
    );
  }

  const { analysis } = investigation;
  const fieldSummary = getFieldSummary(investigation.fieldComparisons);
  const reportSummary = getReportSummary(investigation);
  const assistantMessages = [
    {
      role: "user" as const,
      text: `What does the SQL say about ${fieldSummary} for ${investigation.customerId || "the reported case"}?`,
    },
    {
      role: "assistant" as const,
      text: analysis.issueInterpretation,
    },
    {
      role: "user" as const,
      text: "Which SQL logic looks most suspicious?",
    },
    {
      role: "assistant" as const,
      text: analysis.suspiciousSqlSnippets[0]?.reason || analysis.possibleRootCauses[0] || analysis.summary,
    },
    {
      role: "user" as const,
      text: "What should I manually verify next?",
    },
    {
      role: "assistant" as const,
      text: analysis.recommendedChecks.join(" "),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/new" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-pink-200 hover:text-pink-100">
            <ArrowLeft className="h-4 w-4" />
            Back to Investigation Intake
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-300/80">Investigation {investigation.id}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">SQL-Based RCA Hypothesis</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Generated from issue description, intake values, and selected report SQL only. No source data, portal data, CSRTB data, or SQL execution was used.
          </p>
        </div>
        <div className="rounded-2xl border border-pink-300/20 bg-pink-400/10 px-5 py-4 text-right">
          <div className="flex items-center justify-end gap-2 text-pink-100">
            <Gauge className="h-5 w-5" />
            <span className="text-sm font-semibold">Confidence</span>
          </div>
          <p className="mt-1 text-3xl font-extrabold text-white">{analysis.confidence}</p>
        </div>
      </div>

      <SectionPanel title="Investigation Flow" eyebrow="Current backend workflow">
        <DataLineage
          reportLabel={reportSummary}
          fieldLabel={fieldSummary}
          customerId={investigation.customerId}
          confidence={analysis.confidence}
        />
      </SectionPanel>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-panel min-w-0 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-pink-200" />
            <p className="text-sm font-semibold text-slate-300">Issue Interpretation</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-200">{analysis.issueInterpretation}</p>
        </div>
        <div className="glass-panel min-w-0 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <FileSearch className="h-5 w-5 text-amber-200" />
            <p className="text-sm font-semibold text-slate-300">Analysis Basis</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-200">{analysis.analysisBasis}</p>
        </div>
        <div className="glass-panel min-w-0 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-emerald-200" />
            <p className="text-sm font-semibold text-slate-300">Selected Reports</p>
          </div>
          <p className="mt-4 text-sm font-semibold text-white">{reportSummary}</p>
          <p className="mt-1 text-xs text-slate-500">{investigation.reports.length} report file(s) included</p>
        </div>
      </div>

      <SectionPanel title="Input Context" eyebrow="User-provided investigation details">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["Customer ID", investigation.customerId || "Not provided"],
            ["Priority", investigation.priority],
            ["Reports Selected", String(investigation.reports.length)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {investigation.fieldComparisons.map((field, index) => (
            <div key={`${field.fieldName}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">Field {index + 1}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">Field</p>
                  <p className="mt-1 text-sm font-semibold text-white">{field.fieldName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Expected</p>
                  <p className="mt-1 text-sm font-semibold text-white">{field.expectedValue || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Actual</p>
                  <p className="mt-1 text-sm font-semibold text-white">{field.actualValue || "Not provided"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-pink-300/15 bg-pink-400/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">Issue Description</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">{investigation.issueDescription}</p>
        </div>
      </SectionPanel>

      <SectionPanel title="AI Explanation" eyebrow={`Generated by ${analysis.model}`}>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm leading-7 text-slate-200">{analysis.summary}</p>
        </div>
      </SectionPanel>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <div className="grid gap-6 2xl:grid-cols-2">
            <ListPanel title="Possible SQL Causes" items={analysis.possibleRootCauses} />
            <ListPanel title="Recommended Manual Checks" items={analysis.recommendedChecks} tone="emerald" />
            <ListPanel title="Missing Customer Hypotheses" items={analysis.missingCustomerHypotheses} tone="amber" />
            <ListPanel title="Mismatch Hypotheses" items={analysis.mismatchHypotheses} />
          </div>

          <SectionPanel title="Suspicious SQL Logic" eyebrow="AI-highlighted snippets">
            {analysis.suspiciousSqlSnippets.length > 0 ? (
              <div className="grid gap-3 2xl:grid-cols-2">
                {analysis.suspiciousSqlSnippets.map((item, index) => (
                  <div key={`${item.lineNumber}-${index}`} className="min-w-0 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge>{item.lineNumber > 0 ? `Line ${item.lineNumber}` : "Needs Review"}</Badge>
                      <span className="text-xs text-rose-100">Hypothesis</span>
                    </div>
                    <code className="mt-3 block whitespace-pre-wrap rounded-xl bg-slate-950/70 p-3 font-mono text-xs leading-5 text-rose-50">{item.snippet}</code>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{item.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No specific SQL lines were highlighted.</p>
            )}
          </SectionPanel>

          <SectionPanel title="SQL Script Viewer" eyebrow="Selected report SQL files">
            <div className="space-y-4">
              {investigation.reports.map((report) => (
                <SQLViewer key={report.id} sqlCode={report.sqlCode} suspiciousLines={suspiciousLines} filename={report.filename} />
              ))}
            </div>
          </SectionPanel>
        </div>

        <AIAssistant messages={assistantMessages} />
      </div>

      <SectionPanel title="Limitations" eyebrow="Important">
        <div className="grid gap-3 md:grid-cols-2">
          {analysis.limitations.map((item, index) => (
            <div key={index} className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                <p className="text-sm leading-6 text-amber-50">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionPanel>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-500">
        Created {new Date(investigation.createdAt).toLocaleString()} · Generated {new Date(analysis.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}
