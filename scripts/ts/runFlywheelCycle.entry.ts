import { FlywheelIntegrationManifest } from "@/aurelius/flywheel";

export type FlywheelRunnerInput = {
  board_report: string;
  decision_output?: Record<string, unknown> | null;
  mechanisms?: unknown[];
  insights?: unknown[];
  metadata?: {
    case_id?: string;
    organisatie_type?: string;
    sector?: string;
    organisatie_grootte?: string;
    verdienmodel?: string;
    analyse_datum?: string;
  };
  intervention_outcomes?: Array<{
    intervention_id: string;
    financieel_effect?: string;
    operationeel_effect?: string;
    implementatie_succes?: "laag" | "middel" | "hoog";
    evaluatie_datum?: string;
  }>;
};

export function runFlywheelCycle(input: FlywheelRunnerInput) {
  const manifest = new FlywheelIntegrationManifest();
  return manifest.run(input);
}

