import { useEffect, useMemo, useState } from "react";
import { EmptyState, PageShell, Panel } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";
import { formatReportCode } from "./reportIdentity";
import { isSessionCompleted } from "@/platform/types";

export default function VoorspellingenPage() {
  const api = usePlatformApiBridge();
  const [sessions, setSessions] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    void Promise.all([api.listSessions(), api.predictions()]).then(([rows, predictedRows]) => {
      setSessions((rows || []).filter((row: any) => isSessionCompleted(row?.status)));
      setPredictions(predictedRows || []);
    });
  }, []);

  const voorspellingen = useMemo(
    () =>
      predictions.length
        ? predictions.map((item: any) => ({
            session_id: item.sector || "Multi-sector",
            interventie: item.interventie,
            impact: `Kans ${Math.round((item.kans || 0) * 100)}% • Succesratio ${Math.round((item.succesratio || 0) * 100)}%`,
            risico: `Risicotrend: ${item.risico_trend || "onbekend"}`,
            kpi_effect: `Gebaseerd op ${item.bron_cases || 0} historische cases`,
            confidence: item.succesratio ?? "onbekend",
          }))
        : sessions.flatMap((session) =>
            (session.intervention_predictions || []).map((item: any) => ({
              session_id: session.session_id,
              interventie: item.interventie,
              impact: item.impact,
              risico: item.risico,
              kpi_effect: item.kpi_effect,
              confidence: item.confidence,
            }))
          ),
    [predictions, sessions]
  );

  return (
    <PageShell title="Voorspellingen" subtitle="Voorspelde interventie-impact op basis van historische cases, signalen en strategische patronen.">
      <Panel title="Interventievoorspellingen">
        {!voorspellingen.length ? (
          <EmptyState text="Nog geen voorspellingen beschikbaar. Start eerst analyses of autopilot." />
        ) : (
          <div className="space-y-3">
            {voorspellingen.slice(0, 20).map((item, idx) => (
              <article key={`${item.session_id}-${idx}`} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-white">{item.interventie || "Onbekende interventie"}</h3>
                <p className="mt-1 text-xs text-gray-300">Rapportcode: {formatReportCode(item.session_id)} • Confidence: {item.confidence || "onbekend"}</p>
                <p className="mt-2 text-sm text-gray-200"><strong>Impact:</strong> {item.impact || "Onbekend"}</p>
                <p className="mt-1 text-sm text-gray-200"><strong>Risico:</strong> {item.risico || "Onbekend"}</p>
                <p className="mt-1 text-sm text-gray-200"><strong>KPI-effect:</strong> {item.kpi_effect || "Onbekend"}</p>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </PageShell>
  );
}
