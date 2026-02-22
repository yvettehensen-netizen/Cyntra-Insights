// ============================================================
// src/aurelius/synthesis/synthesizeBoardroomBrief.ts
// AI BESLISSER — NEDERLANDS • BOARDROOM • EXECUTIVE KERNEL
// ============================================================

import { callAI } from "@/aurelius/engine/utils/callAI";
import type { AureliusAnalysisResult } from "@/aurelius/engine/types/AureliusAnalysisResult";
import type { BoardroomBrief } from "./types";
import {
  CONCRETE_REPROMPT_DIRECTIVE,
  CYNTRA_SIGNATURE_LAYER_VIOLATION,
  enforceConcreteOutputMap,
  enforceConcreteString,
} from "@/aurelius/narrative/guards/enforceConcreteOutput";

const SIGNATURE_LAYER_ERROR_TEXT = CYNTRA_SIGNATURE_LAYER_VIOLATION;
const OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE =
  "Opportunity Cost MOET drie concrete tijdshorizons bevatten (30/90/365 dagen: 30 dagen, 90 dagen, 365 dagen) met euro-bedragen of % en irreversibiliteit. Governance Impact MOET benoemen: formele machtsverschuiving + informele tegenkracht + verwachte escalaties.";
const HARD_FALLBACK_PROMPT_RULE =
  "Als input te kort/vaag is, maak realistische bestuurlijke assumpties en lever direct concrete output. Gebruik NOOIT woorden als 'moet', 'lijkt erop dat', 'mogelijk', 'zou kunnen'. Altijd harde stellingen met verlies, macht, tijd.";

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function assertSignatureLayerCompliance(brief: BoardroomBrief) {
  const summary = brief.executive_summary_block;
  const signature = summary?.signature_layer;
  const contract = summary?.decision_contract;

  if (!signature || !contract) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }

  const requiredSignatureFields: Array<unknown> = [
    signature.decision_power_axis,
    signature.structural_tension,
    signature.explicit_loss,
    signature.power_shift,
    signature.time_pressure,
    signature.cognitive_maturity_reflection,
    signature.adaptive_hardness_mode,
  ];

  if (requiredSignatureFields.some((value) => !hasNonEmptyString(value))) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }

  if (
    contract.opening_line !== "De Raad van Bestuur committeert zich aan:" ||
    !hasNonEmptyString(contract.choice) ||
    !hasNonEmptyString(contract.measurable_result) ||
    !hasNonEmptyString(contract.time_horizon) ||
    !hasNonEmptyString(contract.accepted_loss)
  ) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }

  if (
    signature.adaptive_hardness_mode !== "confronterend" &&
    signature.adaptive_hardness_mode !== "klinisch" &&
    signature.adaptive_hardness_mode !== "strategisch_beheerst"
  ) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function enforceConcreteBrief(brief: BoardroomBrief): BoardroomBrief {
  const contextHint = `${brief.executive_thesis || ""} ${brief.central_tension || ""}`.trim();

  brief.executive_thesis = enforceConcreteString(
    brief.executive_thesis,
    "dominantThesis",
    contextHint
  );
  brief.central_tension = enforceConcreteString(
    brief.central_tension,
    "coreConflict",
    contextHint
  );
  brief.strategic_narrative = enforceConcreteString(
    brief.strategic_narrative,
    "narrative",
    contextHint
  );

  if (brief.executive_summary_block) {
    const summary = brief.executive_summary_block;
    const sanitized = enforceConcreteOutputMap(
      {
        dominantThesis: summary.dominant_thesis,
        coreConflict: summary.core_conflict,
        tradeoffs: summary.tradeoff_statement,
        opportunityCost:
          `${summary.opportunity_cost.days_0}\n${summary.opportunity_cost.days_90}\n${summary.opportunity_cost.days_365}`,
        governanceImpact:
          `${summary.governance_impact.decision_power}\n${summary.governance_impact.escalation}\n${summary.governance_impact.responsibility_diffusion}\n${summary.governance_impact.power_centralization}`,
        powerDynamics:
          `${summary.power_dynamics.who_loses_power}\n${summary.power_dynamics.informal_influence}\n${summary.power_dynamics.expected_sabotage_patterns}`,
        executionRisk:
          `${summary.execution_risk.failure_point}\n${summary.execution_risk.blocker}\n${summary.execution_risk.hidden_understream}`,
        interventionPlan90D:
          `${summary.intervention_plan_90d.week_1_2}\n${summary.intervention_plan_90d.week_3_6}\n${summary.intervention_plan_90d.week_7_12}`,
        decisionContract:
          `${summary.decision_contract.choice}\n${summary.decision_contract.measurable_result}\n${summary.decision_contract.time_horizon}\n${summary.decision_contract.accepted_loss}`,
      },
      { contextHint }
    );

    summary.dominant_thesis = sanitized.dominantThesis;
    summary.core_conflict = sanitized.coreConflict;
    summary.tradeoff_statement = sanitized.tradeoffs;

    const [day0, day90, day365] = sanitized.opportunityCost
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);
    summary.opportunity_cost.days_0 = day0 || summary.opportunity_cost.days_0;
    summary.opportunity_cost.days_90 = day90 || summary.opportunity_cost.days_90;
    summary.opportunity_cost.days_365 = day365 || summary.opportunity_cost.days_365;

    const governanceParts = sanitized.governanceImpact
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);
    summary.governance_impact.decision_power =
      governanceParts[0] || summary.governance_impact.decision_power;
    summary.governance_impact.escalation =
      governanceParts[1] || summary.governance_impact.escalation;
    summary.governance_impact.responsibility_diffusion =
      governanceParts[2] || summary.governance_impact.responsibility_diffusion;
    summary.governance_impact.power_centralization =
      governanceParts[3] || summary.governance_impact.power_centralization;

    const powerParts = sanitized.powerDynamics
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);
    summary.power_dynamics.who_loses_power =
      powerParts[0] || summary.power_dynamics.who_loses_power;
    summary.power_dynamics.informal_influence =
      powerParts[1] || summary.power_dynamics.informal_influence;
    summary.power_dynamics.expected_sabotage_patterns =
      powerParts[2] || summary.power_dynamics.expected_sabotage_patterns;

    const riskParts = sanitized.executionRisk
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);
    summary.execution_risk.failure_point =
      riskParts[0] || summary.execution_risk.failure_point;
    summary.execution_risk.blocker =
      riskParts[1] || summary.execution_risk.blocker;
    summary.execution_risk.hidden_understream =
      riskParts[2] || summary.execution_risk.hidden_understream;

    const planParts = sanitized.interventionPlan90D
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);
    summary.intervention_plan_90d.week_1_2 =
      planParts[0] || summary.intervention_plan_90d.week_1_2;
    summary.intervention_plan_90d.week_3_6 =
      planParts[1] || summary.intervention_plan_90d.week_3_6;
    summary.intervention_plan_90d.week_7_12 =
      planParts[2] || summary.intervention_plan_90d.week_7_12;

    const contractParts = sanitized.decisionContract
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);
    summary.decision_contract.choice =
      contractParts[0] || summary.decision_contract.choice;
    summary.decision_contract.measurable_result =
      contractParts[1] || summary.decision_contract.measurable_result;
    summary.decision_contract.time_horizon =
      contractParts[2] || summary.decision_contract.time_horizon;
    summary.decision_contract.accepted_loss =
      contractParts[3] || summary.decision_contract.accepted_loss;
  }

  return brief;
}

