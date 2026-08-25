import type { Investigation, InvestigationPayload, Report, ReportSummary, User } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "data-pulse-auth-token";
const AUTH_EXPIRED_EVENT = "data-pulse-auth-expired";

type RequestOptions = {
  expireAuthOn401?: boolean;
};

async function request<T>(path: string, init?: RequestInit, options?: RequestOptions): Promise<T> {
  const token = getStoredToken();
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: init?.body instanceof FormData
        ? { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers }
        : { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
    });
  } catch {
    throw new Error("Backend API is not running. Start it with `npm run server` or `npm run dev:all`, then try again.");
  }

  if (!response.ok) {
    if (response.status === 401 && options?.expireAuthOn401) {
      clearStoredToken();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      throw new Error("Session expired. Please sign in again.");
    }
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function subscribeToAuthExpired(callback: () => void) {
  window.addEventListener(AUTH_EXPIRED_EVENT, callback);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, callback);
}

export async function login(input: { username: string; password: string }) {
  const payload = await request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setStoredToken(payload.token);
  return payload;
}

export async function getMe() {
  const payload = await request<{ user: User }>("/auth/me", undefined, { expireAuthOn401: true });
  return payload.user;
}

export async function logout() {
  try {
    await request<void>("/auth/logout", { method: "POST" }, { expireAuthOn401: true });
  } finally {
    clearStoredToken();
  }
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

export async function listUsers() {
  const payload = await request<{ users: User[] }>("/users");
  return payload.users;
}

export async function createUser(input: { username: string; fullName: string; role: User["role"]; password: string; isActive?: boolean }) {
  const payload = await request<{ user: User }>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.user;
}

export async function updateUser(id: string, input: Partial<{ username: string; fullName: string; role: User["role"]; password: string; isActive: boolean }>) {
  const payload = await request<{ user: User }>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return payload.user;
}

export async function deleteUser(id: string) {
  await request<void>(`/users/${id}`, { method: "DELETE" });
}
