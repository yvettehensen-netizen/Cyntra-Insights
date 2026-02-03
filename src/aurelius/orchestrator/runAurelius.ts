// src/aurelius/orchestrator/runAurelius.ts

import type { OrchestratorInput, OrchestratorResult } from "./types";
import { ANALYSIS_CONSULTANTS } from "./analysisMap";
import { CONSULTANT_REGISTRY } from "./consultantRegistry";
import { runConsultant } from "./runConsultant";
import { synthesizeRawAnalysis } from "./synthesizeRawAnalysis";
import type { ReportSection } from "../config/reportFlow";

export async function runAurelius(
  input: OrchestratorInput
): Promise<OrchestratorResult> {
  const start = performance.now();

  const context = [
    input.company_context.trim(),
    input.document_context
      ? `\n\nDocument:\n${input.document_context.trim()}`
      : "",
  ]
    .join("\n\n")
    .trim();

  /* ============================================================================
     ✅ ADDITION — TYPE BRIDGE (TYPING-ONLY)
     Fix ts7053: RegistryKey kan niet indexen op CONSULTANT_REGISTRY
  ============================================================================ */
  type SafeRegistryKey = keyof typeof CONSULTANT_REGISTRY;

  const registryKeys =
    ANALYSIS_CONSULTANTS[input.analysis_type] as unknown as SafeRegistryKey[];

  const sections: Partial<Record<ReportSection, unknown>> = {};
  const failed = new Set<ReportSection>();
  const run = new Set<ReportSection>();

  await Promise.all(
    registryKeys.map(async (key) => {
      const consultant = CONSULTANT_REGISTRY[key];
      const target = key as unknown as ReportSection; // 🔥 CRUCIAAL

      run.add(target);

      const result = await runConsultant(consultant, context);

      if (!result.success) {
        failed.add(target);
        return;
      }

      sections[target] = result.value;
    })
  );

  const raw_analysis = synthesizeRawAnalysis(
    sections as Record<ReportSection, unknown>
  );

  return {
    analysis_type: input.analysis_type,
    raw_analysis,
    sections: sections as Record<ReportSection, unknown>,
    meta: {
      consultants_run: Array.from(run),
      failed_consultants: Array.from(failed),
      duration_ms: Math.round(performance.now() - start),
    },
  };
}
