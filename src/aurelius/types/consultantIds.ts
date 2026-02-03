// ============================================================
// CONSULTANT ID — CANONICAL DECISION NODE IDENTIFIERS
// HGBCO • PORTER • PESTEL • McKINSEY 7S • GROW • VIBAAAN READY
// ============================================================

/**
 * ConsultantId is the single source of truth for:
 * - Orchestrator routing
 * - Decision weighting
 * - Audit & explainability
 * - Future permissioning / billing
 */
export type ConsultantId =
  /* ========================================================
     CORE STRATEGY & VALUE CREATION
  ======================================================== */
  | "strategy"
  | "growth"
  | "marketing_strategy"
  | "sales_execution"

  /* ========================================================
     FINANCIAL & RISK
  ======================================================== */
  | "financial"
  | "risk"
  | "ai_data"

  /* ========================================================
     MARKET & CUSTOMER
  ======================================================== */
  | "market"
  | "customer"

  /* ========================================================
     ORGANISATION & EXECUTION (McKinsey 7S)
  ======================================================== */
  | "process"
  | "execution"
  | "leadership"
  | "team"
  | "culture"
  | "understream"

  /* ========================================================
     GOVERNANCE & ESG
  ======================================================== */
  | "governance"
  | "esg";
