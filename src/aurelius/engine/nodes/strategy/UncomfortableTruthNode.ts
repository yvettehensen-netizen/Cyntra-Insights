export type UncomfortableTruthNodeInput = {
  organizationName?: string;
  sectorContext?: string | string[];
  strategyContext?: string | string[];
  facts?: string[];
  risks?: string[];
  strategicChoice?: string;
};

export type UncomfortableTruthNodeOutput = {
  uncomfortableTruth: string;
  explanation: string;
  boardImplication: string;
  block: string;
};

export const UNCOMFORTABLE_TRUTH_SYSTEM_PROMPT = `
Je bent een strategisch adviseur
die benoemt wat bestuurders vaak liever niet hardop zeggen.

Je zoekt niet naar nette formuleringen,
maar naar de ongemakkelijke waarheid
die onder de strategie ligt.

Die waarheid moet:

- strategisch relevant zijn
- bestuurlijk ongemakkelijk zijn
- direct voortkomen uit de feiten
- helpen om betere keuzes te maken

Je vermijdt drama, oordeel en managementtaal.
Je schrijft helder, compact en precies.
`.trim();

export const UNCOMFORTABLE_TRUTH_INSTRUCTION_PROMPT = `
AURELIUS NODE: UNCOMFORTABLE TRUTH

DOEL
Benoem de ongemakkelijke waarheid
die onder de strategische situatie van de organisatie ligt.

STAPPEN

1. Analyseer strategie, markt, capaciteit en bestuurlijke werkelijkheid.
2. Zoek wat bestuurders wel voelen maar nog niet scherp hebben uitgesproken.
3. Formuleer dat als één ongemakkelijke waarheid.
4. Leg uit wat dit bestuurlijk betekent.

OUTPUTSTRUCTUUR

### Ongemakkelijke waarheid

WAARHEID
Formuleer de kern in één scherpe zin.

UITLEG
Leg in 2-3 zinnen uit waarom dit de werkelijke spanning is.

BESTUURLIJKE IMPLICATIE
Leg in 1-2 zinnen uit wat het bestuur hierdoor niet langer kan vermijden.

STIJL

- maximaal 120 woorden
- helder Nederlands
- geen managementjargon
- compact en bestuurlijk bruikbaar
`.trim();

export const UNCOMFORTABLE_TRUTH_FEW_SHOT = `
FEW-SHOT VOORBEELD

INPUT
Zorgorganisatie met brede regionale rol, oplopende wachttijden, contractdruk en personeelstekort.

OUTPUT

### Ongemakkelijke waarheid

WAARHEID
De organisatie kan niet tegelijk overal beschikbaar blijven en doen alsof die breedte geen harde grens heeft.

UITLEG
De regionale rol voelt strategisch noodzakelijk, maar elke extra gemeente, reistijd en complexe instroom drukt direct op teams, wachttijd en marge. Zolang die grens niet expliciet wordt gemaakt, lijkt de strategie ruim, maar wordt de uitvoering steeds krapper.

BESTUURLIJKE IMPLICATIE
Het bestuur moet expliciet bepalen waar beschikbaarheid ophoudt en overbelasting begint.
`.trim();

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toText(value?: string | string[]): string {
  if (Array.isArray(value)) return value.map((item) => normalize(item)).filter(Boolean).join("\n");
  return normalize(value);
}

function buildSource(input: UncomfortableTruthNodeInput): string {
  return [
    normalize(input.organizationName),
    toText(input.sectorContext),
    toText(input.strategyContext),
    normalize(input.strategicChoice),
    (input.facts ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
    (input.risks ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatBlock(value: {
  uncomfortableTruth: string;
  explanation: string;
  boardImplication: string;
}): string {
  return [
    "### Ongemakkelijke waarheid",
    "",
    "WAARHEID",
    value.uncomfortableTruth,
    "",
    "UITLEG",
    value.explanation,
    "",
    "BESTUURLIJKE IMPLICATIE",
    value.boardImplication,
  ].join("\n");
}

function buildFallbackTruth(input: UncomfortableTruthNodeInput) {
  const source = buildSource(input);

  if (/\bjeugdzorg|gemeente|consortium|regionaal\b/i.test(source)) {
    return {
      uncomfortableTruth:
        "De organisatie kan niet tegelijk breed toegankelijk blijven voor alle gemeenten en doen alsof die breedte geen harde grens heeft.",
      explanation:
        "De regionale rol voelt strategisch logisch, maar elke extra gemeente, reistijd en instroomroute drukt direct op caseload, wachttijd en marge. Zolang die grens niet expliciet wordt gemaakt, lijkt de strategie ruim, maar wordt de uitvoering steeds smaller.",
      boardImplication:
        "Het bestuur moet hard kiezen waar toegankelijkheid nog waarde toevoegt en waar zij overgaat in overbelasting.",
    };
  }

  if (/\bschaal|groei|partner|netwerk\b/i.test(source)) {
    return {
      uncomfortableTruth:
        "De organisatie wil sneller groeien dan haar bestuurlijke discipline op dit moment betrouwbaar kan dragen.",
      explanation:
        "Groei voelt aantrekkelijk omdat zij impact en positie kan vergroten, maar zonder scherpere kaders voor kwaliteit, partnerkeuze en besluitrechten stapelt de complexiteit sneller op dan de organisatie kan opvangen.",
      boardImplication:
        "Het bestuur moet eerst de bestuurbaarheid versterken voordat verdere groei als succes kan worden gezien.",
    };
  }

  return {
    uncomfortableTruth:
      "De organisatie probeert ruimte te houden voor nieuwe beweging zonder helder te begrenzen wat zij werkelijk kan dragen.",
    explanation:
      "Dat voelt bestuurlijk verstandig, maar maakt het risico groot dat prioriteiten zich opstapelen zonder dat iemand expliciet zegt wat moet stoppen. De spanning zit dus niet in ambitie, maar in het ontbreken van een harde grens.",
    boardImplication:
      "Het bestuur moet explicieter schrappen, niet alleen scherper formuleren.",
  };
}

export function buildUncomfortableTruthNodePrompt(input: UncomfortableTruthNodeInput): string {
  const context = buildSource(input) || "Geen aanvullende context beschikbaar.";
  return [
    UNCOMFORTABLE_TRUTH_SYSTEM_PROMPT,
    "",
    UNCOMFORTABLE_TRUTH_INSTRUCTION_PROMPT,
    "",
    UNCOMFORTABLE_TRUTH_FEW_SHOT,
    "",
    "INPUT",
    context,
  ].join("\n\n");
}

export function runUncomfortableTruthNode(
  input: UncomfortableTruthNodeInput
): UncomfortableTruthNodeOutput {
  const output = buildFallbackTruth(input);
  return {
    ...output,
    block: formatBlock(output),
  };
}
