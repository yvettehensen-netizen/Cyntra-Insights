import type { AnalysisContext } from "@/aurelius/engine/types";
import type { BoardroomInput } from "@/aurelius/narrative/generateBoardroomNarrative";
import { generateBoardroomNarrative } from "@/aurelius/narrative/generateBoardroomNarrative";
import { buildBoardroomBrief } from "@/aurelius/synthesis/buildBoardroomBrief";
import type { RunCyntraResult } from "@/aurelius/hooks/useCyntraAnalysis";
import {
  StrategicMechanismEngine,
  type StrategicMechanism,
} from "@/aurelius/engine/nodes/strategy/StrategicMechanismEngine";
import {
  StrategicInsightEngine,
  type StrategicInsight,
} from "@/aurelius/engine/nodes/strategy/StrategicInsightEngine";
import {
  DecisionPressureEngine,
  type StrategicDecisionOutput,
} from "@/aurelius/engine/nodes/strategy/DecisionPressureEngine";
import { buildStrategicAnalysisMap } from "@/aurelius/analysis/buildStrategicAnalysisMap";
import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";

export type CyntraAgentContextState = {
  organisation: string;
  sector: string;
  financial_pressure: string;
  operational_state: string;
  governance_state: string;
  team_state: string;
};

export type CyntraAgentDiagnosis = {
  structural_pressures: string;
  economic_constraints: string;
  operational_bottlenecks: string;
  governance_gaps: string;
};

export type CyntraAgentInput = {
  context: AnalysisContext;
  boardroomInput?: Partial<BoardroomInput>;
  narrativeMode?: "deterministic" | "llm";
};

