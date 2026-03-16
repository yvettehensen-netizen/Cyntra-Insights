import { useEffect, useState } from "react";
import type { SubscriptionType } from "@/platform";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";

export default function InstellingenSaaSPlatformPage() {
  const api = usePlatformApiBridge();
  const [organizations, setOrganizations] = useState<any[]>([]);

  async function load() {
    const rows = await api.listOrganizations();
    setOrganizations(rows || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateSubscription(org: any, abonnementstype: SubscriptionType) {
    await api.upsertOrganization({
      organization_id: org.organization_id,
      organisatie_naam: org.organisatie_naam,
      sector: org.sector,
      organisatie_grootte: org.organisatie_grootte,
      abonnementstype,
    });
    await load();
  }

  return (
    <PageShell title="Instellingen" subtitle="Beheer account- en abonnementinstellingen voor organisaties in het SaaS-platform.">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Organisaties" value={organizations.length} hint="Actieve accounts in de portal." />
        <StatCard
          label="Professional+"
          value={organizations.filter((org) => org.abonnementstype !== "Starter").length}
          hint="Accounts met hogere analysecapaciteit."
          tone="blue"
        />
        <StatCard
          label="Enterprise"
          value={organizations.filter((org) => org.abonnementstype === "Enterprise").length}
          hint="Strategische klanten op hoogste niveau."
          tone="green"
        />
      </div>
      <Panel title="Abonnementenbeheer">
        {!organizations.length ? <EmptyState text="Nog geen organisaties om te beheren." /> : (
          <div className="grid gap-4 xl:grid-cols-2">{organizations.map((org) => (
            <SurfaceCard key={org.organization_id} title={org.organisatie_naam} eyebrow={`${org.sector} • ${org.organisatie_grootte}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-300">
                  Huidig niveau: <span className="font-semibold text-white">{org.abonnementstype}</span>
                </p>
                <select className="rounded-lg border border-white/20 bg-black/20 p-2 text-sm text-white" value={org.abonnementstype} onChange={(e) => void updateSubscription(org, e.target.value as SubscriptionType)}>
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </SurfaceCard>
          ))}</div>
        )}
      </Panel>
    </PageShell>
  );
}
