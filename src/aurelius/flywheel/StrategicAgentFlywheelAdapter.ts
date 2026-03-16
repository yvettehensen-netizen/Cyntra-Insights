import { StrategicCaseRepository } from "@/aurelius/data/StrategicCaseRepository";
import type { StrategicCaseRecord } from "@/aurelius/data/StrategicDataSchema";

export type StrategicAgentLearningInput = {
  sector: string;
  dominant_problem: string;
  topK?: number;
};

export type StrategicAgentLearningContext = {
  vergelijkbare_cases: StrategicCaseRecord[];
  historical_learning_section: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function findSimilarCasesForStrategicAgent(
  input: StrategicAgentLearningInput,
  repository = new StrategicCaseRepository()
): StrategicCaseRecord[] {
  return repository.findSimilarCases({
    sector: normalize(input.sector),
    dominant_problem: normalize(input.dominant_problem),
    topK: input.topK ?? 5,
  });
}

export function buildHistoricalLearningSection(
  similarCases: StrategicCaseRecord[]
): string {
  const caseLines = similarCases.length
    ? similarCases
        .map(
          (item, index) =>
            `${index + 1}. CASE ${item.case_id} | probleem: ${item.dominant_problem} | strategie: ${item.gekozen_strategie}`
        )
        .join("\n")
    : "Geen vergelijkbare cases gevonden in StrategicCaseRepository.";

  return [
    "### HISTORISCHE LEERINZICHTEN",
    "Vergelijkbare cases",
    caseLines,
    "",
    "Historische interventies",
    "Gebruik interventies met expliciete margevalidatie, capaciteitsimpact en contractdiscipline als default.",
    "",
    "Resultaten van interventies",
    "Historische uitkomstscores moeten leidend zijn in scenario-keuze en risico-inschatting.",
  ].join("\n");
}

export function buildStrategicAgentLearningContext(
  input: StrategicAgentLearningInput,
  repository = new StrategicCaseRepository()
): StrategicAgentLearningContext {
  const vergelijkbareCases = findSimilarCasesForStrategicAgent(input, repository);
  return {
    vergelijkbare_cases: vergelijkbareCases,
    historical_learning_section: buildHistoricalLearningSection(vergelijkbareCases),
  };
}

