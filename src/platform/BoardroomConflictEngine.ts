import { normalize } from "./storage";
import type { CaseClassification } from "./StrategicMechanismExtractor";

export type StrategicMode = "FIX" | "PROTECT" | "SCALE" | "TRANSFORM";

export type BoardroomConflict = {
  conflictStatement: string;
  sideA: string;
  sideB: string;
  forcingChoice: string;
  explicitLoss: string;
};

type StrategicMechanisms = {
  successMechanism: string;
  riskMechanism: string;
  scaleMechanism: string;
};

export function inferBoardroomConflict(
  rawInput: string,
  classification: CaseClassification,
  mode: StrategicMode,
  mechanisms: StrategicMechanisms
): BoardroomConflict {
  const text = normalize(rawInput).toLowerCase();

  if (classification === "SUCCESS_MODEL") {
    const hasGrowthCap = /(maximaal 5 fte|niet harder dan 5 fte)/i.test(text);
    return {
      conflictStatement:
        "De organisatie moet kiezen tussen impactgroei en behoud van het eigenaarschapsmechanisme dat de huidige prestaties draagt.",
      sideA: hasGrowthCap
        ? "Impact vergroten via gecontroleerde of netwerkgedreven schaal."
        : "Impact vergroten via schaal, replicatie of partnerschappen.",
      sideB: "Cultuur, autonomie en mede-eigenaarschap beschermen als kern van kwaliteit en retentie.",
      forcingChoice:
        mode === "SCALE"
          ? "Kies voor schaal via netwerk/cellen, maar alleen met harde guardrails op eigenaarschap en kwaliteitsdiscipline."
          : "Kies voor protect-modus: borg eerst het mechanisme en schaal daarna alleen binnen vooraf vastgestelde grenzen.",
      explicitLoss:
        "Snelle volumegroei zonder guardrails wordt gepauzeerd om erosie van cultuur en eigenaarschap te voorkomen.",
    };
  }

  if (classification === "CRISIS") {
    return {
      conflictStatement:
        "De organisatie kan niet tegelijk stabiliseren, uitbreiden en kwaliteit verhogen zonder directe prioritering.",
      sideA: "Acute stabilisatie van marge, contractruimte en uitvoerbaarheid.",
      sideB: "Parallelle groei-initiatieven en niet-kritische verbreding.",
      forcingChoice: "Kies nu voor fix-modus met harde stop-doing keuzes en ritmische governance.",
      explicitLoss:
        "Expliciet verlies: minimaal één niet-kerninitiatief wordt tijdelijk gestopt om kernstabilisatie te realiseren.",
    };
  }

  return {
    conflictStatement:
      "De organisatie balanceert tussen operationele continuïteit en strategische vernieuwing onder beperkte bestuurlijke aandacht.",
    sideA: "Operationele voorspelbaarheid en risicobeheersing.",
    sideB: "Strategische vernieuwing en groeibeweging.",
    forcingChoice: "Kies één dominant spoor per kwartaal en stel expliciete stopcriteria vast.",
    explicitLoss: `Expliciet verlies: ${mechanisms.riskMechanism}`,
  };
}
