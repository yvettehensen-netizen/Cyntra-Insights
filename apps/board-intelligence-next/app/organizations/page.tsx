import OrganizationLayout from "@/components/layout/OrganizationLayout";
import OrganizationRegistry from "@/components/organizations/OrganizationRegistry";

export default function OrganizationsPage() {
  return (
    <OrganizationLayout
      title="Organization Scope"
      subtitle="Tenant-level governance boundary for multi-entity decision infrastructure."
    >
      <OrganizationRegistry />
    </OrganizationLayout>
  );
}
