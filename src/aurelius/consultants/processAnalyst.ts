import type { Consultant } from "../types";
import { ConsultantId } from "../types/consultantIds";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const PROCESS_ANALYST_ID: ConsultantId = "process";

const PROCESS_DOMAIN_INSTRUCTIONS = `
DOMEIN: PROCESSEN

Analyseer uitsluitend de feitelijke werking van kernprocessen,
overdrachtsmomenten en structurele fricties.

====================
VERPLICHTE STRUCTUUR
====================
### Executive Observation
### Kernprocesstructuur
### Overdrachtsmomenten
### Fricties en Vertraging
### Informele Workarounds
### Structurele Procesbeperkingen

Context:
{{CONTEXT}}
`.trim();

export const processAnalyst: Consultant = {
  id: PROCESS_ANALYST_ID,
  name: "Senior Process Analyst",
  role: "Diagnose van feitelijke proceswerking",
  output_key: "process_contribution",
  output_type: "string",
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${PROCESS_DOMAIN_INSTRUCTIONS}`.trim(),
} as const;
