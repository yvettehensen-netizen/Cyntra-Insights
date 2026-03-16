import { DecisionContract, ExecutionStatus } from "./types";
import { evaluateKPI } from "./KPIEvaluator";
import { evaluateGate } from "./GateEvaluator";

export function aggregateExecution(contract: DecisionContract): ExecutionStatus {
  const evaluatedKPIs = contract.kpis.map(evaluateKPI);
  const redKPIcount = evaluatedKPIs.filter((k) => k.status === "red").length;

  const gateStatus = evaluateGate({ ...contract, kpis: evaluatedKPIs });

  let overallStatus: ExecutionStatus["overallStatus"] = "stable";

  if (redKPIcount > 0) {
    overallStatus = "risk";
  } else if (evaluatedKPIs.some((k) => k.status === "orange")) {
    overallStatus = "attention";
  }

  return {
    overallStatus,
    gateStatus,
    redKPIcount,
  };
}
