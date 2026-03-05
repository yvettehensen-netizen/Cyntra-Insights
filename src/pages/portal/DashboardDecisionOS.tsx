// ============================================================================
// DASHBOARD — CYNTRA DECISION OS (BOARDROOM GRADE)
// Besluit → Analyse • Luxe Executive Command Layer
// SAFE: hergebruikt bestaande analyse-routes (/portal/analyse/:slug)
// FIXES:
// ✅ verwijdert shadcn Skeleton import (geen module nodig)
// ✅ geen .slug aanname op CyntraAnalysisConfig (pakt slug uit object key)
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabaseClient";
import { ANALYSES } from "@/aurelius/config/analyses.config";
import { usePlatformApiBridge } from "./saas/usePlatformApiBridge";

import { Card, CardContent } from "@/components/ui/card";

import {
  Crown,
  Clock,
  ArrowRight,
  Eye,
  AlertTriangle,
  PlayCircle,
} from "lucide-react";

/* ============================================================================
   TYPES
============================================================================ */

type DecisionBriefRow = {
  id: string;
  analysis_type: string;
  executive_thesis: string;
  central_tension: string;
  confidence_level: number | null;
  irreversibility_deadline: string | null;
  created_at: string;
};

/* ============================================================================
   HELPERS
============================================================================ */

function daysUntil(date: string | null) {
  if (!date) return null;
  const diff = new Date(date).getTime() - new Date().getTime();
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
}

function mapAnalysisTypeToSlug(analysisType: string): string | null {
  const match = Object.entries(ANALYSES).find(
    ([, cfg]) => cfg.analysisType === analysisType
  );
  return match ? match[0] : null; // ✅ slug = object key
}

