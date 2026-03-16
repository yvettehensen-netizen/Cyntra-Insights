export type StrategicCritiqueInput = {
  boardroomReport: string;
  sourceContext?: string;
};

export type CritiqueDimensionResult = {
  status: "PASS" | "WARN";
  finding: string;
  evidence: string;
};

export type StrategicCritique = {
  critiqueText: string;
  hasCriticalIssues: boolean;
  missingSignals: string[];
  dominantThesisConsistency: CritiqueDimensionResult;
  mechanismValidation: CritiqueDimensionResult;
  strategyInterventionConsistency: CritiqueDimensionResult;
  decisionPressureEvaluation: CritiqueDimensionResult;
  narrativeClarity: CritiqueDimensionResult;
};

type Section = {
  heading: string;
  number: number;
  body: string;
};

function extractSections(markdown: string): Section[] {
  const source = String(markdown ?? "").trim();
  const headingRegex = /^###\s*(\d+)\.\s*([^\n]+)$/gm;
  const matches = [...source.matchAll(headingRegex)];
  if (!matches.length) return [];

  return matches.map((match, idx) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[idx + 1]?.index ?? source.length;
    return {
      heading: `### ${match[1]}. ${match[2]}`.trim(),
      number: Number(match[1] ?? 0),
      body: source.slice(start, end).trim(),
    };
  });
}

function extractSectionBody(markdown: string, sectionNumber: number): string {
  return extractSections(markdown).find((section) => section.number === sectionNumber)?.body ?? "";
}

function countSentences(text: string): number {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function evaluateDominantThesis(report: string): CritiqueDimensionResult {
  const section = extractSectionBody(report, 1);
  if (!section) {
    return {
      status: "WARN",
      finding: "Dominante these ontbreekt of is leeg.",
      evidence: "Sectie 1 niet gevonden.",
    };
  }

  const hasFactSignal = /€\s?\d|\d+\s*%|\b\d+\s*(?:dagen|maanden|fte|cliënten?)\b/i.test(section);
  const hasMechanismSignal = /\bMechanisme:|\bStructurele oorzaak:|\bSysteemeffect:/i.test(section);
  const hasImplicationSignal = /\bBestuurlijke implicatie:|\bbesluit\b/i.test(section);
  const score = Number(hasFactSignal) + Number(hasMechanismSignal) + Number(hasImplicationSignal);

  if (score >= 2) {
    return {
      status: "PASS",
      finding: "Dominante these is grotendeels consistent met feiten, mechanismen en implicatie.",
      evidence: `Signalen aanwezig: feiten=${hasFactSignal}, mechanisme=${hasMechanismSignal}, implicatie=${hasImplicationSignal}.`,
    };
  }

  return {
    status: "WARN",
    finding: "Dominante these volgt onvoldoende logisch uit feiten, mechanismen en implicatie.",
    evidence: `Signalen aanwezig: feiten=${hasFactSignal}, mechanisme=${hasMechanismSignal}, implicatie=${hasImplicationSignal}.`,
  };
}

function evaluateMechanismValidation(report: string): CritiqueDimensionResult {
  const sections = extractSections(report).filter((section) => section.number >= 1 && section.number <= 9);
  if (!sections.length) {
    return {
      status: "WARN",
      finding: "Geen valide secties gevonden voor mechanismevalidatie.",
      evidence: "Sectieherkenning mislukt.",
    };
  }

  const invalidSections = sections
    .filter((section) => {
      const hasSymptom = /\bMechanisme:/i.test(section.body);
      const hasCause = /\bStructurele oorzaak:/i.test(section.body);
      const hasEffect = /\bSysteemeffect:/i.test(section.body);
      return !(hasSymptom && hasCause && hasEffect);
    })
    .map((section) => section.number);

  if (!invalidSections.length) {
    return {
      status: "PASS",
      finding: "Mechanismeketens zijn aanwezig in de kernsecties.",
      evidence: "SYMPTOM -> MECHANISM -> STRUCTURAL CAUSE -> SYSTEM EFFECT is afgedekt.",
    };
  }

  return {
    status: "WARN",
    finding: "Causale keten is niet volledig in alle kernsecties.",
    evidence: `Onvolledige mechanismeketen in sectie(s): ${invalidSections.join(", ")}.`,
  };
}

function evaluateStrategyInterventionConsistency(report: string): CritiqueDimensionResult {
  const conflict = extractSectionBody(report, 2);
  const intervention = extractSectionBody(report, 10);
  if (!conflict || !intervention) {
    return {
      status: "WARN",
      finding: "Strategie-interventie consistentie kan niet volledig worden getoetst.",
      evidence: "Sectie 2 of sectie 10 ontbreekt.",
    };
  }

  const hasContractConstraint = /\b(contract|plafond|tarief|verzekeraar)\b/i.test(conflict);
  const hasCapacityConstraint = /\b(capaciteit|planning|productiviteit|uitval)\b/i.test(conflict);
  const interventionHasContractAction = /\b(contract|verzekeraar|tarief|ondergrens|vloer)\b/i.test(intervention);
  const interventionHasCapacityAction = /\b(capaciteit|planning|productiviteit|rooster|casemix)\b/i.test(intervention);

  const contractMismatch = hasContractConstraint && !interventionHasContractAction;
  const capacityMismatch = hasCapacityConstraint && !interventionHasCapacityAction;

  if (!contractMismatch && !capacityMismatch) {
    return {
      status: "PASS",
      finding: "Interventies sluiten aan op dominante structurele beperkingen.",
      evidence: `Contractmatch=${interventionHasContractAction}, capaciteitsmatch=${interventionHasCapacityAction}.`,
    };
  }

  return {
    status: "WARN",
    finding: "Minstens een interventie lost het dominante mechanisme niet aantoonbaar op.",
    evidence: `Contract mismatch=${contractMismatch}, capaciteits mismatch=${capacityMismatch}.`,
  };
}

function evaluateDecisionPressure(report: string): CritiqueDimensionResult {
  const decisionSection = extractSectionBody(report, 12);
  const scope = decisionSection || report;
  const hasHardChoice =
    /\bZonder\b[\s\S]{0,120}\bbinnen\s+\d+\s*(?:dagen|maanden)\b/i.test(scope) ||
    /\bgeen nieuw initiatief zonder\b/i.test(scope) ||
    /\bDe Raad van Bestuur committeert zich aan\b/i.test(scope);

  if (hasHardChoice) {
    return {
      status: "PASS",
      finding: "Beslisdruk is expliciet en tijdgebonden.",
      evidence: "Rapport bevat harde keuzeformule met consequentie.",
    };
  }

  return {
    status: "WARN",
    finding: "Beslisdruk is te impliciet; harde keuze ontbreekt.",
    evidence: "Geen tijdgebonden 'zonder X dan Y'-formule gevonden.",
  };
}

function evaluateNarrativeClarity(report: string): CritiqueDimensionResult {
  const sections = extractSections(report);
  if (!sections.length) {
    return {
      status: "WARN",
      finding: "Narratieve helderheid kan niet worden getoetst.",
      evidence: "Geen secties gevonden.",
    };
  }

  const violations: string[] = [];
  for (const section of sections) {
    const paragraphs = section.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length > 3) {
      violations.push(`sectie ${section.number}: meer dan 3 alinea's`);
    }
    const longParagraph = paragraphs.find((paragraph) => countSentences(paragraph) > 4);
    if (longParagraph) {
      violations.push(`sectie ${section.number}: alinea > 4 zinnen`);
    }
  }

  if (!violations.length) {
    return {
      status: "PASS",
      finding: "Narratieve discipline voldoet aan sectie- en alinearegels.",
      evidence: "Geen fragmentatie- of lengte-overtredingen gevonden.",
    };
  }

  return {
    status: "WARN",
    finding: "Narratieve discipline vertoont fragmentatie of te lange alinea's.",
    evidence: violations.join(" | "),
  };
}

