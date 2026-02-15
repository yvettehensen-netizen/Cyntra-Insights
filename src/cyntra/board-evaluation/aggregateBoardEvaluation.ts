import type {
  BoardEvaluationAggregate,
  BoardEvaluationOutput,
  BoardEvaluationRow,
  BoardEvaluationScores,
  BoardMaturityClassification,
} from "./types";

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, Number.isFinite(value) ? value : 0));
}

function round(value: number, digits = 2): number {
  return Number(clampScore(value).toFixed(digits));
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

export function normalizeBoardScores(scores: BoardEvaluationScores): BoardEvaluationScores {
  return {
    clarity_score: round(scores.clarity_score),
    decision_certainty: round(scores.decision_certainty),
    risk_understanding: round(scores.risk_understanding),
    governance_trust: round(scores.governance_trust),
    instrument_perception: round(scores.instrument_perception),
  };
}

export function calculateOverallScore(scores: BoardEvaluationScores): number {
  const normalized = normalizeBoardScores(scores);
  return round(
    (normalized.clarity_score +
      normalized.decision_certainty +
      normalized.risk_understanding +
      normalized.governance_trust +
      normalized.instrument_perception) /
      5
  );
}

export function classifyBoardMaturity(index: number): BoardMaturityClassification {
  const score = clampScore(index);
  if (score < 4) return "Rapport";
  if (score < 7) return "Adviesinstrument";
  if (score < 9) return "Besluitinstrument";
  return "Bestuurlijke controlelaag";
}

export function toBoardEvaluationOutput(
  row: Pick<
    BoardEvaluationRow,
    | "board_member_id"
    | "clarity_score"
    | "decision_certainty"
    | "risk_understanding"
    | "governance_trust"
    | "instrument_perception"
    | "overall_score"
    | "created_at"
  >
): BoardEvaluationOutput {
  const scores = normalizeBoardScores(row);
  return {
    board_member_id: row.board_member_id,
    ...scores,
    overall_score: round(row.overall_score),
    timestamp: row.created_at,
  };
}

export function aggregateBoardEvaluations(
  rows: BoardEvaluationRow[]
): BoardEvaluationAggregate {
  if (!rows.length) {
    return {
      sample_size: 0,
      averages: {
        clarity_score: 0,
        decision_certainty: 0,
        risk_understanding: 0,
        governance_trust: 0,
        instrument_perception: 0,
      },
      overall_average: 0,
      spread: { min: 0, max: 0 },
      confidence_band: { lower: 0, upper: 0 },
      board_adoption_legitimacy_index: 0,
      board_adoption_legitimacy_classification: "Rapport",
      board_maturity_index: 0,
      board_maturity_classification: "Rapport",
      latest_timestamp: null,
    };
  }

  const normalized = rows.map((row) => ({
    ...row,
    ...normalizeBoardScores(row),
    overall_score: round(row.overall_score),
  }));

  const clarity = normalized.map((row) => row.clarity_score);
  const decision = normalized.map((row) => row.decision_certainty);
  const risk = normalized.map((row) => row.risk_understanding);
  const governance = normalized.map((row) => row.governance_trust);
  const instrument = normalized.map((row) => row.instrument_perception);
  const overall = normalized.map((row) => row.overall_score);

  const averages: BoardEvaluationScores = {
    clarity_score: round(mean(clarity)),
    decision_certainty: round(mean(decision)),
    risk_understanding: round(mean(risk)),
    governance_trust: round(mean(governance)),
    instrument_perception: round(mean(instrument)),
  };

  const overallAverage = round(mean(overall));
  const min = round(Math.min(...overall));
  const max = round(Math.max(...overall));

  const margin = 1.96 * (stdev(overall) / Math.sqrt(overall.length));
  const confidenceBand = {
    lower: round(overallAverage - margin),
    upper: round(overallAverage + margin),
  };

  const boardMaturityIndex = round(
    (averages.clarity_score +
      averages.decision_certainty +
      averages.governance_trust) /
      3
  );

  return {
    sample_size: normalized.length,
    averages,
    overall_average: overallAverage,
    spread: { min, max },
    confidence_band: confidenceBand,
    board_adoption_legitimacy_index: boardMaturityIndex,
    board_adoption_legitimacy_classification: classifyBoardMaturity(boardMaturityIndex),
    board_maturity_index: boardMaturityIndex,
    board_maturity_classification: classifyBoardMaturity(boardMaturityIndex),
    latest_timestamp: normalized[0]?.created_at ?? null,
  };
}
