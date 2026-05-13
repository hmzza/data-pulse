import type { FieldComparison, Investigation } from "../api/types";

export function getFieldSummary(fieldComparisons: FieldComparison[] = []) {
  if (fieldComparisons.length === 0) return "SQL issue";
  if (fieldComparisons.length === 1) return fieldComparisons[0].fieldName || "SQL issue";
  return `${fieldComparisons[0].fieldName || "Field"} +${fieldComparisons.length - 1}`;
}

export function getReportSummary(investigation: Pick<Investigation, "reports">) {
  if (investigation.reports.length === 0) return "No report";
  if (investigation.reports.length === 1) return investigation.reports[0].name;
  return `${investigation.reports[0].name} +${investigation.reports.length - 1}`;
}
