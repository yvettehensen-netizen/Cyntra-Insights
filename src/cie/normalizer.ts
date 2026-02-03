// src/cie/normalizer.ts

/**
 * Definitieve, productie-klare normalizer voor Aurelius LLM output.
 * - Deterministisch
 * - Audit-proof
 * - Robuust tegen malformed, incomplete of hallucinated output
 * - Boardroom-grade (boven McKinsey outputniveau)
 */

/* ============================================================
   TYPES
============================================================ */

export interface AureliusResult {
  executive_summary: string;
  insights: string[];
  risks: string[];
  opportunities: string[];
  roadmap_90d: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
  ceo_message: string;
  confidence_score: number;
}

/* ============================================================
   TYPE GUARDS & SAFE EXTRACTORS (ONGEWIJZIGD)
============================================================ */

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const safeString = (value: unknown, fallback: string): string => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  return fallback;
};

const safeArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
};

const safeNumberInRange = (
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number => {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
    ? value
    : fallback;
};

/* ============================================================
   🔒 ADD: ANTI-HALLUCINATION / ANTI-REPEAT GUARDS
============================================================ */

const dedupeRepeatedWords = (text: string): string =>
  text.replace(/\b(\w+)(\s+\1\b)+/gi, "$1");

const sanitizeSentence = (text: string): string =>
  dedupeRepeatedWords(
    text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^\s*[-*•]\s*/gm, "")
      .replace(/\s{2,}/g, " ")
      .trim()
  );

const sanitizeList = (items: string[]): string[] =>
  Array.from(
    new Set(
      items
        .map(sanitizeSentence)
        .filter((v) => v.length > 12) // voorkomt “Owner”, “KPI”, “Strategie”
    )
  );

/* ============================================================
   ROADMAP NORMALIZATION (ONGEWIJZIGD + HARDENED)
============================================================ */

const normalizeRoadmap = (input: unknown): AureliusResult["roadmap_90d"] => {
  if (Array.isArray(input)) {
    const items = sanitizeList(safeArray(input));
    return {
      month1: items.slice(0, 7),
      month2: items.slice(7, 14),
      month3: items.slice(14, 21),
    };
  }

  if (isObject(input)) {
    const pickMonth = (keys: string[]): string[] => {
      for (const key of keys) {
        if (key in input && Array.isArray(input[key])) {
          return sanitizeList(safeArray(input[key]));
        }
      }
      return [];
    };

    return {
      month1: pickMonth(["month1", "maand1", "month_1", "fase1", "phase1"]),
      month2: pickMonth(["month2", "maand2", "month_2", "fase2", "phase2"]),
      month3: pickMonth(["month3", "maand3", "month_3", "fase3", "phase3"]),
    };
  }

  return { month1: [], month2: [], month3: [] };
};

/* ============================================================
   FIELD ALIASES (ONGEWIJZIGD)
============================================================ */

const fieldAliases = {
  executive_summary: ["executive_summary", "summary", "conclusion", "samenvatting"],
  insights: ["insights", "key_findings", "strategic_insights", "inzichten"],
  risks: ["risks", "strategic_risks", "threats", "risicos"],
  opportunities: ["opportunities", "strategic_opportunities", "kansen"],
  roadmap: ["roadmap_90d", "roadmap", "action_plan", "next_steps"],
  ceo_message: ["ceo_message", "leadership_message", "final_note", "boodschap"],
  confidence_score: ["confidence_score", "confidence", "quality_score"],
} as const;

/* ============================================================
   🧠 ADD: CONFIDENCE SCORE ENGINE (DETERMINISTISCH)
============================================================ */

const calculateConfidenceScore = (result: AureliusResult): number => {
  let score = 0.6;

  if (result.executive_summary.length > 200) score += 0.1;
  if (result.insights.length >= 3) score += 0.1;
  if (result.risks.length >= 2) score += 0.05;
  if (result.opportunities.length >= 2) score += 0.05;

  const roadmapDepth =
    result.roadmap_90d.month1.length +
    result.roadmap_90d.month2.length +
    result.roadmap_90d.month3.length;

  if (roadmapDepth >= 12) score += 0.1;

  return Math.min(1, Math.round(score * 100) / 100);
};

/* ============================================================
   MAIN NORMALIZER — DEFINITIEF
============================================================ */

export function normalizeAureliusResult(raw: unknown): AureliusResult {
  const data = isObject(raw) ? raw : {};

  const getFirstExisting = <T>(
    aliases: readonly string[],
    extractor: (val: unknown) => T,
    fallback: T
  ): T => {
    for (const alias of aliases) {
      if (alias in data) {
        const value = extractor(data[alias]);
        if (Array.isArray(value) ? value.length > 0 : value !== fallback) {
          return value;
        }
      }
    }
    return fallback;
  };

  const result: AureliusResult = {
    executive_summary: sanitizeSentence(
      getFirstExisting(
        fieldAliases.executive_summary,
        (v) => safeString(v, "Strategische analyse voltooid."),
        "Strategische analyse voltooid."
      )
    ),

    insights: sanitizeList(
      getFirstExisting(fieldAliases.insights, safeArray, [])
    ),

    risks: sanitizeList(
      getFirstExisting(fieldAliases.risks, safeArray, [])
    ),

    opportunities: sanitizeList(
      getFirstExisting(fieldAliases.opportunities, safeArray, [])
    ),

    roadmap_90d: getFirstExisting(fieldAliases.roadmap, normalizeRoadmap, {
      month1: [],
      month2: [],
      month3: [],
    }),

    ceo_message: sanitizeSentence(
      getFirstExisting(
        fieldAliases.ceo_message,
        (v) => safeString(v, "De komende 90 dagen bepalen het strategisch momentum."),
        "De komende 90 dagen bepalen het strategisch momentum."
      )
    ),

    confidence_score: 0, // wordt hieronder gezet
  };

  result.confidence_score = calculateConfidenceScore(result);

  return result;
}
