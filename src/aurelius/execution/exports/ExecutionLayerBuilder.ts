// ============================================================
// filepath: src/aurelius/execution/ExecutionLayerBuilder.ts
// AURELIUS EXECUTION LAYER BUILDER — BOARDROOM 90-DAY PLAN
// ADD ONLY — ENGINE SAFE • CRASH SAFE • NARRATIVE READY
// ============================================================

import type { ModelResult } from "@/aurelius/engine/types";
import type {
  ExecutionLayer,
  ExecutionMetrics,
  ExecutionRiskLevel,
} from "@/aurelius/execution/types";

export type {
  ExecutionLayer,
  ExecutionRiskLevel,
  ModelResult,
};

type BuilderMetrics = ExecutionMetrics & {
  // Optional aliases (ADD ONLY / tolerant)
  tension_intensity_score?: number;
  governance_score?: number;
  dsi?: number;
  risk_level?: ExecutionRiskLevel | string;
  certainty?: number;
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => String(s || "").trim()).filter(Boolean)));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function asNum(x: unknown, fallback = 0) {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function pickRiskLevel(input: unknown): ExecutionRiskLevel {
  const v = String(input || "").toUpperCase().trim();
  if (v === "LOW" || v === "MEDIUM" || v === "HIGH") return v;
  return "MEDIUM";
}

function bool(x: unknown) {
  return Boolean(x);
}

export class ExecutionLayerBuilder {
  build(params: {
    nodes: Record<string, ModelResult>;
    metrics: BuilderMetrics;
  }): ExecutionLayer {
    const nodes = params?.nodes || {};
    const m = params?.metrics || {};

    const conflict = clamp(
      asNum(m.conflict_intensity_score_0_100 ?? m.tension_intensity_score, 0),
      0,
      100
    );
    const governance = clamp(asNum(m.governance_integrity_score_0_100 ?? m.governance_score, 0), 0, 100);
    const dsi = clamp(asNum(m.decision_strength_index_0_100 ?? m.dsi, 0), 0, 100);
    const certainty = clamp(asNum(m.decision_certainty_0_1 ?? m.certainty, 0), 0, 1);

    const riskLevel = pickRiskLevel(m.execution_risk_level ?? m.risk_level);

    // node-derived booleans (tolerant)
    const tradeoffOk = bool(nodes?.tradeoff?.decision_signals?.tradeoffs_identified);
    const ownerOk = bool(nodes?.governance?.decision_signals?.ownership_assigned);
    const decisionOk = bool(nodes?.governance?.decision_signals?.has_clear_decision);
    const irreversibilityOk = bool(nodes?.tradeoff?.decision_signals?.irreversible_choices_present);

    // execution pressure factors
    const lowGovernance = governance < 60;
    const lowDecisionStrength = dsi < 60;
    const lowCertainty = certainty < 0.55;

    // base priorities (always)
    const basePriorities = [
      "Cap WIP: maximaal 3 actieve strategische streams tegelijk; alles daarboven pauzeren/stoppen.",
      "Installeer Boardroom Cadence: wekelijkse scoreboard-review (5 KPI’s), beslislog, escalatieblok.",
      "Maak ‘definition of done’ hard: geen ‘launch-only’; succes = adoptie + KPI-impact.",
      "Maak besluitdiscipline zichtbaar: elk besluit krijgt DRI + deadline + meetbaar outcome.",
    ];

    // conditional priorities (forced)
    const forcedPriorities: string[] = [];

    if (!tradeoffOk) {
      forcedPriorities.push(
        "VERPLICHT: Definieer stop-doing: wat stopt per direct + welke capaciteit vrijkomt + waar het naartoe gaat."
      );
    } else {
      forcedPriorities.push(
        "Voer de keuzeconflict uit: stop-doing gepubliceerd + capaciteit herverdeeld + communicatie naar alle stakeholders."
      );
    }

    if (!ownerOk || lowGovernance) {
      forcedPriorities.push(
        "VERPLICHT: Governance fix: mandate zin + DRI per prioriteit + escalatiepad + accountability op KPI’s."
      );
    } else {
      forcedPriorities.push("Vergrendel ownership: DRI’s tekenen voor outcomes (geen gedeeld eigenaarschap).");
    }

    if (!decisionOk || lowDecisionStrength) {
      forcedPriorities.push(
        "VERPLICHT: Maak 2–3 opties expliciet (tijd/kosten/risico) en forceer één keuze deze week."
      );
    }

    if (!irreversibilityOk) {
      forcedPriorities.push(
        "Markeer het onomkeerbare moment: welke keuze sluit opties af, en wanneer gaat die deur dicht?"
      );
    }

    if (conflict < 20) {
      forcedPriorities.push(
        "VERPLICHT: Formuleer de structurele spanning (doel A botst met doel B) en maak het niet-optimaliseerbaar."
      );
    } else if (conflict > 70) {
      forcedPriorities.push(
        "Conflictdruk management: benoem de verliezende kant expliciet en voorkom ‘stil veto’ via escalatie."
      );
    }

    if (lowCertainty) {
      forcedPriorities.push(
        "Certainty verhogen: definieer 3 bewijs-criteria + 14-dagen validatie sprint (kill/commit moment)."
      );
    }

    // measurable outcomes (always measurable)
    const baseOutcomes = [
      "Scoreboard live: 5 kern-KPI’s met vaste definities; wekelijks gerapporteerd en besproken.",
      "Escalaties opgelost: blokkades binnen 7 dagen opgelost of expliciet geaccepteerd door CEO/DRI.",
      "Delivery: 1 dominante prioriteit geleverd met aantoonbare adoptie + KPI-impact binnen 90 dagen.",
      "Owner-map actief: per prioriteit 1 DRI + 1 back-up + 1 KPI-owner (geen grijze zones).",
    ];

    const conditionalOutcomes: string[] = [];

    if (!tradeoffOk) {
      conditionalOutcomes.push(
        "Stop-doing uitgevoerd: minimaal 20–30% initiatieven gepauzeerd/gestopt; capaciteit zichtbaar herverdeeld."
      );
    } else {
      conditionalOutcomes.push(
        "Keuzeconflict uitgevoerd: stop-doing lijst gepubliceerd + budget/capaciteit herverdeeld binnen 10 werkdagen."
      );
    }

    if (!ownerOk || lowGovernance) {
      conditionalOutcomes.push(
        "Governance hersteld: mandaat/DRI/deadline per besluit vastgelegd en herhaald in 2 opeenvolgende reviews."
      );
    }

    if (!decisionOk || lowDecisionStrength) {
      conditionalOutcomes.push(
        "Besluitkwaliteit omhoog: 1 keuze gemaakt uit 2–3 opties en vertaald naar KPI’s + delivery plan."
      );
    }

    if (conflict > 70) {
      conditionalOutcomes.push(
        "Spanning opgelost: 1 dominante spanning gesloten via A-of-B besluit; verlies expliciet gecommuniceerd."
      );
    }

    if (lowCertainty) {
      conditionalOutcomes.push(
        "Validatie sprint afgerond: bewijs-criteria gehaald of gestopt (kill/commit) binnen 14 dagen."
      );
    }

    // owner map (boardroom standard)
    const ownerMap = [
      "CEO: besluitrecht + escalatie + publieke keuzeconflict-communicatie",
      "COO: executieritme + WIP-cap + delivery discipline",
      "CFO: KPI-definities + accountability + cost-of-delay bewaking",
      "DRI per prioriteit: outcome-eigenaarschap + blokkades oplossen binnen 7 dagen",
    ];

    return {
      execution_layer: {
        "90_day_priorities": uniq([...basePriorities, ...forcedPriorities]),
        measurable_outcomes: uniq([...baseOutcomes, ...conditionalOutcomes]),
        risk_level: riskLevel,
        owner_map: uniq(ownerMap),
      },
    };
  }
}
