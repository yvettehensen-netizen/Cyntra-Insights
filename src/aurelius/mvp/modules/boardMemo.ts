import type {
  BoardMemoOutput,
  InterventionEngineOutput,
  KillerInsightOutput,
  SignalExtractionOutput,
  StrategicConflictOutput,
} from "../types";

export function boardMemo(params: {
  organizationName?: string;
  signals: SignalExtractionOutput;
  conflict: StrategicConflictOutput;
  insight: KillerInsightOutput;
  intervention: InterventionEngineOutput;
}): BoardMemoOutput {
  const org = String(params.organizationName || "de organisatie").trim();
  const interventions = params.intervention.interventions;

  const besluitopties = [
    {
      code: "A" as const,
      label: "Conservatief beschermen",
      mechanism: "Kwaliteit en cultuur blijven primair intern geborgd.",
      upside: "Lage implementatierisico's en hoge interne stabiliteit.",
      downside: "Impactschaal blijft beperkt.",
    },
    {
      code: "B" as const,
      label: "Expansief groeien",
      mechanism: "Lineaire groei via capaciteit en volume.",
      upside: "Snellere zichtbare schaal op korte termijn.",
      downside: "Hoger risico op cultuur- en kwaliteitsverwatering.",
    },
    {
      code: "C" as const,
      label: "Hybride repliceren",
      mechanism: "Schaal via netwerkreplicatie met governance-guardrails.",
      upside: "Impactgroei zonder proportionele personeelsgroei.",
      downside: "Hoge eisen aan partnerselectie en kwaliteitscontrole.",
    },
  ];

  const openQuestions = [
    "Welke strategische prijs accepteren we expliciet om het gekozen model te laten werken?",
    "Welke grenswaarde triggert een direct herbesluit op bestuursniveau?",
    "Welke elementen van het model zijn overdraagbaar zonder cultuurverlies?",
  ];

  const executiveSummary = `${org} staat voor een expliciete keuze tussen schaaltempo en kernmechanisme; advies is hybride replicatie met harde guardrails.`;
  const bestuurlijkeHypothese = `${org} creëert waarde via eigenaarschap en kwaliteit, waardoor schaal vooral via modeladoptie in netwerk moet verlopen.`;

  const memoText = [
    "BESLISNOTA RvT / MT",
    "",
    "Executive summary",
    executiveSummary,
    "",
    "Bestuurlijke hypothese",
    bestuurlijkeHypothese,
    "",
    "Kernconflict",
    `${params.conflict.sideA} vs ${params.conflict.sideB}`,
    "",
    "Killer insight",
    params.insight.insight,
    `Mechanisme: ${params.insight.mechanism}`,
    `Implicatie: ${params.insight.implication}`,
    "",
    "Besluitopties",
    ...besluitopties.map((item) => `${item.code}. ${item.label} — ${item.mechanism}`),
    "",
    "Interventies",
    ...interventions.map((item, idx) => `${idx + 1}. ${item.title} | Actie: ${item.action} | Doel: ${item.goal}`),
    "",
    "Open vragen",
    ...openQuestions.map((item) => `- ${item}`),
  ].join("\n");

  return {
    executiveSummary,
    bestuurlijkeHypothese,
    kernconflict: params.conflict.conflict,
    killerInsight: params.insight.insight,
    besluitopties,
    interventions,
    openQuestions,
    memoText,
  };
}

