import { AURELIUS_ENGINE_PIPELINE, engineRegistry } from "@/aurelius/engine/engineRegistry";
import type {
  AureliusNodeOutput,
  AureliusPipelineState,
} from "@/aurelius/engine/complete/types";

export function runAureliusEnginePipeline(state: AureliusPipelineState): AureliusNodeOutput[] {
  const results: AureliusNodeOutput[] = [];

  for (const step of AURELIUS_ENGINE_PIPELINE) {
    const runner = engineRegistry[step.engine];
    const outputs = runner.runEngine({ engine: step.engine, nodes: step.nodes }, state);

    for (const output of outputs) {
      state.outputs[output.node] = output;
      state.trace.push(output.node);
      results.push(output);
    }

    state.engineTrace.push({
      engine: step.engine,
      timestamp: Date.now(),
      nodesExecuted: outputs.map((output) => output.node),
    });
  }

  return results;
}
