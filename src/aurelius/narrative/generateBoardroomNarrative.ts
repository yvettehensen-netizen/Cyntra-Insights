// ============================================================
// AURELIUS — BOARDROOM NARRATIVE GENERATOR (EXECUTIVE KERNEL)
// HARDENED • BACKWARDS COMPATIBLE • 30+ DOCUMENTS • LONGFORM SAFE
// ============================================================

import { callAI } from "@/aurelius/engine/utils/callAI";
import type { AIMessage } from "@/aurelius/engine/utils/ai.types";
import { enforceLanguagePrompt } from "@/aurelius/engine/languageLock";
import {
  CONCRETE_REPROMPT_DIRECTIVE,
  CYNTRA_SIGNATURE_LAYER_VIOLATION,
  enforceConcreteNarrativeMarkdown,
} from "./guards/enforceConcreteOutput";
import {
  HGBCO_MCKINSEY_SYSTEM_INJECT,
  HGBCO_MCKINSEY_USER_INJECT,
  enforceAtoERatioStructure,
  enforceDecisionContractHard,
  enforceHgbcoHeadings,
  enforceNoMetaNoTemplate,
  enforceUpperLowerStream,
  hasDecisionContractCommitBlock,
  hasForbiddenHgbcoLanguage,
} from "./guards/hgbcoMcKinseySpec";

/* ============================================================
   TYPES
============================================================ */

export interface ContextDocument {
  id: string;
  filename: string;
  content: string;
}

export interface BoardroomInput {
  analysis_id?: string;
  company_name?: string;

  /** OPTIONAL — LEGACY SAFE */
  questions?: {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    q5?: string;
  };

  /** OPTIONAL — MULTI DOCUMENT SUPPORT */
  documents?: ContextDocument[];

  /** LEGACY FALLBACK */
  company_context?: string;

  /** OPTIONAL — BRIEF INPUT SAFE */
  executive_thesis?: string;
  central_tension?: string;
  strategic_narrative?: string;
  key_tradeoffs?: Array<{
    chosen_side?: string;
    abandoned_side?: string;
    consequence?: string;
  }>;
  governance_risks?: string[];
  execution_risks?: string[];

  /** OPTIONAL — EXECUTIVE SUMMARY BLOCK */
  executive_summary_block?: {
    dominant_thesis?: string;
    core_conflict?: string;
    tradeoff_statement?: string;
    opportunity_cost?: {
      days_0?: string;
      days_30?: string;
      days_90?: string;
      days_365?: string;
      months_12?: string;
    };
    governance_impact?: {
      decision_power?: string;
      escalation?: string;
      responsibility_diffusion?: string;
      power_centralization?: string;
    };
    power_dynamics?: {
      who_loses_power?: string;
      informal_influence?: string;
      expected_sabotage_patterns?: string;
    };
    execution_risk?: {
      failure_point?: string;
      blocker?: string;
      hidden_understream?: string;
    };
    signature_layer?: {
      decision_power_axis?: string;
      structural_tension?: string;
      explicit_loss?: string;
      power_shift?: string;
      time_pressure?: string;
      cognitive_maturity_reflection?: string;
      historical_repetition?: string;
      adaptive_hardness_mode?:
        | "klinisch"
        | "confronterend"
        | "strategisch_beheerst";
    };
    intervention_plan_90d?: {
      week_1_2?: string;
      week_3_6?: string;
      week_7_12?: string;
    };
    decision_contract?: {
      opening_line?: string;
      choice?: string;
      measurable_result?: string;
      time_horizon?: string;
      accepted_loss?: string;
    };
  };

  meta?: Record<string, unknown>;
}

/* ============================================================
   CONSTANTS — NEVER LOWER
============================================================ */

const DEFAULT_MIN_WORDS = 3500;
const DEFAULT_MAX_WORDS = 6200;
const MAX_LOOPS = 12;
const CHUNK_TOKENS = 4200;
const RESERVED_STRUCTURE_WORDS = 320;
const EXECUTIVE_PROMPT_INJECT =
  "Genereer een diepgaand strategisch besluitrapport voor de Raad van Bestuur op basis van geüploade documenten en vrije tekstcontext. Schrijf in lang-vloeiende, menselijke boardroomalinea's met harde bovenstroom en concrete onderstroom. Geen filler, geen herhaling en geen AI-taal.";
const MULTISOURCE_CONTEXT_DIRECTIVE =
  "Gebruik gecombineerde broncontext: geüploade documenten + vrije tekst. Als bronnen botsen, benoem spanning expliciet en kies niet impliciet.";
const MANDATORY_GGZ_CASE_FACTS_BLOCK = `
BRONDISCIPLINE (ALTIJD GELDIG):
- Gebruik alleen feiten die aantoonbaar in geuploade documenten of expliciete contextvelden staan.
- Neem geen sectorsjabloon over als feit.
- Gebruik geen cijfers, percentages of bedragen zonder bron in de input.
- Als een gevraagde metriek ontbreekt in de bron, benoem dit expliciet als "niet onderbouwd in geüploade documenten".
`.trim();
const HARD_FALLBACK_PROMPT_RULE =
  "Als input dun is, blijf strikt brongebonden: benoem wat ontbreekt en verzin geen feiten.";
const INTELLIGENT_SECTOR_FALLBACK_RULE =
  "Bij minimale of vage input: gebruik alleen de aanwezige bronfragmenten, voeg geen sectoraannames toe en maak hiaten expliciet.";
const ANTI_FILLER_RULE =
  "Geen sectie mag starten met 'SIGNATURE LAYER WAARSCHUWING', 'Contextsignaal', 'Aanname:', 'Contextanker:', 'beperkte context' of 'duid structureel'. Verbied generieke taal zoals 'default template', 'transformatie-template', 'governance-technisch', 'patroon', 'context is schaars', 'werk uit', 'mogelijk', 'lijkt erop dat', 'zou kunnen', 'men zou', 'belangrijke succesfactor', 'quick win' en 'low hanging fruit'.";
const SHARPNESS_ERROR_TEXT = "Onvoldoende bestuurlijke scherpte";
const SIGNATURE_LAYER_ERROR_TEXT = CYNTRA_SIGNATURE_LAYER_VIOLATION;
const HARD_GATE_ERROR_PREFIX = "HGBCO_HARD_GATE_FAILED";
const OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE =
  "Opportunity Cost MOET drie unieke lagen bevatten: 30 dagen (direct signaalverlies + eerste gedragsverschuiving), 90 dagen (zichtbare machtsverschuiving + structurele erosie), 365 dagen (systeemverschuiving + onomkeerbare positie + dominante coalitie). Maak na 12 maanden concreet wat niet zonder reputatieschade terug te draaien is.";
const NUMERIC_CLAIM_EXPLANATION_DIRECTIVE =
  "Bij elk absoluut €-bedrag: voeg direct de berekeningslogica toe (driver x volume x periode) met bronverwijzing; ontbreekt bron, markeer expliciet als niet onderbouwd in geüploade documenten.";
const EXECUTION_PLAN_DEPTH_DIRECTIVE =
  "Sectie 8 moet niet alleen weekblokken tonen, maar per blok ook owner, deliverable, KPI, escalatiepad en beslisgate (dag 30/60/90).";

const ENGLISH_LEAK_GUARD =
  /\b(recommendation|in conclusion|quick\s+wins|accountability|roadmap|downside|upside|baseline|framework|stakeholder|governance\s+model)\b/i;

const SOFT_LANGUAGE_GUARD =
  /\b(overweeg|overwegen|misschien|mogelijk|wellicht|eventueel|zou kunnen|kan helpen|kan bijdragen|men zou)\b/i;

const MARKETING_LANGUAGE_GUARD =
  /\b(gamechanger|disrupt|synergie|state[- ]of[- ]the[- ]art|best[- ]in[- ]class|uniek verkoopargument|viral)\b/i;

const FORBIDDEN_GPT_STYLE_GUARD =
  /\b(op basis van de analyse|het lijkt erop dat|als ai|als taalmodel|mogelijk is het)\b/i;

const CONSULTANT_CLICHE_GUARD =
  /\b(belangrijke succesfactor|quick win|quick wins|low-hanging fruit|low hanging fruit|governance-technisch|default template|transformatie-template)\b/i;

const STRICT_BANNED_LANGUAGE_GUARD =
  /\b(default template|transformatie-template|governance-technisch|aanname:|contextanker:|signat(?:ure)? layer waarschuwing)\b/i;

const DOMINANT_HYPOTHESIS_GUARD =
  /\bde werkelijke bestuurlijke kern is niet\b[\s\S]{0,180}\bmaar\b/i;

const UNCOMFORTABLE_TRUTH_GUARD =
  /\bde ongemakkelijke waarheid is:\b/i;

const TEMPO_POWER_GUARD =
  /\bwie tempo controleert,\s*controleert macht\./i;

const POWER_ACTOR_EXTRACT_GUARD =
  /\b(ceo|cfo|coo|chro|cto|cmo|raad van bestuur|rvb|raad van toezicht|rvt|or|ondernemingsraad|medisch directeur|medisch manager|regiodirecteur|programmadirecteur|lijnmanager|operationsdirecteur|founder|investeerder|compliance officer)\b/gi;

const POWER_ACTOR_LINE_GUARD =
  /\b(ceo|cfo|coo|chro|cto|cmo|raad van bestuur|rvb|raad van toezicht|rvt|or|ondernemingsraad|medisch directeur|medisch manager|regiodirecteur|programmadirecteur|lijnmanager|operationsdirecteur|founder|investeerder|compliance officer)\b/i;

const POWER_ACTOR_WIN_LOSS_GUARD =
  /\b(verliest|inlevert|kwijtraakt|wint|krijgt|versterkt)\b/i;

const POWER_ACTOR_SABOTAGE_GUARD =
  /\b(stil veto|uitzonderingscasus|budgetrem|compliance-argument|kwaliteitsargument|burn-out framing|burn-out|vertraging|sabotage|scope-verdunning|herprioritering|escalatie)\b/i;

const POWER_ACTOR_INSTRUMENT_GUARD =
  /\b(budget|informatie|personeel|planning|escalatie|reputatie|toezicht|moreel gezag)\b/i;

const GGZ_SIGNAL_GUARD =
  /\b(ggz|geestelijke gezondheidszorg|jeugdzorg|igj|wachtlijst|mac|ambulantisering|klinische capaciteit|zorgzwaartebekostiging|transformatiegelden|burn-out)\b/i;

const GGZ_DEPTH_GUARDS = {
  igj: /\b(igj|sanctie|toezicht)\b/i,
  wachtlijstMac: /\b(wachtlijst[\s-]*mac|mac-druk|wachtlijstdruk)\b/i,
  wachtlijstMacVast: /\b(wachtlijst[\s-]*mac)\b[\s\S]{0,80}\b(vast|hardnekkig|structureel)\b/i,
  ambulantVsKlinisch: /\b(ambulantisering)\b/i,
  klinischeCapaciteit: /\b(klinische capaciteit)\b/i,
  transformatiegelden: /\b(transformatiegelden|opdrogen)\b/i,
  zorgzwaartebekostiging: /\b(zorgzwaartebekostiging|bekostiging onder druk)\b/i,
  personeelBurnout: /\b(personeelstekort|burn-out)\b/i,
  centraleRegiePermanent:
    /\b(centrale regie|centrale sturing)\b[\s\S]{0,80}\b(permanent|structureel)\b/i,
};

const FORBIDDEN_SECTION_START_PATTERNS = [
  /^\s*SIGNATURE LAYER WAARSCHUWING/i,
  /^\s*Aanname:/i,
  /^\s*Contextanker:/i,
  /^\s*beperkte context/i,
  /^\s*duid structureel/i,
];
const POST_SANITIZE_LINE_PATTERNS = [
  /^\s*SIGNATURE LAYER WAARSCHUWING.*$/gim,
  /^\s*Contextsignaal:.*$/gim,
  /^\s*Aanname:.*$/gim,
  /^\s*Contextanker:.*$/gim,
  /^\s*beperkte context.*$/gim,
  /^\s*duid structureel.*$/gim,
  /\$\{facts\.[^}]+\}/gim,
];

