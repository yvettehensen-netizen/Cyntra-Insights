# Aurelius Engine Architecture Audit

Scope: `src/aurelius/engine`

Method: static audit of real `*Node.ts` and `*Engine.ts` files, real pipeline constants, real registry lookups, and real execution loops. No speculative components are included.

## Executive Summary

- Total matched `*Node.ts` / `*Engine.ts` files: `56`
- Active strategic pipeline selected by `runAureliusEngine.ts`: `AURELIUS_COMPLETE_PIPELINE` with `38` nodes
- Active pipeline nodes with dedicated implementation files: `5`
- Active pipeline nodes satisfied only through dynamic registry registration: `33`
- Active pipeline nodes missing from runtime registration: `0`
- Unused engine/node files by repo-wide reference scan: `34`
- Duplicate engine names: `3` groups

Primary source anchors:

- `src/aurelius/engine/runAureliusEngine.ts:1-38`
- `src/aurelius/engine/complete/architecture.ts:9-175`
- `src/aurelius/engine/complete/runCompletePipeline.ts:17-38`
- `src/aurelius/engine/complete/registry.ts:28-89`
- `src/aurelius/engine/boardroom/architecture.ts:9-147`
- `src/aurelius/engine/boardroom/runBoardroomPipeline.ts:19-41`
- `src/aurelius/engine/boardroom/registry.ts:40-242`

## 1. Detected Engines

| Engine name | File path | Category |
| --- | --- | --- |
| AureliusEngine | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/AureliusEngine.ts | orchestrator |
| DecisionExecutionEngine | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/DecisionExecutionEngine.ts | engine |
| ExpertNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/core/contracts/ExpertNode.ts | node |
| cyntraEngine | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/cyntraEngine.ts | orchestrator |
| FinanceNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/ FinanceNode.ts | node |
| AIDataNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/AIDataNode.ts | node |
| AureliusSyntheseNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/AureliusSyntheseNode.ts | node |
| BoardroomIntelligenceNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/BoardroomIntelligenceNode.ts | node |
| ChangeResilienceNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/ChangeResilienceNode.ts | node |
| ConflictNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/ConflictNode.ts | node |
| CultureNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/CultureNode.ts | node |
| DecisionQualityNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/DecisionQualityNode.ts | node |
| ESGNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/ESGNode.ts | node |
| ExpertNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/ExpertNode.ts | node |
| GovernanceNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/GovernanceNode.ts | node |
| GrowthNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/GrowthNode.ts | node |
| LeadershipNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/LeadershipNode.ts | node |
| MarketNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/MarketNode.ts | node |
| MarketingNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/MarketingNode.ts | node |
| NinetyDayNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/NinetyDayNode.ts | node |
| OperationsNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/OperationsNode.ts | node |
| OpportunityNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/OpportunityNode.ts | node |
| ProcessNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/ProcessNode.ts | node |
| RiskNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/RiskNode.ts | node |
| SWOTNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/SWOTNode.ts | node |
| SalesNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/SalesNode.ts | node |
| ScenarioSimulationNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/ScenarioSimulationNode.ts | node |
| StrategyNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/StrategyNode.ts | node |
| UnderstreamNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/UnderstreamNode.ts | node |
| ZorgscanNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/ZorgscanNode.ts | node |
| AureliusSyntheseNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/power/AureliusSyntheseNode.ts | node |
| ConflictNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/power/ConflictNode.ts | node |
| DecisionFinalizerNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/power/DecisionFinalizerNode.ts | node |
| GovernanceIntegrityNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/power/GovernanceIntegrityNode.ts | node |
| OpportunityCostNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/power/OpportunityCostNode.ts | node |
| TradeOffEnforcerNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/power/TradeOffEnforcerNode.ts | node |
| TruthNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/power/TruthNode.ts | node |
| BlindSpotNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/BlindSpotNode.ts | node |
| BoardroomDebateNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/BoardroomDebateNode.ts | node |
| DecisionConsequenceNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/DecisionConsequenceNode.ts | node |
| DecisionPressureEngine | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/DecisionPressureEngine.ts | engine |
| DecisionVelocityNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/DecisionVelocityNode.ts | node |
| KillerInsightNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/KillerInsightNode.ts | node |
| StrategicConflictNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StrategicConflictNode.ts | node |
| StrategicInsightEngine | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StrategicInsightEngine.ts | engine |
| StrategicLeverageNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StrategicLeverageNode.ts | node |
| StrategicMechanismEngine | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StrategicMechanismEngine.ts | engine |
| StrategicMemoryNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StrategicMemoryNode.ts | node |
| Strategy7SNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/Strategy7SNode.ts | node |
| StrategyChallengeNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StrategyChallengeNode.ts | node |
| StrategyCoreNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StrategyCoreNode.ts | node |
| StrategyPESTELNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StrategyPESTELNode.ts | node |
| StrategyPorterNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StrategyPorterNode.ts | node |
| StrategySynthesisNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StrategySynthesisNode.ts | node |
| StructuralSynthesisNode | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/nodes/strategy/StructuralSynthesisNode.ts | node |
| runAureliusEngine | /Users/yvettehensen/Desktop/Cyntra Insights/src/aurelius/engine/runAureliusEngine.ts | orchestrator |

