import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BoardSummaryResponse,
  DecisionIntelligenceResponse,
  DriftResponse,
  GovernanceResponse,
  PatternLearningResponse,
  RiskEvolutionResponse,
  SriResponse,
} from "@/dashboard/executive/api/types";
import { aggregateSignals } from "@/cyntra/intelligence/aggregateSignals";
import type { AggregatedSignals } from "@/cyntra/intelligence/types";
import { fetchBoardAdoptionLegitimacyIndex } from "@/api/boardEvaluation";
import {
  buildPerformanceTrajectory,
  calculateDSIScore,
  ensurePerformanceBaseline,
  fetchPerformanceBenchmark,
  fetchPerformanceSnapshots,
  generatePerformanceCase,
  upsertPerformanceSnapshot,
  type DecisionStrengthIndexFactors,
  type PerformanceSurfaceModel,
} from "@/cyntra/performance-engine";
import {
  evaluateExecutionLift,
  generate90DayPerformancePlan,
  trackPerformanceMilestones,
} from "@/cyntra/performance-program";

type IntelligenceError = string | null;

interface IntelligenceState {
  sri: SriResponse | null;
  drift: DriftResponse | null;
  risk: RiskEvolutionResponse | null;
  governance: GovernanceResponse | null;
  patternLearning: PatternLearningResponse | null;
  decisionIntelligence: DecisionIntelligenceResponse | null;
  boardSummary: BoardSummaryResponse | null;
  boardAdoptionLegitimacyIndex: number | null;
  signals: AggregatedSignals | null;
  performance: PerformanceSurfaceModel | null;
  loading: boolean;
  error: IntelligenceError;
}

const REFRESH_INTERVAL_MS = 30_000;
const BASE = "/api/intelligence";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function derivePatternLearningCoherence(input: AggregatedSignals): number {
  const stagnationPenalty = clamp(input.pattern_learning.stagnation_signals / 20, 0, 0.45);
  const escalationPenalty = clamp(input.pattern_learning.escalation_frequency / 12, 0, 0.35);
  const diversityBonus = clamp(
    input.pattern_learning.decision_type_cluster.length / 8,
    0,
    0.2
  );
  return clamp(0.85 - stagnationPenalty - escalationPenalty + diversityBonus, 0, 1);
}

function deriveRiskProjectionConfidence(input: AggregatedSignals): number {
  const band = input.risk_evolution.confidence_band;
  const width = Math.abs((band[1] || 0) - (band[0] || 0));
  return clamp(1 - width / 100, 0, 1);
}

function buildDsiFactors(
  signals: AggregatedSignals,
  boardIndex: number | null
): DecisionStrengthIndexFactors {
  const clarity = clamp(
    (Number.isFinite(boardIndex) ? Number(boardIndex) : 7) / 10,
    0,
    1
  );
  const decisionCertainty = clamp(
    signals.decision_intelligence.decision_strength_index / 100,
    0,
    1
  );
  const executionProbability = clamp(
    signals.decision_intelligence.execution_probability / 100,
    0,
    1
  );
  const driftStabilityInverse = clamp(
    1 - (signals.drift.execution_drift + signals.drift.structural_drift) / 2,
    0,
    1
  );

  return {
    clarity_score: clarity,
    decision_certainty: decisionCertainty,
    execution_probability: executionProbability,
    pattern_learning_coherence: derivePatternLearningCoherence(signals),
    drift_stability_inverse: driftStabilityInverse,
    risk_projection_confidence: deriveRiskProjectionConfidence(signals),
  };
}

