import OrganizationLayout from "@/components/layout/OrganizationLayout";
import InterventionsBoard from "@/components/interventions/InterventionsBoard";

export default function InterventionsPage() {
  return (
    <OrganizationLayout
      title="Intervention Lifecycle"
      subtitle="Execution intervention control plane across active and historical decision cycles."
    >
      <InterventionsBoard />
    </OrganizationLayout>
  );
}
