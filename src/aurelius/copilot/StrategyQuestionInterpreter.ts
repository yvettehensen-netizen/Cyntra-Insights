export type StrategyIntent =
  | "uitbreiden"
  | "consolideren"
  | "investeren"
  | "kostenoptimalisatie"
  | "herstructureren"
  | "onbekend";

export type TimeHorizon = "kort" | "middellang" | "lang";

export interface InterpretedStrategyQuestion {
  original_question: string;
  strategy: StrategyIntent;
  sector?: string;
  risk_focus: string[];
  time_horizon: TimeHorizon;
}

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function detectStrategy(question: string): StrategyIntent {
  const q = question.toLowerCase();
  if (/(uitbreid|opschal|groei|verbreed)/.test(q)) return "uitbreiden";
  if (/(consolide|stabiliseer|focus|kern)/.test(q)) return "consolideren";
  if (/(investeer|investering|capex|r&d|innov)/.test(q)) return "investeren";
  if (/(kosten|efficien|marge|bespaar|lean)/.test(q)) return "kostenoptimalisatie";
  if (/(herstruct|reorgan|reorganisatie|portfolio)/.test(q)) return "herstructureren";
  return "onbekend";
}

function detectTimeHorizon(question: string): TimeHorizon {
  const q = question.toLowerCase();
  if (/(deze maand|30 dagen|kwartaal|kort)/.test(q)) return "kort";
  if (/(6 maanden|12 maanden|dit jaar|middellang)/.test(q)) return "middellang";
  if (/(2 jaar|3 jaar|lang|lange termijn)/.test(q)) return "lang";
  return "middellang";
}

function detectRiskFocus(question: string): string[] {
  const q = question.toLowerCase();
  const risks: string[] = [];
  if (/(cash|liquiditeit|marge|tarief|kostprijs|financ)/.test(q)) risks.push("financieel");
  if (/(capaciteit|werkdruk|wachtlijst|productiviteit|planning)/.test(q)) risks.push("operationeel");
  if (/(contract|verzekeraar|plafond|regelgeving|compliance)/.test(q)) risks.push("contractueel");
  if (/(cultuur|draagvlak|mandaat|governance|besluit)/.test(q)) risks.push("bestuurlijk");
  if (!risks.length) risks.push("strategisch");
  return risks;
}

export class StrategyQuestionInterpreter {
  readonly name = "Strategy Question Interpreter";

  interpret(question: string, sector?: string): InterpretedStrategyQuestion {
    const normalizedQuestion = normalize(question);
    return {
      original_question: normalizedQuestion,
      strategy: detectStrategy(normalizedQuestion),
      sector: normalize(sector) || undefined,
      risk_focus: detectRiskFocus(normalizedQuestion),
      time_horizon: detectTimeHorizon(normalizedQuestion),
    };
  }
}
