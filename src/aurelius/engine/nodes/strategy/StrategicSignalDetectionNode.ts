export type StrategicSignalDetectionNodeInput = {
  organizationName?: string;
  sectorContext?: string | string[];
  documents?: string[];
  notes?: string[];
  facts?: string[];
};

export type StrategicSignal = {
  category: "capaciteit" | "marktstructuur" | "financieel" | "governance" | "cultuur";
  signal: string;
  meaning: string;
  possibleDevelopment: string;
};

export type StrategicSignalDetectionNodeOutput = {
  strategicSignals: StrategicSignal[];
  block: string;
};

export const STRATEGIC_SIGNAL_DETECTION_SYSTEM_PROMPT = `
Je bent een strategisch analist
die zwakke signalen in organisaties detecteert.

Je doel is niet samenvatten,
maar het herkennen van signalen
die kunnen wijzen op structurele spanningen.

Je zoekt naar:

- terugkerende patronen
- impliciete aannames
- operationele frictie
- afhankelijkheden
- opkomende risico's

Je schrijft in helder Nederlands
en focust op strategische betekenis.
`.trim();

export const STRATEGIC_SIGNAL_DETECTION_INSTRUCTION_PROMPT = `
AURELIUS NODE: STRATEGIC SIGNAL DETECTION

DOEL
Identificeer zwakke signalen
die strategisch relevant kunnen zijn.

STAPPEN

1. Analyseer gesprekken, notities en documenten.
2. Zoek terugkerende signalen.
3. Bepaal de mogelijke strategische betekenis.

OUTPUTSTRUCTUUR

### Strategische signalen

SIGNALEN
Beschrijf maximaal 5 signalen.

BETEKENIS
Leg uit wat deze signalen kunnen betekenen.

MOGELIJKE ONTWIKKELING
Leg uit hoe deze signalen
kunnen uitgroeien tot strategische vraagstukken.

STIJL

- maximaal 150 woorden
- helder Nederlands
`.trim();

export const STRATEGIC_SIGNAL_DETECTION_FEW_SHOT = `
FEW-SHOT VOORBEELD

### Strategische signalen

SIGNAAL 1 — consortiumtriage bepaalt instroom

BETEKENIS
Instroom ligt deels buiten de organisatie.

MOGELIJKE ONTWIKKELING
De organisatie kan minder invloed hebben op caseload.

SIGNAAL 2 — grote variatie tussen gemeenten

BETEKENIS
Contractmix bepaalt uitvoerbaarheid.

MOGELIJKE ONTWIKKELING
Portfolioselectie wordt strategisch noodzakelijk.
`.trim();

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toText(value?: string | string[]): string {
  if (Array.isArray(value)) return value.map((item) => normalize(item)).filter(Boolean).join("\n");
  return normalize(value);
}

