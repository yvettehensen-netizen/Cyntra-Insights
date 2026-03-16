# Path Anomalies

Measured path anomaly:

- `src/aurelius/engine/nodes/ FinanceNode.ts`

Issue:

- filename has a leading space before `FinanceNode.ts`

Risk:

- fragile imports
- inconsistent tooling behavior
- harder duplicate / usage scanning

Action in this consolidation:

- documented only
- not renamed yet to avoid breaking unknown imports in a mixed legacy tree
