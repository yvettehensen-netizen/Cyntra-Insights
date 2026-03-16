import {
  StrategicMemoryStore,
  type StrategicCase,
  type StrategicOutcomeSnapshot,
} from "@/aurelius/intelligence/StrategicMemoryStore";

export type PatternInsights = {
  similarCases: StrategicCase[];
  patternMatchScore: number;
  historicalOutcome: string;
  dominantRecommendation?: string;
  rankedRecommendations: Array<{
    recommendation: string;
    weightedScore: number;
    supportCount: number;
    averageOutcomeScore: number;
    sectorMatch: boolean;
    evidenceCaseIds: string[];
  }>;
};

function overlapScore(a: string, b: string): number {
  const left = new Set(String(a ?? "").toLowerCase().split(/\s+/).filter((token) => token.length > 4));
  const right = new Set(String(b ?? "").toLowerCase().split(/\s+/).filter((token) => token.length > 4));
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  left.forEach((token) => {
    if (right.has(token)) overlap += 1;
  });
  return overlap / Math.max(left.size, right.size);
}

function outcomeWeight(score?: StrategicOutcomeSnapshot["outcome_score"]): number {
  switch (score) {
    case "hoog":
      return 1;
    case "middel":
      return 0.6;
    case "laag":
      return 0.25;
    default:
      return 0.5;
  }
}

export class StrategicMemoryEngine {
  private readonly store = new StrategicMemoryStore();

  storeCase(caseRecord: StrategicCase): void {
    this.store.upsertCase(caseRecord);
  }

  detectPattern(problemText: string): string {
    if (/\b(consortium|triage|gemeent|contract)\b/i.test(problemText)) {
      return "Extern gestuurde instroom- en contractlogica";
    }
    if (/\b(marge|kostprijs|tarief|plafond)\b/i.test(problemText)) {
      return "Margedruk en contractdiscipline";
    }
    return "Nog geen dominant patroon vastgesteld";
  }

  findSimilarCases(problemText: string): StrategicCase[] {
    return this.store
      .listCases()
      .map((item) => ({ item, score: overlapScore(problemText, item.dominant_problem) }))
      .filter((entry) => entry.score > 0.15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry) => entry.item);
  }

  rankRecommendations(problemText: string, sector?: string): PatternInsights["rankedRecommendations"] {
    const outcomes = this.store.listOutcomes();
    const grouped = new Map<
      string,
      {
        supportCount: number;
        weightedScoreTotal: number;
        averageOutcomeScoreTotal: number;
        evidenceCaseIds: string[];
        sectorMatch: boolean;
      }
    >();

    this.store
      .listCases()
      .map((item) => {
        const overlap = overlapScore(problemText, item.dominant_problem);
        const matchingOutcome = outcomes
          .filter((outcome) => outcome.case_id === item.case_id)
          .sort((a, b) => Date.parse(b.evaluation_date) - Date.parse(a.evaluation_date))[0];
        const sectorMatch = Boolean(sector) && item.sector.toLowerCase() === String(sector).toLowerCase();
        const recommendation = item.gekozen_strategie || item.strategic_options[0] || "";
        const weightedScore =
          overlap * 60 + (sectorMatch ? 20 : 0) + outcomeWeight(matchingOutcome?.outcome_score) * 20;

        return {
          item,
          recommendation,
          overlap,
          sectorMatch,
          weightedScore,
          averageOutcomeScore: outcomeWeight(matchingOutcome?.outcome_score) * 100,
        };
      })
      .filter((entry) => entry.recommendation && entry.overlap > 0.15)
      .forEach((entry) => {
        const current = grouped.get(entry.recommendation) || {
          supportCount: 0,
          weightedScoreTotal: 0,
          averageOutcomeScoreTotal: 0,
          evidenceCaseIds: [],
          sectorMatch: false,
        };
        current.supportCount += 1;
        current.weightedScoreTotal += entry.weightedScore;
        current.averageOutcomeScoreTotal += entry.averageOutcomeScore;
        current.evidenceCaseIds.push(entry.item.case_id);
        current.sectorMatch = current.sectorMatch || entry.sectorMatch;
        grouped.set(entry.recommendation, current);
      });

    return Array.from(grouped.entries())
      .map(([recommendation, value]) => ({
        recommendation,
        weightedScore: Math.round(value.weightedScoreTotal / value.supportCount),
        supportCount: value.supportCount,
        averageOutcomeScore: Math.round(value.averageOutcomeScoreTotal / value.supportCount),
        sectorMatch: value.sectorMatch,
        evidenceCaseIds: value.evidenceCaseIds,
      }))
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, 5);
  }

  linkOutcome(caseId: string, outcome: Omit<StrategicOutcomeSnapshot, "case_id">): void {
    this.store.upsertOutcome({
      case_id: caseId,
      ...outcome,
    });
  }

  trackOutcome(problemText: string, sector?: string): PatternInsights {
    const similarCases = this.findSimilarCases(problemText);
    const outcomes = this.store.listOutcomes();
    const rankedRecommendations = this.rankRecommendations(problemText, sector);
    const bestScore = similarCases.length
      ? Math.round(overlapScore(problemText, similarCases[0].dominant_problem) * 100)
      : 0;
    const linkedOutcome =
      outcomes.find((item) => similarCases.some((entry) => entry.case_id === item.case_id))?.outcome_summary;
    const historicalOutcome =
      linkedOutcome || similarCases[0]?.resultaat || "Geen historisch outcome-signaal beschikbaar";
    return {
      similarCases,
      patternMatchScore: bestScore,
      historicalOutcome,
      dominantRecommendation: rankedRecommendations[0]?.recommendation,
      rankedRecommendations,
    };
  }
}
