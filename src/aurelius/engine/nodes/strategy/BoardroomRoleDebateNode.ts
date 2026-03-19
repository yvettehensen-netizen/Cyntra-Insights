export type BoardroomRoleDebateNodeInput = {
  organizationName?: string;
  recommendedChoice?: string;
  sectorContext?: string | string[];
  strategicParadox?: string;
  pressurePoints?: string[];
};

export type BoardroomRoleDebate = {
  cfo: string;
  bestuurder: string;
  strategicAdvisor: string;
  boardQuestion: string;
};

export type BoardroomRoleDebateNodeOutput = {
  boardroomRoleDebate: BoardroomRoleDebate;
  block: string;
};

export const BOARDROOM_ROLE_DEBATE_SYSTEM_PROMPT = `
Je simuleert een strategisch debat
tussen drie rollen in een bestuurskamer.

Elke rol kijkt vanuit een ander perspectief
naar de voorgestelde strategie.

De rollen zijn:

1. CFO – kijkt naar financiële houdbaarheid, risico en marges
2. Bestuurder – kijkt naar missie, legitimiteit en positie in het netwerk
3. Strategisch adviseur – kijkt naar marktlogica en structurele effecten

Elke rol benoemt:

- wat klopt aan de strategie
- waar het risico zit
- welke vraag het bestuur moet beantwoorden

De toon is professioneel, scherp en respectvol.

Doel van het debat is niet om gelijk te krijgen,
maar om de strategie bestuurlijk robuuster te maken.

Schrijf in helder Nederlands.
`.trim();

export const BOARDROOM_ROLE_DEBATE_INSTRUCTION_PROMPT = `
AURELIUS NODE: BOARDROOM DEBATE

DOEL
Simuleer een kritisch strategisch debat
over de aanbevolen strategische keuze.

De bedoeling is om de strategie te testen
vanuit verschillende bestuurlijke perspectieven.

ROLLEN

CFO
Focust op financiële houdbaarheid, kostenstructuur
en langetermijnrisico's.

BESTUURDER
Focust op missie, maatschappelijke legitimiteit
en positie in het netwerk.

STRATEGISCH ADVISEUR
Focust op marktlogica, structurele trends
en strategische positionering.

STAPPEN

1. Neem de aanbevolen strategische keuze.
2. Laat elke rol reageren.
3. Identificeer de belangrijkste spanning in het debat.
4. Formuleer een bestuurlijke vraag.

OUTPUTSTRUCTUUR

### Boardroom debat

CFO
Wat vindt de CFO sterk aan de strategie?
Waar ziet hij of zij het grootste risico?

BESTUURDER
Wat betekent de strategie voor missie,
relevantie en netwerkpositie?

STRATEGISCH ADVISEUR
Hoe robuust is de strategie gezien
marktontwikkelingen en sectorstructuur?

KERNVRAAG VOOR HET BESTUUR
Welke vraag moet het bestuur beantwoorden
om de strategie robuust te maken?

STIJL

- maximaal 200 woorden
- helder Nederlands
- compact en bestuurlijk
`.trim();

export const BOARDROOM_ROLE_DEBATE_FEW_SHOT = `
FEW-SHOT VOORBEELD

### Boardroom debat

CFO
De strategie om het gemeentenportfolio actief te begrenzen is logisch zolang de organisatie grip houdt op caseload en contractrendement. Het risico zit in de variatie tussen gemeenten: kleine verschillen in tarieven, reistijd en no-show kunnen de marge snel onder druk zetten.

BESTUURDER
De brede positie houdt de organisatie relevant voor gemeenten en het consortium. Te sterke begrenzing kan ertoe leiden dat de organisatie minder zichtbaar wordt in regionale samenwerking en instroom verliest.

STRATEGISCH ADVISEUR
De strategie werkt zolang de organisatie actief stuurt op haar gemeentenportfolio en niet doet alsof cultuur, teamstabiliteit en capaciteit vanzelf opschalen. Zonder selectie ontstaat een diffuus netwerk waarin capaciteit versnipperd raakt.

KERNVRAAG VOOR HET BESTUUR
Welke gemeenten zijn strategische kern, waar vergroot de organisatie alleen nog capaciteit onder harde voorwaarden, en waar moet zij het zorgmodel of de instroomroute veranderen?
`.trim();

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toText(value?: string | string[]): string {
  if (Array.isArray(value)) return value.map((item) => normalize(item)).filter(Boolean).join("\n");
  return normalize(value);
}

