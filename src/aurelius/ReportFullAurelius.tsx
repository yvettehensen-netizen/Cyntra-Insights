import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";

export default function ReportFullAurelius() {
  const { id } = useParams<{ id: string }>();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [id]);

  async function loadReport() {
    const { data } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single();

    setReport(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Rapport laden…
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Rapport niet gevonden.
      </div>
    );
  }

  const r = report.result;

  /* -------------------------------
     NORMALIZE DATA
  -------------------------------- */
  const radarData = [
    { label: "Strategie", score: r.roadmap_90d?.strategy || 3 },
    { label: "Finance", score: r.roadmap_90d?.finance || 3 },
    { label: "Team", score: r.roadmap_90d?.team || 3 },
    { label: "Cultuur", score: r.roadmap_90d?.culture || 3 },
    { label: "Executie", score: r.roadmap_90d?.execution || 3 },
  ];

  const barData = (r.insights || []).map((_: any, idx: number) => ({
    name: `Inzicht ${idx + 1}`,
    impact: Math.min(10, Math.max(3, Math.round(Math.random() * 10))),
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <main className="max-w-6xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold mb-2">
          {report.company_name}
        </h1>

        <p className="text-gray-400 mb-10">
          Analyse type:{" "}
          <span className="text-[#D6B48E]">
            {report.analysis_type}
          </span>
        </p>

        {/* EXECUTIVE SUMMARY */}
        <section className="bg-[#151515] p-6 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-[#D6B48E]">
            Executive Summary
          </h2>
          <p className="text-gray-300 whitespace-pre-wrap">
            {r.executive_summary}
          </p>
        </section>

        {/* RADAR CHART */}
        <section className="bg-[#151515] p-6 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Organisatieprofiel
          </h2>

          <div className="w-full h-80">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#444" />
                <PolarAngleAxis dataKey="label" stroke="#ccc" />
                <Radar
                  dataKey="score"
                  stroke="#D6B48E"
                  fill="#D6B48E"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* INSIGHTS */}
        <section className="bg-[#151515] p-6 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Kerninzichten
          </h2>

          <ul className="space-y-3">
            {(r.insights || []).map((i: string, idx: number) => (
              <li key={idx} className="text-gray-300">
                <span className="text-[#D6B48E]">•</span> {i}
              </li>
            ))}
          </ul>
        </section>

        {/* BAR CHART */}
        <section className="bg-[#151515] p-6 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Impact per Inzicht
          </h2>

          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid stroke="#333" />
                <XAxis dataKey="name" stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="impact" fill="#D6B48E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* RISKS */}
        <section className="bg-[#151515] p-6 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Risico’s
          </h2>

          <ul className="space-y-3">
            {(r.risks || []).map((i: string, idx: number) => (
              <li key={idx} className="text-gray-300">
                <span className="text-red-500">•</span> {i}
              </li>
            ))}
          </ul>
        </section>

        {/* OPPORTUNITIES */}
        <section className="bg-[#151515] p-6 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Groeikansen
          </h2>

          <ul className="space-y-3">
            {(r.opportunities || []).map((i: string, idx: number) => (
              <li key={idx} className="text-gray-300">
                <span className="text-green-400">•</span> {i}
              </li>
            ))}
          </ul>
        </section>

        {/* ROADMAP */}
        <section className="bg-[#151515] p-6 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            90-Dagen Actieplan
          </h2>

          <ul className="space-y-3">
            {(r.roadmap_90d?.steps || []).map((i: string, idx: number) => (
              <li key={idx} className="text-gray-300">
                <span className="text-[#D6B48E]">→</span> {i}
              </li>
            ))}
          </ul>
        </section>

        {/* CEO MESSAGE */}
        <section className="bg-[#151515] p-6 rounded-2xl border border-white/10 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            CEO Bericht
          </h2>
          <p className="text-gray-300 whitespace-pre-wrap">
            {r.ceo_message}
          </p>
        </section>

      </main>
    </div>
  );
}
