import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BoardSummaryResponse,
  DecisionIntelligenceResponse,
  DriftResponse,
  GovernanceResponse,
  PatternLearningResponse,
  RiskEvolutionResponse,
  SriResponse,
} from "@/dashboard/executive/api/types";
import { aggregateSignals } from "@/cyntra/intelligence/aggregateSignals";
import type { AggregatedSignals } from "@/cyntra/intelligence/types";
import { fetchBoardAdoptionLegitimacyIndex } from "@/api/boardEvaluation";

type IntelligenceError = string | null;

interface IntelligenceState {
  sri: SriResponse | null;
  drift: DriftResponse | null;
  risk: RiskEvolutionResponse | null;
  governance: GovernanceResponse | null;
  patternLearning: PatternLearningResponse | null;
  decisionIntelligence: DecisionIntelligenceResponse | null;
  boardSummary: BoardSummaryResponse | null;
  boardAdoptionLegitimacyIndex: number | null;
  signals: AggregatedSignals | null;
  loading: boolean;
  error: IntelligenceError;
}

const REFRESH_INTERVAL_MS = 30_000;
const BASE = "/api/intelligence";

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed for ${url}: ${response.status} ${text}`);
  }

  return (await response.json()) as T;
}

export default function useIntelligenceData() {
  const [state, setState] = useState<IntelligenceState>({
    sri: null,
    drift: null,
    risk: null,
    governance: null,
    patternLearning: null,
    decisionIntelligence: null,
    boardSummary: null,
    boardAdoptionLegitimacyIndex: null,
    signals: null,
    loading: true,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const [sri, drift, risk, governance, patternLearning, decisionIntelligence, boardSummary] = await Promise.all([
        fetchJson<SriResponse>(`${BASE}/sri`, controller.signal),
        fetchJson<DriftResponse>(`${BASE}/drift`, controller.signal),
        fetchJson<RiskEvolutionResponse>(`${BASE}/risk`, controller.signal),
        fetchJson<GovernanceResponse>(`${BASE}/governance`, controller.signal),
        fetchJson<PatternLearningResponse>(`${BASE}/pattern-learning`, controller.signal),
        fetchJson<DecisionIntelligenceResponse>(`${BASE}/decision-intelligence`, controller.signal),
        fetchJson<BoardSummaryResponse>(`${BASE}/board-summary`, controller.signal),
      ]);

      const organisationId =
        sri.organisatie_id ||
        String(localStorage.getItem("active_org_id") || "").trim() ||
        null;

      const boardAdoptionLegitimacyIndex = organisationId
        ? await fetchBoardAdoptionLegitimacyIndex(organisationId).catch(() => null)
        : null;

      if (controller.signal.aborted) return;

      setState({
        sri,
        drift,
        risk,
        governance,
        patternLearning,
        decisionIntelligence,
        boardSummary,
        boardAdoptionLegitimacyIndex,
        signals: aggregateSignals({
          sri,
          drift,
          risk,
          governance,
          patternLearning,
          decisionIntelligence,
          boardSummary,
          boardAdoptionLegitimacyIndex,
        }),
        loading: false,
        error: null,
      });
    } catch (error) {
      if (controller.signal.aborted) return;

      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Intelligence data ophalen mislukt.",
      }));
    }
  }, []);

  useEffect(() => {
    void load();

    const timer = window.setInterval(() => {
      void load();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      abortRef.current?.abort();
    };
  }, [load]);

  return useMemo(
    () => ({
      sri: state.sri,
      drift: state.drift,
      risk: state.risk,
      governance: state.governance,
      patternLearning: state.patternLearning,
      decisionIntelligence: state.decisionIntelligence,
      boardSummary: state.boardSummary,
      boardAdoptionLegitimacyIndex: state.boardAdoptionLegitimacyIndex,
      signals: state.signals,
      loading: state.loading,
      error: state.error,
    }),
    [state]
  );
}