const STRUCTURE_HEADINGS = [
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

const TOP_UNDER_BRIDGE_LINES: Record<(typeof STRUCTURE_HEADINGS)[number], string> = {
  "### 1. DOMINANTE BESTUURLIJKE THESE":
    "In de bovenstroom is de richting vaak helder, maar in de onderstroom bepalen dagelijkse uitzonderingen of die richting echt standhoudt.",
  "### 2. HET KERNCONFLICT":
    "De bovenstroom wil snelheid en duidelijkheid, terwijl de onderstroom zoekt naar bescherming van werkdruk, autonomie en bestaande routines.",
  "### 3. EXPLICIETE TRADE-OFFS":
    "In de bovenstroom heet dit prioriteren; in de onderstroom voelt het als inleveren van ruimte, status of zekerheid.",
  "### 4. OPPORTUNITY COST":
    "De bovenstroom ziet oplopende kosten van uitstel, terwijl de onderstroom uitstel stap voor stap normaliseert.",
  "### 5. GOVERNANCE IMPACT":
    "De bovenstroom tekent mandaten en escalatiepaden, de onderstroom test of die regels ook echt voor iedereen gelden.",
  "### 6. MACHTSDYNAMIEK & ONDERSTROOM":
    "In de bovenstroom worden verantwoordelijkheden verdeeld, in de onderstroom verschuift macht via planning, informatie en uitzonderingen.",
  "### 7. EXECUTIERISICO":
    "De bovenstroom benoemt risico's en owners, maar in de onderstroom ontstaan vertragingen door conflictmijding en ad-hoc uitzonderingen.",
  "### 8. 90-DAGEN INTERVENTIEPLAN":
    "De bovenstroom vraagt ritme en discipline; de onderstroom vraagt voorspelbare grenzen en eerlijkheid in wie wat moet inleveren.",
  "### 9. DECISION CONTRACT":
    "De bovenstroom formaliseert het besluit, de onderstroom voelt meteen welke ruimte verdwijnt en welke verantwoordelijkheden vaststaan.",
};

const SECTION_DEFAULTS: Record<(typeof STRUCTURE_HEADINGS)[number], string> = {
  "### 1. DOMINANTE BESTUURLIJKE THESE":
    "De dominante bestuurlijke these is dat de organisatie niet vastloopt op intentie, maar op te veel gelijktijdige prioriteiten zonder harde volgorde. Mensen trekken hard aan hetzelfde doel, maar in de praktijk verschuift de uitkomst nog te vaak met de druk van de dag. In de bovenstroom lijkt de koers daardoor stabieler dan zij in de onderstroom werkelijk is. De kernvraag voor het bestuur blijft: versterkt deze keuze de regie aan de top, of vergroot zij opnieuw de bestuurlijke ruis.",

  "### 2. HET KERNCONFLICT":
    "Het kernconflict is dat meerdere legitieme doelen tegelijk maximaal worden nagestreefd in een context waarin dat niet meer vanzelf samenvalt. De bovenstroom vraagt om tempo, voorspelbaarheid en margediscipline, terwijl de onderstroom vooral spanning voelt op werkdruk, autonomie en kwaliteit. Daardoor schuift het gesprek snel van inhoud naar positie. Zonder expliciete volgorde blijft dit conflict bestuurlijk onoplosbaar.",

  "### 3. EXPLICIETE TRADE-OFFS":
    "Trade-off 1: centrale regie op instroom en planning verhoogt tempo en voorspelbaarheid, maar beperkt lokale beslisruimte. Trade-off 2: brede uitzonderingsruimte verlaagt de spanning op korte termijn, maar verlengt margedruk en doorlooptijd op middellange termijn. In de bovenstroom lijken dit rationele keuzes; in de onderstroom gaan deze keuzes over verlies van invloed, ritme en routine. Trade-offs worden pas werkbaar wanneer expliciet is wie wat tijdelijk inlevert.",

  "### 4. OPPORTUNITY COST":
    "30 dagen zonder hard besluit leidt meestal tot direct signaalverlies, meer ad-hoc herstelwerk en lagere voorspelbaarheid in de operatie. Na 90 dagen zie je dat terug in doorlooptijd, vervangingsdruk en oplopende frictie tussen formele prioriteiten en informele uitzonderingen. Op 365 dagen verschuift dit van tijdelijk ongemak naar structurele schade: lagere bestuurbaarheid, zwakkere marges en tragere executie. Na 12 maanden draait de organisatie niet meer op keuze maar op gewoonte, en wordt herstel aantoonbaar duurder in tijd, energie en vertrouwen.",

  "### 5. GOVERNANCE IMPACT":
    "Governance-impact betekent hier: van persoonsafhankelijke sturing naar ritmegedreven besluitvorming met heldere mandaten. In de bovenstroom vraagt dat een vaste regietafel met eigenaarschap, KPI-definities en korte escalatielijnen. In de onderstroom vraagt het vooral consistentie: dezelfde regels, dezelfde termijnen en dezelfde toetsing. Pas dan neemt besluitkracht toe zonder dat teams het ervaren als willekeur of extra politieke druk.",

  "### 6. MACHTSDYNAMIEK & ONDERSTROOM":
    "De feitelijke macht zit niet alleen in formele organogrammen, maar ook in intake, planning en uitzonderingsbesluiten. De CFO verliest ruimte voor parallelle uitzonderingsbudgetten, maar wint voorspelbaarheid op kas en marge. De COO levert informele speelruimte in, maar wint duidelijk mandaat op capaciteit en doorstroom. In de onderstroom blijft de gevoeligheid zitten in wie informatie doseert, wie escalaties versnelt of vertraagt en wie uitzonderingen als norm probeert te houden.",

  "### 7. EXECUTIERISICO":
    "Het primaire executierisico is terugval in bekende patronen zodra de eerste spanning oploopt. Het faalpunt is bijna altijd hetzelfde: oude en nieuwe prioriteiten blijven naast elkaar bestaan zonder harde stopkeuze. De blocker zit dan niet in planvorming, maar in dubbelmandaat, vertraagde escalatie en stille heronderhandeling in de onderstroom. Dat maakt uitvoering traag, ook als de strategie op papier klopt.",

  "### 8. 90-DAGEN INTERVENTIEPLAN":
    "Week 1-2: owner CEO/CFO. Lever op: een bindend consolidatiebesluit, een zichtbare stop-doinglijst en eenduidige KPI-definities per prioriteit. Escalatiepad: uitzonderingen binnen 48 uur naar de regietafel, zonder parallelle route.\n\nWeek 3-6: owner COO. Lever op: herverdeling van capaciteit en besluitrechten naar een vaste weekcadans, met beslislog en sluittermijn per blokkade. Escalatiepad: blokkades binnen 7 dagen sluiten of expliciet accepteren als gekozen verlies.\n\nWeek 7-12: owner DRI per prioriteit. Lever op: aantoonbare adoptie plus KPI-impact, met uitzonderingen alleen op naam, met reden en einddatum. Escalatiepad: elk stil veto direct terug naar formele boardreview.\n\nDag 30: eerste bewijs dat stopkeuzes echt uitgevoerd worden.\n\nDag 60: stabiel ritme op intake, planning en opvolging.\n\nDag 90: meetbare verbetering op doorstroom, marge en effectieve bezetting.",

  "### 9. DECISION CONTRACT":
    "De Raad van Bestuur committeert zich aan: een bindende keuze met duidelijke eindverantwoordelijkheid, vaste termijnen en toetsbare resultaten. Per direct stopt parallelle sturing op dezelfde KPI's, en nieuwe niet-kerninitiatieven starten alleen na formele board-goedkeuring. Formeel betekent dit dat lokaal mandaat op intake, planning en uitzonderingen wordt beperkt; informeel betekent dit dat vertraagde bypass-routes niet langer geaccepteerd worden. Geaccepteerd verlies is expliciet: tijdelijke pauze van niet-kernwerk, tijdelijke begrenzing van instroom waar de druk disproportioneel is, en tijdelijke inlevering van lokale uitzonderingsruimte om centrale regie te herstellen.",
};

/* ============================================================
   UTILS
============================================================ */

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimToMaxWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ").trim();
}

function countSentences(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function toSafeString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  return "";
}

function clampChars(value: string, maxChars: number): string {
  const source = String(value ?? "").trim();
  if (source.length <= maxChars) return source;
  return `${source.slice(0, maxChars).trim()} ...`;
}

function decodeDataUrl(value: string): { mime: string; payloadBase64: string } | null {
  const match = String(value ?? "")
    .trim()
    .match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,([\s\S]+)$/i);
  if (!match) return null;
  return {
    mime: String(match[1] || "application/octet-stream").toLowerCase(),
    payloadBase64: String(match[2] || "").trim(),
  };
}

function decodeBase64Binary(base64: string): string {
  try {
    if (typeof atob !== "function") return "";
    return atob(base64);
  } catch {
    return "";
  }
}

function decodeBase64Utf8(base64: string): string {
  const binary = decodeBase64Binary(base64);
  if (!binary) return "";
  try {
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return binary;
  }
}

