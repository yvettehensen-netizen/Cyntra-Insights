export type SystemDynamicsInput = {
  contextText: string;
};

export type DynamicsVariableScore = {
  variable: string;
  score: number;
};

export type SystemDynamicsResult = {
  dominantVariable: string;
  variables: DynamicsVariableScore[];
  summary: string;
};

const VARIABLE_KEYWORDS: Record<string, string[]> = {
  kostenstijging: ["kosten", "loonkosten", "inflatie", "kostprijs"],
  tariefdruk: ["tarief", "prijs", "vergoeding", "contract"],
  productiviteitsnorm: ["productiviteit", "norm", "uren", "output"],
  personeelsbelasting: ["werkdruk", "uitval", "belasting", "verzuim", "capaciteit"],
};

function scoreVariable(source: string, keywords: string[]): number {
  const text = source.toLowerCase();
  const hits = keywords.reduce((acc, kw) => {
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    return acc + ((text.match(re) ?? []).length > 0 ? 1 : 0);
  }, 0);
  return hits;
}

export function analyzeSystemDynamics(input: SystemDynamicsInput): SystemDynamicsResult {
  const source = String(input.contextText ?? "");
  const variables: DynamicsVariableScore[] = Object.entries(VARIABLE_KEYWORDS)
    .map(([variable, keywords]) => ({
      variable,
      score: scoreVariable(source, keywords),
    }))
    .sort((a, b) => b.score - a.score);

  const dominantVariable = variables[0]?.variable ?? "onbekend";
  const summary = `Dominante systeemvariabele: ${dominantVariable}. Variabelen beïnvloeden elkaar via kosten, tarieven, productiviteitsdruk en personeelsbelasting.`;

  return {
    dominantVariable,
    variables,
    summary,
  };
}
