import type { BlindSpot } from "./BlindSpotNode";
import type { DecisionConsequences } from "./DecisionConsequenceNode";

export type StrategicLeveragePoint = {
  title: string;
  mechanism: string;
  why80_20: string;
  boardAction: string;
  expectedEffect: string;
};

export type StrategicLeverageNodeInput = {
  executiveThesis?: string;
  strategicOptions?: string[];
  recommendedChoice?: string;
  facts?: string[];
  interventions?: string[];
  boardroomStressTest?: string;
  blindSpots?: BlindSpot[];
  decisionConsequences?: DecisionConsequences;
};

export type StrategicLeverageNodeOutput = {
  strategicLeverage: StrategicLeveragePoint[];
  block: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toList(value?: string[]): string[] {
  return Array.isArray(value) ? value.map((item) => normalize(item)).filter(Boolean) : [];
}

function hasSignal(source: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(source));
}

function dedupe(items: StrategicLeveragePoint[]): StrategicLeveragePoint[] {
  const seen = new Set<string>();
  const result: StrategicLeveragePoint[] = [];
  for (const item of items) {
    const key = normalize(`${item.title} ${item.mechanism}`.toLowerCase());
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push({
      title: normalize(item.title),
      mechanism: normalize(item.mechanism),
      why80_20: normalize(item.why80_20),
      boardAction: normalize(item.boardAction),
      expectedEffect: normalize(item.expectedEffect),
    });
  }
  return result;
}

function formatBlock(points: StrategicLeveragePoint[]): string {
  return points
    .map((item, index) =>
      [
        `Hefboom ${index + 1} — ${item.title}`,
        "Mechanisme",
        item.mechanism,
        "Waarom dit 80/20 impact heeft",
        item.why80_20,
        "Bestuurlijke actie",
        item.boardAction,
        "Verwacht effect",
        item.expectedEffect,
      ].join("\n")
    )
    .join("\n\n");
}

function buildFallbackLeverage(): StrategicLeveragePoint[] {
  return [
    {
      title: "Contractdiscipline",
      mechanism:
        "Contractkwaliteit bepaalt feitelijke schaalruimte en beïnvloedt tegelijk marge, wachtdruk en bestuurlijke bewegingsruimte.",
      why80_20:
        "Een kleine verbetering in contractmix en tariefdiscipline raakt meerdere systeemvariabelen tegelijk in plaats van slechts één operationeel symptoom.",
      boardAction:
        "Stel een margevloer per productlijn vast en maak contractruimte een expliciete board-beslisvoorwaarde voor groei.",
      expectedEffect:
        "Binnen 12 maanden lagere uitvoeringsdruk, scherpere prioritering en stabielere financiële voorspelbaarheid.",
    },
    {
      title: "Intake- en triagediscipline",
      mechanism:
        "De kwaliteit van triage bepaalt welke vraag werkelijk capaciteit inneemt en welke casussen wachtdruk, werkdruk en doorlooptijd versterken.",
      why80_20:
        "Triage stuurt tegelijk wachttijd, caseload, behandelcontinuiteit en teamdruk, waardoor één ingreep disproportioneel veel frictie wegneemt.",
      boardAction:
        "Voer een wekelijkse bestuurlijk geborgde triagebeslissing in met caseloadnorm, stopregels en doorverwijscriteria.",
      expectedEffect:
        "Binnen 12 maanden lagere wachtdruk zonder lineaire personeelsuitbreiding en meer voorspelbare capaciteit.",
    },
  ];
}

