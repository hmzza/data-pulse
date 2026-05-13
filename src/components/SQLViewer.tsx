import { AlertTriangle, Code2 } from "lucide-react";

function highlightSql(code: string) {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/(--.*)$/g, '<span class="sql-comment">$1</span>')
    .replace(/\b(SELECT|CASE|WHEN|THEN|ELSE|END|AS|FROM|LEFT|JOIN|ON|WHERE|AND|IS|NULL)\b/g, '<span class="sql-keyword">$1</span>')
    .replace(/\b(COUNT|SUM|COALESCE|CAST)\b/g, '<span class="sql-function">$1</span>')
    .replace(/('[^']*')/g, '<span class="sql-string">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="sql-number">$1</span>');
}

type SQLViewerProps = {
  sqlCode?: string;
  suspiciousLines?: number[];
  filename?: string;
};

export function SQLViewer({ sqlCode, suspiciousLines = [], filename = "REPORT_CUSTOMER_STATUS.sql" }: SQLViewerProps) {
  const normalizedSql = sqlCode ?? "";
  const lines = normalizedSql
    ? normalizedSql.split(/\r?\n/).map((code, index) => ({
        number: index + 1,
        code,
        suspicious: suspiciousLines.includes(index + 1),
      }))
    : [];
  const firstSuspiciousLine = lines.find((line) => line.suspicious)?.number;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/80 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-pink-200" />
          <p className="text-sm font-semibold text-slate-100">{filename}</p>
        </div>
        {firstSuspiciousLine ? (
          <div className="flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-100">
            <AlertTriangle className="h-3.5 w-3.5" />
            Suspicious line {firstSuspiciousLine}
          </div>
        ) : null}
      </div>
      <div className="max-h-[430px] overflow-auto p-3 font-mono text-sm leading-6">
        {lines.length > 0 ? (
          lines.map((line) => (
            <div
              key={line.number}
              className={`grid grid-cols-[3rem_1fr] rounded-lg px-2 transition ${
                line.suspicious ? "border border-rose-400/25 bg-rose-500/15 shadow-[0_0_28px_rgba(244,63,94,0.14)]" : "hover:bg-white/5"
              }`}
            >
              <span className={`select-none pr-4 text-right ${line.suspicious ? "text-rose-200" : "text-slate-600"}`}>{line.number}</span>
              <code className="whitespace-pre text-slate-200" dangerouslySetInnerHTML={{ __html: highlightSql(line.code) }} />
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-400">No SQL content is available for this report.</div>
        )}
      </div>
    </div>
  );
}
