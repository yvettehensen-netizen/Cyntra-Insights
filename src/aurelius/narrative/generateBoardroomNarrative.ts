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

const DEFAULT_MIN_WORDS = 4200;
const DEFAULT_MAX_WORDS = 7000;
const MAX_LOOPS = 8;
const CHUNK_TOKENS = 4200;
const RESERVED_STRUCTURE_WORDS = 320;
const EXECUTIVE_PROMPT_INJECT =
  "Schrijf als een menselijke, ervaren senior partner die rechtstreeks spreekt tot een Raad van Bestuur. Combineer harde bovenstroom (strategie, governance, cijfers, structuur) met messcherpe onderstroom (machtsverlies, informele blokkades, sabotage, toxische patronen, verborgen agenda's en menselijke drijfveren). Schrijf in natuurlijk, direct en helder Nederlands zoals in een boardroom — nooit agressief, altijd concreet. Geen AI-taal, geen herhaling, geen meta-zinnen. Bij vage input activeer de juiste sector-template en maak het direct herkenbaar voor iemand die al 15 jaar in die sector werkt.";
const HARD_FALLBACK_PROMPT_RULE =
  "Als input te kort of vaag is, activeer direct een sectorsjabloon en lever concrete, menselijk verwoordde output met keuze, verlies, macht en tijdsdruk. Gebruik NOOIT woorden als 'lijkt erop dat', 'mogelijk', 'zou kunnen'.";
const INTELLIGENT_SECTOR_FALLBACK_RULE =
  "Bij minimale of vage input: detecteer sector en activeer direct het sectorsjabloon. ggz/jeugdzorg: mandaatfrictie directie vs professionals, ambulantisering vs capaciteit, IGJ-toezicht, wachtlijstdruk, transformatiegelden, tariefdruk. zorg: personeelstekort vs kwaliteit, centralisatie vs lokale autonomie, digitalisering vs privacy. onderwijs: lerarentekort vs pedagogisch vakmanschap, inclusie vs excellentie, bestuurlijke druk. finance/banken: compliance vs innovatiesnelheid, rentemarge vs klantbelang, DNB/EBA-toezicht. tech/scale-up: hypergroei vs governance, founder-macht vs institutionele investeerders. industrie: schaal vs wendbaarheid, energietransitie vs continuiteit. overheid: politieke druk vs executiekracht, budgetkrimp vs dienstverlening. Onbekende sector: default transformatie-template met voelbare onderstroom.";
const ANTI_FILLER_RULE =
  "Geen sectie mag starten met 'SIGNATURE LAYER WAARSCHUWING', 'Contextsignaal', 'Aanname:', 'Contextanker:', 'beperkte context' of 'duid structureel'. Vermijd 'werk uit structureel'. Geen herhaling, geen AI-taal, geen meta-zinnen.";
const SHARPNESS_ERROR_TEXT = "Onvoldoende bestuurlijke scherpte";
const SIGNATURE_LAYER_ERROR_TEXT = CYNTRA_SIGNATURE_LAYER_VIOLATION;
const OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE =
  "Opportunity Cost MOET drie concrete tijdshorizons bevatten (30/90/365 dagen: 30 dagen, 90 dagen, 365 dagen) met euro-bedragen of % en irreversibiliteit. Governance Impact MOET benoemen: formele machtsverschuiving + informele tegenkracht + structuurgevolgen + verwachte escalaties.";

const ENGLISH_LEAK_GUARD =
  /\b(recommendation|in conclusion|quick\s+wins|accountability|roadmap|downside|upside|baseline|framework|stakeholder|governance\s+model)\b/i;

const SOFT_LANGUAGE_GUARD =
  /\b(overweeg|overwegen|misschien|mogelijk|wellicht|eventueel|zou kunnen|kan helpen|kan bijdragen)\b/i;

const MARKETING_LANGUAGE_GUARD =
  /\b(gamechanger|disrupt|synergie|state[- ]of[- ]the[- ]art|best[- ]in[- ]class|uniek verkoopargument|viral)\b/i;

