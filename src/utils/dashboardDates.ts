export function localDateKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export function withinDateRange(iso: string, start: string, end: string): boolean {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime()) || (start && end && start > end)) return false;
  const key = localDateKey(date);
  return (!start || key >= start) && (!end || key <= end);
}

export function buildDashboardTrend<T extends { createdAt: string; priority: string }>(items: T[], start: string, end: string, groupByMonth = false) {
  const dates = items.map((item) => new Date(item.createdAt)).filter((date) => Number.isFinite(date.getTime()));
  const first = start ? new Date(`${start}T00:00:00`) : dates.length ? new Date(Math.min(...dates.map(Number))) : new Date();
  const last = end ? new Date(`${end}T00:00:00`) : dates.length ? new Date(Math.max(...dates.map(Number))) : new Date();
  first.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  const monthly = groupByMonth || (last.getTime() - first.getTime()) / 86400000 > 90;
  const key = (date: Date) => monthly ? localDateKey(date).slice(0, 7) : localDateKey(date);
  const counts = new Map<string, { investigations: number; highPriority: number }>();
  items.forEach((item) => {
    if (!withinDateRange(item.createdAt, start, end)) return;
    const bucket = key(new Date(item.createdAt));
    const row = counts.get(bucket) ?? { investigations: 0, highPriority: 0 };
    row.investigations += 1;
    if (item.priority === 'High' || item.priority === 'Critical') row.highPriority += 1;
    counts.set(bucket, row);
  });
  const rows = [];
  const cursor = new Date(first);
  if (monthly) cursor.setDate(1);
  while (cursor <= last) {
    rows.push({ day: cursor.toLocaleDateString(undefined, monthly ? { month: 'short', year: 'numeric' } : { month: 'short', day: 'numeric' }), ...(counts.get(key(cursor)) ?? { investigations: 0, highPriority: 0 }) });
    if (monthly) cursor.setMonth(cursor.getMonth() + 1);
    else cursor.setDate(cursor.getDate() + 1);
  }
  return rows;
}
