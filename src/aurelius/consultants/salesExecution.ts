// ============================================================
// SALES EXECUTION CONSULTANT
// ============================================================

import type { Consultant, ConsultantId } from "../types";
import { OutputType, ConfidenceLevel } from "../types";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const SALES_EXECUTION_CONSULTANT_ID: ConsultantId = "sales_execution";

export const salesExecutionConsultant: Consultant = {
  id: SALES_EXECUTION_CONSULTANT_ID,
  name: "Sales Execution Consultant",
  role: "Conversie, closing en omzet",

  output_key: "customer_contribution",
  output_type: OutputType.String,

  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}
DOMEIN: SALES EXECUTIE
Analyseer conversie, closing en deal velocity.`.trim(),

  contract: {
    allowedDomains: [
      "salesproces",
      "conversie",
      "closing",
      "objections",
      "deal velocity",
    ],
    forbiddenDomains: ["marketing", "positionering"],

    requiredSections: ["customer_contribution"],

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
