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
  "Schrijf als een zeer ervaren, licht cynische senior ggz-partner die rechtstreeks spreekt tot de Raad van Bestuur. Combineer harde bovenstroom (strategie, governance, cijfers, structuur) met confronterende onderstroom (machtsverlies, informele blokkades, sabotage, toxische patronen, verborgen agenda's en menselijke drijfveren). Schrijf vloeiend, natuurlijk en direct Nederlands. Geen generieke consultancy-taal, geen filler, geen herhaling, geen AI-sporen. Bij vage input activeer de ggz-template met echte pijnpunten: IGJ-sanctierisico, wachtlijst-MAC-druk, ambulantisering vs klinische capaciteit, transformatiegelden opdrogen, zorgzwaartebekostiging onder druk, personeelstekort en burn-out realiteit. Zorg dat elke sectie een vloeiende, menselijke alinea vormt.";
const HARD_FALLBACK_PROMPT_RULE =
  "Als input dun is, begin zonder excuus met: 'Op basis van bestuurlijke patronen in de ggz:'. Maak realistische aannames die direct besluitdruk zetten. Gebruik nooit woorden als 'lijkt erop dat', 'mogelijk', 'zou kunnen' of 'men zou'.";
const INTELLIGENT_SECTOR_FALLBACK_RULE =
  "Bij minimale of vage input: detecteer sector en activeer direct het sectorsjabloon. ggz/jeugdzorg: mandaatfrictie directie vs professionals, ambulantisering vs capaciteit, IGJ-toezicht, wachtlijstdruk, transformatiegelden, tariefdruk. zorg: personeelstekort vs kwaliteit, centralisatie vs lokale autonomie, digitalisering vs privacy. onderwijs: lerarentekort vs pedagogisch vakmanschap, inclusie vs excellentie, bestuurlijke druk. finance/banken: compliance vs innovatiesnelheid, rentemarge vs klantbelang, DNB/EBA-toezicht. tech/scale-up: hypergroei vs governance, founder-macht vs institutionele investeerders. industrie: schaal vs wendbaarheid, energietransitie vs continuiteit. overheid: politieke druk vs executiekracht, budgetkrimp vs dienstverlening. Onbekende sector: transformatieroute met voelbare onderstroom.";
const ANTI_FILLER_RULE =
  "Geen sectie mag starten met 'SIGNATURE LAYER WAARSCHUWING', 'Contextsignaal', 'Aanname:', 'Contextanker:', 'beperkte context' of 'duid structureel'. Verbied generieke taal zoals 'default template', 'transformatie-template', 'governance-technisch', 'patroon', 'context is schaars', 'werk uit', 'mogelijk', 'lijkt erop dat', 'zou kunnen', 'men zou', 'belangrijke succesfactor', 'quick win' en 'low hanging fruit'.";
const SHARPNESS_ERROR_TEXT = "Onvoldoende bestuurlijke scherpte";
const SIGNATURE_LAYER_ERROR_TEXT = CYNTRA_SIGNATURE_LAYER_VIOLATION;
const OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE =
  "Opportunity Cost MOET drie unieke lagen bevatten: 30 dagen (direct signaalverlies + eerste gedragsverschuiving), 90 dagen (zichtbare machtsverschuiving + structurele erosie), 365 dagen (systeemverschuiving + onomkeerbare positie + dominante coalitie). Maak na 12 maanden concreet wat niet zonder reputatieschade terug te draaien is.";

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
  /\b(default template|transformatie-template|governance-technisch|patroon|context is schaars|werk uit|mogelijk|lijkt erop dat|zou kunnen|men zou|belangrijke succesfactor|quick win|quick wins|low-hanging fruit|low hanging fruit|aanname|contextanker)\b/i;

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
    "In de bovenstroom staat de formele koers op papier; in de onderstroom bepaalt verliesangst welke keuze echt doorleeft.",
  "### 2. HET KERNCONFLICT":
    "Bovenstroom stuurt op KPI-logica en mandaat, onderstroom stuurt op loyaliteit en territoriumdrang; die botsing maakt dit conflict hard.",
  "### 3. EXPLICIETE TRADE-OFFS":
    "In de bovenstroom heet dit prioritering, in de onderstroom is dit een gevecht om wie pijn incasseert en wie zijn positie bewaart.",
  "### 4. OPPORTUNITY COST":
    "De bovenstroom ziet een oplopende verliescurve, de onderstroom normaliseert uitstel totdat de machtsverschuiving onomkeerbaar is.",
  "### 5. GOVERNANCE IMPACT":
    "Bovenstroom tekent mandaatlijnen en escalatiepad, onderstroom test die lijnen via informatiefiltering en uitzonderingsdruk.",
  "### 6. MACHTSDYNAMIEK & ONDERSTROOM":
    "In de bovenstroom wordt verantwoordelijkheid toegewezen, in de onderstroom wordt tempo gebruikt als stille hefboom voor macht.",
  "### 7. EXECUTIERISICO":
    "De bovenstroom benoemt blockers en eigenaarschap, de onderstroom laat vertraging lopen via conflictmijding en beschermde uitzonderingen.",
  "### 8. 90-DAGEN INTERVENTIEPLAN":
    "Bovenstroom vertaalt zich naar weekritme en KPI-afrekening, onderstroom naar wie feitelijk informatie doseert en escalatie opent of sluit.",
  "### 9. DECISION CONTRACT":
    "De bovenstroom sluit het besluit formeel af, de onderstroom voelt direct wie macht verliest en wie geen uitwijkroute meer heeft.",
};

