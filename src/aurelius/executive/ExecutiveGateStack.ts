import { validateAnchorGates } from "@/aurelius/executive/gates/AnchorGates";
import { validateAntiGenericGates } from "@/aurelius/executive/gates/AntiGenericGates";
import { validateAntiStagnationGates } from "@/aurelius/executive/gates/AntiStagnationGates";
import { validateCausalityGates } from "@/aurelius/executive/gates/CausalityGates";
import { validateDecisionContractGates } from "@/aurelius/executive/gates/DecisionContractGates";
import { validateDepthGates } from "@/aurelius/executive/gates/DepthGates";
import { validateInterventionGates } from "@/aurelius/executive/gates/InterventionGates";
import { validateStructureGates } from "@/aurelius/executive/gates/StructureGates";
import { validateSystemMechanismGates } from "@/aurelius/executive/gates/SystemMechanismGates";
import { ExecutiveGateError } from "@/aurelius/executive/types";

export function validateExecutiveGateStack(params: {
  text: string;
  context: string;
  lastOutput?: string;
}): void {
  const { text, context, lastOutput } = params;

  try {
    validateStructureGates(text);
    validateAntiGenericGates(text);
    validateSystemMechanismGates(text);
    validateCausalityGates(text);
    validateAnchorGates(text, context);
    validateDepthGates(text, context);
    validateInterventionGates(text, context);
    validateDecisionContractGates(text);
    validateAntiStagnationGates(text, lastOutput);
  } catch (error) {
    if (error instanceof ExecutiveGateError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ExecutiveGateError(error.message, "SEMANTIC_DENSITY_TOO_LOW", {
        cause: error.name,
      });
    }
    throw new ExecutiveGateError("Onbekende gate-fout", "SEMANTIC_DENSITY_TOO_LOW");
  }
}

export { ExecutiveGateError };
