import type { StrategicParadox } from "./StrategicParadoxNode";

export type ParadoxQualityCheckNodeInput = {
  paradox: StrategicParadox | string;
  organizationName?: string;
  sectorContext?: string | string[];
  facts?: string[];
};

export type ParadoxQualityCheck = {
  score: 1 | 2 | 3 | 4 | 5;
  assessment: string;
  improvedParadox: string;
};

export type ParadoxQualityCheckNodeOutput = {
  paradoxQualityCheck: ParadoxQualityCheck;
  block: string;
};

export const PARADOX_QUALITY_CHECK_SYSTEM_PROMPT = `
Je bent een strategisch kwaliteitscontroleur
voor bestuursrapporten.

Je beoordeelt of een strategische paradox
scherp, relevant en bestuurlijk bruikbaar is.

Een goede paradox:

- benoemt twee noodzakelijke krachten
- laat een echte spanning zien
- raakt strategie of positie
- helpt bestuurders betere keuzes maken

Een zwakke paradox:

- is generiek (bijv. groei vs kwaliteit)
- is operationeel (bijv. planning vs capaciteit)
- bevat meer dan twee polen
- bevat managementjargon
- helpt bestuurders niet beslissen

Je beoordeelt streng en herschrijft indien nodig.
`.trim();

export const PARADOX_QUALITY_CHECK_INSTRUCTION_PROMPT = `
AURELIUS NODE: PARADOX QUALITY CHECK

DOEL
Controleer of de strategische paradox
voldoende scherp en strategisch is.

STAPPEN

1. Lees de gegenereerde paradox.
2. Beoordeel hem op vier criteria:

   - strategisch niveau
   - duidelijk spanningsveld
   - bestuurlijke relevantie
   - helder taalgebruik

3. Geef een score van 1 tot 5.

4. Als score lager is dan 4:
   herschrijf de paradox zodat hij scherper wordt.

OUTPUTSTRUCTUUR

### Paradox kwaliteitscontrole

SCORE
Geef een score van 1 tot 5.

BEOORDELING
Leg kort uit waarom de paradox sterk of zwak is.

VERBETERDE PARADOX
Als de score lager is dan 4,
genereer een verbeterde versie.

Als de paradox al sterk is,
bevestig dat hij kan blijven staan.

STIJL

- helder Nederlands
- compact
- maximaal 120 woorden
`.trim();

export const PARADOX_QUALITY_CHECK_FEW_SHOT = `
FEW-SHOT VOORBEELD

INPUT
Paradox: De organisatie moet balans vinden tussen groei en kwaliteit.

OUTPUT

### Paradox kwaliteitscontrole

SCORE
2/5

BEOORDELING
De paradox is te generiek. Hij benoemt wel een spanning, maar niet waarom beide kanten strategisch noodzakelijk zijn en hij helpt het bestuur nog niet om een bestuurlijke grens te managen.

VERBETERDE PARADOX
De organisatie moet tegelijk regionaal relevant blijven in haar netwerk en scherp begrenzen wat zij organisatorisch en financieel kan dragen.
`.trim();

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toText(value?: string | string[]): string {
  if (Array.isArray(value)) return value.map((item) => normalize(item)).filter(Boolean).join("\n");
  return normalize(value);
}

function extractParadoxText(input: ParadoxQualityCheckNodeInput): string {
  if (typeof input.paradox === "string") return normalize(input.paradox);
  return normalize(input.paradox.paradox);
}

function hasStrategicMarkers(source: string): boolean {
  return /\b(regionaal|positie|toegankelijk|uitvoerbaarheid|economisch|houdbaarheid|netwerk|bestuurbaarheid|marge|contract|relevantie)\b/i.test(
    source
  );
}

function hasOperationalOnlyMarkers(source: string): boolean {
  return /\b(planning|rooster|proces|werkvoorraad|overlegstructuur|dagstart|bezetting)\b/i.test(source);
}

function hasExplicitTension(source: string): boolean {
  return /\b(tegelijk|en tegelijk|maar|versus|vs\.?|begrenzen|onder druk|grens)\b/i.test(source);
}

function isGenericParadox(source: string): boolean {
  return /\b(groei en kwaliteit|balans vinden|wendbaar blijven|focus en flexibiliteit)\b/i.test(source);
}

