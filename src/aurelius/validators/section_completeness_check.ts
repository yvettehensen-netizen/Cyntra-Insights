import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";

export function sectionCompletenessCheck(text: string, analysisMap?: StrategicAnalysisMap): {
  pass: boolean;
  issues: string[];
} {
  const source = String(text ?? "");
  const issues: string[] = [];
  if (!analysisMap) {
    return { pass: true, issues: [] };
  }
  const requiredSections = [
    "Besluitvraag",
    "Strategische kernvragen",
    "Strategisch patroon",
    "Systeemmechanisme",
    "Feitenbasis",
    "Keuzerichtingen",
    "Doorbraakinzichten",
    "Mogelijke ontwikkelingen",
    "Bestuurlijke waarschuwingssignalen",
    "Besluitgevolgen",
  ];

  for (const title of requiredSections) {
    const pattern = new RegExp(`${title}\\s*\\n([\\s\\S]*?)(?=\\n(?:\\d+\\.\\s+|###\\s+|[A-Z][A-Z\\s]+\\n)|$)`, "i");
    const body = String(source.match(pattern)?.[1] ?? "").trim();
    if (!body) {
      issues.push(`Sectie ontbreekt of is leeg: ${title}`);
      continue;
    }
    if (/\b(niet beschikbaar|samenvatting ontbreekt|bestuurlijke keuze ontbreekt)\b/i.test(body)) {
      issues.push(`Sectie bevat placeholdertekst: ${title}`);
    }
  }

  if (analysisMap) {
    if (!analysisMap.scenarios.length) issues.push("Scenario's ontbreken in analysekaart.");
    if (!analysisMap.interventions.length) issues.push("Interventies ontbreken in analysekaart.");
    if (!analysisMap.systemMechanism?.mechanism) issues.push("Systeemmechanisme ontbreekt in analysekaart.");
    if (!analysisMap.strategicQuestions?.boardDecision) issues.push("Strategische kernvragen ontbreken in analysekaart.");
    if (!analysisMap.strategicPattern?.primaryPattern || !analysisMap.strategicPattern?.secondaryPattern) {
      issues.push("Strategisch patroon ontbreekt in analysekaart.");
    }
    if ((analysisMap.boardroomRedFlags ?? []).length < 3) {
      issues.push("Bestuurlijke waarschuwingssignalen ontbreken of zijn te beperkt in analysekaart.");
    }
  }

  return {
    pass: issues.length === 0,
    issues,
  };
}
