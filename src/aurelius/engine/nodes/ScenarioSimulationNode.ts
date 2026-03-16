export type ScenarioSimulationNodeInput = {
  companyName?: string;
  caseContextBlock: string;
  contextEngineReconstruction: string;
  diagnosisEngineOutput: string;
  strategicInsightsOutput: string;
  hypothesisOutput: string;
};

export function buildScenarioSimulationNodePrompt(
  params: ScenarioSimulationNodeInput
): string {
  return `
ORGANISATIE: ${params.companyName ?? "Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${params.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${params.contextEngineReconstruction || "Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${params.diagnosisEngineOutput || "Niet beschikbaar; leid diagnose af uit primaire broncontext."}

STRATEGISCHE INZICHTEN:
${params.strategicInsightsOutput || "Niet beschikbaar; leid inzichten af uit primaire broncontext."}

STRATEGISCHE HYPOTHESEN:
${params.hypothesisOutput || "Niet beschikbaar; leid hypothesen af uit primaire broncontext."}

INSTRUCTIE:
Leid minimaal drie strategische scenario's direct af uit de broninput, de strategische opties en de organisatiepositionering.
Gebruik broninput als hoogste autoriteit: input > sectorlogica > generieke template.
Geef per scenario eerst een specifieke scenarionaam die past bij deze organisatiecontext.
Verboden scenarionamen tenzij letterlijk onderbouwd in de input:
- status quo
- hybride
- volumegroei
- groei zonder context
- netwerkreplicatie zonder bronanker

Gebruik exact:
SCENARIO A — [specifieke brongebonden naam]
SCENARIO B — [specifieke brongebonden naam]
SCENARIO C — [specifieke brongebonden naam]

Gebruik voor ELK scenario exact:
SCENARIO
STRATEGISCHE LOGICA
FINANCIËLE CONSEQUENTIES
ORGANISATORISCHE CONSEQUENTIES
RISICO'S
LANGE TERMIJN EFFECT

Wanneer cijfers aanwezig zijn:
- bereken implicaties (maximale schaal, marge-impact, capaciteitsbehoefte)
- gebruik expliciet rekenlogica per scenario

Voeg daarna exact toe:
### SCENARIOVERGELIJKING
Per scenario: voordelen, nadelen, risiconiveau, strategische robuustheid.

Voeg daarna exact toe:
VOORKEURSSCENARIO
WAAROM DIT HET MEEST ROBUUST IS
WELKE VOORWAARDEN NODIG ZIJN
`.trim();
}

export function hasMinimumScenarioSet(text: string): boolean {
  const source = String(text ?? "");
  const hasA = /SCENARIO\s*A\b/i.test(source);
  const hasB = /SCENARIO\s*B\b/i.test(source);
  const hasC = /SCENARIO\s*C\b/i.test(source);

  const scenarioBlocks = source.match(/SCENARIO\s*[ABC][\s\S]*?(?=SCENARIO\s*[ABC]|###\s*SCENARIOVERGELIJKING|$)/gi) ?? [];
  const completeBlocks = scenarioBlocks.filter((block) =>
    /STRATEGISCHE\s+LOGICA/i.test(block) &&
    /FINANCI[ËE]LE\s+CONSEQUENTIES/i.test(block) &&
    /ORGANISATORISCHE\s+CONSEQUENTIES/i.test(block) &&
    /RISICO'?S/i.test(block) &&
    /LANGE\s+TERMIJN\s+EFFECT/i.test(block)
  ).length;

  const hasComparison = /###\s*SCENARIOVERGELIJKING/i.test(source);
  const hasPreference =
    /VOORKEURSSCENARIO/i.test(source) &&
    /WAAROM\s+DIT\s+HET\s+MEEST\s+ROBUUST\s+IS/i.test(source) &&
    /WELKE\s+VOORWAARDEN\s+NODIG\s+ZIJN/i.test(source);

  return hasA && hasB && hasC && completeBlocks >= 3 && hasComparison && hasPreference;
}
