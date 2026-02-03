// ============================================================
// AURELIUS — DECISION CANON (MAXIMAL UPGRADE)
// Path: src/aurelius/types/aurelius.types.ts
//
// CYNTRA / AURELIUS GOVERNANCE PRINCIPLES
// - Decision machine, not report generator
// - HGBCO is mandatory, structured, enforceable
// - Porter • PESTEL • McKinsey 7S • GROW • VIBAAAN embedded
// - Strict boundary between input, synthesis, decision, execution
// ============================================================

/* ============================================================
   ANALYSIS TYPE ENUM — EXPANDED & DECISION-AWARE
============================================================ */

export type AnalysisType =
  | "strategy"
  | "finance"
  | "growth"
  | "governance"
  | "leadership"
  | "operations"
  | "risk"
  | "commercial"
  | "zorgscan"
  | "culture"
  | "market"
  | "organization"
  | "general";

/* ============================================================
   DECISION TAXONOMY — CANONICAL
============================================================ */

export type DecisionArena =
  | "Initiatief"
  | "MT"
  | "Bestuur"
  | "Governance"
  | "Ownership";

export type TensionSource =
  | "Porter"
  | "PESTEL"
  | "McKinsey7S"
  | "GROW"
  | "Onderstroom"
  | "Governance";

export type InterventionLayer =
  | "Bovenstroom"
  | "Onderstroom"
  | "Structuur"
  | "Gedrag"
  | "Mandaat";

/* ============================================================
   HGBCO — PRIMARY DECISION FRAME (STRICT)
============================================================ */

/**
 * HGBCO is Aurelius’ non-negotiable boardroom decision contract.
 * Every valid AureliusResult MUST contain this in full.
 */
export interface HGBCOCard {
  /* ========================================================
     H — HUIDIGE REALITEIT (OBJECTIEF)
     Porter • PESTEL • McKinsey 7S • GROW-Reality
  ======================================================== */
  H: {
    samenvatting: string;

    porter_forces: string[];
    pestel_factors: string[];
    mckinsey_7s_mismatches: string[];
    grow_reality: string[];

    constraints: string[];
    non_negotiables: string[];

    dominante_spanningen: Array<{
      arena: DecisionArena;
      bron: TensionSource;
      structurele_spanning: string;
      failure_mode: string;
      waarneembaar_signaal: string;
      escalatie_risico: "laag" | "middel" | "hoog";
    }>;
  };

  /* ========================================================
     G — GEKOZEN RICHTING (EXCLUSIEF)
  ======================================================== */
  G: {
    richting: string;
    expliciet_verlaten_richtingen: string[];
    strategische_tradeoffs: string[];
  };

  /* ========================================================
     B — BLOKKADES (VIBAAAN)
  ======================================================== */
  B: Array<{
    arena: DecisionArena;
    oorsprong: TensionSource;
    blokkade: string;
    waarom_blijft_bestaan: string;
    risico_bij_niet_ingrijpen: string;
  }>;

  /* ========================================================
     C — CLOSURE & INTERVENTIES
     Onomkeerbaar • Afdwingbaar • Eigenaarschap
  ======================================================== */
  C: Array<{
    interventie: string;
    laag: InterventionLayer;
    owner: string;
    irreversibility_deadline: string; // YYYY-MM-DD
    afdwingmechanisme: string;
    wat_wordt_onmogelijk_na_deze_keuze: string;
  }>;

  /* ========================================================
     O — OWNERSHIP & EXECUTIECONTRACT (90 DAGEN)
  ======================================================== */
  O: {
    eindverantwoordelijke: string;
    eerste_90_dagen: string[];
    review_moment: string; // YYYY-MM-DD
    escalatiepad: string;
    stopcriteria: string[];
  };
}

/* ============================================================
   INPUT STRUCTURE — SINGLE ENGINE ENTRYPOINT
============================================================ */

export interface AureliusInput {
  analysisType: AnalysisType;

  /* ======================================================
     OPTIONAL USER HGBCO FRAME (ENGINE COMPLETES)
  ====================================================== */
  hgbco?: Partial<HGBCOCard>;

  /* ======================================================
     BOARDROOM INTAKE (SIGNALS, NOT PROMPTS)
  ====================================================== */
  intake: {
    companyName?: string;

    situation?: string;
    goals?: string;
    challenges?: string;
    teamDescription?: string;

    boardDecisionQuestion?: string;
    irreversibilityRisk?: string;
    decisionDeadlineDays?: number;

    includeCulture?: boolean;

    culture?: {
      clarity: number;
      execution: number;
      feedback: number;
    };

    financials?: {
      revenue?: string;
      margin?: string;
      insurerDependency?: boolean;
      costPressure?: boolean;
    };

    urgencyLevel?: "low" | "medium" | "high" | "existential";
  };

  documentData?: string;

  /* ======================================================
     CONTROL FLAGS — GOVERNANCE SAFETY
  ====================================================== */
  options?: {
    brutalMode?: boolean;
    enforceHGBCO?: boolean;
    maxBlockers?: number;
    maxActions?: number;
  };
}

/* ============================================================
   INTERVENTION — EXECUTION CLOSURE (C-LAYER)
============================================================ */

export interface Intervention {
  priority: number;
  title: string;

  rationale: string;

  blocker?: string;
  outcome?: string;

  owner: string;
  deliverable: string;

  deadline_days?: number;
}

/* ============================================================
   FINAL AURELIUS RESULT — DECISION OBJECT
============================================================ */

export interface AureliusResult {
  id: string;

  analysisType: AnalysisType;
  companyName?: string;

  /* ======================================================
     PRIMARY OUTPUT — DECISION CONTRACT
  ====================================================== */
  hgbco: HGBCOCard;

  executive_summary: string;

  /* ======================================================
     SECONDARY SIGNALS (DERIVED, NON-BINDING)
  ====================================================== */
  insights?: string[];
  risks?: string[];
  opportunities?: string[];

  /* ======================================================
     EXECUTION LAYER
  ====================================================== */
  interventions: Intervention[];

  /* ======================================================
     OBSERVABILITY & AUDIT
  ====================================================== */
  confidence_score: number;
  raw_output?: unknown;
}

/* ============================================================
   ENGINE RESPONSE — SAFE WRAPPER
============================================================ */

export type AureliusResponse =
  | {
      success: true;
      data: unknown;
      meta?: {
        request_id?: string;
        engine_version?: string;
        duration_ms?: number;

        hgbco_detected?: boolean;
        blocker_count?: number;
        action_count?: number;
        intervention_count?: number;
      };
    }
  | {
      success: false;
      error: {
        message: string;
        code?: string;
        details?: unknown;
      };
      meta?: {
        request_id?: string;
        hgbco_violation?: boolean;
      };
    };
