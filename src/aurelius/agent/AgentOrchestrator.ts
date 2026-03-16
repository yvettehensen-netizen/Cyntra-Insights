import type { AnalysisContext } from "@/aurelius/engine/types";
import {
  CyntraStrategicAgent,
  type CyntraStrategicAgentRunInput,
} from "./CyntraStrategicAgent";
import type { CyntraStrategicAgentOutput } from "./runCyntraStrategicAgent";
import { getAureliusStrategicPipeline } from "@/aurelius/engine/runAureliusEngine";
import { validateCompleteArchitecture } from "@/aurelius/engine/complete";
import { validateBoardroomInterventionArchitecture } from "@/aurelius/engine/boardroom";

export type AgentOrchestratorInput = {
  context: AnalysisContext;
  request_id?: string;
  organisation_id?: string;
  session_id?: string;
  narrative_mode?: CyntraStrategicAgentRunInput["narrativeMode"];
};

export type AgentOrchestratorOutput = {
  metadata: {
    request_id: string;
    organisation_id: string;
    session_id: string;
    executed_at: string;
    pipeline: string[];
  };
  result: CyntraStrategicAgentOutput;
};

function toId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const random = Math.floor(Math.random() * 1_000_000)
    .toString(36)
    .padStart(4, "0");
  return `${prefix}-${stamp}-${random}`;
}

export class AgentOrchestrator {
  readonly name = "Agent Orchestrator";

  constructor(private readonly agent = new CyntraStrategicAgent()) {}

  async run(input: AgentOrchestratorInput): Promise<AgentOrchestratorOutput> {
    const architecture = validateCompleteArchitecture();
    const boardroomArchitecture = validateBoardroomInterventionArchitecture();
    if (!architecture.ok) {
      console.warn("[Aurelius][ArchitectureValidation]", architecture.errors);
    }
    if (!boardroomArchitecture.ok) {
      console.warn("[Aurelius][BoardroomArchitectureValidation]", boardroomArchitecture.errors);
    }
    const result = await this.agent.analyze({
      context: input.context,
      narrativeMode: input.narrative_mode,
    });

    return {
      metadata: {
        request_id: input.request_id ?? toId("req"),
        organisation_id: input.organisation_id ?? "organisatie-onbekend",
        session_id: input.session_id ?? toId("sess"),
        executed_at: new Date().toISOString(),
        pipeline: getAureliusStrategicPipeline(),
      },
      result,
    };
  }
}
