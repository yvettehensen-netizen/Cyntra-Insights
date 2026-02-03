// ============================================================
// src/cie/aureliusSynthesis.ts
// CYNTRA / AURELIUS SYNTHESIS — UPGRADE-ONLY • ADD ONLY • NO DOWNGRADES
// UPGRADE: PORTER • PESTEL • MCKINSEY 7S • GROW • VIBAAN • HGBCO DEBRIEF
// ============================================================

export interface AnalysisResult {
  executive_summary: string;
  insights: string[];
  risks: string[];
  opportunities: string[];
  roadmap_90d: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
  ceo_message?: string;
  confidence_score?: number;

  /* ============================================================
     ✅ ADDITION — CYNTRA SPANNINGSKAART (NON-NORMATIVE)
     - Pure descriptie
     - Geen aanbeveling
     - Audit-safe
  ============================================================ */
  tension_map?: TensionSignal[];

  /* ============================================================
     ✅ ADDITION — FRAMEWORK SIGNALS (NON-NORMATIVE)
     - Porter / PESTEL / McKinsey 7S / GROW
     - Structure only
  ============================================================ */
  framework_signals?: FrameworkSignals;

  /* ============================================================
     ✅ ADDITION — VIBAAN (NON-NORMATIVE DEBRIEF)
     - Descriptie van drivers/blokkades zonder advies
  ============================================================ */
  vibaan_debrief?: VibaanDebrief;

  /* ============================================================
     ✅ ADDITION — HGBCO (DECISION DEBRIEF)
     - Boardroom debrief format
     - Output contains ONLY structured fields
  ============================================================ */
  hgbco_debrief?: HGBCODebrief;
}

/* ============================================================
   ✅ ADDITION — TENSION SIGNAL TYPE (CANONICAL)
============================================================ */

export type TensionSignal = {
  label: string;
  polarity: "structural" | "cultural" | "governance" | "execution";
  evidence: string[];
  recurrence_hint: "single" | "emerging" | "persistent";
};

/* ============================================================
   ✅ ADDITION — FRAMEWORK SIGNAL TYPES (CANONICAL)
============================================================ */

export type PorterForces = {
  rivalry?: string[];
  threat_of_new_entrants?: string[];
  bargaining_power_of_buyers?: string[];
  bargaining_power_of_suppliers?: string[];
  threat_of_substitutes?: string[];
};

export type PestelSignals = {
  political?: string[];
  economic?: string[];
  social?: string[];
  technological?: string[];
  environmental?: string[];
  legal?: string[];
};

export type McKinsey7S = {
  strategy?: string[];
  structure?: string[];
  systems?: string[];
  shared_values?: string[];
  style?: string[];
  staff?: string[];
  skills?: string[];
};

export type GrowSignals = {
  goal?: string[];
  reality?: string[];
  options?: string[];
  will?: string[];
};

export type FrameworkSignals = {
  porter?: PorterForces;
  pestel?: PestelSignals;
  mckinsey_7s?: McKinsey7S;
  grow?: GrowSignals;
};

/* ============================================================
   ✅ ADDITION — VIBAAN DEBRIEF (CANONICAL)
============================================================ */

export type VibaanDebrief = {
  value_case?: string[];
  inhibitors?: string[];
  blockers?: string[];
  authority?: string[];
  adoption?: string[];
  next_90_days?: string[];
};

/* ============================================================
   ✅ ADDITION — HGBCO DEBRIEF (CANONICAL)
============================================================ */

export type HGBCODebrief = {
  H: {
    objective_reality: string[];
    structural_pressures: string[];
    internal_misalignment: string[];
  };
  G: string[];
  B: string[];
  C: {
    do: string[];
    stop: string[];
  };
  O: {
    owner_lock: string[];
    first_90_days: string[];
    understream: string[];
    review_moment: string[];
  };
};

/* ============================================================================
   🔥 CORE SYNTHESIS ENGINE — ECHO-PROOF & BOARDROOM-GRADE
============================================================================ */

/**
 * Lichte parafrasering om echo’s te breken
 */
function paraphrase(text: string): string {
  return text
    .replace(/\bwij\b/gi, "de organisatie")
    .replace(/\bmoet\b/gi, "dient te")
    .replace(/\bkan\b/gi, "heeft de mogelijkheid om")
    .replace(/\brisico\b/gi, "kwetsbaarheid")
    .replace(/\bkans\b/gi, "strategisch potentieel")
    .replace(/\bteam\b/gi, "organisatie")
    .replace(/\bgroei\b/gi, "expansie");
}

/**
 * Extracteert sterke zinnen zonder input-echo
 */
function extractSentences(text: string): string[] {
  return text
    .split(/[\n\.]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && !s.toLowerCase().includes("input"));
}

