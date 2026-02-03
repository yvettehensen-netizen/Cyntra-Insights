// ============================================================
// src/aurelius/consultants/zorgSpanningskaart.ts
// ZORG SPANNINGSKAART CONSULTANT — CANON V1
// ============================================================

import type {
  Consultant,
  ConsultantContext,
  ConsultantResult,
} from "../orchestrator/consultantTypes";

export const zorgSpanningskaartConsultant: Consultant = {
  key: "zorg_spanningskaart",
  name: "Zorg Spanningskaart Consultant",
  domain: "healthcare-governance",

  async execute(context: ConsultantContext): Promise<ConsultantResult> {
    return {
      content: [
        {
          as: "Protocol ↔ Menselijkheid",
          spanning:
            "Formele richtlijnen botsen structureel met morele realiteit op de werkvloer.",
          observatie:
            "Teams ervaren dat kwaliteit formeel wordt gemeten, maar menselijkheid informeel wordt afgerekend.",
          risico: "Morele stress en stille uitputting.",
        },
        {
          as: "Autonomie ↔ Hiërarchie",
          spanning:
            "Professionele autonomie wordt beperkt door escalatielagen en governance-inertie.",
          observatie:
            "Besluiten blijven hangen tussen medische staf en bestuur.",
          risico: "Besluitvertraging en ownership-erosie.",
        },
      ],
      confidence: 0.82,
    };
  },
};
