"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DecisionCycleReconstruction } from "@/lib/cd-types";
import { useDecisionCycleRealtime } from "@/hooks/useDecisionCycleRealtime";

interface DecisionCycleContextValue {
  decisionCycleId: string;
  data: DecisionCycleReconstruction | null;
  loading: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  refresh: () => Promise<void>;
  realtimeMode: "realtime" | "polling" | "idle";
  realtimeConnected: boolean;
  realtimeLastEventAt: string | null;
}

const DecisionCycleContext = createContext<DecisionCycleContextValue | null>(null);

interface DecisionCycleProviderProps {
  decisionCycleId: string;
  children: React.ReactNode;
}

export function DecisionCycleProvider({
  decisionCycleId,
  children,
}: DecisionCycleProviderProps) {
  const [data, setData] = useState<DecisionCycleReconstruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/v1/decision-cycles/${decisionCycleId}/reconstruct`, {
      cache: "no-store",
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Failed to fetch decision cycle graph");
    }

    setData(payload as DecisionCycleReconstruction);
    setLastSyncedAt(new Date().toISOString());
  }, [decisionCycleId]);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        await refresh();
      } catch (refreshError) {
        if (!cancelled) {
          const message =
            refreshError instanceof Error ? refreshError.message : String(refreshError);
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const realtimeState = useDecisionCycleRealtime({
    decisionCycleId,
    enabled: true,
    onSync: async () => {
      try {
        await refresh();
      } catch (syncError) {
        const message = syncError instanceof Error ? syncError.message : String(syncError);
        setError(message);
      }
    },
  });

  const value = useMemo(
    () => ({
      decisionCycleId,
      data,
      loading,
      error,
      lastSyncedAt,
      refresh,
      realtimeMode: realtimeState.mode,
      realtimeConnected: realtimeState.connected,
      realtimeLastEventAt: realtimeState.lastEventAt,
    }),
    [
      decisionCycleId,
      data,
      loading,
      error,
      lastSyncedAt,
      refresh,
      realtimeState.mode,
      realtimeState.connected,
      realtimeState.lastEventAt,
    ]
  );

  return <DecisionCycleContext.Provider value={value}>{children}</DecisionCycleContext.Provider>;
}

export function useDecisionCycle(): DecisionCycleContextValue {
  const context = useContext(DecisionCycleContext);
  if (!context) {
    throw new Error("useDecisionCycle must be used within DecisionCycleProvider");
  }
  return context;
}
