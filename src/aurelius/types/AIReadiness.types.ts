// ============================================================
// AURELIUS — AI READINESS TYPES (2026 CANON)
// RULE: ADD ONLY — NEVER DOWNGRADE
// Boardroom-ready • HGBCO-native • Decision-driven
// ============================================================

/* ============================================================
   DOMAIN MODEL
============================================================ */

export type AIReadinessDomain =
  | "strategy"
  | "governance"
  | "technology"
  | "people"
  | "operations"
  | "economics";

/* ============================================================
   INPUT CONTRACT
============================================================ */

export interface AIReadinessInput {
  organization_name: string;
  industry: string;
  employee_count: number;

  compliance_requirements: string[];
  existing_ai_tools: string[];

  has_ai_policy: boolean;
  ai_governance_structure: boolean;
  ai_monitoring: boolean;

  ai_training_coverage_percentage: number;

  strategic_ai_objective?: string;

  /* ================= ADD ONLY (2026+) ================= */

  ai_budget_percentage_of_revenue?: number;
  critical_ai_dependencies?: string[];
  data_maturity_level?: "low" | "medium" | "high";
  risk_appetite?: "low" | "moderate" | "high";
}

/* ============================================================
   DOMAIN SCORE
============================================================ */

export type AIReadinessMaturityLevel =
  | "Ad-hoc"
  | "Controlled"
  | "Managed"
  | "Strategic"
  | "Transformational";

export interface AIReadinessScore {
  domain: AIReadinessDomain;

  score: number; // 0–100
  maturity_level: AIReadinessMaturityLevel;

  risks: string[];
  structural_gaps: string[];
  behavioral_gaps: string[];

  /* ================= ADD ONLY (2026+) ================= */

  decision_clarity?: number; // 0–1
  governance_alignment?: number; // 0–1
  execution_readiness?: number; // 0–1
  risk_exposure?: "low" | "medium" | "high" | "critical";
}

/* ============================================================
   HGBCO STRUCTURE (FIXED — NO SPACE BUG)
============================================================ */

export interface HGBCOBlock {
  huidige_situatie: string;
  gewenste_situatie: string;
  belemmeringen: string[];
  consequenties: string[];
  oplossingsrichting: string[];
}

/* ============================================================
   EXECUTIVE LAYER (2026 ADDITIVE)
============================================================ */

export interface AIReadinessExecutiveSignals {
  has_clear_ai_owner?: boolean;
  ai_tradeoffs_explicit?: boolean;
  irreversible_ai_commitments?: boolean;
  ai_risk_envelope_defined?: boolean;
  urgency?: "low" | "medium" | "high" | "existential";
}

/* ============================================================
   MAIN RESULT CONTRACT
============================================================ */

export interface AIReadinessResult {
  total_score: number; // 0–100
  maturity_overall: AIReadinessMaturityLevel;

  domains: AIReadinessScore[];

  /* 🔥 FIXED: no illegal property name */
  hgbco: HGBCOBlock;

  raw_ai_analysis: string;

  /* ================= ADD ONLY (2026+) ================= */

  executive_summary?: string;

  decision_signals?: AIReadinessExecutiveSignals;

  execution_readiness?: {
    clarity_level?: number; // 0–1
    governance_alignment?: number; // 0–1
    operational_feasibility?: number; // 0–1
    risk_exposure?: "low" | "medium" | "high" | "critical";
  };

  audit?: {
    generated_at?: string; // ISO
    engine_version?: string;
    analysis_id?: string;
  };
}
