// ============================================================
// src/aurelius/engine/decision/DecisionExecutionEngine.ts
// CYNTRA EXECUTION ENGINE — TASKING • SIMULATION • GOVERNANCE
// ADD ONLY • NO DOWNGRADES • FULLY TYPE-SAFE
// ============================================================

import type { ModelResult } from "../types";

/* ============================================================
   SAFE INTERNAL SHAPES (ADD ONLY)
============================================================ */

type DecisionPayload = {
  primary_decision: string;
  decision_owner: string;
  decision_deadline: string;
};

type InterventionPayload = {
  topstream_interventions: any[];
  understream_interventions: any[];
};

/* ============================================================
   TASK / OKR / GOVERNANCE MODELS
============================================================ */

export type ExecutionTask = {
  id: string;
  title: string;
  description: string;
  owner: string;
  deadline: string;
  priority: "critical" | "high" | "medium" | "low";
  source: "topstream" | "understream";
  linked_decision: string;
  success_metric?: string;
  risk_if_not_done?: string;
};

export type SimulationScenario = {
  scenario: string;
  assumption: string;
  impact: "low" | "medium" | "high" | "existential";
  probability: number;
  mitigation: string;
};

export type GovernanceTicket = {
  id: string;
  decision: string;
  owner: string;
  escalation_path: string;
  review_date: string;
  status: "open" | "in_review" | "closed" | "escalated";
};

/* ============================================================
   TYPE GUARDS (ADD ONLY — NO ASSUMPTIONS)
============================================================ */

function isRecord(x: unknown): x is Record<string, any> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function hasDecision(x: unknown): x is DecisionPayload {
  return (
    isRecord(x) &&
    typeof x.primary_decision === "string" &&
    typeof x.decision_owner === "string" &&
    typeof x.decision_deadline === "string"
  );
}

function hasInterventions(x: unknown): x is InterventionPayload {
  return (
    isRecord(x) &&
    Array.isArray(x.topstream_interventions) &&
    Array.isArray(x.understream_interventions)
  );
}

/* ============================================================
   SAFE EXTRACTORS (ADD ONLY — FIX TS2339)
============================================================ */

function extractDecision(content: unknown): DecisionPayload | null {
  if (!isRecord(content)) return null;

  if (hasDecision(content.decision)) {
    return content.decision;
  }

  if (
    isRecord(content.hgbco) &&
    isRecord(content.hgbco.O) &&
    typeof content.hgbco.O.owner === "string"
  ) {
    return {
      primary_decision:
        content.decision?.primary_decision ??
        "Besluit niet expliciet benoemd",
      decision_owner: content.hgbco.O.owner,
      decision_deadline: content.hgbco.O.review_moment ?? "Binnen 30 dagen",
    };
  }

  return null;
}

function extractInterventions(content: unknown): InterventionPayload | null {
  if (!isRecord(content)) return null;

  if (hasInterventions(content.interventions)) {
    return content.interventions;
  }

  if (
    isRecord(content.hgbco) &&
    isRecord(content.hgbco.O)
  ) {
    const top = Array.isArray(content.hgbco.O.first_90_days)
      ? content.hgbco.O.first_90_days
      : [];
    const under = Array.isArray(content.hgbco.O.understream)
      ? content.hgbco.O.understream
      : [];

    return {
      topstream_interventions: top,
      understream_interventions: under,
    };
  }

  return null;
}

/* ============================================================
   INTERVENTION → TASK CONVERTER
============================================================ */

export function convertInterventionsToTasks(
  decision: string,
  interventions: InterventionPayload
): ExecutionTask[] {
  const tasks: ExecutionTask[] = [];

  const buildTask = (
    intv: any,
    source: "topstream" | "understream",
    idx: number
  ): ExecutionTask => ({
    id: `${source}-${idx}-${Date.now()}`,
    title: intv.title ?? "Interventie",
    description:
      intv.description ??
      "Interventie voortkomend uit HGBCO-besluitvorming",
    owner: intv.owner ?? "Nog toe te wijzen",
    deadline: intv.deadline ?? "Binnen 90 dagen",
    priority: intv.priority ?? "high",
    source,
    linked_decision: decision,
    success_metric: intv.metric ?? "Besluit uitgevoerd",
    risk_if_not_done:
      intv.risk ??
      "Besluit verliest kracht, besluitverdamping treedt op",
  });

  interventions.topstream_interventions.forEach((i, idx) =>
    tasks.push(buildTask(i, "topstream", idx))
  );

  interventions.understream_interventions.forEach((i, idx) =>
    tasks.push(buildTask(i, "understream", idx))
  );

  return tasks;
}

/* ============================================================
   FAILURE & RESISTANCE SIMULATION
============================================================ */

export function simulateDecisionFailure(
  decision: string,
  owner: string,
  tasks: ExecutionTask[]
): SimulationScenario[] {
  const scenarios: SimulationScenario[] = [];

  scenarios.push({
    scenario: "Owner neemt geen expliciet besluit",
    assumption: `${owner} vermijdt commitment`,
    impact: "high",
    probability: 0.35,
    mitigation: "Escalatie naar RvB + harde deadline",
  });

  scenarios.push({
    scenario: "Onderstroom saboteert uitvoering",
    assumption: "Weerstand blijft impliciet",
    impact: "existential",
    probability: 0.4,
    mitigation: "Onderstroom-interventies afdwingen vóór uitvoering",
  });

  if (tasks.length === 0) {
    scenarios.push({
      scenario: "Geen executiekracht",
      assumption: "Besluit zonder taken",
      impact: "existential",
      probability: 0.6,
      mitigation: "Herontwerp executielaag",
    });
  }

  return scenarios;
}

/* ============================================================
   GOVERNANCE TICKET
============================================================ */

export function createGovernanceTicket(
  decision: string,
  owner: string,
  deadline: string
): GovernanceTicket {
  return {
    id: `gov-${Date.now()}`,
    decision,
    owner,
    escalation_path: "RvB → Raad van Toezicht",
    review_date: deadline,
    status: "open",
  };
}

/* ============================================================
   EXECUTION ENRICHER — SAFE & ADDITIVE (FIXED)
============================================================ */

export function enrichDecisionWithExecution(
  pipelineResult: ModelResult
): ModelResult {
  if (!isRecord(pipelineResult.content)) return pipelineResult;

  const decision = extractDecision(pipelineResult.content);
  const interventions = extractInterventions(pipelineResult.content);

  if (!decision || !interventions) {
    return pipelineResult;
  }

  const tasks = convertInterventionsToTasks(
    decision.primary_decision,
    interventions
  );

  const simulations = simulateDecisionFailure(
    decision.primary_decision,
    decision.decision_owner,
    tasks
  );

  const governance = createGovernanceTicket(
    decision.primary_decision,
    decision.decision_owner,
    decision.decision_deadline
  );

  return {
    ...pipelineResult,
    content: {
      ...(pipelineResult.content as Record<string, any>),
      execution: {
        tasks,
        simulations,
        governance,
      },
    },
    confidence: Math.min((pipelineResult.confidence ?? 0.7) * 1.05, 0.99),
  };
}
