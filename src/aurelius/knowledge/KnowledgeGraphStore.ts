export type KnowledgeNodeType =
  | "organisation"
  | "problem"
  | "strategy"
  | "intervention"
  | "pattern"
  | "sector";

export type KnowledgeEdgeType =
  | "HAS_PROBLEM"
  | "USES_STRATEGY"
  | "APPLIED_INTERVENTION"
  | "BELONGS_TO_SECTOR"
  | "SIMILAR_TO"
  | "CAUSED_BY";

export type KnowledgeGraphNode = {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  metadata?: Record<string, unknown>;
  updatedAt: string;
};

export type KnowledgeGraphEdge = {
  id: string;
  from: string;
  to: string;
  type: KnowledgeEdgeType;
  weight: number;
  metadata?: Record<string, unknown>;
  updatedAt: string;
};

export type KnowledgeGraphData = {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
};

const GRAPH_STORAGE_KEY = "strategic_knowledge_graph_v1";
const fallbackGraph: KnowledgeGraphData = { nodes: [], edges: [] };

function getLocalStorage(): Storage | null {
  try {
    if (typeof globalThis === "undefined") return null;
    const candidate = (globalThis as { localStorage?: Storage }).localStorage;
    return candidate ?? null;
  } catch {
    return null;
  }
}

function readGraph(): KnowledgeGraphData {
  const storage = getLocalStorage();
  if (!storage) return { ...fallbackGraph, nodes: [...fallbackGraph.nodes], edges: [...fallbackGraph.edges] };
  try {
    const raw = storage.getItem(GRAPH_STORAGE_KEY);
    if (!raw) return { ...fallbackGraph, nodes: [...fallbackGraph.nodes], edges: [...fallbackGraph.edges] };
    const parsed = JSON.parse(raw) as Partial<KnowledgeGraphData>;
    const nodes = Array.isArray(parsed?.nodes) ? parsed.nodes : [];
    const edges = Array.isArray(parsed?.edges) ? parsed.edges : [];
    fallbackGraph.nodes = [...nodes];
    fallbackGraph.edges = [...edges];
    return { nodes: [...nodes], edges: [...edges] };
  } catch {
    return { ...fallbackGraph, nodes: [...fallbackGraph.nodes], edges: [...fallbackGraph.edges] };
  }
}

function writeGraph(graph: KnowledgeGraphData): void {
  fallbackGraph.nodes = [...graph.nodes];
  fallbackGraph.edges = [...graph.edges];
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(graph));
  } catch {
    // best effort persistence
  }
}

export class KnowledgeGraphStore {
  getGraph(): KnowledgeGraphData {
    return readGraph();
  }

  upsertNode(node: KnowledgeGraphNode): void {
    const graph = readGraph();
    const idx = graph.nodes.findIndex((n) => n.id === node.id);
    if (idx >= 0) {
      graph.nodes[idx] = {
        ...graph.nodes[idx],
        ...node,
        metadata: {
          ...(graph.nodes[idx].metadata ?? {}),
          ...(node.metadata ?? {}),
        },
      };
    } else {
      graph.nodes.push(node);
    }
    writeGraph(graph);
  }

  upsertEdge(edge: KnowledgeGraphEdge): void {
    const graph = readGraph();
    const idx = graph.edges.findIndex((e) => e.id === edge.id);
    if (idx >= 0) {
      const existing = graph.edges[idx];
      graph.edges[idx] = {
        ...existing,
        ...edge,
        weight: Math.max(1, Number(existing.weight ?? 1) + 1),
        metadata: {
          ...(existing.metadata ?? {}),
          ...(edge.metadata ?? {}),
        },
      };
    } else {
      graph.edges.push(edge);
    }
    writeGraph(graph);
  }
}
