// ============================================================
// src/aurelius/hooks/useCyntraAnalysis.tsx
// BROWSER-SAFE CYNTRA ANALYSIS HOOK
// ONLY /aurelius-analyze
// ============================================================

import { useState, useRef, useCallback } from "react";
import type { AnalysisType } from "@/aurelius/types";

/* ============================================================
   INPUT
============================================================ */

export type RunCyntraInput = {
  company_context: string;
  analysis_type: AnalysisType;
  document_data?: string;
};

/* ============================================================
   RESULT
============================================================ */

export type RunCyntraResult = {
  report?: string;
  confidence?: "high" | "medium" | "low";
  created_at?: string;
};

/* ============================================================
   HOOK
============================================================ */

export function useCyntraAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunCyntraResult | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const runCyntraAnalysis = useCallback(
    async (input: RunCyntraInput): Promise<RunCyntraResult> => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const baseUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!baseUrl || !anonKey) {
          throw new Error("Supabase env vars ontbreken");
        }

        const res = await fetch(
          `${baseUrl}/aurelius-analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${anonKey}`,
            },
            body: JSON.stringify(input),
            signal: abortRef.current.signal,
          }
        );

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Analyse faalde (${res.status}): ${txt}`);
        }

        const json = await res.json();

        if (json.success === false) {
          throw new Error(json.error || "Analyse mislukt");
        }

        const finalResult: RunCyntraResult = {
          report: json.report,
          confidence: json.confidence ?? "high",
          created_at: json.created_at,
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
        abortRef.current = null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
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
