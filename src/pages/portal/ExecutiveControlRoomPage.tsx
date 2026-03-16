import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Download, MoonStar, RefreshCw, SunMedium } from "lucide-react";
import { motion } from "framer-motion";
import {
  AureliusPanelSkeleton,
  AureliusSphere,
  BoardSummaryModal,
  StrategicNarrativePanel,
} from "@/dashboard/aurelius/components";
import { laadAureliusOverview, leesAureliusOverviewCache } from "@/dashboard/aurelius/api/aureliusApi";
import type { AureliusOverviewResponse } from "@/dashboard/aurelius/api/types";

const SRIAuthorityTrend = lazy(() => import("@/dashboard/aurelius/components/SRIAuthorityTrend"));
const DriftRiskFusionPanel = lazy(() => import("@/dashboard/aurelius/components/DriftRiskFusionPanel"));
const GovernanceRibbonPanel = lazy(() => import("@/dashboard/aurelius/components/GovernanceRibbonPanel"));

const REFRESH_INTERVAL_MS = 30_000;

function beginThema(): "dark" | "light" {
  if (typeof localStorage !== "undefined") {
    const opgeslagen = localStorage.getItem("aurelius_theme");
    if (opgeslagen === "dark" || opgeslagen === "light") return opgeslagen;
  }

  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

function actieveOrgId(): string {
  if (typeof localStorage === "undefined") return "";
  return String(localStorage.getItem("active_org_id") || "").trim();
}

function downloadCsv(payload: AureliusOverviewResponse) {
  const regels = [
    ["veld", "waarde"],
    ["gegenereerd_op", payload.gegenereerd_op],
    ["organisatie_id", payload.organisatie_id || ""],
    ["sri", payload.sri.huidige_sri.toFixed(2)],
    ["sri_band", payload.sri.sri_band],
    ["governance_state", payload.sri.governance_state],
    ["drift_delta_7d", payload.sri.drift_delta_7d.toFixed(2)],
    ["risk_velocity", payload.sri.risicosnelheid.toFixed(2)],
    ["actieve_escalaties", String(payload.sri.actieve_escalaties)],
    ["executive_thesis", payload.board_summary.executive_thesis.replaceAll("\n", " ")],
    ["dominant_risico", payload.board_summary.dominant_risico.replaceAll("\n", " ")],
  ];

  const csv = regels.map((row) => row.map((waarde) => `"${waarde.replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `aurelius-intelligence-${new Date().toISOString().slice(0, 19)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ExecutiveControlRoomPage() {
  const cache = leesAureliusOverviewCache(10 * 60_000);

  const [theme, setTheme] = useState<"dark" | "light">(beginThema);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [analysisType, setAnalysisType] = useState<string>("alle");
  const [organisatieId, setOrganisatieId] = useState<string>(actieveOrgId);
  const [conceptOrgId, setConceptOrgId] = useState<string>(actieveOrgId);
  const [data, setData] = useState<AureliusOverviewResponse | null>(cache);
  const [loading, setLoading] = useState<boolean>(!cache);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [boardOpen, setBoardOpen] = useState<boolean>(false);
  const [surfaceLoadMs, setSurfaceLoadMs] = useState<number>(cache ? 0 : 0);
  const [panelDurations, setPanelDurations] = useState<Record<string, number>>({});

  const startRef = useRef<number>(performance.now());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    localStorage.setItem("aurelius_theme", theme);
  }, [theme]);

  function markPanel(id: string) {
    setPanelDurations((huidig) => {
      if (typeof huidig[id] === "number") return huidig;
      return { ...huidig, [id]: Math.round(performance.now() - startRef.current) };
    });
  }

  async function laadData(isRefresh: boolean, org: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    startRef.current = performance.now();
    setPanelDurations({});

    if (isRefresh) {
      setRefreshing(true);
    } else if (!data) {
      setLoading(true);
    }

    try {
      const dagen = range === "7d" ? 30 : range === "30d" ? 90 : 180;
      const payload = await laadAureliusOverview(org, dagen, controller.signal);
      if (controller.signal.aborted) return;

      setData(payload);
      setError(null);
      setSurfaceLoadMs(Math.round(performance.now() - startRef.current));
    } catch (err) {
      if (controller.signal.aborted) return;
      const boodschap = err instanceof Error ? err.message : "Aurelius intelligence kon niet worden geladen.";
      setError(boodschap);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    void laadData(false, organisatieId);

    const timer = window.setInterval(() => {
      void laadData(true, organisatieId);
    }, REFRESH_INTERVAL_MS);

    return () => {
      abortRef.current?.abort();
      window.clearInterval(timer);
    };
  }, [organisatieId, range]);

  const isLicht = theme === "light";

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-4 px-4 pb-10 md:px-8">
        <AureliusPanelSkeleton hoogteKlasse="h-[310px]" />
        <AureliusPanelSkeleton hoogteKlasse="h-[200px]" />
        <AureliusPanelSkeleton hoogteKlasse="h-[360px]" />
        <AureliusPanelSkeleton hoogteKlasse="h-[360px]" />
        <AureliusPanelSkeleton hoogteKlasse="h-[360px]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[900px] space-y-4 px-4 pb-10 md:px-8">
        <div className="rounded-2xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div>
        <button
          type="button"
          onClick={() => void laadData(false, organisatieId)}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm"
        >
          Opnieuw laden
        </button>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto max-w-[1500px] space-y-4 px-4 pb-10 md:px-8 ${
        isLicht ? "text-slate-900" : "text-white"
      }`}
    >
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border px-4 py-3 ${
          isLicht ? "border-slate-300 bg-white" : "border-white/10 bg-[#0e1218]"
        }`}
        aria-label="Aurelius filterbalk"
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className={`text-xs ${isLicht ? "text-slate-600" : "text-white/65"}`}>
              Organisatie
              <input
                value={conceptOrgId}
                onChange={(event) => setConceptOrgId(event.target.value)}
                placeholder="organisation_id"
                className={`ml-2 w-64 rounded-lg border px-2 py-1 text-xs ${
                  isLicht ? "border-slate-300 bg-white" : "border-white/20 bg-[#0b1018]"
                }`}
                aria-label="Organisatie ID filter"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                const org = conceptOrgId.trim();
                setOrganisatieId(org);
                if (org) localStorage.setItem("active_org_id", org);
                void laadData(false, org);
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                isLicht ? "border-slate-300 bg-slate-900 text-white" : "border-white/20 bg-white/[0.05]"
              }`}
            >
              Toepassen
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void laadData(true, organisatieId)}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                isLicht ? "border-slate-300 bg-white" : "border-white/20 bg-white/[0.05]"
              }`}
              aria-label="Ververs intelligence data"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Verversing..." : "Ververs"}
            </button>

            <button
              type="button"
              onClick={() => setTheme((huidig) => (huidig === "dark" ? "light" : "dark"))}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                isLicht ? "border-slate-300 bg-white" : "border-white/20 bg-white/[0.05]"
              }`}
              aria-label="Wissel light en dark theme"
            >
              {isLicht ? <MoonStar size={14} /> : <SunMedium size={14} />}
              {isLicht ? "Dark" : "Light"}
            </button>

            <button
              type="button"
              onClick={() => downloadCsv(data)}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                isLicht ? "border-slate-300 bg-white" : "border-white/20 bg-white/[0.05]"
              }`}
              aria-label="Exporteer control room data als CSV"
            >
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>

        <div className={`mt-3 flex flex-wrap items-center gap-3 text-xs ${isLicht ? "text-slate-600" : "text-white/65"}`}>
          <span>Surface: {surfaceLoadMs}ms</span>
          {Object.entries(panelDurations).map(([naam, duur]) => (
            <span key={naam} className="rounded bg-black/10 px-2 py-0.5">
              {naam}: {duur}ms
            </span>
          ))}
        </div>
      </motion.section>

      {error ? (
        <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div>
      ) : null}

      <AureliusSphere
        sri={data.sri}
        context={data.context}
        theme={theme}
        refreshing={refreshing}
        onRunIntelligence={() => void laadData(true, organisatieId)}
        onOpenBoardSummary={() => setBoardOpen(true)}
      />

      <StrategicNarrativePanel
        context={data.context}
        boardSummary={data.board_summary}
        gegenereerdOp={data.gegenereerd_op}
        theme={theme}
      />

      <Suspense fallback={<AureliusPanelSkeleton hoogteKlasse="h-[360px]" />}>
        <SRIAuthorityTrend
          sri={data.sri}
          range={range}
          onRangeChange={setRange}
          theme={theme}
          onReady={() => markPanel("sri")}
        />
      </Suspense>

      <Suspense fallback={<AureliusPanelSkeleton hoogteKlasse="h-[360px]" />}>
        <DriftRiskFusionPanel
          drift={data.drift}
          risk={data.risk_evolution}
          analysisType={analysisType}
          onAnalysisTypeChange={setAnalysisType}
          theme={theme}
          onReady={() => markPanel("drift-risk")}
        />
      </Suspense>

      <Suspense fallback={<AureliusPanelSkeleton hoogteKlasse="h-[360px]" />}>
        <GovernanceRibbonPanel
          governance={data.governance}
          sri={data.sri}
          theme={theme}
          onReady={() => markPanel("governance")}
        />
      </Suspense>

      <BoardSummaryModal
        open={boardOpen}
        onClose={() => setBoardOpen(false)}
        data={data.board_summary}
        theme={theme}
      />
    </div>
  );
}
