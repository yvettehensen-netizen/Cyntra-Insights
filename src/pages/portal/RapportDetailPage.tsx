import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import BackToDashboard from "@/components/navigation/BackToDashboard";

/* ✅ CANONIEK: bestuurs-executieplan */
import ExecutionPlan90D from "@/aurelius/components/report/ExecutionPlan90D";

import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
} from "lucide-react";

/* =======================
   Types
======================= */

interface AnalysisResult {
  executive_summary?: string;
  insights?: string[];
  risks?: string[];
  opportunities?: string[];
  decision_contract?: any;
  decision_gate?: any;
  decision_failure_text?: string | null;
}

interface AnalysisRecord {
  id: string;
  analysis_type: string;
  created_at: string;
  result: AnalysisResult;
  input_data?: {
    companyName?: string;
  };

  /**
   * ✅ NIEUW CANONIEK:
   * Execution plan op bestuursniveau
   * (gegenereerd via generate90DayPlan)
   */
  execution_plan?: {
    objective: string;
    months: {
      month: number;
      focus: string;
      steps: {
        week: number;
        action: string;
        owner: string;
        metric: string;
      }[];
    }[];
  };
}

/* =======================
   Component
======================= */

export default function RapportDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [report, setReport] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchSession = async (): Promise<AnalysisRecord> => {
      const res = await fetch(`/api/analysis-sessions/${encodeURIComponent(id)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          typeof json?.error === "string" ? json.error : "Rapport niet gevonden.";
        throw new Error(message);
      }

      const session = (json?.session ?? {}) as Record<string, any>;
      const resultPayload =
        (session.output as AnalysisResult | undefined) ||
        {};

      return {
        id: String(session.id || id),
        analysis_type: String(session.analysis_type || "analysis"),
        created_at: String(session.created_at || session.updated_at || new Date().toISOString()),
        result: resultPayload,
        input_data: {
          companyName: String(
            session.organization_name ||
              session.organization_id ||
              "Organisatie"
          ),
        },
        execution_plan:
          (resultPayload as any)?.execution_plan ??
          (resultPayload as any)?.roadmap_90d ??
          undefined,
      };
    };
    fetchSession()
      .then((mapped) => {
        if (cancelled) return;
        setReport(mapped);
      })
      .catch(() => {
        if (cancelled) return;
        setReport(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="cyntra-shell flex items-center justify-center text-xl text-cyntra-secondary">
        Rapport laden…
      </div>
    );
  }

  if (!report) {
    return (
      <div className="cyntra-shell flex items-center justify-center text-xl text-cyntra-secondary">
        Rapport niet gevonden.
      </div>
    );
  }

  const {
    result,
    created_at,
    analysis_type,
    input_data,
    execution_plan,
  } = report;

  const decisionContract =
    (result as any)?.decision_contract ||
    (result as any)?.decisionContract ||
    (result as any)?.decision_gate?.contract ||
    null;

  const decisionFailureText =
    (result as any)?.decision_failure_text ||
    (result as any)?.decisionFailureText ||
    (result as any)?.decision_gate?.failure_text ||
    null;

  const decisionScore =
    (result as any)?.decision_gate?.score?.total ?? null;

  const formattedDate = new Date(created_at).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="cyntra-shell">
      <BackToDashboard />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-40 space-y-40">

        {/* ================= HEADER ================= */}
        <header>
          <p className="text-xs tracking-[0.35em] text-cyntra-gold uppercase mb-6">
            Cyntra Insights · Confidential
          </p>

          <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-8 normal-case">
            {analysis_type.charAt(0).toUpperCase() + analysis_type.slice(1)} Analyse
          </h1>

          <div className="flex items-center gap-8 text-lg text-cyntra-secondary">
            <span className="text-cyntra-primary font-medium">
              {input_data?.companyName || "Organisatie"}
            </span>

            <span className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-cyntra-gold" />
              {formattedDate}
            </span>
          </div>

          <div className="mt-12 h-px w-40 bg-[#D4AF37]/60" />
        </header>

        {/* ================= EXECUTIVE SUMMARY ================= */}
        {result.executive_summary && (
          <section>
            <p className="text-xs tracking-[0.3em] text-cyntra-gold uppercase mb-10">
              Executive Verdict
            </p>

            <div className="border-l-4 border-[#D4AF37] pl-12">
              <p className="text-3xl font-light leading-relaxed text-cyntra-primary whitespace-pre-line">
                {result.executive_summary}
              </p>
            </div>
          </section>
        )}

        {/* ================= BESLUITCONTRACT ================= */}
        {(decisionFailureText || decisionContract) && (
          <section className="cyntra-panel rounded-3xl p-10 space-y-6">
            <p className="text-xs tracking-[0.3em] text-cyntra-gold uppercase">
              Besluitcontract
            </p>

            {decisionFailureText && (
              <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-6 text-red-200">
                {sanitizeText(String(decisionFailureText))}
              </div>
            )}

            {!decisionFailureText && decisionContract && (
              <div className="space-y-4 text-cyntra-primary">
                {typeof decisionContract === "string" ? (
                  <p>{sanitizeText(decisionContract)}</p>
                ) : (
                  <div className="space-y-3">
                    <DecisionRow label="Besluit" value={decisionContract.decision_statement} />
                    <DecisionRow label="Owner" value={decisionContract.owner} />
                    <DecisionRow label="Scope" value={decisionContract.scope} />
                    <DecisionRow label="Onomkeerbaar" value={decisionContract.irreversible_action} />
                    <DecisionRow
                      label="Consequence"
                      value={decisionContract.consequence_if_not_executed}
                    />
                    <DecisionRow
                      label="Window (dagen)"
                      value={String(decisionContract.execution_window_days ?? "")}
                    />
                    <DecisionRow
                      label="Eerste signaal"
                      value={decisionContract.first_execution_signal}
                    />
                    <DecisionRow
                      label="Failure mode"
                      value={decisionContract.failure_mode_if_ignored}
                    />
                  </div>
                )}

                {decisionScore !== null && (
                  <p className="text-xs text-cyntra-secondary">
                    Score: {decisionScore} / 100
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* ================= INSIGHTS ================= */}
        {result.insights?.length ? (
          <section>
            <h2 className="text-4xl font-semibold mb-24 normal-case">
              Kerninzichten
            </h2>

            <div className="space-y-24">
              {result.insights.map((insight, i) => (
                <div key={i} className="flex gap-12">
                  <div className="text-5xl font-light text-[#D4AF37]/30 w-16">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-2xl leading-relaxed text-cyntra-primary max-w-3xl">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ================= RISKS ================= */}
        {result.risks?.length ? (
          <section>
            <div className="flex items-center gap-4 mb-12">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h2 className="text-4xl font-semibold text-red-400 normal-case">
                Risico bij niet-handelen
              </h2>
            </div>

            <div className="space-y-12 max-w-3xl">
              {result.risks.map((risk, i) => (
                <p
                  key={i}
                  className="text-2xl leading-relaxed text-cyntra-secondary border-l-2 border-red-400/40 pl-10"
                >
                  {risk}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        {/* ================= OPPORTUNITIES ================= */}
        {result.opportunities?.length ? (
          <section>
            <h2 className="text-4xl font-semibold mb-20 normal-case">
              Strategische kansen
            </h2>

            <ul className="space-y-10 text-2xl text-cyntra-primary max-w-3xl">
              {result.opportunities.map((opportunity, i) => (
                <li key={i} className="flex gap-8">
                  <span className="text-[#D4AF37] font-medium">
                    {i + 1}.
                  </span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ================= 90-DAGEN EXECUTIEPLAN ================= */}
        {execution_plan && (
          <section className="cyntra-panel border-[#D4AF37]/40 rounded-3xl p-8 md:p-12 shadow-3xl">
            <ExecutionPlan90D plan={execution_plan} />
          </section>
        )}

        {/* ================= FOOTER ================= */}
        <footer className="pt-24 border-t border-white/10">
          <Link
            to="/portal/rapporten"
            className="inline-flex items-center gap-4 text-xl text-[#D4AF37] hover:text-white transition"
          >
            <ArrowLeft className="w-6 h-6" />
            Terug naar rapporten
          </Link>
        </footer>

      </main>
    </div>
  );
}

function DecisionRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p>
      <span className="text-cyntra-secondary">{label}:</span>{" "}
      {sanitizeText(value)}
    </p>
  );
}

function sanitizeText(value: string): string {
  return value
    .replace(/\*+/g, "")
    .replace(/HGBCO/gi, "")
    .replace(/primary structural failure/gi, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[•]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}
