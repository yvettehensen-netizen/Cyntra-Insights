import assert from "node:assert/strict";
import {
  assertBoardroomReportStructure,
  validateBoardroomReportStructure,
} from "../../src/aurelius/narrative/BoardroomReportStructureValidator";

const VALID_REPORT = `
1. Dominante bestuurlijke these
De kernkeuze is directe consolidatie van de GGZ-kern.

2. Structurele kernspanning
Parallel sturen op verbreding en consolidatie vergroot margedruk.

3. Keerzijde van de keuze
Tijdelijke groeivertraging buiten de kern is expliciet verlies.

4. Prijs van uitstel
Uitstel verhoogt binnen 90 dagen de operationele en financiële druk.

5. Mandaat en besluitrecht
Besluitrecht verschuift naar centrale prioritering met stopregels.

6. Onderstroom en informele macht
Vermijding in productiegesprekken remt uitvoering van keuzes.

7. Faalmechanisme
Zonder harde volgorde ontstaat besluituitstel en capaciteitsverlies.

8. 90-dagen interventieplan
Interventieplan met deadlines, KPI's en escalatieregels.

9. Besluitkader
Geen verbreding zonder getekende margevalidatie en capaciteitsimpact.
`;

const INVALID_REPORT = `
1. Dominante bestuurlijke these
Kernzin.

2. Structurele kernspanning
Kernzin.
`;

export async function run() {
  const passResult = validateBoardroomReportStructure(VALID_REPORT);
  assert.equal(passResult.pass, true, "valid report should pass structure check");
  assert.equal(passResult.missing.length, 0, "valid report should have zero missing sections");

  const failResult = validateBoardroomReportStructure(INVALID_REPORT);
  assert.equal(failResult.pass, false, "invalid report should fail structure check");
  assert(failResult.missing.length > 0, "invalid report should report missing sections");

  let blocked = false;
  try {
    assertBoardroomReportStructure(INVALID_REPORT);
  } catch {
    blocked = true;
  }
  assert.equal(blocked, true, "report generation should be blocked when sections are missing");

  assert.doesNotThrow(
    () => assertBoardroomReportStructure(VALID_REPORT),
    "valid report should not be blocked"
  );
}
