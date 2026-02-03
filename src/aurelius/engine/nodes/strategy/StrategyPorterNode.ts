// ============================================================
// src/aurelius/engine/nodes/strategy/StrategyPorterNode.ts
// AURELIUS — PORTER FIVE FORCES (CANON • BOARDROOM SAFE)
// ============================================================

import type {
  AnalysisContext,
  ModelResult,
} from "../../../engine/types";
import type { ExpertNode } from "../ExpertNode";

/* =========================
   CONTEXT EXTRACTION
========================= */
function extractText(context: AnalysisContext): string {
  return [
    context.rawText ?? "",
    ...(context.documents ?? []),
    context.userContext?.strategy ?? "",
    context.userContext?.market ?? "",
    context.userContext?.choices ?? "",
    context.userContext?.vision ?? "",
    context.userContext?.ambition ?? "",
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .join(" ")
    .toLowerCase();
}

/* =========================
   STRATEGY PORTER NODE
========================= */
export class StrategyPorterNode implements ExpertNode {
  readonly name = "Porter Five Forces";
  readonly confidence = 0.94;

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const text = extractText(context);

    /* =========================
       FORCE DETECTION
    ========================= */
    const hasEntrants = [
      "toetredingsbarrière",
      "entry barrier",
      "schaalvoordeel",
      "kapitaalvereiste",
    ].some(k => text.includes(k));

    const hasBuyers = [
      "kopersmacht",
      "buyer power",
      "prijsdruk",
      "onderhandelingsmacht",
    ].some(k => text.includes(k));

    const hasSuppliers = [
      "leveranciersmacht",
      "supplier power",
      "input schaarste",
    ].some(k => text.includes(k));

    const hasSubstitutes = [
      "substituut",
      "alternatief",
      "switching cost",
    ].some(k => text.includes(k));

    const hasRivalry = [
      "concurrentie",
      "rivaliteit",
      "prijsconcurrentie",
    ].some(k => text.includes(k));

    const forcesDetected = [
      hasEntrants,
      hasBuyers,
      hasSuppliers,
      hasSubstitutes,
      hasRivalry,
    ].filter(Boolean).length;

    /* =========================
       INSIGHTS
    ========================= */
    const insights: string[] = [
      "Concurrentiekracht wordt primair bepaald door structurele marktfactoren, niet door intentie.",
      hasEntrants &&
        "Hoge toetredingsbarrières beschermen bestaande spelers tegen nieuwe concurrenten.",
      hasBuyers &&
        "Sterke kopersmacht zet structurele druk op marges.",
      hasSuppliers &&
        "Leveranciersmacht beïnvloedt kostenstructuur en flexibiliteit.",
      hasSubstitutes &&
        "Substituten beperken differentiatie en prijszettingsvermogen.",
      hasRivalry &&
        "Intensieve rivaliteit dwingt tot continue innovatie en kostenbeheersing.",
    ].filter(Boolean) as string[];

    /* =========================
       STRENGTHS / RISKS / OPPORTUNITIES
    ========================= */
    const strengths: string[] = [
      hasEntrants && "Toetredingsbarrières beschermen strategische positie.",
      hasSuppliers && "Beperkte leveranciersmacht vergroot onderhandelingsruimte.",
    ].filter(Boolean) as string[];

    const risks: string[] = [
      hasBuyers && "Kopersmacht beperkt pricing power en winstgevendheid.",
      hasSubstitutes && "Substituten vormen structurele bedreiging voor kernpropositie.",
      hasRivalry && "Concurrentiële intensiteit verhoogt executiedruk.",
    ].filter(Boolean) as string[];

    const opportunities: string[] = [
      "Differentiatie via unieke waardepropositie en ecosystemen.",
      "Verhoging van switching costs om klantloyaliteit te versterken.",
      "Herpositionering kan rivalry neutraliseren.",
    ];

    /* =========================
       SCORING
    ========================= */
    const score = Math.min(100, 45 + forcesDetected * 10);
    const urgency = score < 70 ? "Hoog" : "Middel";

    /* =========================
       FINAL — ENGINE CANON
    ========================= */
    return {
      section: "strategy",

      model: "Porter Five Forces",

      insights,
      strengths,
      risks,
      opportunities,

      confidence: this.confidence,

      content: {
        executive_thesis:
          "De concurrentiedynamiek wordt gedomineerd door structurele krachten die expliciete strategische keuzes vereisen.",
        central_tension:
          "De spanning ligt tussen reageren op marktdruk en het actief vormgeven van concurrentieregels.",
        forces_detected: {
          entrants: hasEntrants,
          buyers: hasBuyers,
          suppliers: hasSuppliers,
          substitutes: hasSubstitutes,
          rivalry: hasRivalry,
        },
        roadmap_90d: {
          month1: [
            "Analyseer marktdruk per Porter-kracht.",
            "Identificeer dominante krachten.",
          ],
          month2: [
            "Ontwikkel strategische responses per kracht.",
            "Koppel keuzes aan value proposition.",
          ],
          month3: [
            "Veranker concurrentiestrategie in governance en KPI’s.",
            "Monitor verschuivingen in krachten.",
          ],
        },
        score,
        urgency,
      },

      metadata: {
        judgement_model: "porter-five-forces",
        maturity: "advanced",
        detected_forces: forcesDetected,
      },
    };
  }
}
