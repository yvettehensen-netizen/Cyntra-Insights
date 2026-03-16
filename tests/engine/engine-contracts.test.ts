import assert from "node:assert/strict";
import { StrategicMechanismEngine } from "../../src/aurelius/engine/nodes/strategy/StrategicMechanismEngine";
import { StrategicInsightEngine } from "../../src/aurelius/engine/nodes/strategy/StrategicInsightEngine";
import { DecisionPressureEngine } from "../../src/aurelius/engine/nodes/strategy/DecisionPressureEngine";
import { SectorPatternEngine } from "../../src/aurelius/network/SectorPatternEngine";
import { BenchmarkEngine } from "../../src/aurelius/network/BenchmarkEngine";
import { StrategicSignalEngine } from "../../src/aurelius/network/StrategicSignalEngine";

function assertEngineResult(result: any) {
  assert(Array.isArray(result.insights), "insights must be array");
  assert(Array.isArray(result.risks), "risks must be array");
  assert(Array.isArray(result.opportunities), "opportunities must be array");
  assert(Array.isArray(result.recommendations), "recommendations must be array");
  assert(Number.isFinite(result.confidence), "confidence must be finite");
  assert(result.confidence >= 0 && result.confidence <= 1, "confidence must be [0,1]");
}

export async function run() {
  const mechanismEngine = new StrategicMechanismEngine();
  const mechanisms = mechanismEngine.analyze({
    contextText:
      "Contractplafond, tariefdruk en capaciteitsproblemen veroorzaken margedruk en besluituitstel.",
    diagnosisText: "Parallelle prioriteiten en beperkte sturing.",
  });
  const mechanismStd = mechanismEngine.analyzeStandard({
    contextText:
      "Contractplafond, tariefdruk en capaciteitsproblemen veroorzaken margedruk en besluituitstel.",
    diagnosisText: "Parallelle prioriteiten en beperkte sturing.",
  });
  assert(mechanisms.length > 0, "mechanisms should be non-empty");
  assertEngineResult(mechanismStd);

  const insightEngine = new StrategicInsightEngine();
  const insights = insightEngine.analyze({ mechanisms });
  const insightStd = insightEngine.analyzeStandard({ mechanisms });
  assert(insights.length > 0, "insights should be non-empty");
  assertEngineResult(insightStd);

  const decisionEngine = new DecisionPressureEngine();
  const decisionStd = decisionEngine.analyzeStandard({
    contextText:
      "Strategische druk vraagt keuze tussen consolideren en verbreden.",
    diagnosisText: "Marge en capaciteit staan onder druk.",
    mechanisms,
    insights,
  });
  assertEngineResult(decisionStd);

  const records = [
    {
      dataset_id: "d1",
      sector: "Zorg/GGZ",
      probleemtype: "financiele druk",
      mechanismen: ["tariefdruk", "contractplafond"],
      interventies: ["contractheronderhandeling", "capaciteitsherstructurering"],
      outcomes: [],
      created_at: new Date().toISOString(),
    },
    {
      dataset_id: "d2",
      sector: "Zorg/GGZ",
      probleemtype: "capaciteitsprobleem",
      mechanismen: ["werkdruk", "planning"],
      interventies: ["capaciteitsherstructurering"],
      outcomes: [],
      created_at: new Date().toISOString(),
    },
  ];

  const sectorStd = new SectorPatternEngine().analyzeStandard(records, "Zorg/GGZ");
  assertEngineResult(sectorStd);

  const benchmarkStd = new BenchmarkEngine().analyzeStandard(records, "Zorg/GGZ");
  assertEngineResult(benchmarkStd);

  const signalStd = new StrategicSignalEngine().analyzeStandard(records);
  assertEngineResult(signalStd);
}

