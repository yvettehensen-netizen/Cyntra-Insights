#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function loadPlatformRuntime(repoRoot) {
  const entry = path.join(repoRoot, "src/platform/index.ts");
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "saas-platform-regression-"));
  const outFile = path.join(outDir, "platform.mjs");

  await build({
    entryPoints: [entry],
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
  const platform = await loadPlatformRuntime(repoRoot);
  const {
    OrganizationAccountManager,
    SubscriptionManager,
    AnalysisSessionManager,
    StrategicDatasetCollector,
  } = platform;

  assert(typeof OrganizationAccountManager === "function", "OrganizationAccountManager ontbreekt.");
  assert(typeof SubscriptionManager === "function", "SubscriptionManager ontbreekt.");
  assert(typeof AnalysisSessionManager === "function", "AnalysisSessionManager ontbreekt.");
  assert(typeof StrategicDatasetCollector === "function", "StrategicDatasetCollector ontbreekt.");

  const organizations = new OrganizationAccountManager();
  const org = organizations.upsertOrganization({
    organisatie_naam: "Regression Org",
    sector: "Zorg/GGZ",
    organisatie_grootte: "50 medewerkers",
    abonnementstype: "Starter",
  });
  assert(org.organization_id, "Organisatie ID is leeg.");

  const subscription = new SubscriptionManager();
  const plan = subscription.getPlan("Starter");
  assert(plan.analysesPerMonth === 3, "Starter plan limiet moet 3 zijn.");

  const sessions = new AnalysisSessionManager();
  const session = sessions.createSession({
    organization_id: org.organization_id,
    input_data: "Test context voor regressie",
    analysis_type: "Strategische analyse",
  });
  assert(session.session_id, "Session ID is leeg.");
  assert(session.status === "nieuw", "Nieuwe session moet status 'nieuw' hebben.");

  const dataset = new StrategicDatasetCollector();
  const collected = dataset.collectFromSession({
    ...session,
    status: "completed",
    strategic_metadata: {
      sector: "Zorg/GGZ",
      probleemtype: "financiële druk",
      mechanismen: ["margedruk"],
      interventies: ["contractheronderhandeling"],
      strategische_opties: ["consolideren"],
      gekozen_strategie: "consolideren",
    },
  });
  assert(collected?.record_id, "Datasetrecord niet opgeslagen.");

  console.log("saas platform regression tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
