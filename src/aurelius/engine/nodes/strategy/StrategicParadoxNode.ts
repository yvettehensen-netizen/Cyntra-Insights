export type StrategicParadoxNodeInput = {
  organizationName?: string;
  sectorContext?: string | string[];
  strategyContext?: string | string[];
  marketContext?: string | string[];
  facts?: string[];
  risks?: string[];
  opportunities?: string[];
  strategicOptions?: string[];
};

export type StrategicParadox = {
  paradox: string;
  mechanism: string;
  risk: string;
  boardImplication: string;
};

export type StrategicParadoxNodeOutput = {
  strategicParadox: StrategicParadox;
  block: string;
};

export const STRATEGIC_PARADOX_SYSTEM_PROMPT = `
Je bent een strategisch adviseur die bestuurders helpt
het kernprobleem van een organisatie terug te brengen
tot één fundamentele strategische paradox.

Je denkt zoals een ervaren strategieconsultant.

Je zoekt geen losse problemen, maar het onderliggende
spanningsveld dat richting geeft aan strategie en besluitvorming.

Een strategische paradox bestaat uit twee doelen
die beide noodzakelijk zijn, maar elkaar tegelijk begrenzen.

Je formuleert deze paradox compact, helder en bestuurlijk bruikbaar.

Je vermijdt:

- managementjargon
- vage observaties
- meer dan twee polen
- operationele tegenstellingen
- advies zonder strategische spanning

Je schrijft in helder Nederlands.

De output moet voelen alsof een ervaren adviseur
het echte dilemma van de organisatie benoemt
waar bestuurders hun keuzes op moeten baseren.
`.trim();

export const STRATEGIC_PARADOX_INSTRUCTION_PROMPT = `
AURELIUS NODE: STRATEGIC PARADOX

DOEL
Identificeer de fundamentele strategische paradox
waar de organisatie mee moet omgaan.

Een paradox is een spanningsveld tussen twee doelen
die beide noodzakelijk zijn,
maar elkaar tegelijk onder druk zetten.

De paradox moet strategisch zijn, niet alleen operationeel.

WERKWIJZE

1 Analyseer organisatiecontext, marktlogica, instroom,
capaciteit en bestuurlijke positie.

2 Zoek twee krachten die elkaar nodig hebben
maar elkaar ook begrenzen.

3 Formuleer deze spanning als één fundamentele paradox.

4 Vertaal de paradox naar bestuurlijke discipline:
welke grens moet actief worden gemanaged?

BEOORDELINGSREGELS

Een goede paradox:

- beide kanten zijn noodzakelijk
- beide kanten botsen in de praktijk
- de paradox raakt strategie of positie
- de formulering helpt bestuurders keuzes maken

VOORKEUR VOOR FORMULERING

Gebruik waar mogelijk formuleringen zoals:

- toegankelijkheid vs uitvoerbaarheid
- regionale relevantie vs economische houdbaarheid
- schaal vs kwaliteit
- autonomie vs standaardisatie
- groei vs teamstabiliteit
- innovatie vs marge
- netwerkpositie vs bestuurbaarheid

OUTPUTSTRUCTUUR

### Strategische paradox

PARADOX
Formuleer de spanning in één krachtige zin.

MECHANISME
Leg in 2-4 zinnen uit waarom beide kanten noodzakelijk zijn
en waarom zij elkaar tegelijk begrenzen.

RISICO
Leg in 2 zinnen uit wat er gebeurt als de organisatie
één kant te sterk kiest.

BESTUURLIJKE IMPLICATIE
Leg in 2-3 zinnen uit welke bestuurlijke discipline nodig is
om deze spanning actief te managen.

STIJL

- maximaal 150 woorden
- helder Nederlands
- geen Engelse termen
- compact en bestuurlijk bruikbaar
`.trim();

export const STRATEGIC_PARADOX_FEW_SHOT = `
FEW-SHOT VOORBEELD

INPUT (context)
Zorgorganisatie met 40 gemeenten, stijgende wachttijden en personeelstekort.

OUTPUT

### Strategische paradox

PARADOX
De organisatie moet tegelijk regionaal toegankelijk blijven
voor gemeenten en scherp begrenzen wat zij organisatorisch
en financieel kan dragen.

MECHANISME
Brede toegankelijkheid houdt de organisatie relevant
in gemeentelijke netwerken en zorgt voor stabiele instroom.
Tegelijk zorgt diezelfde breedte ervoor dat verschillen
in tarieven, reistijd en zorgzwaarte direct drukken
op uitvoerbaarheid, teamstabiliteit en marge.

RISICO
Als de organisatie vooral kiest voor breedte,
groeit de uitvoeringsdruk sneller dan teams kunnen dragen.
Als zij te sterk begrenst,
verliest zij regionale positie en instroom.

BESTUURLIJKE IMPLICATIE
De bestuurlijke opgave is niet kiezen tussen toegankelijkheid
en begrenzing, maar het actief managen van de grens ertussen.
Dat vraagt om expliciete kaders voor gemeentenmix,
caseload, wachttijd en contractrendement.
`.trim();

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toText(value?: string | string[]): string {
  if (Array.isArray(value)) return value.map((item) => normalize(item)).filter(Boolean).join("\n");
  return normalize(value);
}

function compactLines(value: string): string {
  return value
    .split("\n")
    .map((line) => normalize(line))
    .filter(Boolean)
    .join("\n");
}

