import { supabase } from "@/lib/supabaseClient";
import type { BoardroomBrief } from "./types";

/**
 * Persist a single Boardroom Decision Brief.
 *
 * ⚠️ Belangrijk:
 * - Deze functie weet NIETS over Aurelius internals
 * - Alle context (analysisType, userId, optional sourceId)
 *   wordt expliciet meegegeven
 */
export async function persistDecisionBrief({
  userId,
  analysisType,
  brief,
  sourceAnalysisId,
}: {
  userId: string;
  analysisType: string;
  brief: BoardroomBrief;
  sourceAnalysisId?: string;
}) {
  const { error } = await supabase.from("decision_briefs").insert({
    user_id: userId,
    analysis_type: analysisType,

    source_analysis_id: sourceAnalysisId ?? null,

    executive_thesis: brief.executive_thesis,
    central_tension: brief.central_tension,
    strategic_narrative: brief.strategic_narrative,

    key_tradeoffs: brief.key_tradeoffs,
    irreversible_decisions: brief.irreversible_decisions,

    cyntra_proposal: brief.cyntra_proposal,

    governance_risks: brief.governance_risks,
    execution_risks: brief.execution_risks,

    confidence_level: brief.confidence_level ?? null,
  });

  if (error) {
    throw new Error(`Failed to persist decision brief: ${error.message}`);
  }
}
