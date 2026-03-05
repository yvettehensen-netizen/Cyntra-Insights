import { scanAnchorsFromContext } from "@/aurelius/narrative/anchors/anchorScan";
import { anchorValues, extractAnchors } from "@/aurelius/narrative/anchors/anchorExtractor";
import { calculateBesluitdwangScore } from "@/aurelius/narrative/metrics/besluitdwangScore";
import { calculateExecutivePressureIndex } from "@/aurelius/narrative/metrics/executivePressureIndex";
import { calculateInterventieRealiteitScore } from "@/aurelius/narrative/metrics/interventieRealiteitScore";
import { calculateOrganisatieFrictieScore } from "@/aurelius/narrative/metrics/organisatieFrictieScore";
import type { GateCheckResult, GateInput } from "./types";

const HEADINGS = [
  "### 1. BESTUURLIJKE REALITEIT",
  "### 2. HET ONVERMIJDELIJKE CONFLICT",
  "### 3. WAT HIER WERKELIJK BOTST (MACHT & BELANG)",
  "### 4. DE PRIJS VAN UITSTEL",
  "### 5. HET PUNT WAAR HET ONOMKEERBAAR WORDT",
  "### 6. WAT DIT VAN MENSEN VRAAGT",
  "### 7. HET 90-DAGEN BESLUITPLAN",
  "### 8. HET BESTUURLIJK CONTRACT",
] as const;

const REQUIRED_CHOICE_SENTENCE = "Dit betekent dat het bestuur nu moet kiezen voor";
const REQUIRED_CONFLICT_SENTENCE = "Dit conflict kan niet worden opgelost zonder verlies.";

