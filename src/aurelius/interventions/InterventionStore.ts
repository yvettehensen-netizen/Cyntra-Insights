import type { Intervention } from "./types";

class InterventionStore {
  private interventions: Intervention[] = [];

  addMany(items: Intervention[]) {
    if (!Array.isArray(items) || !items.length) return;
    this.interventions.push(...items);
  }

  getAll() {
    return [...this.interventions];
  }

  clear() {
    this.interventions = [];
  }
}

export { InterventionStore };
export const interventionStore = new InterventionStore();
