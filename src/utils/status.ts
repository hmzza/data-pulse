export function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("resolved") || normalized.includes("passed")) {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  }
  if (normalized.includes("open") || normalized.includes("review")) {
    return "border-pink-400/25 bg-pink-400/10 text-pink-200";
  }
  if (normalized.includes("fail") || normalized.includes("critical")) {
    return "border-rose-400/25 bg-rose-400/10 text-rose-200";
  }
  if (normalized.includes("high") || normalized.includes("medium")) {
    return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  }
  return "border-slate-400/20 bg-slate-400/10 text-slate-200";
}

export function priorityClass(priority: string) {
  const normalized = priority.toLowerCase();
  if (normalized === "critical") return "border-rose-400/30 bg-rose-500/15 text-rose-100";
  if (normalized === "high") return "border-amber-400/30 bg-amber-500/15 text-amber-100";
  if (normalized === "medium") return "border-pink-400/30 bg-pink-500/15 text-pink-100";
  return "border-slate-400/20 bg-slate-500/15 text-slate-200";
}
