// src/aurelius/orchestrator/consultantContract.ts

export interface ConsultantContract {
  /** Unieke scope: waar MAG deze consultant over praten */
  allowedDomains: string[];

  /** Verboden overlap (anti-echo) */
  forbiddenDomains: string[];

  /** Verplichte outputstructuur */
  requiredSections: string[];

  /** Minimum output-eisen */
  constraints: {
    minWords: number;
    minInsights: number;
    mustContainEvidence: boolean;
  };

  /** Anti-echo regels */
  antiEcho: {
    forbidReuseOfPhrases: boolean;
    forbidExecutiveSummary: boolean;
  };
}
