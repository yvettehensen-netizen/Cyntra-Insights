import {
  runStrategicBrainArchitecture,
  type StrategicBrainInput,
  type StrategicBrainOutput,
} from "@/aurelius/engine/runStrategicBrainArchitecture";

export type StrategicBrainReportMeta = {
  report_id: string;
  organization: string;
  sector: string;
  analysis_date: string;
  analysis_date_label: string;
  generated_at: string;
};

export type StrategicBrainBoardCard = {
  title: "Bestuurlijke besliskaart";
  kernprobleem: string;
  kernstelling: string;
  aanbevolen_keuze: string;
  waarom_deze_keuze: string[];
  grootste_risico_bij_uitstel: string;
  stopregels: string[];
  decision_confidence: {
    score: number;
    label: string;
    reasons: string[];
  };
};

export type StrategicBrainReport = {
  meta: StrategicBrainReportMeta;
  bestuurlijk_overzicht: StrategicBrainBoardCard;
  executive_decision_card: {
    core_problem: string;
    strategic_tension: string;
    recommended_decision: string;
    stop_rules: string[];
    decision_confidence: {
      score: number;
      label: string;
      reasons: string[];
    };
  };
  strategisch_rapport: {
    strategische_signalen: Array<{
      categorie: string;
      signaal: string;
      betekenis: string;
      mogelijke_ontwikkeling: string;
    }>;
    strategisch_patroon: {
      patroon: string;
      herkenning: string;
      risico: string;
      strategische_les: string;
    };
    strategische_ervaring: {
      patroon: string;
      vergelijkbare_situaties: string;
      strategische_les: string;
    };
    strategische_paradox: string;
    paradox_kwaliteitscontrole: {
      score: number;
      beoordeling: string;
      verbeterde_paradox: string;
    };
    ongemakkelijke_waarheid: {
      waarheid: string;
      uitleg: string;
      bestuurlijke_implicatie: string;
    };
    doorbraakinzichten: string[];
    keuzerichtingen: string[];
    besluit: string;
    boardroom_debat: {
      cfo: string;
      bestuurder: string;
      strategisch_adviseur: string;
      kernvraag_voor_het_bestuur: string;
    };
    strategisch_narratief: {
      situatie: string;
      spanning: string;
      dynamiek: string;
      keuze: string;
      bestuurlijke_opgave: string;
    };
    board_decision_brief: {
      kernprobleem: string;
      strategische_keuze: string;
      waarom_deze_keuze: string;
      belangrijkste_risico: string;
      bestuurlijke_actie: string;
    };
  };
  board_analysis: {
    situation: string;
    structural_tension: string;
    scenario_comparison: Array<{
      code: string;
      title: string;
      mechanism: string;
      risk: string;
      strategic_implication: string;
    }>;
    mechanism_analysis: string[];
    recommended_strategy: string;
  };
  execution_layer: {
    strategic_actions: Array<{
      action: string;
      owner: string;
      timeline: string;
      kpi: string;
    }>;
    kpis: string[];
    early_signals: string[];
    stress_test: string[];
  };
  institutional_memory: {
    summary: string;
    references: Array<{
      id: string;
      sector: string;
      pattern: string;
      organizations: number;
      score?: number;
      decision_fit?: boolean;
    }>;
    memory_file: string;
  };
  scenario_simulatie: {
    strategische_stresstest: Array<{
      stressfactor: string;
      mechanisme: string;
      breekpunt: string;
      signalen: string;
      herstelactie: string;
    }>;
  };
  technische_analyse: {
    perception: string[];
    reasoning: string[];
    decision: string[];
    boardroom: string[];
    trace: string[];
  };
  export: {
    markdown: string;
    json: Record<string, unknown>;
  };
};

function formatDateLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function createReportId(date: string, organization: string): string {
  const org = organization
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 6)
    .padEnd(6, "X");
  return `RPT-${date.replace(/-/g, "")}-${org}`;
}

