import type { DetectedStrategyPattern } from "../strategy/TensionEngineNode";
import type { ScenarioDefinition } from "../strategy/ScenarioEngineNode";

export type GovernanceAction = {
  action: string;
  owner: string;
  timeline: string;
  kpi: string;
};

export type GovernanceEngineNodeInput = {
  sector?: string;
  sourceText?: string;
  recommendedScenario: ScenarioDefinition;
  recommendedDecision: string;
  structuralTension: string;
  detectedPatterns?: DetectedStrategyPattern[];
};

export type GovernanceEngineNodeOutput = {
  stopRules: string[];
  earlySignals: string[];
  executionActions: GovernanceAction[];
  block: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function runGovernanceEngineNode(input: GovernanceEngineNodeInput): GovernanceEngineNodeOutput {
  const source = [normalize(input.sector), normalize(input.sourceText), normalize(input.structuralTension)].join("\n");
  const isYouth = /\bjeugdzorg|gemeente|consortium|caseload|wachttijd\b/i.test(source);
  const stopRules = isYouth
    ? [
        "Herzie de gekozen koers direct als caseload structureel > 18 per professional ligt.",
        "Herzie de gekozen koers direct als wachttijd > 12 weken blijft in twee opeenvolgende meetperiodes.",
        "Herzie de gekozen koers direct als marge < 4% blijft in kern- of behoudgemeenten.",
      ]
    : [
        "Herzie de gekozen koers direct als operationele KPI's twee perioden achtereen verslechteren.",
        "Herzie de gekozen koers direct als marge of cashbuffer onder de bestuursgrens zakt.",
        "Herzie de gekozen koers direct als governance-escalaties > 2 per maand blijven terugkomen.",
      ];
  const earlySignals = isYouth
    ? [
        "Instroom per toegangskanaal stijgt sneller dan beschikbare caseloadruimte.",
        "Flexratio en verzuim stijgen tegelijk binnen dezelfde teams.",
        "Meer gemeenten schuiven naar lage marge of hoge reistijd zonder expliciete portfoliobesluitvorming.",
      ]
    : [
        "Vraaggroei en doorlooptijd bewegen sneller dan capaciteit.",
        "Kostenmix verslechtert zonder expliciete herprioritering.",
        "Besluitvertraging en uitzonderingen nemen toe.",
      ];
  const executionActions = isYouth
    ? [
        {
          action: "Stel een gemeentenmatrix vast met kern-, behoud- en uitstapgemeenten.",
          owner: "Bestuur + Directie",
          timeline: "Dag 30",
          kpi: "100% van de gemeenten geclassificeerd op marge, reistijd en contractzekerheid.",
        },
        {
          action: "Koppel consortiumtriage en instroom wekelijks aan caseload- en wachttijdsturing.",
          owner: "Operationeel directeur",
          timeline: "Dag 45",
          kpi: "Instroom per route zichtbaar en caseload binnen bestuursnorm.",
        },
        {
          action: "Bescherm cultuurkapitaal met een bestuurlijke grens voor flexratio en groeitempo.",
          owner: "Bestuur + HR/Operations",
          timeline: "Dag 60",
          kpi: "Flexratio onder grens en retentie/wachtdruk stabiel.",
        },
      ]
    : [
        {
          action: "Leg portfolio- en investeringsgrenzen bestuurlijk vast.",
          owner: "Bestuur",
          timeline: "Dag 30",
          kpi: "Alle activiteiten gerangschikt op strategische waarde en draagkracht.",
        },
        {
          action: "Koppel groei- of vraagbesluiten aan een ritme voor capaciteit en financien.",
          owner: "CEO + CFO",
          timeline: "Dag 45",
          kpi: "Geen groeibesluit zonder capaciteits- en margeraming.",
        },
        {
          action: "Formuleer vroegsignalen en escalatiepad per gekozen koers.",
          owner: "MT",
          timeline: "Dag 60",
          kpi: "Vroegsignalen maandelijks gerapporteerd en opgevolgd.",
        },
      ];

  return {
    stopRules,
    earlySignals,
    executionActions,
    block: "",
  };
}
