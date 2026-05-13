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

export type FieldComparison = {
  fieldName: string;
  expectedValue: string;
  actualValue: string;
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
  priority: "Low" | "Medium" | "High" | "Critical";
  issueDescription: string;
  fieldComparisons: FieldComparison[];
  reportIds: string[];
  reports: Array<{
    id: string;
    name: string;
    filename: string;
    sqlCode: string;
  }>;
  analysis: AnalysisResult;
};

export type InvestigationPayload = {
  customerId: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  issueDescription: string;
  fieldComparisons: FieldComparison[];
  reportIds: string[];
};

export type User = {
  id: string;
  username: string;
  fullName: string;
  role: "super_admin" | "analyst";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
