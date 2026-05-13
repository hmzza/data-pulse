import { AlertCircle, CheckCircle2, ClipboardCopy, Eye, FileCode2, Loader2, RefreshCw, Save, Search, SlidersHorizontal, Trash2, Upload, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { SectionPanel } from "../components/SectionPanel";
import { createReport, deleteReport, getReport, listReports, updateReport, uploadReport } from "../api/client";
import type { Report, ReportSummary } from "../api/types";

const emptySql = `SELECT
  customer_id,
  customer_status,
  report_cycle
FROM source_customer_report
WHERE report_cycle = CURRENT_DATE;`;

export function Reports() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [name, setName] = useState("");
  const [sqlCode, setSqlCode] = useState(emptySql);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "created">("recent");

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextReports = reports.filter((report) =>
      `${report.name} ${report.filename} ${report.id}`.toLowerCase().includes(normalizedQuery),
    );

    return nextReports.sort((left, right) => {
      if (sortBy === "name") {
        return left.name.localeCompare(right.name);
      }
      if (sortBy === "created") {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }, [query, reports, sortBy]);

  useEffect(() => {
    void refreshReports();
  }, []);

  async function refreshReports() {
    setLoading(true);
    try {
      setReports(await listReports());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const report = await createReport({ name, sqlCode });
      setName("");
      setSqlCode(emptySql);
      setSelected(report);
      await refreshReports();
      setMessage(`Report saved: ${report.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save report.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uploadFile) {
      setError("Select a .sql file first.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const report = await uploadReport({ name: uploadName, file: uploadFile });
      setUploadFile(null);
      setUploadName("");
      setSelected(report);
      await refreshReports();
      setMessage(`Report uploaded: ${report.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload report.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSelect(id: string) {
    setError("");
    setMessage("");
    try {
      setSelected(await getReport(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load report.");
    }
  }

  async function handleUpdate() {
    if (!selected) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const report = await updateReport(selected.id, { name: selected.name, sqlCode: selected.sqlCode });
      setSelected(report);
      await refreshReports();
      setMessage(`Report updated: ${report.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update report.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    setMessage("");
    try {
      await deleteReport(id);
      if (selected?.id === id) setSelected(null);
      setMessage("Report deleted.");
      await refreshReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete report.");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setUploadFile(event.target.files?.[0] ?? null);
  }

  async function copySelectedSql() {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.sqlCode);
    setMessage("SQL copied to clipboard.");
  }

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div className="fixed right-4 top-24 z-50 w-[calc(100vw-2rem)] max-w-md">
          <div
            className={`glass-panel rounded-2xl border p-4 shadow-2xl ${
              error ? "border-rose-300/30 bg-rose-950/90 text-rose-50" : "border-emerald-300/30 bg-emerald-950/90 text-emerald-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {error ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-200" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{error ? "Action failed" : "Action completed"}</p>
                <p className="mt-1 text-sm leading-6 opacity-90">{error || message}</p>
              </div>
              <button
                onClick={() => {
                  setError("");
                  setMessage("");
                }}
                className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-300/80">Report library</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Report SQL Management</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Upload or paste report SQL files. These reports become selectable during investigation intake.
          </p>
        </div>
        <button
          onClick={refreshReports}
          className="flex items-center gap-2 rounded-2xl border border-pink-300/20 bg-pink-400/10 px-4 py-3 text-sm font-semibold text-pink-100 transition hover:bg-pink-400/15"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionPanel title="Paste SQL Code" eyebrow="Create .sql file">
            <form onSubmit={handleCreate} className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Report Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-pink-300/50 focus:shadow-glow"
                  placeholder="Customer Status Reconciliation"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">SQL Code</span>
                <textarea
                  value={sqlCode}
                  onChange={(event) => setSqlCode(event.target.value)}
                  className="mt-2 min-h-64 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-pink-300/50 focus:shadow-glow"
                />
              </label>
              <button className="flex items-center justify-center gap-2 rounded-2xl bg-[#b00062] px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(176,0,98,0.28)] transition hover:-translate-y-0.5 hover:bg-[#c01878]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Report
              </button>
            </form>
          </SectionPanel>

          <SectionPanel title="Upload SQL File" eyebrow="Existing .sql">
            <form onSubmit={handleUpload} className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Display Name</span>
                <input
                  value={uploadName}
                  onChange={(event) => setUploadName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-pink-300/50 focus:shadow-glow"
                  placeholder="Optional, defaults to filename"
                />
              </label>
              <label className="block rounded-2xl border border-dashed border-pink-300/25 bg-pink-400/10 p-5">
                <span className="flex items-center gap-2 text-sm font-semibold text-pink-100">
                  <Upload className="h-4 w-4" />
                  Choose .sql file
                </span>
                <input type="file" accept=".sql" onChange={handleFileChange} className="mt-4 w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-[#b00062] file:px-4 file:py-2 file:font-semibold file:text-white" />
                <p className="mt-3 text-xs text-slate-500">{uploadFile ? uploadFile.name : "No file selected"}</p>
              </label>
              <button className="flex items-center justify-center gap-2 rounded-2xl bg-[#b00062] px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(176,0,98,0.28)] transition hover:-translate-y-0.5 hover:bg-[#c01878]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload Report
              </button>
            </form>
          </SectionPanel>
        </div>

        <div className="space-y-6">
          <SectionPanel title="Saved Reports" eyebrow={`${reports.length} available`}>
            <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 transition focus-within:border-pink-300/50">
                <Search className="h-5 w-5 text-pink-200" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
                  placeholder="Search report name, filename, ID..."
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-200">
                <SlidersHorizontal className="h-4 w-4 text-pink-200" />
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "recent" | "name" | "created")} className="w-full bg-transparent outline-none">
                  <option value="recent">Last Updated</option>
                  <option value="created">Created Date</option>
                  <option value="name">Name A-Z</option>
                </select>
              </label>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">
                  <Loader2 className="h-5 w-5 animate-spin text-pink-200" />
                  Loading reports...
                </div>
              ) : null}
              {!loading && filteredReports.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
                  {reports.length === 0 ? "No reports uploaded yet." : "No reports match the current search."}
                </div>
              ) : null}
              {filteredReports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-pink-300/25 hover:bg-pink-400/10">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="h-4 w-4 shrink-0 text-pink-200" />
                        <p className="truncate font-semibold text-white">{report.name}</p>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">{report.filename}</p>
                      <p className="mt-2 text-xs text-slate-500">Updated {new Date(report.updatedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleSelect(report.id)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:text-pink-100" aria-label="View report">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(report.id)} className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-2 text-rose-100 transition hover:bg-rose-400/15" aria-label="Delete report">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionPanel>

          <SectionPanel title="View Or Edit SQL" eyebrow={selected ? selected.filename : "Select report"}>
            {selected ? (
              <div className="space-y-4">
                <input
                  value={selected.name}
                  onChange={(event) => setSelected({ ...selected, name: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition focus:border-pink-300/50 focus:shadow-glow"
                />
                <textarea
                  value={selected.sqlCode}
                  onChange={(event) => setSelected({ ...selected, sqlCode: event.target.value })}
                  className="min-h-[420px] w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-pink-300/50 focus:shadow-glow"
                />
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleUpdate} className="flex items-center gap-2 rounded-2xl bg-[#b00062] px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(176,0,98,0.28)] transition hover:-translate-y-0.5 hover:bg-[#c01878]">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                  <button onClick={copySelectedSql} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-pink-300/25 hover:text-pink-100">
                    <ClipboardCopy className="h-4 w-4" />
                    Copy SQL
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
                Select a report to view, edit, copy, or delete its saved SQL.
              </div>
            )}
          </SectionPanel>
        </div>
      </div>
    </div>
  );
}
