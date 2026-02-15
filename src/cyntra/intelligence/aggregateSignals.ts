import type {
  DriftResponse,
  GovernanceResponse,
  RiskEvolutionResponse,
} from "@/dashboard/executive/api/types";
import { evaluateDecisionIntelligence } from "@/cyntra/decision-intelligence";
import { detectPatterns } from "@/cyntra/pattern-learning";
import { modelRiskEvolution } from "@/cyntra/risk-evolution";
import { calculateStrategicHealth } from "./calculateStrategicHealth";
import { driftAnalysis } from "./driftAnalysis";
import { governanceResolver } from "./governanceResolver";
import { riskClustering } from "./riskClustering";
import type {
  AggregatedSignals,
  ExecutiveDecisionCardData,
  IntelligenceAggregateInput,
} from "./types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function avg(values: number[]): number {
  return values.length
    ? values.reduce((sum, n) => sum + n, 0) / values.length
    : 0;
}

function normalizeDriftIntensiteit(drift: DriftResponse): number {
  const waardes = drift.drift_intensiteit_heatmap.map((row) =>
    row.intensiteit > 1 ? row.intensiteit / 100 : row.intensiteit
  );
  return Math.max(0, Math.min(1, avg(waardes)));
}

function governanceSeverityScore(governance: GovernanceResponse): number {
  const state = String(governance.governance_state.status || "low").toLowerCase();

  if (state === "critical") return 18;
  if (state === "high") return 38;
  if (state === "medium") return 62;
  if (state === "freeze") return 8;
  return 85;
}

function ratio422(drift: DriftResponse): number {
  const filtered = drift.drift_intensiteit_heatmap.filter((row) =>
    String(row.drift_type).includes("422")
  );
  if (!filtered.length) return 0;
  return avg(
    filtered.map((row) =>
      row.intensiteit > 1 ? row.intensiteit / 100 : row.intensiteit
    )
  );
}

function redactExecutiveNarrative(input: ExecutiveDecisionCardData): string {
  const base =
    `Dominante these: ${input.dominant_thesis}. ` +
    `Centrale spanning: ${input.central_tension}. ` +
    `Irreversibele keuze: ${input.irreversible_choice}. ` +
    `Confidence ${input.confidence_pct}%. ` +
    `${input.window_30d}.`;

  const woorden = base.replace(/\s+/g, " ").trim().split(" ");
  if (woorden.length <= 120) return woorden.join(" ");
  return `${woorden.slice(0, 120).join(" ")}...`;
}

function buildExecutiveDecisionCard(
  input: IntelligenceAggregateInput,
  confidencePct: number,
  risk30: number
): ExecutiveDecisionCardData {
  const dominant_thesis = String(input.boardSummary.executive_thesis || "Geen dominante these beschikbaar.");
  const central_tension = String(input.boardSummary.dominant_risico || "Geen centrale spanning beschikbaar.");
  const irreversible_choice = String(
    input.boardSummary.onomkeerbaar_besluit ||
      "Geen irreversibele keuze gesignaleerd."
  );

  const currentRisk = input.risk.waargenomen_trend.at(-1)?.score ?? risk30;
  const delta = Number((risk30 - currentRisk).toFixed(1));
  const direction = delta > 0 ? "stijgt" : delta < 0 ? "daalt" : "blijft stabiel";
  const window_30d = `30 dagen venster: risico ${direction} naar ${risk30.toFixed(
    1
  )} (delta ${delta >= 0 ? "+" : ""}${delta}).`;

  const card: ExecutiveDecisionCardData = {
    dominant_thesis,
    central_tension,
    irreversible_choice,
    confidence_pct: Number(confidencePct.toFixed(1)),
    window_30d,
    narrative: "",
  };

  return {
    ...card,
    narrative: redactExecutiveNarrative(card),
  };
}

export function aggregateSignals(input: IntelligenceAggregateInput): AggregatedSignals {
  const driftNorm = normalizeDriftIntensiteit(input.drift);
  const governanceScore = governanceSeverityScore(input.governance);
  const executionConsistency = clamp(
    100 -
      input.sri.volatility_indicator * 8 -
      input.drift.besluit_omkeringen_detectie.aantal * 3
  );
  const driftStabilityInverse = clamp(100 - driftNorm * 100);
  const currentRisk = clamp(input.risk.waargenomen_trend.at(-1)?.score ?? 0);
  const riskDensityInverse = clamp(100 - currentRisk);
  const decisionVelocity = clamp(
    100 - Math.abs(input.sri.risicosnelheid) * 16
  );

  const strategic_health = calculateStrategicHealth({
    governance_score: governanceScore,
    execution_consistency: executionConsistency,
    drift_stability_inverse: driftStabilityInverse,
    risk_density_inverse: riskDensityInverse,
    decision_velocity: decisionVelocity,
    sriTrend: input.sri.sri_trend,
  });

  const drift = driftAnalysis({
    write_coverage: clamp(executionConsistency / 100, 0, 1),
    single_call_regressies: input.drift.besluit_omkeringen_detectie.aantal,
    ratio_422: ratio422(input.drift),
    governance_maturity: clamp(governanceScore / 100, 0, 1),
  });

  const risk = riskClustering(input.risk);
  const pattern_learning = detectPatterns({
    recurrent_patterns: input.patternLearning.recurrent_patterns,
    decision_type_cluster: input.patternLearning.decision_type_cluster,
    stagnation_signals: input.patternLearning.stagnation_signals,
    escalation_frequency: input.patternLearning.escalation_frequency,
    decision_memory: input.patternLearning.decision_memory,
    audit_logs: input.patternLearning.audit_logs,
    lookback_days: 30,
  });

  const decision_intelligence = evaluateDecisionIntelligence({
    history: input.decisionIntelligence.history,
    irreversibility_score: input.decisionIntelligence.irreversibility_score,
    ownership_clarity: input.decisionIntelligence.ownership_clarity,
    execution_probability: input.decisionIntelligence.execution_probability,
    decision_strength_index: input.decisionIntelligence.decision_strength_index,
  });

  const risk_evolution = modelRiskEvolution({
    current_risk_score: risk.current_risk_score,
    risk_velocity: input.risk.risico_acceleratie_vector.huidig,
    risk_trend_7d: input.risk.risico_acceleratie_vector.trend_7d,
    governance_state: input.governance.governance_state.status,
    governance_freeze_flags: input.governance.actieve_freeze_flags.length,
    governance_escalations: input.governance.escalation_ladder.length,
    drift_execution: drift.execution_drift,
    drift_structural: drift.structural_drift,
  });

  const governance_state = governanceResolver({
    governance_maturity: governanceScore,
    drift_quadrant: drift.quadrant,
    consistency_score: executionConsistency,
  });

  const executive_decision = buildExecutiveDecisionCard(
    input,
    strategic_health.score * 0.55 + decision_intelligence.decision_strength_index * 0.45,
    risk_evolution.projection_30d
  );

  return {
    strategic_health,
    drift,
    risk,
    risk_evolution,
    governance_state,
    pattern_learning,
    decision_intelligence,
    executive_decision,
  };
}
