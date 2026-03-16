"use client";

import { createContext, useContext, useMemo } from "react";
import { CyntraEventBus, getCyntraEventBus } from "@/lib/event-bus";

const EventBusContext = createContext<CyntraEventBus | null>(null);

export function EventBusProvider({ children }: { children: React.ReactNode }) {
  const bus = useMemo(() => getCyntraEventBus(), []);
  return <EventBusContext.Provider value={bus}>{children}</EventBusContext.Provider>;
}

export function useEventBus(): CyntraEventBus {
  const context = useContext(EventBusContext);
  if (!context) {
    throw new Error("useEventBus must be used within EventBusProvider");
  }
  return context;
}
