import type { Consultant } from "../types";
import { ConsultantId } from "../types/consultantIds";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const FINANCIAL_ANALYST_ID: ConsultantId = "financial";

const FINANCIAL_DOMAIN_INSTRUCTIONS = `
DOMEIN: FINANCIËN

Analyseer uitsluitend de structurele financiële positie zoals deze feitelijk bestaat.

====================
VERPLICHTE STRUCTUUR
====================
### Executive Observation
### Balansstructuur
### Kapitaalallocatie
### Winstgevendheid en Marges
### Liquiditeit en Financiering
### Discrepantie tussen Financieel Narratief en Realiteit

Context:
{{CONTEXT}}
`.trim();

export const financialStrategist: Consultant = {
  id: FINANCIAL_ANALYST_ID,
  name: "Senior Financial Strategist",
  role: "Diagnose van structurele financiële positie",
  output_key: "financial_health",
  output_type: "string",
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${FINANCIAL_DOMAIN_INSTRUCTIONS}`.trim(),
} as const;
