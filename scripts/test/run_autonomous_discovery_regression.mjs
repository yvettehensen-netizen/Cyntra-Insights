#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function bundle(entryPath, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${outName}-`));
  const outFile = path.join(outDir, `${outName}.mjs`);
  await build({
    entryPoints: [entryPath],
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
  const discovery = await bundle(path.join(repoRoot, "src/aurelius/discovery/index.ts"), "discovery-regression");
  const platform = await bundle(path.join(repoRoot, "src/platform/index.ts"), "platform-discovery-regression");

  const discoveryEngine = new discovery.OrganisationDiscoveryEngine();
  const found = discoveryEngine.discover({ sector: "Zorg", zoekterm: "GGZ" });
  assert(found.length > 0, "Discovery engine vond geen organisaties.");

  const collector = new discovery.OrganisationDataCollector();
  const context = collector.collect(found[0]);
  assert(context.bedrijfsnaam, "Data collector leverde geen bedrijfsnaam.");

  const contextBuilder = new discovery.StrategicContextBuilder();
  const strategic = contextBuilder.build({ organisationContext: context });
  assert(strategic.organisatiecontext && strategic.sectorcontext, "StrategicContextBuilder output onvolledig.");

  const { SaaSPlatformFacade, isSessionCompleted } = platform;
  const facade = new SaaSPlatformFacade();
  const originalStart = facade.startStrategischeAnalyse.bind(facade);

  // Stub only for this regression to validate orchestration shape.
  facade.startStrategischeAnalyse = async (input) => ({
    session_id: "sess-stub",
    organization_id: input.organization_id,
    organization_name: "Stub Organisatie",
    analyse_datum: new Date().toISOString(),
    input_data: input.input_data,
    board_report: "1. Besluitvraag\nStub",
    status: "completed",
    updated_at: new Date().toISOString(),
  });

  const scan = await facade.scanOrganisationAndAnalyze({
    organisation_name: found[0].organisation_name,
    sector: found[0].sector,
    website: found[0].website,
    location: found[0].location,
    abonnementstype: "Starter",
  });

  assert(isSessionCompleted(scan.status), "Scannerflow moet een voltooide sessie retourneren (stub)." );
  assert(/Strategische spanningen:/i.test(scan.input_data), "Scannerflow mist opgebouwde strategische context.");

  facade.startStrategischeAnalyse = originalStart;

  console.log("autonomous discovery regression tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
