// ============================================================
// src/aurelius/execution/generate90DayPlan.ts
// AURELIUS — 90 DAY EXECUTION ENGINE (STABLE)
// ============================================================

export interface ExecutionStep {
  week: number;
  action: string;
  owner: string;
  metric: string;
}

export interface ExecutionMonth {
  month: 1 | 2 | 3;
  focus: string;
  steps: ExecutionStep[];
}

export interface ExecutionPlan90D {
  objective: string;
  months: ExecutionMonth[];
}

/**
 * SAFE INTERVENTION SHAPE (LOCAL)
 * - Intentionally decoupled from intervention libraries
 * - Accepts AI-derived or human-curated interventions
 */
export interface SafeIntervention {
  description: string;
  implementation_steps?: string[];
  impact_level?: "Low" | "Medium" | "High";
}

/**
 * Generate a concrete, board-ready 90-day execution plan
 * This function MUST NEVER throw — execution must always render
 */
export function generate90DayPlan(
  interventions: SafeIntervention[]
): ExecutionPlan90D {
  const steps =
    interventions.flatMap((i) => i.implementation_steps ?? []) || [];

  const sliced = steps.slice(0, 18);

  const buildSteps = (
    startWeek: number,
    count: number
  ): ExecutionStep[] =>
    sliced.splice(0, count).map((step, idx) => ({
      week: startWeek + idx,
      action: step,
      owner: "Directie — toewijzing binnen 48 uur",
      metric: "Besluit genomen en geïmplementeerd",
    }));

  return {
    objective:
      "Doorbreken van structurele kernspanning en herstel van executiekracht",
    months: [
      {
        month: 1,
        focus: "Besluitvorming en stop-keuzes",
        steps: buildSteps(1, 6),
      },
      {
        month: 2,
        focus: "Herinrichting governance en prioriteiten",
        steps: buildSteps(5, 6),
      },
      {
        month: 3,
        focus: "Verankering in organisatie en gedrag",
        steps: buildSteps(9, 6),
      },
    ],
  };
}
