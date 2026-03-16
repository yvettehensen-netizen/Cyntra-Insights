export type DecisionQualityNodeInput = {
  companyName?: string;
  caseContextBlock: string;
  diagnosisEngineOutput: string;
  strategicInsightsOutput: string;
  scenarioSimulationOutput: string;
  interventionOutput: string;
  boardroomIntelligenceOutput: string;
};

export type DecisionQualityAssessment = {
  decisionQualityScore: number;
  strategicConsistencyScore: number;
  riskAnalysisScore: number;
  feasibilityScore: number;
  scenarioRobustnessScore: number;
  inconsistentInterventions: boolean;
  scenarioMissing: boolean;
};

export function buildDecisionQualityNodePrompt(params: DecisionQualityNodeInput): string {
  return `
ORGANISATIE: ${params.companyName ?? "Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${params.caseContextBlock}

STRUCTURELE DIAGNOSE:
${params.diagnosisEngineOutput || "Niet beschikbaar; werk met primaire broncontext."}

STRATEGISCHE INZICHTEN:
${params.strategicInsightsOutput || "Niet beschikbaar; werk met primaire broncontext."}

SCENARIO-ANALYSE:
${params.scenarioSimulationOutput || "Niet beschikbaar; werk met primaire broncontext."}

INTERVENTIEPROGRAMMA:
${params.interventionOutput || "Niet beschikbaar; werk met primaire broncontext."}

BOARDROOM-INTELLIGENTIE:
${params.boardroomIntelligenceOutput || "Niet beschikbaar; werk met primaire broncontext."}

INSTRUCTIE:
Beoordeel de kwaliteit van het bestuursbesluit als kritische boardroom-tegenkracht.
Controleer:
1) Strategische consistentie tussen these, inzichten, scenarioanalyse en interventies.
2) Besluitrisico's (complexiteit, externe afhankelijkheid, overbelasting, financiele kwetsbaarheid).
3) Uitvoerbaarheid binnen capaciteit, leiderschap, governance en cultuur.
4) Of een alternatief scenario mogelijk sterker is.

OUTPUT (EXACTE KOPPEN):
STRATEGISCHE CONSISTENTIE
BESLUITSRISICO
WAAROM DIT RISICO BESTAAT
HOE HET ZICH KAN MANIFESTEREN
UITVOERBAARHEID
WELKE VOORWAARDEN NODIG ZIJN
WAAR DE GROOTSTE IMPLEMENTATIERISICO'S ZITTEN
ALTERNATIEVE STRATEGIE
WAAROM DIT SCENARIO STERKER KAN ZIJN

SCORES (EXACT):
STRATEGISCHE CONSISTENTIE SCORE: <0-30>
RISICOANALYSE SCORE: <0-20>
UITVOERBAARHEID SCORE: <0-30>
ROBUUSTHEID SCENARIO SCORE: <0-20>
DECISIONQUALITYSCORE: <0-100>

FLAGS (EXACT):
INTERVENTIES INCONSISTENT: <JA/NEE>
SCENARIOANALYSE ONTBREEKT: <JA/NEE>
`.trim();
}

function toInt(value: string, max: number): number {
  const n = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(max, n));
}

function extractScore(source: string, label: string, max: number): number {
  const m = source.match(new RegExp(`${label}\\s*:\\s*(\\d{1,3})`, "i"));
  return toInt(m?.[1] ?? "0", max);
}

export function parseDecisionQualityAssessment(text: string): DecisionQualityAssessment {
  const source = String(text ?? "");
  const strategicConsistencyScore = extractScore(source, "STRATEGISCHE CONSISTENTIE SCORE", 30);
  const riskAnalysisScore = extractScore(source, "RISICOANALYSE SCORE", 20);
  const feasibilityScore = extractScore(source, "UITVOERBAARHEID SCORE", 30);
  const scenarioRobustnessScore = extractScore(source, "ROBUUSTHEID SCENARIO SCORE", 20);
  const parsedTotal = extractScore(source, "DECISIONQUALITYSCORE", 100);
  const computed = strategicConsistencyScore + riskAnalysisScore + feasibilityScore + scenarioRobustnessScore;
  const decisionQualityScore = parsedTotal > 0 ? parsedTotal : Math.max(0, Math.min(100, computed));

  const inconsistentInterventions = /INTERVENTIES\s+INCONSISTENT\s*:\s*JA/i.test(source);
  const scenarioMissing = /SCENARIOANALYSE\s+ONTBREEKT\s*:\s*JA/i.test(source);

  return {
    decisionQualityScore,
    strategicConsistencyScore,
    riskAnalysisScore,
    feasibilityScore,
    scenarioRobustnessScore,
    inconsistentInterventions,
    scenarioMissing,
  };
}
