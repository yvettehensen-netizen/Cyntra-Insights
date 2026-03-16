#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
  const module = await bundleModule(
    repoRoot,
    "src/aurelius/executive/BoardroomLanguageNormalizer.ts",
    "boardroom-language"
  );

  const { normalizeBoardroomSentence, normalizeBoardroomBullet, compactBoardroomBody, frameBoardroomShock } = module;

  const normalized = normalizeBoardroomSentence(
    "Contractplafonds en tariefdruk begrenzen schaalbaarheid ontstaat doordat Marktbeperkingen zijn deels impliciet en vragen expliciete validatie"
  );
  assert(/Contractplafonds en tariefdruk begrenzen de schaalruimte/i.test(normalized), "kernzin wordt niet aangescherpt");
  assert(/Oorzaak:|Reden:/i.test(normalized), "mechanistische zin wordt niet beter leesbaar gemaakt");

  const bullet = normalizeBoardroomBullet(
    "Parallelle ambities zonder volgorde vergroten uitvoeringsverlies ontstaat doordat Capaciteit, planning en normdruk begrenzen gelijktijdige executie"
  );
  assert(!/^•/.test(bullet), "boardroom bullet moet schoon en zonder list-marker terugkomen");
  assert(bullet.length <= 221, "boardroom bullet wordt niet gecomprimeerd");

  const body = compactBoardroomBody(
    "Binnen 12 maanden stabiliseren wachtdruk en teamdruk alleen als triage, caseloadsturing en contractdiscipline tegelijk worden aangescherpt.\n\nBinnen 24 maanden verschuift de organisatie van brede uitvoerder naar scherper gepositioneerde aanbieder met beter verdedigbare contractmix en lagere bestuurlijke ruis.\n\nBinnen 36 maanden ontstaat een stabielere positie als specialistische of regionaal ingebedde partner."
  );
  const paragraphs = body.split(/\n\s*\n/g).filter(Boolean);
  assert(paragraphs.length <= 2, "executive compressie laat te veel paragrafen door");

  const shock = frameBoardroomShock(
    "Contractplafonds en tariefdruk begrenzen de schaalruimte. Oorzaak: de contractgrens impliciet blijft."
  );
  assert(/De schaalgrens ligt niet bij capaciteit maar bij contractruimte/i.test(shock), "shock framer maakt de kern niet scherper");
  assert(shock.length <= 181, "shock framer comprimeert onvoldoende");

  console.log("boardroom language regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