/**
 * Deduplicatie op semantisch niveau (simpel maar effectief)
 */
function unique(items: string[]): string[] {
  return items.filter(
    (item, idx, arr) =>
      arr.findIndex((i) => i.slice(0, 40) === item.slice(0, 40)) === idx
  );
}

/* ============================================================
   ✅ ADDITION — TENSION EXTRACTOR (STRUCTURE ONLY)
   - Geen advies
   - Alleen spanningsdetectie
   - Non-normatief
============================================================ */

function extractTensions(best: string[], critique: string[]): TensionSignal[] {
  const candidates = unique([...best, ...critique]);

  const tensionSignals: TensionSignal[] = [];

  for (const sentence of candidates) {
    if (/spanning|botsing|conflict|vermijden|druk/i.test(sentence)) {
      tensionSignals.push({
        label: sentence.slice(0, 72) + "...",
        polarity: "structural",
        evidence: [sentence],
        recurrence_hint: "emerging",
      });
    }

    if (/besluit|governance|mandaat|verantwoord/i.test(sentence)) {
      tensionSignals.push({
        label: sentence.slice(0, 72) + "...",
        polarity: "governance",
        evidence: [sentence],
        recurrence_hint: "persistent",
      });
    }

    if (/cultuur|onderstroom|niet gezegd|vertrouwen/i.test(sentence)) {
      tensionSignals.push({
        label: sentence.slice(0, 72) + "...",
        polarity: "cultural",
        evidence: [sentence],
        recurrence_hint: "emerging",
      });
    }

    if (/executie|vastloopt|vertraging|traag|implementatie/i.test(sentence)) {
      tensionSignals.push({
        label: sentence.slice(0, 72) + "...",
        polarity: "execution",
        evidence: [sentence],
        recurrence_hint: "persistent",
      });
    }
  }

  return tensionSignals.slice(0, 5);
}

/* ============================================================
   ✅ ADDITION — FRAMEWORK SIGNAL EXTRACTION (NON-NORMATIVE)
   - Does NOT advise
   - Only groups detected sentences
============================================================ */

function pick(sentences: string[], re: RegExp, max = 4): string[] {
  return unique(sentences.filter((s) => re.test(s)).map(paraphrase)).slice(0, max);
}

function extractFrameworkSignals(
  bestSentences: string[],
  critiqueSentences: string[]
): FrameworkSignals {
  const all = unique([...bestSentences, ...critiqueSentences]);

  const porter: PorterForces = {
    rivalry: pick(all, /concurrent|rival|prijsdruk|commodit|differentiat/i, 4),
    threat_of_new_entrants: pick(all, /toetred|entry|nieuwe speler|barri[eè]re/i, 4),
    bargaining_power_of_buyers: pick(all, /klantmacht|buyer|inkoop|onderhandel/i, 4),
    bargaining_power_of_suppliers: pick(all, /leverancier|supplier|afhankelijk|schaarste/i, 4),
    threat_of_substitutes: pick(all, /substitu|alternatief|vervang/i, 4),
  };

  const pestel: PestelSignals = {
    political: pick(all, /politiek|beleid|subsid|overheid|publiek/i, 4),
    economic: pick(all, /econom|inflatie|kosten|marge|rente|budget/i, 4),
    social: pick(all, /sociaal|arbeidsmarkt|gedrag|vertrouwen|reputatie|klantverwach/i, 4),
    technological: pick(all, /tech|technolog|ai|data|platform|automatis/i, 4),
    environmental: pick(all, /duurzaam|co2|energie|milieu|esg/i, 4),
    legal: pick(all, /wet|jurid|compliance|privacy|avg|contract/i, 4),
  };

  const mckinsey_7s: McKinsey7S = {
    strategy: pick(all, /strategie|positioner|keuze|trade-?off|focus/i, 4),
    structure: pick(all, /structuur|organi(s|z)atie|rapportagelijn|rollen/i, 4),
    systems: pick(all, /proces|systemen|ritme|kpi|governance|cadans/i, 4),
    shared_values: pick(all, /waarden|purpose|missie|principes|normen/i, 4),
    style: pick(all, /leiderschap|stijl|gedrag|voorbeeld|tone at the top/i, 4),
    staff: pick(all, /talent|bezetting|capaciteit|fte|werving|retentie/i, 4),
    skills: pick(all, /skills|competentie|capabilit|kennis|vermogen/i, 4),
  };

  const grow: GrowSignals = {
    goal: pick(all, /doel|ambitie|target|north star|objective/i, 4),
    reality: pick(all, /huidig|realiteit|feit|constraint|beperking|druk/i, 4),
    options: pick(all, /optie|scenario|alternatief|keuze|richting/i, 4),
    will: pick(all, /commit|mandaat|besluit|owner|deadline|onombaar|irrevers/i, 4),
  };

  const pruneEmpty = <T extends Record<string, any>>(obj: T): T | undefined => {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v) && v.length) out[k] = v;
    }
    return Object.keys(out).length ? (out as T) : undefined;
  };

  return {
    porter: pruneEmpty(porter),
    pestel: pruneEmpty(pestel),
    mckinsey_7s: pruneEmpty(mckinsey_7s),
    grow: pruneEmpty(grow),
  };
}

