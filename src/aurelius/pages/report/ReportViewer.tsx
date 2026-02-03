// src/pages/portal/rapport/ReportViewer.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AureliusNavbar from "@/aurelius/components/AureliusNavbar";
import ActionPlan90Days from "@/aurelius/components/report/ActionPlan90Days";
import { ANALYSIS_RESULTS } from "@/aurelius/config/analysisResultsContent";

import { AlertCircle, Lock, Calendar, User } from "lucide-react";

export default function ReportViewer() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Geen rapport ID gevonden");
      setLoading(false);
      return;
    }

    async function fetchReport() {
      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("*, action_plan, core_tensions, not_addressed")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Rapport niet gevonden");

        setReport(data);
      } catch (err: any) {
        setError(err.message || "Kon rapport niet laden");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A090A] to-[#0A090A] flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="w-24 h-24 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-2xl text-gray-300">Rapport laden…</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A090A] to-[#0A090A] flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md">
          <AlertCircle size={80} className="text-red-500 mx-auto" />
          <p className="text-2xl text-gray-300">{error || "Rapport niet gevonden"}</p>
        </div>
      </div>
    );
  }

  const analysisConfig = ANALYSIS_RESULTS[report.analysis_type as keyof typeof ANALYSIS_RESULTS];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] text-white overflow-hidden">
      {/* Luxe glow background */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-[-200px] left-[-200px] w-[900px] h-[900px] bg-[#D4AF37]/10 rounded-full blur-[300px] animate-pulse" />
        <div className="absolute bottom-[-300px] right-[-300px] w-[1000px] h-[1000px] bg-[#8B1538]/10 rounded-full blur-[300px] animate-pulse animation-delay-2000" />
      </div>

      <AureliusNavbar />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-40">
        {/* Rapport Header */}
        <header className="text-center mb-32">
          <div className="inline-flex items-center gap-6 px-12 py-6 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/50 shadow-3xl mb-20">
            <Lock size={36} className="text-[#D4AF37]" />
            <span className="text-xl font-bold text-[#D4AF37] tracking-widest">
              AURELIUS RAPPORT — VOLLEDIG VERTROUWELIJK
            </span>
          </div>

          <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-16">
            {report.input_data?.companyName || "Organisatie"}<br />
            <span className="text-[#D4AF37]">{analysisConfig?.title || "Analyse"}</span>
          </h1>

          <div className="flex items-center justify-center gap-12 text-lg text-gray-400">
            <div className="flex items-center gap-3">
              <Calendar size={24} />
              <span>{new Date(report.created_at).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}</span>
            </div>
            <div className="flex items-center gap-3">
              <User size={24} />
              <span>Interne analyse</span>
            </div>
          </div>
        </header>

        {/* Executive Summary / Verdict */}
        {report.result?.executive_summary && (
          <section className="bg-black/60 backdrop-blur-2xl border border-[#D4AF37]/40 rounded-3xl p-20 shadow-3xl mb-32">
            <h2 className="text-5xl font-bold text-center mb-16 text-[#D4AF37]">
              Executive Verdict
            </h2>
            <div className="text-xl lg:text-2xl text-gray-200 leading-relaxed space-y-8 max-w-5xl mx-auto">
              {report.result.executive_summary.split("\n\n").map((paragraph: string, i: number) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* Kernspanningen */}
        {report.core_tensions && report.core_tensions.length > 0 && (
          <section className="mb-32">
            <h2 className="text-5xl font-bold text-center mb-16">
              Kernspanningen
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              {report.core_tensions.map((tension: string, i: number) => (
                <div
                  key={i}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl"
                >
                  <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed">
                    {tension}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 90-Dagen Actieplan – Jouw luxe component */}
        {report.action_plan && report.action_plan.length > 0 && (
          <section className="mb-32">
            <h2 className="text-5xl font-bold text-center mb-20">
              90-Dagen Actieplan
            </h2>
            <ActionPlan90Days plans={report.action_plan} />
          </section>
        )}

        {/* Wat niet wordt aangepakt */}
        {report.not_addressed && (
          <section className="bg-gradient-to-br from-orange-950/40 to-black/60 border border-orange-600/40 rounded-3xl p-20 shadow-3xl">
            <h2 className="text-4xl font-bold text-center mb-12 text-orange-400">
              Bewust geparkeerd in deze 90 dagen
            </h2>
            <p className="text-xl lg:text-2xl text-gray-200 text-center max-w-4xl mx-auto leading-relaxed">
              {report.not_addressed}
            </p>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center mt-40 pt-20 border-t border-white/10">
          <p className="text-lg text-gray-500">
            Aurelius Engine™ • Volledig vertrouwelijk • Geen dataretentie • Boardroom-klaar inzichten
          </p>
        </footer>
      </div>
    </div>
  );
}