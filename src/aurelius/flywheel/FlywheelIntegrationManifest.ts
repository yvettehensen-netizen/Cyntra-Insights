import {
  StrategicLearningLoop,
  type StrategicLearningLoopInput,
  type StrategicLearningLoopResult,
} from "./StrategicLearningLoop";
import { buildStrategicAgentLearningContext } from "./StrategicAgentFlywheelAdapter";
import { appendHistoricalLearningSection } from "./HistoricalLearningNarrative";
import {
  FlywheelEnhancedSimulationEngine,
  buildLeverageLearningHints,
  buildPatternLearningPayload,
} from "./EngineLearningAdapters";
import { buildSlotLockedDocumentV4 } from "./SlotLockV4Adapter";

export type FlywheelRunOutput = {
  learning_cycle: StrategicLearningLoopResult;
  agent_learning_context: ReturnType<typeof buildStrategicAgentLearningContext>;
  simulation_learning: {
    pattern_payload: ReturnType<typeof buildPatternLearningPayload>;
    leverage_hints: string[];
  };
  enriched_board_report: string;
};

export class FlywheelIntegrationManifest {
  readonly name = "Strategic Case Flywheel Integration Manifest";

  constructor(
    private readonly learningLoop = new StrategicLearningLoop(),
    private readonly simulationEngine = new FlywheelEnhancedSimulationEngine()
  ) {}

  run(input: StrategicLearningLoopInput): FlywheelRunOutput {
    const learningCycle = this.learningLoop.run(input);
    const agentLearningContext = buildStrategicAgentLearningContext({
      sector: learningCycle.strategic_case.sector,
      dominant_problem: learningCycle.strategic_case.dominant_problem,
      topK: 5,
    });

    const enrichedBoardReportDraft = appendHistoricalLearningSection(input.board_report, {
      vergelijkbare_cases: agentLearningContext.vergelijkbare_cases.map(
        (item) => `CASE ${item.case_id} | ${item.dominant_problem}`
      ),
      historische_interventies: learningCycle.interventions.map(
        (item) => `${item.interventie_type}: ${item.beschrijving}`
      ),
      interventieresultaten: learningCycle.outcomes.map(
        (item) => `${item.intervention_id}: ${item.implementatie_succes} (${item.financieel_effect})`
      ),
    });
    const enrichedBoardReport = buildSlotLockedDocumentV4({
      strategic_case: learningCycle.strategic_case,
      interventions: learningCycle.interventions,
      outcomes: learningCycle.outcomes,
      historical_learning_section: agentLearningContext.historical_learning_section,
      source_report: enrichedBoardReportDraft,
    });

    return {
      learning_cycle: learningCycle,
      agent_learning_context: agentLearningContext,
      simulation_learning: {
        pattern_payload: buildPatternLearningPayload(this.learningLoop, learningCycle.strategic_case.sector),
        leverage_hints: buildLeverageLearningHints(this.learningLoop, learningCycle.strategic_case.sector),
      },
      enriched_board_report: enrichedBoardReport,
    };
  }

  getSimulationEngine(): FlywheelEnhancedSimulationEngine {
    return this.simulationEngine;
  }
}
