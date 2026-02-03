// ============================================================
// src/aurelius/types/index.ts
// AURELIUS — CANONICAL TYPES (SINGLE SOURCE OF TRUTH)
// RULE: NEVER DOWNGRADE — ONLY ADDITIVE UPGRADES
// ============================================================

/* --------------------------------------------
   ANALYSIS TYPES
--------------------------------------------- */

export type AnalysisType =
  | "strategy"
  | "financial_strategy"
  | "finance"
  | "growth"
  | "market"
  | "process"
  | "leadership"
  | "team_dynamics"
  | "team_culture"
  | "change_resilience"
  | "onderstroom"
  | "swot"
  | "esg"
  | "ai_data"
  | "deep_dive"
  | "marketing"
  | "sales";

/* --------------------------------------------
   REPORT SECTIONS
--------------------------------------------- */

export const REPORT_SECTIONS = [
  "strategic_blueprint",
  "financial_health",
  "opportunity_map",
  "risk_register",
  "ninety_day_plan",
  "leadership_profile",
  "team_dynamics",
  "culture_scan",
  "understream_scan",
  "process_contribution",
  "market_contribution",
  "customer_contribution",
  "esg_contribution",
  "governance_contribution",
  "marketing_contribution",
  "sales_contribution",
] as const;

export type ReportSection = (typeof REPORT_SECTIONS)[number];

/* --------------------------------------------
   CONSULTANT IDS
--------------------------------------------- */

export type ConsultantId =
  | "strategy"
  | "financial"
  | "growth"
  | "market"
  | "process"
  | "leadership"
  | "team"
  | "culture"
  | "understream"
  | "risk"
  | "customer"
  | "esg"
  | "governance"
  | "execution"
  | "ai_data"
  | "marketing_strategy"
  | "sales_execution";

/* --------------------------------------------
   OUTPUT TYPES
--------------------------------------------- */

export const OutputType = {
  String: "string",
  Object: "object",
  Json: "json",
} as const;

export type OutputType = (typeof OutputType)[keyof typeof OutputType];

/* --------------------------------------------
   CONFIDENCE LEVEL
--------------------------------------------- */

export const ConfidenceLevel = {
  Low: "low",
  Medium: "medium",
  High: "high",
} as const;

export type ConfidenceLevel =
  (typeof ConfidenceLevel)[keyof typeof ConfidenceLevel];

/* --------------------------------------------
   CONTRACT
--------------------------------------------- */

export type ConsultantConstraintSchema = string;
export type OnFailurePolicy = "retry" | "fail";

export interface ConsultantContractConstraints {
  minWords?: number;
  maxWords?: number;
  minItemsPerSection?: Record<string, number>;
  minTotalItems?: number;
  mustContainEvidence?: boolean;
  expectedConfidence?: ConfidenceLevel;
  validationSchema?: ConsultantConstraintSchema;
}

export interface ConsultantAntiEchoPolicy {
  forbidExecutiveSummary?: boolean;
  forbidRephrasingOtherConsultants?: boolean;
  forbidLiteralReuse?: boolean;
}

export interface ConsultantRetryPolicy {
  maxRetries?: number;
  onFailure?: OnFailurePolicy;
}

export interface ConsultantContract {
  allowedDomains?: string[];
  forbiddenDomains?: string[];
  requiredSections?: ReportSection[];
  forbiddenSections?: ReportSection[];
  constraints?: ConsultantContractConstraints;
  antiEchoPolicy?: ConsultantAntiEchoPolicy;
  retryPolicy?: ConsultantRetryPolicy;
}

/* --------------------------------------------
   CONSULTANT CORE
--------------------------------------------- */

export interface Consultant {
  id: ConsultantId;
  name: string;
  role: string;
  output_key: ReportSection;
  output_type: OutputType;
  instructions: string;
  contract?: ConsultantContract;
}

/* ============================================================
   HGBCO EXECUTION LAYER
============================================================ */

export type Intervention = {
  priority: number;
  title: string;
  rationale: string;
  blocker?: string;
  outcome?: string;
  owner: string;
  deliverable: string;
  deadline_days?: number;
};

/* ============================================================
   ENGINE RUNTIME CONTEXT
============================================================ */

export interface AnalysisContext {
  analysisType: AnalysisType;
  rawText: string;
  documents?: string[];
  userContext?: Record<string, any>;
  meta?: {
    requestId?: string;
    locale?: string;
  };
}

/* ============================================================
   MODEL RESULT — ADDITIVE MERGE (CRITICAL)
   DO NOT REMOVE ANY PREVIOUS SHAPE
============================================================ */

export interface ModelResult {
  /* legacy / required */
  section?: string;
  model: string;
  content?: string | string[] | Record<string, any>;
  confidence: number;

  /* === ADD ONLY SIGNAL LAYERS (NODE SAFE) === */
  insights?: string[];
  risks?: string[];
  opportunities?: string[];
  recommendations?: string[];

  /* === OPTIONAL LEGACY SUPPORT === */
  strengths?: string[];
  weaknesses?: string[];

  /* === METADATA === */
  metadata?: Record<string, unknown>;
}
