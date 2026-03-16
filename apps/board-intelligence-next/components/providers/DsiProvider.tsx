"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { calculateDsiFromFactors, deriveFactorsFromReconstruction } from "@/lib/cd-formulas";
import type { DsiPoint, DsiResponse } from "@/lib/cd-types";
import { useDecisionCycle } from "@/components/providers/DecisionCycleProvider";
import { useEventBus } from "@/components/providers/EventBusProvider";

interface DsiContextValue {
  score: number;
  factors: DsiResponse["factors"];
  trend: DsiPoint[];
  loading: boolean;
  error: string | null;
  refreshTrend: () => Promise<void>;
}

const DsiContext = createContext<DsiContextValue | null>(null);

const emptyFactors = {
  conflict_count: 0,
  execution_speed: 0,
  intervention_completion_rate: 0,
  decision_latency: 0,
  governance_discipline: 0,
};

export function DsiProvider({ children }: { children: React.ReactNode }) {
  const { data, decisionCycleId } = useDecisionCycle();
  const eventBus = useEventBus();

  const [trend, setTrend] = useState<DsiPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const factors = useMemo(() => {
    if (!data) return emptyFactors;
    return deriveFactorsFromReconstruction(data);
  }, [data]);

  const score = useMemo(() => calculateDsiFromFactors(factors), [factors]);

  const refreshTrend = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/decision-cycles/${decisionCycleId}/metrics/dsi-trend`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load DSI trend");
      }

      setTrend((payload.trend as DsiPoint[]) ?? []);
    } catch (trendError) {
      const message = trendError instanceof Error ? trendError.message : String(trendError);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [decisionCycleId]);

  useEffect(() => {
    void refreshTrend();
  }, [refreshTrend]);

  useEffect(() => {
    const offMetric = eventBus.on("governance.metric.updated", (event) => {
      if (event.decisionCycleId !== decisionCycleId) return;
      void refreshTrend();
    });

    const offIntervention = eventBus.on("intervention.changed", (event) => {
      if (event.decisionCycleId !== decisionCycleId) return;
      void refreshTrend();
    });

    const offAnalysis = eventBus.on("analysis.completed", (event) => {
      if (event.decisionCycleId !== decisionCycleId) return;
      void refreshTrend();
    });

    return () => {
      offMetric();
      offIntervention();
      offAnalysis();
    };
  }, [decisionCycleId, eventBus, refreshTrend]);

  const value = useMemo(
    () => ({
      score,
      factors,
      trend,
      loading,
      error,
      refreshTrend,
    }),
    [score, factors, trend, loading, error, refreshTrend]
  );

  return <DsiContext.Provider value={value}>{children}</DsiContext.Provider>;
}

export function useDsi(): DsiContextValue {
  const context = useContext(DsiContext);
  if (!context) {
    throw new Error("useDsi must be used within DsiProvider");
  }
  return context;
}
