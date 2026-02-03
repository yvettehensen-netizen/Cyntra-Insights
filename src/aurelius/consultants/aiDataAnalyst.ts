// ============================================================
// src/aurelius/consultants/aiDataAnalyst.ts
// CANONICAL CONSULTANT — AI & DATA GOVERNANCE
// ============================================================

import type {
  Consultant,
  ConsultantContext,
  ConsultantResult,
} from "../orchestrator/consultantTypes";

import { BASE_CONSULTANT_INSTRUCTIONS } from "./baseInstructions";

/* ============================================================
   LOCAL ENUMS (NON-BREAKING, TYPE-SAFE)
============================================================ */

export type OutputType = "object";
export type ConfidenceLevel = "low" | "medium" | "high";

/* ============================================================
   IDENTIFIER
============================================================ */

export const AI_DATA_ANALYST_ID = "ai_data" as const;

/* ============================================================
   DOMAIN INSTRUCTIONS
============================================================ */

const AI_DATA_DOMAIN_INSTRUCTIONS = `
Jij bent een onafhankelijke AI & Data Governance auditor.

Je levert GEEN rapport.
Je levert GEEN aanbevelingen.
Je levert GEEN strategie.

Je levert uitsluitend FEITELIJKE OBSERVATIES.

====================
OUTPUT (JSON ONLY)
====================
{
  "claims": string[],
  "evidence": string[],
  "risks": string[],
  "blindspots": string[],
  "confidence": "low" | "medium" | "high"
}

====================
ABSOLUTE AFBAKENING
====================
- Geen overlap met strategie, leiderschap, finance, cultuur of ethiek
- Geen executive summary
- Geen herformulering van andere consultants
- Geen letterlijke context-copy

Context:
{{CONTEXT}}
`.trim();

/* ============================================================
   CONSULTANT IMPLEMENTATION
============================================================ */

export const aiDataAnalyst: Consultant = {
  key: "governance_contribution",
  name: "AI & Data Governance Analyst",
  domain: "AI & Data Governance",

  async execute(
    context: ConsultantContext
  ): Promise<ConsultantResult> {
    return {
      content: {
        instructions: `${BASE_CONSULTANT_INSTRUCTIONS}\n\n${AI_DATA_DOMAIN_INSTRUCTIONS}`,
        constraints: {
          allowedDomains: [
            "data governance",
            "AI usage patterns",
            "data availability",
            "data quality",
            "vendor dependencies",
            "data lineage",
            "AI model auditing",
            "control mechanisms",
          ],
          forbiddenDomains: [
            "strategy",
            "roadmaps",
            "leadership",
            "culture",
            "finance",
            "ethics",
            "optimization",
          ],
          requiredSections: [
            "claims",
            "evidence",
            "risks",
            "blindspots",
            "confidence",
          ],
        },
      },
      confidence: 0.6,
      meta: {
        analyst_id: AI_DATA_ANALYST_ID,
        output_type: "object" as OutputType,
        expected_confidence: "medium" as ConfidenceLevel,
      },
    };
  },
} as const;