Note: `src/aurelius/engine/nodes/ FinanceNode.ts` contains a leading space in the filename.

## 2. Execution Entrypoints

### 2.1 Primary strategic pipeline selector

File: `src/aurelius/engine/runAureliusEngine.ts:1-38`

- Imports both pipeline arrays:
  - `BOARDROOM_INTERVENTION_PIPELINE`
  - `AURELIUS_COMPLETE_PIPELINE`
- Defines required guard nodes in `REQUIRED_STRATEGIC_NODES`
- Selects the active exported pipeline with:
  - `AURELIUS_COMPLETE_PIPELINE` if all required strategic nodes exist
  - otherwise `BOARDROOM_INTERVENTION_PIPELINE`
- In the current codebase, `AURELIUS_COMPLETE_PIPELINE` wins because it already contains every required node name

### 2.2 Complete pipeline executor

File: `src/aurelius/engine/complete/runCompletePipeline.ts:17-38`

- Pipeline array used: `AURELIUS_COMPLETE_PIPELINE`
- Execution loop:
  - `for (const node of AURELIUS_COMPLETE_PIPELINE as AureliusCompleteNodeId[])`
- Registry lookup:
  - `const processor = getRegisteredNodeProcessor(node)`
- State mutation:
  - writes to `state.outputs[node]`
  - appends to `state.trace`
  - pushes to `results`

### 2.3 Complete pipeline registry

File: `src/aurelius/engine/complete/registry.ts:28-89`

- Registry build:
  - `Object.fromEntries(AURELIUS_COMPLETE_PIPELINE.map((node) => [node, genericProcessor(node)]))`
- Lookup function:
  - `getRegisteredNodeProcessor(node)`
- Important measurement:
  - most complete-pipeline nodes are not backed by dedicated files
  - they are satisfied by `genericProcessor(node)` at runtime

### 2.4 Boardroom pipeline executor

File: `src/aurelius/engine/boardroom/runBoardroomPipeline.ts:19-41`

- Pipeline array used: `BOARDROOM_INTERVENTION_PIPELINE`
- Execution loop:
  - `for (const module of BOARDROOM_INTERVENTION_PIPELINE)`
- Registry lookup:
  - `const processor = getBoardroomModuleProcessor(module)`

### 2.5 Boardroom pipeline registry

File: `src/aurelius/engine/boardroom/registry.ts:1-242`

- Registry build:
  - `Object.fromEntries(BOARDROOM_INTERVENTION_PIPELINE.map((module) => [module, genericProcessor(module)]))`
- Direct dedicated node hooks inside the registry:
  - `runBlindSpotNode`
  - `runDecisionConsequenceNode`
  - `runStrategicLeverageNode`
  - `runStrategicMemoryNode`
  - `runBoardroomDebateNode`

### 2.6 Wrapper orchestrators

- `src/aurelius/engine/AureliusEngine.ts:1-7`
  - exposes `AureliusEngine.run(...)`
  - delegates to `runCyntraStrategicAgent(input)`
- `src/aurelius/engine/cyntraEngine.ts:10-21`
  - separate consultant loop
  - executes `for (const consultant of consultants)`
  - calls `runConsultant(...)`
  - synthesizes with `synthesize(results)`
  - no repo-wide references were found to this file

## 3. Actual Active Pipeline

Measured from `src/aurelius/engine/runAureliusEngine.ts:22-29` and `src/aurelius/engine/complete/architecture.ts:9-92`.

Active pipeline resolution:

1. `runAureliusEngine.ts` checks whether `AURELIUS_COMPLETE_PIPELINE` contains all `REQUIRED_STRATEGIC_NODES`
2. That condition is true in the current repository
3. Therefore the active exported strategic pipeline is the `complete` pipeline, not the boardroom fallback

### 3.1 Pipeline order

