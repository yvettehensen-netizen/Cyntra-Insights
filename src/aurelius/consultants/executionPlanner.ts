import type { Consultant } from "../types";
import { ConsultantId } from "../types/consultantIds";

export const EXECUTION_PLANNER_ID: ConsultantId = "execution";

const EXECUTION_DOMAIN_INSTRUCTIONS = `
DOMEIN: EXECUTIE (90 DAGEN)

Genereer uitsluitend een uitvoerbaar 90-dagen executieplan
op basis van alle voorgaande diagnostische analyses.

STRICTE OUTPUT:
{
  "month1": string[],
  "month2": string[],
  "month3": string[]
}

Geen toelichting. Geen analyse. Geen strategie.
Alleen uitvoering.

Context:
{{CONTEXT}}
`.trim();

export const executionPlanner: Consultant = {
  id: EXECUTION_PLANNER_ID,
  name: "Senior Execution Planner",
  role: "Vertaling van diagnostiek naar uitvoerbaar 90-dagenplan",
  output_key: "ninety_day_plan",
  output_type: "object",
  instructions: EXECUTION_DOMAIN_INSTRUCTIONS,
} as const;
