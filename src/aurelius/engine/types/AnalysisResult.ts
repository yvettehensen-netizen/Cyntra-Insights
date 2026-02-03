/* =========================
   EXECUTION
========================= */

export interface Roadmap90D {
  month1?: string[];
  month2?: string[];
  month3?: string[];
}

/* =========================
   CONSULTANT OUTPUT — MCKINSEY LEVEL
========================= */

export interface ModelResult {
  /* Identity */
  model: string;

  /* Strategic synthesis */
  executive_thesis?: string;
  central_tension?: string;

  /* Analysis content */
  insights?: string[];
  strengths?: string[];
  risks?: string[];
  opportunities?: string[];
  recommendations?: string[];

  /* Execution */
  roadmap_90d?: Roadmap90D;

  /* Governance */
  confidence: number;
  urgency?: string;
  score?: number;

  /* Diagnostics / audit */
  metadata?: Record<string, unknown>;
}
