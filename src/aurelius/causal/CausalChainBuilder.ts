import type { CausalMechanismResult } from "./CausalMechanismDetector";

export type CausalChain = {
  symptom: string;
  mechanism: string;
  structuralCause: string;
  intervention: string;
};

export type CausalChainBuildResult = {
  chains: CausalChain[];
  block: string;
};

export function buildCausalChains(input: CausalMechanismResult): CausalChainBuildResult {
  const chains = (input.items ?? []).map((item) => ({
    symptom: item.symptom,
    mechanism: item.mechanism,
    structuralCause: item.structuralCause,
    intervention: item.breakingIntervention,
  }));

  const lines: string[] = [];
  lines.push("SYMPTOMEN");
  lines.push(chains.map((c, i) => `${i + 1}. ${c.symptom}`).join(" | "));
  lines.push("WELK MECHANISME HIERACHTER ZIT");
  lines.push(chains.map((c, i) => `${i + 1}. ${c.mechanism}`).join(" | "));
  lines.push("STRUCTURELE OORZAAK");
  lines.push(chains.map((c, i) => `${i + 1}. ${c.structuralCause}`).join(" | "));
  lines.push("WELKE INTERVENTIE HET MECHANISME DOORBREKT");
  lines.push(chains.map((c, i) => `${i + 1}. ${c.intervention}`).join(" | "));

  return {
    chains,
    block: lines.join("\n"),
  };
}
