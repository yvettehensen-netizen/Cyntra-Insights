import type {
  BestuurlijkeBesliskaart,
  BoardDecisionPressure,
  CompactScenario,
  GovernanceIntervention,
  ReportSection,
  ReportViewModel,
  StructuredKillerInsight,
} from "@/components/reports/types";
import type { StrategicBrainReport } from "@/aurelius/engine/buildStrategicBrainReport";

function asSentence(value: string, fallback = ""): string {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function buildDecisionPressure(report: StrategicBrainReport): BoardDecisionPressure {
  const factors = report.scenario_simulatie.strategische_stresstest;
  return {
    operational: factors[0]?.breekpunt || report.bestuurlijk_overzicht.grootste_risico_bij_uitstel,
    financial: factors[1]?.breekpunt || report.strategisch_rapport.ongemakkelijke_waarheid.uitleg,
    organizational: factors[2]?.breekpunt || report.strategisch_rapport.strategisch_narratief.bestuurlijke_opgave,
  };
}

function buildGovernanceInterventions(report: StrategicBrainReport): GovernanceIntervention[] {
  return report.scenario_simulatie.strategische_stresstest.slice(0, 3).map((item, index) => ({
    action: item.herstelactie,
    mechanism: item.mechanisme,
    boardDecision: `Het bestuur besluit herstelactie ${index + 1} vast te leggen zodra ${item.signalen.toLowerCase()}.`,
    owner: index === 0 ? "Bestuur" : index === 1 ? "Directie" : "Managementteam",
    deadline: `Dag ${(index + 1) * 15}`,
    kpi: item.signalen,
  }));
}

function buildKillerInsights(report: StrategicBrainReport): StructuredKillerInsight[] {
  return report.strategisch_rapport.doorbraakinzichten.slice(0, 5).map((insight) => ({
    insight,
    mechanism: report.strategisch_rapport.strategische_paradox,
    implication: report.strategisch_rapport.strategisch_narratief.bestuurlijke_opgave,
  }));
}

function buildScenarios(report: StrategicBrainReport): CompactScenario[] {
  return report.scenario_simulatie.strategische_stresstest.slice(0, 3).map((item, index) => ({
    title: item.stressfactor || `Stressfactor ${index + 1}`,
    mechanism: item.mechanisme,
    risk: item.breekpunt,
    boardImplication: item.herstelactie,
  }));
}

function buildBoardCard(report: StrategicBrainReport): BestuurlijkeBesliskaart {
  return {
    organization: report.meta.organization,
    sector: report.meta.sector,
    analysisDate: report.meta.analysis_date_label,
    coreProblem: report.bestuurlijk_overzicht.kernprobleem,
    coreStatement: report.bestuurlijk_overzicht.kernstelling,
    recommendedChoice: report.bestuurlijk_overzicht.aanbevolen_keuze,
    whyReasons: report.bestuurlijk_overzicht.waarom_deze_keuze,
    riskIfDelayed: report.bestuurlijk_overzicht.grootste_risico_bij_uitstel,
    stopRules: report.bestuurlijk_overzicht.stopregels,
  };
}

function buildStrategySections(report: StrategicBrainReport): ReportSection[] {
  const governance = buildGovernanceInterventions(report);
  const decisionPressure = buildDecisionPressure(report);

  return [
    {
      title: "Bestuurlijke kernsamenvatting",
      body: [
        `Organisatie: ${report.meta.organization}`,
        `Sector: ${report.meta.sector}`,
        `Analyse datum: ${report.meta.analysis_date_label}`,
        "",
        `Besluit: ${asSentence(report.bestuurlijk_overzicht.aanbevolen_keuze)}`,
        asSentence(report.bestuurlijk_overzicht.kernstelling),
        asSentence(report.bestuurlijk_overzicht.grootste_risico_bij_uitstel),
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      title: "Strategische signalen",
      body: report.strategisch_rapport.strategische_signalen
        .map(
          (item, index) => [
            `Signaal ${index + 1} — ${item.signaal}`,
            `BETEKENIS — ${item.betekenis}`,
            `MOGELIJKE ONTWIKKELING — ${item.mogelijke_ontwikkeling}`,
          ].join("\n\n")
        )
        .join("\n\n"),
    },
    {
      title: "Strategisch patroon",
      body: [
        `PATROON — ${report.strategisch_rapport.strategisch_patroon.patroon}`,
        `HERKENNING — ${report.strategisch_rapport.strategisch_patroon.herkenning}`,
        `RISICO — ${report.strategisch_rapport.strategisch_patroon.risico}`,
        `STRATEGISCHE LES — ${report.strategisch_rapport.strategisch_patroon.strategische_les}`,
      ].join("\n\n"),
    },
    {
      title: "Strategische ervaring",
      body: [
        `PATROON — ${report.strategisch_rapport.strategische_ervaring.patroon}`,
        `VERGELIJKBARE SITUATIES — ${report.strategisch_rapport.strategische_ervaring.vergelijkbare_situaties}`,
        `STRATEGISCHE LES — ${report.strategisch_rapport.strategische_ervaring.strategische_les}`,
      ].join("\n\n"),
    },
    {
      title: "Strategische paradox",
      body: report.strategisch_rapport.strategische_paradox,
    },
    {
      title: "Paradox kwaliteitscontrole",
      body: [
        `SCORE — ${report.strategisch_rapport.paradox_kwaliteitscontrole.score}/5`,
        `BEOORDELING — ${report.strategisch_rapport.paradox_kwaliteitscontrole.beoordeling}`,
        `VERBETERDE PARADOX — ${report.strategisch_rapport.paradox_kwaliteitscontrole.verbeterde_paradox}`,
      ].join("\n\n"),
    },
    {
      title: "Ongemakkelijke waarheid",
      body: [
        `WAARHEID — ${report.strategisch_rapport.ongemakkelijke_waarheid.waarheid}`,
        `UITLEG — ${report.strategisch_rapport.ongemakkelijke_waarheid.uitleg}`,
        `BESTUURLIJKE IMPLICATIE — ${report.strategisch_rapport.ongemakkelijke_waarheid.bestuurlijke_implicatie}`,
      ].join("\n\n"),
    },
    {
      title: "Doorbraakinzichten",
      body: report.strategisch_rapport.doorbraakinzichten.join("\n"),
    },
    {
      title: "Keuzerichtingen",
      body: report.strategisch_rapport.keuzerichtingen.join("\n"),
    },
    {
      title: "Aanbevolen keuze",
      body: report.strategisch_rapport.besluit,
    },
    {
      title: "Boardroom debat",
      body: [
        `CFO — ${report.strategisch_rapport.boardroom_debat.cfo}`,
        `BESTUURDER — ${report.strategisch_rapport.boardroom_debat.bestuurder}`,
        `STRATEGISCH ADVISEUR — ${report.strategisch_rapport.boardroom_debat.strategisch_adviseur}`,
        `KERNVRAAG VOOR HET BESTUUR — ${report.strategisch_rapport.boardroom_debat.kernvraag_voor_het_bestuur}`,
      ].join("\n\n"),
    },
    {
      title: "Bestuurlijk actieplan",
      body: governance
        .map(
          (item, index) => [
            `Actie ${index + 1}`,
            `ACTIE — ${item.action}`,
            `MECHANISME — ${item.mechanism}`,
            `BESTUURLIJK BESLUIT — ${item.boardDecision}`,
            `VERANTWOORDELIJKE — ${item.owner} • ${item.deadline}`,
            `KPI — ${item.kpi}`,
          ].join("\n")
        )
        .join("\n\n"),
    },
    {
      title: "Vroegsignalering",
      body: report.scenario_simulatie.strategische_stresstest
        .map((item) => `Indicator: ${item.stressfactor}\nActie: ${item.signalen}`)
        .join("\n\n"),
    },
    {
      title: "Besluitgevolgen",
      body: [
        `OPERATIONEEL GEVOLG — ${decisionPressure.operational}`,
        `FINANCIEEL GEVOLG — ${decisionPressure.financial}`,
        `ORGANISATORISCH GEVOLG — ${decisionPressure.organizational}`,
      ].join("\n\n"),
    },
    {
      title: "Strategisch narratief",
      body: [
        `SITUATIE — ${report.strategisch_rapport.strategisch_narratief.situatie}`,
        `SPANNING — ${report.strategisch_rapport.strategisch_narratief.spanning}`,
        `DYNAMIEK — ${report.strategisch_rapport.strategisch_narratief.dynamiek}`,
        `KEUZE — ${report.strategisch_rapport.strategisch_narratief.keuze}`,
        `BESTUURLIJKE OPGAVE — ${report.strategisch_rapport.strategisch_narratief.bestuurlijke_opgave}`,
      ].join("\n\n"),
    },
    {
      title: "Board Decision Brief",
      body: [
        `KERNPROBLEEM — ${report.strategisch_rapport.board_decision_brief.kernprobleem}`,
        `STRATEGISCHE KEUZE — ${report.strategisch_rapport.board_decision_brief.strategische_keuze}`,
        `WAAROM DEZE KEUZE — ${report.strategisch_rapport.board_decision_brief.waarom_deze_keuze}`,
        `BELANGRIJKSTE RISICO — ${report.strategisch_rapport.board_decision_brief.belangrijkste_risico}`,
        `BESTUURLIJKE ACTIE — ${report.strategisch_rapport.board_decision_brief.bestuurlijke_actie}`,
      ].join("\n\n"),
    },
  ];
}

function buildScenarioSections(report: StrategicBrainReport): ReportSection[] {
  return report.scenario_simulatie.strategische_stresstest.map((item, index) => ({
    title: `Stressfactor ${index + 1}`,
    body: [
      `STRESSFACTOR — ${item.stressfactor}`,
      `MECHANISME — ${item.mechanisme}`,
      `BREEKPUNT — ${item.breekpunt}`,
      `SIGNALEN — ${item.signalen}`,
      `HERSTELACTIE — ${item.herstelactie}`,
    ].join("\n\n"),
  }));
}

function buildEngineSections(report: StrategicBrainReport): ReportSection[] {
  return [
    {
      title: "Perception layer",
      body: report.technische_analyse.perception.join("\n"),
    },
    {
      title: "Reasoning layer",
      body: report.technische_analyse.reasoning.join("\n"),
    },
    {
      title: "Decision layer",
      body: report.technische_analyse.decision.join("\n"),
    },
    {
      title: "Boardroom layer",
      body: report.technische_analyse.boardroom.join("\n"),
    },
    {
      title: "Trace",
      body: report.technische_analyse.trace.join("\n"),
    },
  ];
}

export function adaptStrategicBrainReportToViewModel(report: StrategicBrainReport): ReportViewModel {
  const structuredKillerInsights = buildKillerInsights(report);
  const governanceInterventions = buildGovernanceInterventions(report);
  const compactScenarios = buildScenarios(report);
  const boardDecisionPressure = buildDecisionPressure(report);

  return {
    organizationName: report.meta.organization,
    sessionId: report.meta.report_id,
    createdAt: report.meta.generated_at,
    sector: report.meta.sector,
    deckSubtitle: "Aurelius Strategic Brain",
    contactLines: [],
    qualityScore: report.strategisch_rapport.paradox_kwaliteitscontrole.score * 20,
    qualityTier: report.strategisch_rapport.paradox_kwaliteitscontrole.score >= 4 ? "premium" : "standard",
    dominantThesis: report.bestuurlijk_overzicht.kernstelling,
    strategicConflict: report.bestuurlijk_overzicht.kernprobleem,
    boardOptions: report.strategisch_rapport.keuzerichtingen,
    recommendedDirection: report.bestuurlijk_overzicht.aanbevolen_keuze,
    topInterventions: governanceInterventions.map((item) => ({
      title: item.action,
      mechanism: item.mechanism,
      kpi: item.kpi,
    })),
    structuredKillerInsights,
    governanceInterventions,
    compactScenarios,
    optionRejections: [],
    boardDecisionPressure,
    boardQuestion: report.strategisch_rapport.boardroom_debat.kernvraag_voor_het_bestuur,
    financialConsequences: boardDecisionPressure.financial,
    stressTest: report.scenario_simulatie.strategische_stresstest
      .map((item) => `${item.stressfactor}: ${item.breekpunt}`)
      .join("\n"),
    executiveSummary: report.bestuurlijk_overzicht.kernstelling,
    strategyAlert: report.bestuurlijk_overzicht.grootste_risico_bij_uitstel,
    noIntervention: report.bestuurlijk_overzicht.grootste_risico_bij_uitstel,
    strategySections: buildStrategySections(report),
    scenarioSections: buildScenarioSections(report),
    engineSections: buildEngineSections(report),
    qualityLevel:
      report.strategisch_rapport.paradox_kwaliteitscontrole.score >= 4
        ? "hoog"
        : report.strategisch_rapport.paradox_kwaliteitscontrole.score >= 3
          ? "middel"
          : "laag",
    qualityChecks: [report.strategisch_rapport.paradox_kwaliteitscontrole.beoordeling],
    criticalFlags: [],
    nonCriticalFlags: [],
    bestuurlijkeBesliskaart: buildBoardCard(report),
  };
}