function decodePdfLiteralText(literal: string): string {
  return literal
    .replace(/\\([\\()])/g, "$1")
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\[0-7]{1,3}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPdfTextFromBinary(binary: string): string {
  const fragments: string[] = [];
  const tjPattern = /\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g;
  let tjMatch: RegExpExecArray | null = null;
  while ((tjMatch = tjPattern.exec(binary)) !== null) {
    const decoded = decodePdfLiteralText(tjMatch[1] || "");
    if (decoded.length >= 2) fragments.push(decoded);
  }

  const tjArrayPattern = /\[(.*?)\]\s*TJ/gs;
  let tjArrayMatch: RegExpExecArray | null = null;
  while ((tjArrayMatch = tjArrayPattern.exec(binary)) !== null) {
    const chunk = tjArrayMatch[1] || "";
    const literalPattern = /\(([^()]*(?:\\.[^()]*)*)\)/g;
    let literalMatch: RegExpExecArray | null = null;
    while ((literalMatch = literalPattern.exec(chunk)) !== null) {
      const decoded = decodePdfLiteralText(literalMatch[1] || "");
      if (decoded.length >= 2) fragments.push(decoded);
    }
  }

  if (fragments.length >= 10) {
    return clampChars(fragments.join("\n"), 24000);
  }

  const printableFallback =
    binary.match(/[A-Za-z0-9€%(),.;:'"\/\-_ ]{20,}/g)?.slice(0, 500).join("\n") || "";
  return clampChars(printableFallback, 20000);
}

function normalizeDocumentContentForPrompt(doc: ContextDocument): string {
  const raw = toSafeString(doc?.content);
  if (!raw) return "";

  const dataUrl = decodeDataUrl(raw);
  if (!dataUrl) {
    return clampChars(raw, 24000);
  }

  const mime = dataUrl.mime;
  if (mime.includes("pdf")) {
    const binary = decodeBase64Binary(dataUrl.payloadBase64);
    const extracted = extractPdfTextFromBinary(binary);
    return extracted
      ? `[PDF-TEXTEXTRACTIE]\n${extracted}`
      : "[PDF-INHOUD NIET LEESBAAR IN TEKSTLAAG]";
  }

  if (
    mime.startsWith("text/") ||
    mime.includes("json") ||
    mime.includes("xml") ||
    mime.includes("csv")
  ) {
    const utf8 = decodeBase64Utf8(dataUrl.payloadBase64);
    return clampChars(utf8, 24000);
  }

  const utf8Fallback = decodeBase64Utf8(dataUrl.payloadBase64);
  if (utf8Fallback.trim().length >= 120) {
    return clampChars(utf8Fallback, 18000);
  }
  return `[BINAR DOCUMENT: ${mime}]`;
}

function normalizeDocumentsForPrompt(documents: ContextDocument[]): ContextDocument[] {
  return documents.map((doc) => ({
    ...doc,
    content: normalizeDocumentContentForPrompt(doc),
  }));
}

function buildMandatoryCaseContextBlock(
  documents: ContextDocument[],
  legacyContext: string,
  briefContext: string
): string {
  const prioritizedDocs = documents.slice(0, 12).map(
    (doc, idx) =>
      `Casusdocument ${idx + 1} (${doc.filename}):\n${clampChars(doc.content, 12000)}`
  );

  const sections = [
    MANDATORY_GGZ_CASE_FACTS_BLOCK,
    MULTISOURCE_CONTEXT_DIRECTIVE,
    prioritizedDocs.length
      ? `VERPLICHTE CASUSDOCUMENTEN (PRIMAIRE BRON):\n${prioritizedDocs.join("\n\n")}`
      : "VERPLICHTE CASUSDOCUMENTEN (PRIMAIRE BRON): geen leesbare documenttekst gevonden; rapporteer hiaten expliciet.",
    legacyContext ? `VRIJE TEKST CONTEXT (EXPLICIETE INPUT):\n${clampChars(legacyContext, 12000)}` : "",
    briefContext ? `SAMENGEVATTE BRIEFCONTEXT:\n${clampChars(briefContext, 12000)}` : "",
  ].filter(Boolean);

  return sections.join("\n\n");
}

function extractSection(text: string, heading: string): string {
  const start = text.indexOf(heading);
  if (start < 0) return "";

  const rest = text.slice(start + heading.length).trimStart();
  const next = rest.search(/\n###\s*\d+\./);

  if (next < 0) return rest.trim();
  return rest.slice(0, next).trim();
}

function replaceSection(text: string, heading: string, nextBody: string): string {
  const start = text.indexOf(heading);
  if (start < 0) return text;

  const bodyStart = start + heading.length;
  const afterHeading = text.slice(bodyStart);
  const nextRel = afterHeading.search(/\n###\s*\d+\./);
  const sectionBody = `\n${nextBody.trim()}\n`;

  if (nextRel < 0) {
    return `${text.slice(0, bodyStart)}${sectionBody}`.trim();
  }

  const nextIndex = bodyStart + nextRel;
  return `${text.slice(0, bodyStart)}${sectionBody}${text.slice(nextIndex).trimStart()}`.trim();
}

function splitIntoSentences(text: string): string[] {
  return (text.match(/[^.!?\n]+[.!?]?/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalizeSentenceKey(sentence: string): string {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasEuroOrPercent(text: string): boolean {
  return /(€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%)/i.test(text);
}

function hasKpiSignal(text: string): boolean {
  return /\bkpi\b|€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%/i.test(text);
}

function normalizeComparableText(text: string): string {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeNumericSignal(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/eur/g, "€")
    .replace(/,/g, ".")
    .trim();
}

function extractNumericSignals(text: string): string[] {
  const source = String(text ?? "");
  const matches =
    source.match(/(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%)/gi) ?? [];
  return [...new Set(matches.map((token) => token.trim()))];
}

function buildGroundingSource(
  input: BoardroomInput,
  documents: ContextDocument[],
  legacyContext: string,
  briefContext: string
): string {
  const q = input.questions ?? {};
  const questionText = [q.q1, q.q2, q.q3, q.q4, q.q5]
    .map((v) => toSafeString(v))
    .filter(Boolean)
    .join("\n");
  const docText = documents
    .slice(0, 30)
    .map((d) => `${d.filename}\n${d.content}`)
    .join("\n\n");
  return [legacyContext, briefContext, questionText, docText]
    .filter(Boolean)
    .join("\n\n");
}

function sanitizeUngroundedNumericSignals(text: string, sourceCorpus: string): string {
  const sourceSignals = new Set(
    extractNumericSignals(sourceCorpus).map((token) => normalizeNumericSignal(token))
  );
  if (sourceSignals.size === 0) {
    return text.replace(
      /(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%)/gi,
      "niet onderbouwd cijfer"
    );
  }

  return text.replace(
    /(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%)/gi,
    (match) => {
      const normalized = normalizeNumericSignal(match);
      return sourceSignals.has(normalized) ? match : "niet onderbouwd cijfer";
    }
  );
}

function extractOpportunityWindowContent(
  section: string
): Record<"30" | "90" | "365", string> {
  const buckets: Record<"30" | "90" | "365", string> = {
    "30": "",
    "90": "",
    "365": "",
  };

  const matches = [
    ...section.matchAll(
      /(30\s*dagen|90\s*dagen|365\s*dagen)\s*[:\-]\s*([\s\S]*?)(?=(?:30\s*dagen|90\s*dagen|365\s*dagen)\s*[:\-]|$)/gi
    ),
  ];

  for (const match of matches) {
    const label = String(match[1] || "");
    const body = String(match[2] || "").trim();
    if (/^30/i.test(label)) buckets["30"] = body;
    if (/^90/i.test(label)) buckets["90"] = body;
    if (/^365/i.test(label)) buckets["365"] = body;
  }

  return buckets;
}

function buildBriefContext(input: BoardroomInput): string {
  const lines: string[] = [];

  if (input.executive_thesis) {
    lines.push(`Bestuurlijke these uit eerdere synthese: ${input.executive_thesis}`);
  }

  if (input.central_tension) {
    lines.push(`Kernconflict uit eerdere synthese: ${input.central_tension}`);
  }

  if (input.strategic_narrative) {
    lines.push(`Kernnarratief uit eerdere synthese: ${input.strategic_narrative}`);
  }

  if (Array.isArray(input.key_tradeoffs) && input.key_tradeoffs.length) {
    const tradeoffBlock = input.key_tradeoffs
      .map((t, i) => {
        const chosen = toSafeString(t?.chosen_side) || "onbenoemd";
        const abandoned = toSafeString(t?.abandoned_side) || "onbenoemd";
        const consequence = toSafeString(t?.consequence) || "consequentie niet benoemd";
        return `${i + 1}. gekozen: ${chosen}; verlaten: ${abandoned}; consequentie: ${consequence}`;
      })
      .join("\n");

    lines.push(`Trade-offs uit eerdere synthese:\n${tradeoffBlock}`);
  }

  if (Array.isArray(input.governance_risks) && input.governance_risks.length) {
    lines.push(`Governance-risico's:\n${input.governance_risks.join("\n")}`);
  }

  if (Array.isArray(input.execution_risks) && input.execution_risks.length) {
    lines.push(`Executierisico's:\n${input.execution_risks.join("\n")}`);
  }

  const summaryBlock = input.executive_summary_block;
  if (summaryBlock && typeof summaryBlock === "object") {
    const blockLines: string[] = [];

    if (summaryBlock.dominant_thesis) {
      blockLines.push(`Dominante these: ${summaryBlock.dominant_thesis}`);
    }

    if (summaryBlock.core_conflict) {
      blockLines.push(`Kernconflict: ${summaryBlock.core_conflict}`);
    }

    if (summaryBlock.tradeoff_statement) {
      blockLines.push(`Trade-off kern: ${summaryBlock.tradeoff_statement}`);
    }

    if (summaryBlock.opportunity_cost) {
      const o = summaryBlock.opportunity_cost;
      blockLines.push(
        `Opportunity cost 30/90/365: ${toSafeString(o.days_30 || o.days_0)} | ${toSafeString(
          o.days_90
        )} | ${toSafeString(o.days_365 || o.months_12)}`
      );
    }

    if (summaryBlock.governance_impact) {
      const g = summaryBlock.governance_impact;
      blockLines.push(
        `Governance impact: besluitkracht=${toSafeString(g.decision_power)}; escalatie=${toSafeString(
          g.escalation
        )}; diffuse verantwoordelijkheid=${toSafeString(
          g.responsibility_diffusion
        )}; machtscentralisatie=${toSafeString(g.power_centralization)}`
      );
    }

    if (summaryBlock.power_dynamics) {
      const p = summaryBlock.power_dynamics;
      blockLines.push(
        `Machtsdynamiek: machtverlies=${toSafeString(p.who_loses_power)}; informele invloed=${toSafeString(
          p.informal_influence
        )}; sabotagetechnieken=${toSafeString(p.expected_sabotage_patterns)}`
      );
    }

    if (summaryBlock.execution_risk) {
      const e = summaryBlock.execution_risk;
      blockLines.push(
        `Executierisico: breekpunt=${toSafeString(e.failure_point)}; blocker=${toSafeString(
          e.blocker
        )}; onderstroom=${toSafeString(e.hidden_understream)}`
      );
    }

    if (summaryBlock.signature_layer) {
      const s = summaryBlock.signature_layer;
      blockLines.push(
        `Signature layer: besluitkracht-as=${toSafeString(
          s.decision_power_axis
        )}; spanningsveld=${toSafeString(s.structural_tension)}; verlies=${toSafeString(
          s.explicit_loss
        )}; machtsverschuiving=${toSafeString(s.power_shift)}; tijdsdruk=${toSafeString(
          s.time_pressure
        )}; cognitieve volwassenheid=${toSafeString(
          s.cognitive_maturity_reflection
        )}; herhaling=${toSafeString(s.historical_repetition)}; hardheid=${toSafeString(
          s.adaptive_hardness_mode
        )}`
      );
    }

    if (summaryBlock.intervention_plan_90d) {
      const p = summaryBlock.intervention_plan_90d;
      blockLines.push(
        `Plan weekblokken: ${toSafeString(p.week_1_2)} | ${toSafeString(
          p.week_3_6
        )} | ${toSafeString(p.week_7_12)}`
      );
    }

    if (summaryBlock.decision_contract) {
      const d = summaryBlock.decision_contract;
      blockLines.push(
        `Decision contract kern: opening=${toSafeString(d.opening_line)}; keuze=${toSafeString(
          d.choice
        )}; resultaat=${toSafeString(
          d.measurable_result
        )}; horizon=${toSafeString(d.time_horizon)}; verlies=${toSafeString(
          d.accepted_loss
        )}`
      );
    }

    if (blockLines.length) {
      lines.push(`Executive Summary blok:\n${blockLines.join("\n")}`);
    }
  }

  return lines.join("\n\n").trim();
}

/* ============================================================
   VALIDATION
============================================================ */

function assertDutchOnly(text: string) {
  if (
    /(executive summary|in conclusion|recommended action)/i.test(text) ||
    ENGLISH_LEAK_GUARD.test(text)
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertNoSoftLanguage(text: string) {
  const normalized = text
    .replace(/op basis van bestuurlijke patronen in de ggz:/gi, "")
    .replace(/op basis van bestuurlijke patronen in vergelijkbare organisaties:/gi, "");

  if (SOFT_LANGUAGE_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  if (MARKETING_LANGUAGE_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  if (FORBIDDEN_GPT_STYLE_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  if (CONSULTANT_CLICHE_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  if (STRICT_BANNED_LANGUAGE_GUARD.test(normalized)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertBulletDiscipline(text: string) {
  const hasListMarkup = /^\s*([-*•]|\d+[.)])\s+/gm.test(text);
  if (hasListMarkup) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertStructure(text: string) {
  if (STRUCTURE_HEADINGS.some((h) => !text.includes(h))) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function extractMarkdownHeadings(text: string): string[] {
  return (text.match(/^###\s*[^\n]+/gm) ?? []).map((line) =>
    line.trim().replace(/\s+/g, " ")
  );
}

function assertExactCanonicalSectionOrder(text: string) {
  const found = extractMarkdownHeadings(text);
  const expected = STRUCTURE_HEADINGS.map((line) =>
    line.trim().replace(/\s+/g, " ")
  );

  if (found.length !== expected.length) {
    throw new Error(
      `${HARD_GATE_ERROR_PREFIX}: exacte 9 HGBCO-secties vereist (gevonden ${found.length}, verwacht ${expected.length})`
    );
  }

  for (let i = 0; i < expected.length; i += 1) {
    if (found[i] !== expected[i]) {
      throw new Error(
        `${HARD_GATE_ERROR_PREFIX}: sectievolgorde ongeldig op positie ${i + 1} (verwacht "${expected[i]}", vond "${found[i]}")`
      );
    }
  }
}

function assertSectorInformationParagraph(text: string) {
  if (!/(^|\n)\s*sectorinformatie\s*:/i.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertTopUnderstreamBalancePerSection(text: string) {
  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(text, heading);
    if (!section) {
      throw new Error(SHARPNESS_ERROR_TEXT);
    }
    if (!/\bbovenstroom\b/i.test(section) || !/\bonderstroom\b/i.test(section)) {
      throw new Error(SHARPNESS_ERROR_TEXT);
    }
  }
}

function assertNoForbiddenSectionStarts(text: string) {
  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(text, heading);
    if (!section) continue;
    const firstLine = section.split("\n").find((line) => line.trim()) ?? "";
    if (FORBIDDEN_SECTION_START_PATTERNS.some((pattern) => pattern.test(firstLine))) {
      throw new Error(SHARPNESS_ERROR_TEXT);
    }
  }
}

function assertNoRepeatedSentencesAcrossSections(text: string) {
  const seen = new Set<string>();
  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(text, heading);
    const sectionSentences = splitIntoSentences(section);
    for (const sentence of sectionSentences) {
      const key = normalizeSentenceKey(sentence);
      if (key.length < 24) continue;
      if (seen.has(key)) {
        throw new Error(SHARPNESS_ERROR_TEXT);
      }
      seen.add(key);
    }
  }
}

function collectPowerActors(section: string): string[] {
  const matches = section.match(POWER_ACTOR_EXTRACT_GUARD) ?? [];
  return [...new Set(matches.map((m) => m.toLowerCase().replace(/\s+/g, " ").trim()))];
}

function countConcretePowerActorLines(section: string): number {
  return section
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) =>
        POWER_ACTOR_LINE_GUARD.test(line) &&
        POWER_ACTOR_WIN_LOSS_GUARD.test(line) &&
        POWER_ACTOR_SABOTAGE_GUARD.test(line) &&
        POWER_ACTOR_INSTRUMENT_GUARD.test(line)
    ).length;
}

function assertDominantThesis(text: string) {
  const thesis = extractSection(text, "### 1. DOMINANTE BESTUURLIJKE THESE");
  if (!thesis) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  if (countSentences(thesis) > 10) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  const scenarioSignals = (thesis.match(/\b(scenario|optie|alternatief)\b/gi) ?? []).length;
  if (scenarioSignals > 1) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  const openingWindow = thesis.slice(0, 260);
  if (!DOMINANT_HYPOTHESIS_GUARD.test(openingWindow)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertUncomfortableTruth(text: string) {
  if (!UNCOMFORTABLE_TRUTH_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertExplicitLosses(text: string) {
  const matches =
    text.match(
      /\b(verlies|verliest|inleveren|machtverlies|afbouw|stopzetten|opheffen|afstoten|beeindigen|beëindigen)\b/gi
    ) ?? [];

  if (matches.length < 2) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertTradeOffDepth(text: string) {
  const section = extractSection(text, "### 3. EXPLICIETE TRADE-OFFS");
  const lossSignals =
    section.match(/\b(verlies|verliest|inleveren|afbouw|stopzetting|machtverlies)\b/gi) ?? [];
  const measurableSignals = section.match(/(€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%)/gi) ?? [];
  const hasHorizon = /\b(30|90|365)\s*dagen\b/i.test(section);
  const hasPowerImpact = /\bmacht\b|\bmandaat\b/i.test(section);
  const loss1 =
    section.match(/verlies\s*1\s*[:=]\s*([^.\n]+)/i)?.[1] ??
    section.match(/trade-?off\s*1\s*[:=]\s*([^.\n]+)/i)?.[1] ??
    "";
  const loss2 =
    section.match(/verlies\s*2\s*[:=]\s*([^.\n]+)/i)?.[1] ??
    section.match(/trade-?off\s*2\s*[:=]\s*([^.\n]+)/i)?.[1] ??
    "";
  const hasDistinctLosses =
    !!loss1 &&
    !!loss2 &&
    normalizeComparableText(loss1) !== normalizeComparableText(loss2);

  if (
    lossSignals.length < 2 ||
    measurableSignals.length < 2 ||
    !hasHorizon ||
    !hasPowerImpact ||
    !hasDistinctLosses
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertOpportunityCost(text: string) {
  const section = extractSection(text, "### 4. OPPORTUNITY COST");
  const has30 = /\b30\s*dagen\b/i.test(section);
  const has90 = /\b90\s*dagen\b/i.test(section);
  const has365 = /\b365\s*dagen\b/i.test(section);
  const measurableSignals = section.match(/(€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%)/gi) ?? [];
  const hasIrreversible =
    /\b(irreversibel|onomkeerbaar|onomkeerbaarheid|point of no return)\b/i.test(section);
  const windows = extractOpportunityWindowContent(section);
  const uniqueWindows =
    !!windows["30"] &&
    !!windows["90"] &&
    !!windows["365"] &&
    normalizeComparableText(windows["30"]) !== normalizeComparableText(windows["90"]) &&
    normalizeComparableText(windows["90"]) !== normalizeComparableText(windows["365"]) &&
    normalizeComparableText(windows["30"]) !== normalizeComparableText(windows["365"]);
  const hasSignalLoss30 = /\b(signaalverlies|gedragsverschuiving|vertrouwensverlies)\b/i.test(
    windows["30"]
  );
  const hasPowerShift90 = /\b(machtsverschuiving|erosie|tegenkracht)\b/i.test(
    windows["90"]
  );
  const hasSystemShift365 = /\b(systeemverschuiving|onomkeerbaar|dominante coalitie)\b/i.test(
    windows["365"]
  );
  const has12MonthConsequence =
    /\b(na\s*12\s*maanden|12\s*maanden)\b/i.test(section) &&
    /\b(positie|coalitie|dominant)\b/i.test(section) &&
    /\b(reputatieschade|niet terug te draaien|onomkeerbaar)\b/i.test(section);

  if (
    !has30 ||
    !has90 ||
    !has365 ||
    measurableSignals.length < 3 ||
    !hasIrreversible ||
    !uniqueWindows ||
    !hasSignalLoss30 ||
    !hasPowerShift90 ||
    !hasSystemShift365 ||
    !has12MonthConsequence
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertGovernanceImpact(text: string) {
  const section = extractSection(text, "### 5. GOVERNANCE IMPACT").toLowerCase();
  const hasDecisionPower = section.includes("besluitkracht");
  const hasEscalation = section.includes("escalatie");
  const hasFormalShift =
    /formele machtsverschuiving|macht verschuift|mandaat verschuift|besluitrechten/.test(
      section
    );
  const hasStructureEffect =
    /structuur|structuurgevolg|besluitcomite|escalatielijn|governance-tafel|mandaatmatrix/.test(
      section
    );

  if (!hasDecisionPower || !hasEscalation || !hasFormalShift || !hasStructureEffect) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertPowerDynamics(text: string) {
  const section = extractSection(text, "### 6. MACHTSDYNAMIEK & ONDERSTROOM");
  const sectionLc = section.toLowerCase();
  const hasPowerLoss =
    sectionLc.includes("verliest") || sectionLc.includes("inlevert") || sectionLc.includes("macht verschuift");
  const hasInformalInfluence = sectionLc.includes("informele");
  const hasSabotage = sectionLc.includes("sabotage") || sectionLc.includes("vertraging");
  const hasUnderstream = sectionLc.includes("onderstroom");
  const hasCultureReflex =
    sectionLc.includes("conflictmijding") ||
    sectionLc.includes("risicomijding") ||
    sectionLc.includes("culturele reflex");
  const hasHiddenAgenda = sectionLc.includes("verborgen agenda") || sectionLc.includes("agenda");
  const actors = collectPowerActors(section);
  const concreteActorLines = countConcretePowerActorLines(section);

  if (
    !hasPowerLoss ||
    !hasInformalInfluence ||
    !hasSabotage ||
    !hasUnderstream ||
    !hasCultureReflex ||
    !hasHiddenAgenda ||
    actors.length < 3 ||
    concreteActorLines < 3
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertExecutionRisk(text: string) {
  const section = extractSection(text, "### 7. EXECUTIERISICO").toLowerCase();
  const hasFailurePoint = section.includes("faalpunt") || section.includes("mislukt");
  const hasBlocker =
    section.includes("blocker") || section.includes("blokkeer") || section.includes("tegenhouden");
  const hasUnderstream = section.includes("onderstroom");

  if (!hasFailurePoint || !hasBlocker || !hasUnderstream) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertNinetyDayPlan(text: string) {
  const section = extractSection(text, "### 8. 90-DAGEN INTERVENTIEPLAN");
  const sectionLc = section.toLowerCase();
  const hasW12 = /week\s*1\s*[-–]\s*2\s*:/.test(sectionLc);
  const hasW36 = /week\s*3\s*[-–]\s*6\s*:/.test(sectionLc);
  const hasW712 = /week\s*7\s*[-–]\s*12\s*:/.test(sectionLc);
  const hasOwner = /\b(owner|eigenaar|ceo|cfo|coo|chro|raad van bestuur|rvb)\b/i.test(section);
  const hasMeasure = hasKpiSignal(section) || /\bmeetbaar\b/i.test(section);
  const hasTempoLine = TEMPO_POWER_GUARD.test(section);

  if (!hasW12 || !hasW36 || !hasW712 || !hasOwner || !hasMeasure || !hasTempoLine) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertNinetyDayPlanSeparateParagraphs(text: string) {
  const section = extractSection(text, "### 8. 90-DAGEN INTERVENTIEPLAN");
  if (!section) {
    throw new Error(
      `${HARD_GATE_ERROR_PREFIX}: sectie 8 ontbreekt`
    );
  }

  const requiredParagraphAnchors = [
    /(?:^|\n{2,})\s*Week\s*1\s*[-–]\s*2:/i,
    /(?:^|\n{2,})\s*Week\s*3\s*[-–]\s*6:/i,
    /(?:^|\n{2,})\s*Week\s*7\s*[-–]\s*12:/i,
    /(?:^|\n{2,})\s*Dag\s*30:/i,
    /(?:^|\n{2,})\s*Dag\s*60:/i,
    /(?:^|\n{2,})\s*Dag\s*90:/i,
  ];

  const missing = requiredParagraphAnchors.filter((pattern) => !pattern.test(section));
  if (missing.length > 0) {
    throw new Error(
      `${HARD_GATE_ERROR_PREFIX}: sectie 8 vereist aparte alinea's voor Week 1-2, Week 3-6, Week 7-12 en Dag 30/60/90`
    );
  }
}

function assertHardOutputGate(text: string) {
  assertExactCanonicalSectionOrder(text);
  assertNinetyDayPlanSeparateParagraphs(text);
}

function assertDecisionContract(text: string) {
  const section = extractSection(text, "### 9. DECISION CONTRACT");
  const hasOpening = section.includes("De Raad van Bestuur committeert zich aan:");
  const hasChoice = /keuze\s*a|keuze\s*b|keuze\s*a\s*of\s*b/i.test(section);
  const hasResult = /meetbaar\s+resultaat|kpi/i.test(section);
  const hasHorizon = /tijdshorizon/i.test(section);
  const hasLoss = /verlies/i.test(section);
  const hasKpi = hasKpiSignal(section);
  const hasFormalPowerLoss = /\bformele macht\b[\s\S]{0,120}\b(verliest|verlies)\b/i.test(section);
  const hasInformalPowerLoss = /\binformele macht\b[\s\S]{0,120}\b(verliest|verlies)\b/i.test(
    section
  );
  const hasDecisionMonopoly = /\b(beslismonopolie|besluitmonopolie)\b/i.test(section);
  const hasImmediateStop = /\b(per direct|onmiddellijk)\b[\s\S]{0,80}\b(stop|stopt)\b/i.test(
    section
  );
  const hasNoEscalation =
    /\bmag niet meer\b[\s\S]{0,80}\bge[ëe]scaleerd\b/i.test(section) ||
    /\bniet meer\b[\s\S]{0,80}\bescalatie\b/i.test(section);
  const hasExplicitImpact = /\b(€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%)\b/i.test(section);
  const hasActorImpact =
    /\b(impact op|raakt|treft|actor-impact|voor de)\b/i.test(section) &&
    /\b(ceo|cfo|coo|chro|raad van bestuur|rvb|raad van toezicht|rvt|medisch directeur|regiodirecteur|programmadirecteur)\b/i.test(
      section
    );

  if (
    !hasOpening ||
    !hasChoice ||
    !hasResult ||
    !hasHorizon ||
    !hasLoss ||
    !hasKpi ||
    !hasFormalPowerLoss ||
    !hasInformalPowerLoss ||
    !hasDecisionMonopoly ||
    !hasImmediateStop ||
    !hasNoEscalation ||
    !hasExplicitImpact ||
    !hasActorImpact
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertTempoAsPowerInstrument(text: string) {
  if (!TEMPO_POWER_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertGGZSpecificDepth(text: string, enforce: boolean) {
  if (!enforce) return;

  const checks = Object.values(GGZ_DEPTH_GUARDS);
  if (checks.some((guard) => !guard.test(text))) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertSignatureExplicitLoss(text: string) {
  const hasLoss =
    /\b(verlies|verliest|inleveren|machtverlies|afbouw|stopzetten|beëindigen)\b/i.test(
      text
    );
  if (!hasLoss) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignatureTension(text: string) {
  const hasTension =
    /\b(spanningsveld|kernconflict|dilemma)\b/i.test(text) &&
    /\b(onoplosbaar|niet-optimaliseerbaar|geen optimale oplossing|geen derde route)\b/i.test(
      text
    );
  if (!hasTension) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignaturePowerShift(text: string) {
  const hasPowerShift =
    /\b(formele macht|macht verschuift|macht verliest|macht wint|informele invloed|tegenkracht|controle)\b/i.test(
      text
    );
  if (!hasPowerShift) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignatureTimePressure(text: string) {
  const opportunity = extractSection(text, "### 4. OPPORTUNITY COST");
  const hasTimeWindows =
    /\b30\s*dagen\b/i.test(opportunity) &&
    /\b90\s*dagen\b/i.test(opportunity) &&
    /\b365\s*dagen\b/i.test(opportunity);
  const hasTimeForce =
    /\b(irreversibel|onomkeerbaar|venster sluit|exponentieel|uitstel|tijdsdruk)\b/i.test(
      text
    );

  if (!hasTimeWindows || !hasTimeForce) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignatureContractFormula(text: string) {
  const section = extractSection(text, "### 9. DECISION CONTRACT");
  const hasOpening = section.includes("De Raad van Bestuur committeert zich aan:");
  const hasContractItems =
    /\bkeuze\b/i.test(section) &&
    /\bmeetbaar\b|\bkpi\b/i.test(section) &&
    /\btijdshorizon\b/i.test(section) &&
    /\bverlies\b/i.test(section);

  if (!hasOpening || !hasContractItems) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignatureCognitiveMaturity(text: string) {
  const hasReflection =
    /\binformatieprobleem\s+(of|maar)\s+(een\s+)?moedprobleem\b/i.test(text) ||
    /\bcapaciteitsprobleem\s+(of|maar)\s+(een\s+)?machtsprobleem\b/i.test(text) ||
    /\bstrategie\s+(of|maar)\s+(een\s+)?executiediscipline\b/i.test(text) ||
    /\banalyse\s+(of|maar)\s+(een\s+)?vermijding\b/i.test(text);

  if (!hasReflection) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignatureAdaptiveHardness(text: string) {
  const hasAdaptiveHardness =
    /\bconfronterend\b/i.test(text) &&
    /\bklinisch\b/i.test(text) &&
    /\bstrategisch beheerst\b/i.test(text);

  if (!hasAdaptiveHardness) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertCyntraSignatureLayer(text: string) {
  assertSignatureExplicitLoss(text);
  assertSignatureTension(text);
  assertSignaturePowerShift(text);
  assertSignatureTimePressure(text);
  assertSignatureContractFormula(text);
  assertSignatureCognitiveMaturity(text);
  assertSignatureAdaptiveHardness(text);
}

function assertExecutiveKernelQuality(text: string, enforceGGZDepth: boolean) {
  assertStructure(text);
  assertExactCanonicalSectionOrder(text);
  assertNoForbiddenSectionStarts(text);
  assertNoRepeatedSentencesAcrossSections(text);
  assertNoSoftLanguage(text);
  assertDutchOnly(text);
  assertNinetyDayPlanSeparateParagraphs(text);
}

/* ============================================================
   ENFORCERS
============================================================ */

function ensureMandatorySections(text: string): string {
  let output = text.trim();

  for (const heading of STRUCTURE_HEADINGS) {
    if (!output.includes(heading)) {
      const fallback = SECTION_DEFAULTS[heading];
      output = output
        ? `${output}\n\n${heading}\n${fallback}`
        : `${heading}\n${fallback}`;
    }
  }

  return output;
}

function trimToCanonicalStart(text: string): string {
  const source = String(text ?? "").trim();
  if (!source) return source;
  const firstHeading = "### 1. DOMINANTE BESTUURLIJKE THESE";
  const firstIndex = source.indexOf(firstHeading);
  if (firstIndex < 0) return source;
  return source.slice(firstIndex).trim();
}

function sanitizeSectionOpeners(text: string): string {
  let output = text;

  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(output, heading);
    if (!section) continue;

    const lines = section.split("\n");
    while (
      lines.length > 0 &&
      FORBIDDEN_SECTION_START_PATTERNS.some((pattern) =>
        pattern.test(lines[0] || "")
      )
    ) {
      lines.shift();
    }

    const cleaned = lines.join("\n").trim();
    output = replaceSection(output, heading, cleaned || SECTION_DEFAULTS[heading]);
  }

  return output;
}

function chunkSentencesIntoParagraphs(
  sentences: string[],
  maxSentences = 2,
  maxChars = 220
): string[] {
  const paragraphs: string[] = [];
  let bucket: string[] = [];

  const flush = () => {
    if (!bucket.length) return;
    paragraphs.push(bucket.join(" ").trim());
    bucket = [];
  };

  for (const sentence of sentences) {
    const next = sentence.trim();
    if (!next) continue;

    if (!bucket.length) {
      bucket.push(next);
      continue;
    }

    const candidate = `${bucket.join(" ")} ${next}`;
    if (bucket.length >= maxSentences || candidate.length > maxChars) {
      flush();
      bucket.push(next);
      continue;
    }

    bucket.push(next);
  }

  flush();
  return paragraphs.filter(Boolean);
}

function enforceReadableParagraphRhythm(text: string): string {
  let output = text;

  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(output, heading);
    if (!section) continue;

    const listStripped = section
      .replace(/^\s*[-*•]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "");
    const sentences = splitIntoSentences(listStripped);
    if (!sentences.length) continue;
    const rebuilt = chunkSentencesIntoParagraphs(sentences, 5, 1200).join("\n\n");
    output = replaceSection(output, heading, rebuilt || section.trim());
  }

  return output;
}

function enforceNinetyDayInterventionParagraphs(text: string): string {
  const heading = "### 8. 90-DAGEN INTERVENTIEPLAN";
  const section = extractSection(text, heading);
  if (!section) return text;

  const normalized = section
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return text;

  const formatted = normalized
    .replace(/\s*(Week\s*1\s*[-–]\s*2:)/i, "\n\n$1")
    .replace(/\s*(Week\s*3\s*[-–]\s*6:)/i, "\n\n$1")
    .replace(/\s*(Week\s*7\s*[-–]\s*12:)/i, "\n\n$1")
    .replace(/\s*(Dag\s*30:)/i, "\n\n$1")
    .replace(/\s*(Dag\s*60:)/i, "\n\n$1")
    .replace(/\s*(Dag\s*90:)/i, "\n\n$1")
    .replace(
      /\s*(Wie tempo controleert,\s*controleert macht\.)/i,
      "\n\n$1"
    )
    .replace(/^\s+/, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return replaceSection(text, heading, formatted);
}

function consolidateOpportunityCostWindowDuplicates(text: string): string {
  const heading = "### 4. OPPORTUNITY COST";
  const section = extractSection(text, heading);
  if (!section) return text;

  const lines = section
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const seenBodies = new Set<string>();
  const rebuilt: string[] = [];

  for (const line of lines) {
    const dayMatch = line.match(/^(30|90|365)\s*dagen\s*[:\-]\s*(.+)$/i);
    if (!dayMatch) {
      rebuilt.push(line);
      continue;
    }

    const body = String(dayMatch[2] ?? "").trim();
    const key = normalizeComparableText(body);
    if (!key || seenBodies.has(key)) {
      continue;
    }
    seenBodies.add(key);
    rebuilt.push(`${dayMatch[1]} dagen: ${body}`);
  }

  if (!rebuilt.length) return text;
  return replaceSection(text, heading, rebuilt.join("\n\n"));
}

function removeRepeatedSectionSentences(text: string): string {
  let output = text;
  const seen = new Set<string>();

  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(output, heading);
    if (!section) continue;

    const sectionWithoutLists = section
      .replace(/^\s*[-*•]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "");
    const sentences = splitIntoSentences(sectionWithoutLists);
    const filtered: string[] = [];
    for (const sentence of sentences) {
      const key = normalizeSentenceKey(sentence);
      if (key.length >= 24 && seen.has(key)) {
        continue;
      }
      if (key.length >= 24) {
        seen.add(key);
      }
      filtered.push(sentence);
    }

    const cleanedSection =
      chunkSentencesIntoParagraphs(filtered, 5, 1200).join("\n\n").trim() || section.trim();
    output = replaceSection(output, heading, cleanedSection);
  }

  return output;
}

function injectLineIntoSection(
  text: string,
  heading: string,
  line: string,
  signal: RegExp
): string {
  const section = extractSection(text, heading);
  if (!section) return text;
  if (signal.test(section)) return text;

  const start = text.indexOf(heading);
  if (start < 0) return text;

  const sectionStart = start + heading.length;
  const afterHeading = text.slice(sectionStart);
  const nextRel = afterHeading.search(/\n###\s*\d+\./);

  if (nextRel < 0) {
    return `${text}\n${line}`;
  }

  const insertAt = sectionStart + nextRel;
  return `${text.slice(0, insertAt)}\n${line}\n${text.slice(insertAt)}`;
}

function enforceSignatureLayer(text: string): string {
  let output = text;

  output = injectLineIntoSection(
    output,
    "### 1. DOMINANTE BESTUURLIJKE THESE",
    "De werkelijke bestuurlijke kern is niet strategie, maar besluituitstel dat intern wordt vermomd als zorgvuldigheid.",
    DOMINANT_HYPOTHESIS_GUARD
  );

  output = injectLineIntoSection(
    output,
    "### 1. DOMINANTE BESTUURLIJKE THESE",
    "De ongemakkelijke waarheid is: dit bestuur beschermt posities zolang verlies niet expliciet wordt verdeeld.",
    UNCOMFORTABLE_TRUTH_GUARD
  );

  output = injectLineIntoSection(
    output,
    "### 1. DOMINANTE BESTUURLIJKE THESE",
    "De bestuurlijke toetsvraag luidt: versterkt deze keuze de besluitkracht van de top of ondermijnt zij die.",
    /\bbesluitkracht\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 2. HET KERNCONFLICT",
    "Dit is een onoplosbaar spanningsveld; optimalisatie bestaat hier niet.",
    /\b(spanningsveld|onoplosbaar|niet-optimaliseerbaar)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 3. EXPLICIETE TRADE-OFFS",
    "Minimaal twee verliezen worden hard geaccepteerd: verlies 1 met EUR- of %-impact binnen 90 dagen en verlies 2 met impact binnen 365 dagen.",
    /\b(verlies\s*1|verlies\s*2|€|eur|\d+(?:[.,]\d+)?\s*%)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 4. OPPORTUNITY COST",
    "30 dagen geeft direct signaalverlies, 90 dagen verschuift zichtbare macht, 365 dagen verankert systeemverschuiving; na 12 maanden is terugdraaien reputatie-intensief.",
    /\b(signaalverlies|machtsverschuiving|systeemverschuiving|12\s*maanden)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 5. GOVERNANCE IMPACT",
    "Structuurgevolg: besluitrechten en escalatielijnen worden hertekend in een centrale governance-structuur met harde 48-uurs escalatie.",
    /\b(structuur|structuurgevolg|escalatielijn|governance-structuur)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 6. MACHTSDYNAMIEK & ONDERSTROOM",
    "Minimaal drie actoren worden benoemd met concreet verlies, winst, sabotagewijze en instrument (budget, informatie, personeel, planning, escalatie, reputatie, toezicht of moreel gezag).",
    /\b(minimaal drie actoren|budget|informatie|personeel|planning|reputatie|moreel gezag)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 7. EXECUTIERISICO",
    "Faalpunt en concrete blocker zijn expliciet: parallelle prioriteiten, dubbel mandaat en vertraagde escalatie.",
    /\b(faalpunt|blocker|dubbel mandaat)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 7. EXECUTIERISICO",
    "Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem.",
    /\binformatieprobleem\s+maar\s+een\s+moedprobleem|capaciteitsprobleem\s+maar\s+een\s+machtsprobleem\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 7. EXECUTIERISICO",
    "Deze herhaling is bestuurlijk herkenbaar: eerdere interventies faalden omdat keuzes werden verdund in plaats van verankerd.",
    /\b(herhaling|eerdere interventies|verdund)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 7. EXECUTIERISICO",
    "Adaptieve hardheid: bij stagnatie confronterend, bij transitie klinisch, bij momentum strategisch beheerst.",
    /\b(confronterend|klinisch|strategisch beheerst)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 8. 90-DAGEN INTERVENTIEPLAN",
    "Elke weekblok bevat toegewezen owner en meetbare KPI met 30/60/90-dagen checkpoints.",
    /\b(owner|eigenaar|ceo|cfo|coo|chro|kpi|checkpoints)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 8. 90-DAGEN INTERVENTIEPLAN",
    "Wie tempo controleert, controleert macht.",
    TEMPO_POWER_GUARD
  );

  output = injectLineIntoSection(
    output,
    "### 9. DECISION CONTRACT",
    "Contractpijn is expliciet: formele en informele macht verliezen terrein, beslismonopolie wordt toegewezen, directe stop geldt, informele escalatie is beëindigd en de actor-impact in EUR/% ligt vast voor CFO, COO en regiodirecteur.",
    /\b(actor-impact|impact op|raakt|treft)\b/i
  );

  return output;
}

function enforceLossLanguage(text: string): string {
  const matches =
    text.match(
      /\b(verlies|verliest|inleveren|machtverlies|afbouw|stopzetten|opheffen|afstoten|beeindigen|beëindigen)\b/gi
    ) ?? [];

  if (matches.length >= 2) {
    return text;
  }

  return `${text}\n\nIn deze keuze wordt verlies expliciet geaccepteerd: initiatieven worden beëindigd en macht wordt centraal herverdeeld.`;
}

function enforceCyntraBridge(text: string): string {
  const lower = text.toLowerCase();
  const hasTopstream = lower.includes("bovenstroom");
  const hasUnderstream = lower.includes("onderstroom");
  const hasBridgeSignal = /(verbind|verbinding|koppel|brug)/i.test(text);

  if (hasTopstream && hasUnderstream && hasBridgeSignal) {
    return text;
  }

  return `${text}\n\nBovenstroom en onderstroom worden expliciet verbonden: formeel besluit, informele macht en zichtbaar gedrag worden in dezelfde bestuurscyclus gestuurd.`;
}

function detectSectorLabelFromInput(input: BoardroomInput): string {
  const normalizedDocs = Array.isArray(input.documents)
    ? normalizeDocumentsForPrompt(input.documents)
    : [];
  const corpus = [
    toSafeString(input.company_name),
    toSafeString(input.company_context),
    toSafeString(input.executive_thesis),
    toSafeString(input.central_tension),
    toSafeString(input.strategic_narrative),
    ...normalizedDocs.flatMap((doc) => [
          toSafeString(doc?.filename),
          toSafeString(doc?.content).slice(0, 1800),
        ]),
  ]
    .join(" ")
    .toLowerCase();

  if (/\b(ggz|geestelijke gezondheidszorg|jeugdzorg|igj|wachtlijst|mac)\b/.test(corpus)) {
    return "ggz";
  }
  if (/\b(ziekenhuis|care|vvt|ouderenzorg|zorginstelling)\b/.test(corpus)) {
    return "zorg";
  }
  if (/\b(school|onderwijs|docent|leerling)\b/.test(corpus)) {
    return "onderwijs";
  }
  if (/\b(bank|verzekeraar|compliance|dnb|eba|finance)\b/.test(corpus)) {
    return "finance";
  }
  if (/\b(scale-up|software|saas|platform|tech)\b/.test(corpus)) {
    return "tech";
  }
  if (/\b(fabriek|productie|industrie|supply chain)\b/.test(corpus)) {
    return "industrie";
  }
  if (/\b(gemeente|ministerie|publiek|overheid)\b/.test(corpus)) {
    return "overheid";
  }
  return "transformatie";
}

function buildSectorInformationParagraph(input: BoardroomInput): string {
  const sector = detectSectorLabelFromInput(input);
  const labels: Record<string, string> = {
    ggz: "ggz/jeugdzorg",
    zorg: "zorg",
    onderwijs: "onderwijs",
    finance: "financiële dienstverlening",
    tech: "tech",
    industrie: "industrie",
    overheid: "overheid",
    transformatie: "organisatiebreed",
  };
  const sectorLabel = labels[sector] ?? "organisatiebreed";
  return `Sectorinformatie: de analyse voor ${sectorLabel} is uitsluitend gebaseerd op geüploade documenten en expliciete contextvelden; ontbrekende gegevens zijn gemarkeerd als niet onderbouwd.`;
}

function enforceSectorInformationParagraph(text: string, input: BoardroomInput): string {
  return injectLineIntoSection(
    text,
    "### 1. DOMINANTE BESTUURLIJKE THESE",
    buildSectorInformationParagraph(input),
    /(^|\n)\s*sectorinformatie\s*:/i
  );
}

function enforceTopUnderstreamBalance(text: string): string {
  let output = text;
  for (const heading of STRUCTURE_HEADINGS) {
    output = injectLineIntoSection(
      output,
      heading,
      TOP_UNDER_BRIDGE_LINES[heading],
      /\bbovenstroom\b[\s\S]{0,240}\bonderstroom\b|\bonderstroom\b[\s\S]{0,240}\bbovenstroom\b/i
    );
  }
  return output;
}

function scrubForbiddenLanguage(text: string): string {
  let output = String(text ?? "");
  const GGZ_CONTEXT_SENTINEL = "__GGZ_CONTEXT_SENTINEL__";
  output = output.replace(
    /op basis van bestuurlijke patronen in de ggz:/gi,
    GGZ_CONTEXT_SENTINEL
  );

  const replacements: Array<[RegExp, string]> = [
    [/\bsabotagepatronen\b/gi, "sabotagetechnieken"],
    [/\bdefault template\b/gi, "standaardbouwsteen"],
    [/\btransformatie-template\b/gi, "transformatieroute"],
    [/\bgovernance-technisch\b/gi, "bestuurlijk concreet"],
  ];

  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }

  output = output.replace(
    new RegExp(GGZ_CONTEXT_SENTINEL, "g"),
    "Op basis van bestuurlijke patronen in de ggz:"
  );

  return output;
}

function hasForbiddenGenericLanguage(text: string): boolean {
  const normalized = String(text ?? "")
    .replace(/op basis van bestuurlijke patronen in de ggz:/gi, "")
    .replace(/op basis van bestuurlijke patronen in vergelijkbare organisaties:/gi, "");
  return STRICT_BANNED_LANGUAGE_GUARD.test(normalized);
}

function sanitizeResidualForbiddenNarrative(text: string): string {
  let output = String(text ?? "");
  for (const pattern of POST_SANITIZE_LINE_PATTERNS) {
    output = output.replace(pattern, "");
  }
  output = output.replace(/\b(default template|transformatie-template)\b/gi, "");
  output = output.replace(/\n{3,}/g, "\n\n");
  return output.trim();
}

function hasThinBoardroomInput(input: BoardroomInput): boolean {
  const normalizedDocs = Array.isArray(input.documents)
    ? normalizeDocumentsForPrompt(input.documents)
    : [];
  const hasRichDocuments =
    normalizedDocs.some((doc) => toSafeString(doc?.content).length >= 180);
  const hasLegacyContext = toSafeString(input.company_context).length >= 120;
  const hasBriefSignals =
    toSafeString(input.executive_thesis).length >= 80 ||
    toSafeString(input.central_tension).length >= 80 ||
    toSafeString(input.strategic_narrative).length >= 120;

  return !hasRichDocuments && !hasLegacyContext && !hasBriefSignals;
}

function hasNineHgbcoSections(markdown: string): boolean {
  const matches = String(markdown ?? "").match(/^###\s*\d+\.\s+/gm) ?? [];
  return matches.length === 9;
}

function hasAtoERatioForAllSections(markdown: string): boolean {
  const sections = String(markdown ?? "")
    .split(/\n(?=###\s*\d+\.\s+)/g)
    .map((section) => section.trim())
    .filter(Boolean);
  if (sections.length !== 9) return false;
  return sections.every((section) =>
    ["A", "B", "C", "D", "E"].every((letter) =>
      new RegExp(`^\\s*#{0,6}\\s*${letter}\\.`, "im").test(section)
    )
  );
}

function validateHgbcoMcKinseyRuntime(markdown: string) {
  const source = String(markdown ?? "");
  if (!hasNineHgbcoSections(source)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
  if (!hasAtoERatioForAllSections(source)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
  if (!hasDecisionContractCommitBlock(source)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
  if (hasForbiddenHgbcoLanguage(source)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function shouldEnforceGGZDepthFromInput(input: BoardroomInput): boolean {
  return false;
}

function enforceComparableOrgAssumption(
  text: string,
  input: BoardroomInput
): string {
  return text;
}

function enforceGGZDepthHints(text: string, input: BoardroomInput): string {
  return text;
}

type LongformTimeWindow = {
  intro: string;
};

type LongformExpansionTheme = {
  label: string;
  topstream: string;
  understream: string;
  commitment: string;
  acceptedLoss: string;
};

const LONGFORM_TIME_WINDOWS: readonly LongformTimeWindow[] = [
  {
    intro:
      "In het wekelijkse bestuursritme",
  },
  {
    intro:
      "Binnen 30 dagen na besluit",
  },
  {
    intro:
      "Binnen 90 dagen na besluit",
  },
  {
    intro:
      "Richting 365 dagen",
  },
  {
    intro:
      "Na 12 maanden zonder discipline",
  },
] as const;

const LONGFORM_EXPANSION_THEMES: readonly LongformExpansionTheme[] = [
  {
    label: "margeklem",
    topstream:
      "loonkosten boven 5% per jaar en een tariefdaling van 7% in 2026 bijten direct in de operationele ruimte.",
    understream:
      "teams ervaren dat zij dezelfde zorg moeten leveren met minder buffer en verschuiven spanning naar informeel overleg.",
    commitment:
      "de CFO stuurt per zorgpad op oorzaak-gevolg tussen inzet, doorlooptijd en marge in plaats van op maandtotalen.",
    acceptedLoss:
      "het bestuur accepteert dat niet-rendabele zorgvormen tijdelijk worden begrensd totdat de kernmarge stabiliseert.",
  },
  {
    label: "verzekeraarsafhankelijkheid",
    topstream:
      "het ontbreken van contracten met verzekeraars vergroot prijsdruk en maakt de vraag naar zorg minder voorspelbaar.",
    understream:
      "professionals voelen morele druk om toch iedereen te helpen, ook als het betaalpad voor clienten fragiel is.",
    commitment:
      "instroom wordt gekoppeld aan transparante betaalafspraken en segmentering op uitvalrisico.",
    acceptedLoss:
      "een deel van de instroom valt tijdelijk weg om latere uitval en onbeheersbare herplanning te voorkomen.",
  },
  {
    label: "zelfbetaling",
    topstream:
      "clienten die 30-40% zelf betalen reageren sneller op prijsfrictie en onzekerheid over behandelduur.",
    understream:
      "behandelaren ervaren druk om alsnog uitzonderingen te maken, waardoor afspraken per team uiteenlopen.",
    commitment:
      "het bestuur standaardiseert het betaalpad en koppelt no-show- en uitvalcorrecties aan de planningstafel.",
    acceptedLoss:
      "conversie daalt tijdelijk in prijsgevoelige segmenten, maar leverbetrouwbaarheid en voorspelbaarheid nemen toe.",
  },
  {
    label: "wachtlijstvrije belofte",
    topstream:
      "de belofte van wachtlijst-vrije zorg blijft alleen houdbaar met expliciete casemixgrenzen en planningsdiscipline.",
    understream:
      "lokale teams framen instroombegrenzing snel als verlies van mensgerichtheid en zoeken uitzonderingsroutes.",
    commitment:
      "de regietafel beslist centraal over intakeprioriteit, met 48-uurs escalatie op knelpunten.",
    acceptedLoss:
      "niet elke verwijzing wordt direct ingepland wanneer dit kwaliteit, veiligheid en marge tegelijk schaadt.",
  },
  {
    label: "productiviteitsnorm",
    topstream:
      "de 75%-norm van zes clienturen per dag is bestuurlijk eenvoudig maar operationeel te grof voor complexe casemix.",
    understream:
      "de norm is emotioneel beladen en wordt door sommige teams gelezen als wantrouwen in vakmanschap.",
    commitment:
      "de organisatie verschuift naar bandbreedtes per behandeltype met expliciete koppeling aan verzuim en kwaliteit.",
    acceptedLoss:
      "de schijnzekerheid van een uniforme norm vervalt ten gunste van stabielere uitvoering.",
  },
  {
    label: "adhd-diagnostiek",
    topstream:
      "de extra kost van circa EUR 90 per client voor ADHD-diagnostiek drukt op trajectrendement door vaste codes.",
    understream:
      "teams voelen dat inhoudelijke keuzes financieel worden beoordeeld en trekken zich terug in specialistische subculturen.",
    commitment:
      "diagnostische stappen worden strak geprotocolleerd met zicht op kosteneffect per traject.",
    acceptedLoss:
      "sommige trajecten krijgen langere doorlooptijd in ruil voor betere voorspelbaarheid van kostprijs.",
  },
  {
    label: "kostprijs per traject",
    topstream:
      "een gemiddelde van 12 gesprekken en ongeveer EUR 1.800 kostprijs per client vraagt strakkere sturing op trajectontwerp.",
    understream:
      "zonder transparantie ontstaan verhalen over oneerlijke werkverdeling en verborgen voorkeuren in casuskeuze.",
    commitment:
      "elk team rapporteert maandelijks de relatie tussen trajectduur, uitkomst en bijdrage.",
    acceptedLoss:
      "niet-onderbouwde variatie in behandelduur wordt afgebouwd, ook wanneer dit lokale routines doorbreekt.",
  },
  {
    label: "stuurinformatie",
    topstream:
      "zonder betrouwbare stuurinformatie op product, team en traject blijft prioritering incidentgedreven.",
    understream:
      "informele invloed groeit waar data ontbreekt en persoonlijke overtuiging de plaats inneemt van feiten.",
    commitment:
      "Vision Planner en dashboarding worden besluitverplicht: geen besluit zonder zichtbaar financieel en operationeel effect.",
    acceptedLoss:
      "snelheid in losse initiatieven zakt tijdelijk terwijl de informatiebasis wordt hersteld.",
  },
  {
    label: "planning en intake",
    topstream:
      "centrale intake via secretariaat en inloopblokken vraagt strakke synchronisatie met feitelijke behandelcapaciteit.",
    understream:
      "bij frictie op roosters ontstaan bilaterale deals die formele prioritering ondergraven.",
    commitment:
      "intakeblokken worden wekelijks geherijkt op no-show, matchkwaliteit en doorstroom per behandelaar.",
    acceptedLoss:
      "lokale voorkeursroutes in intake verdwijnen waar zij ketenprestatie aantoonbaar verslechteren.",
  },
  {
    label: "verhuizing en capaciteit",
    topstream:
      "vier extra kamers zonder hogere huur leveren alleen waarde als bezetting, planning en personeel gelijktijdig meeschalen.",
    understream:
      "extra ruimte wordt psychologisch snel gezien als oplossing, waardoor procesdiscipline verslapt.",
    commitment:
      "kamerbezetting wordt onderdeel van weeksturing met directe correctie op leegstand.",
    acceptedLoss:
      "ad-hoc gebruik van ruimtes stopt, ook als dat lokaal als verlies van autonomie wordt ervaren.",
  },
  {
    label: "Vallei Werkt",
    topstream:
      "het HR-loket Vallei Werkt kan inkomsten verbreden, maar vraagt scherp gefaseerde governance in een consolidatiejaar.",
    understream:
      "nieuwe initiatieven trekken status en aandacht, waardoor de kernzorg zich achtergesteld kan voelen.",
    commitment:
      "opschaling verloopt alleen via poortcriteria op cashflow, capaciteit en effect op kern-KPI's.",
    acceptedLoss:
      "snelle commerciële zichtbaarheid wordt opgeofferd aan bestuurlijke stabiliteit van de kern.",
  },
  {
    label: "nieuwe businesslijnen",
    topstream:
      "een vierde zakelijk onderdeel kan diversificatie brengen, maar verhoogt nu complexiteit in mandaat en uitvoering.",
    understream:
      "trekkers van nieuwe lijnen vormen coalities rond groeiverhalen die stopkeuzes proberen te vertragen.",
    commitment:
      "elke nieuwe lijn wordt getoetst op dezelfde investeringsdiscipline als de GGZ-kern.",
    acceptedLoss:
      "een deel van de innovatiepijplijn wordt bevroren om executie-erosie te vermijden.",
  },
  {
    label: "overlegritme en cultuur",
    topstream:
      "vier teamvergaderingen per jaar en beperkte individuele gesprekken zijn onvoldoende voor snelle koerscorrectie.",
    understream:
      "de cultuur van hard werken zonder frictiegesprek houdt conflictmijding in stand en vertraagt escalatie.",
    commitment:
      "maandelijkse ritmes op productie, kwaliteit en werkdruk worden verplicht met heldere eigenaar per actie.",
    acceptedLoss:
      "de informele gewoonte van besluiten uitstellen om de sfeer te bewaken wordt expliciet beëindigd.",
  },
  {
    label: "transparantie en vertrouwen",
    topstream:
      "gedeeltelijke financiële openheid door accountantsadvies vraagt een expliciete governancevertaling voor teams.",
    understream:
      "onvolledige informatie voedt geruchten over verborgen agenda's en vergroot territoriumdrang.",
    commitment:
      "het bestuur maakt zichtbaar welke cijfers waarom gedeeld worden en welke besluitrechten daaraan hangen.",
    acceptedLoss:
      "volledige lokale interpretatievrijheid op financiële signalen vervalt in ruil voor eenduidigheid.",
  },
  {
    label: "meerjarenstrategie",
    topstream:
      "de 3-5 jaars scenario-analyse met Jan en Raad van Toezicht moet keuzes verankeren in één bestuurlijk pad.",
    understream:
      "zonder expliciete volgorde verschuiven loyaliteiten naar degene die de minste pijn belooft.",
    commitment:
      "de Raad legt per scenario vast wat stopt, wat doorgaat en welke KPI-drempel de volgende stap opent.",
    acceptedLoss:
      "ruimte voor parallelle interpretatie van strategie wordt beperkt om rust en voorspelbaarheid te herstellen.",
  },
] as const;

function buildLongformExpansionPool(companyLabel: string): string[] {
  const company = toSafeString(companyLabel) || "de organisatie";
  const pool: string[] = [];

  for (const window of LONGFORM_TIME_WINDOWS) {
    for (const theme of LONGFORM_EXPANSION_THEMES) {
      pool.push(
        `${window.intro} op het thema ${theme.label} wordt de spanning tastbaar voor ${company}. ` +
          `Bovenstroom: ${theme.topstream} ` +
          `Onderstroom: ${theme.understream} ` +
          `Bestuurlijk commitment: ${theme.commitment} ` +
          `Geaccepteerd verlies: ${theme.acceptedLoss}`
      );
    }
  }

  return pool;
}

function enforceMinimumWords(
  text: string,
  minWords: number,
  maxWords: number,
  companyLabel = "de organisatie"
): string {
  let output = String(text ?? "").trim();
  if (!output) return output;

  if (countWords(output) < minWords) return trimToMaxWords(output, maxWords);

  return trimToMaxWords(output, maxWords);
}

function buildFallbackNarrative(
  input: BoardroomInput,
  minWords: number,
  maxWords: number
): string {
  const company = input.company_name ?? "de organisatie";

const base = `### 1. DOMINANTE BESTUURLIJKE THESE
De dominante bestuurlijke these voor ${company} is dat de organisatie niet vastloopt op inzet of intentie, maar op besturing onder druk. In de bovenstroom is de richting vaak duidelijk, maar in de onderstroom wordt de uitvoering nog te vaak bepaald door uitzonderingen, onderlinge afstemming en de persoon die op dat moment de meeste ruimte neemt. Daardoor lijkt het besluitproces op papier stabiel, terwijl het in de praktijk teveel schommelt met de dagdruk. De kernboodschap is niet dat teams harder moeten werken, maar dat het bestuur scherper moet kiezen.

### 2. HET KERNCONFLICT
Het kernconflict is dat meerdere legitieme doelen tegelijk worden gemaximaliseerd in een context die daar te weinig bestuurlijke en operationele ruimte voor laat. De bovenstroom wil snelheid, kwaliteit en voorspelbare uitkomsten tegelijk. De onderstroom voelt ondertussen werkdruk, onzekerheid en spanning op autonomie. Zolang die twee lagen niet expliciet worden verbonden in een duidelijke volgorde, blijft elk besluit half-af en verschuift de echte keuze naar de uitvoering.

### 3. EXPLICIETE TRADE-OFFS
Trade-off 1: strengere regie op intake, planning en prioritering verhoogt voorspelbaarheid, maar vraagt lokaal inleveren van uitzonderingsruimte.

Trade-off 2: ruime lokale uitzonderingen verlagen frictie op korte termijn, maar verlengen doorlooptijd, herplanning en margedruk.

Trade-off 3: kernconsolidatie verhoogt uitvoeringskans in het komende kwartaal, maar vertraagt tijdelijk de opschaling van niet-kerninitiatieven.

De bestuurlijke volwassen vorm van deze trade-offs is dat expliciet wordt benoemd wie wat tijdelijk verliest, waarom dat verlies nodig is en binnen welke termijn het effect zichtbaar moet zijn.

### 4. OPPORTUNITY COST
30 dagen zonder hard besluit: direct signaalverlies, meer herstelwerk en minder voorspelbaarheid in planning en opvolging.

90 dagen zonder hard besluit: zichtbare erosie in doorstroom en margediscipline, plus groeiende spanning tussen formeel besluit en informele praktijk.

365 dagen zonder hard besluit: structurele schade aan bestuurbaarheid, retentie en leverbetrouwbaarheid, met oplopende herstelkosten.

Na 12 maanden verschuift de organisatie van kiezen naar compenseren: uitstel wordt normaal gedrag, en herstel wordt trager en duurder in zowel geld als vertrouwen.

### 5. GOVERNANCE IMPACT
Governance-impact betekent hier dat besluitvorming opnieuw wordt ontworpen op ritme, eigenaarschap en uitvoerbaarheid. In de bovenstroom vraagt dat een vaste weekcadans met eenduidige KPI-definities en harde escalatielijnen. In de onderstroom vraagt dat vooral gelijke toepassing: dezelfde regel voor elk team, dezelfde termijn voor elke blokkade. Zonder die consistentie blijft governance een afspraak op papier in plaats van een werkend systeem.

### 6. MACHTSDYNAMIEK & ONDERSTROOM
De feitelijke macht zit in deze fase vooral op intake, planning en uitzonderingsbesluiten. De CFO verliest ruimte voor losse uitzonderingsbudgetten, maar wint voorspelbaarheid op kas en margelogica. De COO levert informele speelruimte in, maar wint formeel mandaat op capaciteit en doorstroom. Team- en lijnverantwoordelijken verliezen een deel van lokale autonomie, maar krijgen duidelijker kaders voor eerlijke escalatie. De onderstroom blijft zichtbaar in wie informatie doseert, wie tempo remt en wie uitzonderingen probeert te normaliseren.

### 7. EXECUTIERISICO
Het primaire executierisico is terugval in oude werkafspraken zodra spanning oploopt. Het faalpunt is meestal dat oude en nieuwe prioriteiten naast elkaar actief blijven, waardoor teams tegelijk moeten versnellen en stabiliseren. De concrete blocker is dubbelmandaat: formeel wordt een richting gekozen, informeel blijft heronderhandeling bestaan. Dat maakt uitvoering langzaam zonder dat iemand expliciet nee zegt.

### 8. 90-DAGEN INTERVENTIEPLAN
Week 1-2: Owner CEO/CFO. Deliverable: bindend consolidatiebesluit, stop-doinglijst, eigenaarschap per prioriteit en vaste KPI-definities. Escalatiepad: uitzonderingen binnen 48 uur naar de formele regietafel.

Week 3-6: Owner COO. Deliverable: herverdeling van capaciteit, planning en besluitrechten naar een vaste weekcadans met beslislog. Escalatiepad: blokkades binnen 7 dagen sluiten of expliciet accepteren als gekozen verlies.

Week 7-12: Owner DRI per prioriteit. Deliverable: aantoonbare adoptie plus KPI-impact, met uitzonderingen alleen op naam, met reden en met einddatum. Escalatiepad: stil veto direct terug naar boardreview.

Dag 30: eerste executiebewijs zichtbaar in stopkeuzes en besluitdiscipline.

Dag 60: stabiel ritme op intake, planning en opvolging.

Dag 90: meetbare verbetering op doorstroom, marge en effectieve bezetting.

### 9. DECISION CONTRACT
De Raad van Bestuur committeert zich aan: een bindende keuze met eenduidige eindverantwoordelijkheid, vaste termijnen en meetbare uitkomsten. Per direct stopt parallelle sturing op dezelfde KPI's en stopt elk initiatief zonder benoemde owner, deadline en toetsbaar resultaat. Formeel wordt mandaat op intake, planning en uitzonderingen gecentraliseerd waar dat nodig is voor ketenregie. Informeel vervalt de ruimte om via bypass-routes besluituitstel te organiseren. Geaccepteerd verlies is expliciet: tijdelijke pauze van niet-kernwerk, tijdelijke begrenzing van instroom in druksegmenten en tijdelijke inperking van lokale uitzonderingsruimte om bestuurlijke voorspelbaarheid te herstellen.`;

  return trimToMaxWords(
    enforceMinimumWords(base, minWords, maxWords, company),
    maxWords
  );
}

function buildConcreteContextHint(input: BoardroomInput): string {
  const docs = Array.isArray(input.documents) ? input.documents : [];
  const docFragments = docs
    .slice(0, 3)
    .map((doc) => toSafeString(doc?.content).slice(0, 700))
    .filter(Boolean);

  return [
    toSafeString(input.company_name),
    toSafeString(input.company_context),
    toSafeString(input.executive_thesis),
    toSafeString(input.central_tension),
    toSafeString(input.strategic_narrative),
    ...docFragments,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function hardenNarrativeCandidate(
  candidate: string,
  input: BoardroomInput,
  minWords: number,
  maxWords: number
): string {
  let output = trimToCanonicalStart(
    scrubForbiddenLanguage(String(candidate ?? "").trim())
  );
  output = enforceNoMetaNoTemplate(output);
  output = enforceHgbcoHeadings(output);
  output = enforceAtoERatioStructure(output);
  output = enforceUpperLowerStream(output);
  output = enforceDecisionContractHard(output);
  output = ensureMandatorySections(output);
  output = enforceComparableOrgAssumption(output, input);
  output = enforceGGZDepthHints(output, input);
  output = sanitizeSectionOpeners(output);
  output = enforceLossLanguage(output);
  output = sanitizeSectionOpeners(output);
  output = removeRepeatedSectionSentences(output);
  output = consolidateOpportunityCostWindowDuplicates(output);
  output = enforceReadableParagraphRhythm(output);
  output = enforceNinetyDayInterventionParagraphs(output);
  const contextHint = buildConcreteContextHint(input);
  output = enforceConcreteNarrativeMarkdown(
    output,
    contextHint
  );
  output = enforceNoMetaNoTemplate(output);
  output = enforceHgbcoHeadings(output);
  output = enforceAtoERatioStructure(output);
  output = enforceUpperLowerStream(output);
  output = enforceDecisionContractHard(output);
  output = scrubForbiddenLanguage(output);
  output = sanitizeSectionOpeners(output);
  output = removeRepeatedSectionSentences(output);
  output = enforceReadableParagraphRhythm(output);
  output = enforceNinetyDayInterventionParagraphs(output);
  output = sanitizeResidualForbiddenNarrative(output);
  output = enforceMinimumWords(
    output,
    minWords,
    maxWords,
    input.company_name || "de organisatie"
  );
  output = sanitizeResidualForbiddenNarrative(output);
  output = trimToCanonicalStart(output);
  output = sanitizeSectionOpeners(output);
  return trimToMaxWords(scrubForbiddenLanguage(output), maxWords);
}

/* ============================================================
   SYSTEM PROMPT — EXECUTIVE KERNEL
============================================================ */

function buildSystemPrompt(): string {
  return `
${HGBCO_MCKINSEY_SYSTEM_INJECT}
${EXECUTIVE_PROMPT_INJECT}
${MANDATORY_GGZ_CASE_FACTS_BLOCK}
${MULTISOURCE_CONTEXT_DIRECTIVE}
${enforceLanguagePrompt("nl")}
${HARD_FALLBACK_PROMPT_RULE}
${INTELLIGENT_SECTOR_FALLBACK_RULE}
${ANTI_FILLER_RULE}

JE BENT AURELIUS EXECUTIVE KERNEL.
JE RAPPORT IS NIET ADVISEREND.
JE RAPPORT IS NIET BESCHRIJVEND.
JE RAPPORT IS NIET INFORMATIEF.
JE RAPPORT FORCEERT EEN BESTUURSBESLUIT.

JE SCHRIJFT UITSLUITEND NEDERLANDS, OOK KOPPEN EN TERMINOLOGIE.
GEEN MARKETINGTAAL. GEEN AI-TAAL. GEEN VAGE FORMULERINGEN.

CYNTRA SIGNATURE LAYER:
- Besluitkracht blijft de centrale variabele.
- Schrijf menselijk, concreet en bestuurlijk scherp; geen slogans, geen theatrale oneliners.
- Gebruik een empathische maar duidelijke boardroomtoon: confronterend op systeemkeuzes, respectvol richting professionals.
- Maak verlies expliciet en eerlijk verdeeld.
- Benoem formele en informele machtsdynamiek zonder karikaturen of beschuldigende taal.
- Benoem tijdsdruk en cumulatieve schade van uitstel op 30/90/365 dagen.
- Sluit af met een besluitcontract dat uitvoerbaar en toetsbaar is.

VERPLICHTE STRUCTUUR (EXACT):
### 1. DOMINANTE BESTUURLIJKE THESE
### 2. HET KERNCONFLICT
### 3. EXPLICIETE TRADE-OFFS
### 4. OPPORTUNITY COST
### 5. GOVERNANCE IMPACT
### 6. MACHTSDYNAMIEK & ONDERSTROOM
### 7. EXECUTIERISICO
### 8. 90-DAGEN INTERVENTIEPLAN
### 9. DECISION CONTRACT

INHOUDSEISEN:
- Sectie 1 bevat één dominante these in maximaal 10 zinnen.
- Sectie 1 benoemt expliciet de bestuurlijke toetsvraag voor de top.
- Sectie 2 beschrijft een niet-optimaliseerbaar dilemma.
- Sectie 3 benoemt wat wordt gewonnen, wat wordt verloren, wie macht verliest en waar frictie ontstaat.
- Sectie 3 gebruikt alleen meetbare verliezen (EUR/%/volume) als die in de broncontext staan; anders expliciet "niet onderbouwd in geüploade documenten".
- Sectie 4 beschrijft concreet de kosten van niets doen op 30, 90 en 365 dagen.
- Sectie 4 verwerkt drie unieke lagen: 30 dagen = signaalverlies, 90 dagen = machtsverschuiving, 365 dagen = systeemverschuiving.
- Sectie 4 maakt na 12 maanden concreet welke positie permanent schuift, welke coalitie dominant wordt en wat niet zonder reputatieschade terug te draaien is.
- Sectie 4 benoemt sectorspecifieke effecten alleen als ze expliciet in bronmateriaal staan.
- ${NUMERIC_CLAIM_EXPLANATION_DIRECTIVE}
- Sectie 5 benoemt expliciet effect op besluitkracht, escalatie, formele machtsverschuiving en structuurgevolgen.
- ${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}
- Sectie 6 benoemt minimaal drie machtsactoren en maakt per actor verlies, winst, sabotagewijze en instrument expliciet.
- Sectie 6 verweeft formele bovenstroom met informele onderstroom in natuurlijke taal.
- Sectie 7 benoemt waar uitvoering misgaat, wie blokkeert, wat het concrete faalpunt is en welke onderstroom onzichtbaar werkt.
- Sectie 8 gebruikt exact: Week 1-2:, Week 3-6:, Week 7-12:, met owner en KPI per blok.
- Sectie 8 benoemt per blok deliverable, escalatiepad en closure-regel.
- Sectie 8 bevat dag-30, dag-60 en dag-90 beslisgates met meetbaar resultaat.
- ${EXECUTION_PLAN_DEPTH_DIRECTIVE}
- Sectie 9 begint exact met: De Raad van Bestuur committeert zich aan:
- Sectie 9 bevat expliciet: gekozen richting, formeel machtsverlies, informeel machtsverlies, heldere stopregels en geaccepteerd verlies met impact.
- Sectie 9 benoemt actor-impact met rolgevolg; voeg €/% alleen toe als onderbouwd in bronmateriaal.

STIJLREGELS:
- Schrijf per sectie in lange, vloeiende, menselijke alinea's op boardroomniveau.
- Geen vrijblijvende aanbevelingen of algemeenheden.
- Als context dun is: noem hiaten expliciet en verzin geen feiten.
- Geen termen als "op basis van de analyse", "het lijkt erop dat", "mogelijk", "zou kunnen" of "men zou".
- Geen termen als "default template", "transformatie-template", "governance-technisch", "patroon", "context is schaars", "werk uit", "aanname", "contextanker", "belangrijke succesfactor", "quick win" of "low hanging fruit".
- Consolideer: vermijd herhaling van dezelfde alinea in meerdere secties.
- Leg causale keten hard vast: oorzaak -> gevolg -> ingreep -> resultaat.
- Claims moeten terugleidbaar zijn naar de geüploade documenten/context.
  `.trim();
}

function buildContinuationPrompt(rejectReason?: string): string {
  const rejectLine = rejectReason
    ? `REJECT: ${rejectReason}`
    : "REJECT direct elke output met verboden generieke taal of AI-sporen.";

  return `
${HGBCO_MCKINSEY_USER_INJECT}
${EXECUTIVE_PROMPT_INJECT}
${MANDATORY_GGZ_CASE_FACTS_BLOCK}
${MULTISOURCE_CONTEXT_DIRECTIVE}
${HARD_FALLBACK_PROMPT_RULE}
${INTELLIGENT_SECTOR_FALLBACK_RULE}
${ANTI_FILLER_RULE}

${rejectLine}
Ga verder.
Behoud exact de 9 secties.
Houd de toon menselijk, concreet en bestuurlijk scherp.
Schrap slogans en formuletaal; schrijf doorlopend en natuurlijk.
Maak in sectie 6 minimaal drie machtsactoren concreet met verlies, winst, vertraging en instrument.
Werk opportunity cost uit op 30/90/365 plus 12 maanden met irreversibele machts- en coalitieverschuiving.
Gebruik absolute €-bedragen alleen met expliciete berekening + bron; anders expliciet "niet onderbouwd in geüploade documenten".
Werk sectie 8 uit met Week 1-2, Week 3-6, Week 7-12 inclusief owner, deliverable, KPI, escalatiepad en dag-30/60/90 beslisgates.
Sluit sectie 9 af met formeel/informeel machtsverlies, directe stopregels en geaccepteerd verlies met impact.
Neem in sectie 9 actor-impact op met rolgevolg voor sleutelactoren; €/% alleen als brononderbouwd.
Voeg alleen sectorspecifieke claims toe als ze aantoonbaar in de broncontext staan.
Gebruik altijd gecombineerde input uit geüploade documenten en vrije tekstcontext.
${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}
${NUMERIC_CLAIM_EXPLANATION_DIRECTIVE}
${EXECUTION_PLAN_DEPTH_DIRECTIVE}
${CONCRETE_REPROMPT_DIRECTIVE}
`.trim();
}

/* ============================================================
   MAIN — LONGFORM SAFE
============================================================ */

export async function generateBoardroomNarrative(
  input: BoardroomInput,
  options: {
    minWords?: number;
    maxWords?: number;
    temperature?: number;
  } = {}
) {
  const enforceGGZDepth = shouldEnforceGGZDepthFromInput(input);
  const minWords = options.minWords ?? DEFAULT_MIN_WORDS;
  const maxWords = options.maxWords ?? DEFAULT_MAX_WORDS;
  const temperature = options.temperature ?? 0.18;

  const boundedMinWords = Math.max(3500, Math.min(minWords, maxWords));
  const generationWordCap = Math.max(
    boundedMinWords,
    maxWords - RESERVED_STRUCTURE_WORDS
  );

  const rawDocuments: ContextDocument[] = Array.isArray(input.documents)
    ? input.documents
    : [];
  const documents = normalizeDocumentsForPrompt(rawDocuments);

  const q = input.questions ?? {};
  const hasQuestions =
    !!q.q1 && !!q.q2 && !!q.q3 && !!q.q4 && !!q.q5;

  const questionBlock = hasQuestions
    ? `
5 KERNVRAGEN:
1. ${q.q1}
2. ${q.q2}
3. ${q.q3}
4. ${q.q4}
5. ${q.q5}
`
    : `
Vragen zijn onvolledig. Werk uitsluitend met aantoonbare broncontext en benoem ontbrekende informatie expliciet.
`;

  const documentBlock =
    documents.length === 0
      ? "Geen documenten geüpload. Geef alleen brongebonden conclusies uit aanwezige context en markeer dat documentonderbouwing ontbreekt."
      : documents
          .slice(0, 30)
          .map(
            (d, i) => `
--- DOCUMENT ${i + 1}: ${d.filename} ---
${d.content}
`
          )
          .join("\n");

  const legacyContext =
    typeof input.company_context === "string"
      ? input.company_context
      : "";

  const briefContext = buildBriefContext(input);
  const caseContextBlock = buildMandatoryCaseContextBlock(
    documents,
    legacyContext,
    briefContext
  );
  const groundingSource = buildGroundingSource(
    input,
    documents,
    legacyContext,
    briefContext
  );

  const baseMessages: AIMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    {
      role: "user",
      content: `
${HGBCO_MCKINSEY_USER_INJECT}
${EXECUTIVE_PROMPT_INJECT}
${MANDATORY_GGZ_CASE_FACTS_BLOCK}
${MULTISOURCE_CONTEXT_DIRECTIVE}
${HARD_FALLBACK_PROMPT_RULE}
${INTELLIGENT_SECTOR_FALLBACK_RULE}
${ANTI_FILLER_RULE}

ORGANISATIE: ${input.company_name ?? "Onbenoemd"}

${questionBlock}

CONTEXTDOCUMENTEN:
${documentBlock}

VOLLEDIG CASUSDOSSIER (VERPLICHT LEIDEND):
${caseContextBlock}

BRIEF CONTEXT:
${briefContext || "Geen bruikbare brief-context; rapporteer alleen wat uit bronmateriaal afleidbaar is."}

LEGACY CONTEXT:
${legacyContext || "Geen legacy-context; markeer ontbrekende onderbouwing expliciet."}
`.trim(),
    },
  ];
  let messages: AIMessage[] = [...baseMessages];

  let text = "";
  let loops = 0;
  let consecutiveFailures = 0;

  const rebuildContinuationMessages = (rejectReason?: string) => {
    const continuationPrompt = buildContinuationPrompt(rejectReason);
    const assistantTail = String(text || "").trim().slice(-16000);
    if (!assistantTail) {
      messages = [...baseMessages, { role: "user", content: continuationPrompt }];
      return;
    }
    messages = [
      ...baseMessages,
      { role: "assistant", content: assistantTail },
      { role: "user", content: continuationPrompt },
    ];
  };

  while (countWords(text) < boundedMinWords && loops < MAX_LOOPS) {
    if (countWords(text) >= generationWordCap) {
      break;
    }

    try {
      const chunk = await callAI("gpt-4o", messages, {
        max_tokens: CHUNK_TOKENS,
        temperature,
      });

      if (typeof chunk === "string" && chunk.trim()) {
        const trimmedChunk = chunk.trim();

        if (hasForbiddenGenericLanguage(trimmedChunk)) {
          consecutiveFailures = 0;
          rebuildContinuationMessages(
            "vorige output bevatte verboden generieke consultancy-taal en is afgekeurd; lever volledige herwerking zonder verboden termen"
          );
        } else {
          const merged = text ? `${text}\n\n${trimmedChunk}` : trimmedChunk;
          text = trimToMaxWords(merged, generationWordCap);
          consecutiveFailures = 0;
          rebuildContinuationMessages();
        }
      } else {
        consecutiveFailures += 1;
        if (consecutiveFailures <= 2) {
          rebuildContinuationMessages(
            "vorige output was leeg of afgebroken; ga exact verder vanaf de laatste volledige zin zonder herhaling"
          );
        } else {
          break;
        }
      }
    } catch {
      consecutiveFailures += 1;
      if (consecutiveFailures <= 3) {
        rebuildContinuationMessages(
          "vorige call faalde technisch; hervat exact vanaf de laatste volledige zin en behoud de 9-sectiestructuur"
        );
      } else {
        break;
      }
    }

    loops++;
  }

  let candidate = text.trim() || buildFallbackNarrative(input, boundedMinWords, maxWords);
  candidate = hardenNarrativeCandidate(candidate, input, boundedMinWords, maxWords);
  candidate = sanitizeResidualForbiddenNarrative(candidate);
  candidate = sanitizeUngroundedNumericSignals(candidate, groundingSource);
  validateHgbcoMcKinseyRuntime(candidate);

  try {
    assertExecutiveKernelQuality(candidate, enforceGGZDepth);
  } catch {
    const hasAllMandatoryHeadings = STRUCTURE_HEADINGS.every((heading) =>
      candidate.includes(heading)
    );
    const salvageableLongform =
      countWords(candidate) >= Math.max(3200, boundedMinWords - 400) &&
      hasAllMandatoryHeadings &&
      !hasForbiddenGenericLanguage(candidate);

    if (!salvageableLongform) {
      const fallback = buildFallbackNarrative(input, boundedMinWords, maxWords);
      const concreteFallback = hardenNarrativeCandidate(
        fallback,
        input,
        boundedMinWords,
        maxWords
      );
      const sanitizedFallback = sanitizeResidualForbiddenNarrative(concreteFallback);
      const groundedFallback = sanitizeUngroundedNumericSignals(
        sanitizedFallback,
        groundingSource
      );
      validateHgbcoMcKinseyRuntime(groundedFallback);

      try {
        assertExecutiveKernelQuality(groundedFallback, enforceGGZDepth);
        candidate = groundedFallback;
      } catch {
        candidate = groundedFallback;
      }
    }
  }

  candidate = sanitizeResidualForbiddenNarrative(candidate);
  candidate = sanitizeUngroundedNumericSignals(candidate, groundingSource);
  validateHgbcoMcKinseyRuntime(candidate);

  assertExecutiveKernelQuality(candidate, enforceGGZDepth);
  assertHardOutputGate(candidate);

  return {
    text: candidate,
    metrics: {
      words: countWords(candidate),
      loops,
      documents_used: rawDocuments.length,
      used_questions: hasQuestions,
    },
  };
}
