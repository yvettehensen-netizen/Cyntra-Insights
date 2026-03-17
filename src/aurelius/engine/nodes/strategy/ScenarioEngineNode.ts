import type { DetectedStrategyPattern } from "./TensionEngineNode";

export type ScenarioDefinition = {
  code: "A" | "B" | "C";
  title: string;
  mechanism: string;
  risk: string;
  strategicImplication: string;
};

export type ScenarioEngineNodeInput = {
  sector?: string;
  sourceText?: string;
  structuralTension: string;
  coreProblem: string;
  detectedPatterns?: DetectedStrategyPattern[];
};

export type ScenarioEngineNodeOutput = {
  scenarios: ScenarioDefinition[];
  block: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function formatBlock(scenarios: ScenarioDefinition[]): string {
  return [
    "### Scenario Engine",
    "",
    ...scenarios.flatMap((item) => [
      `SCENARIO ${item.code} — ${item.title}`,
      "MECHANISM",
      item.mechanism,
      "RISK",
      item.risk,
      "STRATEGIC IMPLICATION",
      item.strategicImplication,
      "",
    ]),
  ].join("\n").trim();
}

export function runScenarioEngineNode(input: ScenarioEngineNodeInput): ScenarioEngineNodeOutput {
  const source = [normalize(input.sector), normalize(input.sourceText), normalize(input.structuralTension)].join("\n");
  const scenarios: ScenarioDefinition[] =
    /\bjeugdzorg|gemeente|consortium|caseload|wachttijd\b/i.test(source)
      ? [
          {
            code: "A",
            title: "Gemeentenportfolio rationaliseren",
            mechanism: "Beperk actieve groei tot kern- en behoudgemeenten waar marge, bereikbaarheid en teamstabiliteit samenkomen, en classificeer uitstapgemeenten expliciet.",
            risk: "Te scherpe afbouw kan regionale legitimiteit en contracttoegang aantasten als bestuur en gemeenten niet actief worden meegenomen.",
            strategicImplication: "Dit pad verhoogt bestuurbaarheid het snelst, maar vraagt expliciete portfolio-keuzes en bestuurlijke discipline.",
          },
          {
            code: "B",
            title: "Operationele schaal vergroten binnen vaste teams en flexibele schil",
            mechanism: "Vergroot capaciteit alleen binnen harde grenzen voor caseload, flexratio, reistijd en no-show zodat extra volume niet direct teamstabiliteit opvreet.",
            risk: "Schaal zonder scherpe grenzen trekt cultuurkapitaal leeg en laat wachtdruk sneller stijgen dan marge of kwaliteit meebewegen.",
            strategicImplication: "Dit pad houdt regionale breedte langer vast, maar maakt de organisatie gevoeliger voor personeels- en kwaliteitsbreuk.",
          },
          {
            code: "C",
            title: "Zorgmodel en instroomroute veranderen",
            mechanism: "Herontwerp toegang, triage, routering en partnerrol zodat niet alle vraag dezelfde teams en dezelfde zorgvorm belast.",
            risk: "Governancecomplexiteit stijgt direct wanneer mandaat, escalatie en consortiumsturing niet vooraf formeel zijn vastgelegd.",
            strategicImplication: "Dit pad kan structureel robuuster zijn, maar vraagt de grootste bestuurlijke herontwerpdiscipline.",
          },
        ]
      : [
          {
            code: "A",
            title: "Portfolio aanscherpen",
            mechanism: "Schrap of pauzeer activiteiten die disproportioneel veel capaciteit of kapitaal vragen ten opzichte van strategische waarde.",
            risk: "Te harde focus kan commerciële of maatschappelijke relevantie verkleinen voordat het nieuwe profiel geloofwaardig is.",
            strategicImplication: "Verhoogt focus en bestuurbaarheid het snelst.",
          },
          {
            code: "B",
            title: "Gecontroleerd opschalen",
            mechanism: "Vergroot capaciteit alleen onder meetbare grenzen voor kwaliteit, marge en doorlooptijd.",
            risk: "Groei kan sneller gebeuren dan governance en uitvoering kunnen absorberen.",
            strategicImplication: "Behoudt marktpositie, maar verhoogt uitvoeringsrisico.",
          },
          {
            code: "C",
            title: "Leveringsmodel herontwerpen",
            mechanism: "Verander het operationele model zodat vraag, prikkels en besluitrechten beter op elkaar aansluiten.",
            risk: "Transitiecomplexiteit kan op korte termijn vertragen en interne weerstand oproepen.",
            strategicImplication: "Biedt de grootste structurele reset, maar vraagt het meeste verandervermogen.",
          },
        ];

  return { scenarios, block: formatBlock(scenarios) };
}
