import assert from "node:assert/strict";
import { StrategicSignalEngine } from "../../src/aurelius/network/StrategicSignalEngine";
import { StrategicRelationshipEngine } from "../../src/aurelius/knowledge/StrategicRelationshipEngine";
import { StrategicInsightGraphQuery } from "../../src/aurelius/knowledge/StrategicInsightGraphQuery";

function nowMs() {
  return Date.now();
}

function makeDataset(size: number) {
  return Array.from({ length: size }).map((_, index) => ({
    dataset_id: `d-${index}`,
    sector: index % 2 === 0 ? "Zorg/GGZ" : "Industrie",
    probleemtype: index % 3 === 0 ? "financiele druk" : "capaciteitsprobleem",
    mechanismen: ["margedruk", "planning"],
    interventies: ["contractheronderhandeling", "capaciteitsherstructurering"],
    outcomes: [],
    created_at: new Date().toISOString(),
  }));
}

export async function run() {
  const records = makeDataset(2000);

  const signalStart = nowMs();
  const signals = new StrategicSignalEngine().detect(records);
  const signalElapsed = nowMs() - signalStart;
  assert(signals.length > 0, "signal detection should return signals");
  assert(signalElapsed < 1200, `signal detection too slow: ${signalElapsed}ms`);

  const rel = new StrategicRelationshipEngine();
  const cases = records.slice(0, 300).map((item, idx) => ({
    case_id: `case-${idx}`,
    organisation_name: `Org ${idx}`,
    sector: item.sector,
    probleemtype: item.probleemtype,
    dominante_these: "these",
    gekozen_strategie: "consolideren",
    interventie: "contractheronderhandeling",
    resultaat: "Analyse voltooid.",
    created_at: item.created_at,
  }));
  const interventions = records.slice(0, 500).map((item, idx) => ({
    intervention_id: `i-${idx}`,
    sector: item.sector,
    probleemtype: item.probleemtype,
    interventie: "contractheronderhandeling",
    impact: "impact",
    risico: "risico",
    succes_score: 0.7,
    created_at: item.created_at,
  }));

  const relationStart = nowMs();
  const connected = rel.connect({
    records: records.map((item, idx) => ({
      record_id: `r-${idx}`,
      session_id: `s-${idx}`,
      sector: item.sector,
      probleemtype: item.probleemtype,
      mechanismen: item.mechanismen,
      interventies: item.interventies,
      strategische_opties: ["consolideren"],
      gekozen_strategie: "consolideren",
      created_at: item.created_at,
    })),
    cases,
    interventions,
    signals: signals.map((s) => ({
      sector: "Multi-sector",
      signaal: s.type,
      impact: s.implicatie,
      urgentie: s.severity,
    })),
  });
  const relationElapsed = nowMs() - relationStart;
  assert(connected.patterns.length > 0, "relationship engine should produce patterns");
  assert(relationElapsed < 1800, `relationship engine too slow: ${relationElapsed}ms`);

  const query = new StrategicInsightGraphQuery();
  const queryStart = nowMs();
  const top = query.strategyForSector(connected.patterns, "Zorg/GGZ");
  const queryElapsed = nowMs() - queryStart;
  assert(Array.isArray(top), "query should return array");
  assert(queryElapsed < 500, `knowledge graph query too slow: ${queryElapsed}ms`);
}