/* ============================================================
   BOARDROOM SYNTHESIS — EXECUTIVE KERNEL
============================================================ */

export async function synthesizeBoardroomBrief(
  analysis: AureliusAnalysisResult
): Promise<BoardroomBrief> {
  const systemPrompt = `
${HARD_FALLBACK_PROMPT_RULE}

Jij bent de Executive Kernel van de bestuurskamer.
Je schrijft niet adviserend.
Je schrijft niet beschrijvend.
Je schrijft niet informatief.
Je output forceert besluitvorming.

Taal: Nederlands
Toon: senior partner, hard maar rationeel
Verboden: marketingtaal, AI-taal, vage termen, nuanceblokken

Dominante Cyntra Signature Layer:
- Besluitkracht is de centrale variabele.
- Er zijn geen optimale oplossingen, alleen spanningsvelden.
- Elke richting bevat expliciet verlies.
- Macht verschuift altijd formeel en informeel.
- Tijd is actief en maakt schade irreversibel.
- Besluit eindigt contractueel, niet adviserend.
- Cognitieve volwassenheid is expliciet: informatie versus moed, capaciteit versus macht.
- ${CONCRETE_REPROMPT_DIRECTIVE}
- ${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}

Niet meerdere scenario's.
Niet meerdere waarheden.
Eén dominante these.
Eén kernconflict.
Expliciet verlies.
`;

  const userPrompt = `
${HARD_FALLBACK_PROMPT_RULE}

INPUT — VOLLEDIGE AURELIUS ANALYSE:
${JSON.stringify(analysis, null, 2)}

OPDRACHT:
Produceer één bestuurlijke briefing die direct als basis dient voor een besluit-afdwingend rapport.

INHOUDSEISEN:
- Eén dominante these (maximaal 10 zinnen)
- Eén niet-optimaliseerbaar kernconflict
- Minimaal twee expliciete verliezen
- Expliciete toets: versterkt of ondermijnt dit de besluitkracht van de top
- Opportunity cost voor dag 0, 90 dagen en 365 dagen
- Governance impact op besluitkracht, escalatie, diffuse verantwoordelijkheid en centralisatie van macht
- ${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}
- Machtsdynamiek en onderstroom: machtverlies, informele invloed en sabotagepatronen
- Cognitieve volwassenheidsreflectie: informatieprobleem vs moedprobleem of capaciteitsprobleem vs machtsprobleem
- Executierisico met blokkadepunt, blocker en onderstroom
- 90-dagen interventieplan met exact: week 1-2, week 3-6, week 7-12
- Hard decision contract met exacte openingszin: De Raad van Bestuur committeert zich aan:

REGELS:
- Geen markdown
- Geen bullets buiten decision contract tekstvelden
- Geen consultant-cliche
- Geen technisch jargon
- Alleen JSON

OUTPUT — STRICT JSON (VOLG EXACT):
{
  "executive_thesis": string,
  "central_tension": string,
  "strategic_narrative": string,

  "executive_summary_block": {
    "dominant_thesis": string,
    "core_conflict": string,
    "tradeoff_statement": string,
    "opportunity_cost": {
      "days_0": string,
      "days_90": string,
      "days_365": string
    },
    "governance_impact": {
      "decision_power": string,
      "escalation": string,
      "responsibility_diffusion": string,
      "power_centralization": string
    },
    "power_dynamics": {
      "who_loses_power": string,
      "informal_influence": string,
      "expected_sabotage_patterns": string
    },
    "execution_risk": {
      "failure_point": string,
      "blocker": string,
      "hidden_understream": string
    },
    "signature_layer": {
      "decision_power_axis": string,
      "structural_tension": string,
      "explicit_loss": string,
      "power_shift": string,
      "time_pressure": string,
      "cognitive_maturity_reflection": string,
      "historical_repetition": string,
      "adaptive_hardness_mode": "klinisch" | "confronterend" | "strategisch_beheerst"
    },
    "intervention_plan_90d": {
      "week_1_2": string,
      "week_3_6": string,
      "week_7_12": string
    },
    "decision_contract": {
      "opening_line": "De Raad van Bestuur committeert zich aan:",
      "choice": string,
      "measurable_result": string,
      "time_horizon": string,
      "accepted_loss": string
    }
  },

  "key_tradeoffs": [
    {
      "type": "focus_vs_spread" | "speed_vs_consensus" | "control_vs_autonomy" | "short_term_vs_long_term" | "stability_vs_change",
      "chosen_side": string,
      "abandoned_side": string,
      "consequence": string
    }
  ],

  "irreversible_decisions": [
    {
      "decision": string,
      "why_irreversible": string,
      "point_of_no_return": string
    }
  ],

  "cyntra_proposal": {
    "positioning": string,
    "interventions": [
      {
        "action": string,
        "owner": string,
        "deadline": string,
        "enforcement": string
      }
    ],
    "mandate_required": {
      "level": "informal" | "formal" | "board_level" | "ownership_level",
      "required_from": string,
      "consequence_if_withheld": string
    }
  },

  "governance_risks": string[],
  "execution_risks": string[],
  "confidence_level": number
}
`;

  const raw = await callAI("gpt-4o", [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  const parsed = enforceConcreteBrief(JSON.parse(raw) as BoardroomBrief);
  assertSignatureLayerCompliance(parsed);
  return parsed;
}
