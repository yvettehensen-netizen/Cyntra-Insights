import type { SectorPatternEngineOutput } from "@/aurelius/network/SectorPatternEngine";

export type InterventionPredictionInput = {
  sector?: string;
  dominant_problem?: string;
  mechanisms?: string[];
  historical_outcomes?: Array<{
    interventie: string;
    resultaat: string;
    confidence?: "laag" | "middel" | "hoog";
  }>;
  sector_patterns?: SectorPatternEngineOutput["sectorpatronen"];
};

export type InterventionPrediction = {
  interventie: string;
  impact: string;
  risico: string;
  kpi_effect: string;
  confidence: "laag" | "middel" | "hoog";
};

export type InterventionPredictionOutput = {
  predictions: InterventionPrediction[];
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function inferFromProblem(problem: string): InterventionPrediction[] {
  if (!problem) return [];

  const predictions: InterventionPrediction[] = [];

  if (/(contract|plafond|verzekeraar|tarief)/.test(problem)) {
    predictions.push({
      interventie: "contractheronderhandeling",
      impact: "Meer voorspelbare omzet en lagere margeslijtage.",
      risico: "Onderhandelingsrisico en langere doorlooptijd.",
      kpi_effect: "Hogere contractdekking en stabielere brutomarge.",
      confidence: "hoog",
    });
  }

  if (/(capaciteit|productiviteit|werkdruk|planning)/.test(problem)) {
    predictions.push({
      interventie: "capaciteitsherstructurering",
      impact: "Betere match tussen vraag, planning en behandelcapaciteit.",
      risico: "Tijdelijke frictie in teamroosters en caseload.",
      kpi_effect: "Meer effectieve cliënturen en minder no-show verlies.",
      confidence: "middel",
    });
  }

  if (/(versnipper|portfolio|focus|prioriter)/.test(problem)) {
    predictions.push({
      interventie: "portfolio rationalisatie",
      impact: "Minder complexiteit en sterkere focus op kernmarge.",
      risico: "Korte termijn omzetverlies buiten de kern.",
      kpi_effect: "Lagere overhead per productlijn en kortere besliscycli.",
      confidence: "middel",
    });
  }

  if (!predictions.length) {
    predictions.push({
      interventie: "kostenstructuur optimalisatie",
      impact: "Directe verbetering van kostenbeheersing.",
      risico: "Risico op onderinvestering zonder scherpe prioritering.",
      kpi_effect: "Lagere kostenratio en betere liquiditeitsruimte.",
      confidence: "laag",
    });
  }

  return predictions;
}

function inferFromOutcomes(
  outcomes: InterventionPredictionInput["historical_outcomes"]
): InterventionPrediction[] {
  if (!outcomes?.length) return [];

  return outcomes
    .slice(0, 3)
    .map((row) => ({
      interventie: row.interventie,
      impact: `Historisch resultaat: ${row.resultaat}.`,
      risico: "Contextverschil tussen cases kan effect verlagen.",
      kpi_effect: "Hogere kans op KPI-verbetering bij vergelijkbare context.",
      confidence: row.confidence ?? "middel",
    }));
}

function inferFromSectorPatterns(
  patterns: InterventionPredictionInput["sector_patterns"]
): InterventionPrediction[] {
  if (!patterns?.length) return [];

  return patterns.slice(0, 2).map((pattern) => ({
    interventie: "governance herstructurering",
    impact: `Sectorpatroon benutten: ${pattern.patroon}.`,
    risico: "Implementatie vraagt strak mandaat en ritme.",
    kpi_effect: `Verwachte verbetering via: ${pattern.strategische_implicatie}.`,
    confidence: "middel",
  }));
}

export class InterventionPredictionEngine {
  readonly name = "Intervention Prediction Engine";

  predict(input: InterventionPredictionInput): InterventionPredictionOutput {
    const dominantProblem = normalize(input.dominant_problem ?? "");
    const mechanisms = (input.mechanisms ?? []).map(normalize).join(" ");

    const mergedProblem = [dominantProblem, mechanisms].filter(Boolean).join(" ");

    const candidates = [
      ...inferFromProblem(mergedProblem),
      ...inferFromOutcomes(input.historical_outcomes),
      ...inferFromSectorPatterns(input.sector_patterns),
    ];

    const dedup = new Map<string, InterventionPrediction>();
    for (const item of candidates) {
      if (!dedup.has(item.interventie)) dedup.set(item.interventie, item);
    }

    return {
      predictions: Array.from(dedup.values()).slice(0, 5),
    };
  }
}

