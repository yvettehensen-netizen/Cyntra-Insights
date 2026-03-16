export type StrategyChallenge = {
  currentStrategy: string;
  externalPressure: string;
  breakScenario: string;
  requiredCondition: string;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function runStrategyChallengeNode(params: {
  dominantRisk?: string;
  decisionOptions?: string[];
  recommendedOption?: string;
  sourceText?: string;
}): StrategyChallenge {
  const source = `${params.sourceText || ""}\n${params.dominantRisk || ""}`;
  const options = (params.decisionOptions ?? []).map((item) => normalize(item)).filter(Boolean);
  const currentStrategy = normalize(params.recommendedOption || options[0] || "Huidige strategie onvoldoende bepaald");

  if (/\b(jeugdzorg|consortium|triage|gemeent|ambulant|contract)\b/i.test(source)) {
    return {
      currentStrategy,
      externalPressure:
        "Gemeenten en consortium sturen instroom, specialisatie en budgetruimte sterker dan de organisatie autonoom kan compenseren.",
      breakScenario:
        "De huidige brede ambulante strategie breekt wanneer contractruimte vernauwt en complexe instroom met wachtdruk blijft oplopen.",
      requiredCondition:
        "Breedte is alleen houdbaar als triage, contractafspraken en portfoliokeuzes expliciet worden aangescherpt.",
    };
  }

  return {
    currentStrategy,
    externalPressure:
      "Externe marktdruk en interne uitvoerbaarheid kunnen de huidige strategie sneller ondermijnen dan extra activiteit oplost.",
    breakScenario:
      "De huidige strategie breekt wanneer capaciteit, marge of governance structureel onder de vereiste drempel zakt.",
    requiredCondition:
      "De huidige koers blijft alleen houdbaar als bestuur mandaat, stopregels en sturing expliciet maakt.",
  };
}