function buildCritiqueText(critique: Omit<StrategicCritique, "critiqueText">): string {
  return [
    "CRITIQUE",
    `Dominante these consistentie: ${critique.dominantThesisConsistency.status}. ${critique.dominantThesisConsistency.finding} Evidentie: ${critique.dominantThesisConsistency.evidence}`,
    `Mechanisme-validatie: ${critique.mechanismValidation.status}. ${critique.mechanismValidation.finding} Evidentie: ${critique.mechanismValidation.evidence}`,
    `Strategie-interventie consistentie: ${critique.strategyInterventionConsistency.status}. ${critique.strategyInterventionConsistency.finding} Evidentie: ${critique.strategyInterventionConsistency.evidence}`,
    `Beslisdruk evaluatie: ${critique.decisionPressureEvaluation.status}. ${critique.decisionPressureEvaluation.finding} Evidentie: ${critique.decisionPressureEvaluation.evidence}`,
    `Narrative helderheid: ${critique.narrativeClarity.status}. ${critique.narrativeClarity.finding} Evidentie: ${critique.narrativeClarity.evidence}`,
  ].join("\n\n");
}

export function runStrategicCritiqueAgent(input: StrategicCritiqueInput): StrategicCritique {
  const report = String(input.boardroomReport ?? "").trim();
  const dominantThesisConsistency = evaluateDominantThesis(report);
  const mechanismValidation = evaluateMechanismValidation(report);
  const strategyInterventionConsistency = evaluateStrategyInterventionConsistency(report);
  const decisionPressureEvaluation = evaluateDecisionPressure(report);
  const narrativeClarity = evaluateNarrativeClarity(report);

  const missingSignals: string[] = [];
  if (dominantThesisConsistency.status === "WARN") missingSignals.push("dominante_these");
  if (mechanismValidation.status === "WARN") missingSignals.push("mechanismeketen");
  if (strategyInterventionConsistency.status === "WARN") missingSignals.push("strategie_interventie_fit");
  if (decisionPressureEvaluation.status === "WARN") missingSignals.push("beslisdruk");
  if (narrativeClarity.status === "WARN") missingSignals.push("narratieve_discipline");

  const base = {
    hasCriticalIssues: missingSignals.length >= 2,
    missingSignals,
    dominantThesisConsistency,
    mechanismValidation,
    strategyInterventionConsistency,
    decisionPressureEvaluation,
    narrativeClarity,
  };

  return {
    ...base,
    critiqueText: buildCritiqueText(base),
  };
}

