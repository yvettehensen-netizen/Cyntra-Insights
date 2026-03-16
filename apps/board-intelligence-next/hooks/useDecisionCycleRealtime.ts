"use client";

import { useEffect, useMemo, useState } from "react";
import { getCyntraEventBus } from "@/lib/event-bus";

type RealtimeMode = "realtime" | "polling" | "idle";

interface UseDecisionCycleRealtimeOptions {
  decisionCycleId: string;
  enabled?: boolean;
  pollIntervalMs?: number;
  onSync: () => Promise<void> | void;
}

interface UseDecisionCycleRealtimeResult {
  mode: RealtimeMode;
  connected: boolean;
  lastEventAt: string | null;
}

export function useDecisionCycleRealtime(
  options: UseDecisionCycleRealtimeOptions
): UseDecisionCycleRealtimeResult {
  const enabled = options.enabled ?? true;
  const pollIntervalMs = options.pollIntervalMs ?? 10_000;
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const sync = options.onSync;
    const interval = window.setInterval(() => {
      Promise.resolve(sync()).catch(() => undefined);
    }, pollIntervalMs);

    return () => window.clearInterval(interval);
  }, [enabled, options.onSync, pollIntervalMs]);

  useEffect(() => {
    if (!enabled) return;

    const bus = getCyntraEventBus();
    const sync = options.onSync;
    const cycleId = options.decisionCycleId;
    const unsubscribe = bus.on("cycle.refreshed", (event) => {
      if (event.decisionCycleId !== cycleId) return;
      setLastEventAt(event.createdAt);
      Promise.resolve(sync()).catch(() => undefined);
    });

    return unsubscribe;
  }, [enabled, options.decisionCycleId, options.onSync]);

  return useMemo(
    () => ({
      mode: enabled ? ("polling" as const) : ("idle" as const),
      connected: false,
      lastEventAt,
    }),
    [enabled, lastEventAt]
  );
}
