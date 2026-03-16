import { BOARDROOM_INTERVENTION_PIPELINE } from "./architecture";
import { getBoardroomModuleProcessor } from "./registry";
import type {
  BoardroomModuleOutput,
  BoardroomPipelineState,
} from "./types";

export type RunBoardroomPipelineInput = {
  inputText: string;
  organizationName?: string;
  sector?: string;
};

export type RunBoardroomPipelineOutput = {
  state: BoardroomPipelineState;
  results: BoardroomModuleOutput[];
};

export function runBoardroomPipeline(
  input: RunBoardroomPipelineInput
): RunBoardroomPipelineOutput {
  const state: BoardroomPipelineState = {
    inputText: input.inputText,
    organizationName: input.organizationName,
    sector: input.sector,
    outputs: {},
    trace: [],
    warnings: [],
  };
  const results: BoardroomModuleOutput[] = [];

  for (const module of BOARDROOM_INTERVENTION_PIPELINE) {
    const processor = getBoardroomModuleProcessor(module);
    const output = processor(state);
    state.outputs[module] = output;
    state.trace.push(module);
    results.push(output);
  }

  return { state, results };
}

