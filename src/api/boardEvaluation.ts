import { supabase } from "@/lib/supabaseClient";
import {
  aggregateBoardEvaluations,
  calculateOverallScore,
  normalizeBoardScores,
} from "@/cyntra/board-evaluation";
import type {
  BoardEvaluationInsert,
  BoardEvaluationRow,
  BoardEvaluationScores,
} from "@/cyntra/board-evaluation";

type RawBoardEvaluationRow = {
  id: string;
  board_member_id: string;
  organisation_id: string;
  clarity_score: number | string;
  decision_certainty: number | string;
  risk_understanding: number | string;
  governance_trust: number | string;
  instrument_perception: number | string;
  overall_score: number | string;
  created_at: string;
};

function toNumber(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, value));
}

function mapBoardEvaluationRow(row: RawBoardEvaluationRow): BoardEvaluationRow {
  const scores: BoardEvaluationScores = normalizeBoardScores({
    clarity_score: toNumber(row.clarity_score),
    decision_certainty: toNumber(row.decision_certainty),
    risk_understanding: toNumber(row.risk_understanding),
    governance_trust: toNumber(row.governance_trust),
    instrument_perception: toNumber(row.instrument_perception),
  });

  return {
    id: row.id,
    board_member_id: row.board_member_id,
    organisation_id: row.organisation_id,
    ...scores,
    overall_score: Number.isFinite(toNumber(row.overall_score))
      ? clampScore(toNumber(row.overall_score))
      : calculateOverallScore(scores),
    created_at: row.created_at,
  };
}

function isMissingBoardEvaluationRelationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as {
    code?: string;
    status?: number;
    message?: string;
    details?: string;
  };
  const text = `${maybe.message ?? ""} ${maybe.details ?? ""}`.toLowerCase();
  return (
    maybe.code === "PGRST205" ||
    maybe.status === 404 ||
    text.includes("board_evaluation_results") ||
    text.includes("relation") && text.includes("does not exist")
  );
}

async function parseApiError(response: Response): Promise<Error> {
  try {
    const body = await response.json();
    return new Error(
      typeof body?.error === "string" && body.error.length
        ? body.error
        : `API request failed (${response.status})`
    );
  } catch {
    return new Error(`API request failed (${response.status})`);
  }
}

async function fetchBoardEvaluationsFallbackViaApi(
  organisationId: string,
  limit: number
): Promise<BoardEvaluationRow[]> {
  const response = await fetch(
    `/api/board-evaluations?organisationId=${encodeURIComponent(organisationId)}&limit=${limit}`,
    { method: "GET", headers: { Accept: "application/json" } }
  );
  if (!response.ok) {
    throw await parseApiError(response);
  }
  const payload = (await response.json()) as { rows?: RawBoardEvaluationRow[] };
  return (payload.rows || []).map(mapBoardEvaluationRow);
}

async function submitBoardEvaluationFallbackViaApi(
  payload: BoardEvaluationInsert
): Promise<BoardEvaluationRow> {
  const response = await fetch("/api/board-evaluations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = (await response.json()) as { evaluation?: RawBoardEvaluationRow };
  if (!result.evaluation) {
    throw new Error("Board-evaluatie response mist evaluatie-object.");
  }
  return mapBoardEvaluationRow(result.evaluation);
}

export async function resolveActiveOrganisationId(
  userId: string
): Promise<string> {
  const localValue = String(localStorage.getItem("active_org_id") || "").trim();
  if (localValue) return localValue;

  const { data: membership, error } = await supabase
    .from("organisation_memberships")
    .select("organisation_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !membership?.organisation_id) {
    throw new Error("Geen actieve organisatie gevonden.");
  }

  const organisationId = String(membership.organisation_id);
  localStorage.setItem("active_org_id", organisationId);
  return organisationId;
}

export async function submitBoardEvaluation(
  payload: BoardEvaluationInsert
): Promise<BoardEvaluationRow> {
  const normalized = normalizeBoardScores(payload);

  const { data, error } = await supabase
    .from("board_evaluation_results")
    .insert({
      board_member_id: payload.board_member_id,
      organisation_id: payload.organisation_id,
      clarity_score: normalized.clarity_score,
      decision_certainty: normalized.decision_certainty,
      risk_understanding: normalized.risk_understanding,
      governance_trust: normalized.governance_trust,
      instrument_perception: normalized.instrument_perception,
    })
    .select(
      [
        "id",
        "board_member_id",
        "organisation_id",
        "clarity_score",
        "decision_certainty",
        "risk_understanding",
        "governance_trust",
        "instrument_perception",
        "overall_score",
        "created_at",
      ].join(",")
    )
    .single<RawBoardEvaluationRow>();

  if (error || !data) {
    if (isMissingBoardEvaluationRelationError(error)) {
      return submitBoardEvaluationFallbackViaApi({
        ...payload,
        ...normalized,
      });
    }
    throw error ?? new Error("Board-evaluatie opslaan mislukt.");
  }

  return mapBoardEvaluationRow(data);
}

export async function fetchBoardEvaluations(
  organisationId: string,
  limit = 500
): Promise<BoardEvaluationRow[]> {
  const { data, error } = await supabase
    .from("board_evaluation_results")
    .select(
      [
        "id",
        "board_member_id",
        "organisation_id",
        "clarity_score",
        "decision_certainty",
        "risk_understanding",
        "governance_trust",
        "instrument_perception",
        "overall_score",
        "created_at",
      ].join(",")
    )
    .eq("organisation_id", organisationId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<RawBoardEvaluationRow[]>();

  if (error) {
    if (isMissingBoardEvaluationRelationError(error)) {
      return fetchBoardEvaluationsFallbackViaApi(organisationId, limit);
    }
    throw error;
  }

  return (data || []).map(mapBoardEvaluationRow);
}

export async function fetchBoardAdoptionLegitimacyIndex(
  organisationId: string
): Promise<number | null> {
  const rows = await fetchBoardEvaluations(organisationId, 250);
  if (!rows.length) return null;
  const aggregate = aggregateBoardEvaluations(rows);
  return aggregate.board_adoption_legitimacy_index;
}
