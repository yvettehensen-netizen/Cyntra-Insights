export type KPIThreshold = {
  indicator: string;
  norm: string;
  trigger: string;
  currentValue: string;
  action: string;
};

type SessionLike = {
  strategic_metadata?: {
    early_warning_system?: {
      risk_thresholds?: Array<{
        kpi?: string;
        norm?: string;
        kritische_waarde?: string;
      }>;
      warning_indicators?: Array<{
        indicator?: string;
        huidige_waarde?: string;
        actie?: string;
      }>;
    };
  };
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function deriveKPIThresholds(session: SessionLike): KPIThreshold[] {
  const thresholds = session.strategic_metadata?.early_warning_system?.risk_thresholds || [];
  const indicators = session.strategic_metadata?.early_warning_system?.warning_indicators || [];

  return thresholds.slice(0, 5).map((item, index) => {
    const related = indicators[index];
    return {
      indicator: normalize(related?.indicator || item.kpi) || "Onbekende indicator",
      norm: normalize(item.norm) || "Norm ontbreekt",
      trigger: normalize(item.kritische_waarde) || "Trigger ontbreekt",
      currentValue: normalize(related?.huidige_waarde) || "Waarde ontbreekt",
      action: normalize(related?.actie) || "Bestuurlijke escalatie vereist",
    };
  });
}
