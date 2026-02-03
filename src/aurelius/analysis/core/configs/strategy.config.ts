// src/aurelius/analysis/core/configs/strategy.config.ts

import type { AnalysisConfig } from "../types";
import type { StrategyInputContext } from "../../strategy/needsClarification";
import { needsStrategyClarification } from "../../strategy/needsClarification";

export const strategyAnalysisConfig: AnalysisConfig<StrategyInputContext> = {
  analysisType: "strategy",
  description: "Strategische bedrijfsanalyse",
  requiredChecks: needsStrategyClarification,
};
