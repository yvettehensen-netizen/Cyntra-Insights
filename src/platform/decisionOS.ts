import { syncDecisionRecord } from "@/aurelius/decision/DecisionBuilder";
import { InterventionTracker } from "@/aurelius/monitoring/InterventionTracker";
import { EarlyWarningEngine } from "@/aurelius/signals/EarlyWarningEngine";
import { evaluateScenarios } from "@/aurelius/simulation/ScenarioEngine";

type SessionLike = {
  session_id: string;
  organization_name?: string;
  updated_at?: string;
  analyse_datum?: string;
  intervention_predictions?: Array<{
    interventie?: string;
    impact?: string;
    risico?: string;
    kpi_effect?: string;
    confidence?: "laag" | "middel" | "hoog";
  }>;
  strategic_metadata?: {
    gekozen_strategie?: string;
    strategy_simulation?: {
      simulation_context?: {
        core_mechanism?: string;
      };
      strategic_scenarios?: Array<{
        scenario: "A" | "B" | "C";
        description?: string;
      }>;
      simulation_results?: Array<{
        scenario: "A" | "B" | "C";
        capaciteit?: string;
        financien?: string;
        cultuur?: string;
        netwerk?: string;
      }>;
      scenario_risks?: Array<{
        scenario: "A" | "B" | "C";
        risico?: string;
        kans?: "laag" | "middel" | "hoog";
        impact?: "laag" | "middel" | "hoog";
      }>;
      decision_guidance?: string;
      early_warning_signals?: Array<{
        scenario: "A" | "B" | "C";
        indicator?: string;
        kpi?: string;
      }>;
    };
    decision_memory?: {
      decision_record?: {
        gekozen_strategie?: string;
      };
      decision_alignment?: {
        status?: "consistent" | "gedeeltelijk afwijkend" | "fundamenteel afwijkend";
      };
      boardroom_alert?: string;
    };
    early_warning_system?: {
      boardroom_alert?: string;
      warning_indicators?: Array<{
        indicator?: string;
        huidige_waarde?: string;
        risico?: string;
        actie?: string;
      }>;
      risk_thresholds?: Array<{
        kpi?: string;
        norm?: string;
        kritische_waarde?: string;
      }>;
    };
    strategic_scenarios?: Array<{
      scenario: "A" | "B" | "C";
      name: string;
      mechanism: string;
      operational_effect: string;
      financial_effect: string;
      strategic_risk: string;
      board_implication: string;
      risk_level: "laag" | "middel" | "hoog";
    }>;
  };
};

export type DecisionScenarioCard = {
  scenario: "A" | "B" | "C";
  title: string;
  mechanism: string;
  operationalEffect: string;
  financialEffect: string;
  boardRisk: string;
  implication: string;
};

export type DecisionMonitorItem = {
  title: string;
  status: "gestart" | "vertraagd" | "afgerond";
  owner: string;
  deadline: string;
  risk: string;
  kpi: string;
};

export type DecisionMonitorSummary = {
  chosenStrategy: string;
  alignmentStatus: string;
  boardAlert: string;
  decision: string;
  owner: string;
  items: DecisionMonitorItem[];
};

export type EarlyWarningCard = {
  signal: string;
  norm: string;
  trigger: string;
  currentValue: string;
  risk: string;
  action: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function deriveDecisionScenarios(session: SessionLike): DecisionScenarioCard[] {
  return evaluateScenarios({
    ...(session.strategic_metadata?.strategy_simulation || {}),
    strategic_scenarios: session.strategic_metadata?.strategic_scenarios,
    strategic_causal_analysis: null,
    strategic_hefbomen: [],
    strategic_options: [],
  }).map((item) => ({
    scenario: item.scenario,
    title: item.title,
    mechanism: item.mechanism,
    operationalEffect: item.operationalEffect,
    financialEffect: item.financialEffect,
    boardRisk: item.boardRisk,
    implication: item.implication,
  }));
}

export function deriveDecisionMonitor(session: SessionLike): DecisionMonitorSummary {
  const record = syncDecisionRecord(session);
  const items = InterventionTracker.sync(session, record.decision_id).map((item) => ({
    title: item.intervention,
    status: item.status,
    owner: item.owner,
    deadline: item.deadline,
    risk: item.risk,
    kpi: item.kpi,
  }));

  return {
    chosenStrategy: record.chosen_option,
    alignmentStatus:
      normalize(session.strategic_metadata?.decision_memory?.decision_alignment?.status) || "consistent",
    boardAlert:
      normalize(session.strategic_metadata?.decision_memory?.boardroom_alert) ||
      normalize(session.strategic_metadata?.early_warning_system?.boardroom_alert) ||
      "Geen actieve board alert.",
    decision: record.decision,
    owner: record.owner,
    items,
  };
}

export function deriveEarlyWarnings(session: SessionLike): EarlyWarningCard[] {
  return new EarlyWarningEngine().detect(session).map((item) => ({
    signal: item.signal,
    norm: item.norm,
    trigger: item.trigger,
    currentValue: item.currentValue,
    risk: item.risk,
    action: item.boardAction,
  }));
}
