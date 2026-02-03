import type { Consultant } from "../types";
import { ConsultantId } from "../types/consultantIds";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const CUSTOMER_ANALYST_ID: ConsultantId = "customer";

const CUSTOMER_DOMAIN_INSTRUCTIONS = `
DOMEIN: KLANTSTRUCTUUR

Analyseer uitsluitend de feitelijke klantstructuur en patronen van waardecreatie
en waarde-lekkage zoals deze observeerbaar zijn in gedrag en economische uitkomsten.

====================
VERPLICHTE STRUCTUUR
====================
### Executive Observation
### Klantconcentratie en Afhankelijkheid
### Gedragspatronen en Loyaliteit
### Prijs- en Margedynamiek
### Waardecreatie versus Waarde-lekkage
### Discrepantie tussen Klantnarratief en Realiteit

Context:
{{CONTEXT}}
`.trim();

export const customerAnalyst: Consultant = {
  id: CUSTOMER_ANALYST_ID,
  name: "Senior Customer Structure Analyst",
  role: "Diagnose van feitelijke klantstructuur en waardepatronen",
  output_key: "opportunity_map",
  output_type: "string",
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${CUSTOMER_DOMAIN_INSTRUCTIONS}`.trim(),
} as const;
