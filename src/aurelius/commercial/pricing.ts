// ============================================================
// src/aurelius/commercial/pricing.ts
// ============================================================

export type PricingTier = "Platform" | "Advisory" | "Hybrid";

export interface InterventionPricing {
  tier: PricingTier;
  description: string;
  priceRangeEUR: string;
}

export const INTERVENTION_PRICING: Record<PricingTier, InterventionPricing> = {
  Platform: {
    tier: "Platform",
    description:
      "Toegang tot Cyntra-platform, analyses, interventies en rapportage.",
    priceRangeEUR: "€2.500 – €5.000 per maand",
  },
  Advisory: {
    tier: "Advisory",
    description:
      "Cyntra-analyse + persoonlijke strategische begeleiding.",
    priceRangeEUR: "€15.000 – €40.000 per traject",
  },
  Hybrid: {
    tier: "Hybrid",
    description:
      "Platform + interventie-begeleiding + board sessions.",
    priceRangeEUR: "€25.000 – €75.000 per traject",
  },
};
