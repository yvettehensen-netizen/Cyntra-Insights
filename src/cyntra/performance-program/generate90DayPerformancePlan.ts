import type { DecisionStrengthIndexFactors } from "@/cyntra/performance-engine";

export interface PerformancePlan {
  focus_area: string;
  key_intervention: string;
  measurable_target: string;
  expected_dsi_lift: number;
  review_window_days: number;
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function generate90DayPerformancePlan(input: {
  factors: DecisionStrengthIndexFactors;
  current_dsi: number;
  improvement_pct: number;
}): PerformancePlan {
  const factorEntries = [
    { key: "clarity_score", value: input.factors.clarity_score },
    { key: "decision_certainty", value: input.factors.decision_certainty },
    { key: "execution_probability", value: input.factors.execution_probability },
    {
      key: "pattern_learning_coherence",
      value: input.factors.pattern_learning_coherence,
    },
    {
      key: "drift_stability_inverse",
      value: input.factors.drift_stability_inverse,
    },
    {
      key: "risk_projection_confidence",
      value: input.factors.risk_projection_confidence,
    },
  ].sort((a, b) => a.value - b.value);

  const weakest = factorEntries[0]?.key || "execution_probability";
  const weakness = 1 - (factorEntries[0]?.value ?? 0.5);
  const expectedLift = round(clamp(weakness * 1.4, 0.2, 1.8));

  if (weakest === "clarity_score") {
    return {
      focus_area: "Besluithelderheid",
      key_intervention:
        "Beperk besluitdocumentatie tot één besluitregel, één eigenaar en één uitvoeringssignaal per cyclus.",
      measurable_target: `DSI +${expectedLift} binnen 90 dagen via heldere besluitstructuur.`,
      expected_dsi_lift: expectedLift,
      review_window_days: 30,
    };
  }

  if (weakest === "decision_certainty") {
    return {
      focus_area: "Besluitzekerheid",
      key_intervention:
        "Verplicht voorafgaand besluitcriterium en post-besluit verificatie binnen vijf werkdagen.",
      measurable_target: `DSI +${expectedLift} met afname van heropende besluiten.`,
      expected_dsi_lift: expectedLift,
      review_window_days: 30,
    };
  }

  if (weakest === "pattern_learning_coherence") {
    return {
      focus_area: "Patrooncoherentie",
      key_intervention:
        "Elimineer terugkerende besluitfricties door één dominante faalsignatuur per maand bestuurlijk te sluiten.",
      measurable_target: `DSI +${expectedLift} door daling van stagnatiesignalen.`,
      expected_dsi_lift: expectedLift,
      review_window_days: 30,
    };
  }

  if (weakest === "drift_stability_inverse") {
    return {
      focus_area: "Driftstabiliteit",
      key_intervention:
        "Stel één vast ritme in voor besluituitvoering en sluit regressies in dezelfde week af.",
      measurable_target: `DSI +${expectedLift} door structurele driftreductie.`,
      expected_dsi_lift: expectedLift,
      review_window_days: 30,
    };
  }

  if (weakest === "risk_projection_confidence") {
    return {
      focus_area: "Risicovoorspelbaarheid",
      key_intervention:
        "Koppel elk strategisch besluit aan een expliciete risicogrens en een geautomatiseerde reviewdrempel.",
      measurable_target: `DSI +${expectedLift} via hogere voorspelbaarheid in 90 dagen.`,
      expected_dsi_lift: expectedLift,
      review_window_days: 30,
    };
  }

  return {
    focus_area: "Executieprobabiliteit",
    key_intervention:
      "Voer één interventie tegelijk uit met een verplicht first-execution-signaal binnen 72 uur na besluit.",
    measurable_target: `DSI +${expectedLift} met hogere executiesnelheid en minder uitval.`,
    expected_dsi_lift: expectedLift,
    review_window_days: 30,
  };
}
