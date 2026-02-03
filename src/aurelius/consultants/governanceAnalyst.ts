// ============================================================
// src/aurelius/consultants/governanceAnalyst.ts
// ============================================================

import type { Consultant, ConsultantId } from "../types";
import { OutputType } from "../types";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const GOVERNANCE_ANALYST_ID: ConsultantId = "governance";

const GOVERNANCE_DOMAIN_INSTRUCTIONS = `
DOMEIN: GOVERNANCE

Analyseer uitsluitend de feitelijke besturings-, besluitvormings-
en machtsstructuur binnen de organisatie.

### Executive Observation
### Besluitstructuur
### Macht en Tegenmacht
### Controlemechanismen
### Transparantie en Informatie-asymmetrie
### Structurele Governance-spanningen
`.trim();

export const governanceAnalyst: Consultant = {
  id: GOVERNANCE_ANALYST_ID,
  name: "Senior Governance Analyst",
  role: "Diagnose van feitelijke governance-, macht- en besluitstructuren",
  output_key: "governance_contribution",
  output_type: OutputType.String,
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${GOVERNANCE_DOMAIN_INSTRUCTIONS}`,
};
