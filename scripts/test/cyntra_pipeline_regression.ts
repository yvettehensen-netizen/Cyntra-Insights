const fs = require("node:fs");
const path = require("node:path");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(repoRoot, relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

function assertInOrder(source, markers) {
  let last = -1;
  for (const marker of markers) {
    const idx = source.indexOf(marker);
    assert(idx >= 0, `Marker ontbreekt: ${marker}`);
    assert(idx > last, `Marker niet in juiste volgorde: ${marker}`);
    last = idx;
  }
}

function main() {
  const repoRoot = process.cwd();

  const orchestrator = read(repoRoot, "src/aurelius/agent/runCyntraStrategicAgent.ts");
  const contracts = read(repoRoot, "src/aurelius/contracts/EngineContracts.ts");
  const contractGuard = read(repoRoot, "src/aurelius/stability/EngineContractGuard.ts");
  const narrativeStructure = read(repoRoot, "src/aurelius/narrative/BoardNarrativeStructure.ts");
  const narrativeGuard = read(repoRoot, "src/aurelius/narrative/NarrativeStructureGuard.ts");

  // Test 1: engine execution order
  assertInOrder(orchestrator, [
    'executionGuard.record("Context Layer")',
    'executionGuard.record("Diagnosis Layer")',
    'executionGuard.record("Contradiction Engine")',
    'executionGuard.record("Mechanism Engine")',
    'executionGuard.record("Strategic Insight Engine")',
    'executionGuard.record("Strategic Pattern Engine")',
    'executionGuard.record("Strategic Leverage Engine")',
    'executionGuard.record("Strategic Simulation Engine")',
    'executionGuard.record("Decision Engine")',
    'executionGuard.record("Strategic OS Layer")',
    'executionGuard.record("Narrative Layer")',
  ]);

  // Test 2: narrative sections exist
  const requiredSections = [
    "1. Besluitvraag",
    "2. Executive Thesis",
    "3. Feitenbasis",
    "4. Strategische opties",
    "5. Aanbevolen keuze",
    "6. Niet-onderhandelbare besluitregels",
    "7. 90-dagen interventieplan",
    "8. KPI monitoring",
    "9. Besluittekst",
  ];
  for (const section of requiredSections) {
    assert(
      narrativeStructure.includes(section),
      `BoardNarrativeStructure mist sectie: ${section}`
    );
  }
  assert(
    /Placeholder toegevoegd/.test(narrativeGuard),
    "NarrativeStructureGuard mist placeholder-gedrag"
  );

  // Test 3: decision structure
  assert(/dominant_thesis/.test(orchestrator), "Decision mist dominant_thesis");
  assert(/strategic_options/.test(orchestrator), "Decision mist strategic_options");
  assert(/recommended_option/.test(orchestrator), "Decision mist recommended_option");
  assert(/price_of_delay/.test(orchestrator), "Decision mist price_of_delay");

  // Test 4: simulation structure
  assert(/scenario_A/.test(orchestrator), "Simulation mist scenario_A");
  assert(/scenario_B/.test(orchestrator), "Simulation mist scenario_B");
  assert(/scenario_C/.test(orchestrator), "Simulation mist scenario_C");
  assert(/strategic_os/.test(orchestrator), "OS layer mist strategic_os output");
  assert(/SECTORINTELLIGENTIE/.test(orchestrator), "Narrative mist sectorintelligentie-sectie");
  assert(/HISTORISCHE CASES/.test(orchestrator), "Narrative mist historische-cases-sectie");
  assert(/StrategicDatasetManager/.test(orchestrator), "Dataset manager niet geïntegreerd in agent");

  // Contract infrastructure
  assert(/ContextContract/.test(contracts), "EngineContracts mist ContextContract");
  assert(/LeverageContract/.test(contracts), "EngineContracts mist LeverageContract");
  assert(/NarrativeContract/.test(contracts), "EngineContracts mist NarrativeContract");
  assert(/runEngineContractGuard/.test(contractGuard), "EngineContractGuard ontbreekt");

  console.log("cyntra pipeline regression passed");
}

main();
