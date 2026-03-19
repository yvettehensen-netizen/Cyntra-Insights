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
import {
  runTensionEngineNode,
  type TensionEngineNodeOutput,
} from "@/aurelius/engine/nodes/strategy/TensionEngineNode";
import {
  runScenarioEngineNode,
  type ScenarioEngineNodeOutput,
} from "@/aurelius/engine/nodes/strategy/ScenarioEngineNode";
import {
  runDecisionEngineNode,
  type DecisionEngineNodeOutput,
} from "@/aurelius/engine/nodes/strategy/DecisionEngineNode";
import {
  runGovernanceEngineNode,
  type GovernanceEngineNodeOutput,
} from "@/aurelius/engine/nodes/governance/GovernanceEngineNode";
import {
  runInstitutionalMemoryNode,
  type InstitutionalMemoryNodeOutput,
} from "@/aurelius/engine/nodes/memory/InstitutionalMemoryNode";
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
    institutionalMemory: InstitutionalMemoryNodeOutput;
    tension: TensionEngineNodeOutput;
    paradox: StrategicParadoxNodeOutput;
    paradoxQuality: ParadoxQualityCheckNodeOutput;
    uncomfortableTruth: UncomfortableTruthNodeOutput;
    killerInsights: ModelResult;
  };
  decision: {
    scenarios: ScenarioEngineNodeOutput;
    decisionEngine: DecisionEngineNodeOutput;
    governance: GovernanceEngineNodeOutput;
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

  const tension = runTensionEngineNode({
    organizationName: input.organizationName,
    sector: input.sector,
    sourceText: input.inputText,
    strategicSignals: strategicSignals.strategicSignals.map((item) => `${item.signal} — ${item.meaning}`),
    organizationMechanics: organizationMechanics.map((item) => item.summary),
    systemAnalysis: systemAnalysis.map((item) => item.summary),
    strategicPattern: strategicPattern.strategicPattern.pattern,
    historicalSignals: [
      strategicMemory.strategicMemory.similarPatterns,
      strategicMemory.strategicMemory.repeatedStrategies,
      strategicMemory.strategicMemory.strategicWarning,
    ],
  });

  const scenarios = runScenarioEngineNode({
    sector: input.sector,
    sourceText: input.inputText,
    structuralTension: tension.structuralTension,
    coreProblem: tension.coreProblem,
    detectedPatterns: tension.detectedPatterns,
  });

  const decisionEngine = runDecisionEngineNode({
    sourceText: input.inputText,
    structuralTension: tension.structuralTension,
    mechanism: tension.mechanism,
    scenarios: scenarios.scenarios,
    detectedPatterns: tension.detectedPatterns,
  });

  const governance = runGovernanceEngineNode({
    sector: input.sector,
    sourceText: input.inputText,
    recommendedScenario: decisionEngine.recommendedScenario,
    recommendedDecision: decisionEngine.recommendedDecision,
    structuralTension: tension.structuralTension,
    detectedPatterns: tension.detectedPatterns,
  });

  const institutionalMemory = runInstitutionalMemoryNode({
    organizationName: input.organizationName,
    sector: input.sector,
    coreProblem: tension.coreProblem,
    strategicTension: tension.structuralTension,
    recommendedDecision: decisionEngine.recommendedDecision,
    detectedPatterns: tension.detectedPatterns,
  });

  const paradox = runStrategicParadoxNode({
    organizationName: input.organizationName,
    sectorContext: input.sector,
    strategyContext: [
      input.inputText,
      tension.structuralTension,
      tension.mechanism,
      institutionalMemory.summary,
      strategicMemory.strategicMemory.similarPatterns,
    ].join("\n"),
    marketContext: input.inputText,
    facts: [
      input.inputText,
      tension.coreProblem,
      tension.decisionFocus,
      ...strategicSignals.strategicSignals.map((item) => item.signal),
      ...organizationMechanics.map((item) => item.summary),
      ...systemAnalysis.map((item) => item.summary),
    ],
  });

  const paradoxQuality = runParadoxQualityCheckNode({
    paradox: paradox.strategicParadox,
    organizationName: input.organizationName,
    sectorContext: input.sector,
    facts: [input.inputText, tension.structuralTension, strategicMemory.strategicMemory.strategicWarning],
  });

  const uncomfortableTruth = runUncomfortableTruthNode({
    organizationName: input.organizationName,
    sectorContext: input.sector,
    strategyContext: [paradoxQuality.paradoxQualityCheck.improvedParadox, tension.mechanism].join("\n"),
    facts: [input.inputText, strategicMemory.strategicMemory.repeatedStrategies, institutionalMemory.summary],
    strategicChoice: decisionEngine.recommendedDecision,
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
    {
      section: "TensionEngineNode",
      model: "TensionEngineNode",
      content: {
        coreProblem: tension.coreProblem,
        structuralTension: tension.structuralTension,
        mechanism: tension.mechanism,
      },
      insights: [tension.coreProblem, tension.structuralTension, tension.mechanism],
      confidence: tension.confidence,
    },
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
    strategicOptions: scenarios.scenarios.map((item) => `${item.code}. ${item.title}`),
    recommendedChoice: decisionEngine.recommendedDecision,
    interventions: governance.executionActions.map((item) => item.action),
    sector: input.sector,
    dominantProblem: tension.coreProblem,
    dominantParadox:
      paradoxQuality.paradoxQualityCheck.score < 4
        ? paradoxQuality.paradoxQualityCheck.improvedParadox
        : paradox.strategicParadox.paradox,
    keyRisks: governance.earlySignals,
  });

  const debate = runBoardroomRoleDebateNode({
    organizationName: input.organizationName,
    recommendedChoice: decisionEngine.recommendedDecision,
    sectorContext: input.sector,
    strategicParadox: paradoxQuality.paradoxQualityCheck.score < 4
      ? paradoxQuality.paradoxQualityCheck.improvedParadox
      : paradox.strategicParadox.paradox,
    pressurePoints: [
      uncomfortableTruth.uncomfortableTruth,
      tension.decisionFocus,
      ...(killerInsights.insights ?? []).slice(0, 2),
    ],
  });

  const pressureTest = runStrategicPressureTestNode({
    organizationName: input.organizationName,
    recommendedChoice: decisionEngine.recommendedDecision,
    sectorContext: input.sector,
    strategicParadox: tension.structuralTension,
    facts: [
      input.inputText,
      tension.mechanism,
      ...governance.earlySignals,
      ...systemAnalysis.map((item) => item.summary),
    ],
    risks: governance.stopRules,
  });

  const narrative = runStrategicNarrativeNode({
    organizationName: input.organizationName,
    sector: input.sector,
    strategicParadox:
      paradoxQuality.paradoxQualityCheck.score < 4
        ? paradoxQuality.paradoxQualityCheck.improvedParadox
        : paradox.strategicParadox.paradox,
    breakthroughInsights: [
      tension.coreProblem,
      tension.mechanism,
      ...decisionEngine.whyItDominates,
      ...(killerInsights.insights ?? []),
    ],
    strategicOptions: scenarios.scenarios.map((item) => `${item.code}. ${item.title}`),
    recommendedChoice: decisionEngine.recommendedDecision,
    pressureTest: pressureTest.pressureTest,
  });

  const decisionBrief = runBoardDecisionBriefNode({
    organizationName: input.organizationName,
    sector: input.sector,
    coreProblem: tension.coreProblem,
    strategicChoice: decisionEngine.recommendedDecision,
    whyChoice: decisionEngine.whyItDominates,
    majorRisk: pressureTest.pressureTest[0]?.breakpoint || uncomfortableTruth.uncomfortableTruth,
    boardAction: governance.executionActions[0]?.action || pressureTest.pressureTest[0]?.recoveryAction || narrative.strategicNarrative.boardTask,
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
      institutionalMemory,
      strategicPattern,
      tension,
      paradox,
      paradoxQuality,
      uncomfortableTruth,
      killerInsights,
    },
    decision: {
      scenarios,
      decisionEngine,
      governance,
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
