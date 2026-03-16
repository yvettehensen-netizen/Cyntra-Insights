import { DecisionContract } from "./types";

export function evaluateGate(contract: DecisionContract): "on-track" | "gate-risk" {
  const redKPIs = contract.kpis.filter((k) => k.status === "red");

  if (redKPIs.length > 0) {
    return "gate-risk";
  }

  return "on-track";
}
