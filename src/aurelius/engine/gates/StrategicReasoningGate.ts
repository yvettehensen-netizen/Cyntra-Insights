export type StrategicReasoningGateInput = {
  sourceContext: string;
  contextEngineOutput: string;
  diagnosisOutput: string;
  strategicInsightsOutput: string;
  orgDynamicsOutput: string;
  hypothesisOutput: string;
  interventionOutput: string;
};

export type StrategicReasoningGateBreakdown = {
  strategicInsights: number;
  causalLogic: number;
  numericAnalysis: number;
  interventionQuality: number;
  strategicOptions: number;
};

export type StrategicReasoningGateResult = {
  pass: boolean;
  strategicDepthScore: number;
  breakdown: StrategicReasoningGateBreakdown;
  reasons: string[];
  message?: string;
};

const NUMERIC_SIGNAL_RE = /(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%|\b\d+[.,]?\d*\b)/gi;
const CALC_SIGNAL_RE = /(\/|\*|\+|\-|x\s*\d|per\s+(?:cliënt|client|fte|maand|jaar)|maximale schaal|implicatie|doorrekening|berekening)/i;

function normalizeText(value: string): string {
  return String(value ?? "").replace(/\r\n?/g, "\n").trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

function countSignals(source: string, patterns: RegExp[]): number {
  return patterns.reduce((acc, pattern) => acc + (source.match(pattern)?.length ?? 0), 0);
}

function sectionForOption(source: string, option: "A" | "B" | "C"): string {
  const re = new RegExp(
    `OPTIE\\s*${option}[\\s\\S]*?(?=OPTIE\\s*[ABC]\\b|$)`,
    "i"
  );
  return source.match(re)?.[0] ?? "";
}

export function runStrategicReasoningGate(
  input: StrategicReasoningGateInput
): StrategicReasoningGateResult {
  const reasons: string[] = [];
  const sourceContext = normalizeText(input.sourceContext);
  const contextText = normalizeText(input.contextEngineOutput);
  const diagnosisText = normalizeText(input.diagnosisOutput);
  const insightText = normalizeText(input.strategicInsightsOutput);
  const dynamicsText = normalizeText(input.orgDynamicsOutput);
  const optionsText = normalizeText(input.hypothesisOutput);
  const interventionText = normalizeText(input.interventionOutput);

  const mergedStrategic = [contextText, diagnosisText, insightText, dynamicsText].join("\n\n");

  let strategicInsights = 0;
  const insightBlocks = insightText.match(/STRATEGISCH\s+INZICHT[\s\S]*?(?=STRATEGISCH\s+INZICHT|$)/gi) ?? [];
  const uniqueInsightDescriptions = unique(
    insightBlocks
      .map((block) => {
        const m = block.match(/STRATEGISCH\s+INZICHT\s*[:\-]?\s*([^\n]+)/i);
        return (m?.[1] ?? "").trim();
      })
      .filter(Boolean)
  );
  const logicCount = (insightText.match(/\bLOGICA\b/gi) ?? []).length;
  const implicationCount =
    (insightText.match(/\b(?:BESTUURLIJKE\s+IMPLICATIE|STRATEGISCHE\s+IMPLICATIE)\b/gi) ?? []).length;

  if (uniqueInsightDescriptions.length >= 3 && logicCount >= 3 && implicationCount >= 3) {
    strategicInsights = 30;
  } else {
    strategicInsights = Math.min(30, uniqueInsightDescriptions.length * 7 + Math.min(logicCount, 3) * 3);
    reasons.push("Minimaal 3 unieke strategische inzichten met logica en bestuurlijke implicatie ontbreken.");
  }

  let numericAnalysis = 0;
  const hasNumericInput = (sourceContext.match(NUMERIC_SIGNAL_RE) ?? []).length > 0;
  const numericMentions = (mergedStrategic.match(NUMERIC_SIGNAL_RE) ?? []).length;
  const hasCalcLogic = CALC_SIGNAL_RE.test(mergedStrategic);
  if (!hasNumericInput) {
    numericAnalysis = 20;
  } else if (numericMentions >= 3 && hasCalcLogic) {
    numericAnalysis = 20;
  } else {
    numericAnalysis = Math.min(20, numericMentions >= 1 ? 8 : 0);
    reasons.push("Cijfers aanwezig zonder voldoende numerieke interpretatie of berekeningslogica.");
  }

  let causalLogic = 0;
  const causalSignals = countSignals(mergedStrategic.toLowerCase(), [
    /\banalyse\b/g,
    /\bmechanisme\b/g,
    /\bgevolg\b/g,
    /\bbestuurlijke implicatie\b/g,
    /->/g,
    /\boorzaak\b/g,
  ]);
  if (causalSignals >= 8) {
    causalLogic = 20;
  } else {
    causalLogic = Math.min(20, causalSignals * 2);
    reasons.push("Causale redenering (analyse -> mechanisme -> gevolg -> bestuurlijke implicatie) is onvoldoende.");
  }

  let strategicOptions = 0;
  const optionA = sectionForOption(optionsText, "A");
  const optionB = sectionForOption(optionsText, "B");
  const optionC = sectionForOption(optionsText, "C");
  const optionsPresent = [optionA, optionB, optionC].filter(Boolean);
  const optionsComplete = optionsPresent.filter((section) =>
    /\bVOORDEEL\b/i.test(section) &&
    /\bRISICO\b/i.test(section) &&
    /\bLANGE\s+TERMIJN\s+EFFECT\b/i.test(section)
  ).length;
  if (optionsComplete >= 3) {
    strategicOptions = 10;
  } else {
    strategicOptions = Math.min(10, optionsComplete * 3);
    reasons.push("Strategische opties A/B/C met voordeel, risico en lange termijn effect zijn onvolledig.");
  }

  let interventionQuality = 0;
  const actionCount = (interventionText.match(/\b(?:ACTIE|INTERVENTIE)\b\s*:?/gi) ?? []).length;
  const ownerCount = (interventionText.match(/\bEIGENAAR\b\s*:?/gi) ?? []).length;
  const kpiCount = (interventionText.match(/\b(?:KPI|MEETBARE\s+KPI)\b\s*:?/gi) ?? []).length;
  const deadlineCount = (interventionText.match(/\bDEADLINE\b\s*:?/gi) ?? []).length;
  const problemCount = (interventionText.match(/\bPROBLEEM\s+DAT\s+WORDT\s+OPGELOST\b\s*:?/gi) ?? []).length;
  const orgImpactCount = (interventionText.match(/\bGEVOLG\s+VOOR\s+ORGANISATIE\b\s*:?/gi) ?? []).length;
  const clientImpactCount =
    (interventionText.match(/\bGEVOLG\s+VOOR\s+(?:KLANT\s*\/\s*CLI[ËE]NT|CLI[ËE]NT|KLANT)\b\s*:?/gi) ?? [])
      .length;

  const interventionsSufficient =
    actionCount >= 6 &&
    ownerCount >= 6 &&
    kpiCount >= 6 &&
    deadlineCount >= 6 &&
    problemCount >= 6;
  const impactSufficient = orgImpactCount >= 6 && clientImpactCount >= 6;

  if (interventionsSufficient && impactSufficient) {
    interventionQuality = 20;
  } else {
    const raw =
      Math.min(actionCount, 6) +
      Math.min(ownerCount, 6) +
      Math.min(kpiCount, 6) +
      Math.min(deadlineCount, 6);
    interventionQuality = Math.min(20, Math.round((raw / 24) * 12 + Math.min(orgImpactCount, clientImpactCount, 6)));
    reasons.push("Interventieprogramma mist vereiste diepgang (minimaal 6 interventies met eigenaar, KPI, deadline en impactanalyse)." );
  }

  const strategicDepthScore = Math.max(
    0,
    Math.min(100, strategicInsights + causalLogic + numericAnalysis + interventionQuality + strategicOptions)
  );

  const hardFail =
    uniqueInsightDescriptions.length < 3 ||
    (hasNumericInput && !(numericMentions >= 3 && hasCalcLogic)) ||
    optionsComplete < 3 ||
    !interventionsSufficient ||
    !impactSufficient;

  if (hardFail) {
    return {
      pass: false,
      strategicDepthScore,
      breakdown: {
        strategicInsights,
        causalLogic,
        numericAnalysis,
        interventionQuality,
        strategicOptions,
      },
      reasons: unique(reasons),
      message: "Strategic reasoning insufficient. Analyse opnieuw genereren met meer diepgang.",
    };
  }

  if (strategicDepthScore < 70) {
    return {
      pass: false,
      strategicDepthScore,
      breakdown: {
        strategicInsights,
        causalLogic,
        numericAnalysis,
        interventionQuality,
        strategicOptions,
      },
      reasons: unique(reasons),
      message: "Strategic reasoning insufficient. Analyse opnieuw genereren met meer diepgang.",
    };
  }

  return {
    pass: true,
    strategicDepthScore,
    breakdown: {
      strategicInsights,
      causalLogic,
      numericAnalysis,
      interventionQuality,
      strategicOptions,
    },
    reasons: unique(reasons),
  };
}
