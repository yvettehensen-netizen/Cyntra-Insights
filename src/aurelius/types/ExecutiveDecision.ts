// ============================================================
// EXECUTIVE DECISION — CANONICAL DECISION OBJECT
// DECISION MACHINE • HGBCO • VIBAAAN • BOARDROOM SAFE
//
// RULES:
// ✅ ADD ONLY
// ❌ NO RENAMES
// ❌ NO REMOVALS
// ============================================================

/* ============================================================
   CORE ENUMS — STRICT
============================================================ */

export type ExecutiveVerdict =
  | "GO"
  | "NO-GO"
  | "CONDITIONAL";

export type TradeOffCategory =
  | "focus_vs_spread"
  | "speed_vs_consensus"
  | "risk_vs_return"
  | "control_vs_autonomy"
  | "short_term_vs_long_term";

export type DecisionCondition =
  | "mandate_required"
  | "budget_required"
  | "governance_fix"
  | "leadership_change"
  | "execution_capacity";

/* ============================================================
   EXECUTIVE DECISION — FINAL SHAPE
============================================================ */

export interface ExecutiveDecision {
  /* ========================================================
     VERDICT — ONOMKEERBAAR BESLUIT
  ======================================================== */
  verdict: ExecutiveVerdict;

  /* ========================================================
     RATIONALE — BESTUURLIJK MOTIEF
     Geen analyse, alleen besluitreden
  ======================================================== */
  rationale: string;

  /* ========================================================
     EXPLICIETE TRADE-OFFS
     Wat wordt bewust opgeofferd
  ======================================================== */
  trade_offs: Array<{
    category: TradeOffCategory;
    chosen: string;
    abandoned: string;
    consequence: string;
  }>;

  /* ========================================================
     RISICO’S DIE EXPLICIET WORDEN AANVAARD
  ======================================================== */
  risks_accepted: Array<{
    risk: string;
    why_acceptable: string;
    mitigation_owner?: string;
  }>;

  /* ========================================================
     CONDITIES (ALLEEN BIJ CONDITIONAL)
  ======================================================== */
  conditions?: Array<{
    type: DecisionCondition;
    description: string;
    deadline: string; // YYYY-MM-DD
  }>;

  /* ========================================================
     NEXT ACTIONS — EXECUTIECONTRACT
  ======================================================== */
  next_actions: Array<{
    owner: string;
    action: string;
    deadline: string; // YYYY-MM-DD
    enforcement: string;
  }>;

  /* ========================================================
     META — GOVERNANCE
  ======================================================== */
  decision_owner?: string;
  review_moment?: string; // YYYY-MM-DD
  confidence_level?: number; // 0.00 – 1.00

  /* ========================================================
     🔥 ADD ONLY — HGBCO / VIBAAAN SIGNALEN
     Voor downstream decision orchestration
  ======================================================== */
  decision_signals?: {
    irreversible?: boolean;
    mandate_locked?: boolean;
    stop_choices_made?: boolean;
    escalation_path_defined?: boolean;
  };

  /* ========================================================
     🔥 ADD ONLY — EXECUTION READINESS
  ======================================================== */
  execution_readiness?: {
    ownership_clarity?: number; // 0–1
    governance_alignment?: number; // 0–1
    capacity_available?: number; // 0–1
    risk_tolerance?: "low" | "medium" | "high";
  };

  /* ========================================================
     🔐 ADD ONLY — VAULT / AUDIT / TRACEABILITY
  ======================================================== */
  vault?: {
    locked?: boolean;
    executive_only?: boolean;
    audit_id?: string;
    generated_at?: string; // ISO
    engine_version?: string;
  };
}
