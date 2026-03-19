#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function bundleModule(repoRoot, entryFile, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${outName}-`));
  const outFile = path.join(outDir, `${outName}.mjs`);
  await build({
    entryPoints: [path.join(repoRoot, entryFile)],
    outfile: outFile,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    bundle: true,
    sourcemap: false,
    logLevel: "silent",
  });
  return import(pathToFileURL(outFile).href);
}

async function main() {
  const repoRoot = process.cwd();
  const pageModule = await bundleModule(
    repoRoot,
    "src/pages/portal/saas/StrategischRapportSaaSPage.tsx",
    "short-dossier-export-regression"
  );

  const { buildExportReportVariant, resolveExportableStrategicReport } = pageModule;

  const model = {
    organizationName: "Jeugdzorg ZIJN",
    sessionId: "session-short-dossier-export",
    createdAt: "2026-03-19T14:02:50.000Z",
    sector: "Jeugdzorg",
    deckSubtitle: "Aurelius Strategic Brain",
    contactLines: ["bestuur@jeugdzorgzijn.nl"],
    qualityScore: 92,
    qualityTier: "premium",
    dominantThesis:
      "Jeugdzorg ZIJN bevindt zich in een structureel spanningsvraagstuk tussen gemeentenportfolio en teamcapaciteit.",
    strategicConflict: "Gemeentenportfolio versus operationele capaciteit",
    boardOptions: [
      "Gemeentenportfolio rationaliseren",
      "Operationele schaal vergroten binnen vaste teams en flexibele schil",
      "Zorgmodel en instroomroute veranderen",
    ],
    recommendedDirection: "Scenario B - Operationele schaal vergroten binnen vaste teams en flexibele schil",
    topInterventions: [],
    structuredKillerInsights: [
      {
        insight: "Een breed gemeentenportfolio vergroot contract- en planningsdruk.",
        mechanism: "Meer contractvariatie verhoogt reistijd, no-show en caseloadfrictie.",
        implication: "Het bestuur moet scherpere grenzen aan bereikbaarheid en marge verbinden.",
      },
    ],
    governanceInterventions: [
      {
        action: "Leg caseload-, wachttijd- en flexratio-grenzen bestuurlijk vast.",
        mechanism: "Schaal werkt alleen zolang teams binnen harde operationele grenzen blijven.",
        boardDecision: "Het bestuur besluit de groeistop te activeren bij grensoverschrijding.",
        owner: "Bestuur + Directie",
        deadline: "30 dagen",
        kpi: "Caseload, wachttijd en flexratio blijven binnen norm.",
      },
    ],
    compactScenarios: [
      {
        title: "Scenario A - Gemeentenportfolio rationaliseren",
        mechanism: "Beperk actieve groei tot kern- en behoudgemeenten waar marge en bereikbaarheid samengaan.",
        risk: "Te weinig focus houdt contractcomplexiteit en bestuurlijke ruis in stand.",
        boardImplication: "Het bestuur moet expliciet bepalen welke gemeenten kern, behoud of exit zijn.",
      },
      {
        title: "Scenario B - Operationele schaal vergroten binnen vaste teams en flexibele schil",
        mechanism: "Vergroot capaciteit alleen binnen harde grenzen voor caseload, flexratio, reistijd en no-show.",
        risk: "Extra schaal zonder harde grenzen verhoogt wachtdruk sneller dan marge of kwaliteit meebewegen.",
        boardImplication: "Het bestuur moet vooraf vastleggen wanneer schaal wordt gepauzeerd of teruggedraaid.",
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
    boardQuestion: "Welke gemeenten zijn strategische kern en waar vergroot de organisatie alleen nog capaciteit onder harde voorwaarden?",
    financialConsequences: "Meer spreiding zonder focus verlaagt marge en verhoogt reiskosten.",
    stressTest: "Wat besluit het bestuur als wachttijd > 12 weken terwijl de gekozen richting blijft doorlopen?",
    executiveSummary:
      "De echte spanning zit tussen gemeentendekking, vaste-teamstabiliteit en bestuurlijke discipline.",
    strategyAlert:
      "Zonder harde grenzen aan groei drukt extra breedte direct op caseload, wachttijd en marge.",
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
      analysisDate: "19 maart 2026",
      coreProblem:
        "De echte spanning zit tussen gemeentenportfolio rationaliseren, operationele schaal vergroten en instroomroute veranderen.",
      coreStatement:
        "De organisatie kan niet tegelijk een breed gemeentenportfolio aanhouden en teamcapaciteit overal opvangen.",
      recommendedChoice: "Scenario B - Operationele schaal vergroten binnen vaste teams en flexibele schil",
      whyReasons: [
        "Instroom groeit sneller dan beschikbare caseloadruimte.",
        "Rendabiliteitsdruk laat alleen schaal toe binnen harde operationele grenzen.",
      ],
      riskIfDelayed:
        "Zonder ingreep nemen wachttijd, margedruk en teaminstabiliteit verder toe.",
      stopRules: [
        "Herzie direct als wachttijd > 12 weken gedurende twee meetperiodes.",
        "Herzie direct als marge < 4% gedurende twee meetperiodes.",
        "Herzie direct als caseload > 18 per professional gedurende twee meetperiodes.",
      ],
    },
  };

  const canonicalReport = resolveExportableStrategicReport(undefined, model);
  const variant = buildExportReportVariant(canonicalReport, model, "boardroom", "short");
  const body = String(variant.report.report_body || "");

  assert(/Compact bestuursdocument voor snelle besluitvorming\./i.test(body), "kort dossier mist compacte coverregel");
  assert(!/Pagina\s+2/i.test(body), "kort dossier lekt paginachrome in report body");
  assert(!/Pagina\s+3/i.test(body), "kort dossier lekt volgende paginachrome in report body");
  assert(!/uitsluitend voor intern bestuurlijk gebruik/i.test(body), "kort dossier lekt footerchome in report body");
  assert(!/\bKORT DOSSIER\b[\s\S]*\bPagina\b/i.test(body), "kort dossier bevat nog ingesloten dossierchrome");

  console.log("short dossier export regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
