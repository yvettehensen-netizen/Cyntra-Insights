import type { KnowledgeEdgeType, KnowledgeGraphEdge, KnowledgeGraphNode, KnowledgeNodeType } from "./KnowledgeGraphStore";

export type KnowledgeGraphBuildInput = {
  companyName: string;
  sector: string;
  problem: string;
  strategy: string;
  interventions: string[];
  patterns: string[];
};

export type KnowledgeGraphBuildResult = {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function slug(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function nodeId(type: KnowledgeNodeType, label: string): string {
  return `${type}:${slug(label) || "unknown"}`;
}

function edgeId(type: KnowledgeEdgeType, from: string, to: string): string {
  return `${type}:${from}->${to}`;
}

function createNode(type: KnowledgeNodeType, label: string, metadata?: Record<string, unknown>): KnowledgeGraphNode {
  return {
    id: nodeId(type, label),
    type,
    label: label || "onbekend",
    metadata,
    updatedAt: nowIso(),
  };
}

function createEdge(type: KnowledgeEdgeType, from: string, to: string, metadata?: Record<string, unknown>): KnowledgeGraphEdge {
  return {
    id: edgeId(type, from, to),
    from,
    to,
    type,
    weight: 1,
    metadata,
    updatedAt: nowIso(),
  };
}

export function buildKnowledgeGraphPayload(input: KnowledgeGraphBuildInput): KnowledgeGraphBuildResult {
  const companyNode = createNode("organisation", input.companyName || "Onbekende organisatie");
  const sectorNode = createNode("sector", input.sector || "onbekend");
  const problemNode = createNode("problem", input.problem || "onbekend probleem");
  const strategyNode = createNode("strategy", input.strategy || "onbekende strategie");

  const interventionNodes = (input.interventions ?? [])
    .filter(Boolean)
    .map((item) => createNode("intervention", item));
  const patternNodes = (input.patterns ?? [])
    .filter(Boolean)
    .map((item) => createNode("pattern", item));

  const nodes = [companyNode, sectorNode, problemNode, strategyNode, ...interventionNodes, ...patternNodes];

  const edges: KnowledgeGraphEdge[] = [
    createEdge("BELONGS_TO_SECTOR", companyNode.id, sectorNode.id),
    createEdge("HAS_PROBLEM", companyNode.id, problemNode.id),
    createEdge("USES_STRATEGY", companyNode.id, strategyNode.id),
    createEdge("CAUSED_BY", problemNode.id, sectorNode.id),
  ];

  interventionNodes.forEach((node) => {
    edges.push(createEdge("APPLIED_INTERVENTION", companyNode.id, node.id));
    edges.push(createEdge("CAUSED_BY", node.id, problemNode.id));
  });

  patternNodes.forEach((node) => {
    edges.push(createEdge("SIMILAR_TO", problemNode.id, node.id));
    edges.push(createEdge("SIMILAR_TO", strategyNode.id, node.id));
  });

  return { nodes, edges };
}
