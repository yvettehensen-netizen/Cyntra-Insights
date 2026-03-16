import type { AureliusOutputContract } from "./OutputContract";
import { scoreBoardMemoQuality } from "@/aurelius/core/BoardMemoQualityScorer";
import {
  generateFallbackExecutiveSummary,
  generateFallbackBoardMemo,
  generateFallbackConflict,
  generateFallbackRecommendation,
  generateFallbackInterventions,
} from "./OutputFallbackGenerator";
import { normalizeBoardMemoForContract } from "./BoardMemoNormalizer";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function validateEngineOutput(result: any): AureliusOutputContract {
  if (!result || typeof result !== "object") {
    throw new Error("Engine gaf geen output");
  }

  const validated = { ...result } as Record<string, unknown>;

  if (!normalize(validated.executive_summary)) {
    validated.executive_summary = generateFallbackExecutiveSummary(validated);
  }

  if (!normalize(validated.strategic_conflict)) {
    validated.strategic_conflict = generateFallbackConflict();
  }

  if (!normalize(validated.recommended_option)) {
    validated.recommended_option = generateFallbackRecommendation();
  }

  if (!Array.isArray(validated.interventions)) {
    validated.interventions = generateFallbackInterventions();
  }

  validated.board_memo = normalizeBoardMemoForContract({
    board_memo: normalize(validated.board_memo)
      ? validated.board_memo
      : generateFallbackBoardMemo(validated),
    executive_summary: validated.executive_summary,
    strategic_conflict: validated.strategic_conflict,
    recommended_option: validated.recommended_option,
    interventions: validated.interventions,
  });
  validated.board_memo_quality = scoreBoardMemoQuality(String(validated.board_memo ?? ""));

  return validated as AureliusOutputContract;
}
