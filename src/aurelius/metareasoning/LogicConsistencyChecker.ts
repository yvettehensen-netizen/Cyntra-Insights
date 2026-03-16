export type LogicConsistencyInput = {
  diagnosisText: string;
  insightText: string;
  interventionText: string;
  decisionPressureText: string;
  causalText: string;
};

export type LogicConsistencyResult = {
  pass: boolean;
  strengths: string[];
  issues: string[];
  score: number;
};

function hasAll(source: string, terms: string[]): boolean {
  const s = source.toLowerCase();
  return terms.every((t) => s.includes(t.toLowerCase()));
}

export function checkLogicConsistency(input: LogicConsistencyInput): LogicConsistencyResult {
  const strengths: string[] = [];
  const issues: string[] = [];

  const diagnosis = String(input.diagnosisText ?? "");
  const insights = String(input.insightText ?? "");
  const interventions = String(input.interventionText ?? "");
  const decision = String(input.decisionPressureText ?? "");
  const causal = String(input.causalText ?? "");

  if (hasAll(`${diagnosis}\n${causal}`, ["oorzaak"]) || /structurele oorzaak/i.test(causal)) {
    strengths.push("Causale redenering bevat expliciete oorzaaklaag.");
  } else {
    issues.push("Causale oorzaaklaag is beperkt expliciet.");
  }

  if (hasAll(`${insights}\n${interventions}`, ["bestuurlijke implicatie"]) || /kpi|eigenaar|deadline/i.test(interventions)) {
    strengths.push("Inzichten zijn vertaald naar uitvoerbare interventies.");
  } else {
    issues.push("Koppeling tussen inzicht en interventie is zwak.");
  }

  if (/voorkeursoptie/i.test(decision) && /expliciet verlies/i.test(decision)) {
    strengths.push("Besluitlogica bevat voorkeursoptie met expliciet verlies.");
  } else {
    issues.push("Besluitlogica mist duidelijke keuze of verliesdiscipline.");
  }

  const score = Math.max(0, Math.min(1, (strengths.length * 0.33) - (issues.length * 0.12) + 0.5));
  return {
    pass: score >= 0.6,
    strengths,
    issues,
    score: Number(score.toFixed(2)),
  };
}
