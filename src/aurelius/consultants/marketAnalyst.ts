import type { Consultant } from "../types";
import { ConsultantId } from "../types/consultantIds";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const MARKET_ANALYST_ID: ConsultantId = "market";

const MARKET_DOMAIN_INSTRUCTIONS = `
DOMEIN: MARKT & CONCURRENTIE

Analyseer uitsluitend de feitelijke marktcontext en concurrentiedynamiek
zoals deze observeerbaar is in positionering en gedragsreacties.

====================
VERPLICHTE STRUCTUUR
====================
### Executive Observation
### Marktstructuur en Spelers
### Concurrentiedruk
### Positionering en Differentiatie
### Prijs- en Machtsevenwicht
### Structurele Marktspanningen

Context:
{{CONTEXT}}
`.trim();

export const marketAnalyst: Consultant = {
  id: MARKET_ANALYST_ID,
  name: "Senior Market & Competition Analyst",
  role: "Diagnose van feitelijke markt- en concurrentiedynamiek",
  output_key: "market_contribution",
  output_type: "string",
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${MARKET_DOMAIN_INSTRUCTIONS}`.trim(),
} as const;
