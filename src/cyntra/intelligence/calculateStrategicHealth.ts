import type { StrategicHealthFactors, StrategicHealthOutput } from "./types";

interface CalculateStrategicHealthInput extends StrategicHealthFactors {
  sriTrend: Array<{ sri: number }>;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function trendFromSlice(series: Array<{ sri: number }>, days: number): number {
  if (series.length < 2) return 0;
  const last = series[series.length - 1]?.sri ?? 0;
  const refIndex = Math.max(0, series.length - (days + 1));
  const ref = series[refIndex]?.sri ?? series[0]?.sri ?? last;
  return Number((last - ref).toFixed(2));
}

function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = values.reduce((sum, n) => sum + n, 0) / values.length;
  const variance =
    values.reduce((sum, n) => sum + (n - avg) ** 2, 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

export function calculateStrategicHealth(
  input: CalculateStrategicHealthInput
): StrategicHealthOutput {
  const governance = clamp(input.governance_score);
  const consistency = clamp(input.execution_consistency);
  const driftInverse = clamp(input.drift_stability_inverse);
  const riskInverse = clamp(input.risk_density_inverse);
  const velocity = clamp(input.decision_velocity);
  const boardIndex = clamp(
    Number.isFinite(input.board_adoption_legitimacy_index)
      ? Number(input.board_adoption_legitimacy_index)
      : 7,
    0,
    10
  );
  const boardIndexScore = boardIndex * 10;

  const score =
    governance * 0.25 +
    consistency * 0.2 +
    driftInverse * 0.15 +
    riskInverse * 0.15 +
    velocity * 0.1 +
    boardIndexScore * 0.15;

  const trend7d = trendFromSlice(input.sriTrend, 7);
  const trend30d = trendFromSlice(input.sriTrend, 30);

  const volatility = stdev(
    input.sriTrend.slice(-14).map((point) => clamp(point.sri))
  );
  const volatility_flag = volatility >= 4.5;

  return {
    score: Number(clamp(score).toFixed(2)),
    trend7d,
    trend30d,
    volatility_flag,
    board_adoption_legitimacy_index: Number(boardIndex.toFixed(2)),
  };
}
