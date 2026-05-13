import OpenAI from "openai";
import { z } from "zod";

const rcaSchema = z.object({
  analysisBasis: z.string(),
  issueInterpretation: z.string(),
  summary: z.string(),
  confidence: z.enum(["Low", "Medium", "High"]),
  possibleRootCauses: z.array(z.string()),
  suspiciousSqlSnippets: z.array(
    z.object({
      lineNumber: z.number().int(),
      snippet: z.string(),
      reason: z.string(),
    }),
  ),
  missingCustomerHypotheses: z.array(z.string()),
  mismatchHypotheses: z.array(z.string()),
  limitations: z.array(z.string()),
  recommendedChecks: z.array(z.string()),
});

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "analysisBasis",
    "issueInterpretation",
    "summary",
    "confidence",
    "possibleRootCauses",
    "suspiciousSqlSnippets",
    "missingCustomerHypotheses",
    "mismatchHypotheses",
    "limitations",
    "recommendedChecks",
  ],
  properties: {
    analysisBasis: { type: "string" },
    issueInterpretation: { type: "string" },
    summary: { type: "string" },
    confidence: { type: "string", enum: ["Low", "Medium", "High"] },
    possibleRootCauses: { type: "array", items: { type: "string" } },
    suspiciousSqlSnippets: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["lineNumber", "snippet", "reason"],
        properties: {
          lineNumber: { type: "integer" },
          snippet: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
    missingCustomerHypotheses: { type: "array", items: { type: "string" } },
    mismatchHypotheses: { type: "array", items: { type: "string" } },
    limitations: { type: "array", items: { type: "string" } },
    recommendedChecks: { type: "array", items: { type: "string" } },
  },
};

export async function analyzeInvestigation({ issue, report }) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured on the server.");
    error.status = 503;
    throw error;
  }

  const client = new OpenAI();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const numberedSql = report.sqlCode
    .split(/\r?\n/)
    .map((line, index) => `${index + 1}: ${line}`)
    .join("\n");

  const response = await client.responses.create({
    model,
    instructions: [
      "You are Data Pulse, an internal SQL RCA assistant for a data reporting team.",
      "Analyze only the user-provided issue context and the selected report SQL.",
      "Do not claim that source data, report output data, portal data, CSRTB data, or SQL execution was verified.",
      "Issue description is the most important signal. Use it to infer what kind of SQL logic could cause the problem.",
      "Frame findings as hypotheses and manual checks, not proven root causes.",
      "If the issue is about missing customers, focus on joins, filters, WHERE clauses, GROUP BY, DISTINCT, HAVING, date windows, status filters, and null handling.",
      "If the issue is about mismatched values, focus on CASE expressions, transformations, joins, default values, type casts, aggregations, and precedence.",
    ].join("\n"),
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              "Investigation input:",
              `Customer ID: ${issue.customerId || "Not provided"}`,
              `Field Name: ${issue.fieldName || "Not provided"}`,
              `Expected Value: ${issue.expectedValue || "Not provided"}`,
              `Actual Value: ${issue.actualValue || "Not provided"}`,
              `Priority: ${issue.priority || "Not provided"}`,
              `Issue Description: ${issue.issueDescription}`,
              "",
              `Selected Report: ${report.name}`,
              "Numbered SQL:",
              numberedSql,
            ].join("\n"),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "data_pulse_sql_rca",
        strict: true,
        schema: jsonSchema,
      },
    },
  });

  const parsed = rcaSchema.parse(JSON.parse(response.output_text));
  return {
    ...parsed,
    model,
    generatedAt: new Date().toISOString(),
  };
}
