#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(repoRoot, relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

function main() {
  const repoRoot = process.cwd();

  const composer = read(repoRoot, "src/aurelius/narrative/BoardroomNarrativeComposer.ts");
  const briefBuilder = read(repoRoot, "src/aurelius/synthesis/buildBoardroomBrief.ts");
  const narrativeGenerator = read(repoRoot, "src/aurelius/narrative/generateBoardroomNarrative.ts");

  assert(
    /export function ensureBoardroomOutputArtifacts\(/.test(composer),
    "BoardroomNarrativeComposer mist ensureBoardroomOutputArtifacts export."
  );
  assert(/\bOUTPUT 1\b/.test(composer), "Composer mist OUTPUT 1 marker.");
  assert(/\bOUTPUT 2\b/.test(composer), "Composer mist OUTPUT 2 marker.");
  assert(/\bOUTPUT 3\b/.test(composer), "Composer mist OUTPUT 3 marker.");
  assert(/\bHARD\b/.test(composer), "Composer mist HARD-label voor feitendiscipline.");
  assert(
    /\bINTERPRETATIE\b/.test(composer),
    "Composer mist INTERPRETATIE-label voor feitendiscipline."
  );

  assert(
    /ensureBoardroomOutputArtifacts\(narrativeWithSituation\)/.test(briefBuilder),
    "buildBoardroomBrief roept artifact-enforcement niet aan op strategic_narrative."
  );
  assert(
    /strategic_narrative:\s*narrativeWithArtifacts/.test(briefBuilder),
    "buildBoardroomBrief schrijft strategic_narrative niet met artifact-output."
  );

  assert(
    /candidate\s*=\s*ensureBoardroomOutputArtifacts\(candidate\)/.test(narrativeGenerator),
    "generateBoardroomNarrative enforce't board artifacts niet op final candidate."
  );

  console.log("boardroom artifact regression checks passed");
}

main();