const BANNED_GENERIC_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bstaat onder druk\b/i, label: "staat onder druk" },
  { pattern: /\bmogelijk\b/i, label: "mogelijk" },
  { pattern: /\bzou kunnen\b/i, label: "zou kunnen" },
  { pattern: /\bbelangrijk om\b/i, label: "belangrijk om" },
  { pattern: /\bvaak zien we\b/i, label: "vaak zien we" },
  { pattern: /\bin veel organisaties\b/i, label: "in veel organisaties" },
  { pattern: /\bquick win\b/i, label: "quick win" },
  { pattern: /\blaaghangend fruit\b/i, label: "laaghangend fruit" },
  { pattern: /\bessentieel\b/i, label: "essentieel" },
  { pattern: /\bcruciaal\b/i, label: "cruciaal" },
  { pattern: /\balignment\b/i, label: "alignment" },
  { pattern: /\boptimaliseren\b/i, label: "optimaliseren" },
  { pattern: /\btransformatie\b/i, label: "transformatie" },
  { pattern: /\broadmap\b/i, label: "roadmap" },
  { pattern: /\bblueprint\b/i, label: "blueprint" },
  { pattern: /\bbest practice\b/i, label: "best practice" },
];

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
  const missing = HEADINGS.filter((h) => !headings.includes(h));

  if (sections.length !== 8 || missing.length > 0) {
    return {
      pass: false,
      code: "STRUCTURE_9_HEADINGS_REQUIRED",
      reason: "Exact 8 CYNTRA-headings vereist.",
      details: { count: sections.length, missing },
      repairMode: "FULL_REGEN",
      repairDirective: "Herbouw volledige narrative met exact 8 CYNTRA-secties.",
    };
  }

  const bulletLeak = sections
    .filter((section) => ![7, 8].includes(section.number))
    .some((section) => /^\s*[-*]\s+/m.test(section.body));

  if (bulletLeak) {
    return {
      pass: false,
      code: "STRUCTURE_9_HEADINGS_REQUIRED",
      reason: "Bullets buiten sectie 7 en 8 zijn niet toegestaan.",
      repairMode: "FULL_REGEN",
      repairDirective: "Verwijder bullets buiten sectie 7 en 8.",
    };
  }

  return { pass: true, code: "STRUCTURE_9_HEADINGS_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function mechanismGate(input: GateInput): GateCheckResult {
  const sections = parseSections(input.narrativeText);
  const mechanismRe = /^Omdat\s+.+\s+ontstaat\s+.+\s+en\s+leidt\s+dit\s+tot\s+/i;

  for (const section of sections) {
    const firstSentence = sentences(section.body)[0] ?? "";
    if (!mechanismRe.test(firstSentence)) {
      return {
        pass: false,
        code: "SYSTEM_MECHANISM_REQUIRED",
        reason: `Sectie ${section.number} start niet met verplichte causaliteitsvorm.`,
        details: { section: section.number, firstSentence },
        repairMode: "FULL_REGEN",
        repairDirective: "Start elke sectie exact met: Omdat ... ontstaat ... en leidt dit tot ...",
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
    if (count < 2) {
      return {
        pass: false,
        code: "CAUSAL_DENSITY_REQUIRED",
        reason: `Sectie ${section.number} heeft minder dan 2 causale ketens.`,
        details: { section: section.number, count },
        repairMode: "FULL_REGEN",
        repairDirective: "Voeg per sectie minimaal 2 causale ketens toe.",
      };
    }
  }

  return { pass: true, code: "CAUSAL_DENSITY_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function anchorDisciplineGate(input: GateInput): GateCheckResult {
  const anchors = input.diagnostics.anchors;
  const scan = scanAnchorsFromContext(input.context, input.narrativeText);
  const sectionsWithTwoAnchors = scan.perSectionAnchorsUsed.filter((s) => s.anchorsUsedCount >= 2).length;
  const section7Count = scan.perSectionAnchorsUsed.find((s) => s.section === 7)?.anchorsUsedCount ?? 0;

  if (scan.overallUniqueAnchorsUsed < 6 || sectionsWithTwoAnchors < 6 || section7Count < 10 || scan.unanchoredClaims.length > 0) {
    return {
      pass: false,
      code: "ANCHOR_DISCIPLINE_REQUIRED",
      reason: "Anchor coverage onvoldoende of harde claims zonder anchors.",
      details: {
        overallUniqueAnchorsUsed: scan.overallUniqueAnchorsUsed,
        sectionsWithTwoAnchors,
        section7Count,
        unanchoredClaims: scan.unanchoredClaims.slice(0, 5),
        allowedAnchors: anchors.slice(0, 30),
      },
      repairMode: "ANCHOR_REPAIR",
      repairDirective: "Minimaal 6 unieke anchors, min 2 anchors in 6 secties en min 10 anchors in sectie 7.",
    };
  }

  return { pass: true, code: "ANCHOR_DISCIPLINE_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function powerGate(input: GateInput): GateCheckResult {
  const text = input.narrativeText;
  const formal = /\b(mandaat verschuift|besluitrecht verschuift|formeel verschuift|eigendomsrecht op besluit)\b/i.test(text);
  const informal = /\b(status verliest|autonomie verliest|wint tempo|gatekeeping|stil veto|informele bypass)\b/i.test(text);
  const actors = (text.match(/\b(ceo|cfo|coo|directeur|manager|teamlead|raad van bestuur|rvb|controller|programmaleider)\b/gi) ?? []).length;
  const sabotage = /\b(sabotage|stil veto|omzeilen|bypass|vertraging als machtsmiddel)\b/i.test(text);

  if (!(formal && informal && actors >= 3 && sabotage)) {
    return {
      pass: false,
      code: "POWER_SHIFT_REQUIRED",
      reason: "Machts- en belangsgate faalt.",
      details: { formal, informal, actors, sabotage },
      repairMode: "POWER_REPAIR",
      repairDirective: "Voeg formele en informele machtsverschuiving toe met 3 actoren en 1 sabotage-mechanisme.",
    };
  }

  return { pass: true, code: "POWER_SHIFT_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function irreversibilityGate(input: GateInput): GateCheckResult {
  const section5 = parseSections(input.narrativeText).find((s) => s.number === 5)?.body ?? "";
  const hasTrigger = /Trigger:/i.test(section5);
  const hasDeadline = /Deadline:/i.test(section5);
  const hasIrrev = /Wat daarna niet meer terug te draaien is:/i.test(section5);
  const hasLose = /Wie er definitief verliest:/i.test(section5);
  const hasWin = /Wie structureel wint:/i.test(section5);

  if (!(hasTrigger && hasDeadline && hasIrrev && hasLose && hasWin)) {
    return {
      pass: false,
      code: "IRREVERSIBILITY_REQUIRED",
      reason: "Sectie 5 onomkeerbaarheidsstructuur ontbreekt.",
      details: { hasTrigger, hasDeadline, hasIrrev, hasLose, hasWin },
      repairMode: "IRREVERSIBILITY_REPAIR",
      repairDirective: "Vul sectie 5 exact met Trigger/Deadline/onomkeerbaar/verlies/winst.",
    };
  }

  return { pass: true, code: "IRREVERSIBILITY_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function cultureDriftGate(input: GateInput): GateCheckResult {
  const section6 = parseSections(input.narrativeText).find((s) => s.number === 6)?.body ?? "";
  const drift = /\b(conflictmijding|uitstelgedrag|stil veto|informele bypass|normaliseren van uitzonderingen)\b/i.test(section6);
  const chain = /\b(gedrag.*patroon.*systeemgevolg|gedrag.*leidt tot.*patroon.*leidt tot|gedrag.*patroon.*gevolg)\b/i.test(section6);
  const inzet = /\b(inzet|intentie|inspanning|druk)\b/i.test(section6);

  if (!(drift && chain && inzet)) {
    return {
      pass: false,
      code: "CULTURE_DRIFT_REQUIRED",
      reason: "Culture drift keten of inzet-erkenning ontbreekt in sectie 6.",
      details: { drift, chain, inzet },
      repairMode: "DRIFT_REPAIR",
      repairDirective: "Beschrijf gedrag -> patroon -> systeemgevolg en erken inzet in sectie 6.",
    };
  }

  return { pass: true, code: "CULTURE_DRIFT_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function section7Gate(input: GateInput): GateCheckResult {
  const section7 = parseSections(input.narrativeText).find((s) => s.number === 7)?.body ?? "";
  const interventions = section7.split(/(?=\bActie:)/g).map((s) => s.trim()).filter(Boolean);

  const required = [
    "Actie:",
    "Eigenaar:",
    "Deadline:",
    "KPI:",
    "Escalatiepad:",
    "Direct zichtbaar effect (<=7 dagen):",
    "Casus-anker:",
  ];

  const missingFields = interventions.filter((intervention) =>
    required.some((field) => !intervention.includes(field))
  );
  const hasMonth1 = /MAAND 1 \(1-30\)|MAAND 1 \(1–30\)/i.test(section7);
  const hasMonth2 = /MAAND 2 \(31-60\)|MAAND 2 \(31–60\)/i.test(section7);
  const hasMonth3 = /MAAND 3 \(61-90\)|MAAND 3 \(61–90\)/i.test(section7);
  const hasGates = /dag\s*30/i.test(section7) && /dag\s*60/i.test(section7) && /dag\s*90/i.test(section7);

  const monthBlocks = [
    section7.match(/MAAND 1[\s\S]*?(?=MAAND 2|$)/i)?.[0] ?? "",
    section7.match(/MAAND 2[\s\S]*?(?=MAAND 3|$)/i)?.[0] ?? "",
    section7.match(/MAAND 3[\s\S]*/i)?.[0] ?? "",
  ];
  const monthEscalations = monthBlocks.map((block) => (block.match(/Escalatiepad:/g) ?? []).length);

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
    interventions.length < 6 ||
    missingFields.length > 0 ||
    !(hasMonth1 && hasMonth2 && hasMonth3) ||
    !hasGates ||
    monthEscalations.some((count) => count < 1) ||
    uniqueInterventions < interventions.length
  ) {
    return {
      pass: false,
      code: "SECTION8_INTERVENTION_ARTEFACT_REQUIRED",
      reason: "Sectie 7 besluitplan voldoet niet.",
      details: {
        interventions: interventions.length,
        missingFieldBlocks: missingFields.length,
        hasMonth1,
        hasMonth2,
        hasMonth3,
        hasGates,
        monthEscalations,
        uniqueInterventions,
      },
      repairMode: "SECTION8_REWRITE",
      repairDirective: "Herschrijf alleen sectie 7 met 6 kerninterventies (2 per maand) en verplichte velden.",
    };
  }

  return { pass: true, code: "SECTION8_INTERVENTION_ARTEFACT_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function section8ContractGate(input: GateInput): GateCheckResult {
  const section8 = parseSections(input.narrativeText).find((s) => s.number === 8)?.body ?? "";
  const requiredLabels = [
    "Keuze:",
    "Geaccepteerd verlies:",
    "Besluitrecht ligt bij:",
    "Stoppen per direct:",
    "Niet meer escaleren:",
    "Maandelijkse KPI:",
    "Failure trigger:",
    "Point of no return:",
    "Herijkingsmoment:",
  ];

  const hasPrefix = section8.trimStart().startsWith("Het bestuur committeert zich aan het volgende besluit:");
  const hasChoiceSentence = section8.includes(REQUIRED_CHOICE_SENTENCE);
  const hasConflictSentence = input.narrativeText.includes(REQUIRED_CONFLICT_SENTENCE);
  const missing = requiredLabels.filter((label) => {
    const m = section8.match(new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(.*)`, "i"));
    return !m || !String(m[1] || "").trim();
  });

  if (!hasPrefix || !hasChoiceSentence || !hasConflictSentence || missing.length > 0) {
    return {
      pass: false,
      code: "DECISION_CONTRACT_REQUIRED",
      reason: "Bestuurlijk contract onvolledig.",
      details: { hasPrefix, hasChoiceSentence, hasConflictSentence, missing },
      repairMode: "FULL_REGEN",
      repairDirective: "Vul sectie 8 volledig volgens verplichte labels en slotzin.",
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
      repairDirective: "Genereer volledig nieuwe formulering met andere mechanische ketens.",
    };
  }

  return { pass: true, code: "ANTI_STAGNATION_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function ultraDiepteGate(input: GateInput): GateCheckResult {
  const source = input.narrativeText;
  const bannedHit = BANNED_GENERIC_PATTERNS.find(({ pattern }) => pattern.test(source));
  if (bannedHit) {
    return {
      pass: false,
      code: "GENERIC_FAIL",
      reason: `Verboden generieke taal gedetecteerd: ${bannedHit.label}`,
      details: { forbidden: bannedHit.label },
      repairMode: "FULL_REGEN",
      repairDirective: "Verwijder generieke taal volledig en regenereer casus-gebonden.",
    };
  }

  const sections = parseSections(source);
  const outsideConflict = sections.filter((s) => s.number !== 2).map((s) => s.body).join("\n\n");
  const lossMentions = (outsideConflict.match(/\b(verlies|inlevering|geaccepteerd verlies|opoffering|schade)\b/gi) ?? []).length;
  const financial = /\b(marge|cash|kosten|omzet|budget|contractmacht|financieel)\b/i.test(source);
  const financialMissing = /Niet onderbouwd in geuploade documenten of vrije tekst\.|Niet onderbouwd in geüploade documenten of vrije tekst\./i.test(source);
  const besluitMachtSysteem = /\b(besluit.*macht.*systeem|mandaat.*macht.*systeem|besluitrecht.*macht.*gevolg)\b/i.test(source);
  const timeCoercion = /\b(30 dagen|90 dagen|365 dagen|dag 30|dag 60|dag 90)\b[\s\S]{0,120}\b(gevolg|verlies|onomkeerbaar|irreversibel)\b/i.test(source);
  const requiredChoice = source.includes(REQUIRED_CHOICE_SENTENCE);

  if (lossMentions < 2 || !(financial || financialMissing) || !besluitMachtSysteem || !timeCoercion || !requiredChoice) {
    return {
      pass: false,
      code: "ULTRA_DIEPTE_REQUIRED",
      reason: "Ultra diepte-criteria niet volledig gehaald.",
      details: { lossMentions, financial, financialMissing, besluitMachtSysteem, timeCoercion, requiredChoice },
      repairMode: "ULTRA_DIEPTE_REGEN",
      repairDirective: "Herschrijf met verlieslogica, besluit-macht-systeem en tijdsdwang met gevolg.",
    };
  }

  return { pass: true, code: "ULTRA_DIEPTE_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function warmteGate(input: GateInput): GateCheckResult {
  const source = input.narrativeText;
  const recognition = (source.match(/\b(inzet|intentie|inspanning|toewijding|zorgvuldigheid)\b/gi) ?? []).length;
  const tension = (source.match(/\b(spanning|druk|verlies|frictie|weerstand)\b/gi) ?? []).length;
  const technical = (source.match(/\b(kpi|governance|mandaat|escalatie|contract|besluitrecht|structuur)\b/gi) ?? []).length;
  const clinicalRatio = technical / Math.max(1, technical + recognition + tension);

  if (recognition < 2 || tension < 1 || clinicalRatio > 0.7) {
    return {
      pass: false,
      code: "WARMTE_REQUIRED",
      reason: "Warmte-kalibrator faalt.",
      details: { recognition, tension, technical, clinicalRatio },
      repairMode: "WARMTE_REGEN",
      repairDirective: "Voeg erkenning van inzet en spanning toe zonder besluitkracht te verzachten.",
    };
  }

  return { pass: true, code: "WARMTE_REQUIRED", repairMode: "NONE", repairDirective: "" };
}

function pressureIndexGate(input: GateInput): GateCheckResult {
  const pressure = calculateExecutivePressureIndex(input.narrativeText);
  input.diagnostics.executivePressureIndex = pressure.score;
  if (pressure.score < 70) {
    return {
      pass: false,
      code: "PRESSURE_INDEX_REQUIRED",
      reason: "Executive Pressure Index onder 70.",
      details: pressure,
      repairMode: "FULL_REGEN_PRESSURE_MODE",
      repairDirective: "Verhoog causale dichtheid, verliesverwijzingen, tijdsdwang en keuzezinnen.",
    };
  }
  return { pass: true, code: "PRESSURE_INDEX_REQUIRED", repairMode: "NONE", repairDirective: "", details: pressure };
}

function besluitdwangGate(input: GateInput): GateCheckResult {
  const besluit = calculateBesluitdwangScore(input.narrativeText);
  input.diagnostics.besluitdwangScore = besluit.score;
  if (besluit.score < 75) {
    return {
      pass: false,
      code: "BESLUITDWANG_REQUIRED",
      reason: "Besluitdwang-score onder 75.",
      details: besluit,
      repairMode: "FULL_REGEN_PRESSURE_MODE",
      repairDirective: "Verhoog expliciete keuzezinnen, irreversibiliteit en contractvolledigheid.",
    };
  }
  return { pass: true, code: "BESLUITDWANG_REQUIRED", repairMode: "NONE", repairDirective: "", details: besluit };
}

function interventieRealiteitGate(input: GateInput): GateCheckResult {
  const reality = calculateInterventieRealiteitScore(input.narrativeText, input.diagnostics.anchors);
  input.diagnostics.interventieRealiteitScore = reality.averageScore;
  if (reality.averageScore < 5) {
    return {
      pass: false,
      code: "INTERVENTIE_REALITEIT_REQUIRED",
      reason: "Interventie realiteitscore onder 5.",
      details: reality,
      repairMode: "SECTION8_REWRITE",
      repairDirective: "Herschrijf sectie 7 met concrete interventies en anchor-referenties.",
    };
  }
  return { pass: true, code: "INTERVENTIE_REALITEIT_REQUIRED", repairMode: "NONE", repairDirective: "", details: reality };
}

function organisatieFrictieGate(input: GateInput): GateCheckResult {
  const friction = calculateOrganisatieFrictieScore({ narrativeText: input.narrativeText, context: input.context });
  input.diagnostics.organisatieFrictieScore = friction.score;
  if (friction.contextHasTensionSignals && friction.score < 40) {
    return {
      pass: false,
      code: "ORGANISATIE_FRICTIE_REQUIRED",
      reason: "Frictie-score te laag terwijl input spanning bevat.",
      details: friction,
      repairMode: "FRICTIE_REGEN",
      repairDirective: "Maak tegenstrijdige belangen, mandaatconflict en besluitvertraging expliciet.",
    };
  }
  return { pass: true, code: "ORGANISATIE_FRICTIE_REQUIRED", repairMode: "NONE", repairDirective: "", details: friction };
}

const GATES = [
  structureGate,
  mechanismGate,
  causalDensityGate,
  anchorDisciplineGate,
  powerGate,
  irreversibilityGate,
  cultureDriftGate,
  section7Gate,
  section8ContractGate,
  antiStagnationGate,
  ultraDiepteGate,
  warmteGate,
  pressureIndexGate,
  besluitdwangGate,
  interventieRealiteitGate,
  organisatieFrictieGate,
] as const;

export function runExecutiveGateStack(input: {
  narrativeText: string;
  context: string;
  previousOutput?: string;
}): {
  passed: boolean;
  results: GateCheckResult[];
  firstFailure?: GateCheckResult;
  diagnostics: {
    anchors: string[];
    executivePressureIndex: number;
    besluitdwangScore: number;
    interventieRealiteitScore: number;
    organisatieFrictieScore: number;
  };
} {
  const anchors = anchorValues(extractAnchors(input.context));
  const gateInput: GateInput = {
    narrativeText: input.narrativeText,
    context: input.context,
    diagnostics: {
      anchors,
      previousOutput: input.previousOutput,
      executivePressureIndex: 0,
      besluitdwangScore: 0,
      interventieRealiteitScore: 0,
      organisatieFrictieScore: 0,
    },
  };

  const results: GateCheckResult[] = GATES.map((gate) => gate(gateInput));
  const firstFailure = results.find((result) => !result.pass);

  return {
    passed: !firstFailure,
    results,
    firstFailure,
    diagnostics: {
      anchors,
      executivePressureIndex: gateInput.diagnostics.executivePressureIndex ?? 0,
      besluitdwangScore: gateInput.diagnostics.besluitdwangScore ?? 0,
      interventieRealiteitScore: gateInput.diagnostics.interventieRealiteitScore ?? 0,
      organisatieFrictieScore: gateInput.diagnostics.organisatieFrictieScore ?? 0,
    },
  };
}
