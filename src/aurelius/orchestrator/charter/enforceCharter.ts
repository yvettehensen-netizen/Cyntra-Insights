// ============================================================
// src/aurelius/orchestrator/charter/enforceCharter.ts
// HARD GATE — NO NORMATIVE DRIFT
// ============================================================

import { ORCHESTRATOR_CHARTER } from "./charter";
import type { CyntraLearningItem } from "./types";

export function enforceLearningCharter(item: CyntraLearningItem): void {
  if (!ORCHESTRATOR_CHARTER.allowed_domains.includes(item.domain)) {
    throw new Error(
      `CHARTER VIOLATION: Domain "${item.domain}" is not permitted.`
    );
  }

  const forbiddenTriggers = [
    "moet",
    "goed",
    "fout",
    "moreel",
    "slechte keuze",
    "beste beleid",
    "wij raden aan",
  ];

  if (
    forbiddenTriggers.some((t) =>
      item.insight.toLowerCase().includes(t)
    )
  ) {
    throw new Error(
      `CHARTER VIOLATION: Normative drift detected in insight: "${item.insight}".`
    );
  }
}
