import { ExecutiveGateError } from "@/aurelius/executive/types";
import { CANONICAL_HEADINGS, firstContentLine, parseSections } from "./utils";

const COMMIT_PREFIX = "De Raad van Bestuur committeert zich aan:";
const BOARD_SUMMARY_HEADING = "1-PAGINA BESTUURLIJKE SAMENVATTING";
const SITUATION_RECON_HEADING = "0 SITUATIERECONSTRUCTIE";
const STRATEGIC_INSIGHTS_HEADING = "### 3. STRATEGISCHE INZICHTEN";

export function validateStructureGates(text: string): void {
  const sections = parseSections(text);

  if (sections.length !== 12) {
    throw new ExecutiveGateError(
      "Exact 12 secties vereist.",
      "EXACT_12_SECTIONS",
      { count: sections.length },
      "Herbouw de volledige output met exact 12 canonieke secties."
    );
  }

  for (let i = 0; i < CANONICAL_HEADINGS.length; i += 1) {
    if (sections[i]?.heading !== CANONICAL_HEADINGS[i]) {
      throw new ExecutiveGateError(
        "Heading exact match mislukt.",
        "HEADING_EXACT_MATCH",
        { expected: CANONICAL_HEADINGS[i], observed: sections[i]?.heading },
        "Gebruik exact de 12 canonieke headings in vaste volgorde."
      );
    }
  }

  if (!sections.find((section) => section.number === 10)?.body.trim()) {
    throw new ExecutiveGateError(
      "Sectie 10 ontbreekt of is leeg.",
      "SECTION_8_PRESENT",
      undefined,
      "Vul sectie 10 volledig met maandblokken en interventies."
    );
  }

  const section12 = sections.find((section) => section.number === 12);
  if (!section12) {
    throw new ExecutiveGateError("Sectie 12 ontbreekt.", "SECTION_12_COMMIT_PREFIX");
  }

  const firstLine = firstContentLine(section12.body);
  if (firstLine !== COMMIT_PREFIX) {
    throw new ExecutiveGateError(
      "Sectie 12 moet exact starten met commit-prefix.",
      "SECTION_12_COMMIT_PREFIX",
      { firstLine },
      "Start sectie 12 exact met: De Raad van Bestuur committeert zich aan:"
    );
  }

  const headingCount = (String(text ?? "").match(/^###\s*\d+\./gm) ?? []).length;
  if (headingCount !== 12) {
    throw new ExecutiveGateError(
      "Extra headings gevonden.",
      "NO_EXTRA_HEADINGS",
      { headingCount },
      "Verwijder extra headings; behoud exact 12 hoofdkoppen."
    );
  }

  const source = String(text ?? "");
  const reconIdx = source.indexOf(SITUATION_RECON_HEADING);
  const section1Idx = source.indexOf(CANONICAL_HEADINGS[0]);
  if (reconIdx < 0 || section1Idx < 0 || reconIdx > section1Idx) {
    throw new ExecutiveGateError(
      "0 SITUATIERECONSTRUCTIE ontbreekt of staat niet boven sectie 1.",
      "SITUATION_RECON_REQUIRED",
      { reconFound: reconIdx >= 0, section1Found: section1Idx >= 0 },
      "Plaats een blok '0 SITUATIERECONSTRUCTIE' direct boven sectie 1."
    );
  }

  const strategicIdx = source.indexOf(STRATEGIC_INSIGHTS_HEADING);
  const section4Idx = source.indexOf(CANONICAL_HEADINGS[3]);
  if (strategicIdx < 0 || section4Idx < 0 || strategicIdx > section4Idx) {
    throw new ExecutiveGateError(
      "3. STRATEGISCHE INZICHTEN ontbreekt of staat niet op sectiepositie 3.",
      "STRATEGIC_INSIGHTS_REQUIRED",
      { strategicFound: strategicIdx >= 0, section4Found: section4Idx >= 0 },
      "Gebruik exact heading: '### 3. STRATEGISCHE INZICHTEN'."
    );
  }

  const summaryIdx = source.indexOf(BOARD_SUMMARY_HEADING);
  const section12Idx = source.indexOf(CANONICAL_HEADINGS[11]);
  if (summaryIdx < 0 || section12Idx < 0 || summaryIdx > section12Idx) {
    throw new ExecutiveGateError(
      "1-pagina samenvatting ontbreekt of staat niet boven sectie 12.",
      "BOARD_SUMMARY_REQUIRED",
      { summaryFound: summaryIdx >= 0, section12Found: section12Idx >= 0 },
      "Plaats een blok '1-PAGINA BESTUURLIJKE SAMENVATTING' direct boven sectie 12."
    );
  }

  const section9 = sections.find((section) => section.number === 9)?.body ?? "";
  const hasScenarioA = /\bSCENARIO\s*A\b/i.test(section9);
  const hasScenarioB = /\bSCENARIO\s*B\b/i.test(section9);
  const hasScenarioC = /\bSCENARIO\s*C\b/i.test(section9);
  const hasComparison = /\bSCENARIOVERGELIJKING\b/i.test(section9);
  if (!hasScenarioA || !hasScenarioB || !hasScenarioC || !hasComparison) {
    throw new ExecutiveGateError(
      "Scenarioanalyse in sectie 9 is onvolledig.",
      "STRATEGIC_INSIGHTS_REQUIRED",
      { hasScenarioA, hasScenarioB, hasScenarioC, hasComparison },
      "Voeg in sectie 9 minimaal SCENARIO A/B/C en een SCENARIOVERGELIJKING toe."
    );
  }

  const section11 = sections.find((section) => section.number === 11)?.body ?? "";
  const hasDecisionScore = /\bBesluitscore\b/i.test(section11);
  const hasRisks = /\bBelangrijkste risico/i.test(section11);
  const hasFeasibility = /\bUitvoerbaarheidsanalyse\b/i.test(section11);
  const hasImprovements = /\bAanbevolen verbeteringen\b/i.test(section11);
  if (!hasDecisionScore || !hasRisks || !hasFeasibility || !hasImprovements) {
    throw new ExecutiveGateError(
      "Besluitskwaliteit-sectie is onvolledig.",
      "BOARDROOM_INTELLIGENCE_REQUIRED",
      { hasDecisionScore, hasRisks, hasFeasibility, hasImprovements },
      "Vul sectie 11 met Besluitscore, risico's, uitvoerbaarheid en verbeteringen."
    );
  }

  const section7 = sections.find((section) => section.number === 7)?.body ?? "";
  const boardroomInsights = (section7.match(/\bBOARDROOM INZICHT\b/gi) ?? []).length;
  const hasPowerCore =
    /\bwie heeft besluitmacht\b/i.test(section7) &&
    /\bwie heeft informele invloed\b/i.test(section7) &&
    /\bwaar zit de feitelijke macht\b/i.test(section7);
  if (boardroomInsights < 3 || !hasPowerCore) {
    throw new ExecutiveGateError(
      "Boardroom-intelligentie in sectie 7 is onvolledig.",
      "BOARDROOM_INTELLIGENCE_REQUIRED",
      { boardroomInsights, hasPowerCore },
      "Voeg in sectie 7 minimaal 3 BOARDROOM INZICHT-blokken toe plus expliciete machtstoedeling."
    );
  }

  for (const section of sections) {
    if (section.number <= 10 && /^\s*([-*•]|\d+[.)])\s+/m.test(section.body)) {
      throw new ExecutiveGateError(
        "Bullets buiten sectie 11/12 zijn verboden.",
        "NO_BULLETS_OUTSIDE_8_9",
        { section: section.number },
        "Gebruik in sectie 1-10 alleen doorlopende alinea's zonder bullets."
      );
    }
  }
}
