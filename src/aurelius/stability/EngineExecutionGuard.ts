import { logStabilityWarning, type StabilityWarning } from "./OutputContractGuard";

export const REQUIRED_ENGINE_ORDER = [
  "Context Layer",
  "Diagnosis Layer",
  "Contradiction Engine",
  "Mechanism Engine",
  "Strategic Insight Engine",
  "Strategic Pattern Engine",
  "Strategic Leverage Engine",
  "Strategic Simulation Engine",
  "Decision Engine",
  "Strategic OS Layer",
  "Narrative Layer",
] as const;

export type EngineLayerName = (typeof REQUIRED_ENGINE_ORDER)[number];

export type EngineExecutionGuardResult = {
  executed_layers: string[];
  warnings: StabilityWarning[];
};

function nowIso(): string {
  return new Date().toISOString();
}

export class EngineExecutionGuard {
  private readonly executedLayers: string[] = [];

  private readonly warnings: StabilityWarning[] = [];

  record(layer: string): void {
    this.executedLayers.push(layer);
    this.validateLatest(layer);
  }

  private validateLatest(layer: string): void {
    const expected = REQUIRED_ENGINE_ORDER[this.executedLayers.length - 1];
    if (expected !== layer) {
      const warning: StabilityWarning = {
        guard: "EngineExecutionGuard",
        layer,
        message: `Volgorde afwijking: verwacht '${expected}', ontvangen '${layer}'.`,
        timestamp: nowIso(),
      };
      this.warnings.push(warning);
      logStabilityWarning(warning);
    }
  }

  snapshot(): EngineExecutionGuardResult {
    return {
      executed_layers: [...this.executedLayers],
      warnings: [...this.warnings],
    };
  }
}
