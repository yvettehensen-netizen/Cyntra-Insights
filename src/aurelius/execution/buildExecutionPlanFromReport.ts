import { generate90DayPlan, SafeIntervention } from "./generate90DayPlan";

/**
 * ADD ONLY — Adapter
 * Zet Aurelius report data om naar SafeIntervention[]
 * No assumptions. No throws.
 */
export function buildExecutionPlanFromReport(
  report: any
) {
  const interventions: SafeIntervention[] =
    report?.roadmap_cards?.map((r: any) => ({
      description: r.intervention,
      implementation_steps: [
        r.intervention,
        `Besluit formaliseren voor ${r.owner}`,
        `Deadline borgen: ${r.deadline ?? "binnen 30 dagen"}`,
      ],
      impact_level: "High",
    })) ?? [];

  return generate90DayPlan(interventions);
}
