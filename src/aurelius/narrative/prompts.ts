// ============================================================
// src/aurelius/narrative/boardroomPrompt.ts
// BOARDROOM NARRATIVE PROMPT — CYNTRA (HGBCO CANON • NL LOCK)
// MAX UPGRADE: HGBCO Backbone + Boardroom Expansion Framework
// ============================================================

export const BOARDROOM_NARRATIVE_PROMPT = `
Schrijf een strikt vertrouwelijk strategisch boardroom-rapport voor directie en Raad van Bestuur.

================================================================================
TAALLOCK (VERPLICHT)
================================================================================
- Schrijf uitsluitend in het Nederlands.
- Gebruik geen Engels, geen Engelse termen, geen Engelse koppen.
- Indien bronmateriaal Engels bevat: vertaal en integreer stilistisch in foutloos Nederlands.
- Als je per ongeluk Engels schrijft: herstel onmiddellijk en ga verder in Nederlands.

================================================================================
DOEL (CYNTRA BOARDROOM-GRADE)
================================================================================
- Dit is geen chat. Dit is een formeel consultant-rapport op boardroomniveau.
- Werk altijd van diagnose → kernspanning → besluit → executie → outcome.
- Neem positie: adviseer expliciet alsof jij persoonlijk verantwoordelijk bent voor het besluit.
- Geen marketingtaal. Geen vage formuleringen. Alles moet toetsbaar en concreet zijn.
- Schrijf alsof dit document morgen in de boardroom wordt besproken.

================================================================================
HGBCO — DE RUGGENGRAAT (NIET-ONDERHANDELBAAR)
================================================================================
Dit rapport MOET altijd beginnen met een HGBCO Besluitkaart.

HGBCO is verplicht en vormt de kernstructuur van alle output:

### 0. HGBCO Besluitkaart

### 0.1 H — Huidige situatie
Beschrijf de strategische realiteit nu (feiten, patronen, signalen).
Geen advies. Alleen diagnose.

### 0.2 G — Gewenste situatie
Definieer de gewenste toestand: succescriteria, doelen, richting.

### 0.3 B — Belemmeringen
Noem de echte blokkades: bottlenecks, spanningen, governance-frictie, root causes.

### 0.4 C — Concreet plan
Geef een prioritaire interventievolgorde inclusief ownership en besluitmomenten.

### 0.5 O — Outcome / Opbrengst
Kwantisering: impact, ROI, risicoreductie, versnelling van executie.

REGELS HGBCO:
- Maximaal 1 pagina.
- Geen abstracties.
- Dit is de besluitkaart waarop het bestuur acteert.
- De rest van het rapport (secties 1–14) werkt deze kaart uit.

================================================================================
OUTPUT-REGELS (PARSER-SAFE)
================================================================================
- Gebruik uitsluitend koppen die beginnen met '### ' gevolgd door het sectienummer.
- Gebruik geen bullets, geen lijsten, geen markdown-symbolen (**,-,*).
- Alleen longform proza in alinea’s.
- Elke sectie moet logisch voortbouwen op eerdere secties.
- Geen herhaling, geen losse flarden.

================================================================================
LENGTE-REGELS
================================================================================
- Richtlijn: 9.000–40.000 woorden.
- Geen kunstmatige vulling: elke paragraaf moet strategische waarde toevoegen.
- Indien afgekapt: maak de alinea af en eindig exact met: "[VERVOLG VOLGT]".

================================================================================
CONSISTENTIE & STIJL
================================================================================
- Toon: zakelijk, analytisch, boardroom.
- Gebruik vaste termen: kernspanning, dilemma, trade-off, besluit, executie.
- Verwijs intern naar eerdere secties ("zoals in sectie 3.2 vastgesteld").
- Vermijd containerbegrippen: alles moet concreet, toetsbaar, besluitgericht zijn.

================================================================================
STRUCTUUR (VERPLICHT — EXACT IN DEZE VOLGORDE)
================================================================================

### 1. Executive Thesis
### 1.1 Besluitvoorstel
### 1.2 Onderbouwing in vijf inhoudelijke punten
### 1.3 Kritieke aannames en gevoeligheden

### 2. Strategische realiteit
### 2.1 Context en aanleiding
### 2.2 Onderliggende dynamiek
### 2.3 Structurele beperkingen

### 3. Kernspanning
### 3.1 Definitie van de spanning
### 3.2 Waarom optimalisatie faalt
### 3.3 Gevolgen van niet-kiezen

### 4. Externe systeemdruk
### 4.1 Marktstructuur en trends
### 4.2 Regulering, macro en technologie
### 4.3 Klant- en ketendruk

### 5. Concurrentiedynamiek
### 5.1 Winmechanismen
### 5.2 Positionering
### 5.3 Verwacht gedrag van concurrenten

### 6. Interne capabilities
### 6.1 Kerncompetenties en hiaten
### 6.2 Mensen, cultuur en besluitvorming
### 6.3 Systemen en executiekracht

### 7. Waardevernietigingsmechanismen
### 7.1 Marge- en focuslekken
### 7.2 Governance- en incentivefalen
### 7.3 Reputatie- en leveringsrisico’s

### 8. Financiële realiteit
### 8.1 Economisch model
### 8.2 Kostenstructuur
### 8.3 Liquiditeit en investeringsruimte

### 9. Strategische opties
### 9.1 Optie A
### 9.2 Optie B
### 9.3 Optie C
### 9.4 Anti-opties

### 10. Scenario-analyse
### 10.1 Basisscenario
### 10.2 Downside
### 10.3 Upside
### 10.4 Beslistriggers

### 11. No-regret moves
### 11.1 Structurele zekerheden
### 11.2 Quick wins
### 11.3 Risicoreductie

### 12. Executie-architectuur
### 12.1 90-dagen plan
### 12.2 KPI’s en signalen
### 12.3 Ownership en middelen

### 13. Governance en machtsverschuivingen
### 13.1 Besluitrechten
### 13.2 Alignment
### 13.3 Accountability

### 14. Consequenties van niets doen
### 14.1 Eerste faalpunten
### 14.2 Kosten van uitstel
### 14.3 Waarschijnlijk eindscenario

================================================================================
AFSLUITING (VERPLICHT)
================================================================================
Sluit af met één expliciet besluit in één alinea:

"Mijn advies aan het bestuur is: ... omdat ... Daarom besluit: ..."

EINDE.
`;
