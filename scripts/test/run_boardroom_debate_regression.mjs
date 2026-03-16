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

  const nodeModule = await bundleModule(
    repoRoot,
    "src/aurelius/engine/nodes/strategy/BoardroomDebateNode.ts",
    "boardroom-debate-node"
  );
  const bridgeModule = await bundleModule(
    repoRoot,
    "src/pages/portal/saas/usePlatformApiBridge.ts",
    "boardroom-debate-report"
  );

  const { runBoardroomDebateNode } = nodeModule;
  const { platformApiBridge } = bridgeModule;

  const nodeOutput = runBoardroomDebateNode({
    organizationName: "Jeugdzorg ZIJN",
    executiveThesis:
      "Het probleem is niet activiteitstekort maar bestuurlijke inertie op het dominante risicomechanisme.",
    strategicOptions: [
      "A. Bescherm de kern en vertraag verbreding totdat capaciteit, contractruimte en governance aantoonbaar op orde zijn.",
      "B. Versnel impact via parallelle verbreding en accepteer hogere druk op marge, sturing en uitvoerbaarheid.",
    ],
    recommendedChoice:
      "A. Bescherm de kern en vertraag verbreding totdat capaciteit, contractruimte en governance aantoonbaar op orde zijn.",
    blindSpots: [
      {
        title: "Contractlogica vermomd als capaciteitsprobleem",
        insight: "Contractruimte is de werkelijke grens.",
        assumption: "Meer mensen lost wachtdruk op.",
        risk: "Kosten stijgen sneller dan bestuurlijke ruimte.",
        boardQuestion: "Wordt extra capaciteit vergoed?",
      },
    ],
    boardroomStressTest:
      "Als het bestuur niets doet, blijven wachtdruk, personeelsspanning en gemeentelijke afhankelijkheid elkaar versterken.",
    decisionConsequences: {
      decision: "Bescherm de kern",
      horizon12m: "Triage en werkdruk stabiliseren.",
      horizon24m: "Positionering richting gemeenten wordt scherper.",
      horizon36m: "Een stabielere specialistische positie ontstaat.",
      strategicOutcome: "Meer contractkwaliteit en focus.",
      riskIfWrong: "Gemeenten kopen capaciteit elders in.",
    },
    strategicLeverage: [
      {
        title: "Contractdiscipline",
        mechanism: "Contractkwaliteit bepaalt schaalruimte.",
        why80_20: "Raken marge en wachtdruk tegelijk.",
        boardAction: "Stel margevloer vast.",
        expectedEffect: "Stabielere capaciteit.",
      },
    ],
    interventions: ["Wekelijkse triage", "Heronderhandel contractmix"],
    sectorContext: "Jeugdzorg, gemeenten, contractdruk, personeelstekort",
  });

  assert(nodeOutput.boardroomDebate.proponentView.trim().length > 0, "proponentView ontbreekt");
  assert(nodeOutput.boardroomDebate.criticView.trim().length > 0, "criticView ontbreekt");
  assert(nodeOutput.boardroomDebate.strategicTension.trim().length > 0, "strategicTension ontbreekt");
  assert(nodeOutput.boardroomDebate.boardSynthesis.trim().length > 0, "boardSynthesis ontbreekt");

  const analysis = await platformApiBridge.runAnalysis({
    organization_id: "org-boardroom-debate-zijn",
    organization_name: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    organisatie_grootte: "Kleinschalig",
    abonnementstype: "Professional",
    analysis_type: "Strategische analyse",
    input_data: `
Jeugdzorg Zijn is afhankelijk van gemeentelijke contracten, ervaart wachtdruk, personeelstekort en hoge bestuurlijke verantwoordingsdruk.
De organisatie twijfelt tussen verbreding van het aanbod en scherpe specialisatie voor complexe gezinnen in Zuid-Kennemerland.
`.trim(),
  });

  assert(analysis?.report?.report_id, "analyseflow geeft geen rapportcontainer terug");
  assert(analysis?.session?.session_id, "analyseflow geeft geen sessiecontainer terug");
  assert(typeof analysis?.result?.board_memo === "string", "analyseflow mist board memo contract");

  console.log("boardroom debate regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