export type CyntraAgentOutput = {
  context_state: CyntraAgentContextState;
  diagnosis: CyntraAgentDiagnosis;
  mechanisms: StrategicMechanism[];
  insights: StrategicInsight[];
  decision: StrategicDecisionOutput;
  analysis_map: StrategicAnalysisMap;
  narrative: {
    mode: "deterministic" | "llm";
    context_document: string;
    boardroom_narrative?: string;
    boardroom_brief?: ReturnType<typeof buildBoardroomBrief>;
  };
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function boolText(condition: boolean, yesText: string, noText: string): string {
  return condition ? yesText : noText;
}

function reconstructContextState(context: AnalysisContext): CyntraAgentContextState {
  const raw = normalize(context.rawText);
  const docs = (context.documents ?? []).join("\n");
  const source = `${raw}\n${docs}`.toLowerCase();

  const organisation =
    String((context.userContext as Record<string, unknown> | undefined)?.companyName ?? "").trim() ||
    "Organisatie niet expliciet benoemd in context";
  const sector =
    String((context.userContext as Record<string, unknown> | undefined)?.sector ?? "").trim() ||
    (/\bggz|zorg|jeugdzorg\b/i.test(source) ? "zorg/ggz" : "sector niet expliciet benoemd");

  const financial_pressure = boolText(
    /(marge|verlies|tarief|kostprijs|contract|plafond|liquiditeit|loonkosten)/.test(source),
    "Hoge financiële druk door combinatie van kostenstijging, tariefbeperking en contractruimte.",
    "Financiële druk is aanwezig maar niet volledig kwantitatief onderbouwd in de context."
  );
  const operational_state = boolText(
    /(capaciteit|planning|intake|werkdruk|productiviteit|uitval|no-show)/.test(source),
    "Operationele uitvoering staat onder druk door capaciteit, planning en normbelasting.",
    "Operationele signalen zijn beperkt; stuurinformatie over capaciteit is deels impliciet."
  );
  const governance_state = boolText(
    /(governance|mandaat|besluit|escalatie|onderstroom|uitstel)/.test(source),
    "Governance is deels gefragmenteerd: besluitkracht en escalatieritme zijn niet overal consistent.",
    "Governance- en mandaatinformatie is aanwezig maar nog onvoldoende expliciet in rolritme."
  );
  const team_state = boolText(
    /(team|medewerker|behandelaar|productienorm|gesprek|weerstand|loyaliteit)/.test(source),
    "Teamdynamiek toont spanning tussen professionele kwaliteit, normdruk en uitvoerbaarheid.",
    "Teamdynamiek is beperkt benoemd; risico op verborgen uitvoeringsfrictie blijft aanwezig."
  );

  return {
    organisation,
    sector,
    financial_pressure,
    operational_state,
    governance_state,
    team_state,
  };
}

function runDiagnosisLayer(
  contextState: CyntraAgentContextState,
  context: AnalysisContext
): CyntraAgentDiagnosis {
  const source = `${context.rawText}\n${(context.documents ?? []).join("\n")}`.toLowerCase();
  return {
    structural_pressures: `${contextState.financial_pressure} ${contextState.operational_state}`,
    economic_constraints: boolText(
      /(contract|plafond|tarief|kostprijs|bijbetaling|verzekeraar)/.test(source),
      "Economische ruimte wordt begrensd door contractvoorwaarden, prijsdruk en beperkte doorberekenbaarheid.",
      "Economische beperkingen zijn aannemelijk, maar contract- en tariefstructuur is deels ongespecificeerd."
    ),
    operational_bottlenecks: boolText(
      /(planning|intake|capaciteit|casemix|productiviteit|no-show|doorlooptijd)/.test(source),
      "Bottlenecks zitten in capaciteitstoedeling, planning en mismatch tussen normering en casemix.",
      "Operationele bottlenecks zijn nog niet volledig geobjectiveerd met ritmische KPI's."
    ),
    governance_gaps: boolText(
      /(mandaat|besluit|escalatie|onderstroom|vermijding|parallel)/.test(source),
      "Governance-gaps ontstaan door parallelle agenda's, onduidelijke beslisrechten en vertraagde escalatie.",
      "Governance-gaps zijn mogelijk, maar huidige context geeft beperkte informatie over besluitarchitectuur."
    ),
  };
}

function formatContextDocument(
  contextState: CyntraAgentContextState,
  diagnosis: CyntraAgentDiagnosis,
  mechanisms: StrategicMechanism[],
  insights: StrategicInsight[],
  decision: StrategicDecisionOutput
): string {
  const mechanismBlock = mechanisms
    .map(
      (m, index) =>
        `${index + 1}. Symptoom: ${m.symptom} Mechanisme: ${m.mechanism} Oorzaak: ${m.structural_cause} Effect: ${m.system_effect}`
    )
    .join("\n");
  const insightBlock = insights
    .map(
      (i, index) =>
        `${index + 1}. Inzicht: ${i.insight} Implicatie: ${i.implication} Hefboom: ${i.strategic_lever}`
    )
    .join("\n");

  return [
    `CONTEXT LAYER`,
    `Organisatie: ${contextState.organisation}`,
    `Sector: ${contextState.sector}`,
    `Financiële druk: ${contextState.financial_pressure}`,
    `Operationele staat: ${contextState.operational_state}`,
    `Governance staat: ${contextState.governance_state}`,
    `Team staat: ${contextState.team_state}`,
    ``,
    `DIAGNOSIS LAYER`,
    `Structurele druk: ${diagnosis.structural_pressures}`,
    `Economische beperkingen: ${diagnosis.economic_constraints}`,
    `Operationele bottlenecks: ${diagnosis.operational_bottlenecks}`,
    `Governance-gaps: ${diagnosis.governance_gaps}`,
    ``,
    `MECHANISM LAYER`,
    mechanismBlock,
    ``,
    `STRATEGIC INSIGHT LAYER`,
    insightBlock,
    ``,
    `DECISION LAYER`,
    `Dominante these: ${decision.dominant_thesis}`,
    `Voorkeursoptie: ${decision.preferred_option}`,
    `Waarom: ${decision.preferred_option_reason}`,
    `Prijs van uitstel 30 dagen: ${decision.price_of_delay.days_30}`,
    `Prijs van uitstel 90 dagen: ${decision.price_of_delay.days_90}`,
    `Prijs van uitstel 365 dagen: ${decision.price_of_delay.days_365}`,
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function buildBoardroomInputFromLayers(
  input: CyntraAgentInput,
  contextState: CyntraAgentContextState,
  diagnosis: CyntraAgentDiagnosis,
  mechanisms: StrategicMechanism[],
  insights: StrategicInsight[],
  decision: StrategicDecisionOutput,
  contextDocument: string
): BoardroomInput {
  const mechanismText = mechanisms
    .map((m) => `${m.symptom} ${m.mechanism} ${m.structural_cause} ${m.system_effect}`)
    .join(" ");
  const insightText = insights
    .map((i) => `${i.insight} ${i.implication} ${i.strategic_lever}`)
    .join(" ");

  return {
    company_name: contextState.organisation,
    company_context: [
      contextDocument,
      "",
      "NARRATIVE KETEN: Context -> Spanning -> Mechanisme -> Bestuurlijke implicatie.",
      mechanismText,
      insightText,
      decision.decision_block,
    ]
      .filter(Boolean)
      .join("\n"),
    executive_thesis: decision.dominant_thesis,
    central_tension: diagnosis.structural_pressures,
    strategic_narrative: contextDocument,
    governance_risks: [diagnosis.governance_gaps],
    execution_risks: [diagnosis.operational_bottlenecks],
    executive_summary_block: {
      dominant_thesis: decision.dominant_thesis,
      core_conflict: diagnosis.structural_pressures,
      tradeoff_statement: decision.explicit_tradeoffs
        .map((tradeoff) => `${tradeoff.option.code}: ${tradeoff.disadvantages}`)
        .join(" "),
      opportunity_cost: {
        days_30: decision.price_of_delay.days_30,
        days_90: decision.price_of_delay.days_90,
        days_365: decision.price_of_delay.days_365,
      },
      governance_impact: {
        decision_power: contextState.governance_state,
        escalation: "Escalatie vereist expliciet 48-uurs ritme op blokkades.",
        responsibility_diffusion: diagnosis.governance_gaps,
        power_centralization: "Besluitrecht verschuift tijdelijk naar centrale prioritering.",
      },
      power_dynamics: {
        who_loses_power: "Lokale teams verliezen uitzonderingsruimte op portfolio- en capaciteitskeuzes.",
        informal_influence: contextState.team_state,
        expected_sabotage_patterns: "Vertraging via uitstel, overlegstapeling en informele bypass van prioriteiten.",
      },
      execution_risk: {
        failure_point: diagnosis.operational_bottlenecks,
        blocker: diagnosis.governance_gaps,
        hidden_understream: contextState.team_state,
      },
      signature_layer: {
        decision_power_axis: "Consolideren versus verbreden onder druk.",
        structural_tension: diagnosis.structural_pressures,
        explicit_loss:
          "Tijdelijke rem op niet-kerninitiatieven totdat kernstabiliteit aantoonbaar hersteld is.",
        power_shift: "Van verspreid naar centraal besluitrecht op capaciteit en prioritering.",
        time_pressure: "30/90/365 dagen volgen een oplopende verliescurve.",
      },
      intervention_plan_90d: {
        week_1_2: "Margekaart en stop/door-keuzes formaliseren.",
        week_3_6: "Governance-ritme en escalatiediscipline borgen.",
        week_7_12: "Normering, capaciteit en strategiekeuze contracteren.",
      },
      decision_contract: {
        opening_line: decision.dominant_thesis,
        choice: `Voorkeursoptie ${decision.preferred_option}`,
        measurable_result:
          "Binnen 90 dagen aantoonbare verbetering op margediscipline, besluitritme en capaciteitsvoorspelbaarheid.",
        time_horizon: "14 dagen besluit, 30 dagen executiebewijs, 365 dagen structureel effect.",
        accepted_loss:
          "Tijdelijk verlies van parallelle groei om kerncontinuïteit en bestuurbaarheid te herstellen.",
      },
    },
    ...input.boardroomInput,
  };
}

export async function runCyntraAgent(
  input: CyntraAgentInput
): Promise<CyntraAgentOutput> {
  const narrativeMode = input.narrativeMode ?? "deterministic";
  const context_state = reconstructContextState(input.context);
  const diagnosis = runDiagnosisLayer(context_state, input.context);

  const mechanismEngine = new StrategicMechanismEngine();
  const mechanisms = mechanismEngine.analyze({
    contextText: `${input.context.rawText}\n${(input.context.documents ?? []).join("\n")}`,
    diagnosisText: Object.values(diagnosis).join(" "),
  });

  const insightEngine = new StrategicInsightEngine();
  const insights = insightEngine.analyze({ mechanisms });

  const decisionEngine = new DecisionPressureEngine();
  const decision = decisionEngine.analyze({
    contextText: input.context.rawText,
    diagnosisText: Object.values(diagnosis).join(" "),
    mechanisms,
    insights,
  });

  const context_document = formatContextDocument(
    context_state,
    diagnosis,
    mechanisms,
    insights,
    decision
  );

  const narrativeInput = buildBoardroomInputFromLayers(
    input,
    context_state,
    diagnosis,
    mechanisms,
    insights,
    decision,
    context_document
  );
  const analysis_map = buildStrategicAnalysisMap({
    organisation: input.boardroomInput?.company_name,
    sector: context_state.sector,
    dominantRisk: diagnosis.structural_pressures,
    strategicOptions: decision.strategic_options.map((item) => `${item.code}: ${item.name}`),
    recommendedOption:
      decision.strategic_options.find((item) => item.code === decision.preferred_option)?.name ||
      decision.preferred_option,
  });
  narrativeInput.analysis_map = analysis_map;

  let boardroom_narrative: string | undefined;
  if (narrativeMode === "llm") {
    boardroom_narrative = await generateBoardroomNarrative(narrativeInput, {
      minWords: 3500,
      maxWords: 6200,
      temperature: 0.18,
    });
  } else {
    boardroom_narrative = context_document;
  }

  const syntheticResult: RunCyntraResult = {
    report: decision.dominant_thesis,
    confidence: "high",
  };

  const boardroom_brief = buildBoardroomBrief(
    syntheticResult,
    boardroom_narrative
  );

  return {
    context_state,
    diagnosis,
    mechanisms,
    insights,
    decision,
    analysis_map,
    narrative: {
      mode: narrativeMode,
      context_document,
      boardroom_narrative,
      boardroom_brief,
    },
  };
}
