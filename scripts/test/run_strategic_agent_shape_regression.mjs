#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(repoRoot, relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

function main() {
  const repoRoot = process.cwd();

  const orchestrator = read(repoRoot, "src/aurelius/agent/runCyntraStrategicAgent.ts");
  const decisionLayer = read(repoRoot, "src/aurelius/agent/StrategicDecisionLayer.ts");
  const mechanismLayer = read(repoRoot, "src/aurelius/agent/StrategicMechanismLayer.ts");
  const insightLayer = read(repoRoot, "src/aurelius/agent/StrategicInsightLayer.ts");
  const simEngine = read(repoRoot, "src/aurelius/simulation/StrategicSimulationEngine.ts");
  const simModel = read(repoRoot, "src/aurelius/simulation/StrategicScenarioModel.ts");
  const impactCalc = read(repoRoot, "src/aurelius/simulation/StrategicImpactCalculator.ts");
  const memoryStore = read(repoRoot, "src/aurelius/intelligence/StrategicMemoryStore.ts");
  const memoryRetriever = read(repoRoot, "src/aurelius/intelligence/StrategicMemoryRetriever.ts");
  const patternEngine = read(repoRoot, "src/aurelius/intelligence/StrategicPatternEngine.ts");
  const datasetSchema = read(repoRoot, "src/aurelius/data/StrategicDataSchema.ts");
  const caseRepository = read(repoRoot, "src/aurelius/data/StrategicCaseRepository.ts");
  const datasetManager = read(repoRoot, "src/aurelius/data/StrategicDatasetManager.ts");
  const trackingEngine = read(repoRoot, "src/aurelius/data/InterventionTrackingEngine.ts");
  const outcomeLearning = read(repoRoot, "src/aurelius/data/OutcomeLearningEngine.ts");
  const sectorEngine = read(repoRoot, "src/aurelius/os/SectorIntelligenceEngine.ts");
  const modelEngine = read(repoRoot, "src/aurelius/os/StrategicModelEngine.ts");
  const outcomeEngine = read(repoRoot, "src/aurelius/os/InterventionOutcomeEngine.ts");
  const knowledgeGraph = read(repoRoot, "src/aurelius/os/StrategicKnowledgeGraph.ts");
  const portfolioAnalyzer = read(repoRoot, "src/aurelius/os/OrganizationPortfolioAnalyzer.ts");

  assert(/Context Layer/i.test(orchestrator), "Orchestrator mist Context Layer integratie.");
  assert(/DIAGNOSIS LAYER/i.test(orchestrator), "Orchestrator mist Diagnosis Layer integratie.");
  assert(/MECHANISM LAYER/i.test(orchestrator), "Orchestrator mist Mechanism Layer integratie.");
  assert(/STRATEGIC INSIGHT LAYER/i.test(orchestrator), "Orchestrator mist Strategic Insight Layer integratie.");
  assert(/DECISION LAYER/i.test(orchestrator), "Orchestrator mist Decision Layer integratie.");

  assert(/StrategicSimulationEngine/.test(orchestrator), "Orchestrator mist Strategic Simulation Engine.");
  assert(/simulation_results/.test(orchestrator), "Orchestrator expose't simulation_results niet.");
  assert(/StrategicMemoryStore/.test(orchestrator), "Orchestrator mist StrategicMemoryStore.");
  assert(/StrategicMemoryRetriever/.test(orchestrator), "Orchestrator mist StrategicMemoryRetriever.");
  assert(/StrategicPatternEngine/.test(orchestrator), "Orchestrator mist StrategicPatternEngine.");
  assert(/SectorIntelligenceEngine/.test(orchestrator), "Orchestrator mist SectorIntelligenceEngine.");
  assert(/StrategicModelEngine/.test(orchestrator), "Orchestrator mist StrategicModelEngine.");
  assert(/InterventionOutcomeEngine/.test(orchestrator), "Orchestrator mist InterventionOutcomeEngine.");
  assert(/StrategicKnowledgeGraph/.test(orchestrator), "Orchestrator mist StrategicKnowledgeGraph.");
  assert(/OrganizationPortfolioAnalyzer/.test(orchestrator), "Orchestrator mist OrganizationPortfolioAnalyzer.");
  assert(
    /HISTORISCHE PATROONANALYSE/.test(patternEngine),
    "Pattern engine mist historische patroonanalyse output."
  );
  assert(/SECTORINTELLIGENTIE/.test(orchestrator), "Narrative context mist sectorintelligentie output.");
  assert(/HISTORISCHE CASES/.test(orchestrator), "Narrative context mist historische cases output.");
  assert(/StrategicDatasetManager/.test(orchestrator), "Orchestrator mist StrategicDatasetManager.");

  assert(/simulation_results\?/.test(decisionLayer), "Decision Layer mist simulation_results veld.");
  assert(/historical_patterns\?/.test(decisionLayer), "Decision Layer mist historical_patterns veld.");
  assert(/attachSimulationAndPatterns/.test(decisionLayer), "Decision Layer mist attachSimulationAndPatterns helper.");

  assert(/root_cause/.test(mechanismLayer), "Mechanism Layer mist root_cause output.");
  assert(/leverage_point/.test(mechanismLayer), "Mechanism Layer mist leverage_point output.");

  assert(/strategic_pattern/.test(insightLayer), "Insight Layer mist strategic_pattern output.");
  assert(/recommended_focus/.test(insightLayer), "Insight Layer mist recommended_focus output.");

  assert(/scenario_A/.test(simEngine), "Simulation engine mist scenario_A output.");
  assert(/scenario_B/.test(simEngine), "Simulation engine mist scenario_B output.");
  assert(/scenario_C/.test(simEngine), "Simulation engine mist scenario_C output.");
  assert(/status_quo/i.test(simModel), "Scenario model mist status_quo scenario.");
  assert(/kernconsolidatie/i.test(simModel), "Scenario model mist kernconsolidatie scenario.");
  assert(/gefaseerde strategie/i.test(simModel), "Scenario model mist gefaseerde strategie scenario.");

  assert(/marge_delta/.test(impactCalc), "Impact calculator mist marge_delta.");
  assert(/cash_delta/.test(impactCalc), "Impact calculator mist cash_delta.");
  assert(/fte_change/.test(impactCalc), "Impact calculator mist fte_change.");
  assert(/execution_risk/.test(impactCalc), "Impact calculator mist execution_risk.");

  assert(/strategic_case_store/.test(memoryStore), "StrategicMemoryStore mist strategic_case opslag.");
  assert(/strategic_case_embeddings/.test(memoryStore), "StrategicMemoryStore mist embedding-opslag.");
  assert(/retrieveSimilarCases/.test(memoryRetriever), "StrategicMemoryRetriever mist retrieval-functie.");
  assert(/detectPatterns/.test(patternEngine), "StrategicPatternEngine mist pattern detectie.");
  assert(/sector_patterns/.test(sectorEngine), "SectorIntelligenceEngine mist sector_patterns output.");
  assert(/strategic_model/.test(modelEngine), "StrategicModelEngine mist strategic_model output.");
  assert(/intervention_success_patterns/.test(outcomeEngine), "InterventionOutcomeEngine mist outcome patterns.");
  assert(/nodes/.test(knowledgeGraph) && /edges/.test(knowledgeGraph), "Knowledge graph mist nodes/edges.");
  assert(/portfolio_patterns/.test(portfolioAnalyzer), "Portfolio analyzer mist portfolio_patterns.");
  assert(/case_id/.test(datasetSchema), "StrategicDataSchema mist case_id.");
  assert(/intervention_id/.test(datasetSchema), "StrategicDataSchema mist intervention_id.");
  assert(/outcome_id/.test(datasetSchema), "StrategicDataSchema mist outcome_id.");
  assert(/upsertCase/.test(caseRepository), "StrategicCaseRepository mist case opslag.");
  assert(/findSimilarCases/.test(caseRepository), "StrategicCaseRepository mist similar-case retrieval.");
  assert(/ingestAnalysis/.test(datasetManager), "StrategicDatasetManager mist ingestAnalysis.");
  assert(/extract\(/.test(trackingEngine), "InterventionTrackingEngine mist extract.");
  assert(/intervention_success_patterns/.test(outcomeLearning), "OutcomeLearningEngine mist learning-output.");

  console.log("strategic agent shape regression checks passed");
}

main();
