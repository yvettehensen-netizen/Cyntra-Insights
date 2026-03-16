import fs from "node:fs";
import path from "node:path";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function read(repoRoot: string, relPath: string): string {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

function assertInOrder(source: string, markers: string[]): void {
  let lastIndex = -1;
  for (const marker of markers) {
    const idx = source.indexOf(marker);
    assert(idx >= 0, `Marker ontbreekt: ${marker}`);
    assert(idx > lastIndex, `Marker niet in juiste volgorde: ${marker}`);
    lastIndex = idx;
  }
}

function main(): void {
  const repoRoot = process.cwd();

  const orchestrator = read(repoRoot, "src/aurelius/agent/runCyntraStrategicAgent.ts");
  const outputGuard = read(repoRoot, "src/aurelius/stability/OutputContractGuard.ts");
  const promptGuard = read(repoRoot, "src/aurelius/stability/PromptConsistencyGuard.ts");
  const executionGuard = read(repoRoot, "src/aurelius/stability/EngineExecutionGuard.ts");
  const narrativeGuard = read(repoRoot, "src/aurelius/stability/NarrativeStructureGuard.ts");

  assert(/runOutputContractGuard/.test(orchestrator), "Orchestrator gebruikt OutputContractGuard niet.");
  assert(/runPromptConsistencyGuard/.test(orchestrator), "Orchestrator gebruikt PromptConsistencyGuard niet.");
  assert(/EngineExecutionGuard/.test(orchestrator), "Orchestrator gebruikt EngineExecutionGuard niet.");
  assert(/runNarrativeStructureGuard/.test(orchestrator), "Orchestrator gebruikt NarrativeStructureGuard niet.");

  assertInOrder(orchestrator, [
    'executionGuard.record("Context Layer")',
    'executionGuard.record("Diagnosis Layer")',
    'executionGuard.record("Contradiction Engine")',
    'executionGuard.record("Mechanism Engine")',
    'executionGuard.record("Strategic Insight Engine")',
    'executionGuard.record("Strategic Pattern Engine")',
    'executionGuard.record("Strategic Simulation Engine")',
    'executionGuard.record("Decision Engine")',
    'executionGuard.record("Strategic OS Layer")',
    'executionGuard.record("Narrative Layer")',
  ]);

  assert(/Context Layer/.test(outputGuard), "OutputContractGuard mist Context Layer contract.");
  assert(/Decision Engine/.test(outputGuard), "OutputContractGuard mist Decision Engine contract.");
  assert(/Strategic OS Layer/.test(outputGuard), "OutputContractGuard mist Strategic OS Layer contract.");
  assert(/Narrative Layer/.test(outputGuard), "OutputContractGuard mist Narrative Layer contract.");
  assert(/\/logs\/cyntra_stability\.log/.test(outputGuard), "Stability logpad ontbreekt.");

  assert(/requiredSections/.test(promptGuard), "PromptConsistencyGuard mist requiredSections check.");
  assert(/Duplicatie gedetecteerd/.test(promptGuard), "PromptConsistencyGuard mist duplicatie check.");

  assert(/REQUIRED_ENGINE_ORDER/.test(executionGuard), "EngineExecutionGuard mist vereiste volgorde.");
  assert(/Volgorde afwijking/.test(executionGuard), "EngineExecutionGuard mist volgorde-waarschuwing.");

  assert(/1\. Besluitvraag/.test(narrativeGuard), "NarrativeStructureGuard mist Besluitvraag.");
  assert(/9\. Besluittekst/.test(narrativeGuard), "NarrativeStructureGuard mist Besluittekst.");
  assert(/Placeholder toegevoegd/.test(narrativeGuard), "NarrativeStructureGuard mist placeholder-logica.");

  assert(/simulation_results/.test(orchestrator), "Decision/narrative flow mist simulation_results.");
  assert(/historical_patterns/.test(orchestrator), "Decision/narrative flow mist historical_patterns.");

  console.log("cyntra stability regression passed");
}

main();
