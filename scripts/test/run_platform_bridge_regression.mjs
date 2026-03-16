#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const bridgePath = path.resolve(
  process.cwd(),
  "src/pages/portal/saas/usePlatformApiBridge.ts"
);
const source = fs.readFileSync(bridgePath, "utf8");

assert(
  source.includes("const session = await local.startStrategischeAnalyse(payload);"),
  "Platform bridge moet sessies uitsluitend via de lokale engine starten."
);

assert(
  !source.includes("platformApiClient.startSession"),
  "Platform bridge mag startSession niet meer via demo/backend aanroepen."
);

assert(
  !source.includes("platformApiClient.listSessions"),
  "Platform bridge mag listSessions niet meer via demo/backend aanroepen."
);

assert(
  !source.includes("platformApiClient.executiveSummary"),
  "Platform bridge mag executiveSummary niet meer via demo/backend aanroepen."
);

assert(
  !source.includes("platformApiClient.boardMemo"),
  "Platform bridge mag boardMemo niet meer via demo/backend aanroepen."
);

assert(
  !source.includes("platformApiClient.pdf"),
  "Platform bridge mag pdf niet meer via demo/backend aanroepen."
);

assert(
  !source.includes("withFallback("),
  "Fallback-logica moet uit de platform bridge verwijderd zijn."
);

assert(
  !source.includes("Promise.allSettled("),
  "Platform bridge mag sessies niet meer samenvoegen via meerdere engines."
);

assert(
  !source.includes("mergeSessions"),
  "Platform bridge mag geen multi-engine merges meer bevatten."
);

console.log("platform bridge regression passed");
