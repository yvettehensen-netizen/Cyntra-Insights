import OrganizationLayout from "@/components/layout/OrganizationLayout";
import AnalysisRunsBoard from "@/components/analysis/AnalysisRunsBoard";

export default function AnalysisRunsPage() {
  return (
    <OrganizationLayout
      title="Analysis Runs"
      subtitle="Asynchronous model execution ledger with prompt/model governance lineage."
    >
      <AnalysisRunsBoard />
    </OrganizationLayout>
  );
}