function hasTooManyPoles(source: string): boolean {
  const poles = source.match(/\b(vs\.?|versus|en tegelijk|maar)\b/gi) ?? [];
  return poles.length > 2;
}

function buildAssessment(paradox: string, score: number): string {
  const remarks: string[] = [];
  if (score >= 4) remarks.push("De paradox is scherp en strategisch bruikbaar.");
  if (!hasStrategicMarkers(paradox)) remarks.push("Het strategische niveau is nog te zwak.");
  if (!hasExplicitTension(paradox)) remarks.push("De spanning is nog niet duidelijk genoeg geformuleerd.");
  if (isGenericParadox(paradox)) remarks.push("De formulering is te generiek.");
  if (hasOperationalOnlyMarkers(paradox)) remarks.push("De paradox zit te veel op operationeel niveau.");
  if (hasTooManyPoles(paradox)) remarks.push("De paradox bevat te veel polen tegelijk.");
  return normalize(remarks.join(" "));
}

function buildImprovedParadox(input: ParadoxQualityCheckNodeInput, source: string): string {
  const context = [
    extractParadoxText(input),
    toText(input.sectorContext),
    (input.facts ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
  ]
    .filter(Boolean)
    .join("\n");

  if (/\bjeugdzorg|gemeente|consortium|regionaal\b/i.test(context)) {
    return "De organisatie moet tegelijk regionaal toegankelijk blijven voor gemeenten en scherp begrenzen wat zij organisatorisch en financieel kan dragen.";
  }

  if (/\bpartner|netwerk|schaal|replicatie|kwaliteit\b/i.test(context)) {
    return "De organisatie moet tegelijk schaal organiseren en begrenzen waar groei de kwaliteit en bestuurbaarheid begint te ondermijnen.";
  }

  if (/\bgroei\b/i.test(source) && /\bkwaliteit\b/i.test(source)) {
    return "De organisatie moet tegelijk haar positie versterken en scherp begrenzen wat zij in uitvoering en financiën werkelijk kan dragen.";
  }

  return "De organisatie moet tegelijk strategische ruimte houden en scherp begrenzen wat zij bestuurlijk, organisatorisch en financieel kan dragen.";
}

function scoreParadox(paradox: string): 1 | 2 | 3 | 4 | 5 {
  let score = 5;
  if (!hasStrategicMarkers(paradox)) score -= 1;
  if (!hasExplicitTension(paradox)) score -= 1;
  if (isGenericParadox(paradox)) score -= 2;
  if (hasOperationalOnlyMarkers(paradox)) score -= 1;
  if (hasTooManyPoles(paradox)) score -= 1;

  if (score < 1) score = 1;
  if (score > 5) score = 5;
  return score as 1 | 2 | 3 | 4 | 5;
}

function formatBlock(value: ParadoxQualityCheck): string {
  return [
    "### Paradox kwaliteitscontrole",
    "",
    "SCORE",
    `${value.score}/5`,
    "",
    "BEOORDELING",
    value.assessment,
    "",
    "VERBETERDE PARADOX",
    value.improvedParadox,
  ].join("\n");
}

export function buildParadoxQualityCheckNodePrompt(input: ParadoxQualityCheckNodeInput): string {
  const paradox = extractParadoxText(input);
  const context = [
    `Paradox: ${paradox || "Niet beschikbaar."}`,
    toText(input.sectorContext),
    (input.facts ?? []).map((item) => `- ${normalize(item)}`).filter(Boolean).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  return [
    PARADOX_QUALITY_CHECK_SYSTEM_PROMPT,
    "",
    PARADOX_QUALITY_CHECK_INSTRUCTION_PROMPT,
    "",
    PARADOX_QUALITY_CHECK_FEW_SHOT,
    "",
    "INPUT",
    context,
  ].join("\n\n");
}

export function runParadoxQualityCheckNode(
  input: ParadoxQualityCheckNodeInput
): ParadoxQualityCheckNodeOutput {
  const paradox = extractParadoxText(input);
  const score = scoreParadox(paradox);
  const assessment = buildAssessment(paradox, score);
  const improvedParadox =
    score < 4
      ? buildImprovedParadox(input, paradox)
      : "De paradox is sterk genoeg en kan blijven staan.";

  const paradoxQualityCheck: ParadoxQualityCheck = {
    score,
    assessment,
    improvedParadox,
  };

  return {
    paradoxQualityCheck,
    block: formatBlock(paradoxQualityCheck),
  };
}
