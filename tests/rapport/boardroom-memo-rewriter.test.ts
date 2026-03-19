import assert from "node:assert/strict";
import { generateDecisionHeadline, rewriteReport, rewriteText } from "../../src/engine/rewriteLayer";

export async function run() {
  assert.equal(
    generateDecisionHeadline("Focus aanbrengen in het gemeentenportfolio."),
    "De enige verdedigbare keuze is: Focus aanbrengen in het gemeentenportfolio."
  );

  const rewritten = rewriteReport({
    metaLine: "Jeugdzorg ZIJN • Jeugdzorg • 19-03-2026",
    executiveSummary: [
      "De organisatie opereert in veel gevallen in een te breed gemeentenportfolio, wat kan leiden tot druk.",
      "Dit zou kunnen zorgen voor meer caseload en wachttijd.",
      "markeer u.",
    ],
    coreProblem: "De organisatie probeert tegelijkertijd te groeien en stabiliteit te behouden, wat kan leiden tot ruis.",
    decision: "Focus aanbrengen in het gemeentenportfolio.",
    why: [
      "35+ gemeenten zorgen in veel gevallen voor contractcomplexiteit.",
      "Reistijd kan leiden tot lagere marge.",
    ],
    riskOfInaction: [
      "Wachttijden zouden kunnen oplopen.",
      "consortium of re.",
    ],
    scenarios: [
      { code: "A", title: "Gemeentenportfolio rationaliseren.", explanation: "Focus op kern en uitstap waar nodig." },
    ],
    mechanism: [
      "Contractverschillen kunnen leiden tot druk op marge en planning.",
    ],
    stopRules: [
      "wachttijd > 12 weken gedurende twee meetmomenten",
    ],
    actions: [
      "Classificeer alle gemeenten in kern, behoud en uitstap.",
    ],
    boardQuestion: "Welke keuze zou kunnen zorgen voor minder druk?",
  });

  assert.match(rewritten.decision, /^De enige verdedigbare keuze is:/);
  assert.ok(rewritten.executiveSummary.every((line) => line.split(/\s+/).length <= 18));
  assert.ok(rewritten.why.every((line) => line.split(/\s+/).length <= 12));
  assert.ok(rewritten.mechanism.every((line) => line.split(/\s+/).length <= 12));
  assert.ok(!rewritten.executiveSummary.join(" ").includes("markeer u"));
  assert.ok(!rewritten.riskOfInaction.join(" ").includes("consortium of re"));
  assert.ok(!rewritten.executiveSummary.join(" ").includes("zou kunnen"));
  assert.ok(!rewritten.why.join(" ").includes("in veel gevallen"));

  const multiSentence = rewriteText(
    "De druk op teams loopt op door contractvariatie en reistijd. Daardoor daalt de bestuurlijke voorspelbaarheid."
  );
  const parts = multiSentence.split(/(?<=[.?!])\s+/).filter(Boolean);
  assert.equal(parts.length, 2);
  assert.ok(parts.every((line) => line.split(/\s+/).length <= 18));
}
