import OrganizationLayout from "@/components/layout/OrganizationLayout";
import DecisionCycleWorkspace from "@/components/decision-cycle/DecisionCycleWorkspace";

export default async function DecisionCycleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <OrganizationLayout
      title={`Decision Cycle ${id}`}
      subtitle="Realtime orchestration view across analysis, decision, intervention, governance, and audit streams."
    >
      <DecisionCycleWorkspace decisionCycleId={id} />
    </OrganizationLayout>
  );
}
