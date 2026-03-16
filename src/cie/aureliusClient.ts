// ============================================================
// src/cie/aureliusClient.ts
// AURELIUS — ENGINE CLIENT (BACKEND API)
// ============================================================

import type {
  AureliusInput,
  AureliusResponse,
} from "@/aurelius/types/aureliusEngine";
import { normalizeAureliusResultContract } from "@/aurelius/types/aureliusResult";
import { validateEngineOutput } from "@/aurelius/validation/EngineOutputValidator";
import {
  runImmediateAnalysis,
} from "@/api/analysisExecution";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function resolveBackendOrganizationId(): string | undefined {
  if (typeof localStorage === "undefined") return undefined;
  const raw = String(localStorage.getItem("active_org_id") || "").trim();
  return UUID_RE.test(raw) ? raw : undefined;
}

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

/**
 * Backend-first analyse flow.
 * Geen frontend inserts; writes lopen via /api/analyses.
 */
export async function runAureliusEngine(
  payload: AureliusInput
): Promise<AureliusResponse> {
  const organizationId = resolveBackendOrganizationId();

  try {
    const { analysis, resultPayload } = await runImmediateAnalysis({
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

    return {
      success: true,
      data: validateEngineOutput(normalizeAureliusResultContract(resultPayload)),
      meta: {
        request_id: String(analysis.id || ""),
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
