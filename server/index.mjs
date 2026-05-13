import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { z } from "zod";
import {
  createInvestigation,
  createReport,
  deleteReport,
  ensureStorage,
  getInvestigation,
  getReport,
  listInvestigations,
  listReports,
  updateReport,
} from "./storage.mjs";
import { analyzeInvestigation } from "./analysis.mjs";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
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
  fieldName: z.string().trim().optional().default(""),
  expectedValue: z.string().trim().optional().default(""),
  actualValue: z.string().trim().optional().default(""),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  issueDescription: z.string().trim().min(15, "Issue description must include enough detail for analysis."),
  reportId: z.string().trim().min(1, "Report selection is required."),
});

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "5mb" }));

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
      <p>This port is for backend API requests only. Open the app UI at <a href="${clientOrigin}">${clientOrigin}</a>.</p>
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
  });
});

app.get("/api/reports", async (_request, response, next) => {
  try {
    response.json({ reports: await listReports() });
  } catch (error) {
    next(error);
  }
});

app.post("/api/reports", async (request, response, next) => {
  try {
    const payload = reportSchema.parse(request.body);
    const report = await createReport(payload);
    response.status(201).json({ report });
  } catch (error) {
    next(error);
  }
});

app.post("/api/reports/upload", upload.single("file"), async (request, response, next) => {
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

app.get("/api/reports/:id", async (request, response, next) => {
  try {
    const report = await getReport(request.params.id);
    if (!report) return response.status(404).json({ error: "Report not found." });
    response.json({ report });
  } catch (error) {
    next(error);
  }
});

app.put("/api/reports/:id", async (request, response, next) => {
  try {
    const payload = reportSchema.parse(request.body);
    const report = await updateReport(request.params.id, payload);
    if (!report) return response.status(404).json({ error: "Report not found." });
    response.json({ report });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/reports/:id", async (request, response, next) => {
  try {
    const deleted = await deleteReport(request.params.id);
    if (!deleted) return response.status(404).json({ error: "Report not found." });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/investigations", async (_request, response, next) => {
  try {
    response.json({ investigations: await listInvestigations() });
  } catch (error) {
    next(error);
  }
});

app.post("/api/investigations", async (request, response, next) => {
  try {
    const issue = investigationSchema.parse(request.body);
    const report = await getReport(issue.reportId);
    if (!report) return response.status(404).json({ error: "Selected report was not found." });

    const analysis = await analyzeInvestigation({ issue, report });
    const investigation = await createInvestigation({
      ...issue,
      report: {
        id: report.id,
        name: report.name,
        filename: report.filename,
        sqlCode: report.sqlCode,
      },
      analysis,
    });

    response.status(201).json({ investigation });
  } catch (error) {
    next(error);
  }
});

app.get("/api/investigations/:id", async (request, response, next) => {
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
    });
  })
  .catch((error) => {
    console.error("Failed to initialize storage.", error);
    process.exit(1);
  });
