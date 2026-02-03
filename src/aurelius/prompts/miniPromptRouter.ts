// src/aurelius/prompts/miniPromptRouter.ts

/* ============================================================
   CYNTRA — MINI PROMPT ROUTER (DECISION CANON)
   ADD ONLY • NO BREAKING CHANGES • STRICT ROUTING
============================================================ */

import { strategyPrompt } from "./strategy";
import { financePrompt } from "./finance";
import { financialStrategyPrompt } from "./financial_strategy";
import { teamCulturePrompt } from "./team_culture";
import { onderstroomPrompt } from "./understream"; // ✅ FIX
import { growthPrompt } from "./growth_scale";     // ✅ FIX
import { quickscanPrompt } from "./quickscan";
import { aiDataPrompt } from "./ai_data";
import { cashflowPrompt } from "./cashflow";
import { swotPrompt } from "./swot";
import { marketPrompt } from "./market";
import { processPrompt } from "./process";
import { organizationalPrompt } from "./organizational";
import { esgPrompt } from "./esg";
import { benchmarkPrompt } from "./benchmark";

/* ============================================================
   ADD ONLY — OPTIONAL PROMPT LOADERS
   (voorkomt TS errors zolang bestanden nog niet bestaan)
============================================================ */

function optionalPrompt(path: string, exportName: string): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(path);
    return mod?.[exportName] ?? null;
  } catch {
    return null;
  }
}

/* ============================================================
   PROMPT RESOLUTION
============================================================ */

export function getPromptForAnalysis(type: string): string {
  const promptMap: Record<string, string | null> = {
    /* =========================
       CORE ANALYSES
    ========================= */
    strategy: strategyPrompt,
    finance: financePrompt,
    financial_strategy: financialStrategyPrompt,
    growth: growthPrompt,
    market: marketPrompt,
    swot: swotPrompt,
    benchmark: benchmarkPrompt,
    esg: esgPrompt,

    /* =========================
       OPERATIONS & STRUCTURE
    ========================= */
    process: processPrompt,
    organizational: organizationalPrompt,

    /* =========================
       PEOPLE & DYNAMICS
    ========================= */
    team: teamCulturePrompt,
    team_culture: teamCulturePrompt,
    onderstroom: onderstroomPrompt,

    /* =========================
       DATA & FINANCIAL REALITY
    ========================= */
    ai_data: aiDataPrompt,
    cashflow: cashflowPrompt,

    /* =========================
       COMMERCIAL (ADD ONLY)
    ========================= */
    marketing: optionalPrompt("./marketing", "marketingPrompt"),
    sales: optionalPrompt("./sales", "salesPrompt"),

    /* =========================
       TEAM DYNAMICS / CHANGE (ADD ONLY)
    ========================= */
    team_dynamics: optionalPrompt("./team_dynamics", "teamDynamicsPrompt"),
    change_resilience: optionalPrompt("./change_resilience", "changeResiliencePrompt"),

    /* =========================
       FUNNEL / ENTRY
    ========================= */
    quickscan: quickscanPrompt,

    /* =========================
       ZORGSCAN — BESLUITVORMING (ADD ONLY)
    ========================= */
    zorgscan_decision: optionalPrompt("./zorgscan_decision", "zorgscanDecisionPrompt"),
    zorgscan_team_culture: optionalPrompt("./zorgscan_team_culture", "zorgscanTeamCulturePrompt"),
    zorgscan_team_dynamics: optionalPrompt("./zorgscan_team_dynamics", "zorgscanTeamDynamicsPrompt"),
  };

  return (
    promptMap[type] ||
    `
You are CYNTRA — Aurelius Decision Engine™.

No matching analysis or scan type was found.

Your task:
- Expose structural tensions
- Reveal decision paralysis
- Identify irreversible consequences

No advice.
No optimization.
Board-level clarity only.
`
  );
}
