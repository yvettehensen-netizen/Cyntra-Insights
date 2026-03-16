export type StrategicPressureTestNodeInput = {
  organizationName?: string;
  recommendedChoice?: string;
  sectorContext?: string | string[];
  facts?: string[];
  risks?: string[];
  strategicParadox?: string;
};

export type StrategicPressureTestItem = {
  stressFactor: string;
  mechanism: string;
  breakpoint: string;
  signals: string;
  recoveryAction: string;
};

export type StrategicPressureTestNodeOutput = {
  pressureTest: StrategicPressureTestItem[];
  block: string;
};

export const STRATEGIC_PRESSURE_TEST_SYSTEM_PROMPT = `
Je bent een strategisch adviseur
die bestuursbesluiten onder druk test.

Je analyseert niet alleen of een strategie logisch is,
maar vooral onder welke omstandigheden deze strategie
kan mislukken.

Je denkt in mechanismen, niet in meningen.

Je stelt de vraag:

Wanneer breekt deze strategie?

Je benoemt:

- stressfactoren
- breekpunten
- waarschuwingssignalen
- bestuurlijke reacties

Je schrijft in helder Nederlands
en richt je op bestuurders.
`.trim();

export const STRATEGIC_PRESSURE_TEST_INSTRUCTION_PROMPT = `
AURELIUS NODE: STRATEGIC PRESSURE TEST

DOEL
Test de aanbevolen strategische keuze
onder realistische stressfactoren.

De analyse moet laten zien
wanneer de gekozen strategie kan falen.

STAPPEN

1. Neem de aanbevolen strategische keuze.
2. Identificeer drie realistische stressfactoren.
3. Analyseer hoe deze factoren de strategie onder druk zetten.
4. Bepaal het breekpunt.
5. Formuleer waarschuwingssignalen.

STRESSFACTOREN KUNNEN ZIJN

- stijgende vraag
- personeelstekort
- contractdruk
- prijsdruk
- governanceproblemen
- systeemveranderingen
- beleidswijzigingen

OUTPUTSTRUCTUUR

### Strategische stresstest

STRESSFACTOR 1
Beschrijf de factor.

MECHANISME
Hoe zet deze factor de strategie onder druk?

BREERPUNT
Wanneer werkt de strategie niet meer?

SIGNALEN
Welke indicatoren laten zien dat dit punt nadert?

HERSTELACTIE
Wat moet het bestuur dan doen?

Herhaal dit voor drie stressfactoren.

STIJL

- maximaal 200 woorden
- helder Nederlands
- concreet en bestuurlijk bruikbaar
`.trim();

export const STRATEGIC_PRESSURE_TEST_FEW_SHOT = `
FEW-SHOT VOORBEELD

### Strategische stresstest

STRESSFACTOR 1
Stijgende zorgvraag

MECHANISME
Meer instroom via gemeenten en consortium verhoogt direct de caseload per professional.

BREERPUNT
De strategie faalt wanneer caseload structureel boven de norm stijgt en wachttijden oplopen.

SIGNALEN
Caseload > 18, wachttijd > 12 weken.

HERSTELACTIE
Tijdelijk instroom begrenzen en gemeentenportfolio herijken.
`.trim();

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toText(value?: string | string[]): string {
  if (Array.isArray(value)) return value.map((item) => normalize(item)).filter(Boolean).join("\n");
  return normalize(value);
}

function formatBlock(items: StrategicPressureTestItem[]): string {
  const lines = ["### Strategische stresstest", ""];
  items.forEach((item, index) => {
    lines.push(`STRESSFACTOR ${index + 1}`);
    lines.push(item.stressFactor);
    lines.push("");
    lines.push("MECHANISME");
    lines.push(item.mechanism);
    lines.push("");
    lines.push("BREERPUNT");
    lines.push(item.breakpoint);
    lines.push("");
    lines.push("SIGNALEN");
    lines.push(item.signals);
    lines.push("");
    lines.push("HERSTELACTIE");
    lines.push(item.recoveryAction);
    lines.push("");
  });
  return lines.join("\n").trim();
}

