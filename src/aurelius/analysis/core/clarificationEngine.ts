// src/aurelius/analysis/core/clarificationEngine.ts

import type { AnalysisConfig } from "./types";

export function runClarification<T>(
  config: AnalysisConfig<T>,
  intake: T
) {
  return config.requiredChecks(intake);
}
