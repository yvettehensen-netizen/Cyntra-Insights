// ============================================================================
// DASHBOARD PAGE — CYNTRA WAR ROOM V6 (DEFINITIEF)
// Boardroom Command OS • Analyse → Rapport → Besluit
// ✅ ADD-ONLY UPGRADE — NO FUNCTIONAL BREAKS
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  PlayCircle,
  ShieldAlert,
  Activity,
  ArrowRight,
  Radar,
  Siren,
  Eye,
  Clock,
  Crown,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { ANALYSES } from "@/aurelius/config/analyses.config";
import { Card, CardContent } from "@/components/ui/card";

/* ============================================================================
   TYPES
============================================================================ */

type AnalysisRow = {
  id: string;
  analysis_type: string;
  created_at: string;
  risk_score: number | null;
};

type UserProfile = {
  company_name?: string | null;
};

/* ================= ADD — DECISION BRIEF ================= */

type DecisionBriefRow = {
  id: string;
  executive_thesis: string;
  central_tension: string;
  confidence_score: number;
  irreversibility_deadline: string | null;
  status: "open" | "decided" | "overdue";
  created_at: string;
};

const ENABLED_ANALYSIS_TYPES: string[] = [
  "strategy",
  "finance",
  "financial_strategy",
  "growth",
  "market",
  "process",
  "leadership",
  "team_culture",
  "team_dynamics",
  "change_resilience",
  "onderstroom",
  "swot",
  "esg",
  "ai_data",
  "marketing",
  "sales",
];

/* ============================================================================
   WAR ROOM — CYNTRA DECISION COMMAND CENTER
============================================================================ */

export default function DashboardPage() {
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [companyName, setCompanyName] = useState<string>("uw organisatie");
  const [loading, setLoading] = useState(true);

  /* ================= ADD — ACTIVE DECISION ================= */

  const [activeDecision, setActiveDecision] =
    useState<DecisionBriefRow | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: analysisData } = await supabase
        .from("analyses")
        .select("id, analysis_type, created_at, risk_score")
        .order("created_at", { ascending: false });

      setAnalyses(analysisData || []);

      /* ================= ADD — DECISION FETCH ================= */

      const { data: decisionData } = await supabase
        .from("decision_briefs")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setActiveDecision(decisionData ?? null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("company_name")
          .eq("user_id", user.id)
          .single<UserProfile>();

        if (profile?.company_name) {
          setCompanyName(profile.company_name);
        }
      }

      setLoading(false);
    };

    load();
  }, []);

  /* ================= METRICS ================= */

  const metrics = useMemo(() => {
    const risks = analyses
      .map((a) => a.risk_score)
      .filter((v): v is number => v !== null);

    const avgRisk = risks.length
      ? risks.reduce((a, b) => a + b, 0) / risks.length
      : 0;

    return {
      total: analyses.length,
      avgRisk,
      highRisk: risks.filter((v) => v >= 70).length,
    };
  }, [analyses]);

  /* ================= CEO DECISION CLOCK ================= */

  const decisionDeadlineDays = useMemo(() => {
    if (!activeDecision?.irreversibility_deadline) return null;

    const deadline = new Date(activeDecision.irreversibility_deadline);
    const now = new Date();

    const diff = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.max(diff, 0);
  }, [activeDecision]);

  /* ================= PRIORITY MODULE ================= */

  const priorityModule = useMemo(() => {
    const modules = Object.values(ANALYSES).filter((a) =>
      ENABLED_ANALYSIS_TYPES.includes(a.analysisType)
    );

    if (modules.length === 0) return null;

    return modules.sort((a, b) => b.strategicWeight - a.strategicWeight)[0];
  }, []);

  /* ============================================================================
     RENDER
  ============================================================================ */

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-12 py-16 space-y-20">

        {/* ======================================================
            HEADER / CONTEXT
        ====================================================== */}
        <header className="space-y-4">
          <p className="uppercase tracking-[0.4em] text-xs text-white/30">
            Cyntra · Aurelius Decision Engine
          </p>
          <h1 className="text-4xl font-semibold text-[#d4af37]">
            {companyName}
          </h1>
          <p className="text-white/40 max-w-2xl">
            Dit is het bestuurlijk command center.  
            Elke analyse leidt tot richting. Elk rapport tot een besluit.
          </p>
        </header>

        {/* ======================================================
            ANALYSE START (CRUCIAAL — WAS JE KWIJT)
        ====================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {priorityModule && (
            <Card className="bg-black/70 border border-[#d4af37]/40 rounded-2xl">
              <CardContent className="p-8 space-y-4">
                <PlayCircle className="h-6 w-6 text-[#d4af37]" />
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Start analyse
                </p>
                <p className="text-lg font-semibold text-[#d4af37]">
                  {priorityModule.title}
                </p>
                <button
                  onClick={() =>
                    navigate(`/portal/analyse/${priorityModule.analysisType}`)
                  }
                  className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4af37]"
                >
                  Start analyse <ArrowRight className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* ======================================================
            ACTIVE BOARDROOM DECISION (DECISION OS — ADD ONLY)
        ====================================================== */}
        {activeDecision && (
          <section className="border border-[#d4af37]/40 rounded-2xl bg-black/80 p-10 space-y-6">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-[#d4af37]" />
              <p className="text-xs uppercase tracking-[0.35em] text-white/30">
                Actief Bestuurlijk Besluit
              </p>
            </div>

            <h2 className="text-3xl font-semibold text-[#d4af37] leading-tight">
              {activeDecision.executive_thesis}
            </h2>

            <p className="text-white/50 max-w-3xl leading-relaxed">
              <strong className="text-white/70">Centrale spanning:</strong>{" "}
              {activeDecision.central_tension}
            </p>

            <div className="flex items-center gap-6 pt-4">
              <div className="text-xs uppercase tracking-widest text-white/30">
                Confidence
              </div>
              <div className="text-[#d4af37] font-semibold">
                {(activeDecision.confidence_score * 100).toFixed(0)}%
              </div>

              {decisionDeadlineDays !== null && (
                <div className="ml-auto inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4af37]">
                  <Clock className="h-4 w-4" />
                  {decisionDeadlineDays} dagen tot irreversibility
                </div>
              )}
            </div>
          </section>
        )}

        {/* ======================================================
            JE BESTAANDE DASHBOARD-ONDERDELEN BLIJVEN
            (charts, signal cards, alerts, etc.)
        ====================================================== */}

      </div>
    </div>
  );
}
