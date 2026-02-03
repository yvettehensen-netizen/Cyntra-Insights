// ============================================================
// src/aurelius/engine/adapters/fromAureliusInput.ts
// API → ENGINE CONTEXT (ONLY ALLOWED CONVERSION)
// UPGRADE ONLY • FOUTLOOS • exactOptionalPropertyTypes SAFE
// ============================================================

import type { AureliusInput } from "@/aurelius/types/aureliusInput";
import type { AnalysisContext } from "@/aurelius/engine/types/AnalysisContext";

export function fromAureliusInput(
  input: AureliusInput
): AnalysisContext {
  const rawText = [
    input.intake?.situation,
    input.intake?.goals,
    input.intake?.challenges,
    input.intake?.teamDescription,
  ]
    .filter((v): v is string => Boolean(v?.trim()))
    .join("\n\n");

  const context: AnalysisContext = {
    analysisType: input.analysisType,
    rawText,
    brutalMode: true,
    ...(input.intake?.companyName
      ? { companyName: input.intake.companyName }
      : {}),
    ...(input.documentData
      ? { documents: [input.documentData] }
      : {}),
  };

  return context;
}



