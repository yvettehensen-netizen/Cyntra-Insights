// src/aurelius/engine/nodes/RiskDecisionNode.ts
// ✅ RISICO → BESLUITVORMING
// ✅ BOARDROOM-LEVEL
// ✅ GEEN MITIGATIE-ROADMAPS
// ✅ UPGRADE-ONLY (NO DOWNGRADES)
// ✅ CYNTRA TYPES CONSISTENT

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

/* ============================================================
   CONTEXT EXTRACTION (STRICT & SAFE)
============================================================ */

function extractTextFromContext(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.risks,
    context.userContext?.dependencies,
    context.userContext?.threats,
    context.userContext?.vulnerabilities,
    context.userContext?.choices,
    context.userContext?.governance,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p.toLowerCase();
  }
  return "";
}

/* ============================================================
   RISK → DECISION SIGNALS (2026)
============================================================ */

interface RiskDecisionSignal {
  keywords: string[];
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
  decision_axis:
    | "accept"
    | "reduce"
    | "eliminate"
    | "redesign"
    | "govern";
  category:
    | "strategic"
    | "execution"
    | "financial"
    | "operational"
    | "tech_ai"
    | "external";
  weight: number; // 1–5
}

const RISK_DECISION_SIGNALS_2026: RiskDecisionSignal[] = [
  {
    keywords: ["afhankelijk", "single source", "leverancier", "key partner"],
    insight:
      "🔗 STRUCTURELE AFHANKELIJKHEID: Kritieke afhankelijkheden zijn expliciet aanwezig.",
    risk:
      "Single points of failure beperken strategische bewegingsvrijheid.",
    opportunity:
      "Bewuste herontwerp- of exit-keuze vergroot resilience direct.",
    recommendation:
      "Beslis expliciet: accepteren, reduceren of elimineren van afhankelijkheden.",
    decision_axis: "redesign",
    category: "operational",
    weight: 4.5,
  },
  {
    keywords: ["executie", "vertraging", "te veel projecten", "geen focus"],
    insight:
      "⏱️ EXECUTIERISICO: Uitvoering vormt een dominant risicodomein.",
    risk:
      "Gebrek aan focus vernietigt strategie sneller dan externe dreiging.",
    opportunity:
      "Risico-reductie via besluitdiscipline i.p.v. extra controle.",
    recommendation:
      "Beslis wat **niet** meer uitgevoerd wordt.",
    decision_axis: "eliminate",
    category: "execution",
    weight: 4,
  },
  {
    keywords: ["cyber", "security", "datalek", "ransomware"],
    insight:
      "🛡️ EXISTENTIEEL DIGITAAL RISICO: Cyberdreiging is boardroom-kritisch.",
    risk:
      "Cyberincidenten ondermijnen vertrouwen en continuïteit direct.",
    opportunity:
      "Goede cybergovernance verhoogt strategische betrouwbaarheid.",
    recommendation:
      "Beslis welk risiconiveau acceptabel is en borg governance daarop.",
    decision_axis: "govern",
    category: "tech_ai",
    weight: 5,
  },
  {
    keywords: ["ai", "hallucinatie", "bias", "black box", "agentic"],
    insight:
      "🤖 AI-RISICO: Nieuwe technologie introduceert niet-lineaire risico’s.",
    risk:
      "Onbeheerst AI-gebruik leidt tot reputatie- en juridische schade.",
    opportunity:
      "Heldere AI-besluitregels maken veilige schaal mogelijk.",
    recommendation:
      "Beslis expliciet waar AI wél en niet autonoom mag handelen.",
    decision_axis: "govern",
    category: "tech_ai",
    weight: 4,
  },
  {
    keywords: ["klantconcentratie", "omzetconcentratie", "key account"],
    insight:
      "💰 FINANCIËLE KWETSBAARHEID: Concentratierisico is zichtbaar.",
    risk:
      "Afhankelijkheid van enkele klanten vergroot volatiliteit.",
    opportunity:
      "Bewuste concentratie kan ook strategische keuze zijn.",
    recommendation:
      "Beslis: accepteren met upside of actief reduceren.",
    decision_axis: "accept",
    category: "financial",
    weight: 4,
  },
  {
    keywords: ["geopolitiek", "sancties", "handelsoorlog", "supply chain"],
    insight:
      "🌍 EXTERN RISICO: Macro- en geopolitieke factoren beïnvloeden stabiliteit.",
    risk:
      "Externe schokken vereisen voorbereid besluitkader, geen ad-hoc reactie.",
    opportunity:
      "Resilience-design creëert voordeel t.o.v. reactieve concurrenten.",
    recommendation:
      "Beslis welke externe schokken je accepteert en welke je ontwijkt.",
    decision_axis: "accept",
    category: "external",
    weight: 3.8,
  },
];

