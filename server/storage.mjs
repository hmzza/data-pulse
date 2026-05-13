import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
export const storageDir = path.join(rootDir, "storage");
export const reportDir = path.join(storageDir, "reports");
const reportsPath = path.join(storageDir, "reports.json");
const investigationsPath = path.join(storageDir, "investigations.json");
const usersPath = path.join(storageDir, "users.json");
const sessionsPath = path.join(storageDir, "sessions.json");

export async function ensureStorage() {
  await mkdir(reportDir, { recursive: true });
  await ensureJsonFile(reportsPath, []);
  await ensureJsonFile(investigationsPath, []);
  await ensureJsonFile(usersPath, []);
  await ensureJsonFile(sessionsPath, []);
  await ensureSuperAdmin();
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

export async function listUsers() {
  await ensureStorage();
  const users = await readJson(usersPath);
  return users.map(sanitizeUser);
}

export async function findUserByUsername(username) {
  await ensureStorage();
  const users = await readJson(usersPath);
  return users.find((item) => item.username.toLowerCase() === username.trim().toLowerCase()) ?? null;
}

export async function createUser({ username, fullName, role, password, isActive = true }) {
  await ensureStorage();
  const users = await readJson(usersPath);
  const normalizedUsername = username.trim().toLowerCase();

  if (users.some((item) => item.username === normalizedUsername)) {
    const error = new Error("Username already exists.");
    error.status = 409;
    throw error;
  }

  const now = new Date().toISOString();
  const { passwordHash, passwordSalt } = hashPassword(password);
  const user = {
    id: `USR-${randomUUID().slice(0, 8).toUpperCase()}`,
    username: normalizedUsername,
    fullName: fullName.trim(),
    role,
    isActive,
    createdAt: now,
    updatedAt: now,
    passwordHash,
    passwordSalt,
  };

  await writeJson(usersPath, [user, ...users]);
  return sanitizeUser(user);
}

export async function updateUser(id, changes) {
  await ensureStorage();
  const users = await readJson(usersPath);
  const index = users.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = users[index];
  const next = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

  if (typeof changes.fullName === "string") next.fullName = changes.fullName.trim();
  if (typeof changes.role === "string") next.role = changes.role;
  if (typeof changes.isActive === "boolean") next.isActive = changes.isActive;
  if (typeof changes.password === "string" && changes.password.trim()) {
    const { passwordHash, passwordSalt } = hashPassword(changes.password);
    next.passwordHash = passwordHash;
    next.passwordSalt = passwordSalt;
  }

  if (typeof changes.username === "string") {
    const normalizedUsername = changes.username.trim().toLowerCase();
    const conflicting = users.find((item) => item.username === normalizedUsername && item.id !== id);
    if (conflicting) {
      const error = new Error("Username already exists.");
      error.status = 409;
      throw error;
    }
    next.username = normalizedUsername;
  }

  users[index] = next;
  await writeJson(usersPath, users);
  return sanitizeUser(next);
}

export async function deleteUser(id) {
  await ensureStorage();
  const users = await readJson(usersPath);
  const user = users.find((item) => item.id === id);
  if (!user) return false;
  if (user.role === "super_admin") {
    const admins = users.filter((item) => item.role === "super_admin");
    if (admins.length <= 1) {
      const error = new Error("At least one super admin account must remain.");
      error.status = 400;
      throw error;
    }
  }

  await writeJson(
    usersPath,
    users.filter((item) => item.id !== id),
  );

  const sessions = await readJson(sessionsPath);
  await writeJson(
    sessionsPath,
    sessions.filter((item) => item.userId !== id),
  );
  return true;
}

export function verifyPassword(user, password) {
  const candidateHash = scryptSync(password, user.passwordSalt, 64);
  const storedHash = Buffer.from(user.passwordHash, "hex");
  return candidateHash.length === storedHash.length && timingSafeEqual(candidateHash, storedHash);
}

export async function createSession(userId) {
  await ensureStorage();
  const sessions = await readJson(sessionsPath);
  const session = {
    token: randomBytes(32).toString("hex"),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await writeJson(sessionsPath, [session, ...sessions]);
  return session;
}

export async function getSessionUser(token) {
  await ensureStorage();
  const sessions = await readJson(sessionsPath);
  const session = sessions.find((item) => item.token === token);
  if (!session) return null;

  const users = await readJson(usersPath);
  const user = users.find((item) => item.id === session.userId);
  if (!user || !user.isActive) return null;

  session.updatedAt = new Date().toISOString();
  await writeJson(sessionsPath, sessions);
  return sanitizeUser(user);
}

export async function deleteSession(token) {
  await ensureStorage();
  const sessions = await readJson(sessionsPath);
  await writeJson(
    sessionsPath,
    sessions.filter((item) => item.token !== token),
  );
}

async function ensureSuperAdmin() {
  const users = await readJson(usersPath);
  const username = (process.env.ADMIN_USERNAME || "superadmin").trim().toLowerCase();
  const fullName = (process.env.ADMIN_FULL_NAME || "Super Admin").trim();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const now = new Date().toISOString();
  const { passwordHash, passwordSalt } = hashPassword(password);
  const existingIndex = users.findIndex((item) => item.username === username);

  if (existingIndex >= 0) {
    const existingUser = users[existingIndex];
    users[existingIndex] = {
      ...existingUser,
      username,
      fullName,
      role: "super_admin",
      isActive: true,
      updatedAt: now,
      passwordHash,
      passwordSalt,
    };
    await writeJson(usersPath, users);
    return;
  }

  await writeJson(usersPath, [
    {
      id: `USR-${randomUUID().slice(0, 8).toUpperCase()}`,
      username,
      fullName,
      role: "super_admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      passwordHash,
      passwordSalt,
    },
    ...users,
  ]);
}

function hashPassword(password) {
  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(password, passwordSalt, 64).toString("hex");
  return { passwordHash, passwordSalt };
}

function sanitizeUser(user) {
  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
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
