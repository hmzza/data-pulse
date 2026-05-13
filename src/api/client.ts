import type { Investigation, InvestigationPayload, Report, ReportSummary } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: init?.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Backend API is not running. Start it with `npm run server` or `npm run dev:all`, then try again.");
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function listReports() {
  const payload = await request<{ reports: ReportSummary[] }>("/reports");
  return payload.reports;
}

export async function getHealth() {
  return request<{ ok: boolean; service: string; openAiConfigured: boolean }>("/health");
}

export async function getReport(id: string) {
  const payload = await request<{ report: Report }>(`/reports/${id}`);
  return payload.report;
}

export async function createReport(input: { name: string; sqlCode: string }) {
  const payload = await request<{ report: Report }>("/reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.report;
}

export async function uploadReport(input: { name?: string; file: File }) {
  const formData = new FormData();
  formData.append("file", input.file);
  if (input.name) formData.append("name", input.name);
  const payload = await request<{ report: Report }>("/reports/upload", {
    method: "POST",
    body: formData,
  });
  return payload.report;
}

export async function updateReport(id: string, input: { name: string; sqlCode: string }) {
  const payload = await request<{ report: Report }>(`/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return payload.report;
}

export async function deleteReport(id: string) {
  await request<void>(`/reports/${id}`, { method: "DELETE" });
}

export async function createInvestigation(input: InvestigationPayload) {
  const payload = await request<{ investigation: Investigation }>("/investigations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.investigation;
}

export async function getInvestigation(id: string) {
  const payload = await request<{ investigation: Investigation }>(`/investigations/${id}`);
  return payload.investigation;
}

export async function listInvestigations() {
  const payload = await request<{ investigations: Investigation[] }>("/investigations");
  return payload.investigations;
}