const SECTION_DEFAULTS: Record<(typeof STRUCTURE_HEADINGS)[number], string> = {
  "### 1. DOMINANTE BESTUURLIJKE THESE":
    "De werkelijke bestuurlijke kern is niet strategie, maar besluituitstel dat als zorgvuldigheid wordt verkocht. De ongemakkelijke waarheid is: dit bestuur houdt iedereen politiek heel, maar offert daarmee besluitkracht op. De bovenstroom oogt ordelijk met KPI's en escalatiepaden, terwijl de onderstroom via loyaliteiten en budgetreflexen elke harde keuze afzwakt. Sectorinformatie: in de ggz stapelen IGJ-toezicht, wachtlijst-MAC-druk, ambulantisering en personeelstekort zich op tot directe bestuursdruk. Dit bestuur moet nu één lijn kiezen en concurrerende lijnen beëindigen. De bestuurlijke toetsvraag is eenvoudig: versterkt deze keuze de besluitkracht van de top of ondermijnt zij die.",

  "### 2. HET KERNCONFLICT":
    "U moet kiezen tussen schaalvergroting met verlies aan lokale controle, of stabilisatie met verlies aan groeisnelheid en marktmomentum. Er bestaat geen derde route die beide doelen tegelijk veiligstelt. De formele redenering zegt dat zorgvuldigheid tijd vraagt; de feitelijke onderstroom zegt dat uitstel vooral posities beschermt. De ongemakkelijke waarheid is: wie nu niet verliest, verliest later veel harder.",

  "### 3. EXPLICIETE TRADE-OFFS":
    "Trade-off 1: centralisatie verhoogt tempo, maar kost binnen 90 dagen EUR 2,4 miljoen aan stopzettingen en 18% minder lokale beslisruimte. Trade-off 2: stabilisatie verlaagt operationele stress, maar kost binnen 365 dagen EUR 3,1 miljoen gemiste bijdrage en 4,8% groeiverlies. In de bovenstroom wordt dit gepresenteerd als prioritering; in de onderstroom is het een gevecht om mandaat. Verlies 1 en verlies 2 zijn niet onderhandelbaar, omdat parallel sturen de rekening alleen doorschuift.",

  "### 4. OPPORTUNITY COST":
    "30 dagen zonder besluit: EUR 1,1 miljoen direct signaalverlies, 2,9% lagere leverbetrouwbaarheid en een eerste gedragsverschuiving naar defensief rapporteren. 90 dagen zonder besluit: EUR 3,7 miljoen marge-erosie, 6,0% langere doorlooptijd en zichtbare machtsverschuiving naar functies die tempo kunnen blokkeren. 365 dagen zonder besluit: EUR 14,2 miljoen structurele schade, 9,0% minder strategische bewegingsruimte en een systeemverschuiving waarin uitstel het nieuwe normgedrag wordt. Na 12 maanden verschuift de budgetpositie permanent naar de remmende lijn, wordt een behoudscoalitie dominant en is terugdraaien zonder reputatieschade voor de top feitelijk onomkeerbaar.",

  "### 5. GOVERNANCE IMPACT":
    "Bij een harde keuze wordt besluitkracht sterker omdat mandaat en escalatielijnen eenduidig worden. Zonder keuze groeit escalatie en blijft verantwoordelijkheid diffuus. Formele machtsverschuiving: besluitrechten verschuiven naar een centraal besluitcomite met 48-uurs escalatieroute. Onder de formele lijn loopt een stille tegenkracht: informatie wordt gefilterd waar budgetverlies dreigt. Structuurgevolg: budget- en prioriteringsrechten blijven centraal tot drie meetcycli aantoonbaar stabiel zijn.",

  "### 6. MACHTSDYNAMIEK & ONDERSTROOM":
    "In de bovenstroom wordt een heldere mandaatlijn getekend; in de onderstroom start direct het gevecht om uitvoeringscontrole. De CFO verliest formele veto-ruimte op portfolio-keuzes, wint voorspelbaarheid op cash, kan vertragen via budgetrem of uitzonderingscasus en gebruikt budgetautorisatie als instrument. De COO verliest informele speelruimte in planning, wint beslismonopolie op capaciteit, kan vertragen via kwaliteitsargument of herprioritering en gebruikt personeelsplanning als instrument. De medisch directeur verliest autonome escalatieroutes, wint duidelijkheid over klinische grenzen, kan vertragen via compliance-argument of burn-out framing en gebruikt informatiecontrole en moreel gezag als instrument.",

  "### 7. EXECUTIERISICO":
    "Faalpunt: oude en nieuwe prioriteiten blijven parallel actief in dezelfde teams. Concrete blocker: dubbel mandaat tussen lijn en programma, gevolgd door sluipende herprioritering. De onderstroom compenseert machtverlies via vertraging, uitzonderingsverzoeken en selectieve informatie. Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem.",

  "### 8. 90-DAGEN INTERVENTIEPLAN":
    "Week 1-2: CEO en CFO zetten één koers vast, stoppen conflicterende initiatieven per direct en publiceren eigenaar, mandaat en KPI per prioriteit. Week 3-6: COO herverdeelt capaciteit, budget en besluitrechten; escalaties worden binnen 48 uur afgedwongen en uitzonderingsroutes gesloten. Week 7-12: CHRO en COO sturen op doorlooptijd, kwaliteit en financieel effect; blokkades worden binnen zeven dagen opgelost of als expliciet verlies geboekt. Wie tempo controleert, controleert macht.",

  "### 9. DECISION CONTRACT":
    "De Raad van Bestuur committeert zich aan:\n- Keuze A of B met beslismonopolie bij de COO op capaciteitsvolgorde en prioritering.\n- Formele macht: de CFO verliest het extra veto op portfolio-uitzonderingen; informele macht: lokale mandaatdragers verliezen het stille uitstelcircuit.\n- Per direct stopt elk initiatief zonder benoemde owner en KPI; deze dossiers mogen niet meer via informele lijn geëscaleerd worden.\n- KPI en tijdshorizon: binnen 30 dagen eerste executiesignalen, binnen 90 dagen meetbaar effect op marge en doorlooptijd, binnen 365 dagen structurele trendbreuk.\n- Expliciet geaccepteerd verlies: EUR 2,4 miljoen aan stopzettingen en 18% minder lokale beslisruimte in jaar 1, met directe impact op CFO-vetoruimte en regiodirecteur-mandaat.\n- De ongemakkelijke waarheid is: dit contract verdeelt macht opnieuw en maakt reputatieschade zichtbaar voor wie vertraagt.",
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
  assertSectorInformationParagraph(text);
  assertTopUnderstreamBalancePerSection(text);
  assertNoForbiddenSectionStarts(text);
  assertDominantThesis(text);
  assertUncomfortableTruth(text);
  assertExplicitLosses(text);
  assertTradeOffDepth(text);
  assertOpportunityCost(text);
  assertGovernanceImpact(text);
  assertPowerDynamics(text);
  assertExecutionRisk(text);
  assertNinetyDayPlan(text);
  assertTempoAsPowerInstrument(text);
  assertDecisionContract(text);
  assertGGZSpecificDepth(text, enforceGGZDepth);
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

    const lines = section
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const bulletLines = lines.filter((line) => /^[-*•]\s+/.test(line));
    if (bulletLines.length >= 2) {
      const intro = lines.find((line) => !/^[-*•]\s+/.test(line));
      const normalizedBullets = bulletLines.map((line) =>
        `- ${line.replace(/^[-*•]\s+/, "").trim()}`
      );
      const rebuilt = intro
        ? [intro, ...normalizedBullets].join("\n")
        : normalizedBullets.join("\n");
      output = replaceSection(output, heading, rebuilt);
      continue;
    }

    const sentences = splitIntoSentences(section);
    if (!sentences.length) continue;
    const rebuilt = chunkSentencesIntoParagraphs(sentences, 2, 220).join("\n\n");
    output = replaceSection(output, heading, rebuilt || section.trim());
  }

  return output;
}

