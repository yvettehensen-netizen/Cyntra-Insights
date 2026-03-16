import {
  createAnalysis,
  getAnalysisDetails,
  type AnalysisRecord,
  type CreateAnalysisRequest,
} from "@/api/analysesClient";

export function extractAnalysisResultPayload(analysis: AnalysisRecord | null): Record<string, unknown> | null {
  if (!analysis || typeof analysis !== "object") return null;

  if (analysis.result_payload && typeof analysis.result_payload === "object") {
    return analysis.result_payload;
  }

  if (!analysis.result || typeof analysis.result !== "object") {
    return null;
  }

  const legacyResult = analysis.result as Record<string, unknown>;
  if (!("input_payload" in legacyResult)) {
    return legacyResult;
  }

  const { input_payload: _discard, ...rest } = legacyResult;
  return Object.keys(rest).length ? rest : legacyResult;
}

function normalizeAnalysisFailure(analysis: AnalysisRecord | null, fallback: string): string {
  const status = String(analysis?.status || "").toLowerCase();
  const errorMessage = typeof analysis?.error_message === "string" ? analysis.error_message.trim() : "";

  if (errorMessage) return errorMessage;
  if (status === "failed") return fallback;
  return "";
}

export async function runImmediateAnalysis(
  payload: CreateAnalysisRequest
): Promise<{ analysis: AnalysisRecord; resultPayload: Record<string, unknown> }> {
  const created = await createAnalysis({
    ...payload,
    runImmediately: payload.runImmediately ?? true,
  });

  const analysisId = String(created.analysis?.id || "").trim();
  if (!analysisId) {
    throw new Error("Backend gaf geen analysis id terug");
  }

  let analysis = created.analysis;
  const initialStatus = String(analysis?.status || "").toLowerCase();
  if (initialStatus === "pending" || initialStatus === "processing" || initialStatus === "running") {
    const details = await getAnalysisDetails(analysisId);
    analysis = details.analysis ?? analysis;
  }

  const failureMessage = normalizeAnalysisFailure(analysis, "Analyse is server-side mislukt");
  if (failureMessage) {
    throw new Error(failureMessage);
  }

  const resultPayload = extractAnalysisResultPayload(analysis);
  if (!resultPayload) {
    throw new Error("Analyse afgerond zonder resultaat payload");
  }

  return { analysis, resultPayload };
}
