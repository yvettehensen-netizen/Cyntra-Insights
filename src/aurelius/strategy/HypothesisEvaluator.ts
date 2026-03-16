import type { CompetitiveHypothesis } from "./HypothesisCompetition";

export type EvaluatedHypothesis = CompetitiveHypothesis & {
  plausibility: number;
};

export type HypothesisEvaluationResult = {
  evaluated: EvaluatedHypothesis[];
  dominant: EvaluatedHypothesis | null;
  block: string;
};

function normalizeScore(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function linesOrFallback(lines: string[], fallback: string): string {
  return lines.length ? lines.join(" | ") : fallback;
}

export function evaluateHypotheses(
  hypotheses: CompetitiveHypothesis[]
): HypothesisEvaluationResult {
  const evaluated: EvaluatedHypothesis[] = hypotheses
    .map((h) => {
      const raw = h.supportScore * 0.7 + (1 - h.contradictionScore) * 0.3;
      return {
        ...h,
        plausibility: Number(normalizeScore(raw).toFixed(2)),
      };
    })
    .sort((a, b) => b.plausibility - a.plausibility);

  const dominant = evaluated[0] ?? null;

  const blockLines: string[] = [];
  evaluated.slice(0, 3).forEach((h, index) => {
    blockLines.push(`HYPOTHESE ${index + 1}: ${h.hypothesis}`);
    blockLines.push(`WAT DE VERKLARING IS: ${h.explanation}`);
    blockLines.push(`WELK MECHANISME HIERACHTER ZIT: ${h.mechanism}`);
    blockLines.push(
      `BEWIJS VOOR: ${linesOrFallback(
        h.evidenceFor,
        "Beperkt direct bewijs; hypothese blijft voorlopig op first-principles."
      )}`
    );
    blockLines.push(
      `BEWIJS TEGEN: ${linesOrFallback(
        h.evidenceAgainst,
        "Geen sterk weerleggend bewijs gevonden in huidige context."
      )}`
    );
    blockLines.push(`PLAUSIBILITEIT: ${h.plausibility.toFixed(2)}`);
    blockLines.push("");
  });

  blockLines.push(
    `WAARSCHIJNLIJKSTE VERKLARING: ${
      dominant?.hypothesis ??
      "Nog geen dominante verklaring vastgesteld; aanvullende verificatie vereist."
    }`
  );
  blockLines.push(`DOMINANTE PLAUSIBILITEIT: ${(dominant?.plausibility ?? 0).toFixed(2)}`);

  return {
    evaluated,
    dominant,
    block: blockLines.join("\n").trim(),
  };
}