function dedupe(items: string[]): string[] {
  return [...new Set(items.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function buildDecisionConfidence(output: StrategicBrainOutput): {
  score: number;
  label: string;
  reasons: string[];
} {
  const mechanismCoverage = [
    output.reasoning.tension.mechanism,
    output.reasoning.tension.structuralConstraints.economics,
    output.reasoning.tension.structuralConstraints.capacity,
    output.reasoning.tension.structuralConstraints.governance,
  ].filter((item) => String(item || "").trim()).length;
  const topReference = output.reasoning.institutionalMemory.references[0];
  const stopRuleCount = output.decision.governance.stopRules.filter(Boolean).length;
  const scenarioCount = output.decision.scenarios.scenarios.filter(Boolean).length;

  let score = 55;
  if (mechanismCoverage >= 3) score += 15;
  if (scenarioCount >= 3) score += 10;
  if (stopRuleCount >= 3) score += 10;
  if (topReference?.decisionFit) score += 10;
  if (typeof topReference?.score === "number") score += Math.max(0, Math.min(10, Math.round(topReference.score / 2)));
  score = Math.max(0, Math.min(100, score));

  const label = score >= 85 ? "Hoog" : score >= 70 ? "Stevig" : score >= 55 ? "Voorwaardelijk" : "Laag";
  const reasons = dedupe([
    mechanismCoverage >= 3 ? "Mechanisme is expliciet onderbouwd via economie, capaciteit en governance." : "",
    scenarioCount >= 3 ? "Drie scenario's zijn onderscheidend gewogen." : "",
    stopRuleCount >= 3 ? "Er zijn meetbare stopregels voor herijking." : "",
    topReference?.decisionFit ? `Top-precedent ondersteunt dit besluit (${topReference.id}).` : "",
  ]).slice(0, 3);

  return { score, label, reasons };
}

function toMarkdown(report: Omit<StrategicBrainReport, "export">): string {
  return [
    "# Volledig dossier",
    "",
    "## Bestuurlijk overzicht",
    `Organisatie: ${report.meta.organization}`,
    `Sector: ${report.meta.sector}`,
    `Analyse datum: ${report.meta.analysis_date_label}`,
    "",
    "## Strategisch rapport",
    "### Executive Decision Card",
    `Core Problem: ${report.executive_decision_card.core_problem}`,
    `Strategic Tension: ${report.executive_decision_card.strategic_tension}`,
    `Recommended Decision: ${report.executive_decision_card.recommended_decision}`,
    ...report.executive_decision_card.stop_rules.map((item) => `Stop Rule: ${item}`),
    "",
    "### Strategische signalen",
    ...report.strategisch_rapport.strategische_signalen.flatMap((item, index) => [
      `Signaal ${index + 1}: ${item.signaal}`,
      `Betekenis: ${item.betekenis}`,
      `Mogelijke ontwikkeling: ${item.mogelijke_ontwikkeling}`,
      "",
    ]),
    "### Strategisch patroon",
    report.strategisch_rapport.strategisch_patroon.patroon,
    report.strategisch_rapport.strategisch_patroon.herkenning,
    report.strategisch_rapport.strategisch_patroon.risico,
    report.strategisch_rapport.strategisch_patroon.strategische_les,
    "",
    "### Strategische ervaring",
    report.strategisch_rapport.strategische_ervaring.patroon,
    report.strategisch_rapport.strategische_ervaring.vergelijkbare_situaties,
    report.strategisch_rapport.strategische_ervaring.strategische_les,
    "",
    "### Strategische paradox",
    report.strategisch_rapport.strategische_paradox,
    "",
    "### Ongemakkelijke waarheid",
    report.strategisch_rapport.ongemakkelijke_waarheid.waarheid,
    "",
    "### Doorbraakinzichten",
    ...report.strategisch_rapport.doorbraakinzichten.map((item) => `- ${item}`),
    "",
    "### Besluit",
    report.strategisch_rapport.besluit,
    "",
    "### Board Analysis",
    report.board_analysis.situation,
    report.board_analysis.structural_tension,
    ...report.board_analysis.scenario_comparison.flatMap((item) => [
      `${item.code}. ${item.title}`,
      `Mechanism: ${item.mechanism}`,
      `Risk: ${item.risk}`,
      `Implication: ${item.strategic_implication}`,
      "",
    ]),
    ...report.board_analysis.mechanism_analysis.map((item) => `Mechanism Analysis: ${item}`),
    `Recommended Strategy: ${report.board_analysis.recommended_strategy}`,
    "",
    "### Boardroom debat",
    `CFO: ${report.strategisch_rapport.boardroom_debat.cfo}`,
    `Bestuurder: ${report.strategisch_rapport.boardroom_debat.bestuurder}`,
    `Strategisch adviseur: ${report.strategisch_rapport.boardroom_debat.strategisch_adviseur}`,
    `Kernvraag: ${report.strategisch_rapport.boardroom_debat.kernvraag_voor_het_bestuur}`,
    "",
    "### Strategische stresstest",
    ...report.scenario_simulatie.strategische_stresstest.flatMap((item, index) => [
      `Stressfactor ${index + 1}: ${item.stressfactor}`,
      `Mechanisme: ${item.mechanisme}`,
      `Breekpunt: ${item.breekpunt}`,
      `Signalen: ${item.signalen}`,
      `Herstelactie: ${item.herstelactie}`,
      "",
    ]),
    "### Strategisch narratief",
    report.strategisch_rapport.strategisch_narratief.situatie,
    report.strategisch_rapport.strategisch_narratief.spanning,
    report.strategisch_rapport.strategisch_narratief.dynamiek,
    report.strategisch_rapport.strategisch_narratief.keuze,
    report.strategisch_rapport.strategisch_narratief.bestuurlijke_opgave,
    "",
    "### Board Decision Brief",
    `Kernprobleem: ${report.strategisch_rapport.board_decision_brief.kernprobleem}`,
    `Strategische keuze: ${report.strategisch_rapport.board_decision_brief.strategische_keuze}`,
    `Waarom deze keuze: ${report.strategisch_rapport.board_decision_brief.waarom_deze_keuze}`,
    `Belangrijkste risico: ${report.strategisch_rapport.board_decision_brief.belangrijkste_risico}`,
    `Bestuurlijke actie: ${report.strategisch_rapport.board_decision_brief.bestuurlijke_actie}`,
    "",
    "### Execution Layer",
    ...report.execution_layer.strategic_actions.flatMap((item) => [
      `Action: ${item.action}`,
      `Owner: ${item.owner}`,
      `Timeline: ${item.timeline}`,
      `KPI: ${item.kpi}`,
      "",
    ]),
    ...report.execution_layer.early_signals.map((item) => `Early signal: ${item}`),
    ...report.execution_layer.stress_test.map((item) => `Stress test: ${item}`),
    "",
    "### Institutional Memory",
    report.institutional_memory.summary,
    ...report.institutional_memory.references.flatMap((item) => [
      `${item.id}: ${item.pattern} (${item.organizations})`,
      `Waarom deze referentie: sector ${item.sector}; decision fit: ${item.decision_fit ? "ja" : "nee"}${typeof item.score === "number" ? `; score: ${item.score}` : ""}`,
    ]),
  ].join("\n");
}

function buildReportFromOutput(
  input: StrategicBrainInput,
  output: StrategicBrainOutput
): StrategicBrainReport {
  const analysisDate = new Date().toISOString().slice(0, 10);
  const organization = input.organizationName || "Onbekende organisatie";
  const sector = input.sector || "Onbekende sector";
  const report_id = createReportId(analysisDate, organization);
  const analysis_date_label = formatDateLabel(analysisDate);

  const paradox =
    output.reasoning.paradoxQuality.paradoxQualityCheck.score < 4
      ? output.reasoning.paradoxQuality.paradoxQualityCheck.improvedParadox
      : output.reasoning.paradox.strategicParadox.paradox;

  const whyChoice = dedupe(output.decision.decisionEngine.whyItDominates).slice(0, 3);
  const decisionConfidence = buildDecisionConfidence(output);

  const stopregels = dedupe([
    ...output.decision.governance.stopRules,
    ...output.boardroom.pressureTest.pressureTest.map((item) => item.signals),
  ]).slice(0, 4);

  const baseReport = {
    meta: {
      report_id,
      organization,
      sector,
      analysis_date: analysisDate,
      analysis_date_label,
      generated_at: new Date().toISOString(),
    },
    bestuurlijk_overzicht: {
      title: "Bestuurlijke besliskaart" as const,
      kernprobleem: output.reasoning.tension.coreProblem,
      kernstelling: output.reasoning.tension.structuralTension,
      aanbevolen_keuze: output.decision.decisionEngine.recommendedDecision,
      waarom_deze_keuze: whyChoice,
      grootste_risico_bij_uitstel: output.reasoning.uncomfortableTruth.uncomfortableTruth,
      stopregels,
      decision_confidence: decisionConfidence,
    },
    executive_decision_card: {
      core_problem: output.reasoning.tension.coreProblem,
      strategic_tension: output.reasoning.tension.structuralTension,
      recommended_decision: output.decision.decisionEngine.recommendedDecision,
      stop_rules: output.decision.governance.stopRules,
      decision_confidence: decisionConfidence,
    },
    strategisch_rapport: {
      strategische_signalen: output.perception.strategicSignals.strategicSignals.map((item) => ({
        categorie: item.category,
        signaal: item.signal,
        betekenis: item.meaning,
        mogelijke_ontwikkeling: item.possibleDevelopment,
      })),
      strategisch_patroon: {
        patroon: output.reasoning.strategicPattern.strategicPattern.pattern,
        herkenning: output.reasoning.strategicPattern.strategicPattern.recognition,
        risico: output.reasoning.strategicPattern.strategicPattern.risk,
        strategische_les: output.reasoning.strategicPattern.strategicPattern.strategicLesson,
      },
      strategische_ervaring: {
        patroon: output.reasoning.institutionalMemory.summary,
        vergelijkbare_situaties: output.reasoning.strategicMemory.strategicMemory.repeatedStrategies,
        strategische_les: output.reasoning.strategicMemory.strategicMemory.strategicWarning,
      },
      strategische_paradox: paradox,
      paradox_kwaliteitscontrole: {
        score: output.reasoning.paradoxQuality.paradoxQualityCheck.score,
        beoordeling: output.reasoning.paradoxQuality.paradoxQualityCheck.assessment,
        verbeterde_paradox: output.reasoning.paradoxQuality.paradoxQualityCheck.improvedParadox,
      },
      ongemakkelijke_waarheid: {
        waarheid: output.reasoning.uncomfortableTruth.uncomfortableTruth,
        uitleg: output.reasoning.uncomfortableTruth.explanation,
        bestuurlijke_implicatie: output.reasoning.uncomfortableTruth.boardImplication,
      },
      doorbraakinzichten: dedupe([
        output.reasoning.tension.coreProblem,
        output.reasoning.tension.mechanism,
        ...output.decision.decisionEngine.whyItDominates,
        ...(output.reasoning.killerInsights.insights ?? []),
      ]).slice(0, 5),
      keuzerichtingen: output.decision.scenarios.scenarios.map((item) => `${item.code}. ${item.title}`),
      besluit: output.decision.decisionEngine.recommendedDecision,
      boardroom_debat: {
        cfo: output.boardroom.debate.boardroomRoleDebate.cfo,
        bestuurder: output.boardroom.debate.boardroomRoleDebate.bestuurder,
        strategisch_adviseur: output.boardroom.debate.boardroomRoleDebate.strategicAdvisor,
        kernvraag_voor_het_bestuur: output.boardroom.debate.boardroomRoleDebate.boardQuestion,
      },
      strategisch_narratief: {
        situatie: output.narrative.strategicNarrative.situation,
        spanning: output.reasoning.tension.structuralTension,
        dynamiek: output.narrative.strategicNarrative.dynamic,
        keuze: output.narrative.strategicNarrative.choice,
        bestuurlijke_opgave: output.narrative.strategicNarrative.boardTask,
      },
      board_decision_brief: {
        kernprobleem: output.boardOutput.decisionBrief.boardDecisionBrief.kernprobleem,
        strategische_keuze: output.boardOutput.decisionBrief.boardDecisionBrief.strategischeKeuze,
        waarom_deze_keuze: output.boardOutput.decisionBrief.boardDecisionBrief.waaromDezeKeuze,
        belangrijkste_risico: output.boardOutput.decisionBrief.boardDecisionBrief.belangrijksteRisico,
        bestuurlijke_actie: output.boardOutput.decisionBrief.boardDecisionBrief.bestuurlijkeActie,
      },
    },
    board_analysis: {
      situation: output.narrative.strategicNarrative.situation,
      structural_tension: output.reasoning.tension.structuralTension,
      scenario_comparison: output.decision.scenarios.scenarios.map((item) => ({
        code: item.code,
        title: item.title,
        mechanism: item.mechanism,
        risk: item.risk,
        strategic_implication: item.strategicImplication,
      })),
      mechanism_analysis: [
        output.reasoning.tension.mechanism,
        output.reasoning.tension.structuralConstraints.economics,
        output.reasoning.tension.structuralConstraints.capacity,
        output.reasoning.tension.structuralConstraints.governance,
      ],
      recommended_strategy: output.decision.decisionEngine.recommendedDecision,
    },
    execution_layer: {
      strategic_actions: output.decision.governance.executionActions.map((item) => ({
        action: item.action,
        owner: item.owner,
        timeline: item.timeline,
        kpi: item.kpi,
      })),
      kpis: output.decision.governance.executionActions.map((item) => item.kpi),
      early_signals: output.decision.governance.earlySignals,
      stress_test: output.boardroom.pressureTest.pressureTest.map((item) => `${item.stressFactor}: ${item.breakpoint}`),
    },
    institutional_memory: {
      summary: output.reasoning.institutionalMemory.summary,
      references: output.reasoning.institutionalMemory.references.map((item) => ({
        id: item.id,
        sector: item.sector,
        pattern: item.pattern,
        organizations: item.organizations,
        score: item.score,
        decision_fit: item.decisionFit,
      })),
      memory_file: output.reasoning.institutionalMemory.memoryFile,
    },
    scenario_simulatie: {
      strategische_stresstest: output.boardroom.pressureTest.pressureTest.map((item) => ({
        stressfactor: item.stressFactor,
        mechanisme: item.mechanism,
        breekpunt: item.breakpoint,
        signalen: item.signals,
        herstelactie: item.recoveryAction,
      })),
    },
    technische_analyse: {
      perception: [
        output.perception.context.summary,
        ...output.perception.strategicSignals.strategicSignals.map((item) => `${item.signal} — ${item.meaning}`),
        ...output.perception.organizationMechanics.map((item) => item.summary),
        ...output.perception.systemAnalysis.map((item) => item.summary),
      ],
      reasoning: [
        output.reasoning.strategicPattern.strategicPattern.pattern,
        output.reasoning.tension.structuralTension,
        output.reasoning.tension.mechanism,
        output.reasoning.strategicMemory.strategicMemory.similarPatterns,
        output.reasoning.institutionalMemory.summary,
        output.reasoning.paradox.strategicParadox.paradox,
        output.reasoning.uncomfortableTruth.uncomfortableTruth,
        ...(output.reasoning.killerInsights.insights ?? []).slice(0, 3),
      ],
      decision: [
        output.decision.options.summary,
        ...output.decision.scenarios.scenarios.map((item) => `${item.code}. ${item.title}`),
        output.decision.decisionEngine.recommendedDecision,
        output.decision.boardDecision.summary,
      ],
      boardroom: [
        output.boardroom.debate.boardroomRoleDebate.boardQuestion,
        ...output.boardroom.pressureTest.pressureTest.map((item) => item.breakpoint),
        output.boardOutput.decisionBrief.boardDecisionBrief.bestuurlijkeActie,
        ...output.decision.governance.earlySignals,
      ],
      trace: [...output.state.trace],
    },
  };

  return {
    ...baseReport,
    export: {
      markdown: toMarkdown(baseReport),
      json: baseReport as unknown as Record<string, unknown>,
    },
  };
}

export function buildStrategicBrainReport(input: StrategicBrainInput): StrategicBrainReport {
  const output = runStrategicBrainArchitecture(input);
  return buildReportFromOutput(input, output);
}

export function buildStrategicBrainReportFromOutput(
  input: StrategicBrainInput,
  output: StrategicBrainOutput
): StrategicBrainReport {
  return buildReportFromOutput(input, output);
}
