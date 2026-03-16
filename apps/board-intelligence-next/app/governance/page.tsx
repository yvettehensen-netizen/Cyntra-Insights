import OrganizationLayout from "@/components/layout/OrganizationLayout";
import GovernanceOverview from "@/components/governance/GovernanceOverview";

export default function GovernancePage() {
  return (
    <OrganizationLayout
      title="Governance Layer"
      subtitle="Control surface for DSI posture, metric governance, and strategic discipline."
    >
      <GovernanceOverview />
    </OrganizationLayout>
  );
}
