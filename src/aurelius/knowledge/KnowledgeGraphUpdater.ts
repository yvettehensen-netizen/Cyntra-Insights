import { KnowledgeGraphStore } from "./KnowledgeGraphStore";
import { type KnowledgeGraphBuildResult } from "./KnowledgeGraphBuilder";

export class KnowledgeGraphUpdater {
  constructor(private readonly store = new KnowledgeGraphStore()) {}

  apply(payload: KnowledgeGraphBuildResult): void {
    for (const node of payload.nodes) {
      this.store.upsertNode(node);
    }
    for (const edge of payload.edges) {
      this.store.upsertEdge(edge);
    }
  }
}
