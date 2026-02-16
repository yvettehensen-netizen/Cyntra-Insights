// ============================================================
// AURELIUS — CORE ANALYSIS ENGINE CLIENT
// ROUTE: src/aurelius/runAureliusEngine.ts
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
  decision_pressure?: {
    explicit_decision_required: boolean;
    execution_risk_high: boolean;
    governance_blocking: boolean;
  };
  execution_risks?: string[];
  confidence_score?: number;
  decision_card_id?: string;
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

  if (analysis.result_payload && typeof analysis.result_payload === "object") {
    return analysis.result_payload as AureliusResult;
  }

  if (analysis.result && typeof analysis.result === "object") {
    const legacy = analysis.result as Record<string, unknown>;
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
  } catch (e: unknown) {
    return {
      success: false,
      error: {
        message: e instanceof Error ? e.message : "Analyse engine fout",
      },
    };
  }
}

