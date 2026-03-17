import type { DetectedStrategyPattern } from "./TensionEngineNode";
import type { ScenarioDefinition } from "./ScenarioEngineNode";

export type DecisionEngineNodeInput = {
  sourceText?: string;
  structuralTension: string;
  mechanism: string;
  scenarios: ScenarioDefinition[];
  detectedPatterns?: DetectedStrategyPattern[];
};

export type DecisionEngineNodeOutput = {
  recommendedScenario: ScenarioDefinition;
  recommendedDecision: string;
  whyItDominates: string[];
  rejectedAlternatives: Array<{ code: string; rationale: string }>;
  block: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function scoreScenario(code: string, source: string, patterns: DetectedStrategyPattern[]): number {
  let score = code === "A" ? 0.52 : code === "B" ? 0.44 : 0.4;
  const labels = patterns.map((item) => item.pattern);
  if (code === "A" && labels.includes("portfolio imbalance")) score += 0.16;
  if (code === "A" && labels.includes("contract dependency")) score += 0.1;
  if (code === "A" && labels.includes("capacity constraint")) score += 0.1;
  if (code === "B" && labels.includes("capacity constraint")) score += 0.08;
  if (code === "B" && /\bretentie|werkplezier|cultuur|vaste medewerkers\b/i.test(source)) score -= 0.08;
  if (code === "C" && labels.includes("governance fragmentation")) score += 0.12;
  if (code === "C" && labels.includes("contract dependency")) score += 0.06;
  return score;
}

function formatBlock(output: Omit<DecisionEngineNodeOutput, "block">): string {
  return [
    "### Decision Engine",
    "",
    "RECOMMENDED SCENARIO",
    `${output.recommendedScenario.code} — ${output.recommendedScenario.title}`,
    "",
    "RECOMMENDED DECISION",
    output.recommendedDecision,
  ].join("\n");
}

export function runDecisionEngineNode(input: DecisionEngineNodeInput): DecisionEngineNodeOutput {
  const source = [normalize(input.sourceText), normalize(input.structuralTension), normalize(input.mechanism)].join("\n");
  const patterns = input.detectedPatterns ?? [];
  const ranked = [...input.scenarios]
    .map((scenario) => ({ scenario, score: scoreScenario(scenario.code, source, patterns) }))
    .sort((a, b) => b.score - a.score);
  const winner = ranked[0]?.scenario ?? input.scenarios[0];

  const whyItDominates = [
    /portfolio|gemeente/i.test(winner.title)
      ? "Deze richting pakt de spanning direct aan bij de allocatie van gemeenten, contracten en teamcapaciteit."
      : "Deze richting adresseert de structurele spanning direct in plaats van alleen de symptomen.",
    patterns.some((item) => item.pattern === "capacity constraint")
      ? "Capaciteitsdruk is al zichtbaar; het dominante pad moet dus eerst vraag en spreiding begrenzen voordat extra volume wordt geabsorbeerd."
      : "Het dominante pad houdt economische en operationele grenzen beter in hetzelfde ritme.",
    patterns.some((item) => item.pattern === "contract dependency")
      ? "Contract- en toegangsdynamiek liggen deels buiten directe regie, waardoor bestuurlijke focus belangrijker is dan extra activiteit."
      : "Het gekozen pad vergt minder aanname dat externe condities spontaan verbeteren.",
  ];

  const rejectedAlternatives = ranked.slice(1).map(({ scenario }) => ({
    code: scenario.code,
    rationale:
      scenario.code === "B"
        ? "Extra schaal lost de kernspanning niet op zolang vraagvariatie sneller groeit dan vaste teamcapaciteit en contractkwaliteit."
        : "Model- of netwerkherontwerp kan zinvol zijn, maar vraagt eerst scherper mandaat en meer uitvoeringsrust dan nu beschikbaar is.",
  }));

  const recommendedDecision =
    winner.code === "A"
      ? `Kies scenario A: ${winner.title.toLowerCase()} en stuur direct op kern-, behoud- en uitstapkeuzes voordat extra capaciteit of nieuwe labels worden toegestaan.`
      : `Kies scenario ${winner.code}: ${winner.title.toLowerCase()} als primaire koers en borg deze via expliciete grenzen en maandelijkse herijking.`;

  const output = { recommendedScenario: winner, recommendedDecision, whyItDominates, rejectedAlternatives };
  return { ...output, block: formatBlock(output) };
}
