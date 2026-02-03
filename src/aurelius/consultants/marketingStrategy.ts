// ============================================================
// MARKETING STRATEGY CONSULTANT
// ============================================================

import type { Consultant, ConsultantId } from "../types";
import { OutputType, ConfidenceLevel } from "../types";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const MARKETING_STRATEGY_CONSULTANT_ID: ConsultantId =
  "marketing_strategy";

export const marketingStrategyConsultant: Consultant = {
  id: MARKETING_STRATEGY_CONSULTANT_ID,
  name: "Marketing Strategy Consultant",
  role: "Positionering, funnel en vraagcreatie",

  output_key: "market_contribution",
  output_type: OutputType.String,

  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}
DOMEIN: MARKETINGSTRATEGIE
Analyseer positionering, ICP, kanalen, funnel en CAC.`.trim(),

  contract: {
    allowedDomains: [
      "positionering",
      "waardepropositie",
      "doelgroep",
      "ICP",
      "marketingkanalen",
      "funnel",
      "CAC",
      "CPL",
    ],
    forbiddenDomains: ["sales", "closing"],

    requiredSections: ["market_contribution"],

    constraints: {
      minWords: 400,
      maxWords: 1200,
      mustContainEvidence: true,
      expectedConfidence: ConfidenceLevel.High,
    },

    antiEchoPolicy: {
      forbidExecutiveSummary: true,
      forbidRephrasingOtherConsultants: true,
      forbidLiteralReuse: true,
    },
  },
} as const;
