// ============================================================
// src/aurelius/orchestrator/runAureliusFullPipeline.ts
// AURELIUS — FULL DECISION PIPELINE (HGBCO • HEILIG • FOUTLOOS)
// ============================================================

/* ============================================================
   🚨 CRITICAL FIX
   engine.ts heeft GEEN benoemde exports
   -> gebruik namespace import (altijd geldig)
============================================================ */

import * as Engine from "@/aurelius/engine/engine";

/* ============================================================
   TYPES — CANONICAL
============================================================ */

import type { AnalysisContext } from "@/aurelius/engine/types";
import type { AureliusAnalysisResult } from "@/aurelius/engine/types/AureliusAnalysisResult";
import type { BoardroomBrief } from "@/aurelius/synthesis/types";

/* ============================================================
   DECISION LAYERS
============================================================ */

import { synthesizeBoardroomBrief } from "@/aurelius/synthesis/synthesizeBoardroomBrief";
import { generateBoardroomNarrative } from "@/aurelius/narrative/generateBoardroomNarrative";
import { callAI } from "@/aurelius/engine/utils/callAI";
import { DECISION_90_DAYS_PROMPT } from "@/aurelius/prompts/decisionSynthesis.prompt";

/* ============================================================
   TYPES — DECISION CONTRACT (ADD-ONLY)
============================================================ */

export type DecisionAction = {
  number?: number;
  title: string;
  owner?: string;
  deadline?: string;
  [k: string]: unknown;
};

export type DecisionMonth = {
  month?: number;
  phase?: string;
  actions: DecisionAction[];
  [k: string]: unknown;
};

export type DecisionContract = {
  coreTensions?: string[];
  actionPlan?: DecisionMonth[];
  [k: string]: unknown;
};

export type AureliusFullPipelineOutput = {
  intelligence: AureliusAnalysisResult;
  brief: BoardroomBrief;
  narrative: string;

  hgbco: {
    H: string;
    G: string;
    B: string[];
    C: string[];
    O: string;
  };

  interventions: DecisionMonth[];
  decision_contract: DecisionContract;
};

/* ============================================================
   SAFE JSON PARSER (ADD-ONLY)
============================================================ */

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/* ============================================================
   DECISION ENGINE — 90 DAY CONTRACT
============================================================ */

async function runDecisionLayer(narrative: string): Promise<DecisionContract> {
  const raw = await callAI("gpt-4o", [
    { role: "system", content: DECISION_90_DAYS_PROMPT },
    { role: "user", content: narrative },
  ]);

  return safeJsonParse<DecisionContract>(raw, {
    coreTensions: [],
    actionPlan: [],
  });
}

/* ============================================================
   FULL AURELIUS PIPELINE — HEILIG
============================================================ */

export async function runAureliusFullPipeline(
  context: AnalysisContext
): Promise<AureliusFullPipelineOutput> {
  /* ==========================================================
     1. CORE ENGINE (ORCHESTRATOR + CONSULTANTS)
     GEEN AANNAMES — runtime resolutie
  ========================================================== */

  const engineAny = Engine as unknown as {
    analyze?: (ctx: AnalysisContext) => Promise<unknown>;
  };

  if (typeof engineAny.analyze !== "function") {
    throw new Error(
      "Aurelius engine error: geen analyze(context) functie gevonden in engine.ts"
    );
  }

  const intelligence = (await engineAny.analyze(
    context
  )) as AureliusAnalysisResult;

  /* ==========================================================
     2. BOARDROOM BRIEF (PARTNER-GRADE)
  ========================================================== */

  const brief = (await synthesizeBoardroomBrief(
    intelligence
  )) as unknown as BoardroomBrief;

  /* ==========================================================
     3. LONG-FORM NARRATIVE
  ========================================================== */

  const narrative = await generateBoardroomNarrative(brief);

  const narrativeText = String((narrative as any)?.text ?? "");

  /* ==========================================================
     4. 🔥 DECISION LAYER (HGBCO + INTERVENTIES)
  ========================================================== */

  const decision = await runDecisionLayer(narrativeText);

  const actionPlanSafe: DecisionMonth[] = Array.isArray(decision.actionPlan)
    ? (decision.actionPlan as DecisionMonth[])
    : [];

  const coreTensionsSafe: string[] = Array.isArray(decision.coreTensions)
    ? (decision.coreTensions as string[])
    : [];

  const closureTitles: string[] =
    actionPlanSafe.flatMap((m: DecisionMonth) =>
      Array.isArray(m.actions)
        ? m.actions
            .map((a: DecisionAction) => String(a?.title ?? ""))
            .filter(Boolean)
        : []
    ) ?? [];

  /* ==========================================================
     5. FINAL CANONICAL OUTPUT (REPORT VAULT READY)
  ========================================================== */

  return {
    intelligence,
    brief,
    narrative: narrativeText,

    hgbco: {
      H: String((brief as any)?.executive_thesis ?? ""),
      G: String((brief as any)?.central_tension ?? ""),
      B: coreTensionsSafe,
      C: closureTitles,
      O: "Besluitvorming onomkeerbaar gemaakt binnen 90 dagen.",
    },

    interventions: actionPlanSafe,
    decision_contract: decision,
  };
}
