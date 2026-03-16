import type {
  CaseDatasetRecord,
  InterventionDatasetRecord,
} from "@/aurelius/data";
import type { AnonymizedStrategicRecord } from "@/platform";
import type { AutopilotStrategicSignal } from "@/aurelius/autopilot/SignalMonitor";

export type StrategicKnowledgeNodeType =
  | "organisatie"
  | "sector"
  | "probleem"
  | "strategie"
  | "interventie"
  | "resultaat";

export type StrategicKnowledgeEdgeType =
  | "heeft_probleem"
  | "probeert_strategie"
  | "gebruikt_interventie"
  | "leidt_tot_resultaat";

export type StrategicKnowledgeNode = {
  id: string;
  type: StrategicKnowledgeNodeType;
  label: string;
};

export type StrategicKnowledgeEdge = {
  id: string;
  from: string;
  to: string;
  type: StrategicKnowledgeEdgeType;
  weight: number;
};

export type StrategicKnowledgeGraphState = {
  nodes: StrategicKnowledgeNode[];
  edges: StrategicKnowledgeEdge[];
  updated_at: string;
};

const KEY = "cyntra_knowledge_graph_v1";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function nodeId(type: StrategicKnowledgeNodeType, label: string): string {
  const slug = normalize(label).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${type}:${slug || "onbekend"}`;
}

function edgeId(type: StrategicKnowledgeEdgeType, from: string, to: string): string {
  return `${type}:${from}->${to}`;
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export class StrategicKnowledgeGraph {
  readonly name = "Strategic Knowledge Graph";

  load(): StrategicKnowledgeGraphState {
    const s = storage();
    if (!s) return { nodes: [], edges: [], updated_at: new Date().toISOString() };
    try {
      const raw = s.getItem(KEY);
      if (!raw) return { nodes: [], edges: [], updated_at: new Date().toISOString() };
      const parsed = JSON.parse(raw) as StrategicKnowledgeGraphState;
      return {
        nodes: Array.isArray(parsed?.nodes) ? parsed.nodes : [],
        edges: Array.isArray(parsed?.edges) ? parsed.edges : [],
        updated_at: normalize(parsed?.updated_at) || new Date().toISOString(),
      };
    } catch {
      return { nodes: [], edges: [], updated_at: new Date().toISOString() };
    }
  }

  save(state: StrategicKnowledgeGraphState): void {
    const s = storage();
    if (!s) return;
    try {
      s.setItem(
        KEY,
        JSON.stringify({
          ...state,
          updated_at: new Date().toISOString(),
        })
      );
    } catch {
      // best effort
    }
  }

  addNode(state: StrategicKnowledgeGraphState, type: StrategicKnowledgeNodeType, label: string): string {
    const id = nodeId(type, label);
    if (!state.nodes.some((item) => item.id === id)) {
      state.nodes.push({ id, type, label: normalize(label) || "Onbekend" });
    }
    return id;
  }

  addEdge(
    state: StrategicKnowledgeGraphState,
    type: StrategicKnowledgeEdgeType,
    from: string,
    to: string,
    weight = 1
  ): void {
    const id = edgeId(type, from, to);
    const existing = state.edges.find((item) => item.id === id);
    if (existing) {
      existing.weight += weight;
      return;
    }
    state.edges.push({
      id,
      from,
      to,
      type,
      weight,
    });
  }

  buildFromData(input: {
    records: AnonymizedStrategicRecord[];
    cases: CaseDatasetRecord[];
    interventions: InterventionDatasetRecord[];
    signals?: AutopilotStrategicSignal[];
  }): StrategicKnowledgeGraphState {
    const state = this.load();

    for (const row of input.cases) {
      const orgId = this.addNode(state, "organisatie", row.organisation_name);
      const sectorId = this.addNode(state, "sector", row.sector);
      const probleemId = this.addNode(state, "probleem", row.probleemtype);
      const strategieId = this.addNode(state, "strategie", row.gekozen_strategie);
      const interventieId = this.addNode(state, "interventie", row.interventie);
      const resultaatId = this.addNode(state, "resultaat", row.resultaat);

      this.addEdge(state, "heeft_probleem", orgId, probleemId, 1);
      this.addEdge(state, "probeert_strategie", orgId, strategieId, 1);
      this.addEdge(state, "gebruikt_interventie", strategieId, interventieId, 1);
      this.addEdge(state, "leidt_tot_resultaat", interventieId, resultaatId, 1);
      this.addEdge(state, "heeft_probleem", sectorId, probleemId, 1);
    }

    for (const row of input.records) {
      const sectorId = this.addNode(state, "sector", row.sector);
      const probleemId = this.addNode(state, "probleem", row.probleemtype);
      this.addEdge(state, "heeft_probleem", sectorId, probleemId, 1);
    }

    for (const row of input.interventions) {
      const interventieId = this.addNode(state, "interventie", row.interventie);
      const resultaatId = this.addNode(
        state,
        "resultaat",
        row.succes_score >= 0.66 ? "hoog resultaat" : row.succes_score >= 0.5 ? "middel resultaat" : "laag resultaat"
      );
      this.addEdge(state, "leidt_tot_resultaat", interventieId, resultaatId, 1);
    }

    for (const signal of input.signals ?? []) {
      const sectorId = this.addNode(state, "sector", signal.sector || "Multi-sector");
      const probleemId = this.addNode(state, "probleem", signal.signaal);
      const resultaatId = this.addNode(state, "resultaat", signal.impact);
      this.addEdge(state, "heeft_probleem", sectorId, probleemId, 1);
      this.addEdge(state, "leidt_tot_resultaat", probleemId, resultaatId, 1);
    }

    this.save(state);
    return state;
  }
}
