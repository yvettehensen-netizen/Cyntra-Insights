import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import ActionPlan90Days, {
  MonthPlan,
} from "@/aurelius/components/report/ActionPlan90Days";

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
}

interface AnalysisRecord {
  id: string;
  analysis_type: string;
  created_at: string;
  result: AnalysisResult;
  input_data?: {
    companyName?: string;
  };
  action_plan?: MonthPlan[];
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

    supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setReport(data as AnalysisRecord);
        setLoading(false);
      });
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

  const { result, created_at, analysis_type, input_data, action_plan } = report;

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

        {/* ================= INSIGHTS ================= */}
        {result.insights?.length && (
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
        )}

        {/* ================= RISKS ================= */}
        {result.risks?.length && (
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
        )}

        {/* ================= OPPORTUNITIES ================= */}
        {result.opportunities?.length && (
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
        )}

        {/* ================= 90-DAGEN ACTIEPLAN ================= */}
        {action_plan && action_plan.length > 0 && (
          <section className="border border-[#D4AF37]/40 bg-black/40 backdrop-blur-xl rounded-3xl p-20 shadow-3xl">
            <ActionPlan90Days plans={action_plan} />
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
