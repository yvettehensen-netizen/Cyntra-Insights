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
  if (report.execution_layer?.strategic_actions?.length) {
    return report.execution_layer.strategic_actions.slice(0, 3).map((item) => ({
      action: item.action,
      mechanism: report.board_analysis?.structural_tension || report.strategisch_rapport.strategische_paradox,
      boardDecision: `Het bestuur besluit ${item.action.toLowerCase()} en volgt dit op ${item.timeline.toLowerCase()}.`,
      owner: item.owner,
      deadline: item.timeline,
      kpi: item.kpi,
    }));
  }
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
  return report.strategisch_rapport.doorbraakinzichten.slice(0, 5).map((insight, index) => {
    const source = String(insight || "");
    return {
      insight: (source.match(/KERNINZICHT\s*[—:-]\s*(.+)/i)?.[1] || source).trim(),
      mechanism: (
        source.match(/ONDERLIGGENDE OORZAAK\s*[—:-]\s*(.+)/i)?.[1]
        || report.board_analysis?.mechanism_analysis?.[index]
        || report.board_analysis?.structural_tension
        || report.strategisch_rapport.strategische_paradox
      ).trim(),
      implication: (
        source.match(/BESTUURLIJK GEVOLG\s*[—:-]\s*(.+)/i)?.[1]
        || report.strategisch_rapport.strategisch_narratief.bestuurlijke_opgave
      ).trim(),
    };
  });
}

function buildScenarios(report: StrategicBrainReport): CompactScenario[] {
  if (report.board_analysis?.scenario_comparison?.length) {
    return report.board_analysis.scenario_comparison.slice(0, 3).map((item) => ({
      title: `Scenario ${item.code} — ${item.title}`,
      mechanism: item.mechanism,
      risk: item.risk,
      boardImplication: item.strategic_implication,
    }));
  }
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
    decisionConfidence: report.bestuurlijk_overzicht.decision_confidence || report.executive_decision_card?.decision_confidence,
  };
}

function buildStrategySections(report: StrategicBrainReport): ReportSection[] {
  const governance = buildGovernanceInterventions(report);
  return [
    {
      title: "Besluit",
      body: [
        `KERNPROBLEEM\n${report.executive_decision_card?.core_problem || report.bestuurlijk_overzicht.kernprobleem}`,
        `KERNSTELLING\n${report.executive_decision_card?.strategic_tension || report.bestuurlijk_overzicht.kernstelling}`,
        `AANBEVOLEN KEUZE\n${report.executive_decision_card?.recommended_decision || report.bestuurlijk_overzicht.aanbevolen_keuze}`,
      ].join("\n\n"),
    },
    {
      title: "Spanning",
      body: report.board_analysis?.structural_tension || report.strategisch_rapport.strategische_paradox,
    },
    {
      title: "Waarom dit gebeurt",
      body: [
        `WAARHEID — ${report.strategisch_rapport.ongemakkelijke_waarheid.waarheid}`,
        `UITLEG — ${report.strategisch_rapport.ongemakkelijke_waarheid.uitleg}`,
        `BESTUURLIJKE IMPLICATIE — ${report.strategisch_rapport.ongemakkelijke_waarheid.bestuurlijke_implicatie}`,
        ...report.board_analysis.mechanism_analysis.map((item) => `MECHANISME — ${item}`),
      ].join("\n\n"),
    },
    {
      title: "Scenario's",
      body: report.board_analysis?.scenario_comparison?.length
        ? report.board_analysis.scenario_comparison
            .map(
              (item) => [
                `Scenario ${item.code} — ${item.title}`,
                `MECHANISME — ${item.mechanism}`,
                `RISICO — ${item.risk}`,
                `STRATEGISCHE IMPLICATIE — ${item.strategic_implication}`,
              ].join("\n")
            )
            .join("\n\n")
        : report.strategisch_rapport.keuzerichtingen.join("\n"),
    },
    {
      title: "Doorbraakinzichten",
      body: report.strategisch_rapport.doorbraakinzichten.join("\n\n"),
    },
    {
      title: "Bestuurlijke acties",
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
      title: "Stopregels",
      body: report.bestuurlijk_overzicht.stopregels.map((item) => `- ${item}`).join("\n"),
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