function fallbackPerformanceModel(input: {
  organisationId: string;
  timestamp: string;
  factors: DecisionStrengthIndexFactors;
  currentDsi: number;
  executionScore: number;
}): PerformanceSurfaceModel {
  const baseline = round(input.currentDsi);
  const dsi = {
    organisationId: input.organisationId,
    baseline_dsi: baseline,
    current_dsi: round(input.currentDsi),
    trend_30d: 0,
    trend_60d: 0,
    trend_90d: 0,
    improvement_pct: 0,
    timestamp: input.timestamp,
  };
  const evolution = {
    baseline_dsi: baseline,
    current_dsi: round(input.currentDsi),
    improvement_pct: 0,
    improvement_velocity: 0,
    stagnation_flag: false,
    regression_flag: false,
    days_since_baseline: 0,
  };
  const trajectory = [
    { dag: 0, label: "Start", dsi: baseline, verbetering_pct: 0, execution_score: round(input.executionScore) },
    { dag: 30, label: "30 dagen", dsi: baseline, verbetering_pct: 0, execution_score: round(input.executionScore) },
    { dag: 60, label: "60 dagen", dsi: baseline, verbetering_pct: 0, execution_score: round(input.executionScore) },
    { dag: 90, label: "90 dagen", dsi: baseline, verbetering_pct: 0, execution_score: round(input.executionScore) },
  ];

  return {
    factors: input.factors,
    dsi,
    evolution,
    trajectory,
    execution_stability_change: 0,
    benchmark: null,
    case_study: {
      organisation_id: input.organisationId,
      baseline_dsi: baseline,
      current_dsi: baseline,
      improvement_pct: 0,
      execution_stability_change: 0,
      time_window_days: 0,
    },
    milestones: [
      { day: 30, target_dsi: baseline, current_dsi: baseline, status: "op schema" },
      { day: 60, target_dsi: baseline, current_dsi: baseline, status: "op schema" },
      { day: 90, target_dsi: baseline, current_dsi: baseline, status: "op schema" },
    ],
    focus_area: "Executieprobabiliteit",
    key_intervention:
      "Voer één interventie tegelijk uit met verplicht first-execution-signaal binnen 72 uur.",
    measurable_target: "DSI-verbetering wordt vastgesteld na 30 dagen.",
    expected_dsi_lift: 0.3,
  };
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed for ${url}: ${response.status} ${text}`);
  }

  return (await response.json()) as T;
}

export default function useIntelligenceData() {
  const [state, setState] = useState<IntelligenceState>({
    sri: null,
    drift: null,
    risk: null,
    governance: null,
    patternLearning: null,
    decisionIntelligence: null,
    boardSummary: null,
    boardAdoptionLegitimacyIndex: null,
    signals: null,
    performance: null,
    loading: true,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const [sri, drift, risk, governance, patternLearning, decisionIntelligence, boardSummary] = await Promise.all([
        fetchJson<SriResponse>(`${BASE}/sri`, controller.signal),
        fetchJson<DriftResponse>(`${BASE}/drift`, controller.signal),
        fetchJson<RiskEvolutionResponse>(`${BASE}/risk`, controller.signal),
        fetchJson<GovernanceResponse>(`${BASE}/governance`, controller.signal),
        fetchJson<PatternLearningResponse>(`${BASE}/pattern-learning`, controller.signal),
        fetchJson<DecisionIntelligenceResponse>(`${BASE}/decision-intelligence`, controller.signal),
        fetchJson<BoardSummaryResponse>(`${BASE}/board-summary`, controller.signal),
      ]);

      const organisationId =
        sri.organisatie_id ||
        String(localStorage.getItem("active_org_id") || "").trim() ||
        null;

      const boardAdoptionLegitimacyIndex = organisationId
        ? await fetchBoardAdoptionLegitimacyIndex(organisationId).catch(() => null)
        : null;

      if (controller.signal.aborted) return;

      const signals = aggregateSignals({
        sri,
        drift,
        risk,
        governance,
        patternLearning,
        decisionIntelligence,
        boardSummary,
        boardAdoptionLegitimacyIndex,
      });

      const nowIso = new Date().toISOString();
      const effectiveOrgId =
        organisationId ||
        boardSummary.organisatie_id ||
        governance.organisatie_id ||
        "onbekende-organisatie";

      const factors = buildDsiFactors(signals, boardAdoptionLegitimacyIndex);
      const currentDsi = calculateDSIScore(factors);
      const executionScore = signals.decision_intelligence.execution_probability;
      let performance = fallbackPerformanceModel({
        organisationId: effectiveOrgId,
        timestamp: nowIso,
        factors,
        currentDsi,
        executionScore,
      });

      if (organisationId) {
        try {
          const baseline = await ensurePerformanceBaseline({
            organisation_id: organisationId,
            baseline_dsi: currentDsi,
            baseline_sri: sri.huidige_sri,
            baseline_execution_score: executionScore,
            baseline_timestamp: nowIso,
          });

          await upsertPerformanceSnapshot({
            organisation_id: organisationId,
            dsi: currentDsi,
            execution_score: executionScore,
            decision_velocity: Math.max(0, 100 - Math.abs(sri.risicosnelheid) * 16),
            snapshot_timestamp: nowIso,
          });

          const snapshots = await fetchPerformanceSnapshots(organisationId, 120);
          const trajectory = buildPerformanceTrajectory({
            organisationId,
            baseline,
            current_dsi: currentDsi,
            current_execution_score: executionScore,
            snapshots,
            timestamp: nowIso,
          });

          const executionLift = evaluateExecutionLift({
            baseline_execution_score: baseline.baseline_execution_score,
            current_execution_score: executionScore,
          });

          const plan = generate90DayPerformancePlan({
            factors,
            current_dsi: trajectory.dsi.current_dsi,
            improvement_pct: trajectory.evolution.improvement_pct,
          });

          const milestones = trackPerformanceMilestones({
            baseline_dsi: trajectory.evolution.baseline_dsi,
            current_dsi: trajectory.evolution.current_dsi,
            expected_dsi_lift: plan.expected_dsi_lift,
            days_since_baseline: trajectory.evolution.days_since_baseline,
          });

          const benchmark = await fetchPerformanceBenchmark().catch(() => null);
          const caseStudy = generatePerformanceCase({
            organisation_id: organisationId,
            baseline_dsi: trajectory.evolution.baseline_dsi,
            current_dsi: trajectory.evolution.current_dsi,
            baseline_execution_score: baseline.baseline_execution_score,
            current_execution_score: executionScore,
            time_window_days: trajectory.evolution.days_since_baseline,
          });

          performance = {
            factors,
            dsi: trajectory.dsi,
            evolution: trajectory.evolution,
            trajectory: trajectory.trajectory,
            execution_stability_change: executionLift.delta,
            benchmark,
            case_study: caseStudy,
            milestones,
            focus_area: plan.focus_area,
            key_intervention: plan.key_intervention,
            measurable_target: plan.measurable_target,
            expected_dsi_lift: plan.expected_dsi_lift,
          };
        } catch {
          performance = fallbackPerformanceModel({
            organisationId: effectiveOrgId,
            timestamp: nowIso,
            factors,
            currentDsi,
            executionScore,
          });
        }
      }

      setState({
        sri,
        drift,
        risk,
        governance,
        patternLearning,
        decisionIntelligence,
        boardSummary,
        boardAdoptionLegitimacyIndex,
        signals,
        performance,
        loading: false,
        error: null,
      });
    } catch (error) {
      if (controller.signal.aborted) return;

      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Intelligence data ophalen mislukt.",
      }));
    }
  }, []);

  useEffect(() => {
    void load();

    const timer = window.setInterval(() => {
      void load();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      abortRef.current?.abort();
    };
  }, [load]);

  return useMemo(
    () => ({
      sri: state.sri,
      drift: state.drift,
      risk: state.risk,
      governance: state.governance,
      patternLearning: state.patternLearning,
      decisionIntelligence: state.decisionIntelligence,
      boardSummary: state.boardSummary,
      boardAdoptionLegitimacyIndex: state.boardAdoptionLegitimacyIndex,
      signals: state.signals,
      performance: state.performance,
      loading: state.loading,
      error: state.error,
    }),
    [state]
  );
}
