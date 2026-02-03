// ============================================================
// ANALYSES HISTORY PAGE
// Pad: src/pages/portal/AnalysesHistoryPage.tsx
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Clock, FileText, TrendingUp } from "lucide-react";

interface Analysis {
  id: string;
  analysis_type: string;
  created_at: string;
}

export default function AnalysesHistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalyses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAnalyses() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      setAnalyses([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("analyses")
      .select("id, analysis_type, created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    setAnalyses(data ?? []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <TrendingUp className="animate-pulse" />
        Analyses laden…
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-24">
        <FileText size={48} className="mx-auto mb-4" />
        <p className="mb-6">Nog geen analyses uitgevoerd.</p>
        <button
          onClick={() => navigate("/portal/nieuwe-analyse")}
          className="px-6 py-3 bg-[#D4AF37] text-black rounded-xl font-semibold"
        >
          Start nieuwe analyse
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Analysegeschiedenis</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyses.map((a) => (
          <button
            key={a.id}
            onClick={() => navigate(`/portal/rapporten/${a.id}`)}
            className="text-left bg-black/40 border border-white/10 rounded-2xl p-6
                       hover:border-[#D4AF37]/40 hover:bg-black/60 transition"
          >
            <h3 className="font-semibold mb-2">{a.analysis_type}</h3>

            <p className="text-sm text-gray-400 flex items-center gap-2">
              <Clock size={14} />
              {new Date(a.created_at).toLocaleString("nl-NL")}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

