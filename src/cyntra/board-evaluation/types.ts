export interface BoardEvaluationScores {
  clarity_score: number;
  decision_certainty: number;
  risk_understanding: number;
  governance_trust: number;
  instrument_perception: number;
}

export interface BoardEvaluationInsert extends BoardEvaluationScores {
  board_member_id: string;
  organisation_id: string;
}

export interface BoardEvaluationRow extends BoardEvaluationInsert {
  id: string;
  overall_score: number;
  created_at: string;
}

export interface BoardEvaluationOutput extends BoardEvaluationScores {
  board_member_id: string;
  overall_score: number;
  timestamp: string;
}

export type BoardMaturityClassification =
  | "Rapport"
  | "Adviesinstrument"
  | "Besluitinstrument"
  | "Bestuurlijke controlelaag";

export interface BoardEvaluationAggregate {
  sample_size: number;
  averages: BoardEvaluationScores;
  overall_average: number;
  spread: {
    min: number;
    max: number;
  };
  confidence_band: {
    lower: number;
    upper: number;
  };
  board_adoption_legitimacy_index: number;
  board_adoption_legitimacy_classification: BoardMaturityClassification;
  board_maturity_index: number;
  board_maturity_classification: BoardMaturityClassification;
  latest_timestamp: string | null;
}

export type BoardAdoptionLegitimacyIndexAggregate = BoardEvaluationAggregate;
