import type { ReasoningState } from "./ReasoningState";

export type ReasoningGuardResult = {
  pass: boolean;
  issues: string[];
};

function normalizeTokens(text: string): Set<string> {
  return new Set(
    String(text ?? "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 5)
  );
}

function overlapScore(a: string, b: string): number {
  const aTokens = normalizeTokens(a);
  const bTokens = normalizeTokens(b);
  if (!aTokens.size || !bTokens.size) return 0;
  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) overlap += 1;
  }
  return overlap / Math.max(1, Math.min(aTokens.size, bTokens.size));
}

function latest(entries: string[]): string {
  return entries[entries.length - 1] ?? "";
}

export function runReasoningGuard(state: ReasoningState): ReasoningGuardResult {
  const issues: string[] = [];

  const diagnosis = latest(state.diagnosis.entries);
  const mechanisms = latest(state.mechanisms.entries);
  const decision = latest(state.decision.entries);

  if (!diagnosis) {
    issues.push("diagnosis ontbreekt in gedeelde ReasoningState.");
  }
  if (!mechanisms) {
    issues.push("mechanisms ontbreken in gedeelde ReasoningState.");
  }
  if (!decision) {
    issues.push("decision ontbreekt in gedeelde ReasoningState.");
  }

  if (diagnosis && mechanisms) {
    const dmScore = overlapScore(diagnosis, mechanisms);
    if (dmScore < 0.05) {
      issues.push(
        "lage consistentie tussen diagnosis en mechanisms; causale aansluiting is zwak."
      );
    }
  }

  if (mechanisms && decision) {
    const mdScore = overlapScore(mechanisms, decision);
    if (mdScore < 0.05) {
      issues.push(
        "lage consistentie tussen mechanisms en decision; besluit lijkt niet op mechanisme aan te sluiten."
      );
    }
  }

  if (diagnosis && decision) {
    const ddScore = overlapScore(diagnosis, decision);
    if (ddScore < 0.03) {
      issues.push(
        "lage consistentie tussen diagnosis en decision; besluitdruk kan diagnostiek missen."
      );
    }
  }

  if (issues.length) {
    console.error("[ReasoningGuard]", {
      issueCount: issues.length,
      issues,
    });
  }

  return {
    pass: issues.length === 0,
    issues,
  };
}

