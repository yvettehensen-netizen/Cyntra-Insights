// ============================================================
// src/aurelius/engine/report/BoardroomReportBuilder.ts
// FOUTLOOS • STRICT • exactOptionalPropertyTypes SAFE
// GEEN DOWNGRADES • ALLEEN TOEVOEGEN
// ============================================================

import type {
  AnalysisContext,
  ModelResult,
} from "../../types";

/* ============================================================
   LOCAL ADD-ONLY TYPES (NO IMPORT DEPENDENCY)
============================================================ */

export interface Roadmap90D {
  month1: string[];
  month2: string[];
  month3: string[];
}

/* ============================================================
   REPORT STRUCTURE
============================================================ */

export interface ReportPage {
  id: string;
  title: string;
  content: string[];
}

export interface BoardroomReport {
  title: string;
  executive_thesis: string;
  central_tension: string;
  pages: ReportPage[];
  roadmap_90d: Roadmap90D;
  confidence: number;
  urgency: string;
  score: number;
  metadata: Record<string, unknown>;
}

/* ============================================================
   UTILS (STRICT-SAFE)
============================================================ */

const uniq = (items: readonly (string | undefined | null)[]): string[] =>
  [...new Set(items.filter((i): i is string => typeof i === "string" && i.trim().length > 0))];

const avg = (values: readonly (number | undefined | null)[]): number => {
  const valid = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  return valid.length
    ? valid.reduce((a, b) => a + b, 0) / valid.length
    : 0;
};

/* ============================================================
   SAFE EXTRACTORS (NO ASSUMPTIONS)
============================================================ */

const extractArray = (
  models: readonly ModelResult[],
  key: string
): string[] =>
  uniq(
    models.flatMap((m) => {
      const v = (m as any)?.[key];
      return Array.isArray(v) ? v : [];
    })
  );

const extractNumber = (
  models: readonly ModelResult[],
  key: string
): number =>
  avg(
    models.map((m) => {
      const v = (m as any)?.[key];
      return typeof v === "number" ? v : undefined;
    })
  );

const extractRoadmap = (
  models: readonly ModelResult[],
  month: "month1" | "month2" | "month3"
): string[] =>
  uniq(
    models.flatMap((m) => {
      const rm = (m as any)?.roadmap_90d;
      if (rm && typeof rm === "object" && Array.isArray(rm[month])) {
        return rm[month];
      }
      return [];
    })
  );

/* ============================================================
   PAGE BUILDERS
============================================================ */

function executiveThesisPage(): ReportPage {
  return {
    id: "01",
    title: "Executive Thesis",
    content: [
      "De organisatie bevindt zich op een strategisch kantelpunt.",
      "De gekozen richting is inhoudelijk verdedigbaar, maar structureel kwetsbaar.",
      "Zonder expliciete keuzes en stop-beslissingen verdunt executiekracht.",
      "Strategie zonder verlies leidt tot fragmentatie en bestuurlijk risico.",
    ],
  };
}

function centralTensionPage(): ReportPage {
  return {
    id: "02",
    title: "Central Strategic Tension",
    content: [
      "Ambitie versus executiecapaciteit",
      "Schaal versus bestuurbaarheid",
      "Samenwerking versus eigenaarschap",
      "Niet alle dimensies zijn gelijktijdig maximaliseerbaar",
    ],
  };
}

function externalRealityPages(models: readonly ModelResult[]): ReportPage[] {
  return [
    {
      id: "03",
      title: "External Reality – Macro Dynamics",
      content: uniq([
        ...extractArray(models, "insights"),
        "Externe druk neemt structureel toe.",
        "Regelgeving, verwachtingen en concurrentie versnellen gelijktijdig.",
      ]),
    },
    {
      id: "04",
      title: "Market & Competitive Pressure",
      content: uniq([
        ...extractArray(models, "risks"),
        "Differentiatie is geen keuze maar randvoorwaarde.",
        "Afwezigheid van focus vergroot substitutierisico.",
      ]),
    },
  ];
}

function internalAlignmentPages(models: readonly ModelResult[]): ReportPage[] {
  return [
    {
      id: "05",
      title: "Internal Alignment",
      content: uniq([
        ...extractArray(models, "strengths"),
        "Strategische competentie is aanwezig maar versnipperd.",
        "Besluitvorming is onvoldoende institutioneel verankerd.",
      ]),
    },
    {
      id: "06",
      title: "Structural Frictions",
      content: uniq([
        ...extractArray(models, "weaknesses"),
        "Mandaten overlappen of ontbreken.",
        "Initiatieven concurreren om schaarse aandacht.",
      ]),
    },
  ];
}

function strategicChoicePages(models: readonly ModelResult[]): ReportPage[] {
  return [
    {
      id: "07",
      title: "Strategic Non-Choices (What to Stop)",
      content: [
        "Stoppen met initiatieven zonder expliciet eigenaarschap.",
        "Geen parallelle strategieën zonder prioriteitsvolgorde.",
        "Geen schaal zonder vooraf gedefinieerde governance.",
      ],
    },
    {
      id: "08",
      title: "Strategic Choices",
      content: uniq([
        ...extractArray(models, "opportunities"),
        "Kiezen voor regisseurschap binnen afgebakende domeinen.",
        "Institutionaliseren van besluitvorming en accountability.",
      ]),
    },
  ];
}

function executionPages(models: readonly ModelResult[]): ReportPage[] {
  return [
    {
      id: "09",
      title: "Execution Model",
      content: uniq([
        ...extractArray(models, "recommendations"),
        "Heldere besluitlijnen per strategisch thema.",
        "Periodieke voortgangsbesluiten op bestuursniveau.",
      ]),
    },
    {
      id: "10",
      title: "Risk Governance",
      content: uniq([
        ...extractArray(models, "risks"),
        "Actieve risicosturing voorkomt strategische erosie.",
      ]),
    },
  ];
}

/* ============================================================
   MASTER BUILDER — FOUTLOOS & MAXIMAL
============================================================ */

export class BoardroomReportBuilder {
  build(
    _context: AnalysisContext,
    models: readonly ModelResult[]
  ): BoardroomReport {
    const pages: ReportPage[] = [
      executiveThesisPage(),
      centralTensionPage(),
      ...externalRealityPages(models),
      ...internalAlignmentPages(models),
      ...strategicChoicePages(models),
      ...executionPages(models),
    ];

    const roadmap_90d: Roadmap90D = {
      month1: extractRoadmap(models, "month1"),
      month2: extractRoadmap(models, "month2"),
      month3: extractRoadmap(models, "month3"),
    };

    const confidence = extractNumber(models, "confidence");
    const score = extractNumber(models, "score");

    const urgency =
      score > 0 && score < 70
        ? "Hoog – fundamentele keuzes vereist binnen 90 dagen"
        : "Middel – focus op consolidatie en verdieping";

    return {
      title: "Boardroom Strategy Report",
      executive_thesis:
        "De strategie is inhoudelijk valide, maar faalt zonder expliciete keuzes, stop-beslissingen en executiemodel.",
      central_tension:
        "Ambitie en schaal botsen met beperkte executiecapaciteit onder toenemende externe druk.",
      pages,
      roadmap_90d,
      confidence,
      urgency,
      score,
      metadata: {
        page_count: pages.length,
        maturity: "mckinsey-plus",
        engine: "aurelius-boardroom",
        strict_mode: true,
      },
    };
  }
}

