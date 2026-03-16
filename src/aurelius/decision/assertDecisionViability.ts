// ============================================================
// AURELIUS — DECISION VIABILITY ASSERT
// ROUTE: src/aurelius/decision/assertDecisionViability.ts
//
// DOEL:
// - Keiharde validatie: is dit een uitvoerbaar bestuurlijk besluit?
// - Geen semantische false negatives
// - Faalt alleen op structurele afwezigheid
// ============================================================

export interface DecisionViabilityResult {
  viable: boolean;
  reasons: string[];
}

export function assertDecisionViability(text: string): DecisionViabilityResult {
  const lc = text.toLowerCase();

  const checks = {
    decision:
      lc.includes("besluit") ||
      lc.includes("wordt besloten") ||
      lc.includes("is besloten"),

    ownership:
      lc.includes("verantwoordelijk") ||
      lc.includes("eindverantwoordelijk") ||
      lc.includes("mandaat ligt bij") ||
      lc.includes("eigenaarschap"),

    irreversibility:
      lc.includes("per direct") ||
      lc.includes("onomkeerbaar") ||
      lc.includes("wordt beëindigd") ||
      lc.includes("stopt") ||
      lc.includes("wordt ingetrokken"),

    consequence:
      lc.includes("bij niet") ||
      lc.includes("gevolg") ||
      lc.includes("escalatie") ||
      lc.includes("vervalt") ||
      lc.includes("wordt beëindigd bij"),
  };

  const reasons: string[] = [];

  if (!checks.decision)
    reasons.push("Geen expliciet besluit geformuleerd");

  if (!checks.ownership)
    reasons.push("Geen expliciet eigenaarschap of mandaat benoemd");

  if (!checks.irreversibility)
    reasons.push("Besluit is niet onomkeerbaar");

  if (!checks.consequence)
    reasons.push("Geen consequentie bij niet-uitvoering benoemd");

  return {
    viable: reasons.length === 0,
    reasons,
  };
}
