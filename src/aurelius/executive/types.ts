export type ExecutiveGateCode =
  | "EXACT_9_SECTIONS"
  | "EXACT_10_SECTIONS"
  | "EXACT_11_SECTIONS"
  | "EXACT_12_SECTIONS"
  | "HEADING_EXACT_MATCH"
  | "SECTION_8_PRESENT"
  | "SECTION_9_COMMIT_PREFIX"
  | "SECTION_10_COMMIT_PREFIX"
  | "SECTION_11_COMMIT_PREFIX"
  | "SECTION_12_COMMIT_PREFIX"
  | "BOARD_SUMMARY_REQUIRED"
  | "SITUATION_RECON_REQUIRED"
  | "STRATEGIC_INSIGHTS_REQUIRED"
  | "BOARDROOM_INTELLIGENCE_REQUIRED"
  | "NO_EXTRA_HEADINGS"
  | "NO_BULLETS_OUTSIDE_8_9"
  | "CASUS_ANCHORS_MIN"
  | "SECTION_ANCHORS_DISTRIBUTION"
  | "SECTION8_ANCHORS_MIN"
  | "POWER_SHIFT_REQUIRED"
  | "IRREVERSIBILITY_REQUIRED"
  | "CULTURE_DRIFT_REQUIRED"
  | "SYSTEM_MECHANISM_REQUIRED"
  | "INTERVENTION_ARTEFACT_REQUIRED"
  | "DECISION_CONTRACT_REQUIRED"
  | "REPETITION_TOO_HIGH"
  | "SEMANTIC_DENSITY_TOO_LOW";

export class ExecutiveGateError extends Error {
  constructor(
    message: string,
    public readonly code: ExecutiveGateCode,
    public readonly details?: Record<string, unknown>,
    public readonly repairDirective?: string
  ) {
    super(message);
    this.name = "ExecutiveGateError";
  }
}
