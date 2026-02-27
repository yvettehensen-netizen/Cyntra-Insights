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
import {
  HGBCO_MCKINSEY_SYSTEM_INJECT,
  HGBCO_MCKINSEY_USER_INJECT,
  enforceAtoERatioStructure,
  enforceDecisionContractHard,
  enforceHgbcoHeadings,
  enforceNoMetaNoTemplate,
  enforceUpperLowerStream,
  hasDecisionContractCommitBlock,
  hasForbiddenLanguage,
} from "@/aurelius/narrative/guards/hgbcoMcKinseySpec";

const SIGNATURE_LAYER_ERROR_TEXT = CYNTRA_SIGNATURE_LAYER_VIOLATION;
const EXECUTIVE_PROMPT_INJECT =
  "Genereer een strategische bestuursbriefing uitsluitend op basis van broncontext uit de aangeleverde analyse. Schrijf in natuurlijk Nederlands met concrete bovenstroom en onderstroom.";
const MANDATORY_GGZ_CASE_FACTS_BLOCK = `
BRONDISCIPLINE:
- Gebruik uitsluitend aantoonbare feiten uit de inputanalyse.
- Geen sectorsjablonen als feit.
- Geen bedragen of percentages zonder bron.
- Ontbrekende cijfers expliciet markeren als niet onderbouwd.
`.trim();
const OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE =
  "Opportunity Cost MOET drie unieke lagen bevatten: 30 dagen (direct signaalverlies + eerste gedragsverschuiving), 90 dagen (zichtbare machtsverschuiving + structurele erosie), 365 dagen (systeemverschuiving + onomkeerbare positie + dominante coalitie). Maak na 12 maanden concreet wat niet zonder reputatieschade terug te draaien is.";
const HARD_FALLBACK_PROMPT_RULE =
  "Als input dun is: blijf brongebonden, benoem hiaten en verzin geen feiten.";
const INTELLIGENT_SECTOR_FALLBACK_RULE =
  "Bij minimale of vage input: gebruik alleen broncontext uit de aangeleverde analyse en markeer ontbrekende onderbouwing expliciet.";
const ANTI_FILLER_RULE =
  "Geen sectie mag starten met 'SIGNATURE LAYER WAARSCHUWING', 'Contextsignaal', 'Aanname:', 'Contextanker:', 'beperkte context' of 'duid structureel'. Verbied generieke taal zoals 'default template', 'transformatie-template', 'governance-technisch', 'patroon', 'context is schaars', 'werk uit', 'mogelijk', 'lijkt erop dat', 'zou kunnen', 'men zou', 'belangrijke succesfactor', 'quick win' en 'low hanging fruit'.";

const STRICT_BANNED_LANGUAGE_GUARD =
  /\b(default template|transformatie-template|governance-technisch|aanname:|contextanker:|signat(?:ure)? layer waarschuwing)\b/i;
const POST_SANITIZE_LINE_PATTERNS = [
  /^\s*SIGNATURE LAYER WAARSCHUWING.*$/gim,
  /^\s*Contextsignaal:.*$/gim,
  /^\s*Aanname:.*$/gim,
  /^\s*Contextanker:.*$/gim,
  /^\s*beperkte context.*$/gim,
  /^\s*duid structureel.*$/gim,
  /\$\{facts\.[^}]+\}/gim,
];

const DOMINANT_HYPOTHESIS_GUARD =
  /\bde werkelijke bestuurlijke kern is niet\b[\s\S]{0,180}\bmaar\b/i;

const UNCOMFORTABLE_TRUTH_GUARD =
  /\bde ongemakkelijke waarheid is:\b/i;

const TEMPO_POWER_GUARD =
  /\bwie tempo controleert,\s*controleert macht\./i;

const POWER_ACTOR_EXTRACT_GUARD =
  /\b(ceo|cfo|coo|chro|cto|cmo|raad van bestuur|rvb|raad van toezicht|rvt|or|ondernemingsraad|medisch directeur|medisch manager|regiodirecteur|programmadirecteur|lijnmanager|operationsdirecteur|founder|investeerder|compliance officer)\b/gi;

const GGZ_SIGNAL_GUARD =
  /\b(ggz|geestelijke gezondheidszorg|jeugdzorg|igj|wachtlijst|mac|ambulantisering|klinische capaciteit|zorgzwaartebekostiging|transformatiegelden|burn-out)\b/i;