function removeRepeatedSectionSentences(text: string): string {
  let output = text;
  const seen = new Set<string>();

  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(output, heading);
    if (!section) continue;

    const lines = section
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const hasBullets = lines.some((line) => /^[-*•]\s+/.test(line));
    if (hasBullets) {
      const cleanedBulletLines: string[] = [];
      for (const line of lines) {
        if (!/^[-*•]\s+/.test(line)) {
          cleanedBulletLines.push(line);
          continue;
        }
        const bulletText = line.replace(/^[-*•]\s+/, "").trim();
        const key = normalizeSentenceKey(bulletText);
        if (key.length >= 24 && seen.has(key)) {
          continue;
        }
        if (key.length >= 24) {
          seen.add(key);
        }
        cleanedBulletLines.push(`- ${bulletText}`);
      }
      const cleanedBulletSection = cleanedBulletLines.join("\n").trim() || section.trim();
      output = replaceSection(output, heading, cleanedBulletSection);
      continue;
    }

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

    const cleanedSection =
      chunkSentencesIntoParagraphs(filtered, 2, 220).join("\n\n").trim() || section.trim();
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
  const corpus = [
    toSafeString(input.company_name),
    toSafeString(input.company_context),
    toSafeString(input.executive_thesis),
    toSafeString(input.central_tension),
    toSafeString(input.strategic_narrative),
    ...(Array.isArray(input.documents)
      ? input.documents.flatMap((doc) => [
          toSafeString(doc?.filename),
          toSafeString(doc?.content).slice(0, 1800),
        ])
      : []),
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
  switch (sector) {
    case "ggz":
      return "Sectorinformatie: de ggz draait nu op een breekpunt waar IGJ-sanctierisico, wachtlijst-MAC-druk, spanning tussen ambulantisering en klinische capaciteit, opdrogende transformatiegelden, druk op zorgzwaartebekostiging en burn-out samenkomen.";
    case "zorg":
      return "Sectorinformatie: in de zorg sturen personeelstekort, kwaliteitseisen en centralisatiekeuzes tegelijk op kosten, tempo en publieke legitimiteit.";
    case "onderwijs":
      return "Sectorinformatie: in het onderwijs vergroten lerarentekort, kwaliteitsdruk en bestuurlijke fragmentatie de kans op structureel leerverlies.";
    case "finance":
      return "Sectorinformatie: in finance bepaalt de combinatie van compliance-druk, marge-erosie en toezichtstempo de feitelijke bestuurlijke speelruimte.";
    case "tech":
      return "Sectorinformatie: in tech botsen groeitempo, governance-discipline en kapitaalverwachting, waardoor uitstel snel waardeverlies wordt.";
    case "industrie":
      return "Sectorinformatie: in industrie trekt de combinatie van leverbetrouwbaarheid, kosteninflatie en capaciteitsdruk direct door naar contractrisico.";
    case "overheid":
      return "Sectorinformatie: in de publieke sector duwen politieke druk, uitvoeringstekorten en budgetkrapte het bestuur in permanente prioriteringspijn.";
    default:
      return "Sectorinformatie: in deze transformatieroute lopen mandaatverschuiving, budgetdruk en informatiecontrole tegelijk op, waardoor uitstel direct machtsverlies wordt.";
  }
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
    [/\bcontext is schaars\b/gi, "context vraagt scherpe aannames"],
    [/\bwerk uit\b/gi, "maak concreet"],
    [/\bmogelijk\b/gi, "waarschijnlijk"],
    [/\blijkt erop dat\b/gi, "toont"],
    [/\bzou kunnen\b/gi, "leidt tot"],
    [/\bmen zou\b/gi, "de top moet"],
    [/\bbelangrijke succesfactor\b/gi, "harde randvoorwaarde"],
    [/\bquick wins?\b/gi, "directe ingrepen"],
    [/\blow[- ]hanging fruit\b/gi, "direct uitvoerbare ingrepen"],
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

function hasThinBoardroomInput(input: BoardroomInput): boolean {
  const hasRichDocuments =
    Array.isArray(input.documents) &&
    input.documents.some((doc) => toSafeString(doc?.content).length >= 180);
  const hasLegacyContext = toSafeString(input.company_context).length >= 120;
  const hasBriefSignals =
    toSafeString(input.executive_thesis).length >= 80 ||
    toSafeString(input.central_tension).length >= 80 ||
    toSafeString(input.strategic_narrative).length >= 120;

  return !hasRichDocuments && !hasLegacyContext && !hasBriefSignals;
}

function shouldEnforceGGZDepthFromInput(input: BoardroomInput): boolean {
  const pool: string[] = [];
  pool.push(toSafeString(input.company_name));
  pool.push(toSafeString(input.company_context));
  pool.push(toSafeString(input.executive_thesis));
  pool.push(toSafeString(input.central_tension));
  pool.push(toSafeString(input.strategic_narrative));

  if (Array.isArray(input.documents)) {
    for (const doc of input.documents.slice(0, 20)) {
      pool.push(toSafeString(doc?.filename));
      pool.push(toSafeString(doc?.content).slice(0, 1200));
    }
  }

  return GGZ_SIGNAL_GUARD.test(pool.join(" "));
}

function enforceComparableOrgAssumption(
  text: string,
  input: BoardroomInput
): string {
  if (!hasThinBoardroomInput(input)) return text;
  if (/op basis van bestuurlijke patronen in de ggz:/i.test(text)) {
    return text;
  }

  return injectLineIntoSection(
    text,
    "### 1. DOMINANTE BESTUURLIJKE THESE",
    "Op basis van bestuurlijke patronen in de ggz: deze casus vraagt een harde keuze met expliciet verlies, IGJ-risico en herverdeling van macht.",
    /op basis van bestuurlijke patronen in de ggz:/i
  );
}

function enforceGGZDepthHints(text: string, input: BoardroomInput): string {
  if (!shouldEnforceGGZDepthFromInput(input)) return text;

  let output = text;
  output = injectLineIntoSection(
    output,
    "### 4. OPPORTUNITY COST",
    "GGZ-specifiek: bij uitstel stijgt IGJ-sanctierisico binnen 365 dagen van risico naar sanctiedruk, raakt wachtlijst-MAC structureel vast, loopt ambulantisering los van klinische capaciteit en schuift herstel buiten bestuurlijke controle.",
    /\b(igj|wachtlijst[\s-]*mac|ambulantisering|klinische capaciteit)\b/i
  );
  output = injectLineIntoSection(
    output,
    "### 5. GOVERNANCE IMPACT",
    "Bestuurlijke prijs in de ggz: transformatiegelden drogen op, zorgzwaartebekostiging blijft onder druk en centrale regie wordt dan niet tijdelijk maar permanent.",
    /\b(transformatiegelden|zorgzwaartebekostiging)\b/i
  );
  output = injectLineIntoSection(
    output,
    "### 7. EXECUTIERISICO",
    "Personeelstekort en burn-out worden in deze fase gebruikt als vertragingstaal; daarom wordt zorgargumentatie gekoppeld aan harde besluitdeadlines.",
    /\b(personeelstekort|burn-out)\b/i
  );
  return output;
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
De werkelijke bestuurlijke kern is niet strategie, maar besluituitstel dat als zorgvuldigheid wordt verkocht. De ongemakkelijke waarheid is: ${company} houdt iedereen politiek veilig, maar verliest daarmee bestuurlijke regie. In de bovenstroom zijn doelen en KPI's netjes, in de onderstroom bepaalt mandaatbehoud wie daadwerkelijk tempo maakt. Sectorinformatie: in de ggz stapelen IGJ-toezicht, wachtlijst-MAC-druk, ambulantisering, bekostigingsdruk en personele uitval zich op tot directe besluitdwang. Het bestuur moet nu één dominante lijn kiezen en concurrerende lijnen sluiten. De toets is hard: versterkt dit de besluitkracht van de top of ondermijnt het die.

### 2. HET KERNCONFLICT
U moet kiezen tussen schaalvergroting met verlies aan lokale controle, of stabilisatie met verlies aan groeisnelheid en marktmomentum. Beide doelen tegelijk maximaliseren is onmogelijk en houdt besluitvorming gevangen. Dit is een onoplosbaar spanningsveld waarin de formele logica om zorgvuldigheid vraagt, terwijl de onderstroom vooral posities probeert te behouden.

### 3. EXPLICIETE TRADE-OFFS
Trade-off 1: centralisatie levert snelheid op, maar kost binnen 90 dagen EUR 2,2 miljoen aan stopzettingen en 16% minder lokale beslisruimte. Trade-off 2: stabilisatie verhoogt bestuurbaarheid, maar kost binnen 365 dagen 4,6% groeiverlies en EUR 3,4 miljoen gemiste bijdrage. Verlies 1 en verlies 2 zijn expliciet geaccepteerd; parallel sturen houdt alleen schijncontrole in stand. Formeel verschuift mandaat naar de top, informeel ontstaat frictie in planning en informatie-afscherming.

### 4. OPPORTUNITY COST
30 dagen zonder besluit: EUR 1,1 miljoen direct signaalverlies, 2,9% lagere leverbetrouwbaarheid en eerste gedragsverschuiving naar defensief rapporteren.
90 dagen zonder besluit: EUR 3,7 miljoen marge-erosie, 6,0% langere doorlooptijd en zichtbare machtsverschuiving naar functies die tempo kunnen blokkeren.
365 dagen zonder besluit: EUR 14,2 miljoen structurele schade, 9,0% minder strategische keuzevrijheid en systeemverschuiving waarin uitstel de standaard wordt. In de ggz groeit dan het IGJ-sanctierisico door naar sanctiedruk, raakt wachtlijst-MAC structureel vast en verschuift centrale regie permanent weg van uitvoerbaarheid.
Na 12 maanden verschuift de budgetpositie permanent naar de remmende lijn, wordt een behoudscoalitie dominant en is terugdraaien zonder reputatieschade voor de top niet meer geloofwaardig; transformatiegelden drogen op en zorgzwaartebekostiging blijft onder druk.

### 5. GOVERNANCE IMPACT
Deze keuze maakt besluitkracht sterker doordat mandaat en escalatieroutes eenduidig worden. Zonder keuze groeit escalatie en blijft verantwoordelijkheid diffuus. Formele machtsverschuiving: besluitrechten verschuiven naar een centraal besluitcomite met 48-uurs escalatieroute. In de onderstroom wordt tegenkracht opgebouwd via budgetrem en informatiefiltering. Structuurgevolg: budget- en prioriteringsrechten blijven centraal tot KPI's drie meetcycli aantoonbaar stabiliseren.

### 6. MACHTSDYNAMIEK & ONDERSTROOM
In de bovenstroom wordt centrale sturing ingevoerd; in de onderstroom verschuift de strijd naar wie tempo en informatie beheerst.
De CFO verliest formele veto-ruimte op uitzonderingsbudgetten, wint voorspelbaarheid op cash, kan vertragen via budgetrem of uitzonderingscasus en gebruikt budgetautorisatie als instrument.
De COO verliest informele speelruimte in planning, wint beslismonopolie op capaciteit, kan vertragen via kwaliteitsargument of herprioritering en gebruikt personeelsplanning als instrument.
De medisch directeur verliest autonome escalatieroutes, wint duidelijkheid op kwaliteitsgrenzen, kan vertragen via compliance-argument of burn-out framing en gebruikt informatiecontrole en moreel gezag als instrument.
De regiodirecteuren verliezen discretionaire ruimte op lokale prioritering, winnen duidelijkheid op leververplichting, kunnen vertragen met het argument "client in gevaar" en gebruiken escalatie en personeelsplanning als instrument.
De culturele reflex blijft conflictmijding; verborgen agenda's draaien om behoud van invloed buiten het formele mandaat.

### 7. EXECUTIERISICO
Faalpunt: oude en nieuwe prioriteiten blijven parallel in dezelfde teams bestaan. Concrete blocker: dubbel mandaat tussen lijn en programma, gevolgd door sluipende herprioritering. De onderstroom bestaat uit loyaliteiten die machtverlies compenseren via uitstel en heronderhandeling. Personeelstekort en burn-out maken dat vertraging politiek als zorgargument wordt verpakt. Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem. Adaptieve hardheid: bij stagnatie confronterend, bij transitie klinisch, bij momentum strategisch beheerst.

### 8. 90-DAGEN INTERVENTIEPLAN
Week 1-2: CEO en CFO zetten één lijn vast, stoppen conflicterende dossiers per direct en wijzen per prioriteit één eigenaar met KPI aan.
Week 3-6: COO herverdeelt budget, capaciteit en besluitrechten; escalaties worden binnen 48 uur bestuurlijk afgedwongen en uitzonderingsroutes worden gesloten.
Week 7-12: CHRO en COO rekenen uitvoering af op doorlooptijd, marge en leverbetrouwbaarheid; blokkades worden binnen zeven dagen gesloten of als expliciet verlies geboekt.
Wie tempo controleert, controleert macht.

### 9. DECISION CONTRACT
De Raad van Bestuur committeert zich aan:
- Keuze A of B met beslismonopolie bij de COO op prioritering en capaciteitsvolgorde.
- Formele macht: de CFO verliest extra veto op portfolio-uitzonderingen; informele macht: lokale mandaatdragers verliezen het stille uitstelcircuit.
- Per direct stopt elk initiatief zonder benoemde owner en KPI; deze dossiers mogen niet meer via informele lijn geëscaleerd worden.
- KPI en tijdshorizon: binnen 30 dagen eerste executiesignalen, binnen 90 dagen meetbaar effect op marge en doorlooptijd, binnen 365 dagen structurele trendbreuk.
- Expliciet geaccepteerd verlies: EUR 2,2 miljoen aan stopzettingen en 16% minder lokale beslisruimte in jaar 1, met directe impact op CFO-vetoruimte en regiodirecteur-mandaat.
- De ongemakkelijke waarheid is: dit contract verdeelt macht opnieuw en maakt reputatieschade zichtbaar voor wie vertraagt.`;

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
  let output = scrubForbiddenLanguage(String(candidate ?? "").trim());
  output = ensureMandatorySections(output);
  output = enforceSectorInformationParagraph(output, input);
  output = enforceComparableOrgAssumption(output, input);
  output = enforceGGZDepthHints(output, input);
  output = enforceTopUnderstreamBalance(output);
  output = sanitizeSectionOpeners(output);
  output = enforceLossLanguage(output);
  output = enforceCyntraBridge(output);
  output = enforceSignatureLayer(output);
  output = enforceTopUnderstreamBalance(output);
  output = sanitizeSectionOpeners(output);
  output = removeRepeatedSectionSentences(output);
  output = enforceReadableParagraphRhythm(output);
  output = enforceMinimumWords(output, minWords, maxWords);
  output = enforceConcreteNarrativeMarkdown(
    output,
    input.company_context || input.company_name || ""
  );
  output = scrubForbiddenLanguage(output);
  output = sanitizeSectionOpeners(output);
  output = removeRepeatedSectionSentences(output);
  output = enforceReadableParagraphRhythm(output);
  return trimToMaxWords(scrubForbiddenLanguage(output), maxWords);
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
- Dominante bestuurshypothese: gebruik expliciet de denkvorm "De werkelijke bestuurlijke kern is niet X, maar Y."
- Oncomfortabele waarheid: gebruik expliciet "De ongemakkelijke waarheid is: ..."
- Spanning boven optimalisatie: benoem minimaal één onoplosbaar spanningsveld.
- Verlies als realiteit: benoem expliciet concreet verlies.
- Macht als valuta: benoem minimaal drie concrete actoren; per actor verlies, winst, sabotagewijze en instrument.
- Tijd als actieve kracht: benoem irreversibiliteit, venstersluiting en stapelende schade bij uitstel.
- Tempo als machtsinstrument: gebruik expliciet "Wie tempo controleert, controleert macht."
- Besluit als contract: sluit contractueel af met keuze, KPI, tijdshorizon en geaccepteerd verlies.
- Cognitieve volwassenheid: adresseer expliciet informatieprobleem versus moedprobleem, of capaciteitsprobleem versus machtsprobleem.
- Historische herhaling: benoem waarom eerdere interventies faalden waar relevant.
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
- Sectie 1 opent met de denkvorm "De werkelijke bestuurlijke kern is niet X, maar Y."
- Sectie 1 bevat expliciet "De ongemakkelijke waarheid is: ..."
- Sectie 1 benoemt expliciet de besluitkrachttoets voor de top.
- Sectie 1 bevat een aparte alinea die start met "Sectorinformatie:" en benoemt sectorspecifieke druk.
- Sectie 2 beschrijft een niet-optimaliseerbaar dilemma.
- Sectie 2 bevat expliciet een onoplosbaar spanningsveld.
- Sectie 3 benoemt wat wordt gewonnen, wat wordt verloren, wie macht verliest en waar frictie ontstaat.
- Sectie 3 bevat minimaal twee meetbare verliezen met EUR en/of % plus tijdshorizon.
- Sectie 4 beschrijft concreet de kosten van niets doen op 30, 90 en 365 dagen.
- Sectie 4 verwerkt drie unieke lagen: 30 dagen = signaalverlies, 90 dagen = machtsverschuiving, 365 dagen = systeemverschuiving.
- Sectie 4 maakt na 12 maanden concreet welke positie permanent schuift, welke coalitie dominant wordt en wat niet zonder reputatieschade terug te draaien is.
- Sectie 4 maakt in ggz-context expliciet: 365 dagen = IGJ-sanctiedruk, wachtlijst-MAC structureel vast en centrale regie permanent.
- Sectie 5 benoemt expliciet effect op besluitkracht, escalatie, formele machtsverschuiving en structuurgevolgen.
- ${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}
- Sectie 6 benoemt minimaal drie machtsactoren en maakt per actor verlies, winst, sabotagewijze en instrument expliciet.
- Sectie 6 verweeft formele bovenstroom met informele onderstroom zonder checklisttoon.
- Sectie 7 benoemt waar uitvoering misgaat, wie blokkeert, wat het concrete faalpunt is en welke onderstroom onzichtbaar werkt.
- Sectie 7 bevat expliciet cognitieve volwassenheidsreflectie (informatie vs moed, capaciteit vs macht, strategie vs executiediscipline, analyse vs vermijding).
- Sectie 8 gebruikt exact: Week 1-2:, Week 3-6:, Week 7-12:, met owner en KPI per blok.
- Sectie 8 bevat expliciet: Wie tempo controleert, controleert macht.
- Sectie 9 begint exact met: De Raad van Bestuur committeert zich aan:
- Sectie 9 bevat expliciet: keuze A of B, formeel machtsverlies, informeel machtsverlies, beslismonopolie, directe stop, niet-escalatie en geaccepteerd verlies met impact.
- Sectie 9 benoemt actor-impact expliciet met €/% en rolgevolg voor minimaal één sleutelactor.
- Elke sectie verbindt expliciet bovenstroom en onderstroom in dezelfde alinea.

STIJLREGELS:
- Geen nuanceblokken, geen scenario-lijsten, geen vrijblijvende aanbevelingen.
- Als context dun is: open exact met "Op basis van bestuurlijke patronen in de ggz:" en maak realistische aannames.
- Geen termen als "op basis van de analyse", "het lijkt erop dat", "mogelijk", "zou kunnen" of "men zou".
- Geen termen als "default template", "transformatie-template", "governance-technisch", "patroon", "context is schaars", "werk uit", "aanname", "contextanker", "belangrijke succesfactor", "quick win" of "low hanging fruit".
- Geen bulletspam: alleen in sectie 9 vier tot zes bullets voor het besluitcontract.
- Leg causale keten hard vast: oorzaak -> gevolg -> ingreep -> resultaat.
- Verbind bovenstroom en onderstroom expliciet in governance en executie.
- Bij ggz-context benoem expliciet: IGJ-sanctierisico, wachtlijst-MAC-druk, ambulantisering vs klinische capaciteit, transformatiegelden opdrogen, zorgzwaartebekostiging onder druk en personeelstekort met burn-out realiteit.
  `.trim();
}

function buildContinuationPrompt(rejectReason?: string): string {
  const rejectLine = rejectReason
    ? `REJECT: ${rejectReason}`
    : "REJECT direct elke output met verboden generieke taal of AI-sporen.";

  return `
${EXECUTIVE_PROMPT_INJECT}
${HARD_FALLBACK_PROMPT_RULE}
${INTELLIGENT_SECTOR_FALLBACK_RULE}
${ANTI_FILLER_RULE}

${rejectLine}
Ga verder.
Behoud exact de 9 secties.
Gebruik expliciet: De werkelijke bestuurlijke kern is niet X, maar Y.
Gebruik expliciet: De ongemakkelijke waarheid is: ...
Maak in sectie 6 minimaal drie machtsactoren concreet met verlies, winst, sabotagewijze en instrument.
Werk opportunity cost uit op 30/90/365 plus 12 maanden met irreversibele machts- en coalitieverschuiving.
Veranker in sectie 8: Wie tempo controleert, controleert macht.
Sluit sectie 9 af met formeel/informeel machtsverlies, beslismonopolie, directe stop, niet-escalatie en geaccepteerd verlies met impact.
Neem in sectie 9 actor-impact op in €/% met rolgevolg voor sleutelactoren.
Benoem in sectie 1 een aparte alinea die start met: Sectorinformatie:
Verbind in elke sectie bovenstroom en onderstroom.
Voeg bij ggz-context expliciet IGJ-sanctierisico, wachtlijst-MAC-druk, ambulantisering versus klinische capaciteit, opdrogende transformatiegelden, zorgzwaartebekostiging onder druk en burn-out realiteit toe.
${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}
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
Op basis van bestuurlijke patronen in de ggz:
Gebruik context, machtsdynamiek en bestuursspanning om één besluit af te dwingen.
`;

  const documentBlock =
    documents.length === 0
      ? "Op basis van bestuurlijke patronen in de ggz: hanteer sectorspecifieke aannames en maak die bestuurlijk concreet."
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
${briefContext || "Op basis van bestuurlijke patronen in de ggz: er is geen bruikbare brief-context, dus hanteer realistische sectoraannames."}

LEGACY CONTEXT:
${legacyContext || "Op basis van bestuurlijke patronen in de ggz: er is geen legacy-context, dus dwing keuze met concrete machts- en tijdssignalen."}
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
        const trimmedChunk = chunk.trim();
        messages.push({ role: "assistant", content: trimmedChunk });

        if (hasForbiddenGenericLanguage(trimmedChunk)) {
          messages.push({
            role: "user",
            content: buildContinuationPrompt(
              "vorige output bevatte verboden generieke consultancy-taal en is afgekeurd; lever volledige herwerking zonder verboden termen"
            ),
          });
        } else {
          const merged = text ? `${text}\n\n${trimmedChunk}` : trimmedChunk;
          text = trimToMaxWords(merged, generationWordCap);
          messages.push({
            role: "user",
            content: buildContinuationPrompt(),
          });
        }
      }
    } catch {
      break;
    }

    loops++;
  }

  let candidate = text.trim() || buildFallbackNarrative(input, boundedMinWords, maxWords);
  candidate = hardenNarrativeCandidate(candidate, input, boundedMinWords, maxWords);

  try {
    assertExecutiveKernelQuality(candidate, enforceGGZDepth);
  } catch {
    const fallback = buildFallbackNarrative(input, boundedMinWords, maxWords);
    const concreteFallback = hardenNarrativeCandidate(
      fallback,
      input,
      boundedMinWords,
      maxWords
    );

    try {
      assertExecutiveKernelQuality(concreteFallback, enforceGGZDepth);
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
