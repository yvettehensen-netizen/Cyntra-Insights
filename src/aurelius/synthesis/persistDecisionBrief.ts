import { supabase } from "@/lib/supabaseClient";
import type { BoardroomBrief } from "./types";

export async function persistDecisionBrief(
  brief: BoardroomBrief,
  meta: {
    source_analysis_id?: string;
    source_analysis_type?: string;
    irreversibility_deadline?: string;
  }
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.from("decision_briefs").insert({
    user_id: user.id,

    executive_thesis: brief.executive_thesis,
    central_tension: brief.central_tension,
    strategic_narrative: brief.strategic_narrative,

    key_tradeoffs: brief.key_tradeoffs,
    irreversible_decisions: brief.irreversible_decisions,

    cyntra_proposal: brief.cyntra_proposal,

    governance_risks: brief.governance_risks,
    execution_risks: brief.execution_risks,

    confidence_score: brief.confidence_level,

    irreversibility_deadline: meta.irreversibility_deadline,

    source_analysis_id: meta.source_analysis_id,
    source_analysis_type: meta.source_analysis_type,
  });

  if (error) {
    throw error;
  }
}
