import { StrategicDatasetCollector } from "@/platform";
import { StrategicSignalEngine } from "@/aurelius/network";
import type { StrategicDiscoveredOrganisation } from "./StrategicDiscoveryAgent";

export type StrategicMonitoringEvent = {
  organisation_name: string;
  type: "groei" | "krimp" | "fusie" | "strategische_verandering";
  impact: string;
};

export type StrategicMonitoringOutput = {
  organisation_events: StrategicMonitoringEvent[];
  strategic_signals: Array<{
    sector: string;
    signaal: string;
    impact: string;
    urgentie: string;
  }>;
};

function inferEvent(org: StrategicDiscoveredOrganisation): StrategicMonitoringEvent["type"] {
  const src = `${org.organisation_name} ${org.mogelijke_strategische_spanning}`.toLowerCase();
  if (/fusie|merge|overname/.test(src)) return "fusie";
  if (/krimp|druk|verlies/.test(src)) return "krimp";
  if (/groei|scale|uitbreid/.test(src)) return "groei";
  return "strategische_verandering";
}

export class StrategicMonitoringAgent {
  readonly name = "Strategic Monitoring Agent";

  private readonly dataset = new StrategicDatasetCollector();
  private readonly signalEngine = new StrategicSignalEngine();

  monitor(organisations: StrategicDiscoveredOrganisation[]): StrategicMonitoringOutput {
    const organisation_events = organisations.map((org) => ({
      organisation_name: org.organisation_name,
      type: inferEvent(org),
      impact: org.mogelijke_strategische_spanning,
    }));

    const records = this.dataset.listRecords();
    const signals = this.signalEngine
      .detect(
        records.map((item) => ({
          dataset_id: item.record_id,
          sector: item.sector,
          probleemtype: item.probleemtype,
          mechanismen: item.mechanismen,
          interventies: item.interventies,
          outcomes: [],
          created_at: item.created_at,
        }))
      )
      .map((signal) => ({
        sector: "Multi-sector",
        signaal: signal.type,
        impact: signal.implicatie,
        urgentie: signal.severity,
      }));

    return {
      organisation_events,
      strategic_signals: signals,
    };
  }
}

