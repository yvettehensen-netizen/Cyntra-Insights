import type { AnalysisContext } from "@/aurelius/engine/types";
import {
  runCyntraStrategicAgent,
  type CyntraStrategicAgentInput,
  type CyntraStrategicAgentOutput,
} from "./runCyntraStrategicAgent";

export type CyntraStrategicAgentRunInput = {
  context: AnalysisContext;
  narrativeMode?: CyntraStrategicAgentInput["narrativeMode"];
  boardroomInput?: CyntraStrategicAgentInput["boardroomInput"];
};

export class CyntraStrategicAgent {
  readonly name = "Cyntra Strategic Agent";

  async analyze(input: CyntraStrategicAgentRunInput): Promise<CyntraStrategicAgentOutput> {
    return runCyntraStrategicAgent({
      context: input.context,
      narrativeMode: input.narrativeMode,
      boardroomInput: input.boardroomInput,
    });
  }
}

