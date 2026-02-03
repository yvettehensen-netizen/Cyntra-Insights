// src/aurelius/orchestrator/synthesizeRawAnalysis.ts
// 🔒 HEILIGE ORCHESTRATOR-STAP — IDENTIEK GEDRAG
// ➕ ADD ONLY: Decision-awareness (Porter • PESTEL • McKinsey 7S • GROW • VIBAAAN • HGBCO)
// ❌ Geen routes gewijzigd
// ❌ Geen outputstructuur gewijzigd
// ============================================================

import type { ReportSection } from "../config/reportFlow";

/* ============================================================================
   CANONICAL SECTION ORDER (ONVERANDERD)
============================================================================ */

const SECTION_ORDER: ReportSection[] = [
  "strategic_blueprint",
  "financial_health",
  "leadership_profile",
  "team_dynamics",
  "culture_scan",
  "understream_scan",
  "opportunity_map",
  "risk_register",
  "ninety_day_plan",
] as const;

/* ============================================================================
   ADD ONLY — DECISION DOMAIN MAPPING (NON-BREAKING)
   Doel:
   - Latere HGBCO / VIBAAAN routing
   - Geen invloed op huidige output
============================================================================ */

const SECTION_DECISION_DOMAINS: Partial<
  Record<ReportSection, string[]>
> = {
  strategic_blueprint: ["Porter", "McKinsey7S", "GROW"],
  financial_health: ["PESTEL", "VIBAAAN"],
  leadership_profile: ["McKinsey7S", "Governance"],
  team_dynamics: ["Culture", "Understream"],
  culture_scan: ["Culture", "Understream"],
  understream_scan: ["Understream", "VIBAAAN"],
  opportunity_map: ["Porter", "GROW"],
  risk_register: ["PESTEL", "VIBAAAN"],
  ninety_day_plan: ["HGBCO"],
};

/* ============================================================================
   TITEL FORMATTER (ONVERANDERD)
============================================================================ */

function formatSectionTitle(key: ReportSection): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* ============================================================================
   CONTENT FORMATTER (ONVERANDERD GEDRAG)
============================================================================ */

function formatSectionContent(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (typeof value === "object") {
    try {
      const str = JSON.stringify(value, null, 2);
      return "```json\n" + str + "\n```";
    } catch {
      return null;
    }
  }

  return String(value);
}

/* ============================================================================
   SYNTHESIS — RAW ANALYSIS → COHERENT MARKDOWN
   GEDRAG: IDENTIEK
============================================================================ */

/**
 * Synthetiseert alle ruwe analyse-secties tot één samenhangend Markdown-rapport.
 *
 * ADD ONLY:
 * - Interne decision-domain mapping (nog niet gerenderd)
 * - Voorbereid op HGBCO / DecisionCard vertaling
 */
export function synthesizeRawAnalysis(
  sections: Partial<Record<ReportSection, unknown>>
): string {
  const blocks: string[] = [];

  for (const key of SECTION_ORDER) {
    const rawValue = sections[key];

    const content = formatSectionContent(rawValue);
    if (!content) {
      continue;
    }

    const title = formatSectionTitle(key);

    /* ======================================================
       ADD ONLY — DECISION METADATA (NIET GERENDERD)
       Wordt bewust NIET toegevoegd aan output
    ====================================================== */
    const _decisionDomains = SECTION_DECISION_DOMAINS[key];

    blocks.push(`### ${title}\n\n${content}`);
  }

  return blocks.join("\n\n");
}
