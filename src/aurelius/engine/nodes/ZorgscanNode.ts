// ============================================================
// AURELIUS — ZORGSCAN BESLUITVORMING NODE (HGBCO CANON 2026)
// Purpose:
// - Zorg-specifieke besluitvorming (RvB / Directie / MT)
// - Governance × patiëntveiligheid × continuïteit
// - Verbeteren van besluitkwaliteit, snelheid en eigenaarschap
// - Volledig HGBCO-gedreven (GEEN rapport, WEL besluitinput)
// - UPGRADE-ONLY — GEEN DOWNGRADES
// ============================================================

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

/* ============================================================
   NODE CONTRACT
============================================================ */

export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;
  analyze(context: AnalysisContext): Promise<ModelResult>;
}

/* ============================================================
   CONTEXT EXTRACTIE (ZORG & BESLUITVORMING)
============================================================ */

function extractText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.governance,
    context.userContext?.decisionMaking,
    context.userContext?.continuity,
    context.userContext?.patientSafety,
    context.userContext?.capacity,
    context.userContext?.finance,
    context.userContext?.regulation,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p.toLowerCase();
  }
  return "";
}

/* ============================================================
   ZORG BESLUITVORMING SIGNALEN (2026)
============================================================ */

interface ZorgDecisionSignal {
  keywords: string[];
  blocker: string;
  closure: string;
  risk: string;
  decision_domain:
    | "capacity"
    | "governance"
    | "finance"
    | "quality_safety"
    | "regulation"
    | "continuity";
  weight: number;
}

const ZORG_DECISION_SIGNALS_2026: ZorgDecisionSignal[] = [
  {
    keywords: ["personeelstekort", "onderbezet", "vacature", "uitval"],
    blocker:
      "Besluitvorming over capaciteit is reactief en versnipperd.",
    closure:
      "Stel bestuurlijke capaciteitsnormen vast per afdeling met expliciet stop-/schaalbesluit.",
    risk:
      "Structurele onderbezetting leidt tot kwaliteits- en veiligheidsincidenten.",
    decision_domain: "capacity",
    weight: 5,
  },
  {
    keywords: ["inspectie", "igj", "toezicht", "handhaving"],
    blocker:
      "Toezicht stuurt impliciet besluiten door angst en onzekerheid.",
    closure:
      "Wijs één IGJ-besluiteigenaar aan met mandaat voor afstemming en escalatie.",
    risk:
      "Vertraagde of inconsistente opvolging vergroot handhavingsrisico.",
    decision_domain: "regulation",
    weight: 4.8,
  },
  {
    keywords: ["verzekeraar", "financiering", "tarief", "contract"],
    blocker:
      "Financiële besluitvorming wordt extern gedicteerd i.p.v. strategisch gestuurd.",
    closure:
      "Maak expliciete zorg- en financieringskeuzes met scenario’s per contractvorm.",
    risk:
      "Liquiditeitsdruk en zorgafschaling bij externe wijzigingen.",
    decision_domain: "finance",
    weight: 4.6,
  },
  {
    keywords: ["kwaliteit", "veiligheid", "incident", "calamiteit"],
    blocker:
      "Besluiten over patiëntveiligheid zijn te vaak incident-gedreven.",
    closure:
      "Installeer vaste besluitmomenten voor structurele kwaliteits- en veiligheidsrisico’s.",
    risk:
      "Herhaling van vermijdbare incidenten schaadt patiënten en organisatie.",
    decision_domain: "quality_safety",
    weight: 5,
  },
  {
    keywords: ["ad hoc", "brandjes", "crisis", "spoed"],
    blocker:
      "Crisisgedreven besluitvorming verdringt structurele keuzes.",
    closure:
      "Introduceer expliciet onderscheid tussen crisisbesluit en structureel besluit.",
    risk:
      "Bestuurlijke uitputting en strategische drift.",
    decision_domain: "governance",
    weight: 4.7,
  },
];

/* ============================================================
   ZORGSCAN NODE — BESLUITVORMING (HGBCO CANON)
============================================================ */

export const ZorgscanNode: ExpertNode = {
  name: "Zorgscan — Besluitvorming, Governance & Continuïteit",
  confidence: 0.93, // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const text = extractText(context);

    const blockers: string[] = [];
    const closures: string[] = [];
    const risks: string[] = [];

    let decisionLoad = 0;
    const domains = new Set<string>();

    /* --------------------------------------------------------
       SIGNAL ANALYSE
    --------------------------------------------------------- */

    if (text) {
      for (const signal of ZORG_DECISION_SIGNALS_2026) {
        if (signal.keywords.some(k => text.includes(k))) {
          blockers.push(signal.blocker);
          closures.push(signal.closure);
          risks.push(signal.risk);
          decisionLoad += signal.weight;
          domains.add(signal.decision_domain);
        }
      }
    }

    /* --------------------------------------------------------
       DEFAULT (GEEN INPUT = HEFBOOM)
    --------------------------------------------------------- */

    if (blockers.length === 0) {
      blockers.push(
        "Besluitvorming in de zorg is impliciet en persoonsafhankelijk georganiseerd."
      );
      closures.push(
        "Organiseer een expliciete bestuurlijke zorgscan gericht op besluitstructuur, mandaat en escalatie."
      );
    }

    /* --------------------------------------------------------
       HGBCO CANON OUTPUT
    --------------------------------------------------------- */

    const content = {
      hgbco: {
        H: "Zorgorganisatie opereert onder structurele druk met hoge besluitbelasting.",
        G: "Voorspelbare, veilige zorg met heldere besluitstructuur en eigenaarschap.",
        B: blockers,
        C: closures,
        O: "Continuïteit van zorg, patiëntveiligheid en bestuurlijke rust.",
      },

      decision_interventions: closures.map((c, i) => ({
        priority: i + 1,
        decision: c,
        rationale:
          "Verbetering van besluitkwaliteit is randvoorwaarde voor veilige en continue zorg.",
        owner: "Raad van Bestuur / Directie",
        decision_type: "structureel",
        deliverable: "Bestuurlijk besluit + mandaat + implementatieafspraak",
      })),

      decision_risks: risks,

      decision_metadata: {
        decision_load_score: decisionLoad,
        affected_domains: Array.from(domains),
        decision_posture_2026:
          decisionLoad >= 12
            ? "overloaded"
            : decisionLoad >= 7
            ? "fragile"
            : "manageable",
      },
    };

    /* --------------------------------------------------------
       RETURN MODEL RESULT (FIX: model toegevoegd)
    --------------------------------------------------------- */

    return {
      model: "ZorgscanBesluitvorming",
      section: "zorgscan_besluitvorming",
      content,
      confidence: this.confidence,
    };
  },
};
