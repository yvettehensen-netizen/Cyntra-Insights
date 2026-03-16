import { StrategicSignalEngine, type StrategicSignal } from "@/aurelius/network";
import type { StrategicDatasetRecord } from "@/aurelius/data";
import type { AnonymizedStrategicRecord } from "@/platform";

export type AutopilotStrategicSignal = {
  sector: string;
  signaal: StrategicSignal["type"];
  impact: string;
  urgentie: StrategicSignal["severity"];
};

function toDatasetRecord(record: AnonymizedStrategicRecord): StrategicDatasetRecord {
  return {
    dataset_id: record.record_id,
    sector: record.sector,
    probleemtype: record.probleemtype,
    mechanismen: record.mechanismen,
    interventies: record.interventies,
    outcomes: [],
    created_at: record.created_at,
  };
}

export class SignalMonitor {
  readonly name = "Signal Monitor";

  constructor(private readonly signalEngine = new StrategicSignalEngine()) {}

  detectFromDatasetRecords(records: AnonymizedStrategicRecord[]): AutopilotStrategicSignal[] {
    const dataset = records.map(toDatasetRecord);
    const detected = this.signalEngine.detect(dataset);

    return detected.map((item) => ({
      sector: "Multi-sector",
      signaal: item.type,
      impact: item.implicatie,
      urgentie: item.severity,
    }));
  }
}

