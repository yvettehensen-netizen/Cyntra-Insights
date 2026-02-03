// src/aurelius/analysis/core/analysisRunner.ts

import type { AnalysisConfig, AnalysisResponse } from "./types";
import { runClarification } from "./clarificationEngine";

export async function runAnalysis<TIntake, TResult>(
  config: AnalysisConfig<TIntake>,
  intake: TIntake,
  executor: (intake: TIntake) => Promise<TResult>
): Promise<AnalysisResponse<TResult>> {
  const clarification = runClarification(config, intake);

  if (!clarification.ok) {
    return {
      status: "needs_clarification",
      questions: clarification.questions,
    };
  }

  try {
    const result = await executor(intake);
    return {
      status: "completed",
      result,
    };
  } catch (err) {
    return {
      status: "error",
      error_message: "Analyse mislukt",
      details: err,
    };
  }
}