function buildYouthPressureTest(input: StrategicPressureTestNodeInput): StrategicPressureTestItem[] {
  return [
    {
      stressFactor: "Stijgende zorgvraag",
      mechanism:
        "Meer instroom via gemeenten en consortium zet direct druk op caseload, wachttijd en bereikbaarheid van teams.",
      breakpoint:
        "De gekozen koers werkt niet meer zodra instroom sneller groeit dan de capaciteit en caseloadnorm kunnen dragen.",
      signals: "Caseload > 18, wachttijd > 12 weken, oplopende doorlooptijd in twee meetperiodes.",
      recoveryAction:
        "Begrens instroom tijdelijk, herijk gemeentenmix en koppel triage direct aan beschikbare teamcapaciteit.",
    },
    {
      stressFactor: "Personeelsschaarste",
      mechanism:
        "Meer afhankelijkheid van flexibele inzet verhoogt kosten en verzwakt continuïteit, juist wanneer de zorgzwaarte oploopt.",
      breakpoint:
        "De strategie breekt zodra teamstabiliteit daalt en de flexibele schil de vaste kern structureel gaat compenseren.",
      signals: "Stijgende flexratio, hogere uitstroom, toenemende verzuimdruk en dalende rendabiliteit.",
      recoveryAction:
        "Temporiseer volume, prioriteer werving en stel een bestuurlijke grens aan flexinzet en caseload.",
    },
    {
      stressFactor: "Contractdruk",
      mechanism:
        "Verschillen in tarief, reistijd en contractvoorwaarden maken brede toegankelijkheid snel verlieslatend als er geen scherpe begrenzing is.",
      breakpoint:
        "De strategie werkt niet meer zodra brede aanwezigheid niet meer samengaat met minimale marge en uitvoerbare reistijd.",
      signals: "Marge < 4%, verslechterende contractmix, oplopende reistijd en meer verliesgevende productlijnen.",
      recoveryAction:
        "Heronderhandel contractmix, markeer kern- en uitstapgemeenten en activeer bestuurlijke stopregels per productlijn.",
    },
  ];
}

function buildGenericPressureTest(input: StrategicPressureTestNodeInput): StrategicPressureTestItem[] {
  const choice = normalize(input.recommendedChoice) || "de gekozen strategische richting";
  return [
    {
      stressFactor: "Stijgende vraag",
      mechanism:
        `Meer vraag maakt ${choice} aantrekkelijk, maar verhoogt ook direct de druk op uitvoering, prioriteiten en doorlooptijd.`,
      breakpoint:
        "De strategie werkt niet meer zodra extra vraag sneller groeit dan de organisatie bestuurlijk en operationeel kan absorberen.",
      signals: "Oplopende wachttijd, dalende voorspelbaarheid en meer druk op kritieke teams of processen.",
      recoveryAction:
        "Begrens instroom, herprioriteer capaciteit en koppel groei alleen aan aantoonbare draagkracht.",
    },
    {
      stressFactor: "Governanceproblemen",
      mechanism:
        "Onduidelijke besluitrechten of versnipperde sturing zorgen dat dezelfde strategie in de uitvoering tegenstrijdig wordt geïnterpreteerd.",
      breakpoint:
        "De strategie faalt zodra meerdere delen van de organisatie verschillende grenzen of prioriteiten gaan hanteren.",
      signals: "Tegenstrijdige besluiten, escalaties, herhaalde uitzonderingen en trage besluitvorming.",
      recoveryAction:
        "Maak besluitrechten expliciet, versmal uitzonderingen en herstel één bestuurlijk ritme voor herijking.",
    },
    {
      stressFactor: "Prijs- of margedruk",
      mechanism:
        "Dalende economische ruimte maakt elke strategische keuze kwetsbaar als de organisatie blijft werken alsof alle activiteiten even houdbaar zijn.",
      breakpoint:
        "De strategie werkt niet meer zodra marge-erosie sneller gaat dan bestuurlijke bijsturing.",
      signals: "Dalende marge, oplopende kosten en groeiende druk op productiviteit of kwaliteit.",
      recoveryAction:
        "Herzie portfolio, stop verlieslatende activiteiten en koppel verdere groei aan harde rendementsgrenzen.",
    },
  ];
}

export function buildStrategicPressureTestNodePrompt(
  input: StrategicPressureTestNodeInput
): string {
  const context = [
    `Aanbevolen keuze: ${normalize(input.recommendedChoice) || "Niet beschikbaar."}`,
    toText(input.sectorContext),
    normalize(input.strategicParadox),
    (input.facts ?? []).map((item) => `- ${normalize(item)}`).filter(Boolean).join("\n"),
    (input.risks ?? []).map((item) => `- ${normalize(item)}`).filter(Boolean).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  return [
    STRATEGIC_PRESSURE_TEST_SYSTEM_PROMPT,
    "",
    STRATEGIC_PRESSURE_TEST_INSTRUCTION_PROMPT,
    "",
    STRATEGIC_PRESSURE_TEST_FEW_SHOT,
    "",
    "INPUT",
    context,
  ].join("\n\n");
}

export function runStrategicPressureTestNode(
  input: StrategicPressureTestNodeInput
): StrategicPressureTestNodeOutput {
  const source = [
    normalize(input.organizationName),
    normalize(input.recommendedChoice),
    normalize(input.strategicParadox),
    toText(input.sectorContext),
    (input.facts ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
    (input.risks ?? []).map((item) => normalize(item)).filter(Boolean).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  const pressureTest =
    /\bjeugdzorg|gemeente|consortium|wachttijd|caseload\b/i.test(source)
      ? buildYouthPressureTest(input)
      : buildGenericPressureTest(input);

  return {
    pressureTest,
    block: formatBlock(pressureTest),
  };
}
