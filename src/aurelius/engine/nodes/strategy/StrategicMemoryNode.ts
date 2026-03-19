import {
  StrategicMemoryStore,
  type StrategicPatternMemoryRecord,
} from "@/aurelius/memory/StrategicMemoryStore";
import { StrategyPatternIndex } from "@/aurelius/memory/StrategyPatternIndex";
import type { BlindSpot } from "./BlindSpotNode";
import type { StrategicLeveragePoint } from "./StrategicLeverageNode";

export type StrategicMemoryNodeInput = {
  memoryId: string;
  executiveThesis?: string;
  facts?: string[];
  strategicOptions?: string[];
  recommendedChoice?: string;
  interventions?: string[];
  blindSpots?: BlindSpot[];
  strategicLeverage?: StrategicLeveragePoint[];
  sector?: string;
  organizationType?: string;
  dominantProblem?: string;
  dominantParadox?: string;
  keyRisks?: string[];
};

export type StrategicMemoryOutput = {
  similarPatterns: string;
  repeatedStrategies: string;
  successfulInterventions: string;
  strategicWarning: string;
};

export type StrategicMemoryNodeOutput = {
  strategicMemory: StrategicMemoryOutput;
  storedPattern: StrategicPatternMemoryRecord;
  block: string;
};

export const STRATEGIC_MEMORY_SYSTEM_PROMPT = `
Je bent het strategisch geheugen van Aurelius.

Je doel is om patronen te herkennen
tussen verschillende organisaties
en strategische analyses.

Je vergelijkt nieuwe analyses
met eerdere casussen.

Als vergelijkbare patronen bestaan,
benoem je deze.

Je schrijft in helder Nederlands
en focust op strategische lessen.
`.trim();

export const STRATEGIC_MEMORY_INSTRUCTION_PROMPT = `
AURELIUS NODE: STRATEGIC MEMORY

DOEL
Vergelijk de huidige analyse
met eerdere strategische patronen.

STAPPEN

1. Analyseer sector, schaal en strategie.
2. Zoek vergelijkbare patronen in het geheugen.
3. Identificeer terugkerende paradoxen of risico's.
4. Formuleer een strategische les.

OUTPUTSTRUCTUUR

### Strategische ervaring

PATROON
Beschrijf het terugkerende patroon.

VERGELIJKBARE SITUATIES
Wanneer komt dit vaker voor?

STRATEGISCHE LES
Wat kunnen bestuurders hiervan leren?

STIJL

- maximaal 120 woorden
- helder Nederlands
`.trim();

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toList(value?: string[]): string[] {
  return Array.isArray(value) ? value.map((item) => normalize(item)).filter(Boolean) : [];
}

function inferOrganizationType(source: string, explicit?: string): string {
  const given = normalize(explicit);
  if (given && !/^[a-z_]+_model$/i.test(given) && !/\b(model|pattern)\b/i.test(given)) return given;
  if (/\bkleinschalig|kleine organisatie\b/i.test(source)) return "kleinschalige organisatie";
  if (/\bjeugdzorg|jeugdwet\b/i.test(source)) return "jeugdzorgorganisatie";
  if (/\bnetwerk|partner\b/i.test(source)) return "netwerkorganisatie";
  if (/\bzorg|jeugdzorg|ggz\b/i.test(source)) return "zorgorganisatie";
  return "organisatie";
}

function normalizeSectorLabel(value: string, source: string): string {
  const sector = normalize(value).toLowerCase();
  const corpus = `${sector} ${normalize(source).toLowerCase()}`;
  if (/\bjeugdzorg|jeugdwet|jongeren|gezinnen|opvoed|multiproblematiek\b/i.test(corpus)) return "jeugdzorg";
  if (/\bggz|geestelijke gezondheidszorg\b/i.test(corpus)) return "ggz";
  if (/\bsaas|software|nrr|churn|burn|cac|payback\b/i.test(corpus)) return "saas";
  if (/\bb2b|dienstverlening|delivery|utilization|account|gross margin|propositie\b/i.test(corpus)) {
    return "b2b dienstverlening";
  }
  if (/\bzorg\b/i.test(corpus)) return "zorg";
  return normalize(value) || "onbekende sector";
}