/* ============================================================
   ✅ ADDITION — VIBAAN DEBRIEF BUILDER (NON-NORMATIVE)
============================================================ */

function buildVibaanDebrief(
  insights: string[],
  risks: string[],
  opportunities: string[],
  tension_map: TensionSignal[]
): VibaanDebrief {
  const inhibitors = unique(
    risks.filter((r) => /afhankelijk|vertraging|weerstand|kwetsbaarheid|frictie/i.test(r))
  ).slice(0, 5);

  const blockers = unique(
    tension_map
      .filter((t) => t.polarity === "governance" || t.polarity === "execution")
      .flatMap((t) => t.evidence)
      .map(paraphrase)
  ).slice(0, 5);

  const authority = unique(
    [...insights, ...risks]
      .filter((s) => /mandaat|owner|verantwoord|bestuur|rvb|directie/i.test(s))
      .map(paraphrase)
  ).slice(0, 5);

  const adoption = unique(
    [...insights, ...risks]
      .filter((s) => /adopt|draagvlak|cultuur|vertrouwen|onderstroom/i.test(s))
      .map(paraphrase)
  ).slice(0, 5);

  const value_case = unique(
    [...opportunities, ...insights]
      .filter((s) => /waarde|marge|groei|expansie|pricing|impact|roi/i.test(s))
      .map(paraphrase)
  ).slice(0, 6);

  const next_90_days = unique(
    [...insights, ...opportunities].map((x) => `Closure: ${x}`)
  ).slice(0, 6);

  return {
    value_case,
    inhibitors,
    blockers,
    authority,
    adoption,
    next_90_days,
  };
}

/* ============================================================
   ✅ ADDITION — HGBCO DEBRIEF BUILDER (STRUCTURED)
============================================================ */

function buildHGBCODebrief(
  executive_summary: string,
  insights: string[],
  risks: string[],
  opportunities: string[],
  tension_map: TensionSignal[],
  roadmap_90d: AnalysisResult["roadmap_90d"]
): HGBCODebrief {
  const objective_reality = unique([
    executive_summary,
    ...risks.map((r) => `Kwetsbaarheid: ${r}`),
  ])
    .map(paraphrase)
    .slice(0, 6);

  const structural_pressures = unique(
    tension_map
      .filter((t) => t.polarity === "structural")
      .flatMap((t) => t.evidence)
      .map(paraphrase)
  ).slice(0, 6);

  const internal_misalignment = unique(
    tension_map
      .filter((t) => t.polarity === "cultural" || t.polarity === "execution" || t.polarity === "governance")
      .flatMap((t) => t.evidence)
      .map(paraphrase)
  ).slice(0, 6);

  const G = unique(
    insights
      .filter((s) => /keuze|focus|richting|position|trade-?off|mandaat/i.test(s))
      .map(paraphrase)
  ).slice(0, 5);

  const B = unique(
    tension_map
      .filter((t) => t.polarity === "governance" || t.polarity === "execution")
      .map((t) => paraphrase(t.label.replace(/\.\.\.$/, "")))
  ).slice(0, 6);

  const doList = unique(
    [...opportunities, ...insights]
      .slice(0, 8)
      .map((x) => paraphrase(x))
  ).slice(0, 6);

  const stopList = unique(
    risks
      .filter((r) => /diffuus|te veel|versnipper|uitstel|herhaling|politiek/i.test(r))
      .map(paraphrase)
  ).slice(0, 6);

  const owner_lock = unique(
    ["Directie (owner verplicht)", "RvB (deadline lock)", "MT-voorzitter (closure ritme)"].map(paraphrase)
  ).slice(0, 3);

  const first_90_days = unique([
    ...roadmap_90d.month1,
    ...roadmap_90d.month2,
    ...roadmap_90d.month3,
  ])
    .map(paraphrase)
    .slice(0, 12);

  const understream = unique(
    tension_map
      .filter((t) => t.polarity === "cultural")
      .flatMap((t) => t.evidence)
      .map((e) => `Onderstroom: ${paraphrase(e)}`)
  ).slice(0, 6);

  const review_moment = unique(
    ["Review: maand 1 afsluiten binnen 30 dagen", "Review: maand 2 besluitlock binnen 60 dagen", "Review: maand 3 onomkeerbaarheid binnen 90 dagen"]
  );

  return {
    H: {
      objective_reality,
      structural_pressures,
      internal_misalignment,
    },
    G,
    B,
    C: {
      do: doList,
      stop: stopList.length ? stopList : ["Stop: besluitverdamping", "Stop: parallelle prioriteiten", "Stop: eigenaar-loos werk"].map(paraphrase),
    },
    O: {
      owner_lock,
      first_90_days,
      understream,
      review_moment,
    },
  };
}

