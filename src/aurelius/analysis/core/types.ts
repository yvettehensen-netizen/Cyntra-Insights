// ============================================================
// src/aurelius/analysis/core/types.ts
// ============================================================

export type AnalysisStatus =
  | "needs_clarification"
  | "completed"
  | "error";

export interface ClarificationQuestion {
  id: string;
  question: string;
  required: boolean;
  type: "text" | "select";
  options?: string[];
  placeholder?: string;
}

export interface AnalysisResponse<TResult = unknown> {
  status: AnalysisStatus;
  result?: TResult;
  questions?: ClarificationQuestion[];
  error_message?: string;
  details?: unknown;
}

export interface AnalysisConfig<TIntake> {
  analysisType: string;
  description: string;
  requiredChecks: (
    intake: TIntake
  ) => { ok: true } | { ok: false; questions: ClarificationQuestion[] };
}
