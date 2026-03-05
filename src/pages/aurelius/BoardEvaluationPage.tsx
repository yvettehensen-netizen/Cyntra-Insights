import { FormEvent, useEffect, useMemo, useState } from "react";
import { Download, Loader2, Save } from "lucide-react";
import { BoardScorecard } from "@/components/aurelius/board-evaluation";
import BackToDashboard from "@/components/navigation/BackToDashboard";
import {
  aggregateBoardEvaluations,
  normalizeBoardScores,
  toBoardEvaluationOutput,
  type BoardEvaluationRow,
  type BoardEvaluationScores,
} from "@/cyntra/board-evaluation";
import {
  fetchBoardEvaluations,
  resolveActiveOrganisationId,
  submitBoardEvaluation,
} from "@/api/boardEvaluation";
import { exportBoardEvaluationPdf } from "@/cyntra/board-evaluation/exportBoardEvaluationPdf";
import { supabase } from "@/lib/supabaseClient";
import {
  computeBoardIndex,
  type BoardIndexResult,
} from "@/aurelius/governance/BoardLegitimacyEngine";
import {
  getBoardIndexSnapshot,
  saveBoardIndexSnapshot,
} from "@/aurelius/storage/BoardIndexRepository";

const SCORE_KEYS: Array<keyof BoardEvaluationScores> = [
  "clarity_score",
  "decision_certainty",
  "risk_understanding",
  "governance_trust",
  "instrument_perception",
];