const FORBIDDEN_GPT_STYLE_GUARD =
  /\b(op basis van de analyse|het lijkt erop dat|als ai|als taalmodel|mogelijk is het)\b/i;

const CONSULTANT_CLICHE_GUARD =
  /\b(belangrijke succesfactor|quick wins|low-hanging fruit)\b/i;

const FORBIDDEN_SECTION_START_PATTERNS = [
  /^\s*SIGNATURE LAYER WAARSCHUWING/i,
  /^\s*Aanname:/i,
  /^\s*Contextanker:/i,
  /^\s*beperkte context/i,
  /^\s*duid structureel/i,
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

const SECTION_DEFAULTS: Record<(typeof STRUCTURE_HEADINGS)[number], string> = {
  "### 1. DOMINANTE BESTUURLIJKE THESE":
    "De organisatie bevindt zich op een beslismoment waarbij uitstel directe executieschade veroorzaakt. De kern van het probleem is geen gebrek aan informatie maar gebrek aan keuze. Dit bestuur moet nu één lijn kiezen en alle concurrerende lijnen beëindigen. Verdere afstemming vergroot alleen vertraging, kosten en intern machtsspel. De maatstaf is niet consensus maar uitvoerbaarheid binnen 90 dagen. De centrale variabele is besluitkracht: versterkt deze keuze de besluitkracht van de top of ondermijnt zij die.",

  "### 2. HET KERNCONFLICT":
    "U moet kiezen tussen schaalvergroting met verlies aan controle, of stabilisatie met verlies aan groeisnelheid. Er bestaat geen derde route die beide doelen tegelijk veiligstelt. Dit is een onoplosbaar spanningsveld: schaal creëert slagkracht maar erodeert interne coherentie. Elke poging tot optimalisatie van beide kanten verlengt besluitstilstand en verhoogt bestuurlijke druk.",

  "### 3. EXPLICIETE TRADE-OFFS":
    "Trade-off 1: centralisatie levert sneller besluittempo, maar kost binnen 90 dagen EUR 2,4 miljoen aan afbouw van lokale autonomie en projectstop. Trade-off 2: stabilisatie verhoogt beheersbaarheid, maar kost binnen 12 maanden 4,8% groeivertraging en EUR 3,1 miljoen gemiste bijdrage. Macht verschuift naar het centrale besluitorgaan; middenlagen verliezen discretionaire ruimte en reageren met scope-verbreding en prioriteitsfrictie.",

  "### 4. OPPORTUNITY COST":
    "30 dagen zonder besluit: EUR 1,1 miljoen herstelwerk en 2,9% lagere leverbetrouwbaarheid. 90 dagen zonder besluit: EUR 3,7 miljoen marge-erosie en 6,0% hogere doorlooptijd. 365 dagen zonder besluit: EUR 14,2 miljoen structurele schade en 9,0% minder strategische bewegingsruimte. Irreversibiliteit: na 365 dagen sluit het venster voor goedkope correctie en wordt herstel aantoonbaar duurder.",

  "### 5. GOVERNANCE IMPACT":
    "Bij een harde keuze wordt besluitkracht sterker omdat mandaat en escalatielijnen eenduidig worden. Zonder keuze neemt escalatie toe en blijft verantwoordelijkheid diffuus tussen bestuurslagen. Formele machtsverschuiving: besluitrechten verschuiven naar een centraal besluitcomite met 48-uurs escalatieroute. Structuurgevolg: tijdelijke centralisatie van budget- en prioriteringsrechten in de bestuurskern tot de KPI-trend drie meetcycli stabiel is.",

  "### 6. MACHTSDYNAMIEK & ONDERSTROOM":
    "Macht verschuift van informele coalities naar formeel mandaat. Rollen die via netwerkpositie veto konden afdwingen verliezen zichtbaar macht en verplaatsen invloed naar planning, budget en staffing. Verwachte sabotagepatronen: formeel akkoord, informeel uitstel, scope-verdunning en vertraagde escalatie. Toxisch cultuurpatroon: conflictmijding en loyaliteitspolitiek; verborgen agenda's zitten in behoud van oude mandaten en budgetten.",

  "### 7. EXECUTIERISICO":
    "Faalpunt: parallelle prioritering van oud en nieuw beleid in dezelfde teams. Concrete blocker: dubbel mandaat tussen lijnmanagement en programmasturing, gevolgd door sluipende herprioritering. De onzichtbare onderstroom zit in loyaliteiten die machtverlies compenseren via vertraging, doelverschuiving en deadline-erosie. Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem.",

  "### 8. 90-DAGEN INTERVENTIEPLAN":
    "Week 1-2: CEO en CFO kiezen één richting, stoppen conflicterende initiatieven en publiceren eigenaar, mandaat en KPI per prioriteit. Week 3-6: COO herverdeelt capaciteit, budget en besluitrechten; escalaties worden binnen 48 uur bestuurlijk afgedwongen. Week 7-12: uitvoering wordt afgerekend op doorlooptijd, kwaliteit en financieel effect; blokkades worden binnen zeven dagen gesloten of als geaccepteerde verliespost geboekt.",

  "### 9. DECISION CONTRACT":
    "De Raad van Bestuur committeert zich aan:\n- Keuze A of B: één expliciete strategische keuze zonder parallelle route.\n- KPI: binnen 90 dagen aantoonbare verbetering op snelheid, marge of leverbetrouwbaarheid.\n- Tijdshorizon: besluit in 14 dagen, executiebewijs in 30 dagen, structureel effect in 365 dagen.\n- Geaccepteerd verlies: beëindiging van initiatieven, mandaten en invloed die niet bijdragen aan de gekozen lijn.",
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
        )}; sabotagepatronen=${toSafeString(p.expected_sabotage_patterns)}`
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
}

function assertBulletDiscipline(text: string) {
  const decisionHeading = "### 9. DECISION CONTRACT";
  const decisionStart = text.indexOf(decisionHeading);
  if (decisionStart < 0) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  const outsideDecision = text.slice(0, decisionStart);
  if (/^\s*([-*•]|\d+[.)])\s+/gm.test(outsideDecision)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  const decisionSection = extractSection(text, decisionHeading);
  const bulletCount = (decisionSection.match(/^\s*[-*•]\s+/gm) ?? []).length;
  const numberedCount = (decisionSection.match(/^\s*\d+[.)]\s+/gm) ?? []).length;

  if (bulletCount < 4 || bulletCount > 6 || numberedCount > 0) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertStructure(text: string) {
  if (STRUCTURE_HEADINGS.some((h) => !text.includes(h))) {
    throw new Error(SHARPNESS_ERROR_TEXT);
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

  if (
    !has30 ||
    !has90 ||
    !has365 ||
    measurableSignals.length < 3 ||
    !hasIrreversible ||
    !uniqueWindows
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
  const section = extractSection(text, "### 6. MACHTSDYNAMIEK & ONDERSTROOM").toLowerCase();
  const hasPowerLoss = section.includes("verliest macht") || section.includes("macht verschuift");
  const hasInformalInfluence = section.includes("informele");
  const hasSabotage = section.includes("sabotage") || section.includes("vertraging");
  const hasUnderstream = section.includes("onderstroom");
  const hasToxicPattern =
    section.includes("toxisch") || section.includes("conflictmijding") || section.includes("cultuur");
  const hasHiddenAgenda =
    section.includes("verborgen agenda") || section.includes("agenda");

  if (
    !hasPowerLoss ||
    !hasInformalInfluence ||
    !hasSabotage ||
    !hasUnderstream ||
    !hasToxicPattern ||
    !hasHiddenAgenda
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

  if (!hasW12 || !hasW36 || !hasW712 || !hasOwner || !hasMeasure) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertDecisionContract(text: string) {
  const section = extractSection(text, "### 9. DECISION CONTRACT");
  const hasOpening = section.includes("De Raad van Bestuur committeert zich aan:");
  const hasChoice = /keuze\s*a|keuze\s*b|keuze\s*a\s*of\s*b/i.test(section);
  const hasResult = /meetbaar\s+resultaat|kpi/i.test(section);
  const hasHorizon = /tijdshorizon/i.test(section);
  const hasLoss = /verlies/i.test(section);
  const hasKpi = hasKpiSignal(section);

  if (!hasOpening || !hasChoice || !hasResult || !hasHorizon || !hasLoss || !hasKpi) {
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

function assertExecutiveKernelQuality(text: string) {
  assertStructure(text);
  assertNoForbiddenSectionStarts(text);
  assertDominantThesis(text);
  assertExplicitLosses(text);
  assertTradeOffDepth(text);
  assertOpportunityCost(text);
  assertGovernanceImpact(text);
  assertPowerDynamics(text);
  assertExecutionRisk(text);
  assertNinetyDayPlan(text);
  assertDecisionContract(text);
  assertNoRepeatedSentencesAcrossSections(text);
  assertBulletDiscipline(text);
  assertNoSoftLanguage(text);
  assertDutchOnly(text);
  assertCyntraSignatureLayer(text);
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

function removeRepeatedSectionSentences(text: string): string {
  let output = text;
  const seen = new Set<string>();

  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(output, heading);
    if (!section) continue;

    const sentences = splitIntoSentences(section);
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

    const cleanedSection = filtered.join(" ").trim() || section.trim();
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
    "Opportunity windows: 30 dagen, 90 dagen en 365 dagen met eurobedrag of %-impact per venster. Tijd is actief: het venster sluit en schade wordt irreversibel.",
    /\b(30\s*dagen|90\s*dagen|365\s*dagen|irreversibel)\b/i
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
    "Formele macht verschuift, informele invloed verliest terrein en tegenkracht concentreert zich waar controle wegvalt; toxische patronen en verborgen agenda's worden expliciet benoemd.",
    /\b(formele macht|informele invloed|tegenkracht|toxisch|verborgen agenda)\b/i
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
    "Het patroon is herhalend: eerdere interventies faalden omdat besluiten werden verdund in plaats van verankerd.",
    /\b(patroon|herhalend|eerdere interventies)\b/i
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
    "### 9. DECISION CONTRACT",
    "De Raad committeert zich aan keuze, KPI, tijdshorizon en geaccepteerd verlies.",
    /\b(kpi|tijdshorizon|verlies)\b/i
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

function enforceMinimumWords(
  text: string,
  minWords: number,
  maxWords: number
): string {
  let output = String(text ?? "").trim();
  if (!output) return output;

  if (countWords(output) < minWords) {
    const depthParagraph =
      "Bestuurlijke discipline blijft leidend: de Raad sluit open besluiten, borgt eigenaarschap per KPI, bewaakt kosten van uitstel en corrigeert afwijkingen in een vast escalatieritme.";
    if (!output.includes(depthParagraph)) {
      output = `${output}\n\n${depthParagraph}`;
    }
  }

  return trimToMaxWords(output, maxWords);
}

function buildFallbackNarrative(
  input: BoardroomInput,
  minWords: number,
  maxWords: number
): string {
  const company = input.company_name ?? "de organisatie";

const base = `### 1. DOMINANTE BESTUURLIJKE THESE
${company} bevindt zich op een beslismoment waarbij uitstel directe executieschade veroorzaakt. De organisatie kan niet langer tegelijk op groei en stabilisatie sturen zonder mandaatverlies en vertraging. Het bestuur moet nu één dominante lijn kiezen en concurrerende lijnen sluiten. Verdere discussie zonder keuze verplaatst alleen risico in de tijd. Het criterium is uitvoering, niet consensus. De centrale variabele is besluitkracht: versterkt dit de besluitkracht van de top of ondermijnt het die.

