// ============================================================
// src/aurelius/types/aureliusInput.ts
// INPUT CONTRACT — UPGRADE ONLY • FOUTLOOS • EXACT BARREL MATCH
// ============================================================

// ✅ IMPORT EXACT WAT HET BARREL ÉCHT EXPORTEERT
// ⛔️ GEEN GISSEN, GEEN ALIASES, GEEN DOWNGRADE

import type { AnalysisType } from ".";

export interface AureliusInput {
  analysisType: AnalysisType;

  intake: {
    companyName?: string;
    situation?: string;
    goals?: string;
    challenges?: string;
    teamDescription?: string;

    includeCulture?: boolean;
    culture?: {
      clarity: number;
      execution: number;
      feedback: number;
    };
  };

  documentData?: string;
}

