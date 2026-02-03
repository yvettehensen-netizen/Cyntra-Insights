import type { AnalysisType } from "@/aurelius/types";

export interface AureliusRequest {
  company_context: string;
  document_data?: string;
  analysis_type?: AnalysisType;
}

/**
 * HARD NORMALIZER
 */
function normalizeAnalysisType(type?: string): AnalysisType {
  const allowed: AnalysisType[] = [
    "strategy",
    "financial_strategy",
    "finance",
    "growth",
    "market",
    "process",
    "leadership",
    "team",
    "team_dynamics",
    "team_culture",
    "change_resilience",
    "onderstroom",
    "swot",
    "esg",
    "ai_data",
    "deep_dive",

    // ✅ TOEVOEGINGEN
    "marketing",
    "sales",
  ];

  if (allowed.includes(type as AnalysisType)) {
    return type as AnalysisType;
  }

  return "strategy";
}

export async function runAureliusEdge(input: AureliusRequest) {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurelius-3`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        company_context: input.company_context,
        document_data: input.document_data ?? "",
        analysis_type: normalizeAnalysisType(input.analysis_type),
      }),
    }
  );

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || "Aurelius Edge error");
  }

  return json;
}
