# Release Boardroom Checklist

Gebruik deze checklist als harde acceptatiegate voor boardroom rendering, PDF-export en downloadstabiliteit.

## Architecture

- [ ] `BoardroomDocument` is nog steeds de enige bron voor boardroom rendering.
- [ ] De flow is expliciet: `BoardroomDocument -> MemoFormatter -> RuleRewriteLayer -> AIRewriteLayer -> SectorStyleLayer -> UI/PDF`.
- [ ] Er zijn geen parallelle rendering paths meer voor boardroom output.
- [ ] UI en PDF doen geen eigen interpretatie van ruwe rapporttekst.

## Scope Discipline

- [ ] Engine logic is niet aangepast zonder bewezen noodzaak.
- [ ] Upstream data models zijn behouden.
- [ ] Cleanup bleef beperkt tot formatting, presentation, rendering en export.
- [ ] Er zijn geen brede deletions gedaan buiten de renderstack.

## Content Integrity

- [ ] Truncaties zoals `markeer u` en `consortium of re` komen nergens meer door.
- [ ] Broken endings worden gedetecteerd of verwijderd.
- [ ] Kapotte content veroorzaakt een harde failure, geen stille render.
- [ ] Geen dubbele of betekenisloze fragmenten in eindoutput.

## Memo Formatter

- [ ] Vaste structuur is altijd aanwezig.
- [ ] `Executive` is aanwezig.
- [ ] `Problem` is aanwezig.
- [ ] `Decision` is aanwezig.
- [ ] `Why` is aanwezig.
- [ ] `Risk` is aanwezig.
- [ ] `Scenarios` is aanwezig.
- [ ] `Mechanism` is aanwezig.
- [ ] `StopRules` is aanwezig.
- [ ] `Actions` is aanwezig.
- [ ] `Question` is aanwezig.
- [ ] Geen herhaling tussen aangrenzende secties.
- [ ] Geen lange analyseblokken of AI-dumps.
- [ ] Scenario’s zijn beperkt tot A/B/C.

## Rule Rewrite Layer

- [ ] Besluitregel volgt altijd hetzelfde patroon.
- [ ] Zinnen zijn kort genoeg.
- [ ] Bullets zijn kort genoeg.
- [ ] Vage taal is verwijderd.
- [ ] Rewrite verandert betekenis niet.

## AI Rewrite Layer

- [ ] Alleen actief als veilig en schema-stabiel.
- [ ] Fallback naar rule-based output bestaat.
- [ ] JSON-structuur blijft exact gelijk.
- [ ] Geen extra inzichten of betekenisverandering.

## Sector Style Layer

- [ ] Sectorstijl wordt deterministisch gekozen.
- [ ] Structuur blijft identiek per sector.
- [ ] Alleen woordkeuze verandert.
- [ ] Geen verzonnen sectorkennis.

## UI Quality

- [ ] Boardroom UI voelt als document, niet als dashboard.
- [ ] Max breedte en witruimte zijn consistent.
- [ ] Geen cards, borders of shadows in de memo-flow.
- [ ] Typografie is rustig en goed leesbaar.
- [ ] Besluit is visueel dominant.
- [ ] Sectievolgorde is vast.

## PDF Quality

- [ ] PDF gebruikt exact dezelfde post-formatter output als UI.
- [ ] PDF matcht UI in structuur en volgorde.
- [ ] Geen raw-text parsing meer voor boardroompresentatie.
- [ ] PDF oogt schoon, premium en hoog-contrast.
- [ ] Page breaks verstoren de leesflow niet.

## Download Stability

- [ ] PDF blob wordt gevalideerd vóór preview/download.
- [ ] Kapotte PDF’s worden geblokkeerd.
- [ ] Bestandsnaam is stabiel en leesbaar.
- [ ] Preview en download gebruiken dezelfde bron.

## Tests

- [ ] Er is testdekking voor content integrity.
- [ ] Er is testdekking voor rewrite gedrag.
- [ ] Er is testdekking voor sector style selectie.
- [ ] Er is testdekking voor UI/PDF parity.
- [ ] Er is testdekking voor download regressie.
- [ ] Build en relevante regressies zijn groen.

## Release Decision

- [ ] Als één van de blokken hierboven `nee` is: niet production-ready.
- [ ] Alleen production-ready als architectuur, outputkwaliteit en downloadstabiliteit alle drie groen zijn.
