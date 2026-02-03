type RunAnalysisInput = {
  analysisType: string;
  textInput: string;
  fileInputBase64?: string;
};

type RunAnalysisSuccess = {
  success: true;
  report: unknown;
  created_at: string;
};

type RunAnalysisFailure = {
  success: false;
  error: string;
};

export type RunAnalysisResponse =
  | RunAnalysisSuccess
  | RunAnalysisFailure;

export async function runAureliusAnalysis(
  input: RunAnalysisInput
): Promise<RunAnalysisResponse> {
  const baseUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

  if (!baseUrl) {
    throw new Error("VITE_SUPABASE_FUNCTIONS_URL ontbreekt");
  }

  // 🔥 DIT IS DE FIX: juiste functionnaam
  const url = `${baseUrl}/aurelius-analyze`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      company_context: input.textInput,
      document_data: input.fileInputBase64 ?? "",
      analysis_type: input.analysisType,
    }),
  });

  const json = (await res.json()) as RunAnalysisResponse;

  if (!res.ok) {
    return {
      success: false,
      error: "error" in json ? json.error : "Analyse mislukt",
    };
  }

  return json;
}
