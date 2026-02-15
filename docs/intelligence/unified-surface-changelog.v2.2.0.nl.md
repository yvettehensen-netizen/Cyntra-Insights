# Unified Surface Changelog v2.2.0 (2026-02-15)

## Fase A — Verberg de 14 analyses
- Feature flag `ENABLE_UNIFIED_SURFACE=true` is actief; analyse-navigatie, losse analyse-ingangen en `/analysis/*` zijn UI-technisch verborgen of gerouteerd naar `/aurelius/control-surface` zonder enginewijzigingen.

## Fase B — Unified Intelligence Surface
- Nieuwe primaire executive route `/aurelius/control-surface` staat live met exact 5 kernmodules boven de fold voor snelle bestuurlijke interpretatie.

## Fase C — Intelligence aggregatie laag
- `src/cyntra/intelligence/` bevat productieklare aggregatiemodules (`aggregateSignals`, `calculateStrategicHealth`, `riskClustering`, `driftAnalysis`, `governanceResolver`) met getypeerde output.

## Fase D — Drift analytics
- Drift Matrix berekent structurele en uitvoeringsdrift op basis van write coverage, single-call regressies, 422-ratio en governance-maturity, inclusief quadrantclassificatie.

## Fase E — Risk trajectory
- 90-dagen risico-projectie met confidence-band is geïntegreerd en SVG-gerenderd, gevoed door risico-evolutie- en audit-afgeleide signalen.

## Fase F — Governance state
- Governance-resolver levert nu Nederlandse bestuurlijke staten (`Gefragmenteerd`, `Reactief`, `Gecontroleerd`, `Geinstitutionaliseerd`, `Zelfregulerend`) op basis van maturity, consistency en driftquadrant.

## Fase G — Executive decision card
- Bestuurlijke besluitkaart toont dominante these, centrale spanning, irreversibele keuze, vertrouwenspercentage en 30-dagen venster in maximaal 120 woorden.

## Fase H — Board test module
- Route `/aurelius/board-test` is functioneel en schrijft resultaten naar `board_test_results` met de vereiste kolommen en Supabase-insertflow.

## Fase I — UI-principes
- Control Surface volgt een sobere institutionele stijl (z/w basis, whitespace, signaalgestuurde kleur), met focus op data en besluitvorming boven marketing-visuals.

## Fase J — Acceptatiecriteria
- Gates zijn gevalideerd met PASS op `npm run build`, `predeploy:phase-a` en `predeploy:e2e`, zonder regressies op single-call discipline of write coverage checks.
