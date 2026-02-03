// ============================================================
// src/aurelius/orchestrator/consultantTypes.ts
// AURELIUS — CONSULTANT CONTRACTS (CANONICAL)
// STRICT • TYPE-SAFE • ORCHESTRATOR-GRADE
// ============================================================

import type { AnalysisType } from "../types";
import type { ReportSection } from "../config/reportFlow";

/* ============================================================
   CONSULTANT INPUT / OUTPUT CONTRACTS
============================================================ */

export interface ConsultantContext {
  readonly analysis_type: AnalysisType;
  readonly company_context: string;
  readonly document_data?: string;
  readonly prior_sections: Partial<Record<ReportSection, unknown>>;
  readonly meta?: {
    readonly run_id?: string;
    readonly timestamp?: string;
    readonly confidence_floor?: number;
    readonly [key: string]: unknown;
  };
}

export interface ConsultantResult {
  readonly content: unknown;
  readonly confidence?: number;
  readonly warnings?: readonly string[];
  readonly meta?: {
    readonly duration_ms?: number;
    readonly token_usage?: number;
    readonly [key: string]: unknown;
  };
}

/* ============================================================
   CONSULTANT DEFINITION
============================================================ */

export interface Consultant {
  readonly key: ReportSection;
  readonly name: string;
  readonly domain: string;

  execute(
    context: ConsultantContext
  ): Promise<ConsultantResult>;
}

/* ============================================================
   🔑 CANONICAL REGISTRY KEY (FIX)
============================================================ */

/**
 * RegistryKey === exact ReportSection keys
 * Wordt gebruikt door:
 * - consultantRegistry
 * - analysisMap
 * - orchestrator
 */
export type RegistryKey = ReportSection;

/* ============================================================
   TYPE GUARD
============================================================ */

export function isConsultant(value: unknown): value is Consultant {
  if (!value || typeof value !== "object") return false;
  const v = value as Consultant;

  return (
    typeof v.key === "string" &&
    typeof v.name === "string" &&
    typeof v.domain === "string" &&
    typeof v.execute === "function"
  );
}
