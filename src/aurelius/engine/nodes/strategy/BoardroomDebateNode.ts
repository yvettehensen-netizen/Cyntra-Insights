import type { BlindSpot } from "./BlindSpotNode";
import type { DecisionConsequences } from "./DecisionConsequenceNode";
import type { StrategicLeveragePoint } from "./StrategicLeverageNode";

export type BoardroomDebate = {
  proponentView: string;
  criticView: string;
  strategicTension: string;
  boardSynthesis: string;
};

export type BoardroomDebateNodeInput = {
  executiveThesis?: string;
  strategicOptions?: string[];
  recommendedChoice?: string;
  blindSpots?: BlindSpot[];
  boardroomStressTest?: string;
  decisionConsequences?: DecisionConsequences;
  strategicLeverage?: StrategicLeveragePoint[];
  interventions?: string[];
  sectorContext?: string | string[];
  organizationName?: string;
};

export type BoardroomDebateNodeOutput = {
  boardroomDebate: BoardroomDebate;
  block: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toText(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value.map((item) => normalize(item)).filter(Boolean).join("\n");
  }
  return normalize(value);
}

function inferDecisionLabel(recommendedChoice: string, strategicOptions: string): string {
  const explicit = normalize(recommendedChoice);
  if (explicit) return explicit;
  const match = strategicOptions.match(/^[ABC][.)]\s*(.+)$/m);
  return match ? normalize(match[0]) : "de bestuurlijk best beheersbare richting";
}

function isYouthOrPublicContext(text: string): boolean {
  return /\bjeugdzorg|gemeente|gemeentelijke|jeugdwet|wijkteam|zorg\b/i.test(text);
}

function isScaleModelContext(text: string): boolean {
  return /\bnetwerk|partner|licentie|replicatie|modeladoptie|schaal\b/i.test(text);
}

function formatBlock(value: BoardroomDebate): string {
  return [
    "Standpunt Voorstander",
    value.proponentView,
    "Standpunt Criticus",
    value.criticView,
    "Strategische spanning",
    value.strategicTension,
    "Bestuurlijke synthese",
    value.boardSynthesis,
  ].join("\n");
}

function buildFallbackDebate(input: BoardroomDebateNodeInput): BoardroomDebate {
  const source = [
    normalize(input.executiveThesis),
    toText(input.strategicOptions),
    toText(input.sectorContext),
    normalize(input.boardroomStressTest),
    toText(input.interventions),
  ]
    .filter(Boolean)
    .join("\n");
  const decision = inferDecisionLabel(normalize(input.recommendedChoice), toText(input.strategicOptions));

  if (isYouthOrPublicContext(source)) {
    return {
      proponentView:
        `De voorstander stelt dat ${decision} logisch is omdat scherpere focus contractdruk, wachtdruk en teamstabiliteit tegelijk bestuurbaar maakt.`,
      criticView:
        "De criticus stelt dat te veel focus op de kern ook bereik kan verkleinen, waardoor gemeenten uitwijken naar andere aanbieders en politieke steun afneemt.",
      strategicTension:
        "De spanning is stabiliteit versus bereik: bestuurlijke beheersbaarheid neemt toe door focus, maar een te smalle koers kan marktruimte en verwijzersvertrouwen aantasten.",
      boardSynthesis:
        "Kies voor kernbescherming als hoofdrichting, maar borg parallel een netwerk- of doorverwijskader voor vragen die buiten de gekozen focus vallen.",
    };
  }

  if (isScaleModelContext(source)) {
    return {
      proponentView:
        `De voorstander verdedigt ${decision} omdat schaal alleen houdbaar is wanneer partnerdiscipline, kwaliteitsborging en expliciete governance de groei structureren.`,
      criticView:
        "De criticus waarschuwt dat schaalmechanismen bestuurlijke complexiteit kunnen versnellen voordat extra impact of marge werkelijk aantoonbaar is.",
      strategicTension:
        "De spanning is impactvergroting versus bestuurlijke controle: meer bereik is aantrekkelijk, maar zonder harde kwaliteitsrem groeit coördinatielast sneller dan hefboomwerking.",
      boardSynthesis:
        "Sta schaal slechts toe via een beperkt aantal gecontroleerde partners of cellen met auditritme, stopregels en expliciete besluitrechten.",
    };
  }

  return {
    proponentView:
      `De voorstander ziet ${decision} als de meest bestuurbare keuze omdat zij prioriteit versmalt en uitvoeringsdruk terugbrengt naar een beheersbaar niveau.`,
    criticView:
      "De criticus waarschuwt dat elke scherpe keuze ook kansen sluit en extra kwetsbaarheid creëert als de onderliggende aanname niet expliciet wordt getest.",
    strategicTension:
      "De fundamentele spanning is bestuurlijke focus versus optionele flexibiliteit: kiezen verhoogt stuurkracht, maar maakt verkeerde aannames ook sneller zichtbaar.",
    boardSynthesis:
      "Neem het besluit, maar koppel het aan expliciete validatiecriteria, stopregels en een kort ritme voor herbeoordeling van de kernhypothese.",
  };
}

