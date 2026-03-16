import { KPIStatus } from "../types";

type KPIStatusCardProps = {
  redCount: number;
  overallStatus: "stable" | "attention" | "risk";
};

const statusTone: Record<"stable" | "attention" | "risk", string> = {
  stable: "status-gate-ok border border-[#3C5E47]",
  attention: "status-gate-risk border border-[#C4A762]",
  risk: "status-gate-fail border border-[#8B2E2E]",
};

function statusToKPI(overallStatus: "stable" | "attention" | "risk"): KPIStatus {
  if (overallStatus === "risk") return "red";
  if (overallStatus === "attention") return "orange";
  return "green";
}

export default function KPIStatusCard({ redCount, overallStatus }: KPIStatusCardProps) {
  const tone = statusTone[overallStatus];
  const normalized = statusToKPI(overallStatus);

  return (
    <div className={`rounded-lg border px-4 py-3 ${tone}`}>
      <p className="text-xs uppercase tracking-wide">KPI Status</p>
      <p className="mt-1 text-sm">Overall: <strong>{normalized}</strong></p>
      <p className="text-sm">Rode KPI&apos;s: <strong>{redCount}</strong></p>
    </div>
  );
}
