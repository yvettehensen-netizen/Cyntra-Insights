import type { Consultant } from "../types";
import { ConsultantId } from "../types/consultantIds";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const RISK_ANALYST_ID: ConsultantId = "risk";

const RISK_DOMAIN_INSTRUCTIONS = `
DOMEIN: RISICO

Analyseer uitsluitend feitelijke kwetsbaarheden en blootstelling
zoals deze observeerbaar zijn in structuur en gedrag.

====================
VERPLICHTE STRUCTUUR
====================
### Executive Observation
### Strategische Risico’s
### Operationele Kwetsbaarheden
### Financiële Exposure
### Governance-gerelateerde Risico’s
### Latente Risicopatronen

Context:
{{CONTEXT}}
`.trim();

export const riskAnalyst: Consultant = {
  id: RISK_ANALYST_ID,
  name: "Senior Risk Analyst",
  role: "Diagnose van feitelijke risico-exposure",
  output_key: "risk_register",
  output_type: "string",
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${RISK_DOMAIN_INSTRUCTIONS}`.trim(),
} as const;
