// src/pages/portal/DashboardPage.tsx
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, FileText, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type AnalysisRecord = {
  id: string;
  analysis_type: string;
  created_at: string;
  score?: number;
  risk_score?: number;
};

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    supabase
      .from("analyses")
      .select("id, analysis_type, created_at, score, risk_score")
      .order("created_at", { ascending: false })
      .then(({ data }) => setAnalyses(data || []));
  }, []);

  const totalAnalyses = analyses.length;
  const highRisk = analyses.filter(a => (a.risk_score ?? 0) > 7).length;
  const avgScore =
    analyses.reduce((sum, a) => sum + (a.score ?? 0), 0) /
    (analyses.length || 1);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-black px-12 py-14 space-y-16">

      {/* ================= HEADER ================= */}
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          Jouw beslisoverzicht
        </h1>
        <p className="text-gray-500 max-w-2xl">
          Dit dashboard toont waar spanning, risico en richting samenkomen.
          Analyses start je via de Aurelius-navigatie.
        </p>
      </header>

      {/* ================= STATUS BLOKKEN ================= */}
      <section className="grid grid-cols-3 gap-8">
        <StatusCard
          label="Uitgevoerde analyses"
          value={totalAnalyses}
          icon={<Brain />}
        />
        <StatusCard
          label="Verhoogd risico"
          value={highRisk}
          icon={<AlertTriangle />}
          warning
        />
        <StatusCard
          label="Gemiddelde beslisscore"
          value={avgScore.toFixed(1)}
          icon={<FileText />}
        />
      </section>

      {/* ================= VISUELE PATRONEN ================= */}
      <section className="grid grid-cols-2 gap-10">

        {/* VERDELING */}
        <Card>
          <CardContent className="p-8">
            <h3 className="font-semibold mb-6">
              Verdeling van analyses
            </h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analyses}
                    dataKey="score"
                    nameKey="analysis_type"
                    outerRadius={90}
                    fill="#D4AF37"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RISICO TREND */}
        <Card>
          <CardContent className="p-8">
            <h3 className="font-semibold mb-6">
              Risico-intensiteit over tijd
            </h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={analyses}>
                  <XAxis
                    dataKey="created_at"
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Bar dataKey="risk_score" fill="#8B1538" />
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </section>

      {/* ================= RECENTE BESLUITEN ================= */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">
          Recente besluitrapporten
        </h2>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-4">Analyse</th>
                <th>Datum</th>
                <th>Actie</th>
              </tr>
            </thead>
            <tbody>
              {analyses.slice(0, 6).map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-4 capitalize">
                    {a.analysis_type}
                  </td>
                  <td>
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <a
                      href={`/portal/rapporten/${a.id}`}
                      className="text-[#8B1538] font-medium"
                    >
                      Open rapport →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

/* ================= SUBCOMPONENT ================= */

function StatusCard({
  label,
  value,
  icon,
  warning = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-6 space-y-2">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-sm">{label}</span>
          <div className={warning ? "text-red-500" : "text-gray-400"}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-semibold">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
