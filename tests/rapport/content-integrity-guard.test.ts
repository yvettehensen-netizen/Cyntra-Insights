import assert from "node:assert/strict";
import {
  ensureContentIntegrity,
  repairBrokenText,
  validateContentIntegrity,
} from "../../src/engine/contentIntegrityGuard";
import { synthesizeStrategicReport } from "../../src/engine/reportSynthesizer";

export async function run() {
  assert.deepEqual(validateContentIntegrity("Dit is een complete zin."), []);

  assert(validateContentIntegrity("Mechanisme: markeer u.").includes("BROKEN_SENTENCE_DETECTED"));
  assert(validateContentIntegrity("Mandaat blijft bij consortium of re.").includes("BROKEN_SENTENCE_DETECTED"));

  const repaired = repairBrokenText("Mechanisme: markeer u.\nGovernance: consortium of re.");
  assert.match(repaired, /markeer uitstapgemeenten expliciet\./i);
  assert.match(repaired, /consortium of regio\./i);
  assert.doesNotThrow(() => ensureContentIntegrity(repaired, "test"));

  const brokenModel = {
    organizationName: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    sessionId: "session-integrity-test",
    createdAt: "2026-03-19T15:02:50.000Z",
    executiveSummary:
      "De organisatie staat onder druk door contractvariatie, stijgende caseload en beperkte teamcapaciteit.",
    strategyAlert:
      "Zonder bestuurlijke focus nemen wachttijd en margeproblemen verder toe.",
    boardQuestion:
      "Welke keuze beschermt marge en teamstabiliteit zonder de toegang te ontregelen?",
    strategicConflict: "Gemeentenportfolio versus operationele capaciteit",
    boardOptions: [
      "Gemeentenportfolio rationaliseren",
      "Operationele schaal vergroten",
      "Zorgmodel aanpassen",
    ],
    compactScenarios: [
      {
        title: "Scenario A - Gemeentenportfolio rationaliseren",
        mechanism: "Beperk actieve groei en markeer u.",
        risk: "Te weinig focus houdt contractcomplexiteit in stand.",
        boardImplication: "Het bestuur moet kern- en exitgemeenten vastleggen.",
      },
      {
        title: "Scenario B - Operationele schaal vergroten",
        mechanism: "Vergroot capaciteit binnen harde grenzen.",
        risk: "Extra schaal verhoogt wachtdruk sneller dan marge meebeweegt.",
        boardImplication: "Het bestuur moet schaalpauzes koppelen aan caseload en wachttijd.",
      },
      {
        title: "Scenario C - Zorgmodel aanpassen",
        mechanism: "Herontwerp triage en routering.",
        risk: "Governancecomplexiteit stijgt als mandaat onduidelijk blijft.",
        boardImplication: "Het bestuur moet consortium of re.",
      },
    ],
    governanceInterventions: [],
    structuredKillerInsights: [],
    bestuurlijkeBesliskaart: {
      coreProblem: "De organisatie kan de huidige variatie in instroom en contractlogica niet absorberen.",
      coreStatement: "Er is een harde spanning tussen breedte en bestuurbaarheid.",
      stopRules: [
        "Herzie direct als wachttijd > 12 weken gedurende twee meetperiodes.",
      ],
    },
    boardDecisionPressure: {
      operational: "Caseload stijgt sneller dan teamruimte.",
      financial: "Marge daalt door reistijd en no-show.",
      organizational: "Bestuurlijke discipline vervaagt.",
    },
  };

  const report = synthesizeStrategicReport(brokenModel);
  assert.doesNotMatch(report.scenarios[0]?.mechanism || "", /markeer u\./i);
  assert.match(report.scenarios[0]?.mechanism || "", /markeer uitstapgemeenten expliciet\./i);
  assert.doesNotMatch(report.scenarios[2]?.governanceImplication || "", /consortium of re\./i);
  assert.match(report.scenarios[2]?.governanceImplication || "", /consortium of regio\./i);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await run();
}
