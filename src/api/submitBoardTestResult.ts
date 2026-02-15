import { supabase } from "@/lib/supabaseClient";

export interface SubmitBoardTestPayload {
  board_member_id: string;
  clarity_score: number;
  decision_confidence: number;
  perceived_maturity: number;
  feedback: string;
}

export async function submitBoardTestResult(payload: SubmitBoardTestPayload) {
  const { data, error } = await supabase
    .from("board_test_results")
    .insert({
      board_member_id: payload.board_member_id,
      clarity_score: payload.clarity_score,
      decision_confidence: payload.decision_confidence,
      perceived_maturity: payload.perceived_maturity,
      feedback: payload.feedback,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
