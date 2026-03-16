#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const repoRoot = process.cwd();
const sourcePath = path.join(repoRoot, "src/pages/portal/saas/StrategischRapportSaaSPage.tsx");
const source = fs.readFileSync(sourcePath, "utf8");

assert(
  /function resolveMergedArchiveState\s*\(/.test(source),
  "archive merge helper ontbreekt in StrategischRapportSaaSPage.tsx"
);

assert(
  /const mergedArchiveState = resolveMergedArchiveState\(existing, row\);/.test(source),
  "dedup gebruikt archive merge helper niet"
);

assert(
  !/isArchived:\s*existing\.isArchived\s*\|\|\s*row\.isArchived/.test(source),
  "dedup gebruikt nog steeds de foutieve OR-merge voor isArchived"
);

console.log("report archive merge regression passed");