function fallbackId(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

/* ============================================================================
   LOCAL LOADING SKELETON (NO shadcn dependency)
============================================================================ */

function LoadingCard() {
  return (
    <div className="rounded-2xl bg-cyntra-card overflow-hidden shadow-md">
      <div className="p-10 space-y-6">
        <div className="h-6 w-10 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
        <div className="h-10 w-full bg-white/10 rounded-xl animate-pulse mt-6" />
      </div>
    </div>
  );
}

/* ============================================================================
   COMPONENT
============================================================================ */

export default function DashboardDecisionOS() {
  const navigate = useNavigate();
  const api = usePlatformApiBridge();

  const [decisions, setDecisions] = useState<DecisionBriefRow[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  useEffect(() => {
    const confidenceFromSession = (session: any): number | null => {
      const predictions = Array.isArray(session?.intervention_predictions)
        ? session.intervention_predictions
        : [];
      if (!predictions.length) return null;
      const toScore = (value: string) => {
        if (value === "hoog") return 0.85;
        if (value === "laag") return 0.45;
        return 0.65;
      };
      const total = predictions.reduce(
        (sum: number, row: any) => sum + toScore(String(row?.confidence || "middel")),
        0
      );
      return total / predictions.length;
    };

    const thesisFromSession = (session: any): string => {
      const summary = String(session?.executive_summary || "").trim();
      if (summary) return summary;
      const firstLine = String(session?.board_report || "")
        .split("\n")
        .map((line) => line.trim())
        .find(Boolean);
      return firstLine || "Analyse voltooid";
    };

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("decision_briefs")
          .select(
            `
            id,
            analysis_type,
            executive_thesis,
            central_tension,
            confidence_level,
            irreversibility_deadline,
            created_at
          `
          )
          .order("created_at", { ascending: false })
          .limit(6);

        if (Array.isArray(data) && data.length > 0) {
          setDecisions(data);
          return;
        }
      } catch {
        // Fallback below
      } finally {
        try {
          const sessions = await api.listSessions();
          const mapped = (sessions || [])
            .filter((row: any) => row?.status === "voltooid")
            .slice(0, 6)
            .map((row: any) => ({
              id: String(row.session_id || row.id || fallbackId("sess")),
              analysis_type: String(row.analysis_type || "Strategische analyse"),
              executive_thesis: thesisFromSession(row),
              central_tension: String(
                row?.strategic_metadata?.probleemtype ||
                  "Bestuurlijke spanning vereist prioritering."
              ),
              confidence_level: confidenceFromSession(row),
              irreversibility_deadline: null,
              created_at: String(row.analyse_datum || row.updated_at || new Date().toISOString()),
            }));
          setDecisions(mapped);
          setLoading(false);
        } catch {
          setDecisions([]);
          setLoading(false);
        }
      }
    };

    void load();
  }, []);

  /* ================= PRIORITY SLUG (NO .slug FIELD) ================= */

  const prioritySlug = useMemo(() => {
    const entries = Object.entries(ANALYSES);
    if (!entries.length) return null;

    const [bestSlug] = entries.sort(
      (a, b) => b[1].strategicWeight - a[1].strategicWeight
    )[0];

    return bestSlug; // ✅ slug = object key
  }, []);

  const startPriorityAnalysis = () => {
    navigate(`/portal/analyse/${prioritySlug || "strategy"}`);
  };

  /* ============================================================================
     RENDER
  ============================================================================ */

  return (
    <div className="cyntra-shell w-full px-6 md:px-14 py-14 space-y-16">
      {/* ================= HEADER ================= */}
      <header className="space-y-6 max-w-5xl">
        <p className="uppercase tracking-[0.45em] text-xs text-cyntra-secondary">
          Cyntra · Decision OS
        </p>

        <h1 className="text-4xl md:text-6xl font-semibold text-cyntra-gold tracking-[0.02em]">
          Bestuurlijke Besluiten
        </h1>

        <p className="text-cyntra-secondary max-w-2xl leading-relaxed">
          Dit overzicht toont waar het bestuur nu móét kiezen. Elk besluit leidt
          direct naar de onderliggende analyse — geen ruis, geen omwegen.
        </p>

        {/* PRIMARY CTA — ALTIJD AANWEZIG */}
        <button
          onClick={startPriorityAnalysis}
          className="btn-cyntra-primary text-xs uppercase tracking-widest"
        >
          <PlayCircle className="h-5 w-5" />
          Start nieuwe analyse
        </button>
      </header>

      {/* ================= LOADING ================= */}
      {loading && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[...Array(3)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </section>
      )}

      {/* ================= EMPTY STATE ================= */}
      {!loading && decisions.length === 0 && (
        <section className="cyntra-panel max-w-3xl p-8 space-y-6">
          <AlertTriangle className="h-8 w-8 text-cyntra-gold" />
          <h2 className="text-xl font-semibold text-cyntra-gold">
            Geen actieve besluiten
          </h2>
          <p className="text-cyntra-secondary leading-relaxed">
            Er zijn nog geen bestuurlijke besluiten vastgelegd. Start een
            analyse om besluitvorming te activeren.
          </p>

          <button
            onClick={startPriorityAnalysis}
            className="btn-cyntra-primary text-xs uppercase tracking-widest"
          >
            <PlayCircle className="h-5 w-5" />
            Start analyse
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      )}

      {/* ================= DECISIONS GRID ================= */}
      {!loading && decisions.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {decisions.map((d, index) => {
            const slug = mapAnalysisTypeToSlug(d.analysis_type);
            const daysLeft = daysUntil(d.irreversibility_deadline);

            return (
              <div
                key={d.id}
                className="cyntra-panel rounded-2xl shadow-md"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Card className="bg-cyntra-card rounded-2xl h-full border-none">
                  <CardContent className="p-10 space-y-8">
                    {/* TOP */}
                    <div className="flex items-center justify-between">
                      <Crown className="h-6 w-6 text-cyntra-gold" />
                      <span className="text-[10px] uppercase tracking-widest text-cyntra-secondary">
                        {d.analysis_type}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="space-y-4">
                      <p className="text-lg font-semibold text-cyntra-gold leading-snug">
                        {d.executive_thesis}
                      </p>
                      <p className="text-sm text-cyntra-secondary italic leading-relaxed">
                        {d.central_tension}
                      </p>
                    </div>

                    {/* META */}
                    <div className="pt-4 border-t divider-cyntra space-y-2 text-xs text-cyntra-secondary">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(d.created_at).toLocaleDateString("nl-NL")}
                      </div>

                      {daysLeft !== null && (
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          {daysLeft} dagen tot irreversibility
                        </div>
                      )}

                      {typeof d.confidence_level === "number" && (
                        <div className="text-cyntra-gold">
                          Confidence: {(d.confidence_level * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>

                    {/* ACTION */}
                    {slug ? (
                      <button
                        onClick={() => navigate(`/portal/analyse/${slug}`)}
                        className="btn-cyntra-primary mt-4 w-full text-xs uppercase tracking-widest"
                      >
                        Bekijk analyse
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="mt-4 w-full rounded-xl border divider-cyntra px-5 py-3 text-xs text-cyntra-secondary">
                        Geen route gevonden voor analysis_type:{" "}
                        <span className="text-white/70">{d.analysis_type}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </section>
      )}

      {/* ================= UNDERSTREAM ================= */}
      <section className="cyntra-panel max-w-4xl p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-cyntra-gold" />
          <h2 className="uppercase tracking-widest text-sm text-cyntra-secondary">
            Onderstroom
          </h2>
        </div>
        <p className="text-cyntra-secondary leading-relaxed">
          Besluitvorming wordt vaak vertraagd door impliciete spanningen,
          onduidelijk eigenaarschap en uitstel dat zich vermomt als
          zorgvuldigheid. Cyntra maakt deze patronen expliciet vóórdat ze
          escaleren.
        </p>
      </section>
    </div>
  );
}