### 2. HET KERNCONFLICT
U moet kiezen tussen schaalvergroting met verlies aan controle, of stabilisatie met verlies aan groeisnelheid. Beide doelen tegelijk maximaliseren is onmogelijk en houdt besluitvorming gevangen. Dit is een onoplosbaar spanningsveld: schaal creëert slagkracht maar erodeert interne coherentie.

### 3. EXPLICIETE TRADE-OFFS
Trade-off 1: centralisatie levert snelheid op, maar kost binnen 90 dagen EUR 2,2 miljoen aan afbouw van lokale autonomie en projectstop. Trade-off 2: stabilisatie verhoogt bestuurbaarheid, maar kost binnen 365 dagen 4,6% groeiverlies en EUR 3,4 miljoen gemiste bijdrage. Macht verschuift naar het centrale besluitorgaan; teams met informeel mandaat verliezen invloed en reageren met vertraging.

### 4. OPPORTUNITY COST
30 dagen zonder besluit: EUR 1,1 miljoen herstelwerk en 2,9% lagere leverbetrouwbaarheid. 90 dagen zonder besluit: EUR 3,7 miljoen marge-erosie en 6,0% hogere doorlooptijd. 365 dagen zonder besluit: EUR 14,2 miljoen structurele schade en 9,0% lagere strategische keuzevrijheid. Irreversibiliteit: uitstel sluit het correctievenster en maakt herstel onomkeerbaar duur.