/* ============================================================
   RISK BESLUITKADERS (BOARDROOM)
============================================================ */

const RISK_DECISION_FRAMEWORKS_2026 = [
  "Acceptable Risk Envelope",
  "Risk as Choice, not Failure",
  "Existential vs Tactical Risk Separation",
  "Governance before Mitigation",
  "Explicit Risk Ownership Doctrine",
];

/* ============================================================
   RISK DECISION NODE
============================================================ */

export class RiskDecisionNode {
  public readonly name = "Risk Decision & Strategic Resilience";
  public readonly confidence = 0.94; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const insights: string[] = [
      "⚠️ BOARDROOM-WAARHEID: Risico’s verdwijnen niet door mitigatie, maar door expliciete keuzes."
    ];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    const text = extractTextFromContext(context);

    /* ---------- Geen expliciete input = besluitprobleem ---------- */
    if (!text) {
      risks.push(
        "Risico’s zijn impliciet → organisatie stuurt op gevoel i.p.v. besluit."
      );
      recommendations.push(
        "Definieer een expliciet risicokader: wat accepteren we, wat nooit."
      );

      return {
        model: "RiskDecision",
        insights,
        risks,
        opportunities,
        recommendations,
        confidence: this.confidence,
        metadata: {
          risk_decision_clarity: "low",
          downgrade_policy: "disabled",
        },
      };
    }

    const decisionMap: Record<string, number> = {};
    const categories = new Set<string>();
    let severityScore = 0;

    for (const signal of RISK_DECISION_SIGNALS_2026) {
      if (signal.keywords.some(kw => text.includes(kw))) {
        if (signal.insight) insights.push(signal.insight);
        if (signal.risk) risks.push(signal.risk);
        if (signal.opportunity) opportunities.push(signal.opportunity);
        if (signal.recommendation) recommendations.push(signal.recommendation);

        decisionMap[signal.decision_axis] =
          (decisionMap[signal.decision_axis] ?? 0) + 1;

        categories.add(signal.category);
        severityScore += signal.weight;
      }
    }

    insights.push(
      "📐 RISICO-BESLUITKADERS (BOARDROOM):",
      ...RISK_DECISION_FRAMEWORKS_2026.map(f => `• ${f}`)
    );

    recommendations.push(
      "Maak per risicodomein expliciet: **accepteren**, **reduceren**, **herontwerpen** of **elimineren**."
    );
    recommendations.push(
      "Koppel elk niet-geaccepteerd risico aan één eigenaar met beslismandaat."
    );

    return {
      model: "RiskDecision",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        decision_axes: decisionMap,
        dominant_decision_axis: Object.entries(decisionMap).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0],
        dominant_categories: Array.from(categories),
        severity_score: severityScore,
        risk_posture:
          severityScore >= 10
            ? "fragile"
            : severityScore >= 6
            ? "exposed"
            : "aware",
        governance_mode: "explicit",
        downgrade_policy: "disabled",
      },
    };
  }
}
