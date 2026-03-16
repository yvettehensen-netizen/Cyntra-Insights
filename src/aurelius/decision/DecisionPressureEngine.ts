import type { DecisionTradeoff } from "./DecisionTradeoffAnalyzer";

export type DecisionPressureInput = {
  tradeoffs: DecisionTradeoff[];
  causalText: string;
  hypothesisText: string;
  memoryText: string;
  graphText: string;
};

export type DecisionPressureResult = {
  preferredOptionCode: "A" | "B" | "C";
  preferredOptionReason: string;
  solvedProblem: string;
  block: string;
};

function scoreOption(optionCode: "A" | "B" | "C", source: string): number {
  const s = source.toLowerCase();
  const financialPressure =
    /(marge|tarief|kostprijs|contract|plafond|verlies|liquiditeit)/i.test(s) ? 2 : 0;
  const executionPressure =
    /(mandaat|uitstel|governance|onderstroom|capaciteit|werkdruk)/i.test(s) ? 2 : 0;
  const growthSignal = /(groei|verbreding|nieuwe diensten|expansie)/i.test(s) ? 1 : 0;

  if (optionCode === "A") return 3 + financialPressure + Math.max(0, executionPressure - 1);
  if (optionCode === "B") return 1 + growthSignal - financialPressure;
  return 2 + executionPressure + Math.max(0, financialPressure - 1);
}

export function buildDecisionPressure(
  input: DecisionPressureInput
): DecisionPressureResult {
  const source = [
    input.causalText,
    input.hypothesisText,
    input.memoryText,
    input.graphText,
  ]
    .filter(Boolean)
    .join("\n\n");

  const scored = input.tradeoffs
    .map((tradeoff) => ({
      tradeoff,
      score: scoreOption(tradeoff.option.code, source),
    }))
    .sort((a, b) => b.score - a.score);

  const preferred = scored[0]?.tradeoff ?? input.tradeoffs[0];
  const preferredCode = preferred.option.code;

  const optionsBlock = input.tradeoffs
    .map((t) =>
      [
        `OPTIE ${t.option.code}`,
        `BESCHRIJVING: ${t.option.strategicDirection}`,
        `VOORDELEN: ${t.advantages}`,
        `NADelen: ${t.disadvantages}`,
        `RISICO’S: ${t.risks}`,
        `IMPACT OP ORGANISATIE: ${t.impactOrganisation}`,
        `IMPACT OP KLANTEN: ${t.impactCustomers}`,
        `IMPACT OP FINANCIËN: ${t.impactFinancials}`,
      ].join("\n")
    )
    .join("\n\n");

  const preferredReason =
    preferredCode === "A"
      ? "Deze optie past het best bij hoge financiële en uitvoeringsdruk en herstelt bestuurlijke voorspelbaarheid."
      : preferredCode === "C"
        ? "Deze optie past het best bij dominante uitvoeringsfrictie en noodzaak tot harde herallocatie."
        : "Deze optie past bij lagere basisdruk en hogere strategische ruimte voor gecontroleerde expansie.";

  const noChoice = [
    "GEVOLGEN VAN GEEN KEUZE",
    "30 DAGEN: besluituitstel houdt parallelle agenda's in stand en vergroot coördinatieverlies.",
    "90 DAGEN: margedruk en capaciteitsfrictie worden structureel zichtbaar in planning en uitvoering.",
    "365 DAGEN: strategische bewegingsruimte krimpt, correctiekosten stijgen en noodmaatregelen worden waarschijnlijker.",
  ].join("\n");

  const block = [
    "STRATEGISCHE OPTIES",
    optionsBlock,
    "",
    "VOORKEURSOPTIE",
    `BESCHRIJVING: OPTIE ${preferred.option.code} — ${preferred.option.name}.`,
    `WAAROM DEZE KEUZE LOGISCH IS: ${preferredReason}`,
    `WELK PROBLEEM HIERMEE WORDT OPGELOST: ${preferred.option.solvesProblem}`,
    `WELKE CONSEQUENTIES DIT HEEFT: ${preferred.disadvantages} ${preferred.risks}`,
    "",
    "EXPLICIET VERLIES",
    `WAT WORDT OPGEEVEN: ${preferred.explicitGiveUp}`,
    `WELKE INITIATIEVEN STOPPEN: ${preferred.initiativesStopped}`,
    `WELKE GROEI WORDT UITGESTELD: ${preferred.growthDeferred}`,
    "",
    noChoice,
  ].join("\n");

  return {
    preferredOptionCode: preferred.option.code,
    preferredOptionReason: preferredReason,
    solvedProblem: preferred.option.solvesProblem,
    block,
  };
}
