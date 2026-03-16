import {
  STRATEGIC_PATTERN_LIBRARY,
  type StrategicPatternDefinition,
} from "@/aurelius/engine/strategicPatternLibrary";

export type StrategicPatternDetectionNodeInput = {
  organizationName?: string;
  sectorContext?: string | string[];
  strategyContext?: string | string[];
  facts?: string[];
};

export type StrategicPatternDetection = {
  pattern: string;
  recognition: string;
  risk: string;
  strategicLesson: string;
};

export type StrategicPatternDetectionNodeOutput = {
  strategicPattern: StrategicPatternDetection;
  block: string;
};

export const STRATEGIC_PATTERN_DETECTION_SYSTEM_PROMPT = `
Je bent een strategisch patroonanalist.

Je vergelijkt de huidige organisatieanalyse
met bekende strategische patronen.

Als een patroon herkenbaar is,
leg je uit waarom.

Je schrijft in helder Nederlands
en focust op strategische lessen.
`.trim();

export const STRATEGIC_PATTERN_DETECTION_INSTRUCTION_PROMPT = `
AURELIUS NODE: STRATEGIC PATTERN DETECTION

DOEL
Herken of de organisatie
lijkt op een bekend strategisch patroon.

STAPPEN

1. Analyseer organisatiecontext en strategie.
2. Vergelijk met bekende patronen.
3. Identificeer het meest relevante patroon.
4. Leg uit wat dit betekent.

OUTPUTSTRUCTUUR

### Strategisch patroon

PATROON
Naam van het patroon.

HERKENNING
Waarom lijkt deze organisatie op dit patroon?

RISICO
Wat gebeurt er als dit patroon niet wordt aangepakt?

STRATEGISCHE LES
Wat kunnen bestuurders hiervan leren?

STIJL

- maximaal 120 woorden
- helder Nederlands
`.trim();

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toText(value?: string | string[]): string {
  if (Array.isArray(value)) return value.map((item) => normalize(item)).filter(Boolean).join("\n");
  return normalize(value);
}

function tokenize(value: string): string[] {
  return normalize(value).toLowerCase().split(/[^a-z0-9à-ÿ]+/i).filter((token) => token.length >= 3);
}

function overlapScore(source: string, pattern: StrategicPatternDefinition): number {
  const sourceTokens = new Set(tokenize(source));
  let score = 0;
  for (const token of tokenize([pattern.naam, pattern.beschrijving, pattern.signalen.join(" ")].join(" "))) {
    if (sourceTokens.has(token)) score += 1;
  }
  return score;
}

function formatBlock(value: StrategicPatternDetection): string {
  return [
    "### Strategisch patroon",
    "",
    "PATROON",
    value.pattern,
    "",
    "HERKENNING",
    value.recognition,
    "",
    "RISICO",
    value.risk,
    "",
    "STRATEGISCHE LES",
    value.strategicLesson,
  ].join("\n");
}

export function runStrategicPatternDetectionNode(
  input: StrategicPatternDetectionNodeInput
): StrategicPatternDetectionNodeOutput {
  const source = [
    normalize(input.organizationName),
    toText(input.sectorContext),
    toText(input.strategyContext),
    (input.facts ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  const best =
    STRATEGIC_PATTERN_LIBRARY.map((pattern) => ({
      pattern,
      score: overlapScore(source, pattern),
    })).sort((a, b) => b.score - a.score)[0]?.pattern ?? STRATEGIC_PATTERN_LIBRARY[0];

  const strategicPattern: StrategicPatternDetection = {
    pattern: best.naam,
    recognition: `Deze organisatie lijkt op dit patroon omdat ${best.signalen.slice(0, 2).join(" en ")} zichtbaar terugkomen in de context en strategie.`,
    risk: best.risico,
    strategicLesson: `Bestuurders moeten dit patroon niet alleen herkennen, maar vertalen naar ${best.strategische_reactie.toLowerCase()}`,
  };

  return {
    strategicPattern,
    block: formatBlock(strategicPattern),
  };
}
