import { runExecutiveGateStack } from "@/aurelius/narrative/gates/executiveGateStack";

export function validateNarrativeV2(input: {
  narrativeText: string;
  context: string;
  previousOutput?: string;
}): ReturnType<typeof runExecutiveGateStack> {
  return runExecutiveGateStack({
    narrativeText: input.narrativeText,
    context: input.context,
    previousOutput: input.previousOutput,
  });
}
