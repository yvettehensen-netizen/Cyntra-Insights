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
};

export type StrategicBrainReport = {
  meta: StrategicBrainReportMeta;
  bestuurlijk_overzicht: StrategicBrainBoardCard;
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

  const whyChoice = dedupe([
    output.perception.context.summary,
    ...output.perception.organizationMechanics.map((item) => item.summary),
    ...output.perception.systemAnalysis.map((item) => item.summary),
  ]).slice(0, 3);

  const stopregels = output.boardroom.pressureTest.pressureTest.map((item) => item.signals);

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
      kernprobleem: paradox,
      kernstelling: output.narrative.strategicNarrative.tension,
      aanbevolen_keuze: output.decision.boardDecision.summary,
      waarom_deze_keuze: whyChoice,
      grootste_risico_bij_uitstel: output.reasoning.uncomfortableTruth.uncomfortableTruth,
      stopregels,
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
        patroon: output.reasoning.strategicMemory.strategicMemory.similarPatterns,
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
      doorbraakinzichten: dedupe(output.reasoning.killerInsights.insights ?? []).slice(0, 5),
      keuzerichtingen:
        Array.isArray(output.decision.options.data.options)
          ? output.decision.options.data.options.map((item) => String(item))
          : [output.decision.options.summary],
      besluit: output.decision.boardDecision.summary,
      boardroom_debat: {
        cfo: output.boardroom.debate.boardroomRoleDebate.cfo,
        bestuurder: output.boardroom.debate.boardroomRoleDebate.bestuurder,
        strategisch_adviseur: output.boardroom.debate.boardroomRoleDebate.strategicAdvisor,
        kernvraag_voor_het_bestuur: output.boardroom.debate.boardroomRoleDebate.boardQuestion,
      },
      strategisch_narratief: {
        situatie: output.narrative.strategicNarrative.situation,
        spanning: output.narrative.strategicNarrative.tension,
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
        output.reasoning.strategicMemory.strategicMemory.similarPatterns,
        output.reasoning.paradox.strategicParadox.paradox,
        output.reasoning.uncomfortableTruth.uncomfortableTruth,
        ...(output.reasoning.killerInsights.insights ?? []).slice(0, 3),
      ],
      decision: [output.decision.options.summary, output.decision.boardDecision.summary],
      boardroom: [
        output.boardroom.debate.boardroomRoleDebate.boardQuestion,
        ...output.boardroom.pressureTest.pressureTest.map((item) => item.breakpoint),
        output.boardOutput.decisionBrief.boardDecisionBrief.bestuurlijkeActie,
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
