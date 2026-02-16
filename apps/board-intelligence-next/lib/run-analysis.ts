import type { SupabaseClient } from "@supabase/supabase-js";
import { buildExecutiveReportHtml } from "@/lib/report-template";
import { runOpenAiAnalysis } from "@/lib/openai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  normalizeAnalysisRow,
  normalizeReportRow,
  type AnalysisRow,
  type AnalysisResultPayload,
  type ReportRow,
} from "@/lib/types";
import { getUploadsForAnalysis } from "@/lib/uploads";

async function fetchAnalysisRow(
  analysisId: string,
  supabase: SupabaseClient
): Promise<AnalysisRow> {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .single();

  if (error || !data) {
    throw new Error(`Analysis ${analysisId} not found: ${error?.message ?? "unknown"}`);
  }

  return normalizeAnalysisRow(data);
}

export async function upsertReportFromAnalysis(
  analysis: AnalysisRow,
  result: AnalysisResultPayload,
  supabase: SupabaseClient = getSupabaseAdmin()
): Promise<ReportRow> {
  const title = `Executive Rapport · ${new Date().toLocaleDateString("nl-NL")}`;
  const organizationName = analysis.input_payload.organization_name;
  const uploadRefs =
    (analysis.input_payload.uploads ?? []).map((upload) => ({
      file_name: upload.file_name,
      mime_type: upload.mime_type,
      size_bytes: upload.size_bytes,
    })) ?? [];
  const htmlContent = buildExecutiveReportHtml({
    title,
    organizationName,
    analysisId: analysis.id,
    result,
    uploads: uploadRefs,
  });

  const metadata = {
    model: result.model,
    generated_at: result.generated_at,
    score_count: result.scores.length,
    finding_count: result.key_findings.length,
    upload_count: uploadRefs.length,
  };

  const { data, error } = await supabase
    .from("reports")
    .upsert(
      {
        analysis_id: analysis.id,
        organization_id: analysis.organization_id,
        title,
        summary: result.executive_summary,
        html_content: htmlContent,
        metadata,
      },
      { onConflict: "analysis_id" }
    )
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to upsert report for ${analysis.id}: ${error?.message ?? "unknown"}`);
  }

  return normalizeReportRow(data);
}

export async function runAnalysisJob(
  analysisId: string,
  supabase: SupabaseClient = getSupabaseAdmin()
): Promise<AnalysisRow> {
  const analysis = await fetchAnalysisRow(analysisId, supabase);

  if (analysis.status === "done") {
    return analysis;
  }

  await supabase
    .from("analyses")
    .update({
      status: "running",
      error_message: null,
      started_at: analysis.started_at ?? new Date().toISOString(),
    })
    .eq("id", analysis.id);

  try {
    const result = await runOpenAiAnalysis(analysis.input_payload);

    await upsertReportFromAnalysis(analysis, result, supabase);

    const { data, error } = await supabase
      .from("analyses")
      .update({
        status: "done",
        result_payload: result,
        error_message: null,
        finished_at: new Date().toISOString(),
      })
      .eq("id", analysis.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Failed to finalize analysis ${analysis.id}: ${error?.message ?? "unknown"}`);
    }

    return normalizeAnalysisRow(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown worker error";

    await supabase
      .from("analyses")
      .update({
        status: "failed",
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", analysis.id);

    throw error;
  }
}

export async function getAnalysisWithOptionalReport(
  analysisId: string,
  supabase: SupabaseClient = getSupabaseAdmin()
): Promise<{
  analysis: AnalysisRow;
  report: ReportRow | null;
  uploads: Awaited<ReturnType<typeof getUploadsForAnalysis>>;
}> {
  const analysis = await fetchAnalysisRow(analysisId, supabase);

  const { data: reportData, error } = await supabase
    .from("reports")
    .select("*")
    .eq("analysis_id", analysisId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch report for ${analysisId}: ${error.message}`);
  }

  return {
    analysis,
    report: reportData ? normalizeReportRow(reportData) : null,
    uploads: await getUploadsForAnalysis({ analysisId, supabase }),
  };
}
