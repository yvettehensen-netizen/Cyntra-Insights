import { scanAnchorsFromContext } from "@/aurelius/narrative/anchors/anchorScan";
import { anchorValues, extractAnchors } from "@/aurelius/narrative/anchors/anchorExtractor";
import type { GateCheckResult, GateInput } from "./types";

const HEADINGS = [
  "### 1. DOMINANTE BESTUURLIJKE THESE",
  "### 2. HET KERNCONFLICT",
  "### 3. EXPLICIETE TRADE-OFFS",
  "### 4. OPPORTUNITY COST",
  "### 5. GOVERNANCE IMPACT",
  "### 6. MACHTSDYNAMIEK & ONDERSTROOM",
  "### 7. EXECUTIERISICO",
  "### 8. 90-DAGEN INTERVENTIEPLAN",
  "### 9. DECISION CONTRACT",
] as const;

function parseSections(text: string): Array<{ heading: string; number: number; body: string }> {
  const source = String(text ?? "");
  const headingRe = /^###\s*(\d+)\.\s*([^\n]+)$/gm;
  const matches = [...source.matchAll(headingRe)];

  return matches.map((match, idx) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[idx + 1]?.index ?? source.length;
    return {
      heading: match[0].trim(),
      number: Number(match[1] || 0),
      body: source.slice(start, end).replace(/^\n+/, "").trim(),
    };
  });
}

