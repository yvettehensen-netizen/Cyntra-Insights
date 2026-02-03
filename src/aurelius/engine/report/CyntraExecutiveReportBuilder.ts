// ============================================================
// CYNTRA EXECUTIVE REPORT BUILDER — BOARDROOM GRADE (MAXIMAL)
// EXTENDS CORE WITHOUT BEHAVIOR LOSS
// ============================================================

import { BoardroomReportBuilder } from "./BoardroomReportBuilder";
import type { AnalysisContext, ModelResult } from "@/aurelius/types";

export class CyntraExecutiveReportBuilder extends BoardroomReportBuilder {
  build(context: AnalysisContext, models: ModelResult[]) {
    const report = super.build(context, models);

    return {
      ...report,

      meta: {
        ...(report as any).meta,
        engine: "Aurelius",
        grade: "boardroom_maximal",
        confidence: "HIGH",
        decision_pressure: "EXPLICIT",
        loss_enforced: true,
        document_capacity: "30+",
        generated_at: new Date().toISOString(),
      },
    };
  }
}
