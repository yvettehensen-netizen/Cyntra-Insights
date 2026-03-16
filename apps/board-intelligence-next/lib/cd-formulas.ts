import type {
  DecisionCycleReconstruction,
  DsiFactors,
  DsiPoint,
  GovernanceMetricObservationRow,
  InterventionRow,
} from "@/lib/cd-types";

function clamp(value: number, min = 0, max = 100): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function latestMetricValue(metrics: GovernanceMetricObservationRow[], metricCode: string): number {
  const sorted = metrics
    .filter((entry) => entry.metric_code === metricCode)
    .sort((a, b) => new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime());

  return sorted.length ? Number(sorted[0].observed_value) : 0;
}

function computeInterventionCompletion(interventions: InterventionRow[]): number {
  if (!interventions.length) return 0;
  const completed = interventions.filter((entry) => entry.status === "completed").length;
  return (completed / interventions.length) * 100;
}

function computeDecisionLatencyHours(decisionApprovedAt: string | null, openedAt: string): number {
  const opened = new Date(openedAt).getTime();
  const approved = decisionApprovedAt ? new Date(decisionApprovedAt).getTime() : Date.now();

  if (!Number.isFinite(opened) || !Number.isFinite(approved)) return 0;
  if (approved < opened) return 0;

  return (approved - opened) / (1000 * 60 * 60);
}

export function calculateDsiFromFactors(factors: DsiFactors): number {
  const conflictScore = clamp(100 - factors.conflict_count * 8);
  const executionScore = clamp(factors.execution_speed);
  const interventionScore = clamp(factors.intervention_completion_rate);
  const latencyScore = clamp(100 - factors.decision_latency * 1.25);
  const governanceScore = clamp(factors.governance_discipline);

  const score =
    conflictScore * 0.25 +
    executionScore * 0.2 +
    interventionScore * 0.2 +
    latencyScore * 0.15 +
    governanceScore * 0.2;

  return Number(score.toFixed(2));
}

export function deriveDsiFactors(input: {
  conflictCount: number;
  executionSpeed: number;
  interventionCompletionRate: number;
  decisionLatency: number;
  governanceDiscipline: number;
}): DsiFactors {
  return {
    conflict_count: Math.max(0, Number(input.conflictCount) || 0),
    execution_speed: clamp(Number(input.executionSpeed) || 0),
    intervention_completion_rate: clamp(Number(input.interventionCompletionRate) || 0),
    decision_latency: Math.max(0, Number(input.decisionLatency) || 0),
    governance_discipline: clamp(Number(input.governanceDiscipline) || 0),
  };
}

export function deriveFactorsFromReconstruction(
  payload: DecisionCycleReconstruction
): DsiFactors {
  const openConflicts = payload.issues.filter(
    (entry) => entry.issue_type === "conflict" && entry.issue_status !== "resolved"
  ).length;

  const executionSpeedRaw = latestMetricValue(payload.governanceMetrics, "decision_velocity");
  const gateScore = latestMetricValue(payload.governanceMetrics, "gate_score");
  const repairAttempts = latestMetricValue(payload.governanceMetrics, "repair_attempts");

  const interventionCompletionRate = computeInterventionCompletion(payload.interventions);

  const latestDecision = payload.decisions
    .slice()
    .sort((a, b) => new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime())[0];

  const decisionLatency = computeDecisionLatencyHours(
    latestDecision?.approved_at ?? null,
    payload.cycle.opened_at
  );

  const governanceDiscipline = clamp(gateScore - repairAttempts * 6);

  return deriveDsiFactors({
    conflictCount: openConflicts,
    executionSpeed: executionSpeedRaw,
    interventionCompletionRate,
    decisionLatency,
    governanceDiscipline,
  });
}

export function calculateDsiTrendFromDailyFactors(rows: Array<{
  date: string;
  conflict_count: number;
  execution_speed: number;
  intervention_completion_rate: number;
  decision_latency: number;
  governance_discipline: number;
}>): DsiPoint[] {
  return rows
    .map((entry) => {
      const factors = deriveDsiFactors({
        conflictCount: entry.conflict_count,
        executionSpeed: entry.execution_speed,
        interventionCompletionRate: entry.intervention_completion_rate,
        decisionLatency: entry.decision_latency,
        governanceDiscipline: entry.governance_discipline,
      });

      return {
        date: entry.date,
        dsi: calculateDsiFromFactors(factors),
        ...factors,
      };
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function estimateGovernanceDiscipline(
  metrics: GovernanceMetricObservationRow[]
): number {
  const gateScore = latestMetricValue(metrics, "gate_score");
  const repairAttempts = latestMetricValue(metrics, "repair_attempts");
  const alignment = latestMetricValue(metrics, "stakeholder_alignment");

  const baseline = gateScore > 0 ? gateScore : average([gateScore, alignment]);
  return clamp(baseline - repairAttempts * 6);
}
