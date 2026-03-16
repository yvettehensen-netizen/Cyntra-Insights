import { runAureliusCompleteNode } from "@/aurelius/engine/complete/nodeRuntime";
import type {
  AureliusCompleteNodeId,
  AureliusNodeOutput,
  AureliusPipelineState,
} from "@/aurelius/engine/complete/types";
import { KillerInsightNode } from "@/aurelius/engine/nodes/strategy/KillerInsightNode";
import {
  runParadoxQualityCheckNode,
  type ParadoxQualityCheckNodeOutput,
} from "@/aurelius/engine/nodes/strategy/ParadoxQualityCheckNode";
import {
  runStrategicParadoxNode,
  type StrategicParadoxNodeOutput,
} from "@/aurelius/engine/nodes/strategy/StrategicParadoxNode";
import {
  runUncomfortableTruthNode,
  type UncomfortableTruthNodeOutput,
} from "@/aurelius/engine/nodes/strategy/UncomfortableTruthNode";
import {
  runBoardroomRoleDebateNode,
  type BoardroomRoleDebateNodeOutput,
} from "@/aurelius/engine/nodes/strategy/BoardroomRoleDebateNode";
import {
  runStrategicPressureTestNode,
  type StrategicPressureTestNodeOutput,
} from "@/aurelius/engine/nodes/strategy/StrategicPressureTestNode";
import {
  runStrategicNarrativeNode,
  type StrategicNarrativeNodeOutput,
} from "@/aurelius/engine/nodes/strategy/StrategicNarrativeNode";
import {
  runStrategicMemoryNode,
  type StrategicMemoryNodeOutput,
} from "@/aurelius/engine/nodes/strategy/StrategicMemoryNode";
import {
  runStrategicPatternDetectionNode,
  type StrategicPatternDetectionNodeOutput,
} from "@/aurelius/engine/nodes/strategy/StrategicPatternDetectionNode";
import {
  runStrategicSignalDetectionNode,
  type StrategicSignalDetectionNodeOutput,
} from "@/aurelius/engine/nodes/strategy/StrategicSignalDetectionNode";
import {
  runBoardDecisionBriefNode,
  type BoardDecisionBriefNodeOutput,
} from "@/aurelius/engine/nodes/strategy/BoardDecisionBriefNode";
import { STRATEGIC_BRAIN_LAYERS } from "@/aurelius/engine/strategicBrainArchitecture";
import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

export type StrategicBrainInput = {
  inputText: string;
  organizationName?: string;
  sector?: string;
};

export type StrategicBrainOutput = {
  state: AureliusPipelineState;
  perception: {
    context: AureliusNodeOutput;
    strategicSignals: StrategicSignalDetectionNodeOutput;
    organizationMechanics: AureliusNodeOutput[];
    systemAnalysis: AureliusNodeOutput[];
  };
  reasoning: {
    strategicPattern: StrategicPatternDetectionNodeOutput;
    strategicMemory: StrategicMemoryNodeOutput;
    paradox: StrategicParadoxNodeOutput;
    paradoxQuality: ParadoxQualityCheckNodeOutput;
    uncomfortableTruth: UncomfortableTruthNodeOutput;
    killerInsights: ModelResult;
  };
  decision: {
    options: AureliusNodeOutput;
    boardDecision: AureliusNodeOutput;
  };
  boardroom: {
    debate: BoardroomRoleDebateNodeOutput;
    pressureTest: StrategicPressureTestNodeOutput;
  };
  narrative: StrategicNarrativeNodeOutput;
  boardOutput: {
    decisionBrief: BoardDecisionBriefNodeOutput;
  };
  architecture: typeof STRATEGIC_BRAIN_LAYERS;
};

function createState(input: StrategicBrainInput): AureliusPipelineState {
  return {
    inputText: String(input.inputText ?? ""),
    organizationName: input.organizationName,
    sector: input.sector,
    outputs: {},
    trace: [],
    engineTrace: [],
    warnings: [],
  };
}

function recordNode(
  state: AureliusPipelineState,
  node: AureliusCompleteNodeId
): AureliusNodeOutput {
  const output = runAureliusCompleteNode(node, state);
  state.outputs[node] = output;
  state.trace.push(node);
  return output;
}