export function runStrategicLeverageNode(
  input: StrategicLeverageNodeInput
): StrategicLeverageNodeOutput {
  const facts = toList(input.facts);
  const interventions = toList(input.interventions);
  const strategicOptions = toList(input.strategicOptions);
  const blindSpots = Array.isArray(input.blindSpots) ? input.blindSpots : [];
  const decisionConsequences = input.decisionConsequences;
  const source = [
    normalize(input.executiveThesis),
    strategicOptions.join("\n"),
    normalize(input.recommendedChoice),
    facts.join("\n"),
    interventions.join("\n"),
    normalize(input.boardroomStressTest),
    blindSpots.map((item) => `${item.title} ${item.insight} ${item.risk}`).join("\n"),
    decisionConsequences
      ? [
          decisionConsequences.decision,
          decisionConsequences.horizon12m,
          decisionConsequences.horizon24m,
          decisionConsequences.horizon36m,
          decisionConsequences.strategicOutcome,
          decisionConsequences.riskIfWrong,
        ].join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const points: StrategicLeveragePoint[] = [];

  if (
    hasSignal(source, [
      /\bcontract|tarief|marge|plafond|gemeentelijke inkoop|contractmix|onderhandel/i,
      /\bwachtdruk|teamdruk|capaciteit|werkdruk/i,
    ])
  ) {
    points.push({
      title: "Contractdiscipline",
      mechanism:
        "Contractstructuur bepaalt de werkelijke schaalruimte en koppelt financiële ruimte direct aan wachtdruk, personeelsdruk en bestuurlijke manoeuvreerruimte.",
      why80_20:
        "Contractkwaliteit beïnvloedt marge, instroomtempo en uitvoerbaarheid tegelijk, waardoor een beperkte bestuurlijke ingreep meerdere drukpunten tegelijk raakt.",
      boardAction:
        "Heronderhandel contractmix, stel een margevloer per productlijn vast en stop groei zodra contractruimte niet aantoonbaar meegroeit.",
      expectedEffect:
        "Lagere uitvoeringsdruk en stabielere teamcapaciteit binnen 12 maanden, met sterkere contractpositie binnen 24 maanden.",
    });
  }

  if (
    hasSignal(source, [
      /\btriage|intake|wachttijd|doorstroom|caseload|instroom/i,
      /\bpersoneel|capaciteit|behandelcontinuiteit/i,
    ])
  ) {
    points.push({
      title: "Intake triage",
      mechanism:
        "De manier waarop instroom wordt geprioriteerd bepaalt hoeveel onnodige druk er op capaciteit, wachttijd en behandelcontinuiteit komt.",
      why80_20:
        "Triage beïnvloedt tegelijk wachttijden, werkdruk en benutting van schaarse professionals, waardoor een kleine procesbeslissing disproportioneel veel systeemdruk wegneemt.",
      boardAction:
        "Introduceer wekelijkse triagebesluiten met vaste caseloadnorm, instroomcriteria en expliciete routering per type vraag.",
      expectedEffect:
        "Wachttijdreductie en meer voorspelbare bezetting zonder extra personeel of lineaire volumegroei.",
    });
  }

  if (
    hasSignal(source, [
      /\bpositionering|specialisatie|niche|breed|onderscheid|gemeente|partner/i,
      /\bcontractpositie|strategische focus|concurrentie/i,
    ])
  ) {
    points.push({
      title: "Scherpe positionering",
      mechanism:
        "Een expliciete niche of specialistische propositie versmalt bestuurlijke ruis en verbetert tegelijk contracteerbaarheid, verwijzersvertrouwen en interne focus.",
      why80_20:
        "Een heldere keuze in positionering beïnvloedt tegelijk marktkans, contractkwaliteit en uitvoerbaarheid, terwijl de implementatie bestuurlijk relatief beperkt is.",
      boardAction:
        "Leg binnen één kwartaal vast welke doelgroep of propositie leidend is en koppel daar contractstrategie, partners en capaciteitskeuzes aan.",
      expectedEffect:
        "Binnen 24 maanden meer onderscheidend vermogen, sterkere verwijzersrelaties en minder versnippering van capaciteit.",
    });
  }

  if (
    hasSignal(source, [
      /\bpartner|netwerk|alliantie|samenwerking|replicatie|governance/i,
      /\bkwaliteit|schaal|impact/i,
    ])
  ) {
    points.push({
      title: "Partnergovernance",
      mechanism:
        "De kwaliteit van partnerselectie en governance bepaalt of schaal of samenwerking waarde vermenigvuldigt of juist bestuurlijke complexiteit toevoegt.",
      why80_20:
        "Met één scherp governancekader worden tegelijk kwaliteit, reputatierisico en schaaltempo gestuurd zonder zware interne herstructurering.",
      boardAction:
        "Voer één partnerkader in met kwaliteitsdrempels, auditritme en escalatieregels voordat nieuwe samenwerking wordt opgeschaald.",
      expectedEffect:
        "Binnen 24 tot 36 maanden schaalgroei met minder kwaliteitsverlies en hogere bestuurlijke controle.",
    });
  }

  const strategicLeverage = (() => {
    const unique = dedupe(points);
    if (unique.length >= 2) return unique.slice(0, 4);
    return dedupe([...unique, ...buildFallbackLeverage()]).slice(0, 4);
  })();

  return {
    strategicLeverage,
    block: formatBlock(strategicLeverage),
  };
}
