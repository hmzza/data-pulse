import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/Badge";
import { SectionPanel } from "../components/SectionPanel";
import { recentInvestigations } from "../data/mockData";
import { priorityClass } from "../utils/status";

export function History() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const filteredRows = useMemo(() => {
    return recentInvestigations.filter((item) => {
      const matchesQuery = `${item.id} ${item.customerId} ${item.issueType} ${item.rcaResult}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "All" || item.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Investigation archive</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Investigation History</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Review prior RCA records with local mock search and status filters.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:text-cyan-100">
          <SlidersHorizontal className="h-4 w-4" />
          Configure Columns
        </button>
      </div>

      <SectionPanel title="RCA Records" eyebrow="Search and filter" action={<Filter className="h-5 w-5 text-cyan-200" />}>
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 transition focus-within:border-cyan-300/50">
            <Search className="h-5 w-5 text-cyan-200" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
              placeholder="Search ID, customer, issue, RCA result..."
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 outline-none transition focus:border-cyan-300/50"
          >
            <option>All</option>
            <option>Open</option>
            <option>In Review</option>
            <option>Resolved</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="pb-3 font-semibold">Investigation ID</th>
                <th className="pb-3 font-semibold">Customer ID</th>
                <th className="pb-3 font-semibold">Issue Type</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Created Date</th>
                <th className="pb-3 font-semibold">RCA Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredRows.map((item) => (
                <tr key={item.id} className="transition hover:bg-white/5">
                  <td className="py-4 font-semibold text-cyan-100">{item.id}</td>
                  <td className="py-4 text-slate-300">{item.customerId}</td>
                  <td className="py-4 text-slate-300">{item.issueType}</td>
                  <td className="py-4">
                    <Badge>{item.status}</Badge>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass(item.priority)}`}>{item.priority}</span>
                  </td>
                  <td className="py-4 text-slate-300">{item.createdDate}</td>
                  <td className="py-4 font-medium text-white">{item.rcaResult}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
            No mock investigations match the current filters.
          </div>
        ) : null}
      </SectionPanel>
    </div>
  );
}
