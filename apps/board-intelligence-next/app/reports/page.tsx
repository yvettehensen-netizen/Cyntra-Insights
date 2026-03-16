import OrganizationLayout from "@/components/layout/OrganizationLayout";
import ReportsRegistry from "@/components/reports/ReportsRegistry";

export default function ReportsPage() {
  return (
    <OrganizationLayout
      title="Report Registry"
      subtitle="Versioned report artifacts linked to cycle state and audit lineage."
    >
      <ReportsRegistry />
    </OrganizationLayout>
  );
}