function buildSource(input: StrategicParadoxNodeInput): string {
  return [
    normalize(input.organizationName),
    toText(input.sectorContext),
    toText(input.strategyContext),
    toText(input.marketContext),
    (input.facts ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
    (input.risks ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
    (input.opportunities ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
    (input.strategicOptions ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatBlock(value: StrategicParadox): string {
  return [
    "### Strategische paradox",
    "",
    "PARADOX",
    value.paradox,
    "",
    "MECHANISME",
    value.mechanism,
    "",
    "RISICO",
    value.risk,
    "",
    "BESTUURLIJKE IMPLICATIE",
    value.boardImplication,
  ].join("\n");
}

function isYouthRegionalContext(source: string): boolean {
  return /\bjeugdzorg|gemeente|gemeenten|consortium|regionaal|wijkteam|zorg\b/i.test(source);
}

function hasCapacityAndMarginPressure(source: string): boolean {
  return /\bcaseload|wachttijd|wachtdruk|personeel|personeelsschaarste|marge|rendabiliteit|reistijd|contract\b/i.test(
    source
  );
}

function isScaleQualityContext(source: string): boolean {
  return /\bgroei|schaal|replicatie|partner|netwerk|kwaliteit|standaardisatie\b/i.test(source);
}

function buildFallbackParadox(input: StrategicParadoxNodeInput): StrategicParadox {
  const source = buildSource(input);

  if (isYouthRegionalContext(source) && hasCapacityAndMarginPressure(source)) {
    return {
      paradox:
        "De organisatie moet tegelijk regionaal toegankelijk blijven voor gemeenten en scherp begrenzen wat zij organisatorisch en financieel kan dragen.",
      mechanism:
        "Brede toegankelijkheid houdt de organisatie relevant in regionale netwerken en zorgt voor stabiele instroom vanuit gemeenten en consortiumsamenwerking. Tegelijk zorgt diezelfde breedte ervoor dat verschillen in tarieven, reistijd, zorgzwaarte en caseload direct drukken op uitvoerbaarheid, teamstabiliteit en marge.",
      risk:
        "Als de organisatie vooral kiest voor breedte, groeit de uitvoeringsdruk sneller dan teams en financiën kunnen dragen. Als zij te veel begrenst, verliest zij regionale relevantie, instroom en invloed in het gemeentelijke netwerk.",
      boardImplication:
        "De bestuurlijke opgave is daarom niet kiezen tussen toegankelijkheid en begrenzing, maar het actief managen van de grens ertussen. Dat vraagt om expliciete kaders voor gemeentenmix, contractrendement, caseload en wachttijd, en een bestuur dat periodiek herijkt waar toegankelijkheid ophoudt en overbelasting begint.",
    };
  }

  if (isScaleQualityContext(source)) {
    return {
      paradox:
        "De organisatie moet tegelijk schaal organiseren en bewaken dat kwaliteit en bestuurbaarheid niet sneller onder druk komen dan de groei aankan.",
      mechanism:
        "Schaal is nodig om impact te vergroten, marktruimte te benutten en minder afhankelijk te worden van lineaire groei per medewerker. Tegelijk maakt extra schaal de organisatie afhankelijker van standaardisatie, partnerdiscipline en heldere besluitrechten, omdat anders kwaliteit, snelheid en controle tegelijk verzwakken.",
      risk:
        "Als de organisatie vooral kiest voor schaal, groeit de complexiteit sneller dan de kwaliteit kan worden geborgd. Als zij vooral kiest voor beheersing, blijft impact achter en verliest zij strategische ruimte.",
      boardImplication:
        "Het bestuur moet schaal alleen toestaan binnen vooraf vastgelegde grenzen voor kwaliteit, partnerselectie en besluitdiscipline. De kern is niet sneller groeien, maar eerder begrenzen wanneer groei de bestuurbaarheid begint te overschrijden.",
    };
  }

  return {
    paradox:
      "De organisatie moet tegelijk ruimte houden voor strategische beweging en scherp begrenzen wat operationeel en financieel werkelijk te dragen is.",
    mechanism:
      "Strategische beweging is nodig om relevant te blijven, kansen te benutten en niet vast te lopen in het huidige model. Tegelijk vraagt elke nieuwe richting capaciteit, focus en bestuurlijke aandacht, waardoor te veel beweging de uitvoerbaarheid en continuïteit aantast.",
    risk:
      "Als de organisatie te veel kiest voor beweging, stapelen druk en versnippering zich op. Als zij te veel kiest voor begrenzing, verliest zij aanpassingsvermogen en positie.",
    boardImplication:
      "Het bestuur moet expliciet sturen op de grens tussen vernieuwing en draagkracht. Dat vraagt om duidelijke prioriteiten, stopregels en vaste momenten waarop wordt herijkt welke ruimte nog verantwoord is.",
  };
}

export function buildStrategicParadoxNodePrompt(input: StrategicParadoxNodeInput): string {
  const context = compactLines(buildSource(input));
  return [
    STRATEGIC_PARADOX_SYSTEM_PROMPT,
    "",
    STRATEGIC_PARADOX_INSTRUCTION_PROMPT,
    "",
    STRATEGIC_PARADOX_FEW_SHOT,
    "",
    "INPUT (context)",
    context || "Geen aanvullende context beschikbaar.",
  ].join("\n\n");
}

export function runStrategicParadoxNode(
  input: StrategicParadoxNodeInput
): StrategicParadoxNodeOutput {
  const strategicParadox = buildFallbackParadox(input);
  return {
    strategicParadox,
    block: formatBlock(strategicParadox),
  };
}
