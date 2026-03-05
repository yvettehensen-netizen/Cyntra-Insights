import { ExecutiveGateError } from "@/aurelius/executive/types";
import { firstContentLine, parseSections } from "./utils";

const PREFIX = "De Raad van Bestuur committeert zich aan:";

const REQUIRED_LABELS = [
  "Keuze:",
  "Expliciet verlies:",
  "Besluitrecht ligt bij:",
  "Stoppen per direct:",
  "Niet meer escaleren:",
  "Maandelijkse KPI:",
  "Failure trigger:",
  "Point of no return:",
  "Herijkingsmoment:",
] as const;

export function validateDecisionContractGates(text: string): void {
  const section9 = parseSections(text).find((section) => section.number === 9)?.body ?? "";

  if (firstContentLine(section9) !== PREFIX) {
    throw new ExecutiveGateError(
      "Decision contract startzin is niet exact.",
      "DECISION_CONTRACT_REQUIRED",
      undefined,
      "Start sectie 9 exact met: De Raad van Bestuur committeert zich aan:"
    );
  }

  const missingOrEmpty: string[] = [];
  for (const label of REQUIRED_LABELS) {
    const match = section9.match(new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(.*)`, "i"));
    const value = String(match?.[1] ?? "").trim();
    if (!value) missingOrEmpty.push(label);
  }

  if (missingOrEmpty.length >= 2) {
    throw new ExecutiveGateError(
      "Decision contract mist labels of waarden.",
      "DECISION_CONTRACT_REQUIRED",
      { missingOrEmpty },
      "Vul alle contractlabels met concrete, casusgebonden inhoud."
    );
  }

  if (!/\b(onomkeerbaar|irreversibel|point of no return)\b/i.test(section9)) {
    throw new ExecutiveGateError(
      "Irreversibiliteit ontbreekt in decision contract.",
      "IRREVERSIBILITY_REQUIRED",
      undefined,
      "Neem een expliciete point-of-no-return op in sectie 9 met trigger en consequentie."
    );
  }
}