function sentences(text: string): string[] {
  return String(text ?? "").split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function normalizeSentence(sentence: string): string {
  return sentence.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  const union = new Set([...a, ...b]).size;
  return union ? shared / union : 0;
}

function structureGate(input: GateInput): GateCheckResult {
  const sections = parseSections(input.narrativeText);
  const headings = sections.map((s) => s.heading);
  const section8 = sections.find((s) => s.number === 8);

  const missing = HEADINGS.filter((h) => !headings.includes(h));
  if (sections.length !== 9 || missing.length > 0 || !section8 || section8.body.split(/\s+/).length < 900) {
    return {
      pass: false,
      code: "STRUCTURE_9_HEADINGS_REQUIRED",
      reason: "Exact 9 headings + voldoende diepte in sectie 8 vereist.",
      details: { count: sections.length, missing, section8Words: section8?.body.split(/\s+/).length ?? 0 },
      repairMode: "FULL_REGEN",
      repairDirective: "Herbouw volledige narrative met exact 9 headings en sectie 8 >= 900 woorden.",
    };
  }

  return {
    pass: true,
    code: "STRUCTURE_9_HEADINGS_REQUIRED",
    repairMode: "NONE",
    repairDirective: "",
  };
}

function mechanismGate(input: GateInput): GateCheckResult {
  const sections = parseSections(input.narrativeText);
  const mechanismRe = /\b(omdat|waardoor|leidt tot|resulteert in|met gevolg dat)\b/i;

  for (const section of sections) {
    const firstSentence = sentences(section.body)[0] ?? "";
    if (!mechanismRe.test(firstSentence) || /^de organisatie\b/i.test(firstSentence)) {
      return {
        pass: false,
        code: "SYSTEM_MECHANISM_REQUIRED",
        reason: `Sectie ${section.number} start niet mechanisme-first.`,
        details: { section: section.number, firstSentence },
        repairMode: "FULL_REGEN",
        repairDirective: "Start elke sectie met: Omdat X ontstaat Y en leidt dit tot Z.",
      };
    }
  }

  return { pass: true, code: "SYSTEM_MECHANISM_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function causalDensityGate(input: GateInput): GateCheckResult {
  const sections = parseSections(input.narrativeText);
  const chainRe = /\b(omdat|waardoor|leidt tot|resulteert in|met gevolg dat)\b/gi;

  for (const section of sections) {
    const count = (section.body.match(chainRe) ?? []).length;
    if (count < 3) {
      return {
        pass: false,
        code: "CAUSAL_DENSITY_REQUIRED",
        reason: `Sectie ${section.number} heeft minder dan 3 causale ketens.`,
        details: { section: section.number, count },
        repairMode: "FULL_REGEN",
        repairDirective: "Voeg per sectie minimaal 3 causale ketens toe.",
      };
    }
  }

  return { pass: true, code: "CAUSAL_DENSITY_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function anchorDisciplineGate(input: GateInput): GateCheckResult {
  const anchors = input.diagnostics.anchors;
  const scan = scanAnchorsFromContext(input.context, input.narrativeText);
  const sectionsWithTwoAnchors = scan.perSectionAnchorsUsed.filter((s) => s.anchorsUsedCount >= 2).length;
  const section8Count = scan.perSectionAnchorsUsed.find((s) => s.section === 8)?.anchorsUsedCount ?? 0;

  if (scan.overallUniqueAnchorsUsed < 6 || sectionsWithTwoAnchors < 6 || section8Count < 10 || scan.unanchoredClaims.length > 0) {
    return {
      pass: false,
      code: "ANCHOR_DISCIPLINE_REQUIRED",
      reason: "Anchor coverage onvoldoende of harde claims zonder anchors.",
      details: {
        overallUniqueAnchorsUsed: scan.overallUniqueAnchorsUsed,
        sectionsWithTwoAnchors,
        section8Count,
        unanchoredClaims: scan.unanchoredClaims.slice(0, 5),
        allowedAnchors: anchors.slice(0, 30),
      },
      repairMode: "ANCHOR_REPAIR",
      repairDirective:
        "Elke sectie gebruikt minimaal 2 concrete casus-ankers; sectie 8 bevat >=10 anchors; geen claim zonder anchor.",
    };
  }

  return { pass: true, code: "ANCHOR_DISCIPLINE_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function powerGate(input: GateInput): GateCheckResult {
  const text = input.narrativeText;
  const formal = /\b(mandaat verschuift|besluitrecht verschuift|eigenaarschap verschuift|beslismonopolie)\b/i.test(text);
  const informal = /\b(status verliest|autonomie verliest|wint tempo|gatekeeping|informatievoorsprong|stil veto|bypass)\b/i.test(text);
  const actorBound = /\b(ceo|cfo|coo|directeur|manager|teamlead|raad van bestuur|rvb)\b/i.test(text);

  if (!(formal && informal && actorBound)) {
    return {
      pass: false,
      code: "POWER_SHIFT_REQUIRED",
      reason: "Formele/informele machtsverschuiving ontbreekt of niet actor-gebonden.",
      details: { formal, informal, actorBound },
      repairMode: "POWER_REPAIR",
      repairDirective:
        "Voeg 2 expliciete machtsverschuivingen toe: 1 formeel (mandaat/besluitrecht) + 1 informeel (tempo/autonomie/gatekeeping), gekoppeld aan rollen/namen.",
    };
  }

  return { pass: true, code: "POWER_SHIFT_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function irreversibilityGate(input: GateInput): GateCheckResult {
  const text = input.narrativeText;
  const hasPonr = /point of no return/i.test(text);
  const hasTrigger = /\b(trigger|als .* niet .* dag\s*(30|60|90)|failure trigger)\b/i.test(text);
  const hasDeadline = /\b(dag\s*30|dag\s*60|dag\s*90|deadline)\b/i.test(text);
  const hasConsequence = /\b(onomkeerbaar|irreversibel|reputatie|retentie|contractmacht|uitvoerbaarheid)\b/i.test(text);
  const inSection9 = /### 9\. DECISION CONTRACT[\s\S]*point of no return/i.test(text);

  if (!(hasPonr && hasTrigger && hasDeadline && hasConsequence && inSection9)) {
    return {
      pass: false,
      code: "IRREVERSIBILITY_REQUIRED",
      reason: "Point of no return met trigger/deadline/gevolg ontbreekt.",
      details: { hasPonr, hasTrigger, hasDeadline, hasConsequence, inSection9 },
      repairMode: "IRREVERSIBILITY_REPAIR",
      repairDirective:
        "Voeg point of no return toe met trigger + deadline + onomkeerbaar gevolg, en herhaal dit expliciet in sectie 9.",
    };
  }

  return { pass: true, code: "IRREVERSIBILITY_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function cultureDriftGate(input: GateInput): GateCheckResult {
  const drift = /\b(conflictmijding|uitstelgedrag|stil veto|informele bypass|normaliseren van uitzonderingen)\b/i.test(input.narrativeText);
  const chain = /\b(gedrag.*patroon.*gevolg|gedrag.*leidt tot.*systeem|patroon.*resulteert in)\b/i.test(input.narrativeText);

  if (!(drift && chain)) {
    return {
      pass: false,
      code: "CULTURE_DRIFT_REQUIRED",
      reason: "Concrete culture drift keten ontbreekt.",
      details: { drift, chain },
      repairMode: "DRIFT_REPAIR",
      repairDirective:
        "Beschrijf concreet gedrag -> patroon -> systeemgevolg, zonder abstracte cultuurtaal.",
    };
  }

  return { pass: true, code: "CULTURE_DRIFT_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function section8Gate(input: GateInput): GateCheckResult {
  const section8 = parseSections(input.narrativeText).find((s) => s.number === 8)?.body ?? "";
  const interventions = section8.split(/(?=\bActie:)/g).map((s) => s.trim()).filter(Boolean);

  const required = [
    "Actie:",
    "Eigenaar:",
    "Deadline:",
    "KPI:",
    "Escalatiepad:",
    "Direct zichtbaar effect:",
    "Anchor-ref:",
  ];
  const missingFields = interventions.filter((intervention) => required.some((field) => !intervention.includes(field)));
  const anchorList = input.diagnostics.anchors;
  const anchorless = interventions.filter((intervention) => anchorList.every((a) => !intervention.toLowerCase().includes(a.toLowerCase())));
  const hasGates = /dag\s*30/i.test(section8) && /dag\s*60/i.test(section8) && /dag\s*90/i.test(section8);
  const monthEscalations = [
    (section8.split(/MAAND 1[\s\S]*?MAAND 2/i)[0].match(/Escalatiepad:/g) ?? []).length,
    (section8.split(/MAAND 2[\s\S]*?MAAND 3/i)[0].match(/Escalatiepad:/g) ?? []).length,
    (section8.match(/MAAND 3[\s\S]*/)?.[0].match(/Escalatiepad:/g) ?? []).length,
  ];

  const uniquenessKeys = interventions.map((item) =>
    [
      item.match(/Actie:\s*([^\n]+)/i)?.[1] ?? "",
      item.match(/Eigenaar:\s*([^\n]+)/i)?.[1] ?? "",
      item.match(/KPI:\s*([^\n]+)/i)?.[1] ?? "",
    ]
      .join("|")
      .toLowerCase()
  );
  const uniqueInterventions = new Set(uniquenessKeys).size;

  if (
    interventions.length < 15 ||
    missingFields.length > 0 ||
    anchorless.length > 0 ||
    !hasGates ||
    monthEscalations.some((count) => count < 1) ||
    uniqueInterventions < interventions.length
  ) {
    return {
      pass: false,
      code: "SECTION8_INTERVENTION_ARTEFACT_REQUIRED",
      reason: "Sectie 8 interventie-artefact voldoet niet.",
      details: {
        interventions: interventions.length,
        missingFieldBlocks: missingFields.length,
        anchorless: anchorless.length,
        hasGates,
        monthEscalations,
        uniqueInterventions,
      },
      repairMode: "SECTION8_REWRITE",
      repairDirective:
        "Herschrijf alleen sectie 8 met >=15 unieke interventies en verplichte velden + anchors + dag 30/60/90 gates.",
    };
  }

  return { pass: true, code: "SECTION8_INTERVENTION_ARTEFACT_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function decisionContractGate(input: GateInput): GateCheckResult {
  const section9 = parseSections(input.narrativeText).find((s) => s.number === 9)?.body ?? "";
  const requiredLabels = [
    "Keuze:",
    "Accepted loss:",
    "Besluitrecht ligt bij:",
    "Stoppen per direct:",
    "Niet meer escaleren:",
    "Maandelijkse KPI:",
    "Failure trigger:",
    "Point of no return:",
    "Herijkingsmoment:",
  ];

  const hasPrefix = section9.trimStart().startsWith("De Raad van Bestuur committeert zich aan:");
  const missing = requiredLabels.filter((label) => {
    const m = section9.match(new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(.*)`, "i"));
    return !m || !String(m[1] || "").trim();
  });

  if (!hasPrefix || missing.length > 0) {
    return {
      pass: false,
      code: "DECISION_CONTRACT_REQUIRED",
      reason: "Decision contract labels/prefix onvolledig.",
      details: { hasPrefix, missing },
      repairMode: "FULL_REGEN",
      repairDirective: "Vul sectie 9 volledig volgens exact labels en prefix.",
    };
  }

  return { pass: true, code: "DECISION_CONTRACT_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function antiStagnationGate(input: GateInput): GateCheckResult {
  const prev = input.diagnostics.previousOutput;
  if (!prev) {
    return { pass: true, code: "ANTI_STAGNATION_REQUIRED", repairMode: "NONE", repairDirective: "" };
  }

  const topCurrent = sentences(input.narrativeText).slice(0, 10).map(normalizeSentence).filter(Boolean);
  const topPrev = sentences(prev).slice(0, 10).map(normalizeSentence).filter(Boolean);
  const prevSet = new Set(topPrev);
  const overlapCount = topCurrent.filter((line) => prevSet.has(line)).length;
  const overlap = topCurrent.length ? overlapCount / topCurrent.length : 0;

  const tokenSetA = new Set(input.narrativeText.toLowerCase().split(/\W+/).filter(Boolean));
  const tokenSetB = new Set(prev.toLowerCase().split(/\W+/).filter(Boolean));
  const semantic = jaccard(tokenSetA, tokenSetB);

  if (overlap >= 0.4 || semantic >= 0.4) {
    return {
      pass: false,
      code: "ANTI_STAGNATION_REQUIRED",
      reason: "Output lijkt te veel op vorige versie.",
      details: { top10Overlap: overlap, jaccard: semantic },
      repairMode: "FULL_REGEN",
      repairDirective:
        "Genereer volledig nieuwe formulering met andere mechanische ketens en andere interventieframing.",
    };
  }

  return {
    pass: true,
    code: "ANTI_STAGNATION_REQUIRED",
    repairMode: "NONE",
    repairDirective: "",
    details: { top10Overlap: overlap, jaccard: semantic },
  };
}

const GATES = [
  structureGate,
  mechanismGate,
  causalDensityGate,
  anchorDisciplineGate,
  powerGate,
  irreversibilityGate,
  cultureDriftGate,
  section8Gate,
  decisionContractGate,
  antiStagnationGate,
] as const;

export function runExecutiveGateStack(input: {
  narrativeText: string;
  context: string;
  previousOutput?: string;
}): {
  passed: boolean;
  results: GateCheckResult[];
  firstFailure?: GateCheckResult;
  diagnostics: { anchors: string[] };
} {
  const anchors = anchorValues(extractAnchors(input.context));
  const gateInput: GateInput = {
    narrativeText: input.narrativeText,
    context: input.context,
    diagnostics: {
      anchors,
      previousOutput: input.previousOutput,
    },
  };

  const results: GateCheckResult[] = GATES.map((gate) => gate(gateInput));
  const firstFailure = results.find((result) => !result.pass);

  return {
    passed: !firstFailure,
    results,
    firstFailure,
    diagnostics: { anchors },
  };
}
