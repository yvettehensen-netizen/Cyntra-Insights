// ============================================================
// ✅ RUN AURELIUS ENGINE — BACKEND API CLIENT
// Path: src/aurelius/engine/runAurelius.ts
// ============================================================

import {
  normalizeAureliusResultContract,
  type AureliusResult,
} from "@/aurelius/types/aureliusResult";
import { validateEngineOutput } from "@/aurelius/validation/EngineOutputValidator";
import { runImmediateAnalysis } from "@/api/analysisExecution";

export type EngineSuccess = {
  success: true;
  result: AureliusResult;
};

export type EngineFailure = {
  success: false;
  error: { message: string };
};

export async function runAureliusEngine(input: {
  analysis_type: string;
  company_context: string;
  document_data?: string;
}): Promise<EngineSuccess | EngineFailure> {
  try {
    const { resultPayload } = await runImmediateAnalysis({
      organization: "Organisatie",
      description: input.company_context,
      context: {
        analysis_type: input.analysis_type,
        document_data: input.document_data ?? "",
      },
      runImmediately: true,
    });
    const result = normalizeAureliusResultContract(resultPayload);

    return { success: true, result: validateEngineOutput(result) as AureliusResult };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : "Analyse engine fout",
      },
    };
  }
}
