export type HistoricalInterventionCase = {
  case_id: string;
  sector: string;
  gekozen_strategie: string;
  interventieprogramma: string;
  resultaat?: string;
};

export type InterventionOutcomeInput = {
  sector: string;
  historical_cases: HistoricalInterventionCase[];
};

export type InterventionSuccessPattern = {
  interventie: string;
  sector: string;
  effect: string;
  confidence: "laag" | "middel" | "hoog";
};

export type InterventionOutcomeOutput = {
  intervention_success_patterns: InterventionSuccessPattern[];
};

function contains(text: string, terms: string[]): boolean {
  const source = text.toLowerCase();
  return terms.some((term) => source.includes(term.toLowerCase()));
}

function derivePattern(caseRecord: HistoricalInterventionCase): InterventionSuccessPattern | null {
  const source = `${caseRecord.gekozen_strategie} ${caseRecord.interventieprogramma} ${caseRecord.resultaat ?? ""}`.toLowerCase();

  if (contains(source, ["contract", "heronderhandeling", "marge", "plafond"])) {
    return {
      interventie: "contractheronderhandeling",
      sector: caseRecord.sector,
      effect: "Margeherstel en betere voorspelbaarheid op kasdruk",
      confidence: "hoog",
    };
  }
  if (contains(source, ["stop-doing", "prioritering", "focus", "consolidatie"])) {
    return {
      interventie: "centrale prioritering met stop-doing",
      sector: caseRecord.sector,
      effect: "Lagere managementcomplexiteit en hogere uitvoerbaarheid",
      confidence: "middel",
    };
  }
  if (contains(source, ["escalatie", "mandaat", "ritme", "governance"])) {
    return {
      interventie: "mandaat- en escalatieritme",
      sector: caseRecord.sector,
      effect: "Snellere besluitdoorloop en minder onderstroomfrictie",
      confidence: "middel",
    };
  }

  return null;
}

export class InterventionOutcomeEngine {
  readonly name = "Intervention Outcome Engine";

  analyze(input: InterventionOutcomeInput): InterventionOutcomeOutput {
    const patterns: InterventionSuccessPattern[] = [];

    for (const caseRecord of input.historical_cases) {
      if (input.sector && caseRecord.sector && caseRecord.sector !== input.sector) continue;
      const pattern = derivePattern(caseRecord);
      if (pattern) patterns.push(pattern);
    }

    if (!patterns.length) {
      patterns.push({
        interventie: "geen robuust historisch patroon",
        sector: input.sector || "onbekend",
        effect: "Gebruik scenario-simulatie en first-principles totdat meer resultaten beschikbaar zijn",
        confidence: "laag",
      });
    }

    return {
      intervention_success_patterns: patterns.slice(0, 6),
    };
  }
}
