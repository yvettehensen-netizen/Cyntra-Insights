import type { StrategicPressureTestItem } from "./StrategicPressureTestNode";

export type BoardDecisionBriefNodeInput = {
  organizationName?: string;
  sector?: string;
  coreProblem?: string;
  strategicChoice?: string;
  whyChoice?: string[];
  majorRisk?: string;
  boardAction?: string;
  narrative?: string;
  pressureTest?: StrategicPressureTestItem[];
};

export type BoardDecisionBrief = {
  kernprobleem: string;
  strategischeKeuze: string;
  waaromDezeKeuze: string;
  belangrijksteRisico: string;
  bestuurlijkeActie: string;
};

export type BoardDecisionBriefNodeOutput = {
  boardDecisionBrief: BoardDecisionBrief;
  block: string;
};

export const BOARD_DECISION_BRIEF_SYSTEM_PROMPT = `
Je bent een strategisch adviseur
die analyses vertaalt naar bestuurlijke besluitdocumenten.

Je doel is een compacte Board Decision Brief te schrijven
die bestuurders helpt om een duidelijke keuze te maken.

Je focust op:

- het kernprobleem
- de strategische keuze
- de consequenties
- de bestuurlijke actie

De tekst moet kort, helder en bestuurlijk zijn.

Gebruik helder Nederlands.
`.trim();

export const BOARD_DECISION_BRIEF_INSTRUCTION_PROMPT = `
AURELIUS NODE: BOARD DECISION BRIEF

DOEL
Vertaal het strategisch rapport
naar een compacte besluitbrief voor bestuurders.

STAPPEN

1. Beschrijf het kernprobleem.
2. Benoem de strategische keuze.
3. Leg uit waarom deze keuze logisch is.
4. Beschrijf de belangrijkste risico's.
5. Formuleer de bestuurlijke actie.

OUTPUTSTRUCTUUR

### Board Decision Brief

KERNPROBLEEM
Beschrijf het centrale strategische probleem.

STRATEGISCHE KEUZE
Welke richting wordt aanbevolen?

WAAROM DEZE KEUZE
Waarom is deze richting logisch?

BELANGRIJKSTE RISICO
Wat moet het bestuur bewaken?

BESTUURLIJKE ACTIE
Wat moet het bestuur nu concreet doen?

STIJL

- maximaal 150 woorden
- helder Nederlands
- geschreven voor bestuurders
`.trim();

export const BOARD_DECISION_BRIEF_FEW_SHOT = `
Board Decision Brief

KERNPROBLEEM
Jeugdzorg ZIJN staat voor de spanning tussen brede regionale toegankelijkheid en de organisatorische grenzen van capaciteit en marge.

STRATEGISCHE KEUZE
Behoud de positie als brede ambulante specialist, maar introduceer duidelijke grenzen voor gemeentenportfolio, caseload en contractrendement.

WAAROM DEZE KEUZE
De brede positie houdt de organisatie relevant voor gemeenten en het consortium, maar zonder expliciete begrenzing groeit de uitvoeringsdruk sneller dan teams kunnen dragen.

BELANGRIJKSTE RISICO
Variatie in tarieven, reistijd en zorgzwaarte kan de marge en teamstabiliteit onder druk zetten.

BESTUURLIJKE ACTIE
Stel expliciete kaders vast voor gemeentenmix, caseload en wachttijd en herijk deze periodiek.
`.trim();

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function firstNonEmpty(values: Array<string | undefined>): string {
  return values.map((item) => normalize(item)).find(Boolean) || "";
}

function ensureSentence(value: string, fallback = ""): string {
  const text = normalize(value) || fallback;
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function formatBlock(value: BoardDecisionBrief): string {
  return [
    "### Board Decision Brief",
    "",
    "KERNPROBLEEM",
    value.kernprobleem,
    "",
    "STRATEGISCHE KEUZE",
    value.strategischeKeuze,
    "",
    "WAAROM DEZE KEUZE",
    value.waaromDezeKeuze,
    "",
    "BELANGRIJKSTE RISICO",
    value.belangrijksteRisico,
    "",
    "BESTUURLIJKE ACTIE",
    value.bestuurlijkeActie,
  ].join("\n");
}

export function buildBoardDecisionBriefNodePrompt(input: BoardDecisionBriefNodeInput): string {
  const context = [
    `Organisatie: ${normalize(input.organizationName) || "Onbekend"}`,
    `Sector: ${normalize(input.sector) || "Onbekend"}`,
    `Kernprobleem: ${normalize(input.coreProblem) || "Niet beschikbaar"}`,
    `Keuze: ${normalize(input.strategicChoice) || "Niet beschikbaar"}`,
    (input.whyChoice ?? []).map((item) => `- ${normalize(item)}`).join("\n"),
    normalize(input.majorRisk),
    normalize(input.boardAction),
    normalize(input.narrative),
    (input.pressureTest ?? []).map((item) => `- ${item.stressFactor}: ${item.breakpoint}`).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  return [
    BOARD_DECISION_BRIEF_SYSTEM_PROMPT,
    "",
    BOARD_DECISION_BRIEF_INSTRUCTION_PROMPT,
    "",
    BOARD_DECISION_BRIEF_FEW_SHOT,
    "",
    "INPUT",
    context,
  ].join("\n\n");
}

export function runBoardDecisionBriefNode(
  input: BoardDecisionBriefNodeInput
): BoardDecisionBriefNodeOutput {
  const firstRisk = input.pressureTest?.[0]?.breakpoint;
  const firstAction = input.pressureTest?.[0]?.recoveryAction;
  const why = firstNonEmpty(input.whyChoice ?? []);

  const boardDecisionBrief: BoardDecisionBrief = {
    kernprobleem: ensureSentence(
      input.coreProblem,
      "De organisatie staat voor een strategische spanning tussen haar positie in het netwerk en wat zij uitvoerbaar en financieel kan dragen."
    ),
    strategischeKeuze: ensureSentence(
      input.strategicChoice,
      "Kies voor een richting die relevantie behoudt, maar expliciete grenzen stelt aan portfolio, capaciteit en economische draagkracht."
    ),
    waaromDezeKeuze: ensureSentence(
      why || input.narrative,
      "Deze richting is logisch omdat zij de strategische positie beschermt zonder de uitvoeringsgrenzen te ontkennen."
    ),
    belangrijksteRisico: ensureSentence(
      input.majorRisk || firstRisk,
      "De gekozen richting verliest kracht zodra vraag, complexiteit of margedruk sneller oplopen dan de bestuurlijke discipline kan bijsturen."
    ),
    bestuurlijkeActie: ensureSentence(
      input.boardAction || firstAction,
      "Leg expliciete kaders vast voor prioriteit, capaciteit en grenswaarden en herijk deze periodiek in het bestuur."
    ),
  };

  return {
    boardDecisionBrief,
    block: formatBlock(boardDecisionBrief),
  };
}
