import assert from "node:assert/strict";
import { parseStructuredReportSections } from "../../src/pages/portal/saas/StrategischRapportSaaSPage";

const NUMBERED_REPORT = `
1. Dominante bestuurlijke these
De kernkeuze is directe consolidatie van de GGZ-kern.

2. Structurele kernspanning
Parallel sturen op verbreding en consolidatie vergroot margedruk.

3. 90-dagen interventieplan
Interventieplan met deadlines, KPI's en escalatieregels.
`;

const MARKDOWN_REPORT = `
### Bestuurlijke hypothese
De organisatie moet eerst de kern stabiliseren.

### Strategische interventies
Leg mandaat, ritme en KPI-eigenaarschap vast.
`;

export async function run() {
  const numberedSections = parseStructuredReportSections(NUMBERED_REPORT);
  assert.equal(numberedSections.length, 3, "genummerd rapport moet in drie secties worden gesplitst");
  assert.equal(numberedSections[0]?.title, "Dominante bestuurlijke these");
  assert.match(numberedSections[2]?.body || "", /KPI's en escalatieregels/i);

  const markdownSections = parseStructuredReportSections(MARKDOWN_REPORT);
  assert.equal(markdownSections.length, 2, "markdown-koppen moeten ook als rapportsecties tellen");
  assert.equal(markdownSections[1]?.title, "90-DAGEN INTERVENTIEPLAN");
}
