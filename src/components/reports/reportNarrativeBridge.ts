import type { GovernanceIntervention, ReportViewModel } from "./types";

export type HgbcoBlock = {
  key: "H" | "G" | "B" | "C" | "O";
  title: string;
  body: string;
};

export type CyntraMeaning = {
  bestuurlijkeOpgave: string;
  waaromNu: string;
  waarCyntraKanHelpen: string[];
  concreteVolgendeStap: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function sentence(value: string, fallback = ""): string {
  const text = normalize(value) || fallback;
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function firstMeaningful(lines: string[]): string {
  return lines.map((item) => normalize(item)).find(Boolean) || "";
}

function interventionLine(item: GovernanceIntervention, index: number): string {
  const action = sentence(item.action, `Interventie ${index + 1}`);
  const mechanism = normalize(item.mechanism);
  return mechanism ? `${action} Dit helpt omdat ${mechanism.charAt(0).toLowerCase()}${mechanism.slice(1)}` : action;
}

export function buildHgbcoNarrative(model: ReportViewModel): HgbcoBlock[] {
  const whyChoice = firstMeaningful(model.bestuurlijkeBesliskaart.whyReasons);
  const consequence = [
    model.boardDecisionPressure.operational,
    model.boardDecisionPressure.financial,
    model.boardDecisionPressure.organizational,
  ]
    .map((item) => sentence(item))
    .filter(Boolean)
    .join(" ");
  const support = model.governanceInterventions[0]
    ? interventionLine(model.governanceInterventions[0], 0)
    : sentence(model.noIntervention || model.strategyAlert, "Vaste bestuurlijke herijking is nodig om koers en uitvoerbaarheid bij elkaar te houden.");

  return [
    {
      key: "H",
      title: "Huidige situatie",
      body: sentence(
        firstMeaningful([
          model.executiveSummary,
          model.bestuurlijkeBesliskaart.coreProblem,
        ]),
        "De organisatie staat op een punt waarop strategie, uitvoering en bestuurlijke discipline direct op elkaar ingrijpen."
      ),
    },
    {
      key: "G",
      title: "Grootste spanning",
      body: sentence(
        model.strategicConflict || model.bestuurlijkeBesliskaart.coreProblem,
        "De kernspanning zit tussen relevant blijven in het netwerk en scherp begrenzen wat de organisatie werkelijk kan dragen."
      ),
    },
    {
      key: "B",
      title: "Bestuurlijke keuze",
      body: sentence(
        model.recommendedDirection || model.bestuurlijkeBesliskaart.recommendedChoice,
        "Het bestuur moet kiezen voor een richting die positie behoudt, maar grenzen expliciet maakt."
      ),
    },
    {
      key: "C",
      title: "Consequentie",
      body: sentence(
        consequence,
        "Als het bestuur die keuze niet vertaalt naar concrete grenzen, lopen druk, risico en bestuurlijke ruis tegelijk op."
      ),
    },
    {
      key: "O",
      title: "Ondersteuning",
      body: sentence(
        support,
        "Cyntra kan helpen om de gekozen richting te vertalen naar een bestuurlijk ritme, duidelijke grenswaarden en uitvoerbare besluiten."
      ),
    },
  ];
}

export function buildCyntraMeaning(model: ReportViewModel): CyntraMeaning {
  const interventions = model.governanceInterventions.slice(0, 3);
  const supportLines = interventions.length
    ? interventions.map((item, index) => interventionLine(item, index))
    : [
        sentence("Gemeentenportfolio, capaciteit en contractdiscipline in één bestuurlijk ritme zetten"),
        sentence("Stopregels en grenswaarden vastleggen voor caseload, wachttijd en margedruk"),
        sentence("Besluiten aanscherpen zodat strategie, uitvoering en bestuurlijke opvolging op elkaar blijven aansluiten"),
      ];

  return {
    bestuurlijkeOpgave: sentence(
      model.bestuurlijkeBesliskaart.coreStatement || model.boardQuestion,
      "De opgave voor het bestuur is de gekozen richting te vertalen naar concrete grenzen en bestuurlijke keuzes."
    ),
    waaromNu: sentence(
      firstMeaningful([
        model.strategyAlert,
        model.noIntervention,
        model.stressTest,
      ]),
      "Dit speelt nu omdat uitstel de druk op uitvoering, teamstabiliteit en economische houdbaarheid vergroot."
    ),
    waarCyntraKanHelpen: supportLines,
    concreteVolgendeStap: sentence(
      interventions[0]?.boardDecision ||
        "Een gerichte werksessie met bestuur en directie waarin keuze, grenswaarden en opvolgritme expliciet worden vastgelegd",
      "Een gerichte werksessie met bestuur en directie waarin keuze, grenswaarden en opvolgritme expliciet worden vastgelegd."
    ),
  };
}
