export type StrategicDecisionOption = {
  code: "A" | "B" | "C";
  name: string;
  strategicDirection: string;
  solvesProblem: string;
  createsRisks: string;
};

export type DecisionOptionGeneratorInput = {
  contextText: string;
  causalText: string;
  hypothesisText: string;
};

function hasAny(text: string, terms: string[]): boolean {
  const source = String(text ?? "").toLowerCase();
  return terms.some((term) => source.includes(term.toLowerCase()));
}

export function generateDecisionOptions(
  input: DecisionOptionGeneratorInput
): StrategicDecisionOption[] {
  const source = [input.contextText, input.causalText, input.hypothesisText]
    .filter(Boolean)
    .join("\n\n");

  const highFinancialPressure = hasAny(source, [
    "marge",
    "kostprijs",
    "tarief",
    "contract",
    "plafond",
    "verlies",
  ]);
  const highExecutionPressure = hasAny(source, [
    "mandaat",
    "uitstel",
    "onderstroom",
    "governance",
    "conflict",
    "capaciteit",
  ]);

  const optionA: StrategicDecisionOption = {
    code: "A",
    name: "Consolidatie kernactiviteiten",
    strategicDirection:
      "Focus op stabilisatie van kernzorg, margeherstel en executiediscipline.",
    solvesProblem:
      "Vermindert directe financiële druk en herstelt bestuurlijke voorspelbaarheid.",
    createsRisks:
      "Vertraagt korte-termijngroei en beperkt ruimte voor nieuwe initiatieven.",
  };

  const optionB: StrategicDecisionOption = {
    code: "B",
    name: "Verbreding nieuwe diensten",
    strategicDirection:
      "Versneld ontwikkelen van aanvullende diensten voor extra omzet en risicospreiding.",
    solvesProblem:
      "Vergroot strategische optionaliteit en vermindert afhankelijkheid van één inkomstenstroom.",
    createsRisks:
      "Verhoogt managementbelasting, complexiteit en liquiditeitsdruk bij zwakke basis.",
  };

  const optionC: StrategicDecisionOption = {
    code: "C",
    name: "Kostenreductie en herstructurering",
    strategicDirection:
      "Herontwerp van kostenbasis, capaciteit en governance met harde prioritering.",
    solvesProblem:
      "Doorbreekt structurele inefficiëntie en verlaagt financiële kwetsbaarheid.",
    createsRisks:
      "Kan cultuurspanning en tijdelijke kwaliteitsdruk veroorzaken bij te harde implementatie.",
  };

  if (highFinancialPressure && !highExecutionPressure) {
    return [optionA, optionC, optionB];
  }
  if (highExecutionPressure && !highFinancialPressure) {
    return [optionC, optionA, optionB];
  }
  return [optionA, optionB, optionC];
}
