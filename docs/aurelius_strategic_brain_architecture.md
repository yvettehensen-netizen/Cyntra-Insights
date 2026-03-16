# Aurelius Strategic Brain Architecture

This layer is additive and does not replace the active `AURELIUS_COMPLETE_PIPELINE`.

## Layers

### Perception Layer

- `ContextEngine`
- `StrategicSignalDetectionNode`
- `OrganizationMechanicsEngine`
- `SystemAnalysisEngine`

### Reasoning Layer

- `StrategicParadoxNode`
- `ParadoxQualityCheckNode`
- `UncomfortableTruthNode`
- `KillerInsightNode`

### Decision Layer

- `StrategicOptionsNode`
- `BoardDecisionNode`

### Boardroom Layer

- `BoardroomRoleDebateNode`
- `StrategicPressureTestNode`

### Narrative Layer

- `StrategicNarrativeNode`

### Board Output Layer

- `BoardDecisionBriefNode`

## Recommended Order

```text
ContextEngine
StrategicSignalDetectionNode
OrganizationMechanicsEngine
SystemAnalysisEngine

StrategicParadoxNode
ParadoxQualityCheckNode
UncomfortableTruthNode
KillerInsightNode

StrategicOptionsNode
BoardDecisionNode

BoardroomRoleDebateNode
StrategicPressureTestNode
StrategicNarrativeNode
BoardDecisionBriefNode
```

## Why This Layer Exists

- `StrategicParadoxNode` identifies the dilemma.
- `StrategicSignalDetectionNode` detects weak signals before they harden into strategic problems.
- `ParadoxQualityCheckNode` prevents generic paradoxes from surviving.
- `UncomfortableTruthNode` names what bestuurders usually avoid saying.
- `KillerInsightNode` creates non-obvious strategic insights.
- `BoardroomRoleDebateNode` simulates the bestuurskamer across CFO, bestuurder and strategisch adviseur.
- `StrategicPressureTestNode` tests where the chosen strategy breaks.
- `StrategicNarrativeNode` converts the analysis stack into one coherent boardroom story.
- `BoardDecisionBriefNode` turns the full analysis into one concrete bestuursdocument.

## Architectural Note

The current production pipeline is still the measured 38-node `AURELIUS_COMPLETE_PIPELINE`.
This strategic brain architecture is a recommended orchestration layer for richer boardroom-quality output without breaking current regression guardrails.

## Orchestrator

Additive orchestrator:

- `src/aurelius/engine/runStrategicBrainArchitecture.ts`

This runner composes the strategic nodes into one boardroom-oriented output object while leaving the current pipeline intact.
