import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";

export type StrategicConsistencyFinding = {
  code:
    | "input_dominance_gap"
    | "choice_alignment_gap"
    | "scenario_alignment_gap"
    | "why_not_alignment_gap";
  message: string;
};

export type StrategicConsistencyResult = {
  findings: StrategicConsistencyFinding[];
  pass: boolean;
};

function normalize(text: string): string {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSection(text: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped}\\s*\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]+\\n|$)`, "i");
  return String(text.match(pattern)?.[1] ?? "").trim();
}

function countSignals(text: string, patterns: RegExp[]): number {
  return patterns.reduce((count, pattern) => (pattern.test(text) ? count + 1 : count), 0);
}

function hasSemanticOverlap(haystack: string, candidate: string): boolean {
  const hay = normalize(haystack);
  const tokens = normalize(candidate)
    .split(/\s+/)
    .filter((token) => token.length > 5);
  if (!tokens.length) return false;
  return tokens.some((token) => hay.includes(token));
}

export function validateStrategicConsistency(params: {
  reportText: string;
  sourceText?: string;
  analysisMap?: StrategicAnalysisMap;
}): StrategicConsistencyResult {
  const report = String(params.reportText ?? "");
  const source = String(params.sourceText ?? "");
  const analysisMap = params.analysisMap;
  const findings: StrategicConsistencyFinding[] = [];

  const thesis = extractSection(report, "KERNSTELLING");
  const problem = extractSection(report, "KERNPROBLEEM");
  const choice = extractSection(report, "AANBEVOLEN KEUZE");
  const whyNotB = extractSection(report, "Waarom niet optie B?");
  const whyNotC = extractSection(report, "Waarom niet optie C?");

  const externalMechanismSignals = countSignals(source, [
    /\bconsortium\b/i,
    /\bgemeent/i,
    /\btriage\b/i,
    /\bcontract/i,
    /\bbudget/i,
  ]);

  if (
    externalMechanismSignals >= 3 &&
    /\bbestuurlijke inertie\b/i.test(report) &&
    !/\b(consortium|gemeent|triage|contract|budget)\b/i.test(report)
  ) {
    findings.push({
      code: "input_dominance_gap",
      message:
        "Broninput wijst op extern gestuurde instroom/capaciteitslogica, maar rapport abstraheert dit naar bestuurlijke inertie.",
    });
  }

  if (choice) {
    const normalizedChoice = normalize(choice);
    const aligned = [problem, thesis].filter(Boolean).some((section) =>
      normalize(section).split(" ").some((token) => token.length > 6 && normalizedChoice.includes(token))
    );
    if (!aligned) {
      findings.push({
        code: "choice_alignment_gap",
        message: "Kernprobleem, kernstelling en aanbevolen keuze sluiten semantisch niet strak op elkaar aan.",
      });
    }
  }

  if ((whyNotB && normalize(whyNotB) === normalize(choice)) || (whyNotC && normalize(whyNotC) === normalize(choice))) {
    findings.push({
      code: "why_not_alignment_gap",
      message: "Waarom-niet-sectie herhaalt de aanbevolen keuze in plaats van een contrasterende afwijzing.",
    });
  }

  const hasSpecificSourceStrategy =
    /\b(ambulant|specialist|specialisatie|niche|consortium)\b/i.test(source);
  const hasGenericScenarioLabels =
    /\b(volumegroei|status quo|hybride)\b/i.test(report) &&
    !/\b(ambulant|specialist|consortium)\b/i.test(report);
  if (hasSpecificSourceStrategy && hasGenericScenarioLabels) {
    findings.push({
      code: "scenario_alignment_gap",
      message: "Scenario's gebruiken generieke labels terwijl de bron specifieke strategische richtingen bevat.",
    });
  }

  if (
    analysisMap &&
    analysisMap.recommendedOption &&
    ![analysisMap.strategicTension.optionA, analysisMap.strategicTension.optionB]
      .join(" ")
      .toLowerCase()
      .includes(analysisMap.recommendedOption.toLowerCase())
  ) {
    findings.push({
      code: "choice_alignment_gap",
      message: "Aanbevolen keuze is niet logisch verankerd in de strategische spanning van de analysekaart.",
    });
  }

  if (
    analysisMap &&
    analysisMap.scenarios.some((scenario) => {
      const ref = `${scenario.name} ${scenario.mechanism} ${scenario.governanceImplication}`.toLowerCase();
      const decisionOptions = analysisMap.decisionOptions.map((item) => item.toLowerCase());
      const alignedToTension =
        ref.includes(analysisMap.strategicTension.optionA.toLowerCase()) ||
        ref.includes(analysisMap.strategicTension.optionB.toLowerCase()) ||
        hasSemanticOverlap(ref, analysisMap.strategicTension.optionA) ||
        hasSemanticOverlap(ref, analysisMap.strategicTension.optionB);
      const alignedToOptions = decisionOptions.some((option) => ref.includes(option) || hasSemanticOverlap(ref, option));
      return !alignedToTension && !alignedToOptions;
    })
  ) {
    findings.push({
      code: "scenario_alignment_gap",
      message: "Scenario's verwijzen niet zichtbaar naar de centrale strategische spanning.",
    });
  }

  if (
    analysisMap &&
    analysisMap.interventions.some((intervention) => {
      const ref = `${intervention.action} ${intervention.reason}`.toLowerCase();
      const recommendedTokens = analysisMap.recommendedOption
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 5);
      const tensionTokens = `${analysisMap.strategicTension.optionA} ${analysisMap.strategicTension.optionB}`
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 5);
      const dominantRiskTokens = analysisMap.dominantRisk
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 5);
      const aligned = [...recommendedTokens, ...tensionTokens, ...dominantRiskTokens, "kern", "capaciteit"].some((token) => ref.includes(token));
      return !aligned;
    })
  ) {
    findings.push({
      code: "why_not_alignment_gap",
      message: "Interventies sluiten niet zichtbaar aan op de aanbevolen keuze uit de analysekaart.",
    });
  }

  return {
    findings,
    pass: findings.length === 0,
  };
}