function buildSource(input: StrategicSignalDetectionNodeInput): string {
  return [
    normalize(input.organizationName),
    toText(input.sectorContext),
    (input.documents ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
    (input.notes ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
    (input.facts ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatBlock(signals: StrategicSignal[]): string {
  const lines = ["### Strategische signalen", ""];
  signals.forEach((item, index) => {
    lines.push(`SIGNAAL ${index + 1} — ${item.signal}`);
    lines.push("");
    lines.push("BETEKENIS");
    lines.push(item.meaning);
    lines.push("");
    lines.push("MOGELIJKE ONTWIKKELING");
    lines.push(item.possibleDevelopment);
    lines.push("");
  });
  return lines.join("\n").trim();
}

function dedupeSignals(items: StrategicSignal[]): StrategicSignal[] {
  const unique = new Map<string, StrategicSignal>();
  for (const item of items) {
    const key = `${item.category}:${normalize(item.signal).toLowerCase()}`;
    if (!key || unique.has(key)) continue;
    unique.set(key, item);
  }
  return Array.from(unique.values()).slice(0, 5);
}

function buildYouthSignals(source: string): StrategicSignal[] {
  const items: StrategicSignal[] = [];

  if (/\bconsortium|triage|toegangspoort\b/i.test(source)) {
    items.push({
      category: "marktstructuur",
      signal: "Consortiumtriage bepaalt een deel van de instroom",
      meaning: "Instroom ligt niet volledig onder eigen regie, waardoor vraag en capaciteit sneller uit elkaar kunnen lopen.",
      possibleDevelopment: "Capaciteitsdiscipline wordt een strategisch vraagstuk zodra externe toegang meer casussen toewijst dan teams aankunnen.",
    });
  }

  if (/\b35\s+gemeenten|gemeenten\b/i.test(source)) {
    items.push({
      category: "marktstructuur",
      signal: "De organisatie bedient veel gemeenten met verschillende condities",
      meaning: "Bereikbaarheid, tarieven en contractvoorwaarden verschillen per gemeente en maken breedte niet automatisch houdbaar.",
      possibleDevelopment: "Regionale aanwezigheid dwingt uiteindelijk tot expliciete prioritering van kern-, behoud- en uitstapgemeenten.",
    });
  }

  if (/\b80%\s*rendabiliteit|80%\s*declarabele\b/i.test(source)) {
    items.push({
      category: "financieel",
      signal: "De rendabiliteitsnorm is strak ten opzichte van de ambulante complexiteit",
      meaning: "Reistijd, ontwikkeluren en zwaardere casuistiek kunnen marge sneller wegdrukken dan extra volume compenseert.",
      possibleDevelopment: "Margebewaking verschuift van financieel detail naar strategische grens voor groei en verbreding.",
    });
  }

  if (/\bzzp|flexibele schil|flexratio|vaste kern\b/i.test(source)) {
    items.push({
      category: "capaciteit",
      signal: "De flexibele schil vangt pieken op maar maakt kosten variabeler",
      meaning: "De organisatie houdt ruimte voor vraagpieken, maar wordt tegelijk gevoeliger voor kosten- en kwaliteitsdruk.",
      possibleDevelopment: "Personeelsstructuur wordt een strategische keuze zodra flexinzet de vaste kern structureel moet compenseren.",
    });
  }

  if (/\bopenheid|eigenaarschap|verbinding|wekelijkse bezoeken|directeur\b/i.test(source)) {
    items.push({
      category: "cultuur",
      signal: "Cultuur en samenhang leunen sterk op nabij leiderschap",
      meaning: "De cultuur is nu een kracht, maar kan kwetsbaar worden als groei of spreiding sneller gaat dan het leiderschap mee kan bewegen.",
      possibleDevelopment: "Cultuur moet explicieter worden vastgelegd voordat schaalvergroting de samenhang gaat verdunnen.",
    });
  }

  return items;
}

function buildGenericSignals(source: string): StrategicSignal[] {
  const items: StrategicSignal[] = [];

  if (/\bwachttijd|caseload|werkdruk|capaciteit|personeel\b/i.test(source)) {
    items.push({
      category: "capaciteit",
      signal: "Capaciteitsdruk komt terug in de operationele werkelijkheid",
      meaning: "De organisatie raakt sneller aan haar grens dan de formele strategie veronderstelt.",
      possibleDevelopment: "Een uitvoeringsprobleem kan uitgroeien tot strategische noodzaak om instroom, portfolio of prioriteiten te begrenzen.",
    });
  }

  if (/\bpartner|consortium|gemeente|verwijzer|netwerk\b/i.test(source)) {
    items.push({
      category: "governance",
      signal: "Externe partijen beïnvloeden de strategische speelruimte",
      meaning: "De organisatie is afhankelijk van netwerkposities en besluitvorming buiten de eigen structuur.",
      possibleDevelopment: "Afhankelijkheid kan omslaan in bestuurbaarheidsrisico als mandaat en escalatie niet expliciet worden gemaakt.",
    });
  }

  if (/\bmarge|tarief|kosten|rendabiliteit|prijs\b/i.test(source)) {
    items.push({
      category: "financieel",
      signal: "Economische druk loopt mee onder de inhoudelijke strategie",
      meaning: "De gekozen richting vraagt meer discipline dan de huidige kosten- en opbrengststructuur vanzelf toestaat.",
      possibleDevelopment: "Financiele druk dwingt uiteindelijk tot scherpere keuzes in portfolio, doelgroep of leveringsmodel.",
    });
  }

  if (/\bgroei|schaal|pilot|innovatie\b/i.test(source)) {
    items.push({
      category: "marktstructuur",
      signal: "Groei en vernieuwing trekken aan dezelfde beperkte bestuurlijke aandacht",
      meaning: "Nieuwe initiatieven voegen waarde toe, maar vergroten ook de kans op focusverlies.",
      possibleDevelopment: "Innovatie wordt een risicobron als het bestuur niet bepaalt welke experimenten kernversterkend zijn en welke niet.",
    });
  }

  return items;
}

export function buildStrategicSignalDetectionNodePrompt(
  input: StrategicSignalDetectionNodeInput
): string {
  const context = buildSource(input) || "Geen aanvullende context beschikbaar.";
  return [
    STRATEGIC_SIGNAL_DETECTION_SYSTEM_PROMPT,
    "",
    STRATEGIC_SIGNAL_DETECTION_INSTRUCTION_PROMPT,
    "",
    STRATEGIC_SIGNAL_DETECTION_FEW_SHOT,
    "",
    "INPUT",
    context,
  ].join("\n\n");
}

export function runStrategicSignalDetectionNode(
  input: StrategicSignalDetectionNodeInput
): StrategicSignalDetectionNodeOutput {
  const source = buildSource(input);
  const signals = dedupeSignals([
    ...buildYouthSignals(source),
    ...buildGenericSignals(source),
  ]);

  return {
    strategicSignals: signals,
    block: formatBlock(signals),
  };
}