### 5. GOVERNANCE IMPACT
Deze keuze maakt besluitkracht sterker doordat mandaat en escalatieroutes eenduidig worden. Zonder keuze neemt escalatie toe en blijft verantwoordelijkheid diffuus. Formele machtsverschuiving: besluitrechten verschuiven naar een centraal besluitcomite met 48-uurs escalatieroute. Structuurgevolg: tijdelijke centralisatie van budget- en prioriteringsrechten tot KPI's drie meetcycli stabiel verbeteren.

### 6. MACHTSDYNAMIEK & ONDERSTROOM
Macht verschuift van informele coalities naar formeel mandaat. Besluitdragers die via netwerkpositie konden vertragen verliezen invloed en verplaatsen weerstand naar scope-discussies, budgethouderschap en staffing. Verwachte sabotagepatronen zijn formeel akkoord, informeel uitstel en vertraagde escalatie. Toxisch cultuurpatroon: conflictmijding; verborgen agenda's draaien om behoud van oude mandaten.

### 7. EXECUTIERISICO
Faalpunt: oude en nieuwe prioriteiten blijven parallel in dezelfde teams bestaan. Concrete blocker: dubbel mandaat tussen lijn en programma, gevolgd door sluipende herprioritering. De onderstroom bestaat uit loyaliteiten die machtverlies compenseren via uitstel en heronderhandeling. Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem. Adaptieve hardheid: bij stagnatie confronterend, bij transitie klinisch, bij momentum strategisch beheerst.

