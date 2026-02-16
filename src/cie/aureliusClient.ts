// ============================================================
// src/cie/aureliusClient.ts
// AURELIUS — ENGINE CLIENT (BACKEND API)
// ============================================================

import type {
  AureliusInput,
  AureliusResponse,
} from "@/aurelius/types/aureliusEngine";
import {
  createAnalysis,
  getAnalysisDetails,
  type AnalysisRecord,
} from "@/api/analysesClient";

function buildCompanyContext(payload: AureliusInput): string {
  const intake = payload.intake ?? {};
  const lines = [
    `Organisatie: ${intake.companyName ?? "Onbenoemd"}`,
    `Situatie: ${intake.situation ?? ""}`,
    `Doelen: ${intake.goals ?? ""}`,
    `Uitdagingen: ${intake.challenges ?? ""}`,
    `Team: ${intake.teamDescription ?? ""}`,
    `Board-vraag: ${intake.boardDecisionQuestion ?? ""}`,
  ].filter((line) => line.trim().length > 0);

  if (lines.length > 0) {
    return lines.join("\n");
  }

  return JSON.stringify(payload, null, 2);
}

function extractResultPayload(analysis: AnalysisRecord | null): unknown {
  if (!analysis || typeof analysis !== "object") return null;

  const payloadCandidate = analysis.result_payload;
  if (payloadCandidate && typeof payloadCandidate === "object") {
    return payloadCandidate;
  }

  const legacyResult = analysis.result;
  if (!legacyResult || typeof legacyResult !== "object") {
    return null;
  }

  const legacyObject = legacyResult as Record<string, unknown>;
  if (!legacyObject.input_payload) {
    return legacyObject;
  }

  const { input_payload: _discard, ...rest } = legacyObject;
  return Object.keys(rest).length ? rest : legacyObject;
}

/**
 * Backend-first analyse flow.
 * Geen frontend inserts; writes lopen via /api/analyses.
 */
export async function runAureliusEngine(
  payload: AureliusInput
): Promise<AureliusResponse> {
  const organizationId =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("active_org_id") ?? undefined
      : undefined;

  try {
    const created = await createAnalysis({
      organizationId,
      organization: payload.intake?.companyName || "Organisatie",
      description: buildCompanyContext(payload),
      context: {
        analysis_type: payload.analysisType,
        intake: payload.intake ?? {},
        hgbco: payload.hgbco ?? {},
        options: payload.options ?? {},
        document_data: payload.documentData ?? "",
      },
      runImmediately: true,
    });

    const analysisId = String(created.analysis?.id || "");
    if (!analysisId) {
      throw new Error("Backend gaf geen analysis id terug");
    }

    let analysis = created.analysis;
    if (String(analysis?.status || "").toLowerCase() === "pending") {
      const details = await getAnalysisDetails(analysisId);
      analysis = details.analysis ?? analysis;
    }

    const status = String(analysis?.status || "").toLowerCase();
    if (status === "failed") {
      const failureMessage =
        typeof analysis?.error_message === "string" && analysis.error_message.trim()
          ? analysis.error_message
          : "Analyse is server-side mislukt";
      throw new Error(failureMessage);
    }

    const resultPayload = extractResultPayload(analysis);
    if (!resultPayload) {
      throw new Error("Analyse afgerond zonder resultaat payload");
    }

    return {
      success: true,
      data: resultPayload,
      meta: {
        request_id: analysisId,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        message:
          err instanceof Error
            ? err.message
            : "Onbekende netwerk- of transportfout",
      },
    };
  }
}

