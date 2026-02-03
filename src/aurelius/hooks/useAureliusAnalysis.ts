import { useState } from "react";
import { runAureliusAnalysis } from "../../api/runAnalysis";
import type { AnalysisResponse } from "../analysis/core/types";

type RunAnalysisInput = {
  analysisType: string;
  textInput: string;
  fileInputBase64?: string;
};

export function useAureliusAnalysis() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis(input: RunAnalysisInput) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await runAureliusAnalysis(input);

      if (!res.success) {
        setResult({
          status: "error",
          error_message: res.error,
          details: null,
        });
        return;
      }

      setResult({
        status: "completed",
        result: res.report,
      });
    } catch (err) {
      setResult({
        status: "error",
        error_message:
          err instanceof Error
            ? err.message
            : "Onbekende fout tijdens analyse",
        details: err,
      });
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    result,
    error,
    runAnalysis,
  };
}
