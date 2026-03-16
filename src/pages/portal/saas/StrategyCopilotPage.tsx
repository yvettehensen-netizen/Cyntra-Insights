import { useMemo, useState } from "react";
import type {
  CaseDatasetRecord,
  InterventionDatasetRecord,
  StrategicDatasetRecord,
} from "@/aurelius/data";
import { StrategyCopilotEngine } from "@/aurelius/copilot";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function mapRecords(rows: any[]): StrategicDatasetRecord[] {
  return (rows || []).map((row, idx) => ({
    dataset_id: normalize(row.dataset_id || row.record_id || `dataset-${idx + 1}`),
    sector: normalize(row.sector) || "Onbekende sector",
    probleemtype: normalize(row.probleemtype) || "overig",
    mechanismen: Array.isArray(row.mechanismen) ? row.mechanismen.map((x: unknown) => normalize(x)).filter(Boolean) : [],
    interventies: Array.isArray(row.interventies) ? row.interventies.map((x: unknown) => normalize(x)).filter(Boolean) : [],
    outcomes: Array.isArray(row.outcomes) ? row.outcomes.map((x: unknown) => normalize(x)).filter(Boolean) : [],
    created_at: normalize(row.created_at) || new Date().toISOString(),
  }));
}

function mapCases(rows: any[]): CaseDatasetRecord[] {
  return (rows || []).map((row, idx) => ({
    case_id: normalize(row.case_id) || `case-${idx + 1}`,
    organisation_name: normalize(row.organisation_name) || "Onbekende organisatie",
    sector: normalize(row.sector) || "Onbekende sector",
    probleemtype: normalize(row.probleemtype) || "overig",
    dominante_these: normalize(row.dominante_these) || "Niet beschikbaar",
    gekozen_strategie: normalize(row.gekozen_strategie) || "onbekend",
    interventie: normalize(row.interventie) || "onbekend",
    resultaat: normalize(row.resultaat) || "Resultaat niet beschikbaar",
    created_at: normalize(row.created_at) || new Date().toISOString(),
  }));
}

function mapInterventions(rows: any[]): InterventionDatasetRecord[] {
  return (rows || []).map((row, idx) => ({
    intervention_id: normalize(row.intervention_id) || `int-${idx + 1}`,
    sector: normalize(row.sector) || "Onbekende sector",
    probleemtype: normalize(row.probleemtype) || "overig",
    interventie: normalize(row.interventie) || "onbekend",
    impact: normalize(row.impact) || "Impact niet gespecificeerd",
    risico: normalize(row.risico) || "Risico niet gespecificeerd",
    succes_score: Number.isFinite(Number(row.succes_score)) ? Number(row.succes_score) : 0.5,
    created_at: normalize(row.created_at) || new Date().toISOString(),
  }));
}

export default function StrategyCopilotPage() {
  const api = usePlatformApiBridge();
  const copilot = useMemo(() => new StrategyCopilotEngine(), []);

  const [organisatie, setOrganisatie] = useState("");
  const [sector, setSector] = useState("Zorg/GGZ");
  const [vraag, setVraag] = useState("Moeten we consolideren of uitbreiden in de komende 12 maanden?");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Stel een strategische vraag aan de copilot.");
  const [result, setResult] = useState<ReturnType<StrategyCopilotEngine["ask"]> | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  async function stelVraag() {
    if (!normalize(vraag)) {
      setStatus("Voer eerst een vraag in.");
      return;
    }

    setLoading(true);
    setStatus("Strategisch antwoord wordt opgebouwd...");

    try {
      const [recordsRaw, casesRaw, interventionsRaw] = await Promise.all([
        api.datasetRecords(),
        api.cases(),
        api.interventions(),
      ]);

      const response = copilot.ask({
        vraag,
        sector,
        organisatie,
        conversation_id: conversationId,
        records: mapRecords(recordsRaw as any[]),
        cases: mapCases(casesRaw as any[]),
        interventions: mapInterventions(interventionsRaw as any[]),
      });

      setConversationId(response.conversation_id);
      setResult(response);
      setStatus("Strategisch antwoord gereed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Copilot kon de vraag niet verwerken.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Strategy Copilot"
      subtitle="Stel realtime strategische vragen. De copilot combineert inzichten uit de analyse-engines, kennisgraph, benchmark en signalen."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Sector" value={sector} hint="Domein waarin de vraag wordt beantwoord." />
        <StatCard label="Gesprek" value={conversationId || "Nieuw"} hint="Doorlopende bestuursdialoog." tone="blue" />
        <StatCard label="Status" value={loading ? "Bezig" : "Gereed"} hint="Realtime antwoord op basis van lokale kennislaag." tone="green" />
        <StatCard label="Organisatie" value={organisatie || "-"} hint="Optionele context voor meer gericht advies." />
      </div>
      <Panel title="Vraag aan de CEO-copilot">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-gray-200">
            Organisatie
            <input
              className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2"
              value={organisatie}
              onChange={(e) => setOrganisatie(e.target.value)}
            />
          </label>
          <label className="text-sm text-gray-200">
            Sector
            <input
              className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            />
          </label>
          <label className="text-sm text-gray-200">
            Gesprek
            <input
              className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2"
              value={conversationId || "Nieuw gesprek"}
              onChange={(e) => setConversationId(normalize(e.target.value) || undefined)}
            />
          </label>
        </div>

        <label className="mt-3 block text-sm text-gray-200">
          Strategische vraag
          <textarea
            className="mt-1 min-h-[96px] w-full rounded-lg border border-white/20 bg-black/20 p-3"
            value={vraag}
            onChange={(e) => setVraag(e.target.value)}
            placeholder="Bijv. Moeten we consolideren, verbreden of investeren?"
          />
        </label>

        <div className="mt-3 flex items-center gap-3">
          <button
            disabled={loading}
            onClick={() => void stelVraag()}
            className="rounded-md bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Bezig..." : "Vraag stellen"}
          </button>
          <span className="text-xs text-gray-300">{status}</span>
        </div>
      </Panel>

      <Panel title="Strategisch antwoord">
        {!result ? (
          <EmptyState text="Nog geen antwoord. Stel je eerste vraag." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 text-sm text-gray-200">
            <SurfaceCard title="Strategisch advies" eyebrow={`Confidence: ${Math.round(result.recommendation.confidence * 100)}%`}>
              {result.recommendation.strategisch_advies}
            </SurfaceCard>
            <SurfaceCard title="Benchmark en signalen">
              <p>{result.recommendation.benchmark_samenvatting}</p>
              <p className="mt-2 text-gray-300">Signalen: {result.recommendation.signaal_samenvatting}</p>
            </SurfaceCard>
            <article className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <h3 className="text-sm font-semibold text-white">Risico-analyse</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.recommendation.risico_analyse.map((item, idx) => (
                  <li key={`${idx}-${item}`}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <h3 className="text-sm font-semibold text-white">Aanbevolen acties</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.recommendation.interventies.map((item, idx) => (
                  <li key={`${idx}-${item}`}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        )}
      </Panel>

      <Panel title="Gesprekscontext">
        {!result?.conversation?.turns?.length ? (
          <EmptyState text="Nog geen gespreksgeschiedenis." />
        ) : (
          <div className="space-y-2 text-sm">
            {result.conversation.turns.slice(-8).map((turn, idx) => (
              <article key={`${turn.created_at}-${idx}`} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-400">{turn.role === "ceo" ? "CEO" : "Strategy Copilot"}</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-200">{turn.message}</p>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </PageShell>
  );
}
