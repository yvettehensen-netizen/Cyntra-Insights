import type {
  CaseDatasetRecord,
  InterventionDatasetRecord,
  StrategicDatasetRecord,
} from "@/aurelius/data";
import {
  StrategyQuestionInterpreter,
  type InterpretedStrategyQuestion,
} from "./StrategyQuestionInterpreter";
import {
  StrategyRecommendationEngine,
  type StrategyRecommendation,
} from "./StrategyRecommendationEngine";
import {
  StrategyConversationMemory,
  type StrategyConversation,
} from "./StrategyConversationMemory";

export type StrategyCopilotRequest = {
  vraag: string;
  sector?: string;
  organisatie?: string;
  conversation_id?: string;
  records: StrategicDatasetRecord[];
  cases: CaseDatasetRecord[];
  interventions: InterventionDatasetRecord[];
};

export type StrategyCopilotResponse = {
  conversation_id: string;
  interpreted: InterpretedStrategyQuestion;
  recommendation: StrategyRecommendation;
  conversation: StrategyConversation;
};

export class StrategyCopilotEngine {
  readonly name = "Strategy Copilot Engine";

  constructor(
    private readonly interpreter = new StrategyQuestionInterpreter(),
    private readonly recommender = new StrategyRecommendationEngine(),
    private readonly memory = new StrategyConversationMemory()
  ) {}

  ask(input: StrategyCopilotRequest): StrategyCopilotResponse {
    const conversation = this.memory.ensureConversation(input.conversation_id);

    this.memory.appendTurn(conversation.conversation_id, "ceo", input.vraag);

    const interpreted = this.interpreter.interpret(input.vraag, input.sector);
    const context = this.memory.getRecentContext(conversation.conversation_id, 6);

    const recommendation = this.recommender.recommend({
      interpreted,
      organisatie: input.organisatie,
      records: input.records,
      cases: input.cases,
      interventions: input.interventions,
      conversation_context: context,
    });

    const assistantMessage = [
      recommendation.strategisch_advies,
      `Belangrijkste risico's: ${recommendation.risico_analyse.slice(0, 2).join(" | ")}`,
      `Aanbevolen acties: ${recommendation.interventies.slice(0, 3).join("; ")}`,
    ].join("\n");

    const updated = this.memory.appendTurn(conversation.conversation_id, "copilot", assistantMessage);

    return {
      conversation_id: updated.conversation_id,
      interpreted,
      recommendation,
      conversation: updated,
    };
  }
}