function inferDominantProblem(source: string, explicit?: string): string {
  const given = normalize(explicit);
  if (given) return given;
  if (/\bchurn|burn|nrr|cac|payback|pricing\b/i.test(source)) {
    return "unit economics onder groeidruk";
  }
  if (/\bdelivery|utilization|account|gross margin|maatwerk\b/i.test(source)) {
    return "deliverydruk en margeverlies per account";
  }
  if (/\bcontract|tarief|budgetdruk|gemeentelijke inkoop\b/i.test(source)) {
    return "contractdruk onder bestuurlijke afhankelijkheid";
  }
  if (/\bwachttijd|doorstroom|triage|intake\b/i.test(source)) {
    return "wachtdruk en capaciteitsfrictie";
  }
  if (/\bpersoneel|retentie|werkdruk|caseload\b/i.test(source)) {
    return "personeelsdruk en uitvoerbaarheidsrisico";
  }
  return "strategische focus onder druk";
}

function buildSectorMemoryLines(pattern: StrategicPatternMemoryRecord, similarCount: number): {
  similarPatterns: string;
  repeatedStrategiesPrefix: string;
  successfulInterventionsPrefix: string;
  strategicWarning: string;
} {
  if (/^ggz$/i.test(pattern.sector)) {
    return {
      similarPatterns:
        similarCount > 0
          ? `Analyse lijkt op ${similarCount} eerdere GGZ-case(s), vooral rond contractplafonds, zorgzwaarte en behandelcapaciteit.`
          : `Nog geen directe vergelijkcases beschikbaar. Basispatroon: GGZ-organisatie met ${pattern.dominantProblem}.`,
      repeatedStrategiesPrefix: "Vergelijkbare GGZ-organisaties kiezen het vaakst voor:",
      successfulInterventionsPrefix: "Herhaalde GGZ-interventies:",
      strategicWarning:
        "Waarschuwing: in vergelijkbare GGZ-cases verslechtert wachtdruk vaak sneller dan contractruimte meebeweegt als productmix en capaciteit niet samen worden herijkt.",
    };
  }
  if (/^saas$/i.test(pattern.sector)) {
    return {
      similarPatterns:
        similarCount > 0
          ? `Analyse lijkt op ${similarCount} eerdere SaaS-case(s), vooral rond retentie, burn en implementatiecapaciteit.`
          : `Nog geen directe vergelijkcases beschikbaar. Basispatroon: SaaS-organisatie met ${pattern.dominantProblem}.`,
      repeatedStrategiesPrefix: "Vergelijkbare SaaS-organisaties kiezen het vaakst voor:",
      successfulInterventionsPrefix: "Herhaalde SaaS-interventies:",
      strategicWarning:
        "Waarschuwing: in vergelijkbare SaaS-cases slaat groei vaak terug in churn en burn zodra implementatiebelasting sneller stijgt dan retentie en pricing verbeteren.",
    };
  }
  if (/^b2b dienstverlening$/i.test(pattern.sector)) {
    return {
      similarPatterns:
        similarCount > 0
          ? `Analyse lijkt op ${similarCount} eerdere B2B-dienstverleningscase(s), vooral rond deliverydruk, accountconcentratie en marge per account.`
          : `Nog geen directe vergelijkcases beschikbaar. Basispatroon: B2B-dienstverlener met ${pattern.dominantProblem}.`,
      repeatedStrategiesPrefix: "Vergelijkbare B2B-dienstverleners kiezen het vaakst voor:",
      successfulInterventionsPrefix: "Herhaalde B2B-interventies:",
      strategicWarning:
        "Waarschuwing: in vergelijkbare B2B-cases verslechtert leverbetrouwbaarheid vaak voordat omzetdruk zichtbaar wordt, zodra commerciële uitzonderingen deliverydiscipline uithollen.",
    };
  }
  if (/^jeugdzorg$/i.test(pattern.sector)) {
    return {
      similarPatterns:
        similarCount > 0
          ? `Analyse lijkt op ${similarCount} eerdere jeugdzorgcase(s), vooral rond gemeentenportfolio, wachtdruk en teamcapaciteit.`
          : `Nog geen directe vergelijkcases beschikbaar. Basispatroon: ${pattern.organizationType} met ${pattern.dominantProblem}.`,
      repeatedStrategiesPrefix: "Vergelijkbare jeugdzorgorganisaties kiezen het vaakst voor:",
      successfulInterventionsPrefix: "Herhaalde jeugdzorginterventies:",
      strategicWarning:
        "Waarschuwing: in vergelijkbare jeugdzorgcases vergroten portfolio-breedte en zwakke triage de druk sneller dan extra capaciteit die kan absorberen.",
    };
  }
  return {
    similarPatterns:
      similarCount > 0
        ? `Analyse lijkt op ${similarCount} eerdere case(s), vooral in ${pattern.sector} met ${pattern.dominantProblem}.`
        : `Nog geen directe vergelijkcases beschikbaar. Basispatroon: ${pattern.organizationType} in ${pattern.sector} met ${pattern.dominantProblem}.`,
    repeatedStrategiesPrefix: "Vergelijkbare organisaties kiezen het vaakst voor:",
    successfulInterventionsPrefix: "Succesvolle interventies:",
    strategicWarning:
      "Waarschuwing: organisaties die tegelijk meerdere richtingen combineren verliezen vaak focus voordat de gekozen strategie resultaat laat zien.",
  };
}

