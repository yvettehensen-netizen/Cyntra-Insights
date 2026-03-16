import assert from "node:assert/strict";
import { StrategicDatasetCollector } from "../../src/platform/StrategicDatasetCollector";
import { CompanyDatasetBuilder } from "../../src/platform/CompanyDatasetBuilder";

class MemoryStorage {
  map = new Map<string, string>();
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
  key(index: number) {
    return Array.from(this.map.keys())[index] ?? null;
  }
  get length() {
    return this.map.size;
  }
}

function installStorage() {
  const storage = new MemoryStorage() as unknown as Storage;
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
  return storage;
}

export async function run() {
  const storage = installStorage();
  storage.clear();

  const builder = new CompanyDatasetBuilder();
  const validSession: any = {
    session_id: "sess-1",
    organization_id: "org-1",
    organization_name: "Test Org",
    analyse_datum: new Date().toISOString(),
    input_data: "context",
    board_report: "report",
    status: "completed",
    strategic_metadata: {
      sector: "Zorg/GGZ",
      probleemtype: "financiele druk",
      mechanismen: ["margedruk"],
      interventies: ["contractheronderhandeling"],
      strategische_opties: ["consolideren"],
      gekozen_strategie: "consolideren",
    },
    updated_at: new Date().toISOString(),
    executive_summary: "Samenvatting",
  };

  const built = builder.fromSession(validSession);
  assert(built, "valid case should build");
  assert.equal(built?.sector, "Zorg/GGZ");

  const invalidSession: any = {
    ...validSession,
    strategic_metadata: {
      ...validSession.strategic_metadata,
      gekozen_strategie: "",
      interventies: [],
    },
  };
  const invalidBuilt = builder.fromSession(invalidSession);
  assert.equal(invalidBuilt, null, "invalid case should be rejected");

  const collector = new StrategicDatasetCollector();
  const collectedValid = collector.collectFromSession(validSession);
  assert(collectedValid, "valid session should be collected");

  const beforeCount = collector.listRecords().length;
  const collectedInvalid = collector.collectFromSession(invalidSession);
  const afterCount = collector.listRecords().length;
  assert.equal(collectedInvalid, null, "invalid session should not be collected");
  assert.equal(beforeCount, afterCount, "invalid case must not be stored");
}