function formatBlock(value: BoardroomRoleDebate): string {
  return [
    "### Boardroom debat",
    "",
    "CFO",
    value.cfo,
    "",
    "BESTUURDER",
    value.bestuurder,
    "",
    "STRATEGISCH ADVISEUR",
    value.strategicAdvisor,
    "",
    "KERNVRAAG VOOR HET BESTUUR",
    value.boardQuestion,
  ].join("\n");
}

export function buildBoardroomRoleDebateNodePrompt(input: BoardroomRoleDebateNodeInput): string {
  const context = [
    `Organisatie: ${normalize(input.organizationName) || "Onbekend"}`,
    `Aanbevolen keuze: ${normalize(input.recommendedChoice) || "Niet beschikbaar"}`,
    `Strategische paradox: ${normalize(input.strategicParadox) || "Niet beschikbaar"}`,
    toText(input.sectorContext),
    (input.pressurePoints ?? []).map((item) => `- ${normalize(item)}`).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  return [
    BOARDROOM_ROLE_DEBATE_SYSTEM_PROMPT,
    "",
    BOARDROOM_ROLE_DEBATE_INSTRUCTION_PROMPT,
    "",
    BOARDROOM_ROLE_DEBATE_FEW_SHOT,
    "",
    "INPUT",
    context,
  ].join("\n\n");
}

export function runBoardroomRoleDebateNode(
  input: BoardroomRoleDebateNodeInput
): BoardroomRoleDebateNodeOutput {
  const choice = normalize(input.recommendedChoice) || "de gekozen strategische richting";
  const context = [
    normalize(input.organizationName),
    normalize(input.recommendedChoice),
    normalize(input.strategicParadox),
    toText(input.sectorContext),
    (input.pressurePoints ?? []).map((item) => normalize(item)).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  const boardroomRoleDebate: BoardroomRoleDebate =
    /\bjeugdzorg|gemeente|consortium|regionaal\b/i.test(context)
      ? {
          cfo: `De strategie om ${choice} is logisch zolang contractrendement, reistijd, no-show en caseload bestuurlijk binnen grens blijven. Het grootste risico is dat kleine verschillen tussen gemeenten onzichtbaar margeverlies veroorzaken voordat het bestuur ingrijpt.`,
          bestuurder:
            "De brede positie houdt de organisatie relevant voor gemeenten en het regionale netwerk. Te sterke begrenzing kan die legitimiteit verzwakken, maar te veel openheid tast juist kwaliteit, wachttijd en continuïteit aan.",
          strategicAdvisor:
            "De strategie is robuust zolang de organisatie haar gemeentenportfolio actief ordent en niet doet alsof alle instroom even wenselijk of uitvoerbaar is. Zonder selectie verandert breedte in versnippering en raakt cultuurkapitaal uitgehold.",
          boardQuestion:
            "Welke gemeenten zijn strategische kern, waar vergroot de organisatie alleen nog capaciteit onder harde voorwaarden, en waar moet zij instroomroute of zorgmodel veranderen om teamstabiliteit en uitvoerbaarheid te beschermen?",
        }
      : {
          cfo: `De gekozen richting ${choice} is verdedigbaar zolang kosten, marge en tempo in dezelfde lijn blijven. Het risico zit in groei of verbreding zonder harde financiële grens.`,
          bestuurder:
            "De strategie kan positie en legitimiteit versterken, maar alleen als zichtbaar blijft waarom deze keuze nodig is en wat de organisatie bewust niet meer doet.",
          strategicAdvisor:
            "De robuustheid van de strategie hangt af van haar vermogen om focus aan te brengen in een omgeving die juist tot spreiding verleidt. Zonder scherpe grens verliest de strategie haar effect.",
          boardQuestion:
            "Welke grens moet het bestuur expliciet bewaken zodat de strategie niet breed blijft in woorden, maar scherp wordt in uitvoering?",
        };

  return {
    boardroomRoleDebate,
    block: formatBlock(boardroomRoleDebate),
  };
}
