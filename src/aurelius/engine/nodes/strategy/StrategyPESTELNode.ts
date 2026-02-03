// ============================================================
// src/aurelius/engine/nodes/strategy/StrategyPESTELNode.ts
// AURELIUS — PESTEL (CANON • BOARDROOM SAFE • 2026)
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
    context.userContext?.vision ?? "",
    context.userContext?.ambition ?? "",
    context.userContext?.market ?? "",
    context.userContext?.choices ?? "",
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .join(" ")
    .toLowerCase();
}

/* =========================
   STRATEGY PESTEL NODE
========================= */
export class StrategyPESTELNode implements ExpertNode {
  readonly name = "PESTEL Analysis";
  readonly confidence = 0.95;

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const text = extractText(context);

    /* =========================
       KEYWORD DETECTION
    ========================= */
    const hasPolitical = [
      "politiek",
      "overheid",
      "regulering",
      "beleid",
      "subsidie",
    ].some(k => text.includes(k));

    const hasEconomic = [
      "economisch",
      "inflatie",
      "rente",
      "groei",
      "recessie",
    ].some(k => text.includes(k));

    const hasSocial = [
      "sociaal",
      "demografie",
      "cultuur",
      "consument",
      "arbeidsmarkt",
    ].some(k => text.includes(k));

    const hasTechnological = [
      "technologie",
      "ai",
      "digitalisering",
      "automatisering",
      "innovatie",
    ].some(k => text.includes(k));

    const hasEnvironmental = [
      "duurzaamheid",
      "milieu",
      "klimaat",
      "co2",
      "energie",
    ].some(k => text.includes(k));

    const hasLegal = [
      "wetgeving",
      "compliance",
      "juridisch",
      "privacy",
      "gdpr",
    ].some(k => text.includes(k));

    const detected = [
      hasPolitical,
      hasEconomic,
      hasSocial,
      hasTechnological,
      hasEnvironmental,
      hasLegal,
    ].filter(Boolean).length;

    /* =========================
       INSIGHTS (STRICT STRING[])
    ========================= */
    const insights: string[] = [];

    if (hasPolitical)
      insights.push("Politieke en regulatoire factoren beïnvloeden strategische speelruimte.");

    if (hasEconomic)
      insights.push("Economische volatiliteit beïnvloedt vraag, kosten en investeringsbereidheid.");

    if (hasSocial)
      insights.push("Sociale en demografische trends verschuiven klant- en arbeidsmarktverwachtingen.");

    if (hasTechnological)
      insights.push("Technologische versnelling creëert zowel disruptierisico’s als groeikansen.");

    if (hasEnvironmental)
      insights.push("Duurzaamheidsdruk vraagt structurele aanpassing van businessmodellen.");

    if (hasLegal)
      insights.push("Toenemende wet- en regelgeving verhoogt compliance-complexiteit.");

    if (insights.length < 3)
      insights.push(
        "PESTEL-dekking is beperkt; externe schokken kunnen organisatie onverwacht raken."
      );

    /* =========================
       STRENGTHS
    ========================= */
    const strengths: string[] = [];

    if (hasTechnological)
      strengths.push("Technologische slagkracht vergroot strategische wendbaarheid.");

    if (hasEnvironmental)
      strengths.push("Duurzaamheidsinitiatieven versterken reputatie en marktpositie.");

    if (strengths.length === 0)
      strengths.push("Beperkte expliciete PESTEL-voordelen zichtbaar.");

    /* =========================
       RISKS
    ========================= */
    const risks: string[] = [];

    if (!hasPolitical)
      risks.push("Onvoldoende zicht op politieke risico’s kan strategische verrassingen veroorzaken.");

    if (!hasLegal)
      risks.push("Juridische en compliance-risico’s zijn onvoldoende verankerd.");

    if (!hasEnvironmental)
      risks.push("Milieurisico’s kunnen leiden tot reputatieschade of boetes.");

    /* =========================
       OPPORTUNITIES
    ========================= */
    const opportunities: string[] = [
      "Scenario-planning op basis van macrotrends verhoogt strategische veerkracht.",
      "Vroege positionering op technologische en duurzame trends creëert voorsprong.",
    ];

    /* =========================
       SCORING
    ========================= */
    const score = Math.min(100, 40 + detected * 10);
    const urgency = score < 70 ? "Hoog" : "Middel";

    /* =========================
       FINAL OUTPUT (ENGINE CANON)
    ========================= */
    return {
      section: "strategy",

      model: "PESTEL",

      insights,
      strengths,
      risks,
      opportunities,

      confidence: this.confidence,

      content: {
        executive_thesis:
          "De macro-omgeving bevat significante krachten die expliciet geïntegreerd moeten worden in strategische besluitvorming.",
        central_tension:
          "De spanning ligt tussen reactieve aanpassing aan externe trends en proactieve strategische positionering.",
        detected_dimensions: {
          political: hasPolitical,
          economic: hasEconomic,
          social: hasSocial,
          technological: hasTechnological,
          environmental: hasEnvironmental,
          legal: hasLegal,
        },
        roadmap_90d: {
          month1: [
            "Identificeer dominante PESTEL-trends.",
            "Beoordeel impact op huidige strategie.",
          ],
          month2: [
            "Ontwikkel scenario’s per kritische trend.",
            "Koppel implicaties aan strategische keuzes.",
          ],
          month3: [
            "Veranker PESTEL in governance en KPI’s.",
            "Monitor macro-signalen structureel.",
          ],
        },
        score,
        urgency,
      },

      metadata: {
        judgement_model: "pestel",
        maturity: "advanced",
        detected_dimensions: detected,
      },
    };
  }
}
