import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

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

    fetch(`/api/analyses/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message =
            typeof json?.error === "string" ? json.error : "Rapport niet gevonden.";
          throw new Error(message);
        }

        const analysis = (json?.analysis ?? {}) as Record<string, any>;
        const resultPayload =
          (analysis.result_payload as AnalysisResult | undefined) ||
          (analysis.result as AnalysisResult | undefined) ||
          {};
        const inputPayload = (analysis.input_payload ?? {}) as Record<string, any>;

        const mapped: AnalysisRecord = {
          id: String(analysis.id || id),
          analysis_type: String(analysis.analysis_type || analysis.type || "executive"),
          created_at: String(analysis.created_at || new Date().toISOString()),
          result: resultPayload,
          input_data: {
            companyName: String(
              inputPayload.organization_name ||
                inputPayload.companyName ||
                analysis.organization_id ||
                "Organisatie"
            ),
          },
          execution_plan:
            (resultPayload as any)?.execution_plan ??
            (resultPayload as any)?.roadmap_90d ??
            undefined,
        };

        return mapped;
      })
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
      <div className="min-h-screen bg-[#0A090A] text-gray-500 flex items-center justify-center text-xl">
        Rapport laden…
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0A090A] text-gray-500 flex items-center justify-center text-xl">
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
    <div className="min-h-screen bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] text-white">
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-40 space-y-40">

        {/* ================= HEADER ================= */}
        <header>
          <p className="text-xs tracking-[0.35em] text-[#D4AF37] uppercase mb-6">
            Cyntra Insights · Confidential
          </p>

          <h1 className="text-6xl font-bold leading-tight mb-8">
            {analysis_type.charAt(0).toUpperCase() + analysis_type.slice(1)} Analyse
          </h1>

          <div className="flex items-center gap-8 text-lg text-gray-400">
            <span className="text-white font-medium">
              {input_data?.companyName || "Organisatie"}
            </span>

            <span className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              {formattedDate}
            </span>
          </div>

          <div className="mt-12 h-px w-40 bg-[#D4AF37]/60" />
        </header>

        {/* ================= EXECUTIVE SUMMARY ================= */}
        {result.executive_summary && (
          <section>
            <p className="text-xs tracking-[0.3em] text-[#D4AF37] uppercase mb-10">
              Executive Verdict
            </p>

            <div className="border-l-4 border-[#D4AF37] pl-12">
              <p className="text-3xl font-light leading-relaxed text-gray-200 whitespace-pre-line">
                {result.executive_summary}
              </p>
            </div>
          </section>
        )}

        {/* ================= BESLUITCONTRACT ================= */}
        {(decisionFailureText || decisionContract) && (
          <section className="rounded-3xl border border-[#D4AF37]/30 bg-black/60 p-10 space-y-6">
            <p className="text-xs tracking-[0.3em] text-[#D4AF37] uppercase">
              Besluitcontract
            </p>

            {decisionFailureText && (
              <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-6 text-red-200">
                {sanitizeText(String(decisionFailureText))}
              </div>
            )}

            {!decisionFailureText && decisionContract && (
              <div className="space-y-4 text-white/80">
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
                  <p className="text-xs text-white/40">
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
            <h2 className="text-4xl font-bold mb-24">
              Kerninzichten
            </h2>

            <div className="space-y-24">
              {result.insights.map((insight, i) => (
                <div key={i} className="flex gap-12">
                  <div className="text-5xl font-light text-[#D4AF37]/30 w-16">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-2xl leading-relaxed text-gray-200 max-w-3xl">
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
              <h2 className="text-4xl font-bold text-red-400">
                Risico bij niet-handelen
              </h2>
            </div>

            <div className="space-y-12 max-w-3xl">
              {result.risks.map((risk, i) => (
                <p
                  key={i}
                  className="text-2xl leading-relaxed text-gray-300 border-l-2 border-red-400/40 pl-10"
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
            <h2 className="text-4xl font-bold mb-20">
              Strategische kansen
            </h2>

            <ul className="space-y-10 text-2xl text-gray-200 max-w-3xl">
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
          <section className="border border-[#D4AF37]/40 bg-black/40 backdrop-blur-xl rounded-3xl p-20 shadow-3xl">
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
      <span className="text-white/50">{label}:</span>{" "}
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
