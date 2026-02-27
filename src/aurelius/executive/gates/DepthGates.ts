import { parseInputAnchors } from "@/aurelius/executive/anchor/anchorScan";
import { ExecutiveGateError } from "@/aurelius/executive/types";
import { parseSections } from "./utils";

const ACTOR_RE = /\b(ceo|cfo|coo|chro|cto|rvb|raad van bestuur|directeur|manager|teamlead|planner|projectleider|medisch directeur)\b/i;

export function validateDepthGates(text: string, context: string): void {
  const sections = parseSections(text);
  const all = String(text ?? "");
  const inputAnchors = parseInputAnchors(context).map((anchor) => anchor.toLowerCase());

  const formalShift = /\b(mandaat verschuift|besluitrecht verschuift|mandaatherverdeling|formele macht verschuift)\b/i.test(all);
  const informalShift = /\b(status verliest|autonomie verliest|informeel wint tempo|informeel verliest|onderstroom verschuift)\b/i.test(all);
  const actorBoundLines = all
    .split(/\n+/)
    .filter((line) => ACTOR_RE.test(line) && /\b(verliest|wint|verschuift|krijgt)\b/i.test(line));

  if (!(formalShift && informalShift && actorBoundLines.length >= 2)) {
    throw new ExecutiveGateError(
      "Machtsverschuiving onvoldoende expliciet of actor-gebonden.",
      "POWER_SHIFT_REQUIRED",
      { formalShift, informalShift, actorLines: actorBoundLines.length },
      "POWER REPAIR MODE: benoem 2 machtsverschuivingen (formeel + informeel) met naam/rol uit input."
    );
  }

  const hasPONR = /point of no return/i.test(all);
  const hasTriggerTime = /\b(dag\s*30|dag\s*60|dag\s*90|30\s*dagen|60\s*dagen|90\s*dagen)\b/i.test(all);
  const hasIrreversibleEffect = /\b(onomkeerbaar|irreversibel|reputatie|retentie|contractmacht|uitvoerbaarheid)\b/i.test(all);
  if (!(hasPONR && hasTriggerTime && hasIrreversibleEffect)) {
    throw new ExecutiveGateError(
      "Irreversibiliteit/PoNR ontbreekt.",
      "IRREVERSIBILITY_REQUIRED",
      { hasPONR, hasTriggerTime, hasIrreversibleEffect },
      "IRREVERSIBILITY REPAIR: voeg PoNR toe met dag-trigger en onomkeerbaar gevolg."
    );
  }

  const hasBehaviorShift = /\b(conflictmijding|informele bypass|planners nemen besluiten|teams nemen besluiten|escalatie wordt omzeild)\b/i.test(all);
  const hasConsequence = /\b(leidt tot|resulteert in|met gevolg dat)\b/i.test(all);
  if (!(hasBehaviorShift && hasConsequence)) {
    throw new ExecutiveGateError(
      "Culture drift niet concreet genoeg.",
      "CULTURE_DRIFT_REQUIRED",
      { hasBehaviorShift, hasConsequence },
      "CULTURE REPAIR: beschrijf concreet gedrag + direct bestuurlijk gevolg."
    );
  }

  for (const section of sections) {
    const lower = section.body.toLowerCase();
    const anchorHits = inputAnchors.filter((anchor) => lower.includes(anchor)).length;
    if (section.number <= 8 && anchorHits < 1) {
      throw new ExecutiveGateError(
        `Sectie ${section.number} mist casus-koppeling.`,
        "CASUS_ANCHORS_MIN",
        { section: section.number, anchorHits },
        "Veranker elke sectie expliciet aan minimaal 1 casus-anker."
      );
    }
  }
}
