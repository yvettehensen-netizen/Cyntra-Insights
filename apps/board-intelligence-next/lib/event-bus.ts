export type CyntraEventType =
  | "analysis.status.changed"
  | "analysis.completed"
  | "intervention.changed"
  | "audit.appended"
  | "governance.metric.updated"
  | "dsi.recalculated"
  | "cycle.refreshed";

export interface CyntraEvent<T = unknown> {
  type: CyntraEventType;
  decisionCycleId: string;
  payload: T;
  createdAt: string;
}

type EventHandler<T = unknown> = (event: CyntraEvent<T>) => void;

export class CyntraEventBus {
  private target = new EventTarget();

  emit<T>(type: CyntraEventType, decisionCycleId: string, payload: T): void {
    const event: CyntraEvent<T> = {
      type,
      decisionCycleId,
      payload,
      createdAt: new Date().toISOString(),
    };

    this.target.dispatchEvent(new CustomEvent(type, { detail: event }));
  }

  on<T>(type: CyntraEventType, handler: EventHandler<T>): () => void {
    const listener = (raw: Event) => {
      const event = raw as CustomEvent<CyntraEvent<T>>;
      handler(event.detail);
    };

    this.target.addEventListener(type, listener as EventListener);
    return () => this.target.removeEventListener(type, listener as EventListener);
  }
}

let singleton: CyntraEventBus | null = null;

export function getCyntraEventBus(): CyntraEventBus {
  if (!singleton) singleton = new CyntraEventBus();
  return singleton;
}
