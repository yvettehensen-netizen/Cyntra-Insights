// src/aurelius/engine/nodes/strategy/StrategySynthesisNode.ts

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

/* =========================
   HARD SAFETY HELPERS
========================= */
const arr = (v?: string[]): string[] => (Array.isArray(v) ? v : []);
const uniq = (v: string[]): string[] => [...new Set(v)];

/* =========================
   SAFE ACCESSORS (CANON)
========================= */
function getScore(m: ModelResult): number {
  if (typeof m.content === "object" && m.content !== null) {
    const score = (m.content as Record<string, unknown>).score;
    return typeof score === "number" ? score : 50;
  }
  return 50;
}

function getRoadmap(m: ModelResult): {
  month1?: string[];
  month2?: string[];
  month3?: string[];
} {
  if (typeof m.content === "object" && m.content !== null) {
    const roadmap = (m.content as Record<string, unknown>).roadmap_90d;
    if (typeof roadmap === "object" && roadmap !== null) {
      return roadmap as {
        month1?: string[];
        month2?: string[];
        month3?: string[];
      };
    }
  }
  return {};
}

/* =========================
   THESIS GENERATORS
========================= */
function generateExecutiveThesis(models: ModelResult[]): string {
  const riskCount = models.reduce((s, m) => s + arr(m.risks).length, 0);
  const oppCount = models.reduce(
    (s, m) => s + arr(m.opportunities).length,
    0
  );

  if (riskCount > oppCount) {
    return "Cumulatieve risico’s domineren het strategisch speelveld; herprioritering en executiediscipline zijn vereist.";
  }
  if (oppCount > riskCount) {
    return "Kansenstructuur is sterk; versnelling van besluitvorming en allocatie kan waarde maximaliseren.";
  }
  return "Strategie is in balans maar mist scherpte; expliciete keuzes zijn noodzakelijk.";
}

function generateCentralTension(models: ModelResult[]): string {
  return `Ambitie versus uitvoeringskracht onder gecombineerde druk van ${models
    .map((m) => m.model)
    .join(", ")}.`;
}

/* =========================
   ROADMAP MERGER (SAFE)
========================= */
function mergeRoadmaps(models: ModelResult[]) {
  return {
    month1: uniq(models.flatMap((m) => getRoadmap(m).month1 ?? [])),
    month2: uniq(models.flatMap((m) => getRoadmap(m).month2 ?? [])),
    month3: uniq(models.flatMap((m) => getRoadmap(m).month3 ?? [])),
  };
}

/* =========================
   STRATEGY SYNTHESIS NODE
   MAXIMAL · STRICT · FOUTLOOS
========================= */
export class StrategySynthesisNode {
  synthesize(models: ModelResult[], _context: AnalysisContext) {
    const insights = uniq(models.flatMap((m) => arr(m.insights)));
    const risks = uniq(models.flatMap((m) => arr(m.risks)));
    const opportunities = uniq(models.flatMap((m) => arr(m.opportunities)));
    const recommendations = uniq(
      models.flatMap((m) => arr(m.recommendations))
    );

    const roadmap_90d = mergeRoadmaps(models);

    const confidence =
      models.reduce((s, m) => s + m.confidence, 0) /
      Math.max(models.length, 1);

    const score =
      models.reduce((s, m) => s + getScore(m), 0) /
      Math.max(models.length, 1);

    return {
      title: "Strategische Synthese (Boardroom-niveau)",
      executive_thesis: generateExecutiveThesis(models),
      central_tension: generateCentralTension(models),
      executive_summary:
        "Geïntegreerde synthese van alle strategische analyses met focus op risico’s, kansen en executiekracht.",
      insights,
      risks,
      opportunities,
      recommendations,

      /* =========================
         SYNTHESIS CONTENT (CANON)
      ========================= */
      content: {
        roadmap_90d,
        score,
        urgency: score < 70 ? "Hoog" : "Middel",
      },

      confidence,

      metadata: {
        integrated_models: models.map((m) => m.model),
        maturity: "advanced",
        judgement_model: "mckinsey-synthesis",
        upgrade_policy: "maximal",
        source_count: models.length,
      },
    };
  }
}