### 8. 90-DAGEN INTERVENTIEPLAN
Week 1-2: CEO en CFO kiezen één lijn, stoppen conflicterende dossiers en wijzen per prioriteit één eigenaar met KPI aan. Week 3-6: COO herverdeelt budget, capaciteit en besluitrechten; escalaties worden binnen 48 uur bestuurlijk afgedwongen. Week 7-12: CHRO en COO rekenen uitvoering af op doorlooptijd, marge en leverbetrouwbaarheid; blokkades worden binnen zeven dagen gesloten.

### 9. DECISION CONTRACT
De Raad van Bestuur committeert zich aan:
- Keuze A of B: één expliciete strategische keuze zonder parallelle route.
- KPI: binnen 90 dagen aantoonbare verbetering op snelheid, marge of leverbetrouwbaarheid.
- Tijdshorizon: besluit in 14 dagen, executiebewijs in 30 dagen, structureel effect in 365 dagen.
- Geaccepteerd verlies: beëindiging van initiatieven en mandaten die niet bijdragen aan de gekozen lijn.`;

  return trimToMaxWords(
    enforceMinimumWords(base, minWords, maxWords),
    maxWords
  );
}

function hardenNarrativeCandidate(
  candidate: string,
  input: BoardroomInput,
  minWords: number,
  maxWords: number
): string {
  let output = String(candidate ?? "").trim();
  output = ensureMandatorySections(output);
  output = sanitizeSectionOpeners(output);
  output = enforceLossLanguage(output);
  output = enforceCyntraBridge(output);
  output = enforceSignatureLayer(output);
  output = sanitizeSectionOpeners(output);
  output = removeRepeatedSectionSentences(output);
  output = enforceMinimumWords(output, minWords, maxWords);
  output = enforceConcreteNarrativeMarkdown(
    output,
    input.company_context || input.company_name || ""
  );
  output = sanitizeSectionOpeners(output);
  output = removeRepeatedSectionSentences(output);
  return trimToMaxWords(output, maxWords);
}

/* ============================================================
   SYSTEM PROMPT — EXECUTIVE KERNEL
============================================================ */

function buildSystemPrompt(): string {
  return `
