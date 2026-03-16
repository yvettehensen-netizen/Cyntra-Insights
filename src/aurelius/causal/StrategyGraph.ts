import type { StrategicLever } from "@/aurelius/strategy/StrategicLeverMatrix";

export type StrategyGraphNode = {
  id: string;
  type: "lever" | "effect" | "risk";
  label: string;
};

export type StrategyGraphEdge = {
  source: string;
  target: string;
  relation: string;
};

export type StrategyGraph = {
  nodes: StrategyGraphNode[];
  edges: StrategyGraphEdge[];
};

export type CausalStrategyInput = {
  lever: StrategicLever;
  mechanism: string;
  operationalEffect: string;
  financialEffect: string;
  strategicRisk: string;
};

function slug(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildStrategyGraph(inputs: CausalStrategyInput[]): StrategyGraph {
  const nodes: StrategyGraphNode[] = [];
  const edges: StrategyGraphEdge[] = [];

  for (const item of inputs) {
    const leverId = `lever-${slug(item.lever)}`;
    const mechanismId = `effect-${slug(item.lever)}-mechanism`;
    const financialId = `effect-${slug(item.lever)}-financial`;
    const riskId = `risk-${slug(item.lever)}`;

    nodes.push(
      { id: leverId, type: "lever", label: item.lever },
      { id: mechanismId, type: "effect", label: item.mechanism },
      { id: financialId, type: "effect", label: item.financialEffect },
      { id: riskId, type: "risk", label: item.strategicRisk }
    );

    edges.push(
      { source: leverId, target: mechanismId, relation: "activeert" },
      { source: mechanismId, target: financialId, relation: "leidt tot" },
      { source: mechanismId, target: riskId, relation: "vergroot risico op" }
    );
  }

  return { nodes, edges };
}
