// ============================================================
// ✅ RUN AURELIUS ENGINE — BACKEND API CLIENT
// Path: src/aurelius/engine/runAurelius.ts
// ============================================================

export interface AureliusResult {
  executive_summary: string;
  insights: string[];
  risks: string[];
  opportunities: string[];
  roadmap_90d: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
  confidence_score?: number;
}

export type EngineSuccess = {
  success: true;
  result: AureliusResult;
};

export type EngineFailure = {
  success: false;
  error: { message: string };
};

function extractResultPayload(analysis: Record<string, unknown> | null): AureliusResult | null {
  if (!analysis) return null;
  const resultPayload = analysis.result_payload;
  if (resultPayload && typeof resultPayload === "object") {
    return resultPayload as AureliusResult;
  }

  const legacyResult = analysis.result;
  if (legacyResult && typeof legacyResult === "object") {
    const legacy = legacyResult as Record<string, unknown>;
    if ("input_payload" in legacy) {
      const { input_payload: _discard, ...rest } = legacy;
      if (Object.keys(rest).length) {
        return rest as AureliusResult;
      }
    }
    return legacy as AureliusResult;
  }

  return null;
}

export async function runAureliusEngine(input: {
  analysis_type: string;
  company_context: string;
  document_data?: string;
}): Promise<EngineSuccess | EngineFailure> {
  try {
    const response = await fetch("/api/analyses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organization: "Organisatie",
        description: input.company_context,
        context: {
          analysis_type: input.analysis_type,
          document_data: input.document_data ?? "",
        },
        runImmediately: true,
      }),
    });

    const body = (await response.json()) as {
      analysis?: Record<string, unknown>;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(body.error || "Analyse engine fout");
    }

    const result = extractResultPayload(body.analysis ?? null);
    if (!result) {
      throw new Error("Analyse afgerond zonder resultaat payload");
    }

    return { success: true, result };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : "Analyse engine fout",
      },
    };
  }
}

