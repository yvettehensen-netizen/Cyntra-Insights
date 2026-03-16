import type { StrategicAnalysisMap } from "./StrategicAnalysisMap";

function ensureSentence(value: string): string {
  const text = String(value ?? "").trim();
  if (!text) return "onvoldoende informatie beschikbaar.";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function buildBoardroomSummary(map: StrategicAnalysisMap): string {
  return [
    "0. Boardroom summary",
    `Organisatie: ${map.organisation}`,
    `Sector: ${map.sector}`,
    `Analyse datum: ${map.analysisDate}`,
    `Dominant risico: ${map.dominantRisk}.`,
    `Aanbevolen richting: ${map.recommendedOption}.`,
  ].join("\n");
}

function buildDecisionQuestion(map: StrategicAnalysisMap): string {
  return `Welke keuze verlaagt nu het structurele risico zonder kwaliteit, teamstabiliteit en contractdiscipline te schaden?`;
}

function buildFactsBase(map: StrategicAnalysisMap): string {
  const facts = [
    map.dominantRisk,
    map.strategyChallenge?.externalPressure || "",
    map.strategyChallenge?.requiredCondition || "",
  ].filter(Boolean);
  return facts.slice(0, 3).map((item) => ensureSentence(item)).join("\n\n");
}

function buildDecisionConsequences(map: StrategicAnalysisMap): string {
  return [
    `OPERATIONEEL GEVOLG — ${ensureSentence(map.scenarios[0]?.risk || map.dominantRisk)}`,
    `FINANCIEEL GEVOLG — ${ensureSentence(map.strategyChallenge?.externalPressure || map.dominantRisk)}`,
    `ORGANISATORISCH GEVOLG — ${ensureSentence(map.strategyChallenge?.requiredCondition || `Het bestuur moet kiezen tussen ${map.strategicTension.optionA} en ${map.strategicTension.optionB}`)}`,
  ].join("\n\n");
}

function buildSystemMechanism(map: StrategicAnalysisMap): string {
  const mechanism = map.systemMechanism;
  if (!mechanism) {
    return [
      "SYMPTOOM — onvoldoende informatie beschikbaar.",
      "OORZAAK — onvoldoende informatie beschikbaar.",
      "MECHANISME — onvoldoende informatie beschikbaar.",
      "GEVOLG — onvoldoende informatie beschikbaar.",
      "SYSTEEMDRUK — onvoldoende informatie beschikbaar.",
      "BESTUURLIJKE IMPLICATIE — onvoldoende informatie beschikbaar.",
    ].join("\n");
  }

  return [
    `SYMPTOOM — ${ensureSentence(mechanism.symptom)}`,
    `OORZAAK — ${ensureSentence(mechanism.cause)}`,
    `MECHANISME — ${ensureSentence(mechanism.mechanism)}`,
    `GEVOLG — ${ensureSentence(mechanism.consequence)}`,
    `SYSTEEMDRUK — ${ensureSentence(mechanism.systemPressure)}`,
    `BESTUURLIJKE IMPLICATIE — ${ensureSentence(mechanism.boardImplication)}`,
  ].join("\n");
}

function buildStrategicQuestions(map: StrategicAnalysisMap): string {
  const questions = map.strategicQuestions;
  if (!questions) {
    return [
      "1. BESTAANSRECHT — onvoldoende informatie beschikbaar.",
      "2. MACHT — onvoldoende informatie beschikbaar.",
      "3. BOTTLENECK — onvoldoende informatie beschikbaar.",
      "4. BREEKPUNT — onvoldoende informatie beschikbaar.",
      "5. BESTUURSVRAAG — onvoldoende informatie beschikbaar.",
    ].join("\n");
  }
  return [
    `1. BESTAANSRECHT — ${ensureSentence(questions.raisonDetre)}`,
    `2. MACHT — ${ensureSentence(questions.powerStructure)}`,
    `3. BOTTLENECK — ${ensureSentence(questions.bottleneck)}`,
    `4. BREUKPUNT — ${ensureSentence(questions.failurePoint)}`,
    `5. BESTUURSVRAAG — ${ensureSentence(questions.boardDecision)}`,
  ].join("\n");
}

function buildStrategicPattern(map: StrategicAnalysisMap): string {
  const pattern = map.strategicPattern;
  if (!pattern) {
    return [
      "PRIMAIR PATROON — onvoldoende informatie beschikbaar.",
      "SECUNDAIR PATROON — onvoldoende informatie beschikbaar.",
      "PATROONMECHANISME — onvoldoende informatie beschikbaar.",
      "PATROONRISICO — onvoldoende informatie beschikbaar.",
    ].join("\n");
  }
  return [
    `PRIMAIR PATROON — ${ensureSentence(pattern.primaryPattern)}`,
    `SECUNDAIR PATROON — ${ensureSentence(pattern.secondaryPattern)}`,
    `PATROONMECHANISME — ${ensureSentence(pattern.mechanism)}`,
    `PATROONRISICO — ${ensureSentence(pattern.dominantRisk)}`,
    `RATIONALE — ${ensureSentence(pattern.rationale)}`,
  ].join("\n");
}

function buildStrategicFailureSection(map: StrategicAnalysisMap): string {
  const points = map.strategicFailurePoints ?? [];
  return points
    .slice(0, 5)
    .map(
      (point, index) =>
        [
          `Breukpunt ${index + 1}`,
          `MECHANISME — ${ensureSentence(point.mechanism)}`,
          `SYSTEEMDRUK — ${ensureSentence(point.systemPressure)}`,
          `RISICO — ${ensureSentence(point.risk)}`,
          `BESTUURLIJKE TEST — ${ensureSentence(point.boardTest)}`,
        ].join("\n")
    )
    .join("\n\n");
}

function buildBoardroomRedFlags(map: StrategicAnalysisMap): string {
  const flags = map.boardroomRedFlags ?? [];
  return flags
    .slice(0, 6)
    .map(
      (flag, index) =>
        [
          `Red flag ${index + 1} — ${flag.category}`,
          `BESCHRIJVING — ${ensureSentence(flag.description)}`,
          `MECHANISME — ${ensureSentence(flag.mechanism)}`,
          `BESTUURLIJKE VRAAG — ${ensureSentence(flag.boardQuestion)}`,
        ].join("\n")
    )
    .join("\n\n");
}

function buildInsightBlocks(map: StrategicAnalysisMap): string {
  const seedInsights = [
    {
      insight: `${map.dominantRisk}.`,
      mechanism: `Het mechanisme ligt in ${map.strategicTension.optionA.toLowerCase()} versus ${map.strategicTension.optionB.toLowerCase()}.`,
      implication: "BESTUURLIJKE CONSEQUENTIE\nBestuur moet prioritering, contractruimte en capaciteitsritme expliciet verbinden.",
    },
    ...(map.strategyChallenge
      ? [
          {
            insight: ensureSentence(map.strategyChallenge.externalPressure),
            mechanism: ensureSentence(map.strategyChallenge.breakScenario),
            implication: `BESTUURLIJKE CONSEQUENTIE\n${ensureSentence(map.strategyChallenge.requiredCondition)}`,
          },
        ]
      : []),
    ...map.scenarios.map((scenario) => ({
      insight: ensureSentence(scenario.name),
      mechanism: ensureSentence(scenario.mechanism),
      implication: `BESTUURLIJKE CONSEQUENTIE\n${ensureSentence(scenario.governanceImplication)}`,
    })),
  ];

  const padded = [...seedInsights];
  while (padded.length < 7) {
    padded.push({
      insight: `Vroegsignaal ${padded.length + 1}`,
      mechanism: `Stopregel en KPI moeten direct terugleiden naar ${map.recommendedOption.toLowerCase()}.`,
      implication:
        "BESTUURLIJKE CONSEQUENTIE\nBij afwijking volgt herbesluit op capaciteit, contractruimte of positionering.",
    });
  }

  return padded
    .slice(0, 7)
    .map(
      (item, index) =>
        `Inzicht ${index + 1}\nINZICHT\n${item.insight}\nMECHANISME\n${item.mechanism}\n${item.implication}`
    )
    .join("\n\n");
}

function buildMechanismChains(map: StrategicAnalysisMap): string {
  const chainA = `${map.dominantRisk} -> hogere druk op kerncapaciteit -> scherpere keuzevolgorde nodig -> bestuurlijke beheersbaarheid stijgt`;
  const chainB = `${map.strategicTension.optionA} -> betere uitvoerbaarheid -> stabielere kwaliteit -> meer bestuurlijke rust`;
  const chainC = `${map.strategicTension.optionB} -> hogere focus of andere instroomlogica -> verschuiving in portfolio -> expliciet herbesluit nodig`;
  return [chainA, chainB, chainC].join("\n");
}

export function renderStrategicAnalysisMapReport(map: StrategicAnalysisMap): string {
  const scenarios = map.scenarios
    .map(
      (scenario) => [
        `${scenario.name}`,
        `MECHANISME: ${scenario.mechanism}`,
        `RISICO: ${scenario.risk}`,
        `RELATIE TOT SPANNING: ${map.strategicTension.optionA} / ${map.strategicTension.optionB}`,
        `BESTUURLIJKE IMPLICATIE: ${scenario.governanceImplication}`,
      ].join("\n")
    )
    .join("\n\n");

  const interventions = map.interventions
    .slice(0, 10)
    .map(
      (item, index) => [
        `STOPREGEL ${index + 1}`,
        `ACTIE: ${item.action}`,
        `RICHTING: ${map.recommendedOption}`,
        `WAAROM: ${item.reason}`,
        `RISICO: ${item.risk}`,
        `STOPREGEL: ${item.stopRule}`,
        `OWNER: ${item.owner || "Bestuur"}`,
        `DEADLINE: ${item.deadline || "30 dagen"}`,
        `KPI: ${item.KPI || "Meetbare verbetering op wachtdruk, marge of teamstabiliteit"}`,
      ].join("\n")
    )
    .join("\n\n");

  return [
    `${map.organisation}`,
    `Sector: ${map.sector}`,
    `Analyse datum: ${map.analysisDate}`,
    "",
    buildBoardroomSummary(map),
    "",
    "Besluitvraag",
    buildDecisionQuestion(map),
    "",
    "KERNPROBLEEM",
    `${map.dominantRisk}. De keuze loopt tussen ${map.strategicTension.optionA} en ${map.strategicTension.optionB}.`,
    "",
    "KERNSTELLING",
    `${map.dominantRisk}. Het bestuur moet kiezen tussen ${map.strategicTension.optionA} en ${map.strategicTension.optionB}.`,
    "",
    "Strategische kernvragen",
    buildStrategicQuestions(map),
    "",
    "Strategisch patroon",
    buildStrategicPattern(map),
    "",
    "Systeemmechanisme",
    buildSystemMechanism(map),
    "",
    "Feitenbasis",
    buildFactsBase(map),
    "",
    "Keuzerichtingen",
    map.decisionOptions.join("\n"),
    "",
    "AANBEVOLEN KEUZE",
    `${map.recommendedOption}.`,
    "",
    "Doorbraakinzichten",
    "### NIEUWE INZICHTEN (KILLER INSIGHTS)",
    buildInsightBlocks(map),
    "",
    "Mechanismeketens",
    buildMechanismChains(map),
    "",
    "Mogelijke ontwikkelingen",
    scenarios,
    "",
    "Bestuurlijke waarschuwingssignalen",
    buildBoardroomRedFlags(map),
    "",
    "Bestuurlijk actieplan",
    interventions,
    "",
    "Strategische breukpunten",
    buildStrategicFailureSection(map),
    "",
    "Besluitgevolgen",
    buildDecisionConsequences(map),
  ]
    .filter(Boolean)
    .join("\n");
}
