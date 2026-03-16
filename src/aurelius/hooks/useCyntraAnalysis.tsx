// ============================================================
// src/aurelius/hooks/useCyntraAnalysis.tsx
// BROWSER-SAFE CYNTRA ANALYSIS HOOK
// ONLY /aurelius-analyze
// ============================================================

import { useState, useCallback } from "react";
import type { AnalysisType } from "@/aurelius/types";
import type { Sector } from "@/aurelius/sector/types";
import type { CyntraDualLayerOutput } from "@/aurelius/synthesis/dualLayer";
import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";
import type { CausalStrategyResult } from "@/aurelius/causal/CausalStrategyEngine";

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
  report?: unknown;
  confidence?: "high" | "medium" | "low";
  created_at?: string;
  intelligence_layer?: CyntraDualLayerOutput["intelligence_layer"];
  decision_layer?: CyntraDualLayerOutput["decision_layer"];
  strategic_levers?: StrategicLeverInsight[];
  causal_strategy?: CausalStrategyResult;
};

function extractNarrativeText(input: unknown): string {
  if (typeof input === "string") return input;
  if (!input || typeof input !== "object") return "";

  const obj = input as Record<string, unknown>;
  if (typeof obj.report === "string") return obj.report;
  if (obj.report && typeof obj.report === "object") {
    const report = obj.report as Record<string, unknown>;
    if (typeof report.narrative === "string") return report.narrative;
  }
  if (typeof obj.narrative === "string") return obj.narrative;
  return "";
}

function normalizeResultPayload(payload: Record<string, unknown>): RunCyntraResult {
  return {
    report: extractNarrativeText(payload),
    confidence: (payload.confidence as RunCyntraResult["confidence"]) ?? "high",
    created_at:
      typeof payload.created_at === "string" ? payload.created_at : undefined,
    intelligence_layer: payload.intelligence_layer as RunCyntraResult["intelligence_layer"],
    decision_layer: payload.decision_layer as RunCyntraResult["decision_layer"],
    strategic_levers: payload.strategic_levers as RunCyntraResult["strategic_levers"],
    causal_strategy: payload.causal_strategy as RunCyntraResult["causal_strategy"],
  };
}

async function runLocalAnalyseFallback(
  input: RunCyntraInput
): Promise<RunCyntraResult> {
  const runId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const startRes = await fetch("/api/analyse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      runId,
      payload: {
        analysis_type: input.analysis_type,
        company_context: input.company_context,
        document_data: input.document_data,
        analysisContext: input.analysisContext,
      },
    }),
  });

  if (!startRes.ok) {
    const txt = await startRes.text();
    throw new Error(`Lokale analyse start mislukt (${startRes.status}): ${txt}`);
  }

  for (let attempt = 0; attempt < 90; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const statusRes = await fetch(`/api/analyse/status/${encodeURIComponent(runId)}`);
    if (!statusRes.ok) continue;

    const statusJson = (await statusRes.json()) as {
      status?: string;
      result?: Record<string, unknown>;
      error?: string;
    };

    if (statusJson.status === "completed" && statusJson.result) {
      return normalizeResultPayload(statusJson.result);
    }

    if (statusJson.status === "error") {
      throw new Error(statusJson.error || "Lokale analyse mislukt");
    }
  }

  throw new Error("Lokale analyse timeout.");
}

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
        const payload = JSON.stringify(input);

        let finalResult: RunCyntraResult;

        if (baseUrl && anonKey) {
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
            throw new Error(`Analyse faalde (${res.status})`);
          }

          const json = await res.json();

          if (json.success === false) {
            throw new Error(json.error || "Analyse mislukt");
          }

          finalResult = normalizeResultPayload(json);
        } else {
          finalResult = await runLocalAnalyseFallback(input);
        }

        setResult(finalResult);
        return finalResult;
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          try {
            const fallback = await runLocalAnalyseFallback(input);
            setResult(fallback);
            return fallback;
          } catch {
            // Preserve original upstream error when local fallback also fails.
          }
        }

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
