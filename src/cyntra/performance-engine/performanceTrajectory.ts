import { calculateDSIImprovement } from "./calculateDSIImprovement";
import type {
  DecisionStrengthIndexOutput,
  OrganisationPerformanceBaselineRow,
  OrganisationPerformanceSnapshotRow,
  PerformanceTrajectoryOutput,
  PerformanceTrajectoryPoint,
} from "./types";

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function daysBetween(from: Date, to: Date): number {
  const ms = Math.max(0, to.getTime() - from.getTime());
  return Math.floor(ms / 86_400_000);
}

function nearestSnapshotForDay(
  snapshots: OrganisationPerformanceSnapshotRow[],
  baselineDate: Date,
  targetDay: number
): OrganisationPerformanceSnapshotRow | null {
  if (!snapshots.length) return null;

  let best: OrganisationPerformanceSnapshotRow | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const snapshot of snapshots) {
    const snapshotDate = new Date(snapshot.snapshot_timestamp);
    if (Number.isNaN(snapshotDate.getTime())) continue;

    const day = daysBetween(baselineDate, snapshotDate);
    const diff = Math.abs(day - targetDay);

    if (diff < bestDiff) {
      best = snapshot;
      bestDiff = diff;
    }
  }

  return best;
}

function dsiTrendFromHistory(params: {
  snapshots: OrganisationPerformanceSnapshotRow[];
  currentDsi: number;
  baselineDsi: number;
  referenceDate: Date;
  days: number;
}): number {
  const target = new Date(params.referenceDate);
  target.setDate(target.getDate() - params.days);

  let closest: OrganisationPerformanceSnapshotRow | null = null;
  for (let index = params.snapshots.length - 1; index >= 0; index -= 1) {
    const row = params.snapshots[index];
    const rowDate = new Date(row.snapshot_timestamp);
    if (Number.isNaN(rowDate.getTime())) continue;
    if (rowDate <= target) {
      closest = row;
      break;
    }
  }

  const referenceDsi = closest ? closest.dsi : params.baselineDsi;
  return round(params.currentDsi - referenceDsi);
}

function pointForDay(params: {
  day: 0 | 30 | 60 | 90;
  baseline: OrganisationPerformanceBaselineRow;
  currentDsi: number;
  currentExecutionScore: number;
  daysSinceBaseline: number;
  snapshots: OrganisationPerformanceSnapshotRow[];
  baselineDate: Date;
}): PerformanceTrajectoryPoint {
  const labels: Record<0 | 30 | 60 | 90, string> = {
    0: "Start",
    30: "30 dagen",
    60: "60 dagen",
    90: "90 dagen",
  };

  if (params.day === 0) {
    return {
      dag: 0,
      label: labels[0],
      dsi: round(params.baseline.baseline_dsi),
      verbetering_pct: 0,
      execution_score: round(params.baseline.baseline_execution_score),
    };
  }

  const snapshot = nearestSnapshotForDay(
    params.snapshots,
    params.baselineDate,
    params.day
  );

  let dsiValue = params.currentDsi;
  let executionScore = params.currentExecutionScore;

  if (snapshot) {
    dsiValue = snapshot.dsi;
    executionScore = snapshot.execution_score;
  } else if (params.daysSinceBaseline > 0) {
    const ratio = clamp(params.day / params.daysSinceBaseline, 0, 1);
    dsiValue =
      params.baseline.baseline_dsi +
      (params.currentDsi - params.baseline.baseline_dsi) * ratio;
    executionScore =
      params.baseline.baseline_execution_score +
      (params.currentExecutionScore - params.baseline.baseline_execution_score) * ratio;
  }

  const improvementPct =
    params.baseline.baseline_dsi <= 0
      ? 0
      : ((dsiValue - params.baseline.baseline_dsi) / params.baseline.baseline_dsi) * 100;

  return {
    dag: params.day,
    label: labels[params.day],
    dsi: round(clamp(dsiValue, 0, 10)),
    verbetering_pct: round(improvementPct),
    execution_score: round(clamp(executionScore, 0, 100)),
  };
}

export function buildPerformanceTrajectory(params: {
  organisationId: string;
  baseline: OrganisationPerformanceBaselineRow;
  current_dsi: number;
  current_execution_score: number;
  snapshots: OrganisationPerformanceSnapshotRow[];
  timestamp?: string;
}): PerformanceTrajectoryOutput {
  const now = new Date(params.timestamp || new Date().toISOString());
  const baselineDate = new Date(params.baseline.baseline_timestamp);
  const daysSinceBaseline = daysBetween(baselineDate, now);

  const currentDsi = round(clamp(params.current_dsi, 0, 10));
  const evolution = calculateDSIImprovement({
    baseline_dsi: params.baseline.baseline_dsi,
    current_dsi: currentDsi,
    baseline_timestamp: params.baseline.baseline_timestamp,
    timestamp: now.toISOString(),
  });

  const trend30d = dsiTrendFromHistory({
    snapshots: params.snapshots,
    currentDsi,
    baselineDsi: params.baseline.baseline_dsi,
    referenceDate: now,
    days: 30,
  });
  const trend60d = dsiTrendFromHistory({
    snapshots: params.snapshots,
    currentDsi,
    baselineDsi: params.baseline.baseline_dsi,
    referenceDate: now,
    days: 60,
  });
  const trend90d = dsiTrendFromHistory({
    snapshots: params.snapshots,
    currentDsi,
    baselineDsi: params.baseline.baseline_dsi,
    referenceDate: now,
    days: 90,
  });

  const dsi: DecisionStrengthIndexOutput = {
    organisationId: params.organisationId,
    baseline_dsi: round(params.baseline.baseline_dsi),
    current_dsi: currentDsi,
    trend_30d: trend30d,
    trend_60d: trend60d,
    trend_90d: trend90d,
    improvement_pct: evolution.improvement_pct,
    timestamp: now.toISOString(),
  };

  const trajectory: PerformanceTrajectoryPoint[] = [
    pointForDay({
      day: 0,
      baseline: params.baseline,
      currentDsi,
      currentExecutionScore: params.current_execution_score,
      daysSinceBaseline,
      snapshots: params.snapshots,
      baselineDate,
    }),
    pointForDay({
      day: 30,
      baseline: params.baseline,
      currentDsi,
      currentExecutionScore: params.current_execution_score,
      daysSinceBaseline,
      snapshots: params.snapshots,
      baselineDate,
    }),
    pointForDay({
      day: 60,
      baseline: params.baseline,
      currentDsi,
      currentExecutionScore: params.current_execution_score,
      daysSinceBaseline,
      snapshots: params.snapshots,
      baselineDate,
    }),
    pointForDay({
      day: 90,
      baseline: params.baseline,
      currentDsi,
      currentExecutionScore: params.current_execution_score,
      daysSinceBaseline,
      snapshots: params.snapshots,
      baselineDate,
    }),
  ];

  return {
    dsi,
    evolution,
    trajectory,
  };
}