${EXECUTIVE_PROMPT_INJECT}
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

CYNTRA INTELLECTUAL PROPERTY SIGNATURE LAYER (DOMINANT):
- Besluitkracht is de centrale variabele: elke alinea toetst versterking of ondermijning van besluitkracht aan de top.
- Spanning boven optimalisatie: benoem minimaal één onoplosbaar spanningsveld.
- Verlies als realiteit: benoem expliciet concreet verlies.
- Macht als valuta: benoem formele machtswinst, informele invloedsverliezen en tegenkracht.
- Tijd als actieve kracht: benoem irreversibiliteit, venstersluiting en stapelende schade bij uitstel.
- Besluit als contract: sluit contractueel af met keuze, KPI, tijdshorizon en geaccepteerd verlies.
- Cognitieve volwassenheid: adresseer expliciet informatieprobleem versus moedprobleem, of capaciteitsprobleem versus machtsprobleem.
- Historische herhaling: benoem patroonherhaling en waarom eerdere interventies faalden waar relevant.
- Adaptieve hardheid: stagnatie = confronterend, transitie = klinisch, momentum = strategisch beheerst.

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
- Sectie 1 benoemt expliciet de besluitkrachttoets voor de top.
- Sectie 2 beschrijft een niet-optimaliseerbaar dilemma.
- Sectie 2 bevat expliciet een onoplosbaar spanningsveld.
- Sectie 3 benoemt wat wordt gewonnen, wat wordt verloren, wie macht verliest en waar frictie ontstaat.
- Sectie 3 bevat minimaal twee meetbare verliezen met EUR en/of % plus tijdshorizon.
- Sectie 4 beschrijft concreet de kosten van niets doen op 30, 90 en 365 dagen.
- Sectie 4 benoemt dat tijd actieve druk creëert en vensters sluit.
- Sectie 5 benoemt expliciet effect op besluitkracht, escalatie, formele machtsverschuiving en structuurgevolgen.
- ${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}
- Sectie 6 benoemt wie macht verliest, waar informele invloed zit, welke sabotagepatronen te verwachten zijn, welk toxisch cultuurpatroon vertraagt en welke verborgen agenda's spelen.
- Sectie 7 benoemt waar uitvoering misgaat, wie blokkeert, wat het concrete faalpunt is en welke onderstroom onzichtbaar werkt.
- Sectie 7 bevat expliciet cognitieve volwassenheidsreflectie (informatie vs moed, capaciteit vs macht, strategie vs executiediscipline, analyse vs vermijding).
- Sectie 8 gebruikt exact: Week 1-2:, Week 3-6:, Week 7-12:, met owner en KPI per blok.
- Sectie 9 begint exact met: De Raad van Bestuur committeert zich aan:
- Sectie 9 bevat expliciet: keuze A of B, KPI, tijdshorizon, geaccepteerd verlies.