| Order | Node name | File implementation | Status |
| --- | --- | --- | --- |
| 1 | ContextEngine | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 2 | CaseClassificationNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 3 | SectorIntelligenceNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 4 | InstitutionalLogicNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 5 | GovernanceModelNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 6 | CultureMechanismNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 7 | IncentiveStructureNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 8 | StructuralForcesNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 9 | SystemActorMappingNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 10 | PowerStructureNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 11 | EconomicEngineNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 12 | StrategicModeNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 13 | StrategicMechanismNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 14 | ConstraintNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 15 | StrategicPatternNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 16 | StrategicConflictNode | `src/aurelius/engine/nodes/strategy/StrategicConflictNode.ts` | IMPLEMENTED |
| 17 | OpportunityCostNode | `src/aurelius/engine/nodes/power/OpportunityCostNode.ts` | IMPLEMENTED |
| 18 | DecisionPressureNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 19 | StrategicLeverageNode | `src/aurelius/engine/nodes/strategy/StrategicLeverageNode.ts` | IMPLEMENTED |
| 20 | SystemTransformationNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 21 | DominantThesisNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 22 | StrategicOptionsNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 23 | TradeOffAnalysisNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 24 | ScenarioSimulationNode | `src/aurelius/engine/nodes/ScenarioSimulationNode.ts` | IMPLEMENTED |
| 25 | BoardDecisionNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 26 | InterventionArchitectureNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 27 | InterventionPrioritizationNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 28 | ExecutionRiskNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 29 | KPIArchitectureNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 30 | DecisionContractNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 31 | NarrativeCompressionNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 32 | BoardMemoNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 33 | InsightGenerationNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 34 | LanguageDisciplineNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 35 | NarrativeGenerator | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 36 | StrategicMemoryNode | `src/aurelius/engine/nodes/strategy/StrategicMemoryNode.ts` | IMPLEMENTED |
| 37 | CaseSimilarityNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |
| 38 | InsightRefinementNode | `src/aurelius/engine/complete/registry.ts` | DYNAMICALLY REGISTERED |

Pipeline existence result:

- `IMPLEMENTED`: `5`
- `DYNAMICALLY REGISTERED`: `33`
- `MISSING`: `0`

## 4. Boardroom Fallback / Secondary Pipeline

Measured from `src/aurelius/engine/boardroom/architecture.ts:9-68`.

Boardroom pipeline order:

1. `ContextIngestionModule`
2. `DataExtractionModule`
3. `SignalDetectionModule`
4. `StakeholderMapModule`
5. `PatternRecognitionModule`
6. `CoreMechanismEngine`
7. `StrategicParadoxEngine`
8. `EcosystemStrategyEngine`
9. `ReplicationLogicEngine`
10. `StrategicThreatEngine`
11. `KillerInsightGenerator`
12. `StrategyOptionGenerator`
13. `TradeOffEngine`
14. `DecisionEngine`
15. `InterventionGenerator`
16. `KPIImpactModel`
17. `ImplementationRoadmap`
18. `RiskMitigationEngine`
19. `BlindSpotDetectorModule`
20. `DecisionConsequenceModule`
21. `StrategicLeverageModule`
22. `StrategicMemoryModule`
23. `BoardroomDebateModule`
24. `BoardMemoGenerator`
25. `BoardroomQuestionEngine`

This pipeline is real and executable through `runBoardroomPipeline(...)`, but it is not the currently selected strategic export while the complete pipeline passes the guardrail.

## 5. Unused Engines

Definition used for this audit: no repo-wide matches outside the file itself for the engine/node identifier under the required patterns of imports, registry registration, or pipeline references.

Unused files:

- `src/aurelius/engine/DecisionExecutionEngine.ts`
- `src/aurelius/engine/cyntraEngine.ts`
- `src/aurelius/engine/nodes/ FinanceNode.ts`
- `src/aurelius/engine/nodes/AIDataNode.ts`
- `src/aurelius/engine/nodes/ChangeResilienceNode.ts`
- `src/aurelius/engine/nodes/CultureNode.ts`
- `src/aurelius/engine/nodes/ESGNode.ts`
- `src/aurelius/engine/nodes/GovernanceNode.ts`
- `src/aurelius/engine/nodes/GrowthNode.ts`
- `src/aurelius/engine/nodes/LeadershipNode.ts`
- `src/aurelius/engine/nodes/MarketNode.ts`
- `src/aurelius/engine/nodes/MarketingNode.ts`
- `src/aurelius/engine/nodes/NinetyDayNode.ts`
- `src/aurelius/engine/nodes/OperationsNode.ts`
- `src/aurelius/engine/nodes/OpportunityNode.ts`
- `src/aurelius/engine/nodes/ProcessNode.ts`
- `src/aurelius/engine/nodes/RiskNode.ts`
- `src/aurelius/engine/nodes/SWOTNode.ts`
- `src/aurelius/engine/nodes/SalesNode.ts`
- `src/aurelius/engine/nodes/StrategyNode.ts`
- `src/aurelius/engine/nodes/UnderstreamNode.ts`
- `src/aurelius/engine/nodes/ZorgscanNode.ts`
- `src/aurelius/engine/nodes/power/DecisionFinalizerNode.ts`
- `src/aurelius/engine/nodes/power/GovernanceIntegrityNode.ts`
- `src/aurelius/engine/nodes/power/TradeOffEnforcerNode.ts`
- `src/aurelius/engine/nodes/power/TruthNode.ts`
- `src/aurelius/engine/nodes/strategy/DecisionVelocityNode.ts`
- `src/aurelius/engine/nodes/strategy/KillerInsightNode.ts`
- `src/aurelius/engine/nodes/strategy/Strategy7SNode.ts`
- `src/aurelius/engine/nodes/strategy/StrategyCoreNode.ts`
- `src/aurelius/engine/nodes/strategy/StrategyPESTELNode.ts`
- `src/aurelius/engine/nodes/strategy/StrategyPorterNode.ts`
- `src/aurelius/engine/nodes/strategy/StrategySynthesisNode.ts`
- `src/aurelius/engine/nodes/strategy/StructuralSynthesisNode.ts`

