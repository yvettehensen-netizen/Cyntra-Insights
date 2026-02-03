import type { Consultant } from "../types";
import { ConsultantId } from "../types/consultantIds";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const ESG_ANALYST_ID: ConsultantId = "esg";

const ESG_DOMAIN_INSTRUCTIONS = `
DOMEIN: ESG

Analyseer uitsluitend de feitelijke milieu-, sociale en governancepraktijken
zoals deze observeerbaar zijn in kernactiviteiten en besluitvorming.

====================
VERPLICHTE STRUCTUUR
====================
### Executive Observation
### Milieupraktijken
### Sociale Praktijken
### Governance-volwassenheid
### Reputatierisico’s
### Discrepantie tussen ESG-narratief en Realiteit

Context:
{{CONTEXT}}
`.trim();

export const esgAnalyst: Consultant = {
  id: ESG_ANALYST_ID,
  name: "Senior ESG Analyst",
  role: "Diagnose van feitelijke ESG-praktijken en reputatie-exposure",
  output_key: "strategic_blueprint",
  output_type: "string",
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${ESG_DOMAIN_INSTRUCTIONS}`.trim(),
} as const;
