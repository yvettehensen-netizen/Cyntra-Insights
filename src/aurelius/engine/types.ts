// ============================================================
// src/aurelius/engine/types.ts
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
   EXECUTION LAYER — HGBCO
--------------------------------------------- */

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

/* --------------------------------------------
   ENGINE RUNTIME CONTEXT
--------------------------------------------- */

export interface AnalysisContext {
  analysisType: AnalysisType;

  /** Combined intake + docs */
  rawText: string;

  documents?: string[];

  userContext?: Record<string, any>;

  meta?: {
    requestId?: string;
    locale?: string;
  };
}

/* --------------------------------------------
   MODEL RESULT — ADDITIVE COMPATIBILITY LAYER
   (CRITICAL: MUST ACCEPT ALL NODE OUTPUTS)
--------------------------------------------- */

export interface ModelResult {
  /** Section key used by orchestrator */
  section: string;

  /** Originating model / node id */
  model: string;

  /** Primary content */
  content?: string | string[] | Record<string, any>;

  /** Strategic signals — EMITTED BY ALL NODES */
  insights?: string[];
  risks?: string[];
  opportunities?: string[];
  recommendations?: string[];

  /** Optional execution data */
  interventions?: Intervention[];

  /** Confidence score */
  confidence: number;

  /** Allow future additive fields without breaking nodes */
  [key: string]: any;
}
