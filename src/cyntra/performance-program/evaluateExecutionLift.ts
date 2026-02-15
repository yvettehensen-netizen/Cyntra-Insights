export interface ExecutionLiftEvaluation {
  baseline_execution_score: number;
  current_execution_score: number;
  delta: number;
  lift_pct: number;
  acceleration_state: "versnelling" | "stabiel" | "vertraging";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

export function evaluateExecutionLift(input: {
  baseline_execution_score: number;
  current_execution_score: number;
}): ExecutionLiftEvaluation {
  const baseline = clamp(input.baseline_execution_score, 0, 100);
  const current = clamp(input.current_execution_score, 0, 100);
  const delta = current - baseline;
  const liftPct = baseline <= 0 ? 0 : (delta / baseline) * 100;

  let accelerationState: ExecutionLiftEvaluation["acceleration_state"] = "stabiel";
  if (delta > 2) accelerationState = "versnelling";
  if (delta < -2) accelerationState = "vertraging";

  return {
    baseline_execution_score: round(baseline),
    current_execution_score: round(current),
    delta: round(delta),
    lift_pct: round(liftPct),
    acceleration_state: accelerationState,
  };
}
