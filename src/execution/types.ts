export type KPIStatus = "green" | "orange" | "red";

export interface KPI {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  threshold: number;
  status?: KPIStatus;
}

export interface GateDates {
  day30: string;
  day60: string;
  day90: string;
}

export interface DecisionContract {
  id: string;
  title: string;
  owner: string;
  createdAt: string;
  gates: GateDates;
  kpis: KPI[];
  stopRule?: string;
}

export interface ExecutionStatus {
  overallStatus: "stable" | "attention" | "risk";
  gateStatus: "on-track" | "gate-risk";
  redKPIcount: number;
}
