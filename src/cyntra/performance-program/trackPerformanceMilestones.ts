export interface PerformanceMilestone {
  day: 30 | 60 | 90;
  target_dsi: number;
  current_dsi: number;
  status: "voor op schema" | "op schema" | "achterstand";
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function milestoneStatus(progressDelta: number): PerformanceMilestone["status"] {
  if (progressDelta >= 0.25) return "voor op schema";
  if (progressDelta >= -0.25) return "op schema";
  return "achterstand";
}

export function trackPerformanceMilestones(input: {
  baseline_dsi: number;
  current_dsi: number;
  expected_dsi_lift: number;
  days_since_baseline: number;
}): PerformanceMilestone[] {
  const baseline = clamp(input.baseline_dsi, 0, 10);
  const current = clamp(input.current_dsi, 0, 10);
  const target90 = clamp(baseline + input.expected_dsi_lift, 0, 10);
  const growth = target90 - baseline;

  const elapsedRatio = clamp(input.days_since_baseline / 90, 0, 1);
  const expectedNow = baseline + growth * elapsedRatio;
  const progressDelta = current - expectedNow;

  const targets: Array<30 | 60 | 90> = [30, 60, 90];
  return targets.map((day) => {
    const dayRatio = day / 90;
    const targetDsi = baseline + growth * dayRatio;
    return {
      day,
      target_dsi: round(targetDsi),
      current_dsi: round(current),
      status: milestoneStatus(progressDelta),
    };
  });
}
