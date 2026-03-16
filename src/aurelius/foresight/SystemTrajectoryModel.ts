export type TrajectoryInput = {
  baseFinancialPressure: number;
  baseCapacityPressure: number;
  interventionEffect: number;
  escalationFactor: number;
};

export type TrajectoryPoint = {
  horizon: "30_dagen" | "90_dagen" | "365_dagen";
  financialPressure: number;
  capacityPressure: number;
  strategicRisk: number;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function buildTrajectory(
  input: TrajectoryInput,
  mode: "status_quo" | "interventie" | "escalatie"
): TrajectoryPoint[] {
  const horizons: Array<{ label: TrajectoryPoint["horizon"]; factor: number }> = [
    { label: "30_dagen", factor: 0.3 },
    { label: "90_dagen", factor: 0.6 },
    { label: "365_dagen", factor: 1 },
  ];

  return horizons.map((h) => {
    const baseF = input.baseFinancialPressure;
    const baseC = input.baseCapacityPressure;
    let financialPressure = baseF;
    let capacityPressure = baseC;

    if (mode === "status_quo") {
      financialPressure = clamp01(baseF + h.factor * 0.15);
      capacityPressure = clamp01(baseC + h.factor * 0.12);
    } else if (mode === "interventie") {
      financialPressure = clamp01(baseF - input.interventionEffect * h.factor);
      capacityPressure = clamp01(baseC - input.interventionEffect * h.factor * 0.8);
    } else {
      financialPressure = clamp01(baseF + input.escalationFactor * h.factor);
      capacityPressure = clamp01(baseC + input.escalationFactor * h.factor * 0.9);
    }

    const strategicRisk = clamp01((financialPressure * 0.55 + capacityPressure * 0.45));
    return {
      horizon: h.label,
      financialPressure,
      capacityPressure,
      strategicRisk,
    };
  });
}
