import OrganizationLayout from "@/components/layout/OrganizationLayout";
import AdminControlPlane from "@/components/admin/AdminControlPlane";

export default function AdminPage() {
  return (
    <OrganizationLayout
      title="Admin"
      subtitle="Platform governance controls, RBAC posture validation, and manual compliance operations."
    >
      <AdminControlPlane />
    </OrganizationLayout>
  );
}
