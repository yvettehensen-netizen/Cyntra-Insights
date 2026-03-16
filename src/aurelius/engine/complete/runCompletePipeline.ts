import { validateCompleteArchitecture } from "./architecture";
import type { AureliusNodeOutput, AureliusPipelineState } from "./types";
import { runAureliusEnginePipeline } from "@/aurelius/engine/runAureliusEnginePipeline";

export type RunCompletePipelineInput = {
  inputText: string;
  organizationName?: string;
  sector?: string;
};

export type RunCompletePipelineOutput = {
  state: AureliusPipelineState;
  results: AureliusNodeOutput[];
  validation: ReturnType<typeof validateCompleteArchitecture>;
};

export function runAureliusCompletePipeline(input: RunCompletePipelineInput): RunCompletePipelineOutput {
  const validation = validateCompleteArchitecture();
  const state: AureliusPipelineState = {
    inputText: String(input.inputText ?? ""),
    organizationName: input.organizationName,
    sector: input.sector,
    outputs: {},
    trace: [],
    engineTrace: [],
    warnings: validation.ok ? [] : [...validation.errors],
  };

  const results: AureliusNodeOutput[] = runAureliusEnginePipeline(state);

  return { state, results, validation };
}
