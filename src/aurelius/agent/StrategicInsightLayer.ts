import {
  StrategicInsightEngine,
  type StrategicInsight,
} from "@/aurelius/engine/nodes/strategy/StrategicInsightEngine";
import type { StrategicMechanismRecord, StrategicDiagnosisState } from "./StrategicMechanismLayer";

export type StrategicInsightRecord = {
  strategic_pattern: string;
  implication: string;
  recommended_focus: string;
};

export type StrategicInsightLayerInput = {
  mechanisms: StrategicMechanismRecord[];
  diagnosis: StrategicDiagnosisState;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toEngineMechanism(mechanism: StrategicMechanismRecord) {
  return {
    symptom: normalize(mechanism.symptom),
    mechanism: normalize(mechanism.mechanism),
    structural_cause: normalize(mechanism.root_cause),
    system_effect: normalize(mechanism.mechanism),
  };
}

function mapInsight(record: StrategicInsight): StrategicInsightRecord {
  return {
    strategic_pattern: normalize(record.insight),
    implication: normalize(record.implication),
    recommended_focus: normalize(record.strategic_lever),
  };
}

function fallbackInsights(input: StrategicInsightLayerInput): StrategicInsightRecord[] {
  return [
    {
      strategic_pattern: "Contractplafonds en tariefdruk begrenzen schaalbaarheid",
      implication: input.diagnosis.market_constraints,
      recommended_focus: "Eerst margeherstel en contractdiscipline, daarna gecontroleerde verbreding",
    },
    {
      strategic_pattern: "Parallelle ambities zonder volgorde vergroten uitvoeringsverlies",
      implication: input.diagnosis.organizational_constraints,
      recommended_focus: "Portfolio-volgorde afdwingen met expliciete stopregels",
    },
    {
      strategic_pattern: "Governancefrictie vertaalt zich direct naar besluitvertraging",
      implication: input.diagnosis.governance_constraints,
      recommended_focus: "Mandaat en escalatiepad formaliseren op 30/60/90 dagen",
    },
  ];
}

export class StrategicInsightLayer {
  readonly name = "Strategic Insight Layer";

  private readonly engine = new StrategicInsightEngine();

  run(input: StrategicInsightLayerInput): StrategicInsightRecord[] {
    const engineInput = {
      mechanisms: input.mechanisms.map(toEngineMechanism),
    };

    const insights = this.engine.analyze(engineInput).map(mapInsight);
    if (insights.length >= 3) {
      return insights.slice(0, 6);
    }

    return fallbackInsights(input);
  }
}
