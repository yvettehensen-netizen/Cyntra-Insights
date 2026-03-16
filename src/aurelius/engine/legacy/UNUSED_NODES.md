# Unused Nodes

Measured as having no repo-wide import, registry, or pipeline references outside the file itself at audit time.

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

Safety note:

- files were not physically moved in this pass
- this repo has an add-only preference and unknown legacy imports
- this file is the freeze point for a later safe migration into `legacy/`
