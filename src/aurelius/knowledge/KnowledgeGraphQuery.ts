import { KnowledgeGraphStore } from "./KnowledgeGraphStore";

export type KnowledgeGraphQueryInput = {
  sector: string;
  problemHint: string;
  organizationName?: string;
};

export type KnowledgeGraphInsightResult = {
  comparableOrganisations: string[];
  commonProblems: string[];
  effectiveStrategies: string[];
  effectiveInterventions: string[];
  block: string;
};

function toId(type: string, label: string): string {
  const normalized = String(label ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${type}:${normalized || "unknown"}`;
}

function topLabels(nodes: KnowledgeNode[]): string[] {
  return nodes.map((n) => n.label).filter(Boolean).slice(0, 5);
}

type KnowledgeNode = {
  id: string;
  label: string;
  score: number;
};

export class KnowledgeGraphQuery {
  constructor(private readonly store = new KnowledgeGraphStore()) {}

  run(input: KnowledgeGraphQueryInput): KnowledgeGraphInsightResult {
    const graph = this.store.getGraph();
    const sectorId = toId("sector", input.sector || "onbekend");
    const orgHint = String(input.organizationName ?? "").toLowerCase();
    const problemHint = String(input.problemHint ?? "").toLowerCase();

    const orgsInSector = graph.edges
      .filter((e) => e.type === "BELONGS_TO_SECTOR" && e.to === sectorId)
      .map((e) => graph.nodes.find((n) => n.id === e.from))
      .filter((n): n is NonNullable<typeof n> => Boolean(n))
      .filter((n) => !orgHint || n.label.toLowerCase() !== orgHint);

    const comparableOrganisations = orgsInSector.map((n) => n.label).slice(0, 5);

    const orgIds = new Set(orgsInSector.map((n) => n.id));

    const problemsByWeight = graph.edges
      .filter((e) => e.type === "HAS_PROBLEM" && orgIds.has(e.from))
      .map((e) => {
        const node = graph.nodes.find((n) => n.id === e.to && n.type === "problem");
        if (!node) return null;
        const boost = problemHint && node.label.toLowerCase().includes(problemHint) ? 2 : 0;
        return { id: node.id, label: node.label, score: e.weight + boost } as KnowledgeNode;
      })
      .filter((n): n is KnowledgeNode => Boolean(n))
      .sort((a, b) => b.score - a.score);

    const strategiesByWeight = graph.edges
      .filter((e) => e.type === "USES_STRATEGY" && orgIds.has(e.from))
      .map((e) => {
        const node = graph.nodes.find((n) => n.id === e.to && n.type === "strategy");
        return node ? ({ id: node.id, label: node.label, score: e.weight } as KnowledgeNode) : null;
      })
      .filter((n): n is KnowledgeNode => Boolean(n))
      .sort((a, b) => b.score - a.score);

    const interventionsByWeight = graph.edges
      .filter((e) => e.type === "APPLIED_INTERVENTION" && orgIds.has(e.from))
      .map((e) => {
        const node = graph.nodes.find((n) => n.id === e.to && n.type === "intervention");
        return node ? ({ id: node.id, label: node.label, score: e.weight } as KnowledgeNode) : null;
      })
      .filter((n): n is KnowledgeNode => Boolean(n))
      .sort((a, b) => b.score - a.score);

    const commonProblems = topLabels(problemsByWeight);
    const effectiveStrategies = topLabels(strategiesByWeight);
    const effectiveInterventions = topLabels(interventionsByWeight);

    const block = [
      "VERGELIJKBARE ORGANISATIES",
      comparableOrganisations.length ? comparableOrganisations.join("; ") : "Geen directe vergelijkbare organisaties gevonden.",
      "GEMEENSCHAPPELIJKE PROBLEMEN",
      commonProblems.length ? commonProblems.join("; ") : "Nog geen dominant probleemcluster beschikbaar in de graph.",
      "MEEST EFFECTIEVE STRATEGIEËN",
      effectiveStrategies.length ? effectiveStrategies.join("; ") : "Nog geen dominante strategie-signalen beschikbaar.",
      "MEEST EFFECTIEVE INTERVENTIES",
      effectiveInterventions.length ? effectiveInterventions.join("; ") : "Nog geen bewezen interventies beschikbaar in de graph.",
    ].join("\n");

    return {
      comparableOrganisations,
      commonProblems,
      effectiveStrategies,
      effectiveInterventions,
      block,
    };
  }
}
