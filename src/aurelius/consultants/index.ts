// ============================================================
// CONSULTANT EXPORT SURFACE — CANONICAL (DECISION-READY)
// CYNTRA INSIGHTS | AURELIUS ENGINE
// ============================================================

/* ============================================================
   PRIMARY EXPORTS — SINGLE SOURCE OF TRUTH
============================================================ */

export { strategyConsultant } from "./strategyConsultant";
export { financialStrategist } from "./financialStrategist";
export { growthAnalyst } from "./growthAnalyst";
export { riskAnalyst } from "./riskAnalyst";
export { executionPlanner } from "./executionPlanner";

export { leadershipAnalyst } from "./leadershipAnalyst";
export { teamDynamicsAnalyst } from "./teamDynamicsAnalyst";
export { cultureAnalyst } from "./cultureAnalyst";
export { understreamAnalyst } from "./understreamAnalyst";

export { processAnalyst } from "./processAnalyst";
export { marketAnalyst } from "./marketAnalyst";
export { customerAnalyst } from "./customerAnalyst";

export { esgAnalyst } from "./esgAnalyst";
export { governanceAnalyst } from "./governanceAnalyst";

/* ============================================================
   IMPORTS — INTERNAL REGISTRY BUILD
============================================================ */

import { strategyConsultant } from "./strategyConsultant";
import { financialStrategist } from "./financialStrategist";
import { growthAnalyst } from "./growthAnalyst";
import { riskAnalyst } from "./riskAnalyst";
import { executionPlanner } from "./executionPlanner";

import { leadershipAnalyst } from "./leadershipAnalyst";
import { teamDynamicsAnalyst } from "./teamDynamicsAnalyst";
import { cultureAnalyst } from "./cultureAnalyst";
import { understreamAnalyst } from "./understreamAnalyst";

import { processAnalyst } from "./processAnalyst";
import { marketAnalyst } from "./marketAnalyst";
import { customerAnalyst } from "./customerAnalyst";

import { esgAnalyst } from "./esgAnalyst";
import { governanceAnalyst } from "./governanceAnalyst";

/* ============================================================
   CONSULTANT META — DECISION CLASSIFICATION (NON-BREAKING)
   Enables:
   - Porter / PESTEL / McKinsey 7S
   - GROW (Reality / Options)
   - VIBAAAN filtering
   - HGBCO synthesis
============================================================ */

export type DecisionDomain =
  | "porter"
  | "pestel"
  | "mckinsey_7s"
  | "grow_reality"
  | "grow_options"
  | "governance"
  | "execution"
  | "culture"
  | "understream"
  | "risk"
  | "esg"
  | "market"
  | "customer"
  | "finance"
  | "strategy";

export interface ConsultantDescriptor {
  consultant: unknown;
  domains: DecisionDomain[];
  contributesToHGBCO: ("H" | "G" | "B" | "C" | "O")[];
  decisionWeight: number; // 1–5 (used later in orchestrator)
}

/* ============================================================
   CANONICAL CONSULTANT REGISTRY — DECISION-AWARE
============================================================ */

export const consultantRegistry: ConsultantDescriptor[] = [
  {
    consultant: strategyConsultant,
    domains: ["strategy", "porter", "mckinsey_7s"],
    contributesToHGBCO: ["H", "G"],
    decisionWeight: 5,
  },
  {
    consultant: financialStrategist,
    domains: ["finance", "grow_reality"],
    contributesToHGBCO: ["H", "B"],
    decisionWeight: 5,
  },
  {
    consultant: growthAnalyst,
    domains: ["grow_reality", "grow_options"],
    contributesToHGBCO: ["G", "O"],
    decisionWeight: 4,
  },
  {
    consultant: riskAnalyst,
    domains: ["risk", "pestel"],
    contributesToHGBCO: ["H", "B"],
    decisionWeight: 5,
  },
  {
    consultant: executionPlanner,
    domains: ["execution"],
    contributesToHGBCO: ["O"],
    decisionWeight: 5,
  },
  {
    consultant: leadershipAnalyst,
    domains: ["mckinsey_7s", "governance"],
    contributesToHGBCO: ["H", "C"],
    decisionWeight: 4,
  },
  {
    consultant: teamDynamicsAnalyst,
    domains: ["culture"],
    contributesToHGBCO: ["H", "C"],
    decisionWeight: 3,
  },
  {
    consultant: cultureAnalyst,
    domains: ["culture", "understream"],
    contributesToHGBCO: ["H", "C"],
    decisionWeight: 4,
  },
  {
    consultant: understreamAnalyst,
    domains: ["understream"],
    contributesToHGBCO: ["C"],
    decisionWeight: 5,
  },
  {
    consultant: processAnalyst,
    domains: ["execution", "mckinsey_7s"],
    contributesToHGBCO: ["H", "O"],
    decisionWeight: 3,
  },
  {
    consultant: marketAnalyst,
    domains: ["market", "porter"],
    contributesToHGBCO: ["H", "G"],
    decisionWeight: 4,
  },
  {
    consultant: customerAnalyst,
    domains: ["customer", "porter"],
    contributesToHGBCO: ["H", "G"],
    decisionWeight: 3,
  },
  {
    consultant: esgAnalyst,
    domains: ["esg", "pestel"],
    contributesToHGBCO: ["H", "B"],
    decisionWeight: 2,
  },
  {
    consultant: governanceAnalyst,
    domains: ["governance", "mckinsey_7s"],
    contributesToHGBCO: ["H", "C"],
    decisionWeight: 5,
  },
];

/* ============================================================
   LEGACY ARRAY — DO NOT REMOVE (BACKWARD COMPATIBLE)
============================================================ */

export const consultants = [
  strategyConsultant,
  financialStrategist,
  growthAnalyst,
  riskAnalyst,
  executionPlanner,
  leadershipAnalyst,
  teamDynamicsAnalyst,
  cultureAnalyst,
  understreamAnalyst,
  processAnalyst,
  marketAnalyst,
  customerAnalyst,
  esgAnalyst,
  governanceAnalyst,
] as const;