export function runBoardroomDebateNode(
  input: BoardroomDebateNodeInput
): BoardroomDebateNodeOutput {
  const source = [
    normalize(input.executiveThesis),
    toText(input.strategicOptions),
    normalize(input.recommendedChoice),
    toText(input.sectorContext),
    toText(input.interventions),
    normalize(input.boardroomStressTest),
    Array.isArray(input.blindSpots)
      ? input.blindSpots.map((item) => `${item.title} ${item.insight} ${item.risk}`).join("\n")
      : "",
    input.decisionConsequences
      ? [
          input.decisionConsequences.horizon12m,
          input.decisionConsequences.horizon24m,
          input.decisionConsequences.horizon36m,
          input.decisionConsequences.riskIfWrong,
        ].join("\n")
      : "",
    Array.isArray(input.strategicLeverage)
      ? input.strategicLeverage.map((item) => `${item.title} ${item.mechanism} ${item.expectedEffect}`).join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const fallback = buildFallbackDebate(input);
  let boardroomDebate = fallback;

  if (isYouthOrPublicContext(source)) {
    boardroomDebate = {
      proponentView:
        "De voorstander verdedigt bescherming van de kern omdat personeelschaarste, contractdruk en zorgcomplexiteit tegelijk vragen om minder bestuurlijke spreiding en een scherpere doelgroepkeuze.",
      criticView:
        "De criticus waarschuwt dat een te strakke focus wachttijden zichtbaar kan houden en gemeenten ertoe kan bewegen om volume of breedte elders onder te brengen.",
      strategicTension:
        "De keuze is stabiliteit versus bereik: focus beschermt kwaliteit en team, maar een smallere propositie kan contractruimte of publieke legitimiteit onder druk zetten als zij niet goed wordt uitgelegd.",
      boardSynthesis:
        "Bescherm de kern als primaire koers, maar organiseer aanvullend partnerroutering, contractdialoog en zichtbare wachttijdsturing zodat focus niet wordt gelezen als terugtrekking.",
    };
  } else if (isScaleModelContext(source)) {
    boardroomDebate = {
      proponentView:
        "De voorstander stelt dat de aanbevolen richting schaal mogelijk maakt zonder lineaire personeelsgroei, juist omdat kwaliteit via partnerdiscipline, standaardisatie en governance wordt beschermd.",
      criticView:
        "De criticus ziet het risico dat schaalambitie sneller groeit dan auditdiscipline, waardoor reputatie, marge en bestuurlijke controle tegelijk onder spanning komen.",
      strategicTension:
        "De spanning is schaal versus bestuurlijke beheersbaarheid: grotere impact is aantrekkelijk, maar alleen houdbaar als controlemechanismen eerder volwassen zijn dan het groeitempo.",
      boardSynthesis:
        "Laat schaal slechts toe via gefaseerde adoptie met beperkte partnerinstroom, harde kwaliteitsdrempels en expliciete kill-switches wanneer governance achterblijft.",
    };
  }

  const validated: BoardroomDebate = {
    proponentView: normalize(boardroomDebate.proponentView) || fallback.proponentView,
    criticView: normalize(boardroomDebate.criticView) || fallback.criticView,
    strategicTension: normalize(boardroomDebate.strategicTension) || fallback.strategicTension,
    boardSynthesis: normalize(boardroomDebate.boardSynthesis) || fallback.boardSynthesis,
  };

  return {
    boardroomDebate: validated,
    block: formatBlock(validated),
  };
}
