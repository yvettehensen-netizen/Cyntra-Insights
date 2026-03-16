import type { StrategicOption } from "./StrategicOptionGenerator";

export type StrategicOptionScore = {
  optionId: StrategicOption["id"];
  uitvoerbaarheid: number;
  financieelEffect: number;
  strategischRisico: number;
  total: number;
};

export type StrategicOptionEvaluatorInput = {
  options: StrategicOption[];
};

export type StrategicOptionEvaluatorResult = {
  scores: StrategicOptionScore[];
  preferredOptionId: StrategicOption["id"] | null;
  block: string;
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreOption(option: StrategicOption): StrategicOptionScore {
  let uitvoerbaarheid = 65;
  let financieelEffect = 60;
  let strategischRisico = 45;

  if (option.id === "A") {
    uitvoerbaarheid += 15;
    financieelEffect += 20;
    strategischRisico -= 10;
  }
  if (option.id === "B") {
    uitvoerbaarheid += 5;
    financieelEffect += 10;
    strategischRisico += 5;
  }
  if (option.id === "C") {
    uitvoerbaarheid -= 10;
    financieelEffect -= 5;
    strategischRisico += 20;
  }

  const total = clampScore(uitvoerbaarheid * 0.4 + financieelEffect * 0.4 + (100 - strategischRisico) * 0.2);

  return {
    optionId: option.id,
    uitvoerbaarheid: clampScore(uitvoerbaarheid),
    financieelEffect: clampScore(financieelEffect),
    strategischRisico: clampScore(strategischRisico),
    total,
  };
}

export function runStrategicOptionEvaluator(
  input: StrategicOptionEvaluatorInput
): StrategicOptionEvaluatorResult {
  const scores = input.options.map(scoreOption);
  const ranked = [...scores].sort((a, b) => b.total - a.total);
  const preferredOptionId = ranked[0]?.optionId ?? null;

  const block = [
    "STRATEGISCHE OPTIE-EVALUATIE",
    ...scores.map(
      (score) =>
        `Optie ${score.optionId}: uitvoerbaarheid=${score.uitvoerbaarheid}, financieel effect=${score.financieelEffect}, strategisch risico=${score.strategischRisico}, totaalscore=${score.total}`
    ),
    preferredOptionId
      ? `Voorkeursoptie: Optie ${preferredOptionId}`
      : "Voorkeursoptie: niet beschikbaar",
  ].join("\n");

  return {
    scores,
    preferredOptionId,
    block,
  };
}

