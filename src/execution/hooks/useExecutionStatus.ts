import { useMemo } from "react";
import { DecisionContract } from "../types";
import { aggregateExecution } from "../ExecutionAggregator";

export function useExecutionStatus(contract: DecisionContract) {
  return useMemo(() => aggregateExecution(contract), [contract]);
}
