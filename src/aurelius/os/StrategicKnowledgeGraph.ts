export type StrategicKnowledgeNodeType =
  | "sector"
  | "probleem"
  | "mechanisme"
  | "interventie"
  | "resultaat";

export type StrategicKnowledgeEdgeType = "veroorzaakt" | "verbetert" | "blokkeert";

export type StrategicKnowledgeNode = {
  id: string;
  type: StrategicKnowledgeNodeType;
  label: string;
};

export type StrategicKnowledgeEdge = {
  from: string;
  to: string;
  type: StrategicKnowledgeEdgeType;
};

export type StrategicKnowledgeGraphOutput = {
  nodes: StrategicKnowledgeNode[];
  edges: StrategicKnowledgeEdge[];
};

export type StrategicKnowledgeGraphInput = {
  sector: string;
  dominant_problem: string;
  mechanisms: string[];
  interventions: string[];
  outcomes: string[];
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function idFor(prefix: string, label: string): string {
  const raw = normalize(label).toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${prefix}-${(hash >>> 0).toString(16)}`;
}

export class StrategicKnowledgeGraph {
  readonly name = "Strategic Knowledge Graph";

  build(input: StrategicKnowledgeGraphInput): StrategicKnowledgeGraphOutput {
    const nodes: StrategicKnowledgeNode[] = [];
    const edges: StrategicKnowledgeEdge[] = [];

    const sectorLabel = normalize(input.sector) || "Onbekende sector";
    const problemLabel = normalize(input.dominant_problem) || "Onbekend probleem";
    const sectorId = idFor("sector", sectorLabel);
    const problemId = idFor("probleem", problemLabel);

    nodes.push({ id: sectorId, type: "sector", label: sectorLabel });
    nodes.push({ id: problemId, type: "probleem", label: problemLabel });
    edges.push({ from: sectorId, to: problemId, type: "veroorzaakt" });

    for (const mechanism of input.mechanisms.slice(0, 8)) {
      const label = normalize(mechanism);
      if (!label) continue;
      const id = idFor("mechanisme", label);
      nodes.push({ id, type: "mechanisme", label });
      edges.push({ from: problemId, to: id, type: "veroorzaakt" });
    }

    for (const intervention of input.interventions.slice(0, 8)) {
      const label = normalize(intervention);
      if (!label) continue;
      const id = idFor("interventie", label);
      nodes.push({ id, type: "interventie", label });
      edges.push({ from: id, to: problemId, type: "verbetert" });
    }

    for (const outcome of input.outcomes.slice(0, 8)) {
      const label = normalize(outcome);
      if (!label) continue;
      const id = idFor("resultaat", label);
      nodes.push({ id, type: "resultaat", label });
      edges.push({ from: problemId, to: id, type: "blokkeert" });
    }

    return {
      nodes,
      edges,
    };
  }
}
