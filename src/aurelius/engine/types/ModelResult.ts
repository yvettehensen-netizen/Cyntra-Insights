// ============================================================
// AURELIUS — MODEL RESULT (CANONICAL)
// RULE: ADD ONLY — NEVER DOWNGRADE
//
// Purpose:
// - Unified output contract voor alle models & agents
// - Boardroom-, decision- en vault-safe
// - Toekomstvast (2026+)
// ============================================================

export interface ModelResult {
  /* =========================
     CORE (LEGACY — DO NOT REMOVE)
  ========================= */
  model: string;

  strengths?: string[];
  weaknesses?: string[];

  risks?: string[];
  opportunities?: string[];

  confidence: number;

  /* =========================
     🔥 ADDITIVE SIGNAL LAYER (2026+)
  ========================= */
  insights?: string[];
  recommendations?: string[];

  /* =========================
     🧠 DECISION SIGNALS (ADD ONLY)
     Voor HGBCO / VIBAAAN / Boardroom engines
  ========================= */
  decision_signals?: {
    has_clear_decision?: boolean;
    tradeoffs_identified?: boolean;
    irreversible_choices_present?: boolean;
    ownership_assigned?: boolean;
    decision_urgency?: "low" | "medium" | "high" | "existential";
  };

  /* =========================
     🧭 EXECUTION READINESS (ADD ONLY)
  ========================= */
  execution_readiness?: {
    clarity_level?: number; // 0–1
    governance_alignment?: number; // 0–1
    operational_feasibility?: number; // 0–1
    risk_exposure?: "low" | "medium" | "high";
  };

  /* =========================
     FLEXIBLE CONTENT (SAFE)
     Vrij veld voor models / agents
  ========================= */
  content?: string | string[] | Record<string, any>;

  /* =========================
     METADATA (NODE SAFE)
  ========================= */
  metadata?: {
    generated_at?: string; // ISO
    engine_version?: string;
    consultant_id?: string;
    analysis_type?: string;
    source_documents?: string[];
    audit_id?: string;
    [key: string]: unknown;
  };

  /* =========================
     🔐 VAULT & TRACEABILITY (ADD ONLY)
  ========================= */
  vault?: {
    locked?: boolean;
    executive_only?: boolean;
    checksum?: string;
    retention_policy?: "temporary" | "standard" | "legal_hold";
  };
}
