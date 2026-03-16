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
    platform: "node",
    target: ["node20"],
    bundle: true,
    sourcemap: false,
    logLevel: "silent",
  });
  return import(pathToFileURL(outFile).href);
}

async function main() {
  const repoRoot = process.cwd();
  const composerModule = await bundleModule(
    repoRoot,
    "src/aurelius/promptStack/PromptStackComposer.ts",
    "prompt-stack-composer"
  );
  const narrativeSource = fs.readFileSync(
    path.join(repoRoot, "src/aurelius/narrative/generateBoardroomNarrative.ts"),
    "utf8"
  );

  const { buildBoardroomPromptStack, validatePromptStackStep, renderPromptStackForNarrative } = composerModule;

  const layers = buildBoardroomPromptStack(
    {
      organisation: "Jeugdzorg ZIJN",
      sector: "Jeugdzorg",
      analysisDate: "12 maart 2026",
      dominantRisk: "Regionale triage en contractruimte begrenzen verbreding",
      strategicTension: {
        optionA: "Brede ambulante specialist blijven",
        optionB: "Selectieve specialisatie / niche kiezen",
      },
      decisionOptions: [
        "Brede ambulante specialist blijven",
        "Selectieve specialisatie / niche kiezen",
        "Consortiumstrategie verdiepen",
      ],
      recommendedOption: "Brede ambulante specialist blijven",
      scenarios: [],
      interventions: [],
    },
    "Gemeenten bepalen contractruimte en consortiumtriage beïnvloedt instroom."
  );

  assert(layers.length === 7, `Promptstack bevat ${layers.length} lagen in plaats van 7`);
  assert(layers.some((layer) => layer.key === "source_extraction"), "Promptstack mist source extraction");
  assert(layers.some((layer) => layer.key === "editorial"), "Promptstack mist editorial");
  const extractionLayer = layers.find((layer) => layer.key === "source_extraction");
  const mechanismLayer = layers.find((layer) => layer.key === "mechanism");
  const editorialLayer = layers.find((layer) => layer.key === "editorial");
  assert(/Je bent een analytische bronextractor/i.test(extractionLayer?.prompt || ""), "Source extraction template is niet volledig uitgewerkt");
  assert(/voeg geen nieuwe informatie toe/i.test(extractionLayer?.prompt || ""), "Source extraction template mist kernregel");
  assert(/symptoom -> oorzaak -> systeemdruk -> gevolg/i.test(mechanismLayer?.prompt || ""), "Mechanism template mist causale keten");
  assert(/geen Engelse consultancywoorden/i.test(editorialLayer?.prompt || ""), "Editorial template mist redactieregel");

  const rendered = renderPromptStackForNarrative(
    {
      organisation: "Jeugdzorg ZIJN",
      sector: "Jeugdzorg",
      analysisDate: "12 maart 2026",
      dominantRisk: "Regionale triage en contractruimte begrenzen verbreding",
      strategicTension: {
        optionA: "Brede ambulante specialist blijven",
        optionB: "Selectieve specialisatie / niche kiezen",
      },
      decisionOptions: [
        "Brede ambulante specialist blijven",
        "Selectieve specialisatie / niche kiezen",
        "Consortiumstrategie verdiepen",
      ],
      recommendedOption: "Brede ambulante specialist blijven",
      scenarios: [],
      interventions: [],
    },
    "Gemeenten bepalen contractruimte."
  );
  assert(/PROMPTSTACK DISCIPLINE/.test(rendered), "Rendered promptstack mist heading");
  assert(/1\. Source Extraction/.test(rendered), "Rendered promptstack mist eerste laag");
  assert(/7\. Editorial/.test(rendered), "Rendered promptstack mist laatste laag");
  assert(/STRUCTUUR[\s\S]*Bestuurlijke kernsamenvatting/i.test(rendered), "Rendered promptstack mist uitgewerkte editorialstructuur");

  const extractionIssues = validatePromptStackStep(
    "source_extraction",
    "FEITEN\nx\nSIGNALEN\ny\nHYPOTHESES\nz\nACTIEPUNTEN\nk"
  );
  assert(extractionIssues.length === 0, "Validatie van source extraction faalt onterecht");
  const decisionIssues = validatePromptStackStep("decision", "AANBEVOLEN KEUZE\nx");
  assert(decisionIssues.length > 0, "Besluitvalidatie detecteert incomplete output niet");

  assert(/renderPromptStackForNarrative/.test(narrativeSource), "Narrative generator gebruikt promptstack nog niet");

  console.log("prompt stack architecture regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