/**
 * Hoofdsynthese
 */
export function synthesizeFinalReport(
  best: string,
  critique: string
): AnalysisResult {
  const bestSentences = extractSentences(best);
  const critiqueSentences = extractSentences(critique);

  /* ================= EXECUTIVE SUMMARY ================= */

  const executive_summary = paraphrase(
    [
      bestSentences[0],
      critiqueSentences[0],
      "Besluitvorming en prioritering bepalen het verschil tussen stagnatie en schaalbare expansie.",
    ]
      .filter(Boolean)
      .join(". ")
  ).slice(0, 900);

  /* ================= INSIGHTS ================= */

  const insights = unique(
    bestSentences
      .filter((s) => /sterk|positie|potentieel|voordeel/i.test(s))
      .map(paraphrase)
  ).slice(0, 6);

  /* ================= RISKS ================= */

  const risks = unique(
    critiqueSentences
      .filter((s) => /risico|kwetsbaar|afhankelijk|vertraging|weerstand/i.test(s))
      .map(paraphrase)
  ).slice(0, 6);

  /* ================= OPPORTUNITIES ================= */

  const opportunities = unique(
    [...bestSentences, ...critiqueSentences]
      .filter((s) => /kans|mogelijk|doorbraak|optimal/i.test(s))
      .map(paraphrase)
      .filter((o) => !risks.some((r) => r.slice(0, 30) === o.slice(0, 30)))
  ).slice(0, 6);

  /* ================= 90-DAY ROADMAP ================= */

  const actions = unique([...insights, ...opportunities]).map(
    (a) => `Implementeer: ${a}`
  );

  const roadmap_90d = {
    month1: actions.slice(0, 3).length
      ? actions.slice(0, 3)
      : [
          "Definieer prioriteiten",
          "Bevestig mandaat",
          "Stop niet-essentiële initiatieven",
        ],

    month2: actions.slice(3, 6).length
      ? actions.slice(3, 6)
      : ["Start executie kernkeuzes", "Meet voortgang", "Heralloceer middelen"],

    month3: actions.slice(6, 9).length
      ? actions.slice(6, 9)
      : ["Borg succesvolle patronen", "Corrigeer afwijkingen", "Bereid volgende fase voor"],
  };

  /* ================= CONFIDENCE SCORE ================= */

  const confidence_score = Math.min(
    0.95,
    0.7 + (insights.length + opportunities.length) * 0.03 - risks.length * 0.02
  );

  /* ================= CEO MESSAGE ================= */

  const ceo_message = paraphrase(
    "Deze synthese combineert scherpe analyse met executiekracht. De komende 90 dagen bepalen structureel of strategische intentie daadwerkelijk wordt omgezet in waarde."
  );

  /* ============================================================
     ✅ ADDITION — TENSION MAP BUILD (NO ADVICE)
  ============================================================ */

  const tension_map = extractTensions(bestSentences, critiqueSentences);

  /* ============================================================
     ✅ ADDITION — FRAMEWORK SIGNALS (PORTER/PESTEL/7S/GROW)
  ============================================================ */

  const framework_signals = extractFrameworkSignals(
    bestSentences,
    critiqueSentences
  );

  /* ============================================================
     ✅ ADDITION — VIBAAN (NON-NORMATIVE)
  ============================================================ */

  const vibaan_debrief = buildVibaanDebrief(
    insights,
    risks,
    opportunities,
    tension_map
  );

  /* ============================================================
     ✅ ADDITION — HGBCO (STRUCTURED DEBRIEF)
  ============================================================ */

  const hgbco_debrief = buildHGBCODebrief(
    executive_summary,
    insights,
    risks,
    opportunities,
    tension_map,
    roadmap_90d
  );

  return {
    executive_summary,
    insights,
    risks,
    opportunities,
    roadmap_90d,
    ceo_message,
    confidence_score: Math.round(confidence_score * 100) / 100,

    /* ✅ ADDITION — Spanningskaart output */
    tension_map,

    /* ✅ ADDITION — Framework signals */
    framework_signals,

    /* ✅ ADDITION — VIBAAN debrief */
    vibaan_debrief,

    /* ✅ ADDITION — HGBCO debrief */
    hgbco_debrief,
  };
}
