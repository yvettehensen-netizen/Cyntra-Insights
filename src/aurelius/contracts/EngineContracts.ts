export type ContextContract = {
  context_state: Record<string, unknown>;
};

export type DiagnosisContract = {
  diagnosis: Record<string, unknown>;
};

export type ContradictionContract = {
  contradictions: Record<string, unknown>;
};

export type MechanismContract = {
  mechanisms: unknown[];
};

export type InsightContract = {
  insights: unknown[];
};

export type PatternContract = {
  patterns: unknown[];
};

export type LeverageContract = {
  leverage_points: unknown[];
};

export type DecisionContract = {
  decision: Record<string, unknown>;
};

export type SimulationContract = {
  simulation: Record<string, unknown>;
};

export type NarrativeContract = {
  board_report: string;
};

export type EngineContractName =
  | "ContextContract"
  | "DiagnosisContract"
  | "ContradictionContract"
  | "MechanismContract"
  | "InsightContract"
  | "PatternContract"
  | "LeverageContract"
  | "DecisionContract"
  | "SimulationContract"
  | "NarrativeContract";

export type EngineContractSpec = {
  requiredKeys: string[];
  typeChecks: Record<string, "object" | "array" | "string">;
};

export const ENGINE_CONTRACT_SPECS: Record<EngineContractName, EngineContractSpec> = {
  ContextContract: {
    requiredKeys: ["context_state"],
    typeChecks: { context_state: "object" },
  },
  DiagnosisContract: {
    requiredKeys: ["diagnosis"],
    typeChecks: { diagnosis: "object" },
  },
  ContradictionContract: {
    requiredKeys: ["contradictions"],
    typeChecks: { contradictions: "object" },
  },
  MechanismContract: {
    requiredKeys: ["mechanisms"],
    typeChecks: { mechanisms: "array" },
  },
  InsightContract: {
    requiredKeys: ["insights"],
    typeChecks: { insights: "array" },
  },
  PatternContract: {
    requiredKeys: ["patterns"],
    typeChecks: { patterns: "array" },
  },
  LeverageContract: {
    requiredKeys: ["leverage_points"],
    typeChecks: { leverage_points: "array" },
  },
  DecisionContract: {
    requiredKeys: ["decision"],
    typeChecks: { decision: "object" },
  },
  SimulationContract: {
    requiredKeys: ["simulation"],
    typeChecks: { simulation: "object" },
  },
  NarrativeContract: {
    requiredKeys: ["board_report"],
    typeChecks: { board_report: "string" },
  },
};
