import type {
  StrategicCaseRecord,
  StrategicInterventionRecord,
  StrategicOutcomeRecord,
} from "./StrategicDataSchema";

export type OutcomeLearningInput = {
  cases: StrategicCaseRecord[];
  interventions: StrategicInterventionRecord[];
  outcomes: StrategicOutcomeRecord[];
  sector: string;
};

export type InterventionSuccessPattern = {
  sector: string;
  interventie: string;
  resultaat: string;
  confidence: "laag" | "middel" | "hoog";
};

export type OutcomeLearningOutput = {
  intervention_success_patterns: InterventionSuccessPattern[];
};

function confidenceFromCount(count: number): "laag" | "middel" | "hoog" {
  if (count >= 5) return "hoog";
  if (count >= 2) return "middel";
  return "laag";
}

export class OutcomeLearningEngine {
  readonly name = "Outcome Learning Engine";

  analyze(input: OutcomeLearningInput): OutcomeLearningOutput {
    const sector = String(input.sector ?? "").toLowerCase();
    const sectorCaseIds = new Set(
      input.cases
        .filter((row) => !sector || row.sector.toLowerCase() === sector)
        .map((row) => row.case_id)
    );

    const interventions = input.interventions.filter((row) => sectorCaseIds.has(row.case_id));
    const outcomeByIntervention = new Map(
      input.outcomes.map((row) => [row.intervention_id, row])
    );

    const groups = new Map<string, { count: number; successCount: number }>();
    for (const intervention of interventions) {
      const key = intervention.interventie_type;
      const current = groups.get(key) ?? { count: 0, successCount: 0 };
      current.count += 1;
      const outcome = outcomeByIntervention.get(intervention.intervention_id);
      if (outcome && (outcome.implementatie_succes === "middel" || outcome.implementatie_succes === "hoog")) {
        current.successCount += 1;
      }
      groups.set(key, current);
    }

    const patterns: InterventionSuccessPattern[] = Array.from(groups.entries()).map(([interventie, stats]) => {
      const successRate = stats.count > 0 ? Math.round((stats.successCount / stats.count) * 100) : 0;
      return {
        sector: input.sector || "onbekend",
        interventie,
        resultaat:
          successRate >= 70
            ? `Consistent positief effect (${successRate}% succesvolle implementatie)`
            : successRate >= 40
              ? `Gemengd effect (${successRate}% succesvolle implementatie)`
              : `Beperkt effect (${successRate}% succesvolle implementatie)`,
        confidence: confidenceFromCount(stats.count),
      };
    });

    if (!patterns.length) {
      patterns.push({
        sector: input.sector || "onbekend",
        interventie: "onvoldoende historiek",
        resultaat: "Nog geen robuuste interventie-uitkomstpatronen beschikbaar.",
        confidence: "laag",
      });
    }

    return {
      intervention_success_patterns: patterns.slice(0, 8),
    };
  }
}
