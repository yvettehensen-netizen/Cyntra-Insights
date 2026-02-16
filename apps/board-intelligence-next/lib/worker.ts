import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { runAnalysisJob } from "@/lib/run-analysis";
import { normalizeAnalysisRow, type AnalysisRow } from "@/lib/types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function claimPendingAnalysis(
  supabase: SupabaseClient = getSupabaseAdmin()
): Promise<AnalysisRow | null> {
  const { data, error } = await supabase.rpc("claim_pending_analysis");

  if (error) {
    throw new Error(`Failed to claim pending analysis: ${error.message}`);
  }

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return normalizeAnalysisRow(data[0]);
}

export async function runWorkerOnce(
  supabase: SupabaseClient = getSupabaseAdmin()
): Promise<{ claimed: boolean; analysisId?: string; status?: string }> {
  const analysis = await claimPendingAnalysis(supabase);
  if (!analysis) {
    return { claimed: false };
  }

  try {
    const finished = await runAnalysisJob(analysis.id, supabase);
    return { claimed: true, analysisId: finished.id, status: finished.status };
  } catch {
    return { claimed: true, analysisId: analysis.id, status: "failed" };
  }
}

export async function runWorkerLoop(options?: {
  pollIntervalMs?: number;
  signal?: AbortSignal;
  supabase?: SupabaseClient;
}): Promise<void> {
  const pollIntervalMs = options?.pollIntervalMs ?? Number(process.env.WORKER_POLL_INTERVAL_MS || 2500);
  const supabase = options?.supabase ?? getSupabaseAdmin();

  while (!options?.signal?.aborted) {
    try {
      await runWorkerOnce(supabase);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[worker] error: ${message}`);
    }

    await sleep(pollIntervalMs);
  }
}
