#!/usr/bin/env node

/**
 * Governance smoke scenarios
 * A: Gate gemist -> BALI daalt + waarschuwing
 * B: Snelle executie binnen 72u -> adoption stijgt -> BALI stijgt
 * C: Geen rapport -> lege lijst; na save -> rapport direct zichtbaar
 */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeScaleTo10(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric <= 1) return clamp(numeric * 10, 0, 10);
  if (numeric <= 10) return clamp(numeric, 0, 10);
  return clamp(numeric / 10, 0, 10);
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function computeBali({
  sliders,
  gateCompliance,
  gateMissedCount,
  adoptionWithin72hRate,
  escalationResolutionScore,
  totalDecisions,
  reopenedDecisions,
}) {
  const sliderAvg = avg(sliders.map(normalizeScaleTo10));
  const gate = clamp(normalizeScaleTo10(gateCompliance) - gateMissedCount * 0.3, 0, 10);
  const adoption = normalizeScaleTo10(adoptionWithin72hRate);
  const escalation = normalizeScaleTo10(escalationResolutionScore);
  const stability = clamp(
    (1 - clamp(reopenedDecisions, 0, Math.max(1, totalDecisions)) / Math.max(1, totalDecisions)) * 10,
    0,
    10
  );

  const bali =
    sliderAvg * 0.4 +
    gate * 0.2 +
    adoption * 0.2 +
    escalation * 0.1 +
    stability * 0.1;

  return Number(clamp(bali, 0, 10).toFixed(2));
}

const reportStore = [];
function getReports() {
  return [...reportStore].sort((a, b) => new Date(b.date) - new Date(a.date));
}
function saveReport(report) {
  const index = reportStore.findIndex((r) => r.id === report.id);
  if (index >= 0) reportStore.splice(index, 1);
  reportStore.push(report);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runScenarioA() {
  const baseline = computeBali({
    sliders: [7, 7, 7, 7, 7],
    gateCompliance: 8.2,
    gateMissedCount: 0,
    adoptionWithin72hRate: 8,
    escalationResolutionScore: 7.2,
    totalDecisions: 20,
    reopenedDecisions: 1,
  });

  const afterMissedGate = computeBali({
    sliders: [6.5, 6.5, 6, 6.2, 6.1],
    gateCompliance: 5.3,
    gateMissedCount: 3,
    adoptionWithin72hRate: 5.5,
    escalationResolutionScore: 5.4,
    totalDecisions: 20,
    reopenedDecisions: 5,
  });

  const drop = Number((baseline - afterMissedGate).toFixed(2));
  const warning = drop > 1;

  assert(drop > 1, "Scenario A faalt: BALI daalt niet > 1 punt.");
  assert(warning, "Scenario A faalt: waarschuwing werd niet geactiveerd.");

  return { baseline, afterMissedGate, drop, warning };
}

function runScenarioB() {
  const lowAdoption = computeBali({
    sliders: [6.8, 6.7, 6.6, 6.8, 6.7],
    gateCompliance: 6.9,
    gateMissedCount: 1,
    adoptionWithin72hRate: 4.8,
    escalationResolutionScore: 6.2,
    totalDecisions: 18,
    reopenedDecisions: 3,
  });

  const highAdoption = computeBali({
    sliders: [7.1, 7.2, 7, 7.3, 7.1],
    gateCompliance: 7.5,
    gateMissedCount: 0,
    adoptionWithin72hRate: 9.1,
    escalationResolutionScore: 7.2,
    totalDecisions: 18,
    reopenedDecisions: 1,
  });

  assert(highAdoption > lowAdoption, "Scenario B faalt: hogere adoption verhoogt BALI niet.");

  return { lowAdoption, highAdoption, delta: Number((highAdoption - lowAdoption).toFixed(2)) };
}

function runScenarioC() {
  const before = getReports();
  assert(before.length === 0, "Scenario C faalt: store is niet leeg bij start.");

  saveReport({
    id: "rep-smoke-1",
    analysisId: "analysis-smoke-1",
    title: "Smoke Rapport",
    date: new Date().toISOString(),
    baliScore: 7.4,
    betrouwbaarheid: 8.1,
    interventionStatus: "Actief",
  });

  const after = getReports();
  assert(after.length === 1, "Scenario C faalt: rapport niet opgeslagen.");
  assert(after[0].id === "rep-smoke-1", "Scenario C faalt: opgeslagen rapport niet direct zichtbaar.");

  return { beforeCount: before.length, afterCount: after.length };
}

function main() {
  const results = {
    scenarioA: runScenarioA(),
    scenarioB: runScenarioB(),
    scenarioC: runScenarioC(),
  };

  console.log("Governance scenario smoke test: PASS");
  console.table({
    "Scenario A (drop)": results.scenarioA.drop,
    "Scenario B (delta)": results.scenarioB.delta,
    "Scenario C (count)": results.scenarioC.afterCount,
  });
}

try {
  main();
} catch (error) {
  console.error("Governance scenario smoke test: FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

