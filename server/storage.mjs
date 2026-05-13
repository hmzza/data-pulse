import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
export const storageDir = path.join(rootDir, "storage");
export const reportDir = path.join(storageDir, "reports");
const reportsPath = path.join(storageDir, "reports.json");
const investigationsPath = path.join(storageDir, "investigations.json");

export async function ensureStorage() {
  await mkdir(reportDir, { recursive: true });
  await ensureJsonFile(reportsPath, []);
  await ensureJsonFile(investigationsPath, []);
}

async function ensureJsonFile(filePath, fallback) {
  try {
    await readJson(filePath);
  } catch {
    await writeJson(filePath, fallback);
  }
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function listReports() {
  await ensureStorage();
  return readJson(reportsPath);
}

export async function getReport(id) {
  const reports = await listReports();
  const report = reports.find((item) => item.id === id);
  if (!report) return null;
  const sqlCode = await readFile(path.join(reportDir, report.filename), "utf8");
  return { ...report, sqlCode };
}

export async function createReport({ name, sqlCode }) {
  await ensureStorage();
  const reports = await listReports();
  const now = new Date().toISOString();
  const id = `REP-${randomUUID().slice(0, 8).toUpperCase()}`;
  const filename = `${id}-${slugify(name)}.sql`;
  const report = {
    id,
    name: name.trim(),
    filename,
    createdAt: now,
    updatedAt: now,
    sizeBytes: Buffer.byteLength(sqlCode, "utf8"),
  };

  await writeFile(path.join(reportDir, filename), normalizeSql(sqlCode), "utf8");
  await writeJson(reportsPath, [report, ...reports]);
  return { ...report, sqlCode: normalizeSql(sqlCode) };
}

export async function updateReport(id, { name, sqlCode }) {
  await ensureStorage();
  const reports = await listReports();
  const index = reports.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = reports[index];
  const nextName = name.trim();
  const nextFilename = `${id}-${slugify(nextName)}.sql`;
  const currentPath = path.join(reportDir, current.filename);
  const nextPath = path.join(reportDir, nextFilename);
  const normalizedSql = normalizeSql(sqlCode);

  if (current.filename !== nextFilename) {
    try {
      await rename(currentPath, nextPath);
    } catch {
      await writeFile(nextPath, normalizedSql, "utf8");
    }
  }
  await writeFile(nextPath, normalizedSql, "utf8");

  const updated = {
    ...current,
    name: nextName,
    filename: nextFilename,
    updatedAt: new Date().toISOString(),
    sizeBytes: Buffer.byteLength(normalizedSql, "utf8"),
  };

  reports[index] = updated;
  await writeJson(reportsPath, reports);
  return { ...updated, sqlCode: normalizedSql };
}

export async function deleteReport(id) {
  await ensureStorage();
  const reports = await listReports();
  const report = reports.find((item) => item.id === id);
  if (!report) return false;
  await unlink(path.join(reportDir, report.filename)).catch(() => undefined);
  await writeJson(
    reportsPath,
    reports.filter((item) => item.id !== id),
  );
  return true;
}

export async function listInvestigations() {
  await ensureStorage();
  return readJson(investigationsPath);
}

export async function getInvestigation(id) {
  const investigations = await listInvestigations();
  return investigations.find((item) => item.id === id) ?? null;
}

export async function createInvestigation(payload) {
  await ensureStorage();
  const investigations = await listInvestigations();
  const now = new Date().toISOString();
  const investigation = {
    id: `INV-${randomUUID().slice(0, 8).toUpperCase()}`,
    status: "Analyzed",
    createdAt: now,
    updatedAt: now,
    ...payload,
  };
  await writeJson(investigationsPath, [investigation, ...investigations]);
  return investigation;
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return slug || "report";
}

function normalizeSql(sqlCode) {
  return sqlCode.endsWith("\n") ? sqlCode : `${sqlCode}\n`;
}
