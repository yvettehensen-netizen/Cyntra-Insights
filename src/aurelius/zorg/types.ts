// ============================================================
// ZORG BESLUITVORMINGSKAART — CANON OUTPUT V1
// Boardroom-grade Decision Flow Map
// ============================================================

export type DecisionNode = {
  node: string;

  functie: string;

  spanning: string;

  failure_mode: string;

  signal: string;

  interventie: string;
};

export interface ZorgBesluitvormingskaartReport {
  titel: string;

  executive_summary: string;

  besluitvormingskaart: DecisionNode[];

  blokkades: string[];

  governance_risicos: string[];

  roadmap_90d: {
    maand1: string[];
    maand2: string[];
    maand3: string[];
  };

  boardroom_brief: string;

  confidence_score?: number;
}
