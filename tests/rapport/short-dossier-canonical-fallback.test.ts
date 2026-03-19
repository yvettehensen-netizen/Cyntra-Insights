import assert from "node:assert/strict";
import { compileBoardroomDocument } from "../../src/engine/reportCompiler";
import { resolveExportableStrategicReport } from "../../src/pages/portal/saas/StrategischRapportSaaSPage";
import type { ReportRenderModel } from "../../src/components/reports/types";

export async function run() {
  const legacyReport = {
    report_id: "report-short-fallback",
    session_id: "session-short-fallback",
    organization_id: "jeugdzorg-zijn",
    title: "Jeugdzorg ZIJN",
    sections: ["Bestuurlijke kernsamenvatting", "Bestuurlijk actieplan"],
    generated_at: "2026-03-17T09:00:00.000Z",
    report_body: "BESTUURLIJKE KERNSAMENVATTING\nEen breed gemeentenportfolio drukt op marge en teamstabiliteit.",
  };

  const model: ReportRenderModel = {
    organizationName: "Jeugdzorg ZIJN",
    sessionId: "session-short-fallback",
    createdAt: "2026-03-17T09:00:00.000Z",
    sector: "Jeugdzorg",
    deckSubtitle: "Aurelius Strategic Brain",
    contactLines: [],
    qualityScore: 92,
    qualityTier: "premium",
    dominantThesis:
      "Jeugdzorg ZIJN kan niet tegelijk brede gemeentendekking houden en teamcapaciteit overal opvangen.",
    strategicConflict: "Portfoliobreedte versus operationele capaciteit",
    boardOptions: [
      "Gemeentenportfolio rationaliseren",
      "Operationele schaal vergroten binnen vaste teams en flexibele schil",
      "Zorgmodel en instroomroute veranderen",
    ],
    recommendedDirection: "A: Gemeentenportfolio rationaliseren",
    topInterventions: [],
    structuredKillerInsights: [
      {
        insight: "Een breed gemeentenportfolio vergroot contract- en planningsdruk.",
        mechanism: "Meer contractvariatie verhoogt reistijd, no-show en caseloadfrictie.",
        implication: "Het bestuur moet eerst focus aanbrengen in kern- en uitstapgemeenten.",
      },
    ],
    governanceInterventions: [
      {
        action: "Stel een gemeentenmatrix vast met kern-, behoud- en uitstapgemeenten.",
        mechanism: "Portfoliofocus verlaagt contractcomplexiteit en planfrictie.",
        boardDecision: "Het bestuur besluit de gemeentenmatrix in 30 dagen vast te stellen.",
        owner: "Bestuur + Directie",
        deadline: "Dag 30",
        kpi: "100% van de gemeenten geclassificeerd op marge, reistijd en contractzekerheid.",
      },
    ],
    compactScenarios: [
      {
        title: "Scenario A - Gemeentenportfolio rationaliseren",
        mechanism: "Beperk actieve groei tot gemeenten waar marge, bereikbaarheid en teamstabiliteit samengaan.",
        risk: "Te weinig focus houdt contractcomplexiteit en bestuurlijke ruis in stand.",
        boardImplication: "Het bestuur moet kern-, behoud- en exitgemeenten vastleggen.",
      },
      {
        title: "Scenario B - Operationele schaal vergroten",
        mechanism: "Vergroot capaciteit alleen binnen harde grenzen voor caseload en flexratio.",
        risk: "Extra schaal zonder grenzen verhoogt wachtdruk en retentierisico.",
        boardImplication: "Het bestuur moet schaalpauzes koppelen aan caseload en wachttijd.",
      },
      {
        title: "Scenario C - Zorgmodel en instroomroute veranderen",
        mechanism: "Verander triage, routering en partnerrol om vraag beter te verdelen.",
        risk: "Governancecomplexiteit stijgt direct als mandaat en escalatie niet helder zijn.",
        boardImplication: "Het bestuur moet eerst toegangsmacht en escalatie expliciteren.",
      },
    ],
    optionRejections: [],
    boardDecisionPressure: {
      operational: "Wachttijd en caseload lopen op zodra instroom sneller groeit dan teamruimte.",
      financial: "Tariefverschillen, reistijd en no-show drukken de marge per gemeente uiteen.",
      organizational: "Bestuurlijke discipline vervaagt als portfolio en capaciteit niet samen worden gestuurd.",
    },
    boardQuestion: "Wat besluit het bestuur nu om wachttijd en margedruk te begrenzen?",
    financialConsequences: "Meer spreiding zonder focus verlaagt marge en verhoogt reiskosten.",
    stressTest: "Wat besluit het bestuur als wachttijd > 14 weken terwijl de gekozen richting blijft doorlopen?",
    executiveSummary:
      "De echte spanning zit tussen gemeentendekking, vaste-teamstabiliteit en bestuurlijke discipline.",
    strategyAlert:
      "Zonder focus in het gemeentenportfolio drukt extra breedte direct op caseload, wachttijd en marge.",
    noIntervention: "Wachttijd, margedruk en retentierisico lopen tegelijk verder op.",
    strategySections: [],
    scenarioSections: [],
    engineSections: [],
    qualityLevel: "hoog",
    qualityChecks: [],
    criticalFlags: [],
    nonCriticalFlags: [],
    bestuurlijkeBesliskaart: {
      organization: "Jeugdzorg ZIJN",
      sector: "Jeugdzorg",
      analysisDate: "17 maart 2026",
      coreProblem:
        "De echte spanning zit tussen gemeentenportfolio rationaliseren, operationele schaal vergroten en instroomroute veranderen.",
      coreStatement:
        "De organisatie kan niet tegelijk een breed gemeentenportfolio aanhouden en teamcapaciteit overal opvangen.",
      recommendedChoice: "A: Gemeentenportfolio rationaliseren",
      whyReasons: [
        "De organisatie werkt voor circa 35 gemeenten.",
        "Rendabiliteitsdruk laat weinig ruimte voor extra breedte zonder scherpere sturing.",
      ],
      riskIfDelayed:
        "Wat besluit het bestuur als wachttijd > 14 weken terwijl de gekozen richting blijft doorlopen?",
      stopRules: [
        "Herzie direct als wachttijd > 12 weken gedurende twee meetperiodes.",
        "Herzie direct als marge < 4% gedurende twee meetperiodes.",
      ],
    },
  };

  const canonicalReport = resolveExportableStrategicReport(legacyReport, model);
  const document = compileBoardroomDocument(canonicalReport);

  assert.match(document.executiveDecisionCard.summary, /gemeentendekking|gemeentenportfolio/i);
  assert.doesNotMatch(document.executiveDecisionCard.summary, /Executive kern ontbreekt/i);
  assert.match(document.executiveDecisionCard.decisionQuestion, /wat besluit het bestuur/i);
  assert.doesNotMatch(document.executiveDecisionCard.decisionQuestion, /Besluitvraag ontbreekt/i);
  assert.match(document.decision.tradeOff, /kan niet tegelijkertijd/i);
  assert.match(document.decision.forcedDecision, /enige verdedigbare keuze/i);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await run();
}
