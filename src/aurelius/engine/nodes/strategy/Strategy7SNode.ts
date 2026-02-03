// ============================================================
// src/aurelius/engine/nodes/strategy/Strategy7SNode.ts
// AURELIUS — STRATEGY 7S NODE (CANON • DECISION-READY)
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
    JSON.stringify(context.userContext ?? {}),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/* =========================
   STRATEGY 7S NODE
========================= */
export class Strategy7SNode implements ExpertNode {
  readonly name = "McKinsey 7S Alignment";
  readonly confidence = 0.94;

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const text = extractText(context);

    const hasStrategy = /strategie|ambitie|positionering/i.test(text);
    const hasStructure = /structuur|organisatie|rollen|hiërarchie/i.test(text);
    const hasSystems = /systemen|processen|kpi|governance/i.test(text);
    const hasSkills = /skills|competenties|capabilities|talent/i.test(text);
    const hasStyle = /leiderschap|managementstijl|besluitvorming/i.test(text);
    const hasStaff = /medewerkers|team|bezetting|resources/i.test(text);
    const hasSharedValues = /waarden|cultuur|purpose|missie/i.test(text);

    const covered = [
      hasStrategy,
      hasStructure,
      hasSystems,
      hasSkills,
      hasStyle,
      hasStaff,
      hasSharedValues,
    ].filter(Boolean).length;

    /* =========================
       INSIGHTS
    ========================= */
    const insights: string[] = [
      "Executiekracht wordt primair bepaald door alignment tussen harde en zachte 7S-elementen.",
      hasStrategy &&
        "Strategische richting is aanwezig maar onvoldoende verankerd in organisatiekeuzes.",
      hasSystems &&
        "Systemen en KPI’s sturen gedrag sterker dan strategische intenties.",
      hasSharedValues &&
        "Cultuur werkt als hefboom of blokkade voor executie.",
      covered < 5 &&
        "Onvolledige 7S-alignment vergroot structureel executierisico.",
    ].filter(Boolean) as string[];

    /* =========================
       STRENGTHS / WEAKNESSES
    ========================= */
    const strengths: string[] = [
      hasStrategy && "Strategische intentie is expliciet aanwezig.",
      hasStyle && "Leiderschap beïnvloedt zichtbaar richting en gedrag.",
      hasSharedValues && "Duidelijke kernwaarden bieden veranderbasis.",
    ].filter(Boolean) as string[];

    const weaknesses: string[] = [
      !hasSystems && "Systemen en KPI’s ondersteunen strategie onvoldoende.",
      !hasSkills && "Kritische skills ontbreken voor executie.",
      !hasStructure && "Structuur belemmert eigenaarschap en snelheid.",
      !hasStaff && "Capaciteit sluit niet aan op strategische prioriteiten.",
    ].filter(Boolean) as string[];

    /* =========================
       RISKS & OPPORTUNITIES
    ========================= */
    const risks: string[] = [
      "Structurele misalignment leidt tot executieverlies.",
      weaknesses.length > 2 &&
        "Cumulatieve 7S-zwaktes verhogen faalrisico van strategie.",
    ].filter(Boolean) as string[];

    const opportunities: string[] = [
      "7S-alignment kan executiesnelheid significant verhogen.",
      "Gerichte skill-ontwikkeling versnelt strategische transformatie.",
      "Verankering van waarden versterkt verandervermogen.",
    ];

    /* =========================
       RECOMMENDATIONS
    ========================= */
    const recommendations: string[] = [
      "Voer een expliciete 7S-alignment review uit op bestuursniveau.",
      "Vertaal strategie naar harde keuzes in structuur en systemen.",
      "Definieer kritische skills per strategische prioriteit.",
      "Veranker waarden in leiderschap en governance.",
    ];

    const score = Math.min(100, 40 + covered * 8);

    /* =========================
       FINAL RESULT — CANON
    ========================= */
    return {
      section: "strategy",

      model: "McKinsey 7S",

      insights,
      strengths,
      weaknesses,
      risks,
      opportunities,
      recommendations,

      confidence: this.confidence,

      content: {
        roadmap_90d: {
          month1: [
            "Analyseer huidige staat per 7S-dimensie.",
            "Identificeer kritische misalignments.",
          ],
          month2: [
            "Ontwerp gewenste 7S-doelarchitectuur.",
            "Koppel strategie aan structuur, systemen en skills.",
          ],
          month3: [
            "Implementeer governance- en leiderschapsinterventies.",
            "Monitor alignment via KPI’s en gedragsindicatoren.",
          ],
        },
        score,
        urgency: score < 70 ? "Hoog" : "Middel",
      },

      metadata: {
        maturity: "advanced",
        judgement_model: "mckinsey-7s-alignment",
        covered_dimensions: covered,
        detected: {
          strategy: hasStrategy,
          structure: hasStructure,
          systems: hasSystems,
          skills: hasSkills,
          style: hasStyle,
          staff: hasStaff,
          shared_values: hasSharedValues,
        },
      },
    };
  }
}
