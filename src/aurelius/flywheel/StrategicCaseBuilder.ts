export type StrategicCaseBuilderInput = {
  board_report: string;
  decision_output?: Record<string, unknown> | null;
  mechanisms?: unknown[];
  insights?: unknown[];
  metadata?: {
    case_id?: string;
    organisatie_type?: string;
    sector?: string;
    organisatie_grootte?: string;
    verdienmodel?: string;
    analyse_datum?: string;
  };
};

export type StrategicCase = {
  case_id: string;
  organisatie_type: string;
  sector: string;
  organisatie_grootte: string;
  verdienmodel: string;
  dominant_problem: string;
  dominant_thesis: string;
  mechanisms: string[];
  strategic_options: string[];
  gekozen_strategie: string;
  interventieplan: string;
  analyse_datum: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    const text = normalize(value);
    if (text) return text;
  }
  return "";
}

function generateCaseId(dateIso: string): string {
  const stamp = dateIso.replace(/[^0-9]/g, "").slice(0, 8);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `case-${stamp}-${random}`;
}

function toTextArray(input: unknown[] | undefined): string[] {
  const values = (input ?? [])
    .map((item) => {
      if (typeof item === "string") return normalize(item);
      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        return firstNonEmpty(row.mechanism, row.insight, row.description, row.title, row.name);
      }
      return "";
    })
    .filter(Boolean);
  return values.slice(0, 12);
}

function inferStrategicOptions(decisionOutput: Record<string, unknown> | null | undefined): string[] {
  const raw = decisionOutput?.strategic_options;
  if (!Array.isArray(raw)) return [];
  const options = raw
    .map((item) => {
      if (typeof item === "string") return normalize(item);
      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const code = normalize(row.code);
        const desc = firstNonEmpty(row.description, row.name, row.strategicDirection);
        return normalize([code, desc].filter(Boolean).join(": "));
      }
      return "";
    })
    .filter(Boolean);
  return options.slice(0, 8);
}

function inferChosenStrategy(
  options: string[],
  decisionOutput: Record<string, unknown> | null | undefined
): string {
  const explicit = firstNonEmpty(
    decisionOutput?.gekozen_strategie,
    decisionOutput?.recommended_strategy,
    decisionOutput?.recommended_option
  );
  if (!explicit) return options[0] ?? "Strategie nog niet expliciet vastgelegd";

  const optionMatch = explicit.match(/^[ABC]$/i)?.[0]?.toUpperCase();
  if (!optionMatch) return explicit;

  const mapped = options.find((item) => item.toUpperCase().startsWith(`${optionMatch}:`));
  return mapped ?? explicit;
}

function inferDominantProblem(source: string, decisionOutput: Record<string, unknown> | null | undefined): string {
  const explicit = firstNonEmpty(decisionOutput?.dominant_problem, decisionOutput?.core_problem);
  if (explicit) return explicit;

  const low = source.toLowerCase();
  if (/contract|plafond|verzekeraar|tarief/.test(low)) return "Contractbeperking en tariefdruk blokkeren autonome groei";
  if (/capaciteit|wachtlijst|productiviteit|werkdruk/.test(low)) return "Capaciteitsprobleem door normdruk en uitvoeringsfrictie";
  if (/marge|liquiditeit|cash|kostprijs|loonkosten/.test(low)) return "Financiële druk door structurele margebelasting";
  if (/parallel|verbred|versnipper|prioritering/.test(low)) return "Strategische versnippering door parallelle agenda's";
  return "Dominant probleem niet expliciet gekwantificeerd in bronoutput";
}

function inferInterventieplan(
  boardReport: string,
  decisionOutput: Record<string, unknown> | null | undefined
): string {
  const explicit = firstNonEmpty(
    decisionOutput?.interventieplan,
    decisionOutput?.interventie_programma,
    decisionOutput?.intervention_plan
  );
  if (explicit) return explicit;

  const match = boardReport.match(/###\\s*10\\.[\\s\\S]*?(?=\\n###\\s*11\\.|$)/i);
  if (match?.[0]) return normalize(match[0]);
  return "Interventieplan ontbreekt in bron; handmatige validatie vereist.";
}

export class StrategicCaseBuilder {
  readonly name = "Strategic Case Builder";

  build(input: StrategicCaseBuilderInput): StrategicCase {
    const boardReport = normalize(input.board_report);
    const decisionOutput = input.decision_output ?? null;
    const today = new Date().toISOString().slice(0, 10);
    const analyseDatum = normalize(input.metadata?.analyse_datum) || today;
    const strategicOptions = inferStrategicOptions(decisionOutput);
    const mechanisms = toTextArray(input.mechanisms);
    const insightTexts = toTextArray(input.insights);

    return {
      case_id: normalize(input.metadata?.case_id) || generateCaseId(analyseDatum),
      organisatie_type: firstNonEmpty(input.metadata?.organisatie_type, "Onbekend organisatietype"),
      sector: firstNonEmpty(input.metadata?.sector, "Onbekende sector"),
      organisatie_grootte: firstNonEmpty(input.metadata?.organisatie_grootte, "Onbekende omvang"),
      verdienmodel: firstNonEmpty(input.metadata?.verdienmodel, "Onbekend verdienmodel"),
      dominant_problem: inferDominantProblem(boardReport, decisionOutput),
      dominant_thesis: firstNonEmpty(
        decisionOutput?.dominant_thesis,
        decisionOutput?.thesis,
        boardReport.split("\n")[0],
        "Dominante these niet expliciet beschikbaar"
      ),
      mechanisms: [...mechanisms, ...insightTexts].slice(0, 12),
      strategic_options: strategicOptions,
      gekozen_strategie: inferChosenStrategy(strategicOptions, decisionOutput),
      interventieplan: inferInterventieplan(boardReport, decisionOutput),
      analyse_datum: analyseDatum,
    };
  }
}

