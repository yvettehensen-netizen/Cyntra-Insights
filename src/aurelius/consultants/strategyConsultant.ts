// ============================================================
// src/aurelius/consultants/strategyConsultant.ts
// ============================================================

import type { Consultant, ConsultantId } from "../types";
import { OutputType } from "../types";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const STRATEGY_ANALYST_ID: ConsultantId = "strategy";

const STRATEGY_DOMAIN_INSTRUCTIONS = `
DOMEIN: STRATEGIE

Analyseer uitsluitend de feitelijke strategische richting zoals deze blijkt uit
observeerbare keuzes, prioritering en resource-allocatie.

### Executive Observation
### Strategische Prioritering
### Resource-Allocatie en Focus
### Trade-offs en Spanningsvelden
### Bewuste Non-keuzes
### Discrepantie tussen Ambitie en Gedrag
`.trim();

export const strategyConsultant: Consultant = {
  id: STRATEGY_ANALYST_ID,
  name: "Senior Strategy Consultant",
  role: "Diagnose van feitelijke strategische richting en impliciete keuzes",
  output_key: "strategic_blueprint",
  output_type: OutputType.String,
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${STRATEGY_DOMAIN_INSTRUCTIONS}`,
};
