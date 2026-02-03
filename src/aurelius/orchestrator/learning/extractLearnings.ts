// ============================================================
// src/aurelius/orchestrator/learning/extractLearnings.ts
// STRUCTURAL LEARNING ONLY — NO ACTOR BEHAVIOR
// ============================================================

import type { CyntraLearningItem } from "../charter/types";
import { enforceLearningCharter } from "../charter/enforceCharter";
import { recordLearning } from "./logLearning";

export function extractStructuralLearning(
  analysis_type: string,
  raw_report: string
): CyntraLearningItem[] {
  const candidates: CyntraLearningItem[] = [];

  if (raw_report.includes("bottleneck")) {
    candidates.push({
      domain: "constraints",
      insight: "A structural bottleneck restricts execution capacity.",
      source_analysis: analysis_type,
      extracted_from: "report_text",
      confidence: 0.74,
    });
  }

  for (const item of candidates) {
    enforceLearningCharter(item);
    recordLearning(item);
  }

  return candidates;
}
