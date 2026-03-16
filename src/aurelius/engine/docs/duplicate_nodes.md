# Duplicate Node Audit

Measured duplicate basename groups in `src/aurelius/engine`:

| Basename | Files | Canonical runtime target |
| --- | --- | --- |
| ConflictNode | `src/aurelius/engine/nodes/ConflictNode.ts`, `src/aurelius/engine/nodes/power/ConflictNode.ts` | `src/aurelius/engine/nodes/power/ConflictNode.ts` for current active pipeline naming alignment around `OpportunityCostNode` / power layer |
| AureliusSyntheseNode | `src/aurelius/engine/nodes/AureliusSyntheseNode.ts`, `src/aurelius/engine/nodes/power/AureliusSyntheseNode.ts` | no active runtime target; avoid in new code until canonicalized |
| ExpertNode | `src/aurelius/engine/core/contracts/ExpertNode.ts`, `src/aurelius/engine/nodes/ExpertNode.ts` | `src/aurelius/engine/core/contracts/ExpertNode.ts` as type contract in new code |

Policy applied in this consolidation:

- no destructive rename
- no file deletion
- no repo-wide import rewrite outside newly added engine code
- new code uses explicit full-path imports to avoid ambiguous basenames
