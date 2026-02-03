// ============================================================
// src/aurelius/engine/consultantRunner.ts
// HEILIGE ENGINE-STAP — IDENTIEK GEDRAG
// ➕ ADD ONLY: decision-awareness & audit-metadata (TYPE-SAFE)
// ============================================================

import type { Consultant } from "../types";
import type { NLPSignal } from "./signalTypes";

/**
 * Afgeleide decision-intentie per consultant-id
 * (zonder Consultant-type uit te breiden)
 */
function inferDecisionIntent(consultantId: string): "decide" | "advise" | "inform" {
  if (
    consultantId === "strategy" ||
    consultantId === "governance" ||
    consultantId === "risk"
  ) {
    return "decide";
  }

  if (
    consultantId === "financial" ||
    consultantId === "market" ||
    consultantId === "growth"
  ) {
    return "advise";
  }

  return "inform";
}

/**
 * Afgeleide domeinclassificatie (audit / routing)
 */
function inferConsultantDomain(consultantId: string): string {
  switch (consultantId) {
    case "strategy":
    case "growth":
      return "Strategie";

    case "financial":
    case "risk":
      return "Finance & Risk";

    case "governance":
      return "Governance";

    case "leadership":
    case "team":
    case "culture":
    case "understream":
      return "Organisatie & Onderstroom";

    case "market":
    case "customer":
      return "Markt & Klant";

    default:
      return "Algemeen";
  }
}

export async function runConsultant(
  consultant: Consultant,
  context: string,
  signals: NLPSignal[]
) {
  return {
    consultant: consultant.id,
    output_key: consultant.output_key,

    /* ======================================================
       CONTENT — ONVERANDERD + ADDITIEF (TYPE-SAFE)
    ====================================================== */
    content: {
      context,
      signals,
      instructions: consultant.instructions,

      /* ================= ADD ONLY ================= */
      decision_frameworks: [
        "Porter",
        "PESTEL",
        "McKinsey7S",
        "GROW",
        "VIBAAAN",
        "HGBCO",
      ],
      consultant_domain: inferConsultantDomain(consultant.id),
      decision_intent: inferDecisionIntent(consultant.id),
      generated_at: new Date().toISOString(),
      /* ============================================ */
    },
  };
}
