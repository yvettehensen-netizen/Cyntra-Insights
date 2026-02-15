import type {
  DecisionIntelligenceInput,
  DecisionIntelligenceOutput,
  DecisionSnapshot,
} from "./types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function statusBoost(status: string): number {
  const normalized = String(status || "PASS").toUpperCase();
  if (normalized === "PASS") return 20;
  if (normalized === "REPAIR") return 8;
  return -6;
}

function irreversibilityFromSnapshot(snapshot: DecisionSnapshot): number {
  const gate = Number(snapshot.gate_score || 0);
  const velocity = Number(snapshot.decision_velocity || 0);
  const repairs = Number(snapshot.repair_attempts || 0);

  return clamp(
    gate * 0.55 +
      velocity * 0.22 +
      statusBoost(snapshot.gate_status) -
      repairs * 6
  );
}

function ownershipFromSnapshot(snapshot: DecisionSnapshot): number {
  const lenses = snapshot.activated_lenses?.length || 0;
  const riskAxes = snapshot.dominant_risk_axes?.length || 0;
  const repairs = Number(snapshot.repair_attempts || 0);

  const focusPenalty = Math.abs(lenses - 2) * 10 + Math.max(0, riskAxes - 3) * 6;
  return clamp(92 - focusPenalty - repairs * 4);
}

function executionFromSnapshot(snapshot: DecisionSnapshot): number {
  const gate = Number(snapshot.gate_score || 0);
  const velocity = Number(snapshot.decision_velocity || 0);
  const repairs = Number(snapshot.repair_attempts || 0);
  const duration = Number(snapshot.duration_ms || 0);
  const singleCall = snapshot.single_call_mode;

  const durationPenalty = Math.min(22, duration / 4500);

  return clamp(
    gate * 0.6 +
      velocity * 0.25 +
      (singleCall ? 8 : -12) -
      repairs * 7 -
      durationPenalty
  );
}

function strengthIndex(
  irreversibility: number,
  ownership: number,
  execution: number
): number {
  return clamp(
    irreversibility * 0.35 + ownership * 0.25 + execution * 0.4
  );
}

function derive(snapshot: DecisionSnapshot): {
  irreversibility: number;
  ownership: number;
  execution: number;
  strength: number;
} {
  const irreversibility = irreversibilityFromSnapshot(snapshot);
  const ownership = ownershipFromSnapshot(snapshot);
  const execution = executionFromSnapshot(snapshot);
  const strength = strengthIndex(irreversibility, ownership, execution);

  return {
    irreversibility,
    ownership,
    execution,
    strength,
  };
}

export function evaluateDecisionIntelligence(
  input: DecisionIntelligenceInput
): DecisionIntelligenceOutput {
  const history = [...(input.history || [])].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  );

  const current = history[0];
  const previousFive = history.slice(1, 6);

  const currentDerived = current ? derive(current) : null;
  const previousStrength = previousFive.map((snapshot) => derive(snapshot).strength);

  const irreversibility = Number.isFinite(input.irreversibility_score)
    ? clamp(Number(input.irreversibility_score))
    : currentDerived?.irreversibility || 0;

  const ownershipInput = Number.isFinite(input.ownership_clarity_score)
    ? Number(input.ownership_clarity_score)
    : Number.isFinite(input.ownership_clarity)
    ? Number(input.ownership_clarity)
    : null;

  const ownership = ownershipInput !== null
    ? clamp(ownershipInput)
    : currentDerived?.ownership || 0;

  const execution = Number.isFinite(input.execution_probability)
    ? clamp(Number(input.execution_probability))
    : currentDerived?.execution || 0;

  const strength = Number.isFinite(input.decision_strength_index)
    ? clamp(Number(input.decision_strength_index))
    : currentDerived?.strength || strengthIndex(irreversibility, ownership, execution);

  const baseline = previousStrength.length ? avg(previousStrength) : strength;
  const delta = strength - baseline;

  let evolution: DecisionIntelligenceOutput["evolution_state"] = "Stilstand";
  if (delta > 2) evolution = "Verbetering";
  if (delta < -2) evolution = "Verslechtering";

  return {
    irreversibility_score: Number(irreversibility.toFixed(1)),
    ownership_clarity_score: Number(ownership.toFixed(1)),
    ownership_clarity: Number(ownership.toFixed(1)),
    execution_probability: Number(execution.toFixed(1)),
    decision_strength_index: Number(strength.toFixed(1)),
    evolution_state: evolution,
    evolution_delta: Number(delta.toFixed(2)),
    compared_window_size: Math.max(0, previousFive.length),
  };
}
