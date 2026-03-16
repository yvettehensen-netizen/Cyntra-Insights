// ============================================================
// AURELIUS — CORE ANALYSIS ENGINE CLIENT
// ROUTE: src/aurelius/runAureliusEngine.ts
// ============================================================
import { getAureliusStrategicPipeline } from "@/aurelius/engine/runAureliusEngine";
import { validateReport } from "@/aurelius/engine/quality/validateReport";
import { runCausalStrategyEngine } from "@/aurelius/causal/CausalStrategyEngine";
import {
  detectStrategicLeverMatrix,
} from "@/aurelius/strategy/StrategicLeverDetector";
import {
  normalizeAureliusResultContract,
  type AureliusResult,
} from "@/aurelius/types/aureliusResult";
import { validateEngineOutput } from "@/aurelius/validation/EngineOutputValidator";
import { scoreBoardMemoQuality } from "@/aurelius/core/BoardMemoQualityScorer";
import { runImmediateAnalysis } from "@/api/analysisExecution";

export type EngineSuccess = {
  success: true;
  result: AureliusResult;
};

export type EngineFailure = {
  success: false;
  error: { message: string };
};

function extractNarrativeSource(result: AureliusResult): string {
  const parts = [
    result.executive_summary,
    result.board_memo,
    result.strategic_conflict,
    ...(result.killer_insights || []),
    ...(result.insights || []),
    ...(result.roadmap_90d?.month1 || []),
    ...(result.roadmap_90d?.month2 || []),
    ...(result.roadmap_90d?.month3 || []),
  ];
  return parts.filter(Boolean).join("\n");
}

export async function runAureliusEngine(input: {
  analysis_type: string;
  company_context: string;
  document_data?: string;
}): Promise<EngineSuccess | EngineFailure> {
  try {
    const { resultPayload } = await runImmediateAnalysis({
      organization: "Organisatie",
      description: input.company_context,
      context: {
        analysis_type: input.analysis_type,
        document_data: input.document_data ?? "",
        pipeline: getAureliusStrategicPipeline(),
      },
      runImmediately: true,
    });
    const result = normalizeAureliusResultContract(resultPayload);

    const validation = validateReport(extractNarrativeSource(result));
    result.thesis = validation.sections.thesis;
    result.conflict = validation.sections.conflict;
    result.decision = validation.sections.decision;
    result.boardQuestion = validation.sections.boardQuestion;
    result.stressTest = validation.sections.stressTest;
    result.killer_insights = validation.sections.killerInsights;
    result.intervention_actions = validation.sections.interventionActions;
    result.strategic_conflict = result.strategic_conflict || validation.sections.conflict || result.conflict || "";
    result.recommended_option = result.recommended_option || validation.sections.decision || result.decision || "C";
    const leverDetection = detectStrategicLeverMatrix({
      sourceText: [
        result.executive_summary,
        result.board_memo,
        validation.sections.thesis,
        validation.sections.conflict,
        validation.sections.decision,
        validation.sections.boardQuestion,
        validation.sections.stressTest,
        ...validation.sections.killerInsights,
      ].join("\n\n"),
      killerInsights: validation.sections.killerInsights,
    });
    result.strategic_levers = leverDetection.levers;
    result.strategic_lever_combination = leverDetection.dominantCombination;
    result.causal_strategy = runCausalStrategyEngine({
      levers: result.strategic_levers,
      dominantCombination: result.strategic_lever_combination,
    });
    result.causal_analysis = result.causal_analysis || result.causal_strategy;
    result.killer_insights = [
      ...validation.sections.killerInsights,
      ...result.strategic_levers.map(
        (item) => `Strategische hefboom: ${item.lever}\nMECHANISME\n${item.mechanism}\nRISICO\n${item.risk}\nBESTUURLIJKE IMPLICATIE\n${item.boardImplication}`
      ),
      ...(result.strategic_lever_combination
        ? [
            `Dominante hefboomcombinatie\n${result.strategic_lever_combination.levers.join("\n")}\nSTRATEGISCH EFFECT\n${result.strategic_lever_combination.strategicEffect}`,
          ]
        : []),
      ...(result.causal_strategy?.items?.length
        ? [
            `Belangrijkste causale mechanisme\n${result.causal_strategy.items[0].mechanisme}\nOPERATIONEEL EFFECT\n${result.causal_strategy.items[0].operationeelEffect}`,
          ]
        : []),
    ].slice(0, 8);
    result.strategic_depth_score = validation.score;
    result.strategic_reasoning_gate_passed = validation.gatePassed;

    const warnings: string[] = [...validation.warnings];
    const score = Number(result.strategic_depth_score ?? NaN);
    const gatePassed = result.strategic_reasoning_gate_passed;
    if (gatePassed === false || (Number.isFinite(score) && score < 70)) {
      warnings.push("Strategic reasoning insufficient. Analyse opnieuw genereren met meer diepgang.");
    }

    if (warnings.length) {
      result.strategic_warnings = [...(result.strategic_warnings ?? []), ...warnings];
    }

    result.board_memo =
      result.board_memo ||
      [
        "Bestuurlijke hypothese",
        result.executive_summary,
        "",
        "Kernconflict (A/B keuze)",
        result.strategic_conflict,
        "",
        "Besluitvoorstel",
        `Aanbevolen optie: ${result.recommended_option}`,
      ]
        .join("\n")
        .trim();
    result.board_memo_quality = scoreBoardMemoQuality(result.board_memo);

    return { success: true, result: validateEngineOutput(result) as AureliusResult };
  } catch (e: unknown) {
    return {
      success: false,
      error: {
        message: e instanceof Error ? e.message : "Analyse engine fout",
      },
    };
  }
}