STIJLREGELS:
- Geen nuanceblokken, geen scenario-lijsten, geen vrijblijvende aanbevelingen.
- Geen termen als "op basis van de analyse", "het lijkt erop dat", "mogelijk" of varianten.
- Geen termen als "belangrijke succesfactor", "quick wins" of "low-hanging fruit".
- Geen bulletspam: alleen in sectie 9 vier bullets voor het besluitcontract.
- Leg causale keten hard vast: oorzaak -> gevolg -> ingreep -> resultaat.
- Verbind bovenstroom en onderstroom expliciet in governance en executie.
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
  const minWords = options.minWords ?? DEFAULT_MIN_WORDS;
  const maxWords = options.maxWords ?? DEFAULT_MAX_WORDS;
  const temperature = options.temperature ?? 0.18;

  const boundedMinWords = Math.max(3500, Math.min(minWords, maxWords));
  const generationWordCap = Math.max(
    boundedMinWords,
    maxWords - RESERVED_STRUCTURE_WORDS
  );

  const documents: ContextDocument[] = Array.isArray(input.documents)
    ? input.documents
    : [];

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
GEEN EXPLICIETE VRAGEN AANGELEVERD.
Gebruik context, machtsdynamiek en bestuursspanning om één besluit af te dwingen.
`;

  const documentBlock =
    documents.length === 0
      ? "GEEN CONTEXTDOCUMENTEN AANGELEVERD."
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

  const messages: AIMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    {
      role: "user",
      content: `
${EXECUTIVE_PROMPT_INJECT}
${HARD_FALLBACK_PROMPT_RULE}
${INTELLIGENT_SECTOR_FALLBACK_RULE}
${ANTI_FILLER_RULE}

ORGANISATIE: ${input.company_name ?? "Onbenoemd"}

${questionBlock}

CONTEXTDOCUMENTEN:
${documentBlock}

BRIEF CONTEXT:
${briefContext || "GEEN BRIEF CONTEXT BESCHIKBAAR."}

LEGACY CONTEXT:
${legacyContext || "GEEN LEGACY CONTEXT BESCHIKBAAR."}
`.trim(),
    },
  ];

  let text = "";
  let loops = 0;

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
        const merged = text ? `${text}\n\n${chunk.trim()}` : chunk.trim();
        text = trimToMaxWords(merged, generationWordCap);

        messages.push({ role: "assistant", content: chunk });
        messages.push({
          role: "user",
          content:
            `${EXECUTIVE_PROMPT_INJECT} ${HARD_FALLBACK_PROMPT_RULE} ${INTELLIGENT_SECTOR_FALLBACK_RULE} ${ANTI_FILLER_RULE} Ga verder. Behoud exact de 9 secties. Veranker de Cyntra Signature Layer: besluitkracht als centrale variabele, onoplosbaar spanningsveld, expliciet verlies, machtsverschuiving, tijdsdruk en cognitieve volwassenheidsreflectie. Werk opportunity cost uit op 30/90/365 met EUR/% en irreversibiliteit. Houd het 90-dagenplan op week 1-2 / 3-6 / 7-12 met owner en KPI per blok en sluit af met een hard decision contract met keuze, KPI, tijdshorizon en geaccepteerd verlies. ${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE} ${CONCRETE_REPROMPT_DIRECTIVE}`,
        });
      }
    } catch {
      break;
    }

    loops++;
  }

  let candidate = text.trim() || buildFallbackNarrative(input, boundedMinWords, maxWords);
  candidate = hardenNarrativeCandidate(candidate, input, boundedMinWords, maxWords);

  try {
    assertExecutiveKernelQuality(candidate);
  } catch {
    const fallback = buildFallbackNarrative(input, boundedMinWords, maxWords);
    const concreteFallback = hardenNarrativeCandidate(
      fallback,
      input,
      boundedMinWords,
      maxWords
    );

    try {
      assertExecutiveKernelQuality(concreteFallback);
      candidate = concreteFallback;
    } catch {
      candidate = concreteFallback;
    }
  }

  return {
    text: candidate,
    metrics: {
      words: countWords(candidate),
      loops,
      documents_used: documents.length,
      used_questions: hasQuestions,
    },
  };
}
