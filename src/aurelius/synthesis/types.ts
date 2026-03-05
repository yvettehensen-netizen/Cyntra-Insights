// ============================================================
// src/aurelius/synthesis/types.ts
// BOARDROOM BRIEF — DECISION-READY • HGBCO • VIBAAAN CANON
// ============================================================

/* ============================================================
   DECISION TAXONOMY (LOCAL, NON-LEAKING)
============================================================ */

export type TradeoffType =
  | "focus_vs_spread"
  | "speed_vs_consensus"
  | "control_vs_autonomy"
  | "short_term_vs_long_term"
  | "stability_vs_change";

export type MandateLevel =
  | "informal"
  | "formal"
  | "board_level"
  | "ownership_level";

/* ============================================================
   BOARDROOM BRIEF — CANONICAL STRUCTURE
   Used for:
   - Decision synthesis
   - Narrative generation
   - HGBCO derivation
============================================================ */

export interface BoardroomBrief {
  /* ========================================================
     EXECUTIVE THESIS
     One paragraph. No nuance.
  ======================================================== */
  executive_thesis: string;

  /* ========================================================
     CENTRAL TENSION
     Single dominant decision tension
  ======================================================== */
  central_tension: string;

  /* ========================================================
     STRATEGIC NARRATIVE
     Coherent storyline from reality → choice → consequence
  ======================================================== */
  strategic_narrative: string;

  /* ========================================================
     EXECUTIVE SUMMARY BLOCK (OPTIONAL LEGACY COMPAT)
  ======================================================== */
  executive_summary_block?: {
    dominant_thesis?: string;
    core_conflict?: string;
    tradeoff_statement?: string;
    opportunity_cost: {
      days_30?: string;
      days_0?: string;
      days_90?: string;
      days_365?: string;
      months_12?: string;
    };
    governance_impact: {
      decision_power?: string;
      escalation?: string;
      responsibility_diffusion?: string;
      power_centralization?: string;
    };
    power_dynamics: {
      who_loses_power?: string;
      informal_influence?: string;
      expected_sabotage_patterns?: string;
    };
    execution_risk: {
      failure_point?: string;
      blocker?: string;
      hidden_understream?: string;
    };
    signature_layer: {
      decision_power_axis?: string;
      structural_tension?: string;
      explicit_loss?: string;
      power_shift?: string;
      time_pressure?: string;
      cognitive_maturity_reflection?: string;
      historical_repetition?: string;
      adaptive_hardness_mode?: "klinisch" | "confronterend" | "strategisch_beheerst";
    };
    intervention_plan_90d: {
      week_1_2?: string;
      week_3_6?: string;
      week_7_12?: string;
    };
    decision_contract: {
      opening_line?: string;
      choice?: string;
      measurable_result?: string;
      time_horizon?: string;
      accepted_loss?: string;
    };
  };

  /* ========================================================
     KEY TRADE-OFFS (EXPLICITLY MADE)
     No balance, no compromise
  ======================================================== */
  key_tradeoffs: Array<{
    type: TradeoffType;
    chosen_side: string;
    abandoned_side: string;
    consequence: string;
  }>;

  /* ========================================================
     IRREVERSIBLE DECISIONS
     Decisions that close futures
  ======================================================== */
  irreversible_decisions: Array<{
    decision: string;
    why_irreversible: string;
    point_of_no_return: string; // YYYY-MM-DD or condition
  }>;

  /* ========================================================
     CYNTRA PROPOSAL
     What Cyntra enforces, not advises
  ======================================================== */
  cyntra_proposal: {
    positioning: string;

    interventions: Array<{
      action: string;
      owner: string;
      deadline: string; // YYYY-MM-DD
      enforcement: string;
    }>;

    mandate_required: {
      level: MandateLevel;
      required_from: string;
      consequence_if_withheld: string;
    };
  };

  /* ========================================================
     GOVERNANCE SIGNALS (DERIVED)
  ======================================================== */
  governance_risks?: string[];
  execution_risks?: string[];
  confidence_level?: number; // 0.00 – 1.00
}
