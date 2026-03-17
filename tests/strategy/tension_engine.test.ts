import assert from "node:assert/strict";
import { runTensionEngineNode } from "@/aurelius/engine/nodes/strategy/TensionEngineNode";
import { runScenarioEngineNode } from "@/aurelius/engine/nodes/strategy/ScenarioEngineNode";
import { runDecisionEngineNode } from "@/aurelius/engine/nodes/strategy/DecisionEngineNode";
import { runGovernanceEngineNode } from "@/aurelius/engine/nodes/governance/GovernanceEngineNode";
import { runInstitutionalMemoryNode } from "@/aurelius/engine/nodes/memory/InstitutionalMemoryNode";

export function runTensionEngineTest(): void {
  const sourceText = `
Jeugdzorg ZIJN werkt voor circa 35 gemeenten met verschillende tarieven en regels.
Instroom loopt deels via consortium en Haarlem toegangspoort.
Reistijd, no-show en caseload bepalen de rendabiliteit.
Teams bestaan grotendeels uit vaste medewerkers; werkplezier is hoog en uitstroom laag.
Groei gebeurt voorzichtig via vaste teams en een flexibele schil.
`.trim();

  const tension = runTensionEngineNode({
    organizationName: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    sourceText,
  });

  assert(/portfolio breadth versus operational capacity/i.test(tension.structuralTension), "tension engine mist portfolio-capaciteitsspanning");
  assert(tension.detectedPatterns.some((item) => item.pattern === "portfolio imbalance"), "portfolio imbalance patroon ontbreekt");
  assert(tension.detectedPatterns.some((item) => item.pattern === "capacity constraint"), "capacity constraint patroon ontbreekt");

  const scenarios = runScenarioEngineNode({
    sector: "Jeugdzorg",
    sourceText,
    structuralTension: tension.structuralTension,
    coreProblem: tension.coreProblem,
    detectedPatterns: tension.detectedPatterns,
  });

  assert(scenarios.scenarios[0]?.title === "Gemeentenportfolio rationaliseren", "scenario A is niet portfolio-gericht");

  const decision = runDecisionEngineNode({
    sourceText,
    structuralTension: tension.structuralTension,
    mechanism: tension.mechanism,
    scenarios: scenarios.scenarios,
    detectedPatterns: tension.detectedPatterns,
  });

  assert(decision.recommendedScenario.code === "A", "dominante beslissing moet scenario A zijn");
  assert(/kern-|behoud-|uitstap/i.test(decision.recommendedDecision), "besluittekst mist portfoliokeuze");

  const governance = runGovernanceEngineNode({
    sector: "Jeugdzorg",
    sourceText,
    recommendedScenario: decision.recommendedScenario,
    recommendedDecision: decision.recommendedDecision,
    structuralTension: tension.structuralTension,
    detectedPatterns: tension.detectedPatterns,
  });

  assert(governance.stopRules.some((item) => /caseload structureel > 18/i.test(item)), "stopregel caseload ontbreekt");
  assert(governance.executionActions.some((item) => /gemeentenmatrix/i.test(item.action)), "gemeentenmatrix-actie ontbreekt");

  const memory = runInstitutionalMemoryNode({
    organizationName: "Jeugdzorg ZIJN",
    sector: "Jeugdzorg",
    coreProblem: tension.coreProblem,
    strategicTension: tension.structuralTension,
    recommendedDecision: decision.recommendedDecision,
    detectedPatterns: tension.detectedPatterns,
  });

  assert(memory.references.length >= 1, "institutional memory vindt geen referentie");
  assert(/youth-care-portfolio-capacity/i.test(memory.references[0].id), "institutional memory mist jeugdzorgpatroon");
}