function summarizeInterventions(interventions: string[]): string[] {
  return interventions
    .map((item) => normalize(item))
    .filter((item) => item.length >= 16 && item.length <= 240)
    .filter((item) => !/^(🔴|🟢|⛔|❓)/u.test(item))
    .filter((item) => !/^(action items|fyi|blockers|open vragen|contract- &|capaciteit &|kostenbeheersing &|governance &|personeel &)/i.test(item))
    .filter((item) => !/^(model & schaal|cultuur & kennis|netwerk & invloed|systeemimpact|contracten & positionering|wachttijd & toegang|professionals & uitvoerbaarheid|gemeenten & samenwerking)/i.test(item))
    .filter((item) => !/owner:\s*JIJ\b/i.test(item))
    .filter((item) => !/\bdeadline:\b/i.test(item))
    .filter((item) => !/\bmeeting\b/i.test(item))
    .map((item) =>
      item
        .replace(/^Interventie\s*\d+\s*/i, "")
        .replace(/^\d+\.\s*(Actie:|Voor )?/i, "")
        .replace(/^Interventie:\s*/i, "")
        .replace(/\s*-\s*Mechanisme:.*$/i, "")
        .replace(/\s*KPI:.*$/i, "")
        .replace(/\s*Risico:.*$/i, "")
        .trim()
    )
    .filter(Boolean)
    .slice(0, 5);
}

function buildStoredPattern(input: StrategicMemoryNodeInput): StrategicPatternMemoryRecord {
  const facts = toList(input.facts);
  const interventions = summarizeInterventions(toList(input.interventions));
  const blindSpots = (input.blindSpots || []).map((item) => normalize(item.title)).filter(Boolean);
  const leveragePoints = (input.strategicLeverage || []).map((item) => normalize(item.title)).filter(Boolean);
  const source = [
    normalize(input.executiveThesis),
    facts.join(" "),
    interventions.join(" "),
    blindSpots.join(" "),
    leveragePoints.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    memoryId: normalize(input.memoryId),
    createdAt: new Date().toISOString(),
    sector: normalizeSectorLabel(String(input.sector || ""), source),
    organizationType: inferOrganizationType(source, input.organizationType),
    dominantProblem: inferDominantProblem(source, input.dominantProblem),
    dominantParadox: normalize(input.dominantParadox) || undefined,
    recommendedStrategy: normalize(input.recommendedChoice) || "geen expliciete strategie gekozen",
    keyRisks: toList(input.keyRisks).slice(0, 5),
    leveragePoints,
    blindSpots,
    interventions,
  };
}