Unused count: `34`

## 6. Duplicate Engines

Duplicate basename groups:

| Engine name | Files |
| --- | --- |
| AureliusSyntheseNode | `src/aurelius/engine/nodes/AureliusSyntheseNode.ts` and `src/aurelius/engine/nodes/power/AureliusSyntheseNode.ts` |
| ConflictNode | `src/aurelius/engine/nodes/ConflictNode.ts` and `src/aurelius/engine/nodes/power/ConflictNode.ts` |
| ExpertNode | `src/aurelius/engine/core/contracts/ExpertNode.ts` and `src/aurelius/engine/nodes/ExpertNode.ts` |

Duplicate group count: `3`

## 7. Layer Categorization

This grouping is an audit classification by primary runtime role inferred from real path placement and execution usage. Some files could reasonably fit an adjacent layer.

| Layer | Count | Basis |
| --- | --- | --- |
| CORE ENGINE | 6 | root engine orchestrators plus `ExpertNode` contract/runtime shell |
| DOMAIN ANALYSIS | 16 | top-level business/domain node files under `src/aurelius/engine/nodes/` |
| STRATEGY ANALYSIS | 15 | `src/aurelius/engine/nodes/strategy/*` |
| POWER / GOVERNANCE | 10 | `src/aurelius/engine/nodes/power/*` plus top-level governance/conflict/understream nodes |
| SCENARIO SIMULATION | 4 | `ScenarioSimulationNode`, `DecisionQualityNode`, `RiskNode`, `ChangeResilienceNode` |
| DECISION PIPELINE | 3 | synthesis / decision handoff nodes (`AureliusSyntheseNode`, `NinetyDayNode`, `BoardroomIntelligenceNode`) |
| EXECUTION | 1 | `DecisionExecutionEngine.ts` |
| REPORTING | 0 | no `*Node.ts` or `*Engine.ts` files in scope are dedicated report builders |

## 8. Architecture Map

### 8.1 Active strategic path

```text
INPUT
  ↓
runAureliusEngine.ts guardrail selector
  ↓
AURELIUS_COMPLETE_PIPELINE
  ↓
Contextbegrip
  ↓
Organization DNA
  ↓
Systeemanalyse
  ↓
Strategische intelligentie
  ↓
Strategische besluitvorming
  ↓
Interventiearchitectuur
  ↓
Narrative engine
  ↓
Learning
  ↓
runAureliusCompletePipeline()
  ↓
state.outputs + state.trace + results[]
```

### 8.2 Secondary executable path

```text
INPUT
  ↓
runBoardroomPipeline()
  ↓
BOARDROOM_INTERVENTION_PIPELINE
  ↓
Input Intelligence
  ↓
Strategic Analysis
  ↓
Decision Engine
  ↓
Intervention Engine
  ↓
Boardroom Interface
  ↓
boardroom module outputs
```

## 9. Measured Conclusions

- The current exported Aurelius strategic pipeline is the `complete` architecture, not the boardroom architecture.
- The current active pipeline is structurally present and validated for `38` nodes.
- Only `5` active pipeline nodes have dedicated implementation files matching the node name.
- The remaining `33` active pipeline nodes are runtime-generated through `complete/registry.ts`.
- The repository contains a large inactive tail: `34` node/engine files are not referenced by imports, registry wiring, or pipeline constants.
- Duplicate basenames exist in three places and can create naming ambiguity during future wiring work.
- `cyntraEngine.ts` still contains a consultant execution loop, but this file is not referenced anywhere in the current repository.
