// ============================================================
// src/aurelius/narrative/boardroomPrompt.ts
// BOARDROOM NARRATIVE PROMPT — EXECUTIVE KERNEL
// ============================================================

export const BOARDROOM_NARRATIVE_PROMPT = `
Schrijf een strikt vertrouwelijk rapport voor directie en Raad van Bestuur.

DOEL:
Niet adviserend. Niet beschrijvend. Niet informatief.
Wel besluit-afdwingend.

TAALREGELS:
- Alleen Nederlands
- Geen marketingtaal
- Geen AI-taal
- Geen vaagheid
- Geen consultant-cliche
- Bij dunne context: gebruik exact "Op basis van bestuurlijke patronen in vergelijkbare organisaties:"
- Verboden zin: "Geen expliciete context aangeleverd."
- Verboden woorden: default template, governance-technisch, patroon, context is schaars, werk uit, mogelijk, lijkt erop dat, zou kunnen, men zou, belangrijke succesfactor, quick win, low hanging fruit

SIGNATURE LAYER (DOMINANT):
- Besluitkracht is de centrale variabele
- Open met: De werkelijke bestuurlijke kern is niet X, maar Y.
- Gebruik expliciet: De ongemakkelijke waarheid is: ...
- Minimaal één onoplosbaar spanningsveld
- Expliciet benoemd verlies
- Minimaal drie concrete machtsactoren met verlies, winst, sabotagewijze en instrument
- Tijd als actieve druk: irreversibel, venster sluit, schade stapelt
- Tempo als macht: gebruik expliciet "Wie tempo controleert, controleert macht."
- Cognitieve volwassenheid: informatie vs moed / capaciteit vs macht / strategie vs executiediscipline / analyse vs vermijding
- Contractuele afsluiting met keuze, KPI, tijdshorizon en geaccepteerd verlies
- Adaptieve hardheid: stagnatie = confronterend, transitie = klinisch, momentum = strategisch beheerst

STRUCTUUR (VERPLICHT):
### 1. DOMINANTE BESTUURLIJKE THESE
### 2. HET KERNCONFLICT
### 3. EXPLICIETE TRADE-OFFS
### 4. OPPORTUNITY COST
### 5. GOVERNANCE IMPACT
### 6. MACHTSDYNAMIEK & ONDERSTROOM
### 7. EXECUTIERISICO
### 8. 90-DAGEN INTERVENTIEPLAN
### 9. DECISION CONTRACT

INHOUDSEISEN:
- Elke sectie start met mechanisme (Omdat A -> ontstaat B -> leidt tot C) en koppelt direct naar casusanker.
- Sectie 1: maximaal 10 zinnen, één dominante these
- Sectie 1 opent met de denkvorm "De werkelijke bestuurlijke kern is niet X, maar Y."
- Sectie 1 bevat expliciet "De ongemakkelijke waarheid is: ..."
- Sectie 1: beantwoordt expliciet of besluitkracht van de top versterkt of ondermijnd wordt
- Sectie 2: niet-optimaliseerbaar dilemma
- Sectie 3: winst, verlies, machtsverlies, frictie
- Sectie 4: consequente lagen op 30 dagen (signaalverlies), 90 dagen (machtsverschuiving), 365 dagen (systeemverschuiving)
- Sectie 4: na 12 maanden expliciet welke positie permanent verschuift, welke coalitie dominant wordt en wat niet zonder reputatieschade terugdraait
- Sectie 5: besluitkracht, escalatie, diffuse verantwoordelijkheid, centralisatie van macht
- Sectie 6: minimaal drie concrete machtsactoren met verlies, winst, sabotagewijze en instrument
- Sectie 7: waar het misgaat, wie blokkeert, welke onderstroom executie vertraagt
- Sectie 8 is een interventie-bouwtekening met exact:
  MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN
  MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN
  MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN
  BOVENSTROOM-DOELEN (max 5)
  ONDERSTROOM-DOELEN (max 5)
- Sectie 8 bevat per interventie exact deze velden: Actie / Eigenaar / Deadline / KPI / Escalatiepad / Direct zichtbaar effect / Anchor-ref (letterlijke casus-anker uit input)
- Sectie 9: begint exact met "De Raad van Bestuur committeert zich aan:" en bevat keuze A of B, formeel/informeel machtsverlies, beslismonopolie, per-direct stop, niet-escalatie en geaccepteerd verlies met impact
- Verplicht in totaal: minimaal 2 expliciete machtsverschuivingen, minimaal 1 point of no return met dag-trigger en minimaal 1 concrete culture drift gedragsverschuiving.

STIJL:
Hard maar rationeel.
Boardroom.
Geen vrijblijvendheid.
`;
