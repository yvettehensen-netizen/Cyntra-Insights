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

/* ============================================================================
   LOCAL LOADING SKELETON (NO shadcn dependency)
============================================================================ */

function LoadingCard() {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
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

  const [decisions, setDecisions] = useState<DecisionBriefRow[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  useEffect(() => {
    const load = async () => {
      setLoading(true);

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

      setDecisions(data ?? []);
      setLoading(false);
    };

    load();
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

  /* ============================================================================
     RENDER
  ============================================================================ */

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#07080d] to-[#111318] text-white px-6 md:px-14 py-14 space-y-16">
      {/* ================= HEADER ================= */}
      <header className="space-y-6 max-w-5xl">
        <p className="uppercase tracking-[0.45em] text-xs text-white/30">
          Cyntra · Decision OS
        </p>

        <h1 className="text-4xl md:text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#d4af37]">
          Bestuurlijke Besluiten
        </h1>

        <p className="text-white/50 max-w-2xl leading-relaxed">
          Dit overzicht toont waar het bestuur nu móét kiezen. Elk besluit leidt
          direct naar de onderliggende analyse — geen ruis, geen omwegen.
        </p>

        {/* PRIMARY CTA — ALTIJD AANWEZIG */}
        {prioritySlug && (
          <button
            onClick={() => navigate(`/portal/analyse/${prioritySlug}`)}
            className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#d4af37] px-6 py-3 text-xs uppercase tracking-widest text-black hover:shadow-2xl transition-all"
          >
            <PlayCircle className="h-5 w-5" />
            Start nieuwe analyse
          </button>
        )}
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
        <section className="border border-[#d4af37]/30 rounded-2xl bg-black/70 p-12 space-y-6 max-w-3xl">
          <AlertTriangle className="h-8 w-8 text-[#d4af37]" />
          <h2 className="text-xl font-semibold text-[#d4af37]">
            Geen actieve besluiten
          </h2>
          <p className="text-white/50 leading-relaxed">
            Er zijn nog geen bestuurlijke besluiten vastgelegd. Start een
            analyse om besluitvorming te activeren.
          </p>

          {prioritySlug && (
            <button
              onClick={() => navigate(`/portal/analyse/${prioritySlug}`)}
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#d4af37] px-6 py-3 text-xs uppercase tracking-widest text-black hover:shadow-2xl transition-all"
            >
              <PlayCircle className="h-5 w-5" />
              Start analyse
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
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
                className="bg-gradient-to-r from-[#d4af37]/40 to-[#ffd700]/40 p-[1px] rounded-2xl"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Card className="bg-[#07080d] rounded-2xl h-full">
                  <CardContent className="p-10 space-y-8">
                    {/* TOP */}
                    <div className="flex items-center justify-between">
                      <Crown className="h-6 w-6 text-[#d4af37]" />
                      <span className="text-[10px] uppercase tracking-widest text-white/40">
                        {d.analysis_type}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="space-y-4">
                      <p className="text-lg font-semibold text-[#d4af37] leading-snug">
                        {d.executive_thesis}
                      </p>
                      <p className="text-sm text-white/40 italic leading-relaxed">
                        {d.central_tension}
                      </p>
                    </div>

                    {/* META */}
                    <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-white/40">
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
                        <div className="text-[#d4af37]">
                          Confidence: {(d.confidence_level * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>

                    {/* ACTION */}
                    {slug ? (
                      <button
                        onClick={() => navigate(`/portal/analyse/${slug}`)}
                        className="mt-4 w-full inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#d4af37] px-5 py-3 text-xs uppercase tracking-widest text-black hover:shadow-xl transition"
                      >
                        Bekijk analyse
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="mt-4 w-full rounded-xl border border-white/10 px-5 py-3 text-xs text-white/45">
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
      <section className="border border-[#d4af37]/30 rounded-2xl bg-black/80 p-12 max-w-4xl space-y-4">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-[#d4af37]" />
          <h2 className="uppercase tracking-widest text-sm text-white/40">
            Onderstroom
          </h2>
        </div>
        <p className="text-white/50 leading-relaxed">
          Besluitvorming wordt vaak vertraagd door impliciete spanningen,
          onduidelijk eigenaarschap en uitstel dat zich vermomt als
          zorgvuldigheid. Cyntra maakt deze patronen expliciet vóórdat ze
          escaleren.
        </p>
      </section>
    </div>
  );
}
