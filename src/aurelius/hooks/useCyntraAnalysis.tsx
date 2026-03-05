// ============================================================
// src/aurelius/hooks/useCyntraAnalysis.tsx
// BROWSER-SAFE CYNTRA ANALYSIS HOOK
// ONLY /aurelius-analyze
// ============================================================

import { useState, useCallback } from "react";
import type { AnalysisType } from "@/aurelius/types";
import type { Sector } from "@/aurelius/sector/types";
import type { CyntraDualLayerOutput } from "@/aurelius/synthesis/dualLayer";

/* ============================================================
   INPUT
============================================================ */

export type RunCyntraInput = {
  company_context: string;
  analysis_type: AnalysisType;
  document_data?: string;
  analysisContext?: {
    sector_selected?: Sector;
  };
};

/* ============================================================
   RESULT
============================================================ */

export type RunCyntraResult = {
  report?: string;
  confidence?: "high" | "medium" | "low";
  created_at?: string;
  intelligence_layer?: CyntraDualLayerOutput["intelligence_layer"];
  decision_layer?: CyntraDualLayerOutput["decision_layer"];
};

/* ============================================================
   HOOK
============================================================ */

export function useCyntraAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunCyntraResult | null>(null);

  const runCyntraAnalysis = useCallback(
    async (input: RunCyntraInput): Promise<RunCyntraResult> => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const baseUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!baseUrl || !anonKey) {
          throw new Error("Supabase env vars ontbreken");
        }

        const payload = JSON.stringify(input);

        const res = await fetch(`${baseUrl}/aurelius-analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: payload,
        });

        if (!res.ok) {
          // Fallback for local API path when edge function rejects payload/auth.
          const localRes = await fetch("/api/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: payload,
          });

          if (!localRes.ok) {
            const txt = await res.text();
            throw new Error(`Analyse faalde (${res.status}): ${txt}`);
          }

          const localJson = await localRes.json();
          if (localJson.success === false) {
            throw new Error(localJson.error || "Analyse mislukt");
          }

          const localResult: RunCyntraResult = {
            report: localJson.report,
            confidence: localJson.confidence ?? "high",
            created_at: localJson.created_at,
            intelligence_layer: localJson.intelligence_layer,
            decision_layer: localJson.decision_layer,
          };
          setResult(localResult);
          return localResult;
        }

        const json = await res.json();

        if (json.success === false) {
          throw new Error(json.error || "Analyse mislukt");
        }

        const finalResult: RunCyntraResult = {
          report: json.report,
          confidence: json.confidence ?? "high",
          created_at: json.created_at,
          intelligence_layer: json.intelligence_layer,
          decision_layer: json.decision_layer,
        };

        setResult(finalResult);
        return finalResult;
      } catch (e) {
        if ((e as Error).name === "AbortError") return {};
        const msg = e instanceof Error ? e.message : "Analyse mislukt";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    runCyntraFullPipeline: runCyntraAnalysis,
    runCyntraAnalysis,
    loading,
    error,
    result,
    reset,
  };
}

/* ============================================================
   LEGACY ALIAS — NIETS BREKEN
============================================================ */

export function useAurelius3() {
  const cyntra = useCyntraAnalysis();

  return {
    runAurelius3: cyntra.runCyntraAnalysis,
    loading: cyntra.loading,
    error: cyntra.error,
    result: cyntra.result,
    reset: cyntra.reset,
  };
}
