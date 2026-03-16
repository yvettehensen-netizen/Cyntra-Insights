import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";
import StrategicAnalysisIntake from "./components/StrategicAnalysisIntake";
import { buildPortalReportPath } from "../portalPaths";

export default function StrategischeAnalyseSaaSPage() {
  const navigate = useNavigate();
  const [organisaties, setOrganisaties] = useState<any[]>([]);

  return (
    <PageShell
      title="Strategische analyse"
      subtitle="Start een nieuwe organisatieanalyse, run de Strategic Agent en sla het rapport direct op in het SaaS-platform."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Engine" value="Local only" hint="Geen demo-server, geen tweede analysepad." />
        <StatCard label="Publicatiegate" value="85+" hint="Alles onder premium-drempel wordt geblokkeerd." tone="blue" />
        <StatCard label="Organisaties" value={organisaties.length} hint="Actieve accounts in deze portalflow." tone="green" />
      </div>
      <Panel title="Nieuwe analyse starten">
        <StrategicAnalysisIntake
          buttonLabel="Analyse starten"
          onOrganizationsLoaded={setOrganisaties}
          onSessionCompleted={(reportId, payload) => {
            navigate(buildPortalReportPath(reportId), {
              state: {
                reportId,
                sessionId: payload?.sessionId,
                seededReportSession: payload,
              },
            });
          }}
        />
      </Panel>

      <Panel title="Organisaties in platform">
        {!organisaties.length ? (
          <EmptyState text="Nog geen organisaties geregistreerd." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {organisaties.map((org) => (
              <SurfaceCard key={org.organization_id} title={org.organisatie_naam} eyebrow={`${org.sector} • ${org.abonnementstype}`}>
                {(org.analyses ?? []).length} analyses geregistreerd binnen de lokale Cyntra-engine.
              </SurfaceCard>
            ))}
          </div>
        )}
      </Panel>
    </PageShell>
  );
}
