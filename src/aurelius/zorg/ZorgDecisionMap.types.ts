// ============================================================
// CYNTRA ZORG — BESLUITVORMINGSKAART V1 (CANON)
// Additive only. No recommendations, only structure.
// ============================================================

export type DecisionStep = {
  fase: string;
  arena: string;
  structurele_spanning: string;
  failure_mode: string;
  signaal: string;
};

export interface ZorgDecisionMapReport {
  organisation: string;
  decision_block: string;

  primary_failure: string;

  besluitkaart: DecisionStep[];

  boardroom_brief: string;

  confidence?: number;
}
