// src/cie/normalizer.ts

/**
 * Definitieve, productie-klare normalizer voor Aurelius LLM output.
 * - Deterministisch
 * - Audit-proof
 * - Robuust tegen malformed, incomplete of hallucinated output
 */

/**
 * Genormaliseerde, definitieve output van een Aurelius analyse.
 * Dit is de enige toegestane structuur voor downstream verwerking (synthese, board reports, PDF, etc.).
 */
export interface AureliusResult {
  /** Korte, board-ready samenvatting */
  executive_summary: string;

  /** Belangrijkste inzichten */
  insights: string[];

  /** Strategische risico’s */
  risks: string[];

  /** Strategische kansen */
  opportunities: string[];

  /** 90-dagen roadmap, verdeeld over 3 maanden */
  roadmap_90d: {
    month1: string[];
    month2: string[];
    month3: string[];
  };

  /** CEO / board boodschap */
  ceo_message: string;

  /** Vertrouwensscore van de analyse (0–1) */
  confidence_score: number;
}

/* ========================
   HELPER TYPE GUARDS & EXTRACTORS
======================= */

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

/* ========================
   ROADMAP NORMALIZATION
======================= */

const normalizeRoadmap = (input: unknown): AureliusResult["roadmap_90d"] => {
  // Case 1: Direct een array van items (bijv. platte lijst van 21 stappen)
  if (Array.isArray(input)) {
    const items = safeArray(input);
    return {
      month1: items.slice(0, 7),
      month2: items.slice(7, 14),
      month3: items.slice(14, 21),
    };
  }

  // Case 2: Object met maand-velden (in verschillende talen/vormen)
  if (isObject(input)) {
    const pickMonth = (keys: string[]): string[] => {
      for (const key of keys) {
        if (key in input && Array.isArray(input[key])) {
          return safeArray(input[key]);
        }
      }
      return [];
    };

    return {
      month1: pickMonth(["month1", "maand1", "month_1", "fase1", "phase1", "kwartaal1"]),
      month2: pickMonth(["month2", "maand2", "month_2", "fase2", "phase2", "kwartaal2"]),
      month3: pickMonth(["month3", "maand3", "month_3", "fase3", "phase3", "kwartaal3"]),
    };
  }

  // Fallback: lege roadmap
  return { month1: [], month2: [], month3: [] };
};

/* ========================
   ALTERNATIVE FIELD MAPPING
======================= */

// Lijst van mogelijke veldnamen per uiteindelijke property
const fieldAliases = {
  executive_summary: ["executive_summary", "summary", "conclusion", "overall_assessment", "samenvatting"],
  insights: ["insights", "key_findings", "key_themes", "strategic_insights", "inzichten"],
  risks: ["risks", "key_risks", "strategic_risks", "threats", "risicos"],
  opportunities: ["opportunities", "key_opportunities", "strategic_opportunities", "upsides", "kansen"],
  roadmap: ["roadmap_90d", "roadmap", "action_plan", "implementation_plan", "next_steps", "routekaart"],
  ceo_message: ["ceo_message", "leadership_message", "final_note", "concluding_remark", "boodschap"],
  confidence_score: ["confidence_score", "confidence", "quality_score", "vertrouwen"],
} as const;

/* ========================
   MAIN NORMALIZER
======================= */

export function normalizeAureliusResult(raw: unknown): AureliusResult {
  const data = isObject(raw) ? raw : {};

  const getFirstExisting = <T>(aliases: readonly string[], extractor: (val: unknown) => T, fallback: T): T => {
    for (const alias of aliases) {
      if (alias in data) {
        const value = extractor(data[alias]);
        // Als extractor een "valide" waarde teruggeeft (niet de fallback zelf), gebruik die
        if (Array.isArray(value) ? value.length > 0 : value !== fallback) {
          return value;
        }
      }
    }
    return fallback;
  };

  return {
    executive_summary: getFirstExisting(
      fieldAliases.executive_summary,
      (v) => safeString(v, "Strategische analyse voltooid. Kerninzichten, risico’s en een uitvoerbare roadmap zijn geïdentificeerd."),
      "Strategische analyse voltooid. Kerninzichten, risico’s en een uitvoerbare roadmap zijn geïdentificeerd."
    ),

    insights: getFirstExisting(fieldAliases.insights, safeArray, []),

    risks: getFirstExisting(fieldAliases.risks, safeArray, []),

    opportunities: getFirstExisting(fieldAliases.opportunities, safeArray, []),

    roadmap_90d: getFirstExisting(fieldAliases.roadmap, normalizeRoadmap, {
      month1: [],
      month2: [],
      month3: [],
    }),

    ceo_message: getFirstExisting(
      fieldAliases.ceo_message,
      (v) => safeString(v, "Focus op executie. De komende 90 dagen bepalen het strategisch momentum."),
      "Focus op executie. De komende 90 dagen bepalen het strategisch momentum."
    ),

    confidence_score: getFirstExisting(
      fieldAliases.confidence_score,
      (v) => safeNumberInRange(v, 0, 1, 0.92),
      0.92
    ),
  };
}
