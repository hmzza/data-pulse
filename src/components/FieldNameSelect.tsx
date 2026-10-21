import { useState } from "react";

export function FieldNameSelect({ value, columns, onChange }: { value: string; columns: string[]; onChange: (value: string) => void }) {
  const [custom, setCustom] = useState(false);
  const isCustom = custom || Boolean(value && !columns.includes(value));
  const className = "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-pink-300/50";
  return (
    <div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-300">Field Name</span>
        <select value={isCustom ? "custom" : value ? `column:${value}` : ""} className={className} onChange={(event) => {
          const next = event.target.value;
          setCustom(next === "custom");
          onChange(next.startsWith("column:") ? next.slice(7) : "");
        }}>
          <option value="">Select a column</option>
          {columns.map((column) => <option key={column} value={`column:${column}`}>{column}</option>)}
          <option value="custom">Enter a field manually…</option>
        </select>
      </label>
      {isCustom ? <input aria-label="Custom field name" value={value} onChange={(event) => onChange(event.target.value)} className={className} placeholder="Enter column name" /> : null}
    </div>
  );
}
