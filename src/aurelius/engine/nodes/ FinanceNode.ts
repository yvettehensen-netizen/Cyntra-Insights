// ============================================================
// src/aurelius/engine/nodes/FinanceNode.ts
// AURELIUS — FINANCE EXPERT NODE (MAXIMAL • CANON • 2026)
// ============================================================

import type {
  AnalysisContext,
  ModelResult,
} from "../../engine/types";

/* =========================
   EXPERT NODE CONTRACT
========================= */
export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;
  analyze(context: AnalysisContext): Promise<ModelResult>;
}

/* =========================
   CONTEXT EXTRACTION
========================= */
function extractText(context: AnalysisContext): string {
  return [
    context.rawText ?? "",
    ...(context.documents ?? []),
    JSON.stringify(context.userContext ?? {}),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/* =========================
   FINANCE NODE — MAXIMAL / FOUTLOOS
========================= */
export class FinanceNode implements ExpertNode {
  readonly name = "Finance";
  readonly confidence = 0.96;

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const text = extractText(context);

    const hasLiquidity = /cash|liquiditeit|runway|burn/i.test(text);
    const hasProfitability = /ebitda|marge|winst|roi|roic/i.test(text);
    const hasLeverage = /schuld|debt|equity|leverage/i.test(text);
    const hasGrowth = /groei|cagr|scaling|expansie/i.test(text);
    const hasRisk = /risico|volatiliteit|distress|altman/i.test(text);

    /* =========================
       INSIGHTS
    ========================= */
    const insights: string[] = [
      hasLiquidity &&
        "Liquiditeit en cashflowpositie bepalen de korte-termijn overlevingskracht.",
      hasProfitability &&
        "Winstgevendheid vormt de primaire motor voor strategische investeringsruimte.",
      hasLeverage &&
        "Kapitaalstructuur beïnvloedt zowel risico als strategische flexibiliteit.",
      hasGrowth &&
        "Groeidynamiek vereist discipline in kapitaalallocatie en rendementstoetsing.",
      hasRisk &&
        "Financiële volatiliteit vraagt actieve monitoring via scenarioanalyse.",
    ].filter(Boolean) as string[];

    /* =========================
       STRENGTHS
    ========================= */
    const strengths: string[] = [
      hasProfitability && "Sterke marges creëren financiële buffer.",
      hasGrowth && "Groei ondersteunt waardevermeerdering.",
    ].filter(Boolean) as string[];

    /* =========================
       RISKS
    ========================= */
    const risks: string[] = [
      !hasLiquidity && "Onvoldoende liquiditeitsfocus vergroot continuïteitsrisico.",
      hasLeverage && "Hoge leverage beperkt strategische bewegingsruimte.",
      hasRisk && "Financiële volatiliteit verhoogt executierisico.",
    ].filter(Boolean) as string[];

    /* =========================
       OPPORTUNITIES
    ========================= */
    const opportunities: string[] = [
      "Optimalisatie van kostenstructuur verhoogt EBITDA.",
      "Verbetering van werkkapitaalcyclus kan vrije cashflow vrijmaken.",
      "ROIC-gedreven kapitaalallocatie versterkt waardecreatie.",
    ];

    /* =========================
       RECOMMENDATIONS
    ========================= */
    const recommendations: string[] = [
      "Introduceer een rolling 13-weken cashflow forecast.",
      "Voer een DuPont-analyse uit op winstgevendheid.",
      "Evalueer kapitaalstructuur versus strategische ambities.",
      "Veranker financiële KPI’s in boardroom-besluitvorming.",
    ];

    /* =========================
       ROADMAP (INLINE — CANON)
    ========================= */
    const roadmap_90d = {
      month1: [
        "Analyseer kernratio’s: liquiditeit, leverage en winstgevendheid.",
        "Identificeer primaire financiële knelpunten.",
      ],
      month2: [
        "Ontwikkel cashflow- en investeringsscenario’s.",
        "Optimaliseer kosten- en kapitaalstructuur.",
      ],
      month3: [
        "Implementeer financieel dashboard.",
        "Institutionaliseer financiële discipline in besluitvorming.",
      ],
    };

    const score = Math.min(100, 50 + insights.length * 8);

    return {
      section: "finance",

      model: "Finance",

      insights,
      strengths,
      risks,
      opportunities,
      recommendations,

      confidence: this.confidence,

      content: {
        roadmap_90d,
        score,
        urgency: risks.length > 2 ? "Hoog" : "Middel",
      },

      metadata: {
        maturity: "advanced",
        judgement_model: "mckinsey-finance",
        upgrade_policy: "maximal",
        signals_detected: {
          liquidity: hasLiquidity,
          profitability: hasProfitability,
          leverage: hasLeverage,
          growth: hasGrowth,
          risk: hasRisk,
        },
      },
    };
  }
}
