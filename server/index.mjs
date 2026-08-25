import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { z } from "zod";
import {
  createInvestigation,
  createReport,
  createSession,
  createUser,
  deleteSession,
  deleteReport,
  deleteUser,
  ensureStorage,
  findUserByUsername,
  getInvestigation,
  getReport,
  getSessionUser,
  listInvestigations,
  listReports,
  listUsers,
  storageDir,
  updateReport,
  updateUser,
  verifyPassword,
} from "./storage.mjs";
import { analyzeInvestigation } from "./analysis.mjs";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const configuredOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
]);

function isPrivateNetworkDevOrigin(origin) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" || !/^5\d{3}$/.test(url.port)) {
      return false;
    }

    if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]") {
      return true;
    }

    const octets = url.hostname.split(".").map(Number);
    if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) {
      return false;
    }

    return (
      octets[0] === 10 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168)
    );
  } catch {
    return false;
  }
}

const primaryClientOrigin = configuredOrigins[0] || "http://localhost:5173";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const reportSchema = z.object({
  name: z.string().trim().min(1, "Report name is required."),
  sqlCode: z.string().trim().min(1, "SQL code is required."),
});

const investigationSchema = z.object({
  customerId: z.string().trim().optional().default(""),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  issueDescription: z.string().trim().min(15, "Issue description must include enough detail for analysis."),
  fieldComparisons: z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
              fieldName: typeof item.fieldName === "string" ? item.fieldName : "",
              expectedValue: typeof item.expectedValue === "string" ? item.expectedValue : "",
              actualValue: typeof item.actualValue === "string" ? item.actualValue : "",
            }))
            .filter((item) => item.fieldName || item.expectedValue || item.actualValue)
        : [],
    z.array(
      z.object({
        fieldName: z.string().trim().optional().default(""),
        expectedValue: z.string().trim().optional().default(""),
        actualValue: z.string().trim().optional().default(""),
      }),
    ),
  ),
  reportIds: z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value.filter((item) => typeof item === "string" && item.trim().length > 0)
        : [],
    z.array(z.string().trim().min(1)).min(1, "Select at least one valid report."),
  ),
});

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

const createUserSchema = z.object({
  username: z.string().trim().min(3, "Username is required."),
  fullName: z.string().trim().min(2, "Full name is required."),
  role: z.enum(["super_admin", "analyst"]),
  password: z.string().min(8, "Password must be at least 8 characters."),
  isActive: z.boolean().optional().default(true),
});

const updateUserSchema = z.object({
  username: z.string().trim().min(3).optional(),
  fullName: z.string().trim().min(2).optional(),
  role: z.enum(["super_admin", "analyst"]).optional(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin) || isPrivateNetworkDevOrigin(origin)) {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(async (request, _response, next) => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    request.user = null;
    return next();
  }

  const token = authHeader.slice("Bearer ".length);
  request.user = await getSessionUser(token);
  request.authToken = token;
  next();
});

