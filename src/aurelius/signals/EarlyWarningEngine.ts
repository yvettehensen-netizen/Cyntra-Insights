import { deriveKPIThresholds } from "@/aurelius/monitoring/KPITracker";
import { detectStrategyDrift, type StrategyDriftSignal } from "./StrategyDriftDetector";

type SessionLike = Parameters<typeof deriveKPIThresholds>[0];

export type EarlyWarningResult = StrategyDriftSignal;

export class EarlyWarningEngine {
  detect(session: SessionLike): EarlyWarningResult[] {
    const thresholds = deriveKPIThresholds(session);
    return detectStrategyDrift(thresholds);
  }

  buildStrategyAlert(session: SessionLike): string {
    const activeSignal = this.detect(session).find((item) => item.requiresAction);
    if (!activeSignal) {
      return [
        "STRATEGIE ALERT",
        "",
        "Risico",
        "geen directe strategie-afwijking gedetecteerd",
        "",
        "Actie",
        "geen acute actie vereist",
      ].join("\n");
    }
    return activeSignal.alert;
  }
}
