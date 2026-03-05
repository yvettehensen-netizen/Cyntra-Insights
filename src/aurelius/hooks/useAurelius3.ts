// ============================================================
// src/aurelius/hooks/useCyntraAnalysis.tsx
// CYNTRA ANALYSIS HOOK — OMNIPOTENT EXECUTIVE INTELLIGENCE INTERFACE
// MAXIMUM UPGRADE • ZERO DOWNGRADE • BOARDROOM-GRADE
// ABORT CONTROL • STREAMING • PROGRESS • QUEUING • DEPTH MATRIX
// ============================================================

import { useState, useRef, useCallback } from "react";
import type { AnalysisType } from "@/aurelius/types";

/* ============================================================
   ENUMS & TYPES — CYNTRA INTELLIGENCE MATRIX
============================================================ */

export type CyntraDepth =
  | "executive"
  | "full"
  | "boardroom"
  | "strategic"
  | "operational"
  | "tactical";

export type CyntraPriority =
  | "critical"
  | "high"
  | "standard"
  | "low";

export type RunCyntraInput = {
  company_context: string;
  document_data?: string;
  analysis_type: AnalysisType;

  depth?: CyntraDepth;
  min_words?: number;
  max_words?: number;

  include_scenarios?: boolean;
  include_metrics?: boolean;
  include_counterarguments?: boolean;
  include_visuals?: boolean;

  force_longform?: boolean;
  priority?: CyntraPriority;
  cache_ttl?: number;

  custom_instructions?: string;

  enable_streaming?: boolean;
  onProgress?: (progress: number, partial: string) => void;
};

export type RunCyntraResult = {
  id?: string;
  report?: string;
  metadata?: {
    confidence: "high" | "medium" | "low";
    processing_time: number;
    word_count: number;
    depth_applied: CyntraDepth;
    priority_applied: CyntraPriority;
    visuals_included: boolean;
    stream_processed: boolean;
  };
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

async function runLocalAnalyseFallback(
  payload: Pick<RunCyntraInput, "analysis_type" | "company_context" | "document_data">,
  onProgress?: (progress: number, partial: string) => void
): Promise<unknown> {
  const runId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const startRes = await fetch("/api/analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runId, payload }),
  });
  if (!startRes.ok) {
    const txt = await startRes.text();
    throw new Error(`Lokale analyse start mislukt (${startRes.status}): ${txt}`);
  }

  const maxAttempts = 90;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const statusRes = await fetch(`/api/analyse/status/${encodeURIComponent(runId)}`);
    if (!statusRes.ok) continue;
    const statusJson = (await statusRes.json()) as {
      status?: string;
      progress?: number;
      result?: unknown;
      error?: string;
    };
    const pct = Math.max(0, Math.min(100, Number(statusJson.progress ?? 0)));
    onProgress?.(pct, "");

    if (statusJson.status === "completed") return statusJson.result;
    if (statusJson.status === "error") {
      throw new Error(statusJson.error || "Lokale analyse mislukt.");
    }
  }

  throw new Error("Lokale analyse timeout.");
}

/* ============================================================
   HOOK — CYNTRA CORE ENGINE
============================================================ */

export function useCyntraAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunCyntraResult | null>(null);
  const [progress, setProgress] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  const runCyntraAnalysis = useCallback(
    async (input: RunCyntraInput): Promise<RunCyntraResult> => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);
      setResult(null);
      setProgress(0);

      const start = performance.now();

      try {
        const payload = {
          ...input,
          depth: input.depth ?? "boardroom",
          min_words: input.min_words ?? 9000,
          max_words: input.max_words ?? 30000,
          include_scenarios: input.include_scenarios ?? true,
          include_metrics: input.include_metrics ?? true,
          include_counterarguments:
            input.include_counterarguments ?? true,
          include_visuals: input.include_visuals ?? false,
          force_longform: input.force_longform ?? true,
          priority: input.priority ?? "high",
          cache_ttl: input.cache_ttl ?? 3600,
          custom_instructions: input.custom_instructions ?? "",
          enable_streaming: input.enable_streaming ?? false,
        };

        if (payload.min_words > payload.max_words) {
          throw new Error("min_words exceeds max_words");
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "X-Cyntra-Depth": payload.depth,
          "X-Cyntra-Priority": payload.priority,
          "X-Cyntra-Cache": payload.cache_ttl.toString(),
        };

        if (payload.enable_streaming) {
          headers.Accept = "text/event-stream";
        }

        let fullReport = "";
        let json: any = {};

        try {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/aurelius-analyze`,
            {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
              signal: abortRef.current.signal,
            }
          );

          if (!res.ok) throw new Error("Analyse mislukt");

          if (payload.enable_streaming && res.body) {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              fullReport += chunk;

              const pct = Math.min(
                99,
                Math.round((fullReport.length / 120000) * 100)
              );

              setProgress(pct);
              input.onProgress?.(pct, fullReport);
            }

            try {
              json = JSON.parse(fullReport);
            } catch {
              json.report = fullReport;
            }
          } else {
            json = await res.json();
            fullReport = json.report ?? "";
            setProgress(100);
            input.onProgress?.(100, fullReport);
          }
        } catch {
          const fallbackResult = await runLocalAnalyseFallback(
            {
              analysis_type: payload.analysis_type,
              company_context: payload.company_context,
              document_data: payload.document_data,
            },
            (pct) => {
              setProgress(pct);
              input.onProgress?.(pct, "");
            }
          );
          fullReport = extractNarrativeText(fallbackResult);
          json = {
            report: fullReport,
            confidence: "medium",
            stream_processed: false,
          };
          setProgress(100);
          input.onProgress?.(100, fullReport);
        }

        if (json.success === false) {
          throw new Error(json.error || "Analyse mislukt");
        }

        const elapsed = Math.round(
          (performance.now() - start) / 1000
        );

        const wordCount = fullReport.split(/\s+/).length;

        const finalResult: RunCyntraResult = {
          id: json.report_id,
          report: fullReport,
          metadata: {
            confidence: json.confidence ?? "high",
            processing_time: elapsed,
            word_count: wordCount,
            depth_applied: payload.depth,
            priority_applied: payload.priority,
            visuals_included:
              payload.include_visuals && Boolean(json.visuals),
            stream_processed: payload.enable_streaming,
          },
        };

        setResult(finalResult);
        return finalResult;
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          return {};
        }
        const msg =
          e instanceof Error ? e.message : "Analyse mislukt";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    []
  );

  const cancelAnalysis = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setError(null);
    setResult(null);
    setProgress(0);
  }, []);

  return {
    runCyntraAnalysis,
    loading,
    error,
    result,
    progress,
    cancelAnalysis,
    reset,
  };
}

/* ============================================================
   🔒 LEGACY FAÇADE — NIETS BREKEN, ALLES WERKT
============================================================ */

export function useAurelius3() {
  const cyntra = useCyntraAnalysis();

  return {
    runAurelius3: cyntra.runCyntraAnalysis,
    loading: cyntra.loading,
    error: cyntra.error,
    result: cyntra.result,
    progress: cyntra.progress,
    cancelAnalysis: cyntra.cancelAnalysis,
    reset: cyntra.reset,
  };
}
