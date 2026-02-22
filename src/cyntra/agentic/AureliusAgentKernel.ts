// ============================================================
// CYNTRA -- AURELIUS AGENTIC KERNEL (FINAL)
// Single-agent, deterministic output, internal iteration only.
// ============================================================

import type {
  DecisionContract,
  DecisionGateResult,
} from "../decision/DecisionContractTypes";
import { validateDecisionContract } from "../decision/DecisionContractValidator";
import { gateDecisionContract } from "../decision/DecisionContractGate";
import {
  getSectorProfile,
  formatSectorConstraints,
  type SectorArena,
} from "../sector/sectorProfiles";
import {
  BASE_CONSTRAINTS,
  filterConstraints,
  formatConstraintBlock,
} from "../precedent/precedentConstraints";

export type LLMRequest = {
  prompt: string;
  json: boolean;
  temperature: number;
  maxTokens: number;
};

export type LLMCaller = (req: LLMRequest) => Promise<string>;

export type AgenticKernelInput = {
  context: string;
  arena: SectorArena;
  maxIterations?: number;
  constraints?: typeof BASE_CONSTRAINTS;
  llm: LLMCaller;
};

export type AgenticKernelResult = {
  success: boolean;
  gate: DecisionGateResult;
  iterations: number;
  raw_output: string;
};

const MAX_ITERATIONS_DEFAULT = 3;

function buildPrompt(
  context: string,
  arena: SectorArena,
  constraintBlock: string,
  sectorBlock: string,
  iteration: number
) {
  return [
    "SYSTEM:",
    "Jij bent AURELIUS Decision Contract Generator.",
    "Je output is uitsluitend een hard besluitcontract in het Nederlands.",
    "Niet adviserend. Niet beschrijvend. Niet informatief. Alleen besluit-afdwingend.",
    "Geen markdown. Geen toelichting. Geen scenario's. Geen alternatieven.",
    "Cyntra Signature Layer is dominant: besluitkracht, spanningsveld, expliciet verlies, machtsverschuiving, tijdsdruk, cognitieve volwassenheid.",
    "Het contract moet expliciet verlies, macht en executie afdwingen.",
    "decision_statement begint exact met: De Raad van Bestuur committeert zich aan:",
    "decision_statement bevat expliciet: De werkelijke bestuurlijke kern is niet X, maar Y.",
    "decision_statement bevat expliciet: De ongemakkelijke waarheid is: ...",
    "decision_statement benoemt expliciet of besluitkracht aan de top versterkt of ondermijnd wordt.",
    "decision_statement benoemt een onoplosbaar spanningsveld.",
    "decision_statement benoemt expliciet Keuze A of B.",
    "scope benoemt minimaal drie machtsactoren met verlies, winst, sabotagewijze en instrument.",
    "scope benoemt concrete organisatiedomeinen en tijdshorizon.",
    "irreversible_action benoemt expliciet welk verlies wordt geaccepteerd.",
    "irreversible_action benoemt expliciet: formeel machtsverlies, informeel machtsverlies, beslismonopolie, per-direct stop en niet-escalatie.",
    "first_execution_signal is meetbaar en verifieerbaar binnen 30 dagen.",
    "first_execution_signal bevat expliciet: Wie tempo controleert, controleert macht.",
    "first_execution_signal benoemt actief tijdsvenster en irreversibiliteit bij uitstel.",
    "failure_mode_if_ignored benoemt expliciet informatieprobleem versus moedprobleem of capaciteitsprobleem versus machtsprobleem.",
    "failure_mode_if_ignored benoemt blokkade, onderstroom en bestuurlijke schade.",
    "Gebruik bij dunne context exact: Op basis van bestuurlijke patronen in vergelijkbare organisaties:",
    "Verboden woorden: default template, governance-technisch, patroon, context is schaars, werk uit, mogelijk, lijkt erop dat, zou kunnen, men zou, belangrijke succesfactor, quick win, low hanging fruit.",
    "",
    `ARENA: ${arena.toUpperCase()}`,
    `ITERATION: ${iteration}`,
    "",
    "SECTORCONSTRAINTS:",
    sectorBlock || "GEEN",
    constraintBlock || "GEEN",
    "",
    "INPUT_CONTEXT:",
    context.trim(),
    "",
    "OUTPUT JSON EXACT MET DIT SCHEMA:",
    "{",
    '  "decision_statement": "string",',
    '  "owner": "string",',
    '  "scope": "string",',
    '  "irreversible_action": "string",',
    '  "consequence_if_not_executed": "string",',
    '  "execution_window_days": 1,',
    '  "first_execution_signal": "string",',
    '  "failure_mode_if_ignored": "string"',
    "}",
  ].join("\n");
}

