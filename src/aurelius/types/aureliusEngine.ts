/**
 * ============================================================
 * AURELIUS — CANONICAL INPUT CONTRACT (HGBCO GOVERNANCE CANON)
 * Supabase Edge Function / Orchestrator Boundary
 *
 * ⚠️ HEILIG:
 * - Dit is de ENIGE toegestane inputvorm
 * - Alle validatie, normalisatie en governance start hier
 * - HGBCO is de primaire besluitstructuur van Aurelius
 * - Add-only: NOOIT velden verwijderen of wijzigen
 * ============================================================
 */

/* ============================================================
   HGBCO METHOD CONTRACT (PRIMARY DECISION BACKBONE)
============================================================ */

/**
 * HGBCO Input Frame:
 * Optioneel door gebruiker ingevuld,
 * maar altijd door orchestrator verplicht gesynthetiseerd.
 */
export interface HGBCOInputFrame {
  /** H — Wat is de realiteit nu? */
  current_state?: string;

  /** G — Wat is het gewenste eindbeeld? */
  desired_state?: string;

  /** B — Wat blokkeert vooruitgang? */
  blockers?: string;

  /** C — Wat moet er concreet gebeuren? */
  concrete_plan_hint?: string;

  /** O — Wat is de gewenste opbrengst? */
  outcome_metric?: string;
}

/* ============================================================
   CORE INPUT
============================================================ */

export interface AureliusInput {
  /**
   * Canonical analysetype
   * (bepaalt prompts, routing, nodes en synthese)
   *
   * ⚠️ string bewust: engine blijft forward-compatible
   */
  analysisType: string;

  /* ==========================================================
     ✅ HGBCO PRIMARY DECISION FRAME
     Dit is de kernstructuur van elk Aurelius rapport.
  ========================================================== */

  hgbco?: HGBCOInputFrame;

  /**
   * Intake-informatie voor context en personalisatie
   * Wordt gebruikt voor:
   * - prompt-context
   * - interventie-afstemming
   * - boardroom-narrative
   */
  intake: {
    companyName?: string;

    /** Situatiebeschrijving */
    situation?: string;

    /** Ambitie / doelstelling */
    goals?: string;

    /** Obstakels / terugkerende problemen */
    challenges?: string;

    /** Team en organisatiebeschrijving */
    teamDescription?: string;

    /* ======================================================
       ✅ ADD ONLY — STRATEGISCHE CONTEXT
    ====================================================== */
    industry?: string;
    marketPosition?: string;
    revenueModel?: string;

    urgencyLevel?: "low" | "medium" | "high" | "existential";

    /* ======================================================
       ✅ ADD ONLY — BOARDROOM DECISION SIGNAL
       Aurelius is geen rapportgenerator maar besluitmachine.
    ====================================================== */
    boardDecisionQuestion?: string;

    /**
     * Wat moet binnen 90 dagen beslist zijn?
     */
    decisionDeadlineDays?: number;

    /**
     * Wat is onomkeerbaar als men wacht?
     */
    irreversibilityRisk?: string;

    /* ======================================================
       ✅ ADD ONLY — CULTURE CONTEXT (OPTIONAL)
    ====================================================== */
    includeCulture?: boolean;

    culture?: {
      clarity: number; // Visiehelderheid (0–10)
      execution: number; // Executiekracht (0–10)
      feedback: number; // Feedbackvermogen (0–10)
    };

    /* ======================================================
       ✅ ADD ONLY — GOVERNANCE & BESLUITVORMING
       Dit voedt de "B" in HGBCO direct.
    ====================================================== */
    decisionContext?: {
      decisionOwnerClarity?: number; // 0–10
      escalationSpeed?: number; // 0–10
      consensusDrag?: number; // 0–10
      accountabilityStrength?: number; // 0–10

      /**
       * Extra governance signal:
       * Waar verdampt besluitvorming vandaag?
       */
      decisionFrictionNarrative?: string;
    };
  };

  /**
   * Optionele extra context
   * - documenten
   * - gesprekken
   * - beleidsstukken
   */
  documentData?: string;

  /* ==========================================================
     ✅ ORCHESTRATION & CONTROL (ENGINE GOVERNANCE)
  ========================================================== */

  options?: {
    /** Hard, ongefilterd boardroom advies */
    brutalMode?: boolean;

    /** Altijd interventies genereren */
    forceInterventions?: boolean;

    /** Default: 6 */
    maxInterventions?: number;

    /** Language lock */
    language?: "nl" | "en";

    /* ======================================================
       ✅ ADD ONLY — HGBCO ENFORCEMENT
    ====================================================== */

    /**
     * Forceer output altijd als HGBCO-first rapport.
     * Default: true
     */
    enforceHGBCO?: boolean;

    /**
     * Output moet beginnen met Sectie 0 HGBCO Besluitkaart.
     */
    requireDecisionCard?: boolean;

    /**
     * Max aantal blockers en acties in HGBCO kaart.
     */
    maxBlockers?: number;
    maxConcreteActions?: number;
  };
}

/* ============================================================
   RESPONSE ENVELOPE (ENGINE OUTPUT)
============================================================ */

/**
 * Standaard response van de Aurelius engine.
 *
 * LET OP:
 * - `data` is bewust `unknown`
 * - Normalisatie naar `AureliusResult` gebeurt EXPLICIET
 * - Voorkomt stille schema-lekken
 */
export type AureliusResponse =
  | {
      success: true;

      /**
       * Ruwe output van de engine (LLM / orchestrator).
       * ❌ NOOIT direct gebruiken zonder normalizer
       */
      data: unknown;

      /* ======================================================
         ✅ OBSERVABILITY METADATA
      ====================================================== */
      meta?: {
        request_id?: string;
        engine_version?: string;
        duration_ms?: number;

        node_versions?: Record<string, string>;

        intervention_count?: number;
        confidence_score?: number;

        /** ✅ ADD ONLY — HGBCO Compliance */
        hgbco_detected?: boolean;
        hgbco_blocker_count?: number;
        hgbco_action_count?: number;
      };
    }
  | {
      success: false;

      /**
       * Gestandaardiseerde foutstructuur
       */
      error: {
        message: string;
        code?: string;
        details?: unknown;
      };

      /* ======================================================
         ✅ FAILURE TRACE
      ====================================================== */
      meta?: {
        request_id?: string;
        failed_node?: string;
        recoverable?: boolean;

        /** ✅ ADD ONLY — METHOD FAILURE */
        hgbco_violation?: boolean;
      };
    };
