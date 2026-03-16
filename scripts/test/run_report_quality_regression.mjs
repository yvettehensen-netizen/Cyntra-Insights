#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const repoRoot = process.cwd();
  const fixture = fs.readFileSync(
    path.join(repoRoot, "scripts/test/fixtures/jeugdzorg_zijn_boardroom_golden.md"),
    "utf8"
  );
  assert(/Jeugdzorg ZIJN/.test(fixture), "golden fixture mist organisatienaam");
  assert(/Sector:\s*Jeugdzorg/.test(fixture), "golden fixture mist sector");
  assert(!/Keuzedruk|HARD -|bron:|Kopieer richting/i.test(fixture), "golden fixture bevat prompt leakage");
  assert(!/Volumegroei via extra capaciteit|Status quo \/ hybride/i.test(fixture), "golden fixture bevat generieke scenario's");
  assert(/STOPREGEL:\s*Herzie direct bij wachttijd > 12 weken/i.test(fixture), "golden fixture mist meetbare stopregel");
  console.log("report quality regression passed");
}

main();
