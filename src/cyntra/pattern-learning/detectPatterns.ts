import type {
  DecisionMemorySignal,
  PatternLearningInput,
  PatternLearningOutput,
} from "./types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeList(values: string[] | undefined, limit = 6): string[] {
  if (!values?.length) return [];

  const unique = new Set<string>();
  for (const raw of values) {
    const cleaned = String(raw || "").trim();
    if (!cleaned) continue;
    unique.add(cleaned);
    if (unique.size >= limit) break;
  }

  return Array.from(unique);
}

function topPatternSignatures(memory: DecisionMemorySignal[], limit = 6): string[] {
  if (!memory.length) return [];

  const patternCount = new Map<string, number>();
  for (const row of memory) {
    const risk = row.dominant_risk_axes?.[0] || "risk:onbekend";
    const claim = row.dominant_claim_axes?.[0] || "claim:onbekend";
    const signature = `${risk} -> ${claim}`;
    patternCount.set(signature, (patternCount.get(signature) || 0) + 1);
  }

  return Array.from(patternCount.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([signature, count]) => `${signature} (${count}x)`);
}

function decisionClusters(memory: DecisionMemorySignal[], limit = 4): string[] {
  if (!memory.length) return [];

  const clusters = new Map<string, number>();

  for (const row of memory) {
    const lenses = row.activated_lenses || [];
    for (const lens of lenses) {
      const key = `lens:${String(lens || "onbekend").trim().toLowerCase()}`;
      clusters.set(key, (clusters.get(key) || 0) + 1);
    }

    const gateScore = Number(row.gate_score || 0);
    const repairs = Number(row.repair_attempts || 0);
    if (gateScore >= 80 && repairs === 0) {
      clusters.set("type:doorpak", (clusters.get("type:doorpak") || 0) + 1);
    } else if (gateScore < 65 || repairs > 1) {
      clusters.set("type:herstel", (clusters.get("type:herstel") || 0) + 1);
    } else {
      clusters.set("type:stabilisatie", (clusters.get("type:stabilisatie") || 0) + 1);
    }
  }

  return Array.from(clusters.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

function stagnationSignals(memory: DecisionMemorySignal[]): number {
  if (memory.length < 2) return 0;

  const sorted = [...memory].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  let stagnant = 0;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const cur = sorted[i];

    const stableScore = Math.abs(Number(cur.gate_score || 0) - Number(prev.gate_score || 0)) <= 1.5;
    const stableVelocity = Math.abs(Number(cur.decision_velocity || 0) - Number(prev.decision_velocity || 0)) <= 0.4;
    const sameStatus = String(cur.gate_status || "") === String(prev.gate_status || "");

    if (stableScore && stableVelocity && sameStatus) stagnant += 1;
  }

  return stagnant;
}

function escalationFrequency(input: PatternLearningInput): number {
  const lookback = Math.max(7, Math.min(365, Number(input.lookback_days || 30)));

  const escalationFromMemory = input.decision_memory.filter((row) => {
    const status = String(row.gate_status || "PASS").toUpperCase();
    return status !== "PASS" || Number(row.repair_attempts || 0) > 0;
  }).length;

  const escalationFromAudit = input.audit_logs.filter((row) => {
    return !row.single_call_mode || Number(row.repair_attempts || 0) > 0;
  }).length;

  const total = escalationFromMemory + escalationFromAudit;
  const weeks = Math.max(1, lookback / 7);
  return Number((total / weeks).toFixed(2));
}

export function detectPatterns(input: PatternLearningInput): PatternLearningOutput {
  const recurrentFromInput = normalizeList(input.recurrent_patterns);
  const recurrentPatterns = recurrentFromInput.length
    ? recurrentFromInput
    : topPatternSignatures(input.decision_memory);

  const recurrentFinal = recurrentPatterns.length
    ? recurrentPatterns
    : ["Geen recurrente patronen in geselecteerd venster"];

  const clusterFromInput = normalizeList(input.decision_type_cluster, 4);
  const decisionTypeCluster = clusterFromInput.length
    ? clusterFromInput
    : decisionClusters(input.decision_memory);

  const stagnation = Number.isFinite(input.stagnation_signals)
    ? clamp(Number(input.stagnation_signals), 0, 999)
    : stagnationSignals(input.decision_memory);

  const escalation = Number.isFinite(input.escalation_frequency)
    ? Math.max(0, Number(input.escalation_frequency))
    : escalationFrequency(input);

  return {
    recurrent_patterns: recurrentFinal,
    decision_type_cluster: decisionTypeCluster.length
      ? decisionTypeCluster
      : ["Geen dominant besliscluster gedetecteerd"],
    stagnation_signals: Number(stagnation.toFixed(0)),
    escalation_frequency: Number(escalation.toFixed(2)),
  };
}
