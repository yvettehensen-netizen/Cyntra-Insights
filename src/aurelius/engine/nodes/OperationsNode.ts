// src/aurelius/engine/nodes/OperationsDecisionNode.ts
// ✅ BESLUITVORMING & EXECUTIE
// ✅ MC KINSEY / LEAN / TOC / AI (IMPLICIET)
// ✅ GEEN PLANNING – ALLEEN BESLUITKRACHT
// ✅ BOARDROOM-READY
// ✅ ADD-ONLY — NO DOWNGRADES

import type { AnalysisContext, ModelResult } from "../../types";

/* ============================================================
   EXPERT CONTRACT
============================================================ */

export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;
  analyze(context: AnalysisContext): Promise<ModelResult>;
}

/* ============================================================
   CONTEXT EXTRACTION (STRICT & SAFE)
============================================================ */

function extractRelevantText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.operations,
    context.userContext?.processes,
    context.userContext?.execution,
    context.userContext?.bottlenecks,
    context.userContext?.capacity,
    context.userContext?.delivery,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) {
      return p.toLowerCase();
    }
  }
  return "";
}

/* ============================================================
   OPERATIONAL DECISION SIGNALS (2026)
============================================================ */

interface OperationsDecisionSignal {
  keywords: string[];
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
}

const OPERATIONS_DECISION_SIGNALS_2026: OperationsDecisionSignal[] = [
  {
    keywords: ["proces", "flow", "doorlooptijd", "lead time"],
    insight:
      "⚙️ FLOW AANWEZIG: Operationele ketens zijn herkenbaar maar niet scherp gestuurd.",
    risk:
      "Zonder expliciete flow-besluiten blijven wachttijden onzichtbaar.",
    opportunity:
      "Besluiten op flow i.p.v. afdelingen verhogen snelheid en output direct.",
    recommendation:
      "Wijs één besluit-owner aan voor end-to-end flow (niet per afdeling).",
  },
  {
    keywords: ["handmatig", "excel", "afhankelijk", "persoon"],
    insight:
      "🧍 PERSOONSAFHANKELIJKHEID: Executie leunt op individuen i.p.v. systeem.",
    risk:
      "Persoonsafhankelijkheid is een verborgen schaal- en continuïteitsrisico.",
    opportunity:
      "Besluit tot standaardisatie/automatisering levert disproportionele winst.",
    recommendation:
      "Beslis expliciet: welk proces móét systeemgedreven worden.",
  },
  {
    keywords: ["bottleneck", "knelpunt", "capaciteit", "overbelasting"],
    insight:
      "🔗 CONSTRAINT HERKEND: Beperkingen in capaciteit zijn zichtbaar.",
    risk:
      "Optimaliseren buiten de bottleneck vernietigt rendement.",
    opportunity:
      "Één besluit op de primaire constraint verdubbelt vaak output.",
    recommendation:
      "Identificeer één dominante bottleneck en bescherm die expliciet.",
  },
  {
    keywords: ["kwaliteit", "fouten", "rework", "herstel"],
    insight:
      "🧪 KWALITEITSDRUK: Herstelwerk verstoort operationele stabiliteit.",
    risk:
      "Zonder besluit op root causes blijft rework structureel bestaan.",
    opportunity:
      "Besluiten op oorzaken i.p.v. symptomen herstellen rust en voorspelbaarheid.",
    recommendation:
      "Forceer besluit op top-3 structurele oorzaken van rework.",
  },
];

/* ============================================================
   OPERATIONELE BESLUITKADERS (BOARDROOM)
============================================================ */

const OPERATIONS_DECISION_FRAMEWORKS_2026 = [
  "Flow over Function",
  "Constraint-first Decision Making (TOC)",
  "System over Heroics",
  "Decision-driven Operations",
  "Stability before Optimization",
];

/* ============================================================
   OPERATIONS DECISION NODE
============================================================ */

export class OperationsDecisionNode implements ExpertNode {
  public readonly name = "Operations Decision & Execution Discipline";
  public readonly confidence = 0.93; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const text = extractRelevantText(context);

    const insights: string[] = [
      "⚙️ OPERATIONELE REALITEIT 2026: Output wordt begrensd door besluitkwaliteit, niet door effort.",
    ];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    /* ---------- Geen expliciete input = kans ---------- */
    if (!text) {
      opportunities.push(
        "Expliciete operationele besluitvorming kan direct rust, snelheid en voorspelbaarheid creëren."
      );
      recommendations.push(
        "Identificeer één operationeel besluit dat nu genomen moet worden om flow te herstellen."
      );

      return {
        model: "Operations Decision",
        insights,
        risks,
        opportunities,
        recommendations,
        confidence: this.confidence,
        metadata: {
          operations_mode: "decision-opportunity",
          downgrade_policy: "disabled",
        },
      };
    }

    /* ---------- Signal detection ---------- */
    for (const signal of OPERATIONS_DECISION_SIGNALS_2026) {
      if (signal.keywords.some(k => text.includes(k))) {
        if (signal.insight) insights.push(signal.insight);
        if (signal.risk) risks.push(signal.risk);
        if (signal.opportunity) opportunities.push(signal.opportunity);
        if (signal.recommendation) recommendations.push(signal.recommendation);
      }
    }

    insights.push(
      "📐 OPERATIONELE BESLUITKADERS (BOARDROOM):",
      ...OPERATIONS_DECISION_FRAMEWORKS_2026.map(f => `• ${f}`)
    );

    if (risks.length === 0) {
      risks.push(
        "Zonder expliciete operationele besluiten ontstaat structurele frictie en stille vertraging."
      );
    }

    recommendations.push(
      "Installeer vast besluitritme: constraint → besluit → effect → borging."
    );

    return {
      model: "Operations Decision",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        execution_logic: "decision-first",
        constraint_focus: true,
        downgrade_policy: "disabled",
      },
    };
  }
}
