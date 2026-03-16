import type { StrategicCase } from "./StrategicCaseBuilder";

export type DominantProblemCategory =
  | "financiele_druk"
  | "capaciteitsprobleem"
  | "contractbeperking"
  | "strategische_versnippering"
  | "overig";

export type NormalizedStrategicCase = StrategicCase & {
  dominant_problem_category: DominantProblemCategory;
  normalized_problem_label: string;
  normalized_tags: string[];
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function includesAny(source: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(source));
}

function mapProblemCategory(problem: string): DominantProblemCategory {
  const low = problem.toLowerCase();
  if (includesAny(low, [/\bmarge\b/, /\bliquiditeit\b/, /\bcash\b/, /\bloonkosten\b/, /\bkostprijs\b/])) {
    return "financiele_druk";
  }
  if (includesAny(low, [/\bcapaciteit\b/, /\bwachtlijst\b/, /\bproductiviteit\b/, /\bwerkdruk\b/, /\bfte\b/])) {
    return "capaciteitsprobleem";
  }
  if (includesAny(low, [/\bcontract\b/, /\bplafond\b/, /\bverzekeraar\b/, /\btarief\b/])) {
    return "contractbeperking";
  }
  if (includesAny(low, [/\bparallel\b/, /\bversnipper\b/, /\bprioriter\b/, /\bverbred\b/])) {
    return "strategische_versnippering";
  }
  return "overig";
}

function defaultLabel(category: DominantProblemCategory): string {
  switch (category) {
    case "financiele_druk":
      return "Structurele financiële druk";
    case "capaciteitsprobleem":
      return "Capaciteits- en planningsdruk";
    case "contractbeperking":
      return "Externe contractbeperking";
    case "strategische_versnippering":
      return "Strategische versnippering";
    default:
      return "Overige strategische spanning";
  }
}

function deriveTags(source: string): string[] {
  const tags = new Set<string>();
  const low = source.toLowerCase();
  if (/\bmarge|cash|liquiditeit|ebitda|kostprijs\b/.test(low)) tags.add("finance");
  if (/\bcapaciteit|fte|wachtlijst|planning|productiviteit\b/.test(low)) tags.add("operations");
  if (/\bcontract|plafond|verzekeraar|tarief\b/.test(low)) tags.add("contracting");
  if (/\bgovernance|mandaat|rvt|escalatie|prioritering\b/.test(low)) tags.add("governance");
  if (/\bteam|onderstroom|cultuur|gedrag\b/.test(low)) tags.add("culture");
  return Array.from(tags);
}

export class CaseNormalizationEngine {
  readonly name = "Case Normalization Engine";

  normalize(caseRecord: StrategicCase): NormalizedStrategicCase {
    const dominantProblem = normalize(caseRecord.dominant_problem);
    const category = mapProblemCategory(dominantProblem);

    return {
      ...caseRecord,
      dominant_problem: dominantProblem,
      dominant_problem_category: category,
      normalized_problem_label: defaultLabel(category),
      normalized_tags: deriveTags([
        caseRecord.dominant_problem,
        caseRecord.dominant_thesis,
        caseRecord.interventieplan,
      ].join(" ")),
    };
  }
}

