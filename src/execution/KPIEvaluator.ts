import { KPI } from "./types";

export function evaluateKPI(kpi: KPI): KPI {
  const deviation = Math.abs(kpi.currentValue - kpi.targetValue);

  if (deviation <= kpi.threshold) {
    return { ...kpi, status: "green" };
  }

  if (deviation <= kpi.threshold * 2) {
    return { ...kpi, status: "orange" };
  }

  return { ...kpi, status: "red" };
}
