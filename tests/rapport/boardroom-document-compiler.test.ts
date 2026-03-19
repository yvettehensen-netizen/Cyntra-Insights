import assert from "node:assert/strict";
import { compileBoardroomDocument } from "../../src/engine/reportCompiler";
import { synthesizeStrategicReport } from "../../src/engine/reportSynthesizer";
import { validateStrategicReport } from "../../src/engine/reportValidator";

export async function run() {
  const report = synthesizeStrategicReport({
    organizationName: "Cyntra Test Org",
    sector: "Jeugdzorg",
    sessionId: "session-compiler-test",
    createdAt: "2026-03-17T09:00:00.000Z",
    executiveSummary:
      "De organisatie moet bestuurlijke focus aanbrengen omdat contractdruk en teamcapaciteit tegelijk oplopen.",
    strategyAlert:
      "Zonder scherpere portfolioselectie loopt de operationele druk sneller op dan de marge kan herstellen.",
    boardQuestion:
      "Welke keuze beperkt de druk op marge en capaciteit zonder bestuurlijke wendbaarheid te verliezen?",
    strategicConflict: "Regionale dekking versus operationele uitvoerbaarheid",
    boardOptions: [
      "Gemeentenportfolio aanscherpen",
      "Capaciteit gecontroleerd opschalen",
      "Instroomroutering herontwerpen",
    ],
    compactScenarios: [
      {
        title: "Scenario A - Gemeentenportfolio aanscherpen",
        mechanism: "Minder variatie in contracten verlaagt de druk op planning en reistijd.",
        risk: "Te snelle uitstap uit randgemeenten kan marktrelevantie aantasten.",
        boardImplication: "Bestuur moet expliciet kiezen welke gemeenten kern, behoud of uitstap zijn.",
        impactScore: 8,
        riskScore: 5,
        difficultyScore: 6,
      },
      {
        title: "Scenario B - Capaciteit gecontroleerd opschalen",
        mechanism: "Extra capaciteit dempt wachttijd maar verhoogt loonkosten en coördinatiedruk.",
        risk: "Snelle opschaling kan cultuur en retentie verzwakken.",
        boardImplication: "Bestuur moet harde grenzen stellen aan flexratio en caseload.",
        impactScore: 7,
        riskScore: 6,
        difficultyScore: 7,
      },
      {
        title: "Scenario C - Instroomroutering herontwerpen",
        mechanism: "Triage aan de voorkant verschuift vraag naar beter passende teams.",
        risk: "Routering zonder governance kan doorlooptijd juist verlengen.",
        boardImplication: "Bestuur moet eigenaarschap op triage, KPI's en escalatie vastleggen.",
        impactScore: 7,
        riskScore: 4,
        difficultyScore: 5,
      },
    ],
    structuredKillerInsights: [
      {
        insight: "Contractvariatie vergroot onzichtbare planningsfrictie.",
        mechanism: "Meer contractvormen creëren meer wisselingen in triage, reistijd en no-show.",
        implication: "Het bestuur moet variatie reduceren voordat het op volume stuurt.",
      },
      {
        insight: "Capaciteitstekort is deels governancegedreven.",
        mechanism: "Besluiten over instroom en routing worden nu niet in hetzelfde ritme genomen.",
        implication: "Het bestuur moet beslisritme en escalatie expliciet koppelen.",
      },
    ],
    governanceInterventions: [
      {
        action: "Stel een gemeentenmatrix vast.",
        mechanism: "Maakt zichtbaar waar volume, marge en reistijd samenkomen.",
        boardDecision: "Kies kern-, behoud- en uitstapgemeenten.",
        owner: "RvB",
        deadline: "30 dagen",
        kpi: "Aandeel kerncontracten en gemiddelde reistijd per casus.",
      },
      {
        action: "Verbind triage aan weekritme.",
        mechanism: "Voorkomt dat instroom sneller groeit dan teams kunnen absorberen.",
        boardDecision: "Leg mandaat en escalatie vast.",
        owner: "COO",
        deadline: "60 dagen",
        kpi: "Caseload per team en wachttijd.",
      },
    ],
    boardDecisionPressure: {
      operational: "Caseload stijgt sneller dan teams kunnen verwerken.",
      financial: "Marge daalt bij hoge reistijd en no-show.",
      organizational: "Besluitritme en teamdiscipline lopen uit elkaar.",
    },
    bestuurlijkeBesliskaart: {
      organization: "Cyntra Test Org",
      sector: "Jeugdzorg",
      analysisDate: "2026-03-17",
      coreProblem: "Te veel contractvariatie vergroot druk op teams en marge.",
      coreStatement: "Regionale dekking versus operationele uitvoerbaarheid",
      recommendedChoice: "Gemeentenportfolio aanscherpen",
      whyReasons: [
        "Minder contractvariatie geeft direct rust in planning.",
        "Bestuurlijke focus maakt stopregels uitvoerbaar.",
      ],
      riskIfDelayed: "Wachttijd, no-show en retentiedruk lopen verder op.",
      stopRules: ["Herzie direct als caseload boven 18 komt.", "Herzie direct als marge onder 4% daalt."],
    },
  });

  assert.doesNotThrow(() => validateStrategicReport(report));
  assert.equal(report.scenarios.length >= 3, true, "strategic report moet minimaal drie scenario's hebben");
  assert.equal(Array.isArray(report.breakthroughInsights), true, "breakthroughInsights moet beschikbaar zijn");
  assert.equal(Array.isArray(report.boardActions), true, "boardActions moet beschikbaar zijn");

  const document = compileBoardroomDocument(report);
  assert.equal(document.meta.organizationName, "Cyntra Test Org", "boardroom document moet organisatie-meta behouden");
  assert.match(document.executiveDecisionCard.summary, /enige verdedigbare keuze|enige werkbare route/i, "executive decision card moet geforceerd besluit bevatten");
  assert.equal(document.scenarioCards.length, 3, "boardroom document moet drie scenariokaarten hebben");
  assert.equal(document.actionItems.length >= 2, true, "boardroom document moet bestuursacties behouden");
  assert.equal(document.insightItems.length >= 2, true, "boardroom document moet inzichten behouden");
  assert.match(document.strategicTension, /versus/i, "strategische spanning moet als expliciete tegenstelling worden gecompileerd");
  assert.match(document.mechanismAnalysis, /CAUSALE KETEN/i, "mechanismeanalyse moet causale keten bevatten");
  assert.match(document.scenarioComparison, /Scenario A/i, "scenariovergelijking moet scenario A bevatten");
  assert.equal(document.stopRuleItems.length >= 2, true, "stopregels moeten ook als gestructureerde lijst beschikbaar blijven");
  assert.equal(document.stopRules.split("\n").length >= 2, true, "stopregels moeten als lijst beschikbaar blijven");
  assert.match(document.decision.thesis, /kernstelling die het bestuur nu moet dragen/i, "decision intelligence moet een harde these bouwen");
  assert.match(document.decision.tradeOff, /kan niet tegelijkertijd/i, "decision intelligence moet een geforceerde trade-off benoemen");
  assert.match(document.decision.inevitability, /onvermijdelijk/i, "decision intelligence moet onvermijdelijkheid expliciet maken");
  assert.equal(document.decision.breakpoints.length >= 1, true, "decision intelligence moet breekpunten detecteren");
  assert.match(document.decision.forcedDecision, /enige verdedigbare keuze|enige werkbare route/i, "decision intelligence moet een geforceerd besluit bevatten");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await run();
}