const GGZ_DEPTH_GUARDS = {
  igj: /\b(igj|sanctie|toezicht)\b/i,
  wachtlijstMac: /\b(wachtlijst[\s-]*mac|mac-druk|wachtlijstdruk)\b/i,
  wachtlijstMacVast: /\b(wachtlijst[\s-]*mac)\b[\s\S]{0,80}\b(vast|hardnekkig|structureel)\b/i,
  ambulantVsKlinisch: /\b(ambulantisering)\b/i,
  klinischeCapaciteit: /\b(klinische capaciteit)\b/i,
  transformatiegelden: /\b(transformatiegelden|opdrogen)\b/i,
  zorgzwaartebekostiging: /\b(zorgzwaartebekostiging|bekostiging onder druk)\b/i,
  personeelBurnout: /\b(personeelstekort|burn-out)\b/i,
  centraleRegiePermanent:
    /\b(centrale regie|centrale sturing)\b[\s\S]{0,80}\b(permanent|structureel)\b/i,
};

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasEuroOrPercent(text: string): boolean {
  return /(€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%)/i.test(text);
}

function normalizeComparableText(text: string): string {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function collectPowerActors(text: string): string[] {
  const matches = String(text ?? "").match(POWER_ACTOR_EXTRACT_GUARD) ?? [];
  return [...new Set(matches.map((m) => m.toLowerCase().replace(/\s+/g, " ").trim()))];
}

function clampChars(value: string, maxChars: number): string {
  const source = String(value ?? "").trim();
  if (source.length <= maxChars) return source;
  return `${source.slice(0, maxChars).trim()} ...`;
}

function collectCaseFragmentsFromAnalysis(
  analysis: AureliusAnalysisResult
): string[] {
  const fragments: string[] = [];
  const keywordGuard =
    /\b(ggz|zorg|igj|wachtlijst|mac|ambulantisering|klinische|transformatiegelden|zorgzwaartebekostiging|tarief|loonkosten|eigen betaling|productiviteitsnorm|vallei werkt|hr-loket|verhuizing|kamers|stuurinformatie|werkdruk|consolideren|meerjarenstrategie)\b/i;

  const visit = (value: unknown, depth: number) => {
    if (depth > 4 || value == null) return;
    if (typeof value === "string") {
      const cleaned = value.replace(/\s+/g, " ").trim();
      if (cleaned.length >= 24 && keywordGuard.test(cleaned)) {
        fragments.push(cleaned);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.slice(0, 60).forEach((entry) => visit(entry, depth + 1));
      return;
    }
    if (typeof value === "object") {
      Object.values(value as Record<string, unknown>)
        .slice(0, 80)
        .forEach((entry) => visit(entry, depth + 1));
    }
  };

  visit(analysis, 0);
  return [...new Set(fragments)].slice(0, 60);
}

function collectCaseAnchorsFromAnalysis(analysis: AureliusAnalysisResult): string[] {
  const fragments = collectCaseFragmentsFromAnalysis(analysis);
  const anchors: string[] = [];
  const frictionGuard =
    /\b(werkdruk|stuurinformatie|productiviteit|intake|planning|verhuizing|kamers|hr-loket|vallei werkt|eigen betaling|loonkosten|tarief|wachtlijst|onderstroom|governance)\b/i;

  for (const fragment of fragments) {
    const trimmed = fragment.trim();
    if (!trimmed) continue;

    const numberHit =
      trimmed.match(/€\s*\d[\d.,]*/i)?.[0] ??
      trimmed.match(/\d+(?:[.,]\d+)?\s*%/i)?.[0] ??
      trimmed.match(/\d+\s*dagen?/i)?.[0] ??
      "";
    if (numberHit) anchors.push(numberHit);

    const nameHit = trimmed.match(/\b[A-Z][a-z]{2,}\b/g) ?? [];
    for (const token of nameHit) {
      if (/^(De|Het|Een|Dit|Daarnaast|Raad|Bestuur|Sector|Analyse)$/i.test(token)) {
        continue;
      }
      anchors.push(token);
      break;
    }

    if (frictionGuard.test(trimmed)) {
      anchors.push(trimmed.slice(0, 72).trim());
    }
  }

  return [...new Set(anchors.map((anchor) => anchor.trim()).filter(Boolean))].slice(0, 12);
}

function normalizeAnchor(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9€%]+/g, " ")
    .trim();
}

function ensureMinimumCaseAnchors(text: string, anchors: string[]): string {
  const source = String(text ?? "").trim();
  if (!source) return source;
  if (!anchors.length) return source;

  const normalized = normalizeAnchor(source);
  let hits = 0;
  for (const anchor of anchors) {
    const key = normalizeAnchor(anchor);
    if (!key) continue;
    if (normalized.includes(key)) hits += 1;
    if (hits >= 3) return source;
  }

  const topAnchors = anchors.slice(0, 3).join(", ");
  return `${source} Op basis van bestuurlijke patronen in deze sector: deze casus is direct zichtbaar in ${topAnchors}.`;
}

