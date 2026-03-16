import {
  StrategicMechanismEngine,
  type StrategicMechanism,
} from "@/aurelius/engine/nodes/strategy/StrategicMechanismEngine";

export type StrategicDiagnosisState = {
  dominant_problem: string;
  financial_pressure: string;
  organizational_constraints: string;
  market_constraints: string;
  governance_constraints: string;
};

export type StrategicMechanismRecord = {
  symptom: string;
  mechanism: string;
  root_cause: string;
  leverage_point: string;
};

export type StrategicMechanismLayerInput = {
  contextText: string;
  diagnosis: StrategicDiagnosisState;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function inferLeveragePoint(item: StrategicMechanism): string {
  const source = `${item.mechanism} ${item.structural_cause}`.toLowerCase();
  if (/(contract|plafond|tarief|verzekeraar|kostprijs)/.test(source)) {
    return "Contractvloer en plafondrouting per verzekeraar";
  }
  if (/(capaciteit|planning|productiviteit|casemix|werkdruk)/.test(source)) {
    return "Capaciteitssturing met normritme en no-show-correctie";
  }
  if (/(mandaat|governance|escalatie|besluit)/.test(source)) {
    return "Bindend besluitrecht met escalatieritme";
  }
  return "Gefaseerde prioritering met stop-doing discipline";
}

function fallbackMechanisms(diagnosis: StrategicDiagnosisState): StrategicMechanismRecord[] {
  return [
    {
      symptom: "Marge daalt onder operationele druk",
      mechanism: diagnosis.financial_pressure,
      root_cause: "Verdienmodel en contractstructuur sluiten niet aan op kostenontwikkeling",
      leverage_point: "Contractvloer en productmargevalidatie",
    },
    {
      symptom: "Capaciteit raakt versnipperd",
      mechanism: diagnosis.organizational_constraints,
      root_cause: "Parallelle prioriteiten zonder harde volgorde",
      leverage_point: "Centrale prioritering en stop-doing",
    },
    {
      symptom: "Besluiten vertragen in uitvoering",
      mechanism: diagnosis.governance_constraints,
      root_cause: "Onvoldoende mandaathelderheid en escalatiediscipline",
      leverage_point: "Formeel besluitcontract met 30/60/90-gates",
    },
  ];
}

export class StrategicMechanismLayer {
  readonly name = "Strategic Mechanism Layer";

  private readonly engine = new StrategicMechanismEngine();

  run(input: StrategicMechanismLayerInput): StrategicMechanismRecord[] {
    const diagnosisText = [
      input.diagnosis.dominant_problem,
      input.diagnosis.financial_pressure,
      input.diagnosis.organizational_constraints,
      input.diagnosis.market_constraints,
      input.diagnosis.governance_constraints,
    ]
      .filter(Boolean)
      .join(" ");

    const analyzed = this.engine.analyze({
      contextText: normalize(input.contextText),
      diagnosisText: normalize(diagnosisText),
    });

    const mapped = analyzed.map((item) => ({
      symptom: normalize(item.symptom),
      mechanism: normalize(item.mechanism),
      root_cause: normalize(item.structural_cause),
      leverage_point: inferLeveragePoint(item),
    }));

    const records = mapped.length >= 3 ? mapped.slice(0, 6) : fallbackMechanisms(input.diagnosis);
    return records;
  }
}
