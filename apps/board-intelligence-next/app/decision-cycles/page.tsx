import OrganizationLayout from "@/components/layout/OrganizationLayout";
import DecisionCycleRegistry from "@/components/decision-cycle/DecisionCycleRegistry";

export default function DecisionCyclesPage() {
  return (
    <OrganizationLayout
      title="Decision Cycle Registry"
      subtitle="Canonical governance aggregate for strategic decision orchestration."
    >
      <DecisionCycleRegistry />
    </OrganizationLayout>
  );
}
