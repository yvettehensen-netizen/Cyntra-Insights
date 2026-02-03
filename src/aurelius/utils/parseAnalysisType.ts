// ============================================================
// src/aurelius/utils/parseAnalysisType.ts
// AURELIUS — ANALYSIS TYPE PARSER (CANON UPGRADE)
// VOLLEDIG TS-FOUTLOOS • ADD-ONLY • BOARDROOM SAFE
// ============================================================

import type { AnalysisType } from "../types";

/**
 * Centrale whitelist van geldige analysis types
 * Moet 1-op-1 overeenkomen met AnalysisType
 */
const VALID_ANALYSIS_TYPES = [
  // Core strategy
  "strategy",
  "financial_strategy",
  "growth",
  "market",
  "process",

  // People & leadership
  "leadership",
  "team_dynamics",
  "team_culture",
  "change_resilience",

  // Deep insight
  "onderstroom",
  "swot",
  "esg",
  "ai_data",

  // Specials
  "deep_dive",
] as const satisfies readonly AnalysisType[];

/* ============================================================
   ADD ONLY — ALIAS MAP (NON-BREAKING)
============================================================ */

const ANALYSIS_TYPE_ALIASES = {
  // Finance
  finance: "financial_strategy",
  financial: "financial_strategy",
  finances: "financial_strategy",

  // People
  culture: "team_culture",
  team: "team_dynamics",

  // Ops
  organization: "process",
  operations: "process",

  // Data
  ai: "ai_data",
  data: "ai_data",

  // Strategy
  strategy_scan: "strategy",
  deep: "deep_dive",
} as const satisfies Record<string, AnalysisType>;

type AnalysisTypeAliasKey = keyof typeof ANALYSIS_TYPE_ALIASES;

/* ============================================================
   NORMALIZATION
============================================================ */

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

/* ============================================================
   PARSER (CANON)
============================================================ */

/**
 * Parse & valideer analysis type uit input (URL, API, form, etc.)
 * - Normaliseert input
 * - Ondersteunt aliases
 * - Faalt hard bij ongeldige types
 */
export function parseAnalysisType(value: string): AnalysisType {
  const normalized = normalize(value);

  // Direct geldig
  if (
    (VALID_ANALYSIS_TYPES as readonly string[]).includes(normalized)
  ) {
    return normalized as AnalysisType;
  }

  // Alias-resolutie (TS-safe)
  if (
    Object.prototype.hasOwnProperty.call(
      ANALYSIS_TYPE_ALIASES,
      normalized
    )
  ) {
    return ANALYSIS_TYPE_ALIASES[
      normalized as AnalysisTypeAliasKey
    ];
  }

  // Hard fail — boardroom safe
  throw new Error(
    `Invalid analysis type: "${value}". ` +
      `Allowed types: ${VALID_ANALYSIS_TYPES.join(", ")}`
  );
}

/* ============================================================
   ADD ONLY — EXPORTS FOR AUDIT / UI
============================================================ */

export const ALL_VALID_ANALYSIS_TYPES = VALID_ANALYSIS_TYPES;
export const ANALYSIS_TYPE_ALIASES_MAP = ANALYSIS_TYPE_ALIASES;
