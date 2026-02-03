// ============================================================
// AURELIUS — ANALYSIS → RESULT MAPPER (CANON)
// RULE: ADD ONLY — NEVER DOWNGRADE
// TS-SAFE • LEGACY COMPATIBLE
// ============================================================

import type { AureliusAnalysisResult } from "../utils/parseAureliusReport";
import type { AureliusResult } from "../types/aureliusResult";

/* =========================
   HELPERS (SAFE & PURE)
========================= */

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  if (typeof value === "string") {
    return value.trim() ? [value] : [];
  }
  return [];
}

function getSectionContent(
  analysis: AureliusAnalysisResult,
  keys: string[]
): string | string[] | Record<string, string[]> | undefined {
  for (const key of keys) {
    const section = analysis.sections?.[key];
    if (section && section.content !== undefined) {
      return section.content;
    }
  }
  return undefined;
}

function asRecordOfStringArrays(
  value: unknown
): Record<string, string[]> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const arr = asStringArray(v);
      if (arr.length) out[k] = arr;
    }
    return out;
  }
  return {};
}

/* =========================
   MAIN MAPPER
========================= */

export function mapAnalysisToResult(
  analysis: AureliusAnalysisResult
): AureliusResult {
  const insights = asStringArray(
    getSectionContent(analysis, ["inzichten", "insights"])
  );

  const risks = asStringArray(
    getSectionContent(analysis, ["risicos", "risks"])
  );

  const opportunities = asStringArray(
    getSectionContent(analysis, ["kansen", "opportunities"])
  );

  const roadmapContent = getSectionContent(analysis, [
    "90_dagen_actieplan",
    "roadmap_90d",
  ]);

  const roadmap = asRecordOfStringArrays(roadmapContent);

  const ceoMessage =
    asStringArray(
      getSectionContent(analysis, ["ceo_message", "boodschap_ceo"])
    )[0] ?? "";

  return {
    /* ================= CORE ================= */
    executive_summary:
      analysis.executive_summary ??
      "Geen executive summary gegenereerd.",

    insights,
    risks,
    opportunities,

    /* ================= 90D ROADMAP ================= */
    roadmap_90d: {
      month1:
        roadmap["month_1"] ??
        roadmap["maand_1"] ??
        [],
      month2:
        roadmap["month_2"] ??
        roadmap["maand_2"] ??
        [],
      month3:
        roadmap["month_3"] ??
        roadmap["maand_3"] ??
        [],
    },

    /* ================= CEO SIGNAL ================= */
    ceo_message: ceoMessage,

    /* ================= CONFIDENCE ================= */
    confidence_score:
      typeof analysis.confidence_score === "number"
        ? analysis.confidence_score
        : 0.85,
  };
}
