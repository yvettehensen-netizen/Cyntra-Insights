import type { RetrievedStrategicCase } from "./StrategicMemoryRetriever";

export type StrategicPattern = {
  pattern_description: string;
  cases_where_seen: string[];
  strategic_implication: string;
};

export type StrategicPatternEngineInput = {
  similar_cases: RetrievedStrategicCase[];
};

function hasText(source: string, terms: string[]): boolean {
  const low = source.toLowerCase();
  return terms.some((term) => low.includes(term.toLowerCase()));
}

function collectSource(caseItem: RetrievedStrategicCase): string {
  const row = caseItem.case;
  return [
    row.dominant_problem,
    row.dominant_thesis,
    row.mechanisms.join(" "),
    row.strategic_options.join(" "),
    row.gekozen_strategie,
    row.interventieprogramma,
    row.resultaat ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function patternFromCases(
  cases: RetrievedStrategicCase[],
  description: string,
  implication: string,
  predicate: (source: string) => boolean
): StrategicPattern | null {
  const matched = cases.filter((item) => predicate(collectSource(item)));
  if (!matched.length) return null;
  return {
    pattern_description: description,
    strategic_implication: implication,
    cases_where_seen: matched.map((item) => item.case.case_id),
  };
}

export class StrategicPatternEngine {
  readonly name = "Strategic Pattern Engine";

  detectPatterns(input: StrategicPatternEngineInput): StrategicPattern[] {
    const cases = input.similar_cases ?? [];
    if (!cases.length) return [];

    const patterns: Array<StrategicPattern | null> = [
      patternFromCases(
        cases,
        "Contractplafonds en tariefdruk blokkeren autonome groei",
        "Scenario's met groei vereisen eerst contractdiscipline en margevloer.",
        (source) => hasText(source, ["contract", "plafond", "tarief", "verzekeraar", "marge"])
      ),
      patternFromCases(
        cases,
        "Cultuur- en onderstroomfrictie blokkeert implementatie",
        "Zonder expliciet mandaat en escalatieritme neemt uitvoeringsrisico toe.",
        (source) => hasText(source, ["onderstroom", "weerstand", "mandaat", "escalatie", "uitstel"])
      ),
      patternFromCases(
        cases,
        "Managementcomplexiteit groeit sneller dan uitvoerbare capaciteit",
        "Gefaseerde strategie met stop-doing presteert robuuster dan parallelle verbreding.",
        (source) => hasText(source, ["complexiteit", "capaciteit", "planning", "werkdruk", "parallel"])
      ),
    ];

    return patterns.filter((item): item is StrategicPattern => item !== null).slice(0, 5);
  }

  renderHistoricalPatternAnalysis(
    similarCases: RetrievedStrategicCase[],
    patterns: StrategicPattern[]
  ): string {
    const caseLines = similarCases.length
      ? similarCases
          .map((item, index) => {
            const row = item.case;
            return `${index + 1}. CASE ${row.case_id} | probleem: ${row.dominant_problem} | gekozen strategie: ${row.gekozen_strategie} | resultaat: ${row.resultaat ?? "nog niet geregistreerd"}`;
          })
          .join("\n")
      : "Geen vergelijkbare organisaties gevonden in strategic memory.";

    const patternLines = patterns.length
      ? patterns
          .map(
            (pattern, index) =>
              `${index + 1}. ${pattern.pattern_description} | cases: ${pattern.cases_where_seen.join(", "
              )} | implicatie: ${pattern.strategic_implication}`
          )
          .join("\n")
      : "Geen robuuste patronen gedetecteerd; first-principles redenering toegepast.";

    return [
      "### HISTORISCHE PATROONANALYSE",
      "Vergelijkbare organisaties",
      caseLines,
      "",
      "Terugkerende patronen",
      patternLines,
      "",
      "Welke interventies werkten",
      "Interventies met expliciete margevalidatie, harde stop-doing en strak escalatieritme tonen de hoogste uitvoerbaarheid.",
    ].join("\n");
  }
}
