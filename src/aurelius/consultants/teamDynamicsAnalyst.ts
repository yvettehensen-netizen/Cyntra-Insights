import type { Consultant } from "../types";
import { ConsultantId } from "../types/consultantIds";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const TEAM_ANALYST_ID: ConsultantId = "team";

const TEAM_DOMAIN_INSTRUCTIONS = `
DOMEIN: TEAMDYNAMIEK

Analyseer uitsluitend feitelijke interactie- en samenwerkingspatronen.

====================
VERPLICHTE STRUCTUUR
====================
### Executive Observation
### Rolduidelijkheid
### Samenwerkingspatronen
### Conflictdynamiek
### Informele Hiërarchie
### Structurele Spanningen

Context:
{{CONTEXT}}
`.trim();

export const teamDynamicsAnalyst: Consultant = {
  id: TEAM_ANALYST_ID,
  name: "Senior Team Dynamics Analyst",
  role: "Diagnose van feitelijke teaminteractie",
  output_key: "team_dynamics",
  output_type: "string",
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${TEAM_DOMAIN_INSTRUCTIONS}`.trim(),
} as const;