function toModelResult(output: AureliusNodeOutput): ModelResult {
  return {
    section: output.node,
    model: output.node,
    content: output.data,
    insights: [output.summary],
    confidence: output.confidence,
  };
}

export function runStrategicBrainArchitecture(input: StrategicBrainInput): StrategicBrainOutput {
  const state = createState(input);

  const context = recordNode(state, "ContextEngine");
  const strategicSignals = runStrategicSignalDetectionNode({
    organizationName: input.organizationName,
    sectorContext: input.sector,
    documents: [input.inputText],
    notes: [context.summary],
    facts: [input.inputText],
  });
  const organizationMechanics = [
    recordNode(state, "InstitutionalLogicNode"),
    recordNode(state, "GovernanceModelNode"),
    recordNode(state, "CultureMechanismNode"),
    recordNode(state, "IncentiveStructureNode"),
  ];
  const systemAnalysis = [
    recordNode(state, "StructuralForcesNode"),
    recordNode(state, "SystemActorMappingNode"),
    recordNode(state, "PowerStructureNode"),
    recordNode(state, "EconomicEngineNode"),
  ];

  const strategicPattern = runStrategicPatternDetectionNode({
    organizationName: input.organizationName,
    sectorContext: input.sector,
    strategyContext: input.inputText,
    facts: [
      input.inputText,
      ...strategicSignals.strategicSignals.map((item) => `${item.signal} — ${item.meaning}`),
      ...organizationMechanics.map((item) => item.summary),
      ...systemAnalysis.map((item) => item.summary),
    ],
  });

  const strategicMemory = runStrategicMemoryNode({
    memoryId: `${input.organizationName || "case"}-${Date.now()}`,
    executiveThesis: input.inputText,
    facts: [
      input.inputText,
      ...strategicSignals.strategicSignals.map((item) => `${item.signal} — ${item.possibleDevelopment}`),
      ...organizationMechanics.map((item) => item.summary),
      ...systemAnalysis.map((item) => item.summary),
    ],
    recommendedChoice: "nog te bepalen",
    sector: input.sector,
    dominantProblem: input.inputText,
    dominantParadox: strategicPattern.strategicPattern.pattern,
    keyRisks: [],
  });

  const paradox = runStrategicParadoxNode({
    organizationName: input.organizationName,
    sectorContext: input.sector,
    strategyContext: [input.inputText, strategicMemory.strategicMemory.similarPatterns].join("\n"),
    marketContext: input.inputText,
    facts: [
      input.inputText,
      ...strategicSignals.strategicSignals.map((item) => item.signal),
      ...organizationMechanics.map((item) => item.summary),
      ...systemAnalysis.map((item) => item.summary),
    ],
  });

  const paradoxQuality = runParadoxQualityCheckNode({
    paradox: paradox.strategicParadox,
    organizationName: input.organizationName,
    sectorContext: input.sector,
    facts: [input.inputText, strategicMemory.strategicMemory.strategicWarning],
  });

  const uncomfortableTruth = runUncomfortableTruthNode({
    organizationName: input.organizationName,
    sectorContext: input.sector,
    strategyContext: paradoxQuality.paradoxQualityCheck.improvedParadox,
    facts: [input.inputText, strategicMemory.strategicMemory.repeatedStrategies],
    strategicChoice: paradoxQuality.paradoxQualityCheck.improvedParadox,
  });

  const killerInsightNode = new KillerInsightNode();
  const analysisContext: AnalysisContext = {
    analysisType: "strategy",
    rawText: input.inputText,
    state: {},
  };
  const killerInsights = killerInsightNode.synthesize(analysisContext, [
    toModelResult(context),
    ...strategicSignals.strategicSignals.map((item) => ({
      section: "StrategicSignalDetectionNode",
      model: "StrategicSignalDetectionNode",
      content: {
        signal: item.signal,
        meaning: item.meaning,
        possibleDevelopment: item.possibleDevelopment,
      },
      insights: [item.signal, item.meaning],
      confidence: 0.72,
    })),
    ...organizationMechanics.map(toModelResult),
    ...systemAnalysis.map(toModelResult),
  ]);

  const options = recordNode(state, "StrategicOptionsNode");
  const boardDecision = recordNode(state, "BoardDecisionNode");

  const enrichedStrategicMemory = runStrategicMemoryNode({
    memoryId: strategicMemory.storedPattern.memoryId,
    executiveThesis: input.inputText,
    facts: [
      input.inputText,
      ...strategicSignals.strategicSignals.map((item) => `${item.signal} — ${item.meaning}`),
      ...organizationMechanics.map((item) => item.summary),
      ...systemAnalysis.map((item) => item.summary),
    ],
    strategicOptions:
      Array.isArray(options.data.options) ? options.data.options.map((value) => String(value)) : [options.summary],
    recommendedChoice: boardDecision.summary,
    interventions: (killerInsights.insights ?? []).slice(0, 3),
    sector: input.sector,
    dominantProblem: input.inputText,
    dominantParadox:
      paradoxQuality.paradoxQualityCheck.score < 4
        ? paradoxQuality.paradoxQualityCheck.improvedParadox
        : paradox.strategicParadox.paradox,
    keyRisks: killerInsights.risks ?? [],
  });

  const debate = runBoardroomRoleDebateNode({
    organizationName: input.organizationName,
    recommendedChoice: boardDecision.summary,
    sectorContext: input.sector,
    strategicParadox: paradoxQuality.paradoxQualityCheck.score < 4
      ? paradoxQuality.paradoxQualityCheck.improvedParadox
      : paradox.strategicParadox.paradox,
    pressurePoints: [
      uncomfortableTruth.uncomfortableTruth,
      ...(killerInsights.insights ?? []).slice(0, 2),
    ],
  });

  const pressureTest = runStrategicPressureTestNode({
    organizationName: input.organizationName,
    recommendedChoice: boardDecision.summary,
    sectorContext: input.sector,
    strategicParadox: paradox.strategicParadox.paradox,
    facts: [input.inputText, ...systemAnalysis.map((item) => item.summary)],
    risks: killerInsights.risks ?? [],
  });

  const narrative = runStrategicNarrativeNode({
    organizationName: input.organizationName,
    sector: input.sector,
    strategicParadox:
      paradoxQuality.paradoxQualityCheck.score < 4
        ? paradoxQuality.paradoxQualityCheck.improvedParadox
        : paradox.strategicParadox.paradox,
    breakthroughInsights: killerInsights.insights ?? [],
    strategicOptions:
      Array.isArray(options.data.options) ? options.data.options.map((value) => String(value)) : [options.summary],
    recommendedChoice: boardDecision.summary,
    pressureTest: pressureTest.pressureTest,
  });

  const decisionBrief = runBoardDecisionBriefNode({
    organizationName: input.organizationName,
    sector: input.sector,
    coreProblem:
      paradoxQuality.paradoxQualityCheck.score < 4
        ? paradoxQuality.paradoxQualityCheck.improvedParadox
        : paradox.strategicParadox.paradox,
    strategicChoice: boardDecision.summary,
    whyChoice: [
      ...strategicSignals.strategicSignals.map((item) => item.meaning),
      ...organizationMechanics.map((item) => item.summary),
      ...systemAnalysis.map((item) => item.summary),
    ].slice(0, 3),
    majorRisk: pressureTest.pressureTest[0]?.breakpoint || uncomfortableTruth.uncomfortableTruth,
    boardAction: pressureTest.pressureTest[0]?.recoveryAction || narrative.strategicNarrative.boardTask,
    narrative: narrative.strategicNarrative.boardTask,
    pressureTest: pressureTest.pressureTest,
  });

  return {
    state,
    perception: {
      context,
      strategicSignals,
      organizationMechanics,
      systemAnalysis,
    },
    reasoning: {
      strategicMemory: enrichedStrategicMemory,
      strategicPattern,
      paradox,
      paradoxQuality,
      uncomfortableTruth,
      killerInsights,
    },
    decision: {
      options,
      boardDecision,
    },
    boardroom: {
      debate,
      pressureTest,
    },
    narrative,
    boardOutput: {
      decisionBrief,
    },
    architecture: STRATEGIC_BRAIN_LAYERS,
  };
}
