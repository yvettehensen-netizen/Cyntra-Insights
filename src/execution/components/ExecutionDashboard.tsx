import { DecisionContract } from "../types";
import { getContracts } from "../DecisionContractStore";
import { useExecutionStatus } from "../hooks/useExecutionStatus";
import KPIStatusCard from "./KPIStatusCard";
import GateStatusCard from "./GateStatusCard";
import BackToDashboard from "@/components/navigation/BackToDashboard";
import { useEffect } from "react";
import { computeBoardIndex } from "@/aurelius/governance/BoardLegitimacyEngine";
import { saveBoardIndexSnapshot } from "@/aurelius/storage/BoardIndexRepository";

function ContractExecutionCard({ contract }: { contract: DecisionContract }) {
  const status = useExecutionStatus(contract);

  return (
    <div className="card-cyntra mb-6">
      <h2 className="text-xl font-medium text-cyntra-primary">{contract.title}</h2>
      <p className="text-sm text-cyntra-secondary">Owner: {contract.owner}</p>
      <p className="text-sm text-cyntra-secondary">Aangemaakt: {contract.createdAt}</p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <GateStatusCard gateStatus={status.gateStatus} />
        <KPIStatusCard redCount={status.redKPIcount} overallStatus={status.overallStatus} />
      </div>

      <div className="mt-4 text-sm text-cyntra-secondary">
        <p>Gates: {contract.gates.day30} / {contract.gates.day60} / {contract.gates.day90}</p>
        {contract.stopRule ? <p className="mt-1">Stopregel: {contract.stopRule}</p> : null}
      </div>
    </div>
  );
}

export default function ExecutionDashboard() {
  const contracts = getContracts();

  useEffect(() => {
    if (!contracts.length) return;
    const now = Date.now();
    const hasGate90Window = contracts.some((contract) => {
      const gateTs = new Date(contract.gates.day90).getTime();
      if (!Number.isFinite(gateTs)) return false;
      return Math.abs(now - gateTs) <= 7 * 24 * 60 * 60 * 1000;
    });
    if (!hasGate90Window) return;

    const adoptionRate =
      (contracts.filter((contract) => contract.kpis.every((kpi) => kpi.currentValue >= kpi.threshold)).length /
        Math.max(1, contracts.length)) *
      10;
    const computed = computeBoardIndex({
      sliders: [6.5, 7, 7, 7.5, 7],
      interventionState: {
        gateCompliance: adoptionRate,
        gateMissedCount: contracts.length - Math.round(adoptionRate),
      },
      executionMetrics: {
        adoptionWithin72hRate: adoptionRate,
        escalationResolutionScore: 7,
      },
      decisionHistory: {
        totalDecisions: contracts.length,
        reopenedDecisions: Math.max(0, Math.round(contracts.length * (1 - adoptionRate / 10))),
      },
    });

    void saveBoardIndexSnapshot({
      ...computed,
      analysisId: "execution:gate-90",
      createdAt: new Date().toISOString(),
    });
  }, [contracts]);

  return (
    <div className="p-8 bg-cyntra-primary min-h-screen">
      <BackToDashboard />
      <h1 className="text-2xl font-semibold mb-6 text-cyntra-gold tracking-[0.02em]">Executie Overzicht</h1>

      {contracts.length === 0 && (
        <p className="text-cyntra-secondary">Geen actieve Decision Contracts.</p>
      )}

      {contracts.map((contract) => (
        <ContractExecutionCard key={contract.id} contract={contract} />
      ))}
    </div>
  );
}
