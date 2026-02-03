// ============================================================
// src/aurelius/config/reportFlow.ts
// AURELIUS — CANONICAL REPORT FLOW
// STRICT • TYPE-SAFE • SINGLE SOURCE OF TRUTH
// ============================================================

import type { AnalysisType } from "../types";

/* ============================================================
   CANONICAL REPORT SECTIONS
============================================================ */

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

  /* ============================================================
     ✅ ZORG — BESLUITVORMINGSKAART (PURE ADDITION)
     Boardroom-grade decision tension mapping for healthcare
  ============================================================ */

  "zorg_spanningskaart",
  "zorg_besluitvormingskaart",
] as const;

/* ============================================================
   TYPE — SINGLE SOURCE OF TRUTH
============================================================ */

export type ReportSection = typeof REPORT_SECTIONS[number];

/* ============================================================
   REPORT FLOW PER ANALYSIS TYPE
   ✅ NON-BREAKING UPGRADE:
   - Keeps value type safety (ReportSection[])
   - Avoids key errors when AnalysisType unions differ elsewhere
============================================================ */

type ReportFlowKey = AnalysisType | "zorg_scan";

export const REPORT_FLOW = {
  strategy: [
    "strategic_blueprint",
    "opportunity_map",
    "risk_register",
    "ninety_day_plan",
  ],

  financial_strategy: [
    "financial_health",
    "opportunity_map",
    "ninety_day_plan",
  ],

  finance: ["financial_health", "risk_register"],

  growth: ["opportunity_map", "ninety_day_plan"],

  market: ["strategic_blueprint", "market_contribution"],

  process: ["process_contribution", "risk_register"],

  leadership: ["leadership_profile", "risk_register", "ninety_day_plan"],

  team_dynamics: ["team_dynamics", "risk_register", "ninety_day_plan"],

  team_culture: ["culture_scan", "ninety_day_plan"],

  change_resilience: ["leadership_profile", "culture_scan", "ninety_day_plan"],

  onderstroom: ["understream_scan", "risk_register", "ninety_day_plan"],

  swot: ["strategic_blueprint", "risk_register"],

  esg: ["esg_contribution"],

  ai_data: ["governance_contribution"],

  deep_dive: [
    "strategic_blueprint",
    "financial_health",
    "leadership_profile",
    "understream_scan",
    "governance_contribution",
    "ninety_day_plan",
  ],

  marketing: ["market_contribution", "opportunity_map", "ninety_day_plan"],

  sales: ["customer_contribution", "process_contribution", "ninety_day_plan"],

  /* ============================================================
     ✅ ZORGSCAN V1 FLOW — PURE ADDITION
     Pure addition, no disruption
  ============================================================ */

  zorg_scan: [
    "zorg_spanningskaart",
    "zorg_besluitvormingskaart",
    "risk_register",
    "ninety_day_plan",
  ],
} as const satisfies Partial<Record<ReportFlowKey, readonly ReportSection[]>>;
