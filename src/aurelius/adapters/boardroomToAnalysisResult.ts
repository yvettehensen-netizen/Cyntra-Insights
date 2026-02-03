// src/aurelius/adapters/boardroomToAnalysisResult.ts
// ✅ NIEUW
// ✅ VERBINDT BOARDROOM → PDF ENGINE
// ✅ GEEN ENGINE AANPASSINGEN

import type { BoardroomReport } from "@/aurelius/engine/report/BoardroomReportBuilder";

export function boardroomToAnalysisResult(report: BoardroomReport) {
  return {
    executive_summary: report.executive_thesis,
    urgency: report.urgency,
    score: Math.round(report.score),
    confidence: report.confidence,

    insights: report.pages.flatMap((p) => p.content),

    risks: report.pages
      .filter((p) =>
        p.title.toLowerCase().includes("risk")
      )
      .flatMap((p) => p.content),

    opportunities: report.pages
      .filter((p) =>
        p.title.toLowerCase().includes("choice")
      )
      .flatMap((p) => p.content),

    roadmap_90d: report.roadmap_90d,

    central_tension: report.central_tension,
    page_count: report.pages.length,

    metadata: report.metadata,
  };
}
