#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function installMemoryStorage() {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage };
}

async function bundleModule(repoRoot, entryFile, prefix) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  const outFile = path.join(outDir, "bundle.mjs");
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
  installMemoryStorage();
  const bridgeModule = await bundleModule(
    repoRoot,
    "src/pages/portal/saas/usePlatformApiBridge.ts",
    "youth-case-content"
  );

  const { platformApiBridge } = bridgeModule;

  const analysis = await platformApiBridge.runAnalysis({
    organization_id: "org-jeugdzorg-zijn",
    organization_name: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    organisatie_grootte: "Kleinschalig",
    abonnementstype: "Professional",
    analysis_type: "Strategische analyse",
    input_data: `
Jeugdzorg Zijn is een jeugdzorgorganisatie in Haarlem.
De organisatie is afhankelijk van gemeentelijke inkoop sinds de Jeugdwet.
Belangrijke thema's: wachttijden, personeelstekorten, complexere problematiek, budgetdruk en bureaucratische verantwoordingsdruk.
Sterktes: lokale aanwezigheid, kleinschaligheid, sterke relatie met gezinnen.
Zwaktes: afhankelijkheid van gemeentelijke contracten, beperkte investeringskracht.
Kansen: ambulante begeleiding, samenwerking met scholen en wijkteams, preventieve gezinsbegeleiding.
Bedreigingen: gemeenten die contracten verminderen, concurrentie van grotere zorgorganisaties.
Strategische vragen: positionering, contractering, behoud van professionals, systeemgerichte hulp.
`.trim(),
  });

  const reportBody = String(analysis?.report?.report_body || "");
  const summary = String(analysis?.result?.executive_summary || "");
  const boardMemo = String(analysis?.result?.board_memo || analysis?.session?.board_memo || "");
  const combined = [reportBody, summary, boardMemo].join("\n");
  const killerInsightCount = (reportBody.match(/\nINZICHT\n/g) || []).length;

  assert(!/Molendrift/i.test(summary), "executive summary bevat nog hardcoded Molendrift");
  assert(!/Molendrift/i.test(reportBody), "rapport bevat nog hardcoded Molendrift");
  assert(!/Molendrift/i.test(boardMemo), "board memo bevat nog hardcoded Molendrift");
  assert(!/70\/30-model|modeladoptie|licentie-implementaties/i.test(summary), "jeugdzorgcase krijgt nog succesmodel-summary");
  assert(!/network_model in ggz/i.test(combined), "strategisch geheugen bevat nog verkeerd pattern label");
  assert(!/basispatroon is .* in ggz/i.test(combined), "strategisch geheugen valt nog terug op ggz");
  assert(!/Archetype\s*\n\s*scale operator/i.test(combined), "strategy DNA classificeert jeugdzorgcase nog als scale operator");
  assert(!/Primaire stuurhefboom:\s*volumegroei/i.test(combined), "strategy DNA gebruikt nog volumegroei als primaire stuurhefboom");
  assert(!/Scenario A — Volumegroei via extra capaciteit/i.test(combined), "scenario simulatie gebruikt nog volumegroeiscenario voor jeugdzorgcase");
  assert(!/Strategische hefboom:\s*volumegroei/i.test(combined), "causale strategieanalyse gebruikt nog volumegroei als dominante hefboom");
  assert(!/70\/30|>5 FTE|5 FTE\/jaar|regionaal systeemmodel|systeemadoptie/i.test(combined), "rapport bevat nog schaalmodel-vervuiling");
  assert(!/MODEL & SCHAAL[\s\S]*regionaal systeemmodel/i.test(combined), "open vragen blijven nog op schaalmodel-template hangen");
  assert(/0\. Boardroom summary/i.test(reportBody), "boardroom summary ontbreekt nog in het rapport");
  assert(/Sector:\s*Jeugdzorg/i.test(reportBody), "boardroom summary gebruikt nog geen jeugdzorg-sectorlabel");
  assert(/Wachtdruk is contractgedreven, niet personeelsgedreven\./i.test(summary), "executive summary gebruikt nog geen scherpe jeugdzorg-thesis");
  assert(!/Het probleem is niet activiteitstekort maar bestuurlijke inertie/i.test(summary), "executive summary blijft nog te abstract voor jeugdzorgcase");
  assert(!/\.\./.test(summary), "executive summary bevat nog dubbele zin-einde punten");
  assert(killerInsightCount >= 7, "killer insights bevatten nog minder dan 7 inzichten");
  assert(!/Strategisch inzicht|Kernmechanisme/i.test(reportBody), "killer insights bevatten nog placeholder labels");
  assert(/BESTUURLIJKE CONSEQUENTIE/i.test(reportBody), "killer insights missen bestuurlijke consequentie");
  assert(/Mechanismeketens[\s\S]*->[\s\S]*->[\s\S]*->/i.test(reportBody), "mechanismeketens ontbreken nog in causale strategieanalyse");
  console.log("youth case content regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
