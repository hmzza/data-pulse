import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  GitBranch,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export const metrics = [
  {
    label: "Total Issues",
    value: "248",
    delta: "+18 this week",
    tone: "pink",
    icon: Activity,
  },
  {
    label: "Open Issues",
    value: "42",
    delta: "11 high priority",
    tone: "amber",
    icon: Clock3,
  },
  {
    label: "Resolved Issues",
    value: "186",
    delta: "74.8% closure rate",
    tone: "emerald",
    icon: CheckCircle2,
  },
  {
    label: "High Priority",
    value: "17",
    delta: "3 require RCA review",
    tone: "rose",
    icon: ShieldAlert,
  },
];

export const issueTrendData = [
  { day: "Mon", open: 24, resolved: 18, high: 6 },
  { day: "Tue", open: 31, resolved: 22, high: 8 },
  { day: "Wed", open: 28, resolved: 24, high: 7 },
  { day: "Thu", open: 36, resolved: 29, high: 10 },
  { day: "Fri", open: 42, resolved: 34, high: 11 },
  { day: "Sat", open: 27, resolved: 20, high: 5 },
  { day: "Sun", open: 21, resolved: 17, high: 4 },
];

export const severityData = [
  { name: "Critical", value: 11 },
  { name: "High", value: 17 },
  { name: "Medium", value: 48 },
  { name: "Low", value: 26 },
];

export const investigationVolume = [
  { month: "Jan", investigations: 72 },
  { month: "Feb", investigations: 88 },
  { month: "Mar", investigations: 104 },
  { month: "Apr", investigations: 96 },
  { month: "May", investigations: 128 },
  { month: "Jun", investigations: 144 },
];

export const recentInvestigations = [
  {
    id: "RCA-1048",
    customerId: "CUST-84721",
    issueType: "Customer status mismatch",
    status: "Open",
    priority: "High",
    createdDate: "2026-05-10",
    rcaResult: "Transformation Logic Issue",
    confidence: "High",
  },
  {
    id: "RCA-1047",
    customerId: "CUST-39218",
    issueType: "Incorrect CSRTB value",
    status: "Resolved",
    priority: "Medium",
    createdDate: "2026-05-09",
    rcaResult: "Source Data Drift",
    confidence: "Medium",
  },
  {
    id: "RCA-1046",
    customerId: "CUST-11803",
    issueType: "Missing entry",
    status: "In Review",
    priority: "High",
    createdDate: "2026-05-08",
    rcaResult: "Join Filter Exclusion",
    confidence: "High",
  },
  {
    id: "RCA-1045",
    customerId: "CUST-70942",
    issueType: "Data violation",
    status: "Resolved",
    priority: "Critical",
    createdDate: "2026-05-07",
    rcaResult: "Report Script Regression",
    confidence: "High",
  },
  {
    id: "RCA-1044",
    customerId: "CUST-53019",
    issueType: "Changed entry",
    status: "Open",
    priority: "Low",
    createdDate: "2026-05-06",
    rcaResult: "Pending analysis",
    confidence: "Low",
  },
  {
    id: "RCA-1043",
    customerId: "CUST-27005",
    issueType: "Customer status mismatch",
    status: "Resolved",
    priority: "Medium",
    createdDate: "2026-05-05",
    rcaResult: "Temporary Table Refresh Delay",
    confidence: "Medium",
  },
];

export const flowSteps = [
  {
    title: "Source Data",
    subtitle: "CRM_STATUS_FEED",
    status: "ACTIVE",
    tone: "emerald",
    icon: Database,
  },
  {
    title: "Transformation",
    subtitle: "REPORT_CUSTOMER_STATUS.sql",
    status: "CASE rule changed",
    tone: "rose",
    icon: GitBranch,
  },
  {
    title: "Report Output",
    subtitle: "TMP_CUSTOMER_RPT",
    status: "INACTIVE",
    tone: "amber",
    icon: Activity,
  },
  {
    title: "CSRTB",
    subtitle: "Customer reporting table",
    status: "INACTIVE",
    tone: "pink",
    icon: Sparkles,
  },
];

export const customerInfo = [
  { label: "Customer ID", value: "CUST-84721" },
  { label: "Customer Segment", value: "Enterprise Banking" },
  { label: "Region", value: "North America" },
  { label: "Report Name", value: "Customer Status Reconciliation" },
  { label: "Investigation ID", value: "RCA-1048" },
  { label: "Created By", value: "DWH Ops Desk" },
];

export const comparisonRows = [
  {
    label: "Source Data",
    system: "CRM_STATUS_FEED",
    field: "customer_status",
    expected: "ACTIVE",
    actual: "ACTIVE",
    status: "Passed",
  },
  {
    label: "Report Output Data",
    system: "TMP_CUSTOMER_RPT",
    field: "customer_status",
    expected: "ACTIVE",
    actual: "INACTIVE",
    status: "Failed",
  },
  {
    label: "CSRTB Data",
    system: "CSRTB_CUSTOMER",
    field: "customer_status",
    expected: "ACTIVE",
    actual: "INACTIVE",
    status: "Failed",
  },
];

export const validationResults = [
  {
    rule: "Source row exists",
    result: "Passed",
    details: "Customer record available in CRM source extract.",
  },
  {
    rule: "Expected value preserved",
    result: "Failed",
    details: "ACTIVE source value converted before report output stage.",
  },
  {
    rule: "CSRTB sync completed",
    result: "Passed",
    details: "CSRTB load completed within SLA window.",
  },
  {
    rule: "Transformation logic anomaly",
    result: "Failed",
    details: "CASE branch maps ACTIVE to INACTIVE when dormant flag is null.",
  },
];

export const assistantMessages = [
  {
    role: "user",
    text: "Why did status become inactive?",
  },
  {
    role: "assistant",
    text: "Based on the SQL logic, the CASE condition converted ACTIVE to INACTIVE when dormant_flag was null.",
  },
  {
    role: "user",
    text: "Is source data incorrect?",
  },
  {
    role: "assistant",
    text: "Source data looks valid. The mismatch appears between transformation and report output stages.",
  },
];

export const sqlLines = [
  { number: 1, code: "-- Customer status reconciliation extract" },
  { number: 2, code: "SELECT" },
  { number: 3, code: "  c.customer_id," },
  { number: 4, code: "  c.customer_name," },
  { number: 5, code: "  CASE" },
  { number: 6, code: "    WHEN c.status = 'ACTIVE' AND c.dormant_flag IS NULL THEN 'INACTIVE'", suspicious: true },
  { number: 7, code: "    WHEN c.status = 'ACTIVE' THEN 'ACTIVE'" },
  { number: 8, code: "    WHEN c.status = 'SUSPENDED' THEN 'INACTIVE'" },
  { number: 9, code: "    ELSE c.status" },
  { number: 10, code: "  END AS customer_status," },
  { number: 11, code: "  r.report_cycle" },
  { number: 12, code: "FROM CRM_STATUS_FEED c" },
  { number: 13, code: "LEFT JOIN REPORT_CONTROL r" },
  { number: 14, code: "  ON r.region_code = c.region_code" },
  { number: 15, code: "WHERE c.customer_id = 'CUST-84721';" },
];
