# Performance Dominantie Changelog v2.4.0 (2026-02-15)

## Fase A — DSI als hero-metric
- Decision Strength Index (DSI) is als primaire performance-indicator geïntegreerd en wordt bovenaan de Unified Surface getoond met huidige score, trends en verbetering ten opzichte van baseline.

## Fase B — 90-dagen performance traject
- Baseline-opslag en trajectmeting zijn toegevoegd met `organisation_performance_baseline` en dagelijkse snapshots, inclusief SVG-visualisatie voor 30/60/90 dagen.

## Fase C — Performance-programma
- `src/cyntra/performance-program/` levert een afdwingbaar 90-dagen interventieplan, mijlpaaltracking en evaluatie van executielift met maximaal één actieve interventie.

## Fase D — Commercieel tractie-instrument
- Data-gedreven case study generator en benchmarklaag zijn toegevoegd om gemiddelde DSI-verbetering, top-25%, mediaan en stagnatiepercentage reproduceerbaar te tonen.

## Fase E — UI-positionering
- Bovenste laag van de Unified Surface is herpositioneerd naar Performance Acceleration; governance blijft beschikbaar maar volgt onder performance.

## Fase F — Acceptatiecriteria
- Gevalideerd met `npm run build`, `npm run predeploy:invariants` en `npm run predeploy:e2e`, zonder extra LLM-calls, multi-call regressies of repair-loop markers.
