# Aurelius Pipeline Map

Active strategic pipeline source: `src/aurelius/engine/runAureliusEngine.ts`

Resolved active pipeline: `AURELIUS_COMPLETE_PIPELINE`

Implementation type legend:

- `DEDICATED_FILE`
- `DYNAMIC_REGISTRY`
- `UNUSED_FILE`

| Node | Order | Dependencies | Implementation type |
| --- | ---: | --- | --- |
| ContextEngine | 1 | - | DYNAMIC_REGISTRY |
| CaseClassificationNode | 2 | ContextEngine | DYNAMIC_REGISTRY |
| SectorIntelligenceNode | 3 | ContextEngine | DYNAMIC_REGISTRY |
| InstitutionalLogicNode | 4 | CaseClassificationNode | DYNAMIC_REGISTRY |
| GovernanceModelNode | 5 | InstitutionalLogicNode | DYNAMIC_REGISTRY |
| CultureMechanismNode | 6 | InstitutionalLogicNode | DYNAMIC_REGISTRY |
| IncentiveStructureNode | 7 | CultureMechanismNode | DYNAMIC_REGISTRY |
| StructuralForcesNode | 8 | SectorIntelligenceNode | DYNAMIC_REGISTRY |
| SystemActorMappingNode | 9 | StructuralForcesNode | DYNAMIC_REGISTRY |
| PowerStructureNode | 10 | SystemActorMappingNode | DYNAMIC_REGISTRY |
| EconomicEngineNode | 11 | StructuralForcesNode | DYNAMIC_REGISTRY |
| StrategicModeNode | 12 | EconomicEngineNode | DYNAMIC_REGISTRY |
| StrategicMechanismNode | 13 | SystemActorMappingNode, IncentiveStructureNode, EconomicEngineNode | DYNAMIC_REGISTRY |
| ConstraintNode | 14 | StrategicMechanismNode | DYNAMIC_REGISTRY |
| StrategicPatternNode | 15 | StrategicMechanismNode | DYNAMIC_REGISTRY |
| StrategicConflictNode | 16 | StrategicPatternNode, ConstraintNode | DEDICATED_FILE |
| OpportunityCostNode | 17 | StrategicConflictNode | DEDICATED_FILE |
| DecisionPressureNode | 18 | OpportunityCostNode | DYNAMIC_REGISTRY |
| StrategicLeverageNode | 19 | StrategicConflictNode, StrategicMechanismNode | DEDICATED_FILE |
| SystemTransformationNode | 20 | StrategicLeverageNode, PowerStructureNode | DYNAMIC_REGISTRY |
| DominantThesisNode | 21 | StrategicConflictNode, SystemTransformationNode | DYNAMIC_REGISTRY |
| StrategicOptionsNode | 22 | DominantThesisNode | DYNAMIC_REGISTRY |
| TradeOffAnalysisNode | 23 | StrategicOptionsNode | DYNAMIC_REGISTRY |
| ScenarioSimulationNode | 24 | TradeOffAnalysisNode | DEDICATED_FILE |
| BoardDecisionNode | 25 | ScenarioSimulationNode, DecisionPressureNode | DYNAMIC_REGISTRY |
| InterventionArchitectureNode | 26 | BoardDecisionNode, StrategicLeverageNode | DYNAMIC_REGISTRY |
| InterventionPrioritizationNode | 27 | InterventionArchitectureNode | DYNAMIC_REGISTRY |
| ExecutionRiskNode | 28 | InterventionPrioritizationNode | DYNAMIC_REGISTRY |
| KPIArchitectureNode | 29 | InterventionPrioritizationNode | DYNAMIC_REGISTRY |
| DecisionContractNode | 30 | BoardDecisionNode, KPIArchitectureNode | DYNAMIC_REGISTRY |
| NarrativeCompressionNode | 31 | DecisionContractNode | DYNAMIC_REGISTRY |
| BoardMemoNode | 32 | NarrativeCompressionNode | DYNAMIC_REGISTRY |
| InsightGenerationNode | 33 | BoardMemoNode | DYNAMIC_REGISTRY |
| LanguageDisciplineNode | 34 | InsightGenerationNode | DYNAMIC_REGISTRY |
| NarrativeGenerator | 35 | LanguageDisciplineNode | DYNAMIC_REGISTRY |
| StrategicMemoryNode | 36 | NarrativeGenerator | DEDICATED_FILE |
| CaseSimilarityNode | 37 | StrategicMemoryNode | DYNAMIC_REGISTRY |
| InsightRefinementNode | 38 | CaseSimilarityNode | DYNAMIC_REGISTRY |