const SCORE_LABELS: Record<keyof BoardEvaluationScores, string> = {
  clarity_score: "Helderheid",
  decision_certainty: "Besluitzekerheid",
  risk_understanding: "Risicobegrip",
  governance_trust: "Besturingsvertrouwen",
  instrument_perception: "Instrument vs Rapport perceptie",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("nl-NL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BoardEvaluationPage() {
  const [boardMemberId, setBoardMemberId] = useState<string>("");
  const [organisationId, setOrganisationId] = useState<string>("");
  const [scores, setScores] = useState<BoardEvaluationScores>({
    clarity_score: 7,
    decision_certainty: 7,
    risk_understanding: 7,
    governance_trust: 7,
    instrument_perception: 7,
  });
  const [rows, setRows] = useState<BoardEvaluationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveBoardIndex, setLiveBoardIndex] = useState<BoardIndexResult | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setLoading(true);
      setError(null);

      try {
        const sessionRes = await supabase.auth.getSession();
        const userId = sessionRes.data.session?.user?.id ?? "";
        if (!userId) {
          throw new Error("Geen ingelogde gebruiker gevonden.");
        }

        const orgId = await resolveActiveOrganisationId(userId);
        const data = await fetchBoardEvaluations(orgId);

        if (!active) return;
        setBoardMemberId(userId);
        setOrganisationId(orgId);
        setRows(data);

        const stored = await getBoardIndexSnapshot(`org:${orgId}:board-evaluation`);
        if (stored) {
          setLiveBoardIndex({
            baliScore: stored.baliScore,
            classification: stored.classification,
            spread: stored.spread,
            reliabilityBand: stored.reliabilityBand,
          });
        }
      } catch (bootstrapError) {
        if (!active) return;
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : "Board Adoption & Legitimiteitsindex laden mislukt."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const aggregate = useMemo(() => aggregateBoardEvaluations(rows), [rows]);
  const latestOutput = useMemo(() => {
    const latest = rows[0];
    return latest ? toBoardEvaluationOutput(latest) : null;
  }, [rows]);
  const computedFromRows = useMemo(() => {
    return computeBoardIndex({
      sliders: SCORE_KEYS.map((key) => scores[key]),
      interventionState: {
        gateCompliance: aggregate.overall_average,
        gateMissedCount: Math.max(0, 5 - Math.round(aggregate.overall_average / 2)),
      },
      executionMetrics: {
        adoptionWithin72hRate: aggregate.averages.governance_trust,
        escalationResolutionScore: aggregate.averages.risk_understanding,
      },
      decisionHistory: {
        totalDecisions: rows.length || 1,
        reopenedDecisions: Math.max(
          0,
          Math.round((10 - aggregate.averages.decision_certainty) / 2)
        ),
      },
    });
  }, [aggregate, rows.length, scores]);

  async function refreshRows(orgId: string) {
    const data = await fetchBoardEvaluations(orgId);
    setRows(data);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    setError(null);

    try {
      if (!boardMemberId || !organisationId) {
        throw new Error("Board member of organisatie ontbreekt.");
      }

      const normalized = normalizeBoardScores(scores);
      const inserted = await submitBoardEvaluation({
        board_member_id: boardMemberId,
        organisation_id: organisationId,
        ...normalized,
      });

      setRows((current) => [inserted, ...current]);
      const boardIndex = computeBoardIndex({
        sliders: SCORE_KEYS.map((key) => normalized[key]),
        interventionState: {
          gateCompliance: normalized.decision_certainty,
          gateMissedCount: Math.max(0, 10 - Math.round(normalized.decision_certainty)),
        },
        executionMetrics: {
          adoptionWithin72hRate: normalized.governance_trust,
          escalationResolutionScore: normalized.risk_understanding,
        },
        decisionHistory: {
          totalDecisions: rows.length + 1,
          reopenedDecisions: Math.max(
            0,
            Math.round((10 - normalized.decision_certainty) / 2)
          ),
        },
      });
      setLiveBoardIndex(boardIndex);
      await saveBoardIndexSnapshot({
        ...boardIndex,
        analysisId: `org:${organisationId}:board-evaluation`,
        organisationId,
        createdAt: new Date().toISOString(),
      });
      setStatus("Board Adoption & Legitimiteitsindex opgeslagen.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Opslaan Board Adoption & Legitimiteitsindex mislukt."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleExportPdf() {
    setError(null);
    try {
      if (!organisationId) {
        throw new Error("Geen actieve organisatie gevonden.");
      }

      await exportBoardEvaluationPdf({
        organisationId,
        aggregate,
        rows: rows.map((row) => toBoardEvaluationOutput(row)),
      });
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "PDF export mislukt."
      );
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 pb-10 md:px-8">
        <div className="flex h-[58vh] items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#0f141c] px-4 py-2 text-sm text-white/80">
            <Loader2 className="h-4 w-4 animate-spin" />
            Board Adoption & Legitimiteitsindex laden
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-4 px-4 pb-10 md:px-8">
      <BackToDashboard />
      <section className="rounded-3xl border border-white/10 bg-[#0f141c] p-6">
        <header className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
            Board Adoption & Legitimiteitsindex
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            Objectieve meting van bestuurlijke adoptie en legitimiteit
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Route: <span className="font-mono text-white/80">/aurelius/board-evaluation</span>
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          {SCORE_KEYS.map((key) => (
            <ScoreField
              key={key}
              label={SCORE_LABELS[key]}
              value={scores[key]}
              onChange={(next) => {
                setScores((current) => ({
                  ...current,
                  [key]: next,
                }));
              }}
            />
          ))}

          <div className="md:col-span-2 flex flex-wrap items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Opslaan..." : "Opslaan evaluatie"}
            </button>
            <button
              type="button"
              onClick={() => void refreshRows(organisationId)}
              disabled={!organisationId}
              className="rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white/85"
            >
              Vernieuwen
            </button>
            <button
              type="button"
              onClick={() => void handleExportPdf()}
              disabled={!rows.length || !organisationId}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white/85 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Exporteer PDF
            </button>
          </div>
        </form>

        {status ? (
          <p className="mt-3 rounded-xl border border-emerald-400/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-xl border border-red-400/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-4 rounded-2xl border border-[#D4AF37]/30 bg-[#14100a] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#f3d983]">
            Live BALI
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {(liveBoardIndex?.baliScore ?? computedFromRows.baliScore).toFixed(2)} ·{" "}
            {liveBoardIndex?.classification ?? computedFromRows.classification}
          </p>
          <p className="mt-1 text-xs text-white/70">
            Reliability band:{" "}
            {(liveBoardIndex?.reliabilityBand.low ?? computedFromRows.reliabilityBand.low).toFixed(2)} -{" "}
            {(liveBoardIndex?.reliabilityBand.high ?? computedFromRows.reliabilityBand.high).toFixed(2)}
          </p>
        </div>
      </section>

      <BoardScorecard aggregate={aggregate} />

      <section className="rounded-3xl border border-white/10 bg-[#0f141c] p-5">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
              Scoremodel Output
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Laatste evaluatie-object
            </h2>
          </div>
          <span className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white/70">
            productiedata
          </span>
        </header>

        <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b1017] p-4 text-xs leading-relaxed text-white/85">
          {JSON.stringify(latestOutput, null, 2)}
        </pre>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f141c] p-5">
        <header className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
            Historie
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Recente legitimiteitsmetingen
          </h2>
        </header>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead className="bg-white/5 text-left text-white/75">
              <tr>
                <th className="px-3 py-2 font-medium">Timestamp</th>
                <th className="px-3 py-2 font-medium">Board-lid</th>
                <th className="px-3 py-2 font-medium">Helderheid</th>
                <th className="px-3 py-2 font-medium">Besluitzekerheid</th>
                <th className="px-3 py-2 font-medium">Risicobegrip</th>
                <th className="px-3 py-2 font-medium">Besturing</th>
                <th className="px-3 py-2 font-medium">Instrument</th>
                <th className="px-3 py-2 font-medium">Overall</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.slice(0, 50).map((row) => (
                  <tr key={row.id} className="border-t border-white/10 text-white/90">
                    <td className="px-3 py-2">{formatDate(row.created_at)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.board_member_id}</td>
                    <td className="px-3 py-2">{row.clarity_score.toFixed(1)}</td>
                    <td className="px-3 py-2">{row.decision_certainty.toFixed(1)}</td>
                    <td className="px-3 py-2">{row.risk_understanding.toFixed(1)}</td>
                    <td className="px-3 py-2">{row.governance_trust.toFixed(1)}</td>
                    <td className="px-3 py-2">{row.instrument_perception.toFixed(1)}</td>
                    <td className="px-3 py-2 font-semibold">{row.overall_score.toFixed(1)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-7 text-center text-white/60">
                    Nog geen evaluaties geregistreerd voor deze organisatie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ScoreField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
      <span className="text-sm text-white/85">{label}</span>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full"
          aria-label={label}
        />
        <span className="w-11 rounded-lg border border-white/20 bg-white/5 px-2 py-1 text-center text-sm text-white">
          {value.toFixed(1)}
        </span>
      </div>
    </label>
  );
}
