import {
  ENGINE_CONTRACT_SPECS,
  type EngineContractName,
} from "@/aurelius/contracts/EngineContracts";
import { logStabilityWarning, type StabilityWarning } from "./OutputContractGuard";

export type EngineContractGuardResult<T> = {
  value: T;
  warnings: StabilityWarning[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function getValueType(value: unknown): "object" | "array" | "string" | "other" {
  if (Array.isArray(value)) return "array";
  if (typeof value === "string") return "string";
  if (typeof value === "object" && value !== null) return "object";
  return "other";
}

export function runEngineContractGuard<T extends Record<string, unknown>>(
  contract: EngineContractName,
  value: T
): EngineContractGuardResult<T> {
  const spec = ENGINE_CONTRACT_SPECS[contract];
  const warnings: StabilityWarning[] = [];

  for (const requiredKey of spec.requiredKeys) {
    if (!(requiredKey in value)) {
      const warning: StabilityWarning = {
        guard: "EngineContractGuard",
        layer: contract,
        message: `Ontbrekende contractkey: '${requiredKey}'.`,
        timestamp: nowIso(),
      };
      warnings.push(warning);
      logStabilityWarning(warning);
      continue;
    }

    const expectedType = spec.typeChecks[requiredKey];
    const actualType = getValueType((value as Record<string, unknown>)[requiredKey]);
    if (expectedType && actualType !== expectedType) {
      const warning: StabilityWarning = {
        guard: "EngineContractGuard",
        layer: contract,
        message: `Type mismatch op '${requiredKey}': verwacht '${expectedType}', kreeg '${actualType}'.`,
        timestamp: nowIso(),
      };
      warnings.push(warning);
      logStabilityWarning(warning);
    }
  }

  return { value, warnings };
}
