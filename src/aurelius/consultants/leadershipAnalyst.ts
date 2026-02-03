import type { Consultant } from "../types";
import { ConsultantId } from "../types/consultantIds";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const LEADERSHIP_ANALYST_ID: ConsultantId = "leadership";

const LEADERSHIP_DOMAIN_INSTRUCTIONS = `
DOMEIN: LEIDERSCHAP

Analyseer uitsluitend observeerbaar leiderschapsgedrag.

====================
VERPLICHTE STRUCTUUR
====================
### Executive Observation
### Besluitvormingsgedrag
### Machts- en Autoriteitsgebruik
### Consistentie in Voorbeeldgedrag
### Informele Invloed
### Discrepantie tussen Leiderschapsnarratief en Praktijk

Context:
{{CONTEXT}}
`.trim();

export const leadershipAnalyst: Consultant = {
  id: LEADERSHIP_ANALYST_ID,
  name: "Senior Leadership Analyst",
  role: "Diagnose van feitelijk leiderschapsgedrag",
  output_key: "leadership_profile",
  output_type: "string",
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${LEADERSHIP_DOMAIN_INSTRUCTIONS}`.trim(),
} as const;
