export type RepairMode =
  | "NONE"
  | "FULL_REGEN"
  | "ANCHOR_REPAIR"
  | "POWER_REPAIR"
  | "IRREVERSIBILITY_REPAIR"
  | "DRIFT_REPAIR"
  | "SECTION8_REWRITE"
  | "ULTRA_DIEPTE_REGEN"
  | "WARMTE_REGEN"
  | "FULL_REGEN_PRESSURE_MODE"
  | "FRICTIE_REGEN";

export type GateCode =
  | "STRUCTURE_9_HEADINGS_REQUIRED"
  | "SYSTEM_MECHANISM_REQUIRED"
  | "CAUSAL_DENSITY_REQUIRED"
  | "ANCHOR_DISCIPLINE_REQUIRED"
  | "POWER_SHIFT_REQUIRED"
  | "IRREVERSIBILITY_REQUIRED"
  | "CULTURE_DRIFT_REQUIRED"
  | "SECTION8_INTERVENTION_ARTEFACT_REQUIRED"
  | "DECISION_CONTRACT_REQUIRED"
  | "ANTI_STAGNATION_REQUIRED"
  | "ULTRA_DIEPTE_REQUIRED"
  | "WARMTE_REQUIRED"
  | "PRESSURE_INDEX_REQUIRED"
  | "BESLUITDWANG_REQUIRED"
  | "INTERVENTIE_REALITEIT_REQUIRED"
  | "ORGANISATIE_FRICTIE_REQUIRED"
  | "GENERIC_FAIL";

export type GateCheckResult = {
  pass: boolean;
  code: GateCode;
  reason?: string;
  details?: Record<string, unknown>;
  repairMode: RepairMode;
  repairDirective: string;
};

export type GateDiagnostics = {
  anchors: string[];
  previousOutput?: string;
  topSentenceOverlap?: number;
  executivePressureIndex?: number;
  besluitdwangScore?: number;
  interventieRealiteitScore?: number;
  organisatieFrictieScore?: number;
};

export type GateInput = {
  narrativeText: string;
  context: string;
  diagnostics: GateDiagnostics;
};
