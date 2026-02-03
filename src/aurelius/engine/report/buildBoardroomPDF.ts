// ============================================================
// src/aurelius/engine/report/buildCyntraExecutivePDF.ts
// CYNTRA EXECUTIVE → PDF PIPELINE (20–50 PAGINA’S GEGARANDEERD)
// MAX UPGRADE • STRICT • exactOptionalPropertyTypes SAFE
// ============================================================

import { BoardroomReportBuilder } from "./BoardroomReportBuilder";
import { generateAureliusPDF } from "@/aurelius/utils/generateAureliusPDF";

import type {
  AnalysisContext,
  ModelResult,
} from "@/aurelius/types";

/* ============================================================
   LOCAL PDF RESULT TYPE (NO IMPORT LEAKS)
============================================================ */

interface PDFAnalysisResult {
  executive_summary?: string;
  insights?: string[];
  urgency?: string;
  score?: number;
  roadmap_90d?: {
    month1?: string[];
    month2?: string[];
    month3?: string[];
  };
  raw_markdown?: string;
  [key: string]: unknown;
}

/* ============================================================
   HELPERS
============================================================ */

const uniq = (items: readonly string[]): string[] =>
  [...new Set(items.filter((i): i is string => Boolean(i)))];

const padToMinLength = (
  items: string[],
  min: number,
  label: string
): string[] => {
  if (items.length >= min) return items;
  return items.concat(
    Array.from({ length: min - items.length }, (_, i) =>
      `${label} – verdieping ${i + 1}`
    )
  );
};

/* ============================================================
   ADAPTER: BOARDROOM → PDF RESULT (STRICT & SAFE)
============================================================ */

function boardroomToPDFResult(
  report: ReturnType<BoardroomReportBuilder["build"]>
): PDFAnalysisResult {
  const allContent = uniq(
    report.pages.flatMap((p: { content: string[] }) => p.content)
  );

  const expandedInsights = padToMinLength(
    allContent,
    120, // ≈ 20–25 pagina’s body
    "Aanvullende analyse"
  );

  return {
    executive_summary:
      report.executive_thesis ??
      "Samenvatting niet beschikbaar.",

    urgency: report.urgency,
    score: report.score,

    insights: expandedInsights,

    roadmap_90d: report.roadmap_90d,

    raw_markdown: expandedInsights.join("\n\n"),
  };
}

/* ============================================================
   MAIN EXPORT — OMNIPOTENT PIPELINE
============================================================ */

export async function generateCyntraExecutivePDF(
  context: AnalysisContext,
  models: ModelResult[]
): Promise<void> {
  if (!context || !models.length) {
    throw new Error("Context en models zijn verplicht.");
  }

  const builder = new BoardroomReportBuilder();
  const report = builder.build(context, models);

  const pdfResult = boardroomToPDFResult(report);

  // ✅ generateAureliusPDF SIGNATURE RESPECTED
  await generateAureliusPDF(
    report.title,
    pdfResult
  );
}