function extractMarkdownSectionByNumber(markdown: string, number: number): string {
  const source = String(markdown ?? "").trim();
  if (!source) return "";

  const headingRegex = /^###\s*(\d+)\.\s*[^\n]+$/gm;
  const matches = [...source.matchAll(headingRegex)];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    if (Number(match[1] || 0) !== number) continue;
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    return source.slice(start, end).replace(/^\n+/, "").trim();
  }
  return "";
}

function extractOpportunityWindow(section: string, label: "30" | "90" | "365"): string {
  const regex = new RegExp(
    `${label}\\s*dagen\\s*[:\\-]\\s*([\\s\\S]*?)(?=(?:30|90|365)\\s*dagen\\s*[:\\-]|$)`,
    "i"
  );
  const match = String(section ?? "").match(regex);
  if (!match) return "";
  return String(match[1] || "").trim();
}

function hasNineHgbcoSections(markdown: string): boolean {
  const matches = String(markdown ?? "").match(/^###\s*\d+\.\s+/gm) ?? [];
  return matches.length === 9;
}

function hasAtoERatioForAllSections(markdown: string): boolean {
  const sections = String(markdown ?? "")
    .split(/\n(?=###\s*\d+\.\s+)/g)
    .map((section) => section.trim())
    .filter(Boolean);
  if (sections.length !== 9) return false;
  return sections.every((section) =>
    ["A", "B", "C", "D", "E"].every((letter) =>
      new RegExp(`^\\s*#{0,6}\\s*${letter}\\.`, "im").test(section)
    )
  );
}

function validateMcKinseyNarrativeRuntime(markdown: string) {
  if (!hasNineHgbcoSections(markdown)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
  if (!hasAtoERatioForAllSections(markdown)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
  if (!hasDecisionContractCommitBlock(markdown)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
  if (hasForbiddenLanguage(markdown)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function buildBriefHgbcoMarkdown(brief: BoardroomBrief): string {
  const summary = brief.executive_summary_block;
  const dominant = summary?.dominant_thesis || brief.executive_thesis || "";
  const conflict = summary?.core_conflict || brief.central_tension || "";
  const tradeoffs = summary?.tradeoff_statement || "";
  const opportunity = summary?.opportunity_cost
    ? `30 dagen: ${summary.opportunity_cost.days_30 || summary.opportunity_cost.days_0}\n\n90 dagen: ${summary.opportunity_cost.days_90}\n\n365 dagen: ${summary.opportunity_cost.days_365}`
    : "";
  const governance = summary?.governance_impact
    ? `${summary.governance_impact.decision_power}\n\n${summary.governance_impact.escalation}\n\n${summary.governance_impact.responsibility_diffusion}\n\n${summary.governance_impact.power_centralization}`
    : "";
  const power = summary?.power_dynamics
    ? `${summary.power_dynamics.who_loses_power}\n\n${summary.power_dynamics.informal_influence}\n\n${summary.power_dynamics.expected_sabotage_patterns}`
    : "";
  const execution = summary?.execution_risk
    ? `${summary.execution_risk.failure_point}\n\n${summary.execution_risk.blocker}\n\n${summary.execution_risk.hidden_understream}`
    : "";
  const plan = summary?.intervention_plan_90d
    ? `Week 1-2: ${summary.intervention_plan_90d.week_1_2}\n\nWeek 3-6: ${summary.intervention_plan_90d.week_3_6}\n\nWeek 7-12: ${summary.intervention_plan_90d.week_7_12}`
    : "";
  const contract = summary?.decision_contract
    ? `De Raad van Bestuur committeert zich aan:\n\nKeuze: ${summary.decision_contract.choice}\n\nMeasurable result: ${summary.decision_contract.measurable_result}\n\nTime horizon: ${summary.decision_contract.time_horizon}\n\nAccepted loss: ${summary.decision_contract.accepted_loss}`
    : "De Raad van Bestuur committeert zich aan:";

  return [
    "### 1. DOMINANTE BESTUURLIJKE THESE",
    dominant,
    "### 2. HET KERNCONFLICT",
    conflict,
    "### 3. EXPLICIETE TRADE-OFFS",
    tradeoffs,
    "### 4. OPPORTUNITY COST",
    opportunity,
    "### 5. GOVERNANCE IMPACT",
    governance,
    "### 6. MACHTSDYNAMIEK & ONDERSTROOM",
    power,
    "### 7. EXECUTIERISICO",
    execution,
    "### 8. 90-DAGEN INTERVENTIEPLAN",
    plan,
    "### 9. DECISION CONTRACT",
    contract,
  ]
    .map((entry) => String(entry || "").trim())
    .join("\n\n")
    .trim();
}

function enforceMcKinseyBriefFields(
  brief: BoardroomBrief,
  analysis: AureliusAnalysisResult
): BoardroomBrief {
  const summary = brief.executive_summary_block;
  if (!summary) return brief;

  let markdown = buildBriefHgbcoMarkdown(brief);
  markdown = enforceNoMetaNoTemplate(markdown);
  markdown = enforceHgbcoHeadings(markdown);
  markdown = enforceAtoERatioStructure(markdown);
  markdown = enforceUpperLowerStream(markdown);
  markdown = enforceDecisionContractHard(markdown);
  validateMcKinseyNarrativeRuntime(markdown);

  const section1 = extractMarkdownSectionByNumber(markdown, 1);
  const section2 = extractMarkdownSectionByNumber(markdown, 2);
  const section3 = extractMarkdownSectionByNumber(markdown, 3);
  const section4 = extractMarkdownSectionByNumber(markdown, 4);
  const section5 = extractMarkdownSectionByNumber(markdown, 5);
  const section6 = extractMarkdownSectionByNumber(markdown, 6);
  const section7 = extractMarkdownSectionByNumber(markdown, 7);
  const section8 = extractMarkdownSectionByNumber(markdown, 8);
  const section9 = extractMarkdownSectionByNumber(markdown, 9);

  const anchors = collectCaseAnchorsFromAnalysis(analysis);

  brief.executive_thesis = ensureMinimumCaseAnchors(section1 || brief.executive_thesis, anchors);
  brief.central_tension = ensureMinimumCaseAnchors(section2 || brief.central_tension, anchors);
  brief.strategic_narrative = ensureMinimumCaseAnchors(
    `${section3}\n\n${section4}\n\n${section5}`.trim() || brief.strategic_narrative,
    anchors
  );

  summary.dominant_thesis = ensureMinimumCaseAnchors(
    section1 || summary.dominant_thesis,
    anchors
  );
  summary.core_conflict = ensureMinimumCaseAnchors(
    section2 || summary.core_conflict,
    anchors
  );
  summary.tradeoff_statement = ensureMinimumCaseAnchors(
    section3 || summary.tradeoff_statement,
    anchors
  );
  summary.opportunity_cost.days_30 =
    extractOpportunityWindow(section4, "30") ||
    summary.opportunity_cost.days_30 ||
    summary.opportunity_cost.days_0;
  summary.opportunity_cost.days_0 =
    summary.opportunity_cost.days_0 || summary.opportunity_cost.days_30;
  summary.opportunity_cost.days_90 =
    extractOpportunityWindow(section4, "90") || summary.opportunity_cost.days_90;
  summary.opportunity_cost.days_365 =
    extractOpportunityWindow(section4, "365") || summary.opportunity_cost.days_365;

  summary.governance_impact.decision_power = ensureMinimumCaseAnchors(
    section5 || summary.governance_impact.decision_power,
    anchors
  );
  summary.power_dynamics.who_loses_power = ensureMinimumCaseAnchors(
    section6 || summary.power_dynamics.who_loses_power,
    anchors
  );
  summary.execution_risk.failure_point = ensureMinimumCaseAnchors(
    section7 || summary.execution_risk.failure_point,
    anchors
  );

  const planW12 = section8.match(/Week\s*1\s*[-–]\s*2\s*:\s*([^\n]+)/i)?.[1] ?? "";
  const planW36 = section8.match(/Week\s*3\s*[-–]\s*6\s*:\s*([^\n]+)/i)?.[1] ?? "";
  const planW712 = section8.match(/Week\s*7\s*[-–]\s*12\s*:\s*([^\n]+)/i)?.[1] ?? "";
  summary.intervention_plan_90d.week_1_2 = ensureMinimumCaseAnchors(
    planW12 || summary.intervention_plan_90d.week_1_2,
    anchors
  );
  summary.intervention_plan_90d.week_3_6 = ensureMinimumCaseAnchors(
    planW36 || summary.intervention_plan_90d.week_3_6,
    anchors
  );
  summary.intervention_plan_90d.week_7_12 = ensureMinimumCaseAnchors(
    planW712 || summary.intervention_plan_90d.week_7_12,
    anchors
  );

  const contractSection = section9 || "";
  summary.decision_contract.opening_line = "De Raad van Bestuur committeert zich aan:";
  summary.decision_contract.choice =
    contractSection.match(/^Keuze:\s*(.+)$/im)?.[1]?.trim() ||
    summary.decision_contract.choice;
  summary.decision_contract.measurable_result =
    contractSection.match(/^Maandelijkse KPI:\s*(.+)$/im)?.[1]?.trim() ||
    summary.decision_contract.measurable_result;
  summary.decision_contract.time_horizon =
    contractSection.match(/^Herijking:\s*(.+)$/im)?.[1]?.trim() ||
    summary.decision_contract.time_horizon;
  summary.decision_contract.accepted_loss =
    contractSection.match(/^Accepted loss:\s*(.+)$/im)?.[1]?.trim() ||
    summary.decision_contract.accepted_loss;

  return brief;
}

function buildMandatoryCaseContextFromAnalysis(
  analysis: AureliusAnalysisResult
): string {
  const extracted = collectCaseFragmentsFromAnalysis(analysis);
  const extractedBlock = extracted.length
    ? `CASUSFRAGMENTEN UIT INPUTANALYSE:\n${extracted.map((line) => `- ${line}`).join("\n")}`
    : "CASUSFRAGMENTEN UIT INPUTANALYSE: geen expliciete casuszinnen gevonden; markeer ontbrekende onderbouwing.";
  return `${MANDATORY_GGZ_CASE_FACTS_BLOCK}\n\n${extractedBlock}`;
}

function sanitizeResidualForbiddenText(text: string): string {
  let output = String(text ?? "");
  for (const pattern of POST_SANITIZE_LINE_PATTERNS) {
    output = output.replace(pattern, "");
  }
  output = output.replace(/\b(default template|transformatie-template)\b/gi, "");
  output = output.replace(/\n{3,}/g, "\n\n");
  return output.trim();
}

function scrubForbiddenLanguage(text: string): string {
  let output = String(text ?? "");
  const GGZ_CONTEXT_SENTINEL = "__GGZ_CONTEXT_SENTINEL__";
  output = output.replace(
    /op basis van bestuurlijke patronen in de ggz:/gi,
    GGZ_CONTEXT_SENTINEL
  );

  const replacements: Array<[RegExp, string]> = [
    [/\bsabotagepatronen\b/gi, "sabotagetechnieken"],
    [/\bcontext is schaars\b/gi, "context vraagt scherpe aannames"],
    [/\bwerk uit\b/gi, "maak concreet"],
    [/\bmogelijk\b/gi, "waarschijnlijk"],
    [/\blijkt erop dat\b/gi, "toont"],
    [/\bzou kunnen\b/gi, "leidt tot"],
    [/\bmen zou\b/gi, "de top moet"],
    [/\bbelangrijke succesfactor\b/gi, "harde randvoorwaarde"],
    [/\bquick wins?\b/gi, "directe ingrepen"],
    [/\blow[- ]hanging fruit\b/gi, "direct uitvoerbare ingrepen"],
    [/\bdefault template\b/gi, "standaardbouwsteen"],
    [/\btransformatie-template\b/gi, "transformatieroute"],
    [/\bgovernance-technisch\b/gi, "bestuurlijk concreet"],
  ];

  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }

  output = output.replace(
    new RegExp(GGZ_CONTEXT_SENTINEL, "g"),
    "Op basis van bestuurlijke patronen in de ggz:"
  );

  return output;
}

function hasForbiddenGenericLanguage(text: string): boolean {
  const normalized = String(text ?? "")
    .replace(/op basis van bestuurlijke patronen in de ggz:/gi, "")
    .replace(/op basis van bestuurlijke patronen in vergelijkbare organisaties:/gi, "");
  return STRICT_BANNED_LANGUAGE_GUARD.test(normalized);
}

function assertExecutiveHardRequirements(brief: BoardroomBrief) {
  const summary = brief.executive_summary_block;
  if (!summary) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }

  const dominantThesis = String(summary.dominant_thesis || brief.executive_thesis || "");
  const coreConflict = String(summary.core_conflict || brief.central_tension || "");
  if (!dominantThesis || !coreConflict) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }

  const opportunity = [
    summary.opportunity_cost.days_30 || summary.opportunity_cost.days_0,
    summary.opportunity_cost.days_90,
    summary.opportunity_cost.days_365,
  ]
    .map((part) => String(part || ""))
    .join(" ");
  if (!/\b30\s*dagen\b/i.test(opportunity) || !/\b90\s*dagen\b/i.test(opportunity)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
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

function sanitizeBriefLanguage(brief: BoardroomBrief): BoardroomBrief {
  brief.executive_thesis = scrubForbiddenLanguage(brief.executive_thesis || "");
  brief.central_tension = scrubForbiddenLanguage(brief.central_tension || "");
  brief.strategic_narrative = scrubForbiddenLanguage(brief.strategic_narrative || "");

  if (brief.executive_summary_block) {
    const summary = brief.executive_summary_block;
    summary.dominant_thesis = scrubForbiddenLanguage(summary.dominant_thesis || "");
    summary.core_conflict = scrubForbiddenLanguage(summary.core_conflict || "");
    summary.tradeoff_statement = scrubForbiddenLanguage(summary.tradeoff_statement || "");
    summary.opportunity_cost.days_30 = scrubForbiddenLanguage(
      summary.opportunity_cost.days_30 || ""
    );
    summary.opportunity_cost.days_0 = scrubForbiddenLanguage(
      summary.opportunity_cost.days_0 || ""
    );
    summary.opportunity_cost.days_90 = scrubForbiddenLanguage(
      summary.opportunity_cost.days_90 || ""
    );
    summary.opportunity_cost.days_365 = scrubForbiddenLanguage(
      summary.opportunity_cost.days_365 || ""
    );
    summary.governance_impact.decision_power = scrubForbiddenLanguage(
      summary.governance_impact.decision_power || ""
    );
    summary.governance_impact.escalation = scrubForbiddenLanguage(
      summary.governance_impact.escalation || ""
    );
    summary.governance_impact.responsibility_diffusion = scrubForbiddenLanguage(
      summary.governance_impact.responsibility_diffusion || ""
    );
    summary.governance_impact.power_centralization = scrubForbiddenLanguage(
      summary.governance_impact.power_centralization || ""
    );
    summary.power_dynamics.who_loses_power = scrubForbiddenLanguage(
      summary.power_dynamics.who_loses_power || ""
    );
    summary.power_dynamics.informal_influence = scrubForbiddenLanguage(
      summary.power_dynamics.informal_influence || ""
    );
    summary.power_dynamics.expected_sabotage_patterns = scrubForbiddenLanguage(
      summary.power_dynamics.expected_sabotage_patterns || ""
    );
    summary.execution_risk.failure_point = scrubForbiddenLanguage(
      summary.execution_risk.failure_point || ""
    );
    summary.execution_risk.blocker = scrubForbiddenLanguage(summary.execution_risk.blocker || "");
    summary.execution_risk.hidden_understream = scrubForbiddenLanguage(
      summary.execution_risk.hidden_understream || ""
    );
    summary.signature_layer.decision_power_axis = scrubForbiddenLanguage(
      summary.signature_layer.decision_power_axis || ""
    );
    summary.signature_layer.structural_tension = scrubForbiddenLanguage(
      summary.signature_layer.structural_tension || ""
    );
    summary.signature_layer.explicit_loss = scrubForbiddenLanguage(
      summary.signature_layer.explicit_loss || ""
    );
    summary.signature_layer.power_shift = scrubForbiddenLanguage(
      summary.signature_layer.power_shift || ""
    );
    summary.signature_layer.time_pressure = scrubForbiddenLanguage(
      summary.signature_layer.time_pressure || ""
    );
    summary.signature_layer.cognitive_maturity_reflection = scrubForbiddenLanguage(
      summary.signature_layer.cognitive_maturity_reflection || ""
    );
    summary.signature_layer.historical_repetition = scrubForbiddenLanguage(
      summary.signature_layer.historical_repetition || ""
    );
    summary.intervention_plan_90d.week_1_2 = scrubForbiddenLanguage(
      summary.intervention_plan_90d.week_1_2 || ""
    );
    summary.intervention_plan_90d.week_3_6 = scrubForbiddenLanguage(
      summary.intervention_plan_90d.week_3_6 || ""
    );
    summary.intervention_plan_90d.week_7_12 = scrubForbiddenLanguage(
      summary.intervention_plan_90d.week_7_12 || ""
    );
    summary.decision_contract.choice = scrubForbiddenLanguage(summary.decision_contract.choice || "");
    summary.decision_contract.measurable_result = scrubForbiddenLanguage(
      summary.decision_contract.measurable_result || ""
    );
    summary.decision_contract.time_horizon = scrubForbiddenLanguage(
      summary.decision_contract.time_horizon || ""
    );
    summary.decision_contract.accepted_loss = scrubForbiddenLanguage(
      summary.decision_contract.accepted_loss || ""
    );
  }

  if (Array.isArray(brief.governance_risks)) {
    brief.governance_risks = brief.governance_risks.map((item) =>
      scrubForbiddenLanguage(String(item || ""))
    );
  }

  if (Array.isArray(brief.execution_risks)) {
    brief.execution_risks = brief.execution_risks.map((item) =>
      scrubForbiddenLanguage(String(item || ""))
    );
  }

  if (Array.isArray(brief.key_tradeoffs)) {
    brief.key_tradeoffs = brief.key_tradeoffs.map((item) => ({
      ...item,
      chosen_side: scrubForbiddenLanguage(item.chosen_side || ""),
      abandoned_side: scrubForbiddenLanguage(item.abandoned_side || ""),
      consequence: scrubForbiddenLanguage(item.consequence || ""),
    }));
  }

  if (Array.isArray(brief.irreversible_decisions)) {
    brief.irreversible_decisions = brief.irreversible_decisions.map((item) => ({
      ...item,
      decision: scrubForbiddenLanguage(item.decision || ""),
      why_irreversible: scrubForbiddenLanguage(item.why_irreversible || ""),
      point_of_no_return: scrubForbiddenLanguage(item.point_of_no_return || ""),
    }));
  }

  if (brief.cyntra_proposal) {
    brief.cyntra_proposal.positioning = scrubForbiddenLanguage(
      brief.cyntra_proposal.positioning || ""
    );
    brief.cyntra_proposal.interventions = brief.cyntra_proposal.interventions.map(
      (intervention) => ({
        ...intervention,
        action: scrubForbiddenLanguage(intervention.action || ""),
        owner: scrubForbiddenLanguage(intervention.owner || ""),
        deadline: scrubForbiddenLanguage(intervention.deadline || ""),
        enforcement: scrubForbiddenLanguage(intervention.enforcement || ""),
      })
    );
    brief.cyntra_proposal.mandate_required = {
      ...brief.cyntra_proposal.mandate_required,
      required_from: scrubForbiddenLanguage(
        brief.cyntra_proposal.mandate_required.required_from || ""
      ),
      consequence_if_withheld: scrubForbiddenLanguage(
        brief.cyntra_proposal.mandate_required.consequence_if_withheld || ""
      ),
    };
  }

  return brief;
}

function deepSanitizeResidualBrief<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeResidualForbiddenText(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => deepSanitizeResidualBrief(entry)) as T;
  }
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      output[key] = deepSanitizeResidualBrief(entry);
    }
    return output as T;
  }
  return value;
}

function assertNoForbiddenLanguageInBrief(brief: BoardroomBrief) {
  const payload = JSON.stringify(brief);
  if (hasForbiddenGenericLanguage(payload)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertNoForbiddenLanguageInRawPayload(payload: unknown) {
  if (hasForbiddenGenericLanguage(JSON.stringify(payload))) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertGGZSpecificDepthInBrief(
  brief: BoardroomBrief,
  enforce: boolean
) {
  return;
}

function shouldEnforceGGZDepth(analysis: AureliusAnalysisResult): boolean {
  return false;
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
          `${summary.opportunity_cost.days_30 || summary.opportunity_cost.days_0}\n${summary.opportunity_cost.days_90}\n${summary.opportunity_cost.days_365}`,
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

    const [day30, day90, day365] = sanitized.opportunityCost
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);
    summary.opportunity_cost.days_30 =
      day30 || summary.opportunity_cost.days_30 || summary.opportunity_cost.days_0;
    summary.opportunity_cost.days_0 =
      summary.opportunity_cost.days_0 || summary.opportunity_cost.days_30 || day30;
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
  const enforceGGZDepth = shouldEnforceGGZDepth(analysis);
  const mandatoryCaseContext = buildMandatoryCaseContextFromAnalysis(analysis);
  const systemPrompt = `
${HGBCO_MCKINSEY_SYSTEM_INJECT}
${EXECUTIVE_PROMPT_INJECT}
${MANDATORY_GGZ_CASE_FACTS_BLOCK}
${HARD_FALLBACK_PROMPT_RULE}
${INTELLIGENT_SECTOR_FALLBACK_RULE}
${ANTI_FILLER_RULE}

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
- Schrijf menselijk en concreet, zonder slogans of formulezinnen.
- Er zijn geen optimale oplossingen, alleen spanningsvelden met expliciet verlies.
- Benoem formele en informele machtsverschuivingen en maak actorimpact concreet.
- Tijd is actief: uitstel vergroot schade en verkleint keuzevrijheid.
- Besluit eindigt contractueel en uitvoerbaar, niet adviserend.
- Verbind bovenstroom en onderstroom waar dat inhoudelijk relevant is.
- Voeg alleen sectorspecifieke claims toe als ze aantoonbaar in de inputanalyse staan.
- ${CONCRETE_REPROMPT_DIRECTIVE}
- ${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}

Niet meerdere scenario's.
Niet meerdere waarheden.
Eén dominante these.
Eén kernconflict.
Expliciet verlies.
`;

  const userPrompt = `
${HGBCO_MCKINSEY_USER_INJECT}
${EXECUTIVE_PROMPT_INJECT}
${MANDATORY_GGZ_CASE_FACTS_BLOCK}
${HARD_FALLBACK_PROMPT_RULE}
${INTELLIGENT_SECTOR_FALLBACK_RULE}
${ANTI_FILLER_RULE}

VOLLEDIG CASUSDOSSIER (VERPLICHT LEIDEND):
${mandatoryCaseContext}

INPUT — VOLLEDIGE AURELIUS ANALYSE:
${JSON.stringify(analysis, null, 2)}

OPDRACHT:
Produceer één bestuurlijke briefing die direct als basis dient voor een besluit-afdwingend rapport.

INHOUDSEISEN:
- Eén dominante these (maximaal 10 zinnen)
- Eén niet-optimaliseerbaar kernconflict
- Minimaal twee expliciete verliezen met tijdshorizon; EUR/% alleen indien brononderbouwd
- Expliciete toets: versterkt of ondermijnt dit de besluitkracht van de top
- Opportunity cost voor 30 dagen, 90 dagen en 365 dagen met irreversibiliteit
- Opportunity cost werkt drie unieke lagen uit: 30 dagen signaalverlies, 90 dagen machtsverschuiving, 365 dagen systeemverschuiving
- Na 12 maanden expliciet: permanente positieverschuiving, dominante coalitie en wat niet zonder reputatieschade terug te draaien is
- Sectorspecifieke consequenties alleen opnemen als ze expliciet in de bron staan
- Governance impact op besluitkracht, escalatie, formele machtsverschuiving en structuurgevolgen
- ${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}
- Machtsdynamiek en onderstroom: minimaal 3 concrete machtsactoren met wat zij verliezen, winnen, hoe zij vertragen/saboteren en welk instrument zij gebruiken
- Cognitieve volwassenheidsreflectie: maak bestuurlijke oorzaken expliciet en niet persoonlijk.
- Executierisico met concreet faalpunt, blocker en onderstroom
- 90-dagen interventieplan met exact: week 1-2, week 3-6, week 7-12, inclusief owner, deliverable, KPI en escalatiepad per blok
- 90-dagen interventieplan bevat dag-30, dag-60 en dag-90 beslisgates met meetbaar resultaat
- Hard decision contract met exacte openingszin: De Raad van Bestuur committeert zich aan:
- Contract bevat keuze + KPI + tijdshorizon + geaccepteerd verlies
- Contract bevat expliciet: formeel machtsverlies, informeel machtsverlies, beslismonopolie, per-direct stop, niet-escalatie en verliesimpact
- Contract bevat expliciet actor-impact (rolgevolg; €/% alleen met brononderbouwing)
- Strategic narrative is doorlopend, menselijk en zonder copy-paste tussen secties

REGELS:
- Geen markdown
- Geen bullets buiten decision contract tekstvelden
- Geen consultant-cliche
- Als context dun is: markeer ontbrekende onderbouwing expliciet en verzin geen feiten
- Verboden woorden: default template, transformatie-template, governance-technisch, patroon, context is schaars, werk uit, aanname, contextanker, mogelijk, lijkt erop dat, zou kunnen, men zou, belangrijke succesfactor, quick win, low hanging fruit
- Geen technisch jargon
- Alleen JSON
- REJECT direct elke output met verboden generieke taal of AI-sporen

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
      "days_30": string,
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

  const parseAndValidate = (raw: string): BoardroomBrief => {
    const rawParsed = JSON.parse(raw) as BoardroomBrief;
    assertNoForbiddenLanguageInRawPayload(rawParsed);
    const parsed = deepSanitizeResidualBrief(
      enforceMcKinseyBriefFields(
        sanitizeBriefLanguage(enforceConcreteBrief(rawParsed)),
        analysis
      )
    );
    assertSignatureLayerCompliance(parsed);
    assertExecutiveHardRequirements(parsed);
    assertGGZSpecificDepthInBrief(parsed, enforceGGZDepth);
    assertNoForbiddenLanguageInBrief(parsed);
    return parsed;
  };

  const raw = await callAI("gpt-4o", [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  try {
    return parseAndValidate(raw);
  } catch {
    const retryRaw = await callAI("gpt-4o", [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `${userPrompt}\n\nREJECT: vorige output bevatte verboden generieke taal of onvoldoende bestuurlijke scherpte. Lever een volledig nieuwe versie die alle verplichte regels strikt volgt.`,
      },
    ]);
    return parseAndValidate(retryRaw);
  }
}
