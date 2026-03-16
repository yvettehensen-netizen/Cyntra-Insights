import OrganizationLayout from "@/components/layout/OrganizationLayout";
import AuditFeed from "@/components/audit/AuditFeed";

export default function AuditPage() {
  return (
    <OrganizationLayout
      title="Audit Trail"
      subtitle="Hash-chained governance event stream for compliance, forensics, and defensible oversight."
    >
      <AuditFeed />
    </OrganizationLayout>
  );
}