function formatBlock(memory: StrategicMemoryOutput): string {
  return [
    "Vergelijkbare patronen",
    memory.similarPatterns,
    "Herhaalde strategieën",
    memory.repeatedStrategies,
    "Succesvolle interventies",
    memory.successfulInterventions,
    "Strategische waarschuwing",
    memory.strategicWarning,
  ].join("\n");
}

export function runStrategicMemoryNode(
  input: StrategicMemoryNodeInput,
  deps?: {
    store?: StrategicMemoryStore;
    index?: StrategyPatternIndex;
  }
): StrategicMemoryNodeOutput {
  const store = deps?.store ?? new StrategicMemoryStore();
  const index = deps?.index ?? new StrategyPatternIndex();
  const pattern = buildStoredPattern(input);
  const existing = store.listStrategicPatterns();
  const similar = index.findSimilarPatterns(pattern, existing, 5);
  const sectorLines = buildSectorMemoryLines(pattern, similar.length);

  const similarPatterns = sectorLines.similarPatterns;

  const repeatedStrategies = (() => {
    if (!similar.length) {
      return `Huidige richting is ${pattern.recommendedStrategy}; er is nog onvoldoende historische spreiding om dominante strategiepatronen te vergelijken.`;
    }
    const strategies = similar.map((item) => item.pattern.recommendedStrategy).filter(Boolean);
    const counts = new Map<string, number>();
    for (const strategy of strategies) counts.set(strategy, (counts.get(strategy) || 0) + 1);
    const dominant = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    return dominant
      ? `${sectorLines.repeatedStrategiesPrefix} ${dominant[0]} (${dominant[1]} van ${similar.length}).`
      : `Geen herhaald strategisch patroon beschikbaar.`;
  })();

  const successfulInterventions = (() => {
    const interventions = Array.from(
      new Set([
        ...pattern.interventions,
        ...similar.flatMap((item) => item.pattern.interventions),
      ])
    ).slice(0, 4);
    return interventions.length
      ? `${sectorLines.successfulInterventionsPrefix}\n${interventions.join("\n")}`
      : "Nog geen herhaalde interventies beschikbaar in het strategisch geheugen.";
  })();

  const strategicWarning = (() => {
    if (!similar.length) {
      return `${sectorLines.strategicWarning} Zonder historisch vergelijkmateriaal moet de gekozen richting sneller worden gevalideerd via expliciete KPI- en stopregels.`;
    }
    const conflicting = similar.filter(
      (item) =>
        item.pattern.recommendedStrategy &&
        normalize(item.pattern.recommendedStrategy).toLowerCase() !==
          normalize(pattern.recommendedStrategy).toLowerCase()
    ).length;
    if (conflicting >= Math.ceil(similar.length / 2)) {
      return "Waarschuwing: vergelijkbare organisaties kozen regelmatig een andere strategie; valideer dus expliciet waarom deze richting hier beter past.";
    }
    return sectorLines.strategicWarning;
  })();

  store.upsertStrategicPattern(pattern);

  return {
    strategicMemory: {
      similarPatterns,
      repeatedStrategies,
      successfulInterventions,
      strategicWarning,
    },
    storedPattern: pattern,
    block: formatBlock({
      similarPatterns,
      repeatedStrategies,
      successfulInterventions,
      strategicWarning,
    }),
  };
}

export function buildStrategicMemoryNodePrompt(input: StrategicMemoryNodeInput): string {
  const context = [
    `Sector: ${normalize(input.sector) || "Onbekend"}`,
    `Organisatietype: ${normalize(input.organizationType) || "Onbekend"}`,
    `Dominante paradox: ${normalize(input.dominantParadox) || "Niet beschikbaar"}`,
    `Aanbevolen strategie: ${normalize(input.recommendedChoice) || "Niet beschikbaar"}`,
    (input.keyRisks ?? []).map((item) => `- ${normalize(item)}`).join("\n"),
    (input.facts ?? []).map((item) => `- ${normalize(item)}`).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  return [
    STRATEGIC_MEMORY_SYSTEM_PROMPT,
    "",
    STRATEGIC_MEMORY_INSTRUCTION_PROMPT,
    "",
    "INPUT",
    context,
  ].join("\n\n");
}
