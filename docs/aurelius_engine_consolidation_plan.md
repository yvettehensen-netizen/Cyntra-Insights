# Aurelius Engine Consolidation Plan

## Current Measured State

- total node / engine files: `56`
- active strategic pipeline: `38` nodes
- dedicated active node files: `5`
- dynamic registry nodes: `33`
- unused files: `34`
- duplicate basename groups: `3`

## Consolidated Engine Pipeline

```text
INPUT
  -> ContextEngine
  -> OrganizationMechanicsEngine
  -> SystemAnalysisEngine
  -> StrategicMechanismEngine
  -> StrategicDecisionEngine
  -> ExecutionEngine
  -> NarrativeEngine
  -> LearningEngine
  -> REPORT
```

## Engine To Node Mapping

### ContextEngine

- `ContextEngine`
- `CaseClassificationNode`
- `SectorIntelligenceNode`

### OrganizationMechanicsEngine

- `InstitutionalLogicNode`
- `GovernanceModelNode`
- `CultureMechanismNode`
- `IncentiveStructureNode`

### SystemAnalysisEngine

- `StructuralForcesNode`
- `SystemActorMappingNode`
- `PowerStructureNode`
- `EconomicEngineNode`

### StrategicMechanismEngine

- `StrategicModeNode`
- `StrategicMechanismNode`
- `ConstraintNode`
- `StrategicPatternNode`
- `StrategicConflictNode`
- `OpportunityCostNode`
- `DecisionPressureNode`
- `StrategicLeverageNode`
- `SystemTransformationNode`

### StrategicDecisionEngine

- `DominantThesisNode`
- `StrategicOptionsNode`
- `TradeOffAnalysisNode`
- `ScenarioSimulationNode`
- `BoardDecisionNode`

### ExecutionEngine

- `InterventionArchitectureNode`
- `InterventionPrioritizationNode`
- `ExecutionRiskNode`
- `KPIArchitectureNode`
- `DecisionContractNode`

### NarrativeEngine

- `NarrativeCompressionNode`
- `BoardMemoNode`
- `InsightGenerationNode`
- `LanguageDisciplineNode`
- `NarrativeGenerator`

### LearningEngine

- `StrategicMemoryNode`
- `CaseSimilarityNode`
- `InsightRefinementNode`

## Compatibility Strategy

- keep `AURELIUS_COMPLETE_PIPELINE` unchanged
- preserve node-level outputs as `AureliusNodeOutput[]`
- keep `state.trace` as ordered node ids
- add `state.engineTrace` for engine-level observability
- keep complete registry intact via shared node runtime
- route `runAureliusCompletePipeline(...)` through the new engine executor

## Legacy Handling

- unused nodes frozen in `src/aurelius/engine/legacy/UNUSED_NODES.md`
- duplicates documented in `src/aurelius/engine/docs/duplicate_nodes.md`
- path anomalies documented in `src/aurelius/engine/docs/path_anomalies.md`

## Risks

- some dedicated node files are richer than the current generic runtime, but are not yet fully wired into the active pipeline
- `OpportunityCostNode` currently exposes async behavior, so full direct adoption requires an async pipeline migration
- `ScenarioSimulationNode` is prompt-builder oriented, not yet a drop-in synchronous node processor
- physical movement of unused files is deferred to avoid unknown import breakage
