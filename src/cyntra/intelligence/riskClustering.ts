import type { RiskEvolutionResponse } from "@/dashboard/executive/api/types";
import type { RiskTrajectoryOutput } from "./types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function dichtstbijProjectie(
  projectie: RiskEvolutionResponse["projectie_90_dagen"],
  targetDag: number
) {
  if (!projectie.length) {
    return { score: 0, ondergrens: 0, bovengrens: 0 };
  }

  let beste = projectie[0];
  let besteDelta = Number.POSITIVE_INFINITY;

  for (const punt of projectie) {
    const base = Date.parse(`${projectie[0].datum}T00:00:00.000Z`);
    const current = Date.parse(`${punt.datum}T00:00:00.000Z`);
    const dagen = Math.abs((current - base) / (1000 * 60 * 60 * 24));
    const delta = Math.abs(dagen - targetDag);

    if (delta < besteDelta) {
      beste = punt;
      besteDelta = delta;
    }
  }

  return {
    score: clamp(beste.score),
    ondergrens: clamp(beste.ondergrens),
    bovengrens: clamp(beste.bovengrens),
  };
}

export function riskClustering(
  risk: RiskEvolutionResponse
): RiskTrajectoryOutput {
  const current = clamp(
    risk.waargenomen_trend[risk.waargenomen_trend.length - 1]?.score ?? 0
  );

  const projection30 = dichtstbijProjectie(risk.projectie_90_dagen, 30);
  const projection90 = dichtstbijProjectie(risk.projectie_90_dagen, 90);

  return {
    current_risk_score: Number(current.toFixed(2)),
    projected_risk_30d: Number(projection30.score.toFixed(2)),
    projected_risk_90d: Number(projection90.score.toFixed(2)),
    confidence_band: [
      Number(projection90.ondergrens.toFixed(2)),
      Number(projection90.bovengrens.toFixed(2)),
    ],
  };
}
