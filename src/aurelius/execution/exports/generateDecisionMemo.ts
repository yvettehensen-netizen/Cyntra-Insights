// ============================================================
// src/aurelius/decision/generateDecisionMemo.ts
// AURELIUS — DECISION MEMO (BOARD-READY)
// ============================================================

export interface DecisionMemo {
  decision: string;
  rationale: string;
  risks: string;
  deadline: string;
  owner: string;

  // 🔥 ADDITIONS — CYNTRA DECISION LAYER
  personal_accountability: string;
  non_decision_consequence: string;
  decision_posture: "Onomkeerbaar" | "Tijdelijk" | "Voorwaardelijk";
}

/**
 * Generate a board-ready Decision Memo
 * Tone: verantwoordelijkheid > consensus
 */
export function generateDecisionMemo(report: any): DecisionMemo {
  return {
    decision:
      "Ik besluit de bestaande kernspanning te doorbreken door expliciete stop-keuzes af te dwingen en middelen, aandacht en besluitkracht te heralloceren naar een beperkt aantal strategische prioriteiten.",

    rationale:
      "Het huidige patroon van uitstel, nuancering en parallelle initiatieven heeft geleid tot versnippering van focus, vertraagde besluitvorming en structurele waardevernietiging. Dit patroon is bestuurlijk verklaarbaar, maar niet langer verdedigbaar.",

    risks:
      "Dit besluit zal op korte termijn weerstand oproepen en bestaande belangen raken. Het niet nemen van dit besluit vergroot echter aantoonbaar het risico op verdere executie-uitval, verlies van sleutelpersonen en oplopende correctiekosten.",

    deadline:
      report?.decision_deadline ??
      "Binnen 30 dagen na vaststelling van dit rapport",

    owner: "Bestuur — collectief verantwoordelijk",

    personal_accountability:
      "Ik erken dat dit patroon onder mijn verantwoordelijkheid is gegroeid. Door dit besluit te nemen, accepteer ik persoonlijke verantwoordelijkheid voor zowel de uitvoering als de consequenties.",

    non_decision_consequence:
      "Indien dit besluit niet wordt uitgevoerd, accepteer ik dat verdere schade aan de organisatie bestuurlijk aan mij kan worden toegerekend.",

    decision_posture: "Onomkeerbaar",
  };
}
