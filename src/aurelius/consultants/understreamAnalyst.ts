// ============================================================
// src/aurelius/consultants/understreamAnalyst.ts
// ============================================================

import type { Consultant, ConsultantId } from "../types";
import { OutputType } from "../types";
import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

export const UNDERSTREAM_ANALYST_ID: ConsultantId = "understream";

const UNDERSTREAM_DOMAIN_INSTRUCTIONS = `
DOMEIN: ONDERSTROOM

Analyseer uitsluitend impliciete spanningen en onuitgesproken dynamieken.

### Executive Observation
### Onuitgesproken Loyaliteiten
### Latente Conflicten
### Taboes
### Emotionele Spanningsvelden
### Impliciete Gedragssturing
`.trim();

export const understreamAnalyst: Consultant = {
  id: UNDERSTREAM_ANALYST_ID,
  name: "Senior Understream Analyst",
  role: "Diagnose van impliciete organisatiedynamiek",
  output_key: "understream_scan",
  output_type: OutputType.String,
  instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n${UNDERSTREAM_DOMAIN_INSTRUCTIONS}`,
};
