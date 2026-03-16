import type { StrategyDNAProfile } from "./DNAImpactModel";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function buildStrategyDNABlock(profile: StrategyDNAProfile): string {
  return [
    "### Strategy DNA",
    "Archetype",
    profile.archetype,
    "",
    "Mechanisme",
    normalize(profile.coreMechanism),
    "",
    "Groeimodel",
    normalize(profile.growthModel),
    "",
    "Strategisch risico",
    normalize(profile.strategicRisk),
    "",
    "Strategievoorkeur",
    normalize(profile.strategyPreference),
  ].join("\n");
}

export function buildStrategyDNAMemoSummary(profile: StrategyDNAProfile): string {
  return [
    "DOMINANT ORGANISATIETYPE",
    profile.archetype,
    "",
    "KERNMECHANISME",
    normalize(profile.coreMechanism),
  ].join("\n");
}
