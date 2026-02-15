# Governance Control Layer Changelog v2.3.0 (2026-02-15)

## Fase A — Governance Status Layer
- `GovernanceStatusLayer` is toegevoegd bovenaan de Unified Surface met geaggregeerde statusweergave, signaalsamenvatting (max 2 regels) en laatste update-timestamp in institutionele zwart/wit-stijl.

## Fase B — Board Adoption & Legitimiteitsindex herpositionering
- Terminologie is hernoemd van Board Evaluation naar Board Adoption & Legitimiteitsindex in navigatie, UI-headers en PDF-output, met behoud van backward-compatible types.

## Fase C — Governance Control Engine
- Nieuwe module `src/cyntra/governance-control/` levert `GovernanceControlOutput` via geaggregeerde besluitlogica op basis van SRI, risk acceleration, governance decay, drift quadrant, decision strength en board-index.

## Fase D — Unified Surface integratie
- `UnifiedSurface` consumeert `governance_control` uit aggregatie en rendert de governance-statuslaag als eerste blok voor directe bestuurlijke interpretatie binnen 5 seconden.

## Fase E — Acceptatiecriteria
- Gates zijn gevalideerd met PASS op `npm run build`, `npm run predeploy:invariants` en `npm run predeploy:e2e`, zonder extra LLM-calls, multi-call regressies of repair-loop markers.
