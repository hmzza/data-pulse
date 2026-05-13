export type ReportSummary = {
  id: string;
  name: string;
  filename: string;
  createdAt: string;
  updatedAt: string;
  sizeBytes: number;
};

export type Report = ReportSummary & {
  sqlCode: string;
};

export type SqlSnippet = {
  lineNumber: number;
  snippet: string;
  reason: string;
};

export type AnalysisResult = {
  analysisBasis: string;
  issueInterpretation: string;
  summary: string;
  confidence: "Low" | "Medium" | "High";
  possibleRootCauses: string[];
  suspiciousSqlSnippets: SqlSnippet[];
  missingCustomerHypotheses: string[];
  mismatchHypotheses: string[];
  limitations: string[];
  recommendedChecks: string[];
  model: string;
  generatedAt: string;
};

export type Investigation = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  fieldName: string;
  expectedValue: string;
  actualValue: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  issueDescription: string;
  reportId: string;
  report: {
    id: string;
    name: string;
    filename: string;
    sqlCode: string;
  };
  analysis: AnalysisResult;
};

export type InvestigationPayload = {
  customerId: string;
  fieldName: string;
  expectedValue: string;
  actualValue: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  issueDescription: string;
  reportId: string;
};
