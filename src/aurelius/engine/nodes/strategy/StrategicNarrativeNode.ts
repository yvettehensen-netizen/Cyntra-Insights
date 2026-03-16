import type { StrategicPressureTestItem } from "./StrategicPressureTestNode";

export type StrategicNarrativeNodeInput = {
  organizationName?: string;
  sector?: string;
  strategicParadox?: string;
  breakthroughInsights?: string[];
  strategicOptions?: string[];
  recommendedChoice?: string;
  pressureTest?: StrategicPressureTestItem[];
};

export type StrategicNarrative = {
  situation: string;
  tension: string;
  dynamic: string;
  choice: string;
  boardTask: string;
};

export type StrategicNarrativeNodeOutput = {
  strategicNarrative: StrategicNarrative;
  block: string;
};

export const STRATEGIC_NARRATIVE_SYSTEM_PROMPT = `
Je bent een strategisch adviseur
die complexe analyses vertaalt
naar een helder bestuurlijk verhaal.

Je doel is niet nieuwe analyses toevoegen,
maar bestaande inzichten samenbrengen
in één overtuigend strategisch narratief.

Het narratief moet bestuurders helpen begrijpen:

- wat er speelt
- waarom dit een probleem is
- welke keuze nodig is
- wat de consequentie is

Je schrijft compact, helder en overtuigend.

De toon is bestuurlijk en strategisch,
niet academisch of technisch.

Gebruik helder Nederlands.
`.trim();

export const STRATEGIC_NARRATIVE_INSTRUCTION_PROMPT = `
AURELIUS NODE: STRATEGIC NARRATIVE

DOEL
Vertaal de belangrijkste inzichten
van het rapport naar één samenhangend strategisch verhaal.

Gebruik:

- strategische paradox
- doorbraakinzichten
- keuzerichtingen
- aanbevolen keuze
- stresstest

STAPPEN

1. Beschrijf kort de situatie van de organisatie.
2. Introduceer de strategische spanning.
3. Leg uit waarom dit probleem nu speelt.
4. Leg uit welke keuze nodig is.
5. Benoem de bestuurlijke opgave.

OUTPUTSTRUCTUUR

### Strategisch narratief

SITUATIE
Beschrijf in 2 zinnen de context.

SPANNING
Leg uit welke strategische paradox speelt.

DYNAMIEK
Leg uit waarom dit vraagstuk nu urgent wordt.

KEUZE
Beschrijf de aanbevolen strategische richting.

BESTUURLIJKE OPGAVE
Leg uit wat het bestuur actief moet bewaken.

STIJL

- maximaal 180 woorden
- helder Nederlands
- strategisch en bestuurlijk
`.trim();

export const STRATEGIC_NARRATIVE_FEW_SHOT = `
FEW-SHOT VOORBEELD

### Strategisch narratief

SITUATIE
Jeugdzorg ZIJN opereert als brede ambulante specialist voor circa 35 gemeenten. De organisatie combineert regionale toegankelijkheid met een focus op teamstabiliteit en kwaliteit van zorg.

SPANNING
De organisatie staat voor een strategische paradox: regionaal toegankelijk blijven voor gemeenten, terwijl zij tegelijkertijd moet begrenzen wat organisatorisch en financieel uitvoerbaar is.

DYNAMIEK
Verschillen in tarieven, reistijd en zorgzwaarte maken dat brede aanwezigheid niet automatisch rendabel of uitvoerbaar blijft. Tegelijk bepaalt regionale zichtbaarheid mede de instroom en netwerkpositie.

KEUZE
De strategie is daarom niet versmallen naar een niche, maar brede ambulante specialist blijven binnen duidelijke grenzen voor gemeentenmix, caseload en contractrendement.

BESTUURLIJKE OPGAVE
De opgave voor het bestuur is deze grens actief te managen. Dat vraagt om structurele sturing op gemeentenportfolio, instroomdiscipline en teamcapaciteit.
`.trim();

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function firstNonEmpty(items: Array<string | undefined>): string {
  return items.map((item) => normalize(item)).find(Boolean) || "";
}

function formatBlock(value: StrategicNarrative): string {
  return [
    "### Strategisch narratief",
    "",
    "SITUATIE",
    value.situation,
    "",
    "SPANNING",
    value.tension,
    "",
    "DYNAMIEK",
    value.dynamic,
    "",
    "KEUZE",
    value.choice,
    "",
    "BESTUURLIJKE OPGAVE",
    value.boardTask,
  ].join("\n");
}

export function buildStrategicNarrativeNodePrompt(input: StrategicNarrativeNodeInput): string {
  const context = [
    `Organisatie: ${normalize(input.organizationName) || "Onbekend"}`,
    `Sector: ${normalize(input.sector) || "Onbekend"}`,
    `Paradox: ${normalize(input.strategicParadox) || "Niet beschikbaar"}`,
    `Aanbevolen keuze: ${normalize(input.recommendedChoice) || "Niet beschikbaar"}`,
    (input.breakthroughInsights ?? []).map((item) => `- ${normalize(item)}`).join("\n"),
    (input.strategicOptions ?? []).map((item) => `- ${normalize(item)}`).join("\n"),
    (input.pressureTest ?? []).map((item) => `- ${item.stressFactor}: ${item.breakpoint}`).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  return [
    STRATEGIC_NARRATIVE_SYSTEM_PROMPT,
    "",
    STRATEGIC_NARRATIVE_INSTRUCTION_PROMPT,
    "",
    STRATEGIC_NARRATIVE_FEW_SHOT,
    "",
    "INPUT",
    context,
  ].join("\n\n");
}

export function runStrategicNarrativeNode(
  input: StrategicNarrativeNodeInput
): StrategicNarrativeNodeOutput {
  const organization = normalize(input.organizationName) || "De organisatie";
  const sector = normalize(input.sector) || "de sector";
  const paradox =
    normalize(input.strategicParadox) ||
    "De organisatie moet tegelijk ruimte houden voor haar positie en begrenzen wat zij werkelijk kan dragen.";
  const choice = normalize(input.recommendedChoice) || "een scherpere en bestuurbare strategische richting kiezen.";
  const firstStress = input.pressureTest?.[0];
  const firstInsight = firstNonEmpty(input.breakthroughInsights ?? []);

  const strategicNarrative: StrategicNarrative = {
    situation: `${organization} opereert in ${sector} binnen een context waarin positionering, uitvoerbaarheid en bestuurlijke keuzes steeds directer op elkaar ingrijpen. ${firstInsight || "De kernvraag is hoe de organisatie relevant blijft zonder haar draagkracht te overschrijden."}`,
    tension: paradox,
    dynamic: firstStress
      ? `${firstStress.mechanism} Daardoor wordt zichtbaar dat de huidige koers alleen houdbaar is als grenzen voor uitvoering en prioriteit expliciet worden bewaakt.`
      : "Dit vraagstuk wordt urgent omdat externe druk en interne draagkracht niet meer vanzelf in balans blijven.",
    choice: `De aanbevolen richting is ${choice} Deze keuze is alleen sterk als zij niet breed wordt gelaten, maar wordt vertaald naar expliciete bestuurlijke grenzen en prioriteiten.`,
    boardTask:
      "De bestuurlijke opgave is de gekozen koers actief te bewaken op draagkracht, tempo en consequentie. Het bestuur moet dus niet alleen richting kiezen, maar ook periodiek herijken waar de strategie nog werkt en waar zij begint te breken.",
  };

  return {
    strategicNarrative,
    block: formatBlock(strategicNarrative),
  };
}
