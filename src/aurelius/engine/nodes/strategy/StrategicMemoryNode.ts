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
  if (/\bzorg\b/i.test(corpus)) return "zorg";
  return normalize(value) || "onbekende sector";
}

function inferDominantProblem(source: string, explicit?: string): string {
  const given = normalize(explicit);
  if (given) return given;
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

  const similarPatterns =
    similar.length > 0
      ? `Analyse lijkt op ${similar.length} eerdere case(s), vooral in ${pattern.sector} met ${pattern.dominantProblem}.`
      : /^jeugdzorg$/i.test(pattern.sector)
        ? `Nog geen directe vergelijkcases beschikbaar. Basispatroon: ${pattern.organizationType} met ${pattern.dominantProblem}.`
        : `Nog geen directe vergelijkcases beschikbaar. Basispatroon: ${pattern.organizationType} in ${pattern.sector} met ${pattern.dominantProblem}.`;

  const repeatedStrategies = (() => {
    if (!similar.length) {
      return `Huidige richting is ${pattern.recommendedStrategy}; er is nog onvoldoende historische spreiding om dominante strategiepatronen te vergelijken.`;
    }
    const strategies = similar.map((item) => item.pattern.recommendedStrategy).filter(Boolean);
    const counts = new Map<string, number>();
    for (const strategy of strategies) counts.set(strategy, (counts.get(strategy) || 0) + 1);
    const dominant = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    return dominant
      ? `Vergelijkbare organisaties kiezen het vaakst voor: ${dominant[0]} (${dominant[1]} van ${similar.length}).`
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
      ? interventions.join("\n")
      : "Nog geen herhaalde interventies beschikbaar in het strategisch geheugen.";
  })();

  const strategicWarning = (() => {
    if (!similar.length) {
      return "Waarschuwing: zonder historisch vergelijkmateriaal moet de gekozen richting sneller worden gevalideerd via expliciete KPI- en stopregels.";
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
    return "Waarschuwing: organisaties die tegelijk meerdere richtingen combineren verliezen vaak focus voordat de gekozen strategie resultaat laat zien.";
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