function normalizeContract(raw: any): DecisionContract | null {
  if (!raw || typeof raw !== "object") return null;

  const contract: DecisionContract = {
    decision_statement: String(
      raw.decision_statement ?? raw.decision ?? ""
    ).trim(),
    owner: String(raw.owner ?? "").trim(),
    scope: String(raw.scope ?? raw.mandate_scope ?? "").trim(),
    irreversible_action: String(
      raw.irreversible_action ?? raw.irreversible ?? ""
    ).trim(),
    consequence_if_not_executed: String(
      raw.consequence_if_not_executed ?? raw.non_execution_consequence ?? ""
    ).trim(),
    execution_window_days: Number(raw.execution_window_days ?? raw.deadline_days ?? 0),
    first_execution_signal: String(
      raw.first_execution_signal ?? raw.execution_signal ?? ""
    ).trim(),
    failure_mode_if_ignored: String(
      raw.failure_mode_if_ignored ?? raw.failure_mode ?? ""
    ).trim(),
  };

  return contract;
}

export async function runAureliusAgentKernel(
  input: AgenticKernelInput
): Promise<AgenticKernelResult> {
  const maxIterations = input.maxIterations ?? MAX_ITERATIONS_DEFAULT;
  const profile = getSectorProfile(input.arena);
  const sectorBlock = formatSectorConstraints(profile);

  const constraints = input.constraints ?? BASE_CONSTRAINTS;
  const selectedConstraints = filterConstraints(constraints, input.arena);
  const constraintBlock = formatConstraintBlock(selectedConstraints);

  let raw_output = "";
  let lastGate: DecisionGateResult | null = null;

  for (let i = 1; i <= maxIterations; i += 1) {
    const prompt = buildPrompt(
      input.context,
      input.arena,
      constraintBlock,
      sectorBlock,
      i
    );

    raw_output = await input.llm({
      prompt,
      json: true,
      temperature: 0.2,
      maxTokens: 900,
    });

    let parsed: any = null;
    try {
      parsed = JSON.parse(raw_output);
    } catch {
      parsed = null;
    }

    const normalized = normalizeContract(parsed);
    const validation = validateDecisionContract(normalized ?? {});
    lastGate = gateDecisionContract(normalized, validation);

    if (lastGate.status === "PASS") {
      return {
        success: true,
        gate: lastGate,
        iterations: i,
        raw_output,
      };
    }

    if (lastGate.status === "REPAIR") {
      input.context +=
        "\n\nREPAIR: Verhoog bestuurlijke scherpte. Voeg de denkvorm 'De werkelijke bestuurlijke kern is niet X, maar Y.' toe, benoem 'De ongemakkelijke waarheid is: ...', maak formeel en informeel machtsverlies expliciet, wijs beslismonopolie toe, leg per-direct stop en niet-escalatie vast, en gebruik in first_execution_signal de zin 'Wie tempo controleert, controleert macht.'";
      continue;
    }

    if (lastGate.status === "FAIL") {
      break;
    }
  }

  return {
    success: false,
    gate:
      lastGate ??
      gateDecisionContract(null, {
        viable: false,
        missing: ["decision_statement"],
        severity: "CRITICAL",
        violations: ["No valid output"],
      }),
    iterations: maxIterations,
    raw_output,
  };
}