app.get("/", (_request, response) => {
  response.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Data Pulse API</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #08030a; color: #f8fafc; font-family: Inter, system-ui, sans-serif; }
      main { width: min(560px, calc(100vw - 40px)); border: 1px solid rgba(236, 72, 153, .24); border-radius: 24px; padding: 32px; background: rgba(15, 23, 42, .72); box-shadow: 0 0 45px rgba(176, 0, 98, .24); }
      p { color: #cbd5e1; line-height: 1.7; }
      a { color: #f9a8d4; font-weight: 700; }
      code { color: #f9a8d4; }
    </style>
  </head>
  <body>
    <main>
      <h1>Data Pulse API is running</h1>
      <p>This port is for backend API requests only. Open the app UI at <a href="${primaryClientOrigin}">${primaryClientOrigin}</a>.</p>
      <p>Health check: <code>/api/health</code></p>
    </main>
  </body>
</html>`);
});

app.get("/.well-known/appspecific/com.chrome.devtools.json", (_request, response) => {
  response.status(204).send();
});

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "data-pulse-api",
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
    authConfigured: true,
  });
});

app.post("/api/auth/login", async (request, response, next) => {
  try {
    const payload = loginSchema.parse(request.body);
    const user = await findUserByUsername(payload.username);
    if (!user || !user.isActive || !verifyPassword(user, payload.password)) {
      return response.status(401).json({ error: "Invalid username or password." });
    }

    const session = await createSession(user.id);
    response.json({
      token: session.token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", requireAuth, (request, response) => {
  response.json({ user: request.user });
});

app.post("/api/auth/logout", requireAuth, async (request, response, next) => {
  try {
    await deleteSession(request.authToken);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/users", requireSuperAdmin, async (_request, response, next) => {
  try {
    response.json({ users: await listUsers() });
  } catch (error) {
    next(error);
  }
});

app.post("/api/users", requireSuperAdmin, async (request, response, next) => {
  try {
    const payload = createUserSchema.parse(request.body);
    const user = await createUser(payload);
    response.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

app.put("/api/users/:id", requireSuperAdmin, async (request, response, next) => {
  try {
    const payload = updateUserSchema.parse(request.body);
    const user = await updateUser(request.params.id, payload);
    if (!user) return response.status(404).json({ error: "User not found." });
    response.json({ user });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/users/:id", requireSuperAdmin, async (request, response, next) => {
  try {
    const deleted = await deleteUser(request.params.id);
    if (!deleted) return response.status(404).json({ error: "User not found." });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/reports", requireAuth, async (_request, response, next) => {
  try {
    response.json({ reports: await listReports() });
  } catch (error) {
    next(error);
  }
});

app.post("/api/reports", requireAuth, async (request, response, next) => {
  try {
    const payload = reportSchema.parse(request.body);
    const report = await createReport(payload);
    response.status(201).json({ report });
  } catch (error) {
    next(error);
  }
});

app.post("/api/reports/upload", requireAuth, upload.single("file"), async (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).json({ error: "A .sql file is required." });
    }
    if (!request.file.originalname.toLowerCase().endsWith(".sql")) {
      return response.status(400).json({ error: "Only .sql files are supported." });
    }

    const fallbackName = request.file.originalname.replace(/\.sql$/i, "");
    const payload = reportSchema.parse({
      name: request.body.name || fallbackName,
      sqlCode: request.file.buffer.toString("utf8"),
    });
    const report = await createReport(payload);
    response.status(201).json({ report });
  } catch (error) {
    next(error);
  }
});

app.get("/api/reports/:id", requireAuth, async (request, response, next) => {
  try {
    const report = await getReport(request.params.id);
    if (!report) return response.status(404).json({ error: "Report not found." });
    response.json({ report });
  } catch (error) {
    next(error);
  }
});

app.put("/api/reports/:id", requireAuth, async (request, response, next) => {
  try {
    const payload = reportSchema.parse(request.body);
    const report = await updateReport(request.params.id, payload);
    if (!report) return response.status(404).json({ error: "Report not found." });
    response.json({ report });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/reports/:id", requireAuth, async (request, response, next) => {
  try {
    const deleted = await deleteReport(request.params.id);
    if (!deleted) return response.status(404).json({ error: "Report not found." });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/investigations", requireAuth, async (_request, response, next) => {
  try {
    response.json({ investigations: await listInvestigations() });
  } catch (error) {
    next(error);
  }
});

app.post("/api/investigations", requireAuth, async (request, response, next) => {
  try {
    const issue = investigationSchema.parse(request.body);
    const reports = await Promise.all(issue.reportIds.map((reportId) => getReport(reportId)));
    if (reports.some((report) => !report)) {
      return response.status(404).json({ error: "One or more selected reports were not found." });
    }

    const resolvedReports = reports.filter(Boolean);
    const analysis = await analyzeInvestigation({ issue, reports: resolvedReports });
    const investigation = await createInvestigation({
      ...issue,
      reports: resolvedReports.map((report) => ({
        id: report.id,
        name: report.name,
        filename: report.filename,
        sqlCode: report.sqlCode,
      })),
      analysis,
    });

    response.status(201).json({ investigation });
  } catch (error) {
    next(error);
  }
});

app.get("/api/investigations/:id", requireAuth, async (request, response, next) => {
  try {
    const investigation = await getInvestigation(request.params.id);
    if (!investigation) return response.status(404).json({ error: "Investigation not found." });
    response.json({ investigation });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  if (error instanceof z.ZodError) {
    return response.status(400).json({ error: error.issues[0]?.message || "Invalid request." });
  }

  const status = error.status || 500;
  const message = status === 500 ? "Unexpected server error." : error.message;
  if (status === 500) {
    console.error(error);
  }
  response.status(status).json({ error: message });
});

ensureStorage()
  .then(() => {
    app.listen(port, () => {
      console.log(`Data Pulse API running on http://localhost:${port}`);
      console.log(`Data Pulse storage path: ${storageDir}`);
      console.log(`Data Pulse admin username: ${(process.env.ADMIN_USERNAME || "superadmin").trim().toLowerCase()}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize storage.", error);
    process.exit(1);
  });

function requireAuth(request, response, next) {
  if (!request.user) {
    return response.status(401).json({ error: "Authentication required." });
  }
  next();
}

function requireSuperAdmin(request, response, next) {
  if (!request.user) {
    return response.status(401).json({ error: "Authentication required." });
  }
  if (request.user.role !== "super_admin") {
    return response.status(403).json({ error: "Super admin access is required." });
  }
  next();
}
