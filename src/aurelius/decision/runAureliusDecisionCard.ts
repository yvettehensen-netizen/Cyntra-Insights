// ============================================================
// src/aurelius/decision/runAureliusDecisionCard.ts
// OFFICIAL DECISION PIPE — ORCHESTRATOR SAFE
// ============================================================

import { callAI } from "@/aurelius/engine/utils/callAI";
import { AURELIUS_DECISION_CARD_PROMPT } from "./AureliusDecisionCard.prompt";
import type { AureliusDecisionCard } from "./types/AureliusDecisionCard";

export async function runAureliusDecisionCard(
  input: unknown
): Promise<AureliusDecisionCard> {
  const raw = await callAI("gpt-4o", [
    {
      role: "system",
      content: AURELIUS_DECISION_CARD_PROMPT + "\n\nINPUT:\n" +
        JSON.stringify(input, null, 2),
    },
  ]);

  return JSON.parse(raw) as AureliusDecisionCard;
}
