// src/aurelius/orchestrator/types.ts
// ============================================================
// ORCHESTRATOR TYPES — HEILIG
// ALLEEN FIX: JUISTE IMPORT-PADEN
// ============================================================

import type { AnalysisType } from "../types"; // ✅ BESTAAT
import type { ReportSection } from "../config/reportFlow";

/* ============================================================================
   ✅ ADDITION — ORCHESTRATOR INPUT (TYPING-ONLY)
   (Required by runAurelius.ts import)
============================================================================ */

export interface OrchestratorInput {
  readonly analysis_type: AnalysisType;
  readonly company_context: string;
  readonly document_context?: string;
  readonly [key: string]: unknown;
}

/* ============================================================================
   ORCHESTRATOR — CORE RESULT TYPE
============================================================================ */

export interface OrchestratorResult {
  readonly analysis_type: AnalysisType;
  readonly raw_analysis: string | Record<string, unknown>;
  readonly sections: Partial<Record<ReportSection, unknown>> & {
    readonly [key: string]: unknown;
  };
  readonly meta: OrchestratorMeta;
}

/* ============================================================================
   META & OBSERVABILITY
============================================================================ */

export interface OrchestratorMeta {
  readonly consultants_run: readonly ReportSection[];
  readonly failed_consultants: readonly ReportSection[];
  readonly duration_ms: number;
  readonly timestamp?: string;
  readonly engine_version?: string;
  readonly warnings?: readonly string[];
  readonly audit_trail?: readonly OrchestratorAuditEntry[];
  readonly [key: string]: unknown;
}

export interface OrchestratorAuditEntry {
  readonly step: string;
  readonly duration_ms: number;
  readonly status: "success" | "failure" | "skipped";
  readonly details?: unknown;
}

/* ============================================================================
   TYPED VARIANT — POST NORMALIZATION ONLY
============================================================================ */

export type TypedOrchestratorResult<
  Sections extends Record<ReportSection, unknown>
> = Omit<OrchestratorResult, "sections"> & {
  readonly sections: Sections;
};
