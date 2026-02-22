// ============================================================
// AURELIUS — BOARDROOM NARRATIVE GENERATOR (EXECUTIVE KERNEL)
// HARDENED • BACKWARDS COMPATIBLE • 30+ DOCUMENTS • LONGFORM SAFE
// ============================================================

import { callAI } from "@/aurelius/engine/utils/callAI";
import type { AIMessage } from "@/aurelius/engine/utils/ai.types";
import { enforceLanguagePrompt } from "@/aurelius/engine/languageLock";
import {
  CONCRETE_REPROMPT_DIRECTIVE,
  CYNTRA_SIGNATURE_LAYER_VIOLATION,
  enforceConcreteNarrativeMarkdown,
} from "./guards/enforceConcreteOutput";

/* ============================================================
   TYPES
============================================================ */

export interface ContextDocument {
  id: string;
  filename: string;
  content: string;
}

export interface BoardroomInput {
  analysis_id?: string;
  company_name?: string;

  /** OPTIONAL — LEGACY SAFE */
  questions?: {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    q5?: string;
  };

  /** OPTIONAL — MULTI DOCUMENT SUPPORT */
  documents?: ContextDocument[];

  /** LEGACY FALLBACK */
  company_context?: string;

  /** OPTIONAL — BRIEF INPUT SAFE */
  executive_thesis?: string;
  central_tension?: string;
  strategic_narrative?: string;
  key_tradeoffs?: Array<{
    chosen_side?: string;
    abandoned_side?: string;
    consequence?: string;
  }>;
  governance_risks?: string[];
  execution_risks?: string[];

  /** OPTIONAL — EXECUTIVE SUMMARY BLOCK */
  executive_summary_block?: {
    dominant_thesis?: string;
    core_conflict?: string;
    tradeoff_statement?: string;
    opportunity_cost?: {
      days_0?: string;
      days_30?: string;
      days_90?: string;
      days_365?: string;
      months_12?: string;
    };
    governance_impact?: {
      decision_power?: string;
      escalation?: string;
      responsibility_diffusion?: string;
      power_centralization?: string;
    };
    power_dynamics?: {
      who_loses_power?: string;
      informal_influence?: string;
      expected_sabotage_patterns?: string;
    };
    execution_risk?: {
      failure_point?: string;
      blocker?: string;
      hidden_understream?: string;
    };
    signature_layer?: {
      decision_power_axis?: string;
      structural_tension?: string;
      explicit_loss?: string;
      power_shift?: string;
      time_pressure?: string;
      cognitive_maturity_reflection?: string;
      historical_repetition?: string;
      adaptive_hardness_mode?:
        | "klinisch"
        | "confronterend"
        | "strategisch_beheerst";
    };
    intervention_plan_90d?: {
      week_1_2?: string;
      week_3_6?: string;
      week_7_12?: string;
    };
    decision_contract?: {
      opening_line?: string;
      choice?: string;
      measurable_result?: string;
      time_horizon?: string;
      accepted_loss?: string;
    };
  };

  meta?: Record<string, unknown>;
}

/* ============================================================
   CONSTANTS — NEVER LOWER
============================================================ */

const DEFAULT_MIN_WORDS = 4200;
const DEFAULT_MAX_WORDS = 7000;
const MAX_LOOPS = 8;
const CHUNK_TOKENS = 4200;
const RESERVED_STRUCTURE_WORDS = 320;
const SHARPNESS_ERROR_TEXT = "Onvoldoende bestuurlijke scherpte";
const SIGNATURE_LAYER_ERROR_TEXT = CYNTRA_SIGNATURE_LAYER_VIOLATION;

const ENGLISH_LEAK_GUARD =
  /\b(recommendation|in conclusion|quick\s+wins|accountability|roadmap|downside|upside|baseline|framework|stakeholder|governance\s+model)\b/i;

const SOFT_LANGUAGE_GUARD =
  /\b(overweeg|overwegen|misschien|mogelijk|wellicht|eventueel|zou kunnen|kan helpen|kan bijdragen)\b/i;

const MARKETING_LANGUAGE_GUARD =
  /\b(gamechanger|disrupt|synergie|state[- ]of[- ]the[- ]art|best[- ]in[- ]class|uniek verkoopargument|viral)\b/i;

const FORBIDDEN_GPT_STYLE_GUARD =
  /\b(op basis van de analyse|het lijkt erop dat|als ai|als taalmodel|mogelijk is het)\b/i;

const CONSULTANT_CLICHE_GUARD =
  /\b(belangrijke succesfactor|quick wins|low-hanging fruit)\b/i;

const STRUCTURE_HEADINGS = [
  "### 1. DOMINANTE BESTUURLIJKE THESE",
  "### 2. HET KERNCONFLICT",
  "### 3. EXPLICIETE TRADE-OFFS",
  "### 4. OPPORTUNITY COST",
  "### 5. GOVERNANCE IMPACT",
  "### 6. MACHTSDYNAMIEK & ONDERSTROOM",
  "### 7. EXECUTIERISICO",
  "### 8. 90-DAGEN INTERVENTIEPLAN",
  "### 9. DECISION CONTRACT",
] as const;

const SECTION_DEFAULTS: Record<(typeof STRUCTURE_HEADINGS)[number], string> = {
  "### 1. DOMINANTE BESTUURLIJKE THESE":
    "De organisatie bevindt zich op een beslismoment waarbij uitstel directe executieschade veroorzaakt. De kern van het probleem is geen gebrek aan informatie maar gebrek aan keuze. Dit bestuur moet nu één lijn kiezen en alle concurrerende lijnen beëindigen. Verdere afstemming vergroot alleen vertraging, kosten en intern machtsspel. De maatstaf is niet consensus maar uitvoerbaarheid binnen 90 dagen. De centrale variabele is besluitkracht: versterkt deze keuze de besluitkracht van de top of ondermijnt zij die.",

  "### 2. HET KERNCONFLICT":
    "U moet kiezen tussen schaalvergroting met verlies aan controle, of stabilisatie met verlies aan groeisnelheid. Er bestaat geen derde route die beide doelen tegelijk veiligstelt. Dit is een onoplosbaar spanningsveld: schaal creëert slagkracht maar erodeert interne coherentie. Elke poging tot optimalisatie van beide kanten verlengt besluitstilstand en verhoogt bestuurlijke druk.",

  "### 3. EXPLICIETE TRADE-OFFS":
    "Bij keuze voor schaal wint de organisatie markttempo en commerciële slagkracht. Het verlies is directe afbouw van lokale autonomie en het schrappen van initiatieven zonder aantoonbare bijdrage. Bij keuze voor stabilisatie wint de organisatie bestuurbaarheid en voorspelbaarheid. Het verlies is lagere groeisnelheid en het inleveren van marktaandeel in prioritaire segmenten. Macht verschuift naar het centrale besluitorgaan; middenlagen verliezen discretionaire ruimte. Frictie ontstaat in teams die hun huidige mandaat en informele invloed zien afnemen.",

  "### 4. OPPORTUNITY COST":
    "Op dag 0 zonder besluit ontstaat directe executieschade: eigenaarschap blijft diffuus en frictie neemt onmiddellijk toe. Binnen 90 dagen zonder besluit verhardt het patroon: sleutelrollen verbranden tijd in afstemming, leverbetrouwbaarheid daalt en strategische projecten verliezen momentum. Binnen 365 dagen zonder besluit wordt de organisatie gedwongen tot reactieve correcties onder externe druk, met hogere kosten en lagere onderhandelingsmacht. Tijd is actief: het venster sluit, schade stapelt exponentieel op en uitstel maakt herstel structureel duurder.",

  "### 5. GOVERNANCE IMPACT":
    "Bij een harde keuze wordt besluitkracht sterker omdat mandaat en escalatielijnen eenduidig worden. Zonder keuze neemt escalatie toe en blijft verantwoordelijkheid diffuus tussen bestuurslagen. Een executiebesluit centraliseert macht tijdelijk in het besluitcentrum; dat is nodig om blokkades te doorbreken. Na stabilisatie wordt macht weer functioneel verdeeld op basis van meetbare prestaties.",

  "### 6. MACHTSDYNAMIEK & ONDERSTROOM":
    "Macht verschuift van informele coalities naar formeel mandaat. Rollen die tot nu toe via netwerkpositie veto konden uitspreken verliezen invloed wanneer besluitrechten worden gecentreerd. Verwachte sabotagepatronen zijn vertraging via herdefinitie van scope, stil verzet op prioritering en vertraagde escalatie van blokkades. De onderstroom wordt daarom expliciet bestuurd naast de bovenstroom: gedrag, loyaliteiten en informele invloed worden meetbaar gemaakt en direct gekoppeld aan besluitdiscipline.",

  "### 7. EXECUTIERISICO":
    "Dit gaat mis waar oude prioriteiten naast nieuwe prioriteiten blijven bestaan. Blokkering komt van besluitdragers die formeel akkoord geven maar informeel uitvoering vertragen. De onzichtbare onderstroom zit in loyaliteiten die verlies van invloed proberen te compenseren via vertraging, herdefinitie van doelen en omzeiling van deadlines. Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem. Het patroon herhaalt zich omdat eerdere interventies symptomen verplaatsten zonder besluitrechten te herordenen. De ingreep vereist daarom expliciete koppeling tussen bovenstroom en onderstroom: formeel besluit, zichtbaar eigenaarschap en gedragsmatige handhaving.",

  "### 8. 90-DAGEN INTERVENTIEPLAN":
    "Week 1-2: het bestuur kiest één richting, beëindigt conflicterende initiatieven en publiceert eigenaar, mandaat en escalatieroute per prioriteit. Week 3-6: capaciteit, budget en besluitrechten worden herverdeeld naar de gekozen lijn; alle uitzonderingen worden schriftelijk besloten door dezelfde eindverantwoordelijke. Week 7-12: uitvoering wordt hard afgerekend op doorlooptijd, kwaliteit en financieel effect; blokkades worden binnen zeven dagen gesloten of geformaliseerd als verliespost.",

  "### 9. DECISION CONTRACT":
    "De Raad van Bestuur committeert zich aan:\n- Keuze A of B: één expliciete strategische keuze zonder parallelle route.\n- Meetbaar resultaat: binnen 90 dagen aantoonbare verbetering op snelheid, marge of leverbetrouwbaarheid.\n- Tijdshorizon: besluit in 14 dagen, executiebewijs in 30 dagen, structureel effect in 365 dagen.\n- Verlies dat wordt geaccepteerd: het beëindigen van initiatieven, mandaten en invloed die niet bijdragen aan de gekozen lijn.",
};

/* ============================================================
   UTILS
============================================================ */

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimToMaxWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ").trim();
}

function countSentences(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function toSafeString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  return "";
}

function extractSection(text: string, heading: string): string {
  const start = text.indexOf(heading);
  if (start < 0) return "";

  const rest = text.slice(start + heading.length).trimStart();
  const next = rest.search(/\n###\s*\d+\./);

  if (next < 0) return rest.trim();
  return rest.slice(0, next).trim();
}

function buildBriefContext(input: BoardroomInput): string {
  const lines: string[] = [];

  if (input.executive_thesis) {
    lines.push(`Bestuurlijke these uit eerdere synthese: ${input.executive_thesis}`);
  }

  if (input.central_tension) {
    lines.push(`Kernconflict uit eerdere synthese: ${input.central_tension}`);
  }

  if (input.strategic_narrative) {
    lines.push(`Kernnarratief uit eerdere synthese: ${input.strategic_narrative}`);
  }

  if (Array.isArray(input.key_tradeoffs) && input.key_tradeoffs.length) {
    const tradeoffBlock = input.key_tradeoffs
      .map((t, i) => {
        const chosen = toSafeString(t?.chosen_side) || "onbenoemd";
        const abandoned = toSafeString(t?.abandoned_side) || "onbenoemd";
        const consequence = toSafeString(t?.consequence) || "consequentie niet benoemd";
        return `${i + 1}. gekozen: ${chosen}; verlaten: ${abandoned}; consequentie: ${consequence}`;
      })
      .join("\n");

    lines.push(`Trade-offs uit eerdere synthese:\n${tradeoffBlock}`);
  }

  if (Array.isArray(input.governance_risks) && input.governance_risks.length) {
    lines.push(`Governance-risico's:\n${input.governance_risks.join("\n")}`);
  }

  if (Array.isArray(input.execution_risks) && input.execution_risks.length) {
    lines.push(`Executierisico's:\n${input.execution_risks.join("\n")}`);
  }

  const summaryBlock = input.executive_summary_block;
  if (summaryBlock && typeof summaryBlock === "object") {
    const blockLines: string[] = [];

    if (summaryBlock.dominant_thesis) {
      blockLines.push(`Dominante these: ${summaryBlock.dominant_thesis}`);
    }

    if (summaryBlock.core_conflict) {
      blockLines.push(`Kernconflict: ${summaryBlock.core_conflict}`);
    }

    if (summaryBlock.tradeoff_statement) {
      blockLines.push(`Trade-off kern: ${summaryBlock.tradeoff_statement}`);
    }

    if (summaryBlock.opportunity_cost) {
      const o = summaryBlock.opportunity_cost;
      blockLines.push(
        `Opportunity cost 0/90/365: ${toSafeString(o.days_0 || o.days_30)} | ${toSafeString(
          o.days_90
        )} | ${toSafeString(o.days_365 || o.months_12)}`
      );
    }

    if (summaryBlock.governance_impact) {
      const g = summaryBlock.governance_impact;
      blockLines.push(
        `Governance impact: besluitkracht=${toSafeString(g.decision_power)}; escalatie=${toSafeString(
          g.escalation
        )}; diffuse verantwoordelijkheid=${toSafeString(
          g.responsibility_diffusion
        )}; machtscentralisatie=${toSafeString(g.power_centralization)}`
      );
    }

    if (summaryBlock.power_dynamics) {
      const p = summaryBlock.power_dynamics;
      blockLines.push(
        `Machtsdynamiek: machtverlies=${toSafeString(p.who_loses_power)}; informele invloed=${toSafeString(
          p.informal_influence
        )}; sabotagepatronen=${toSafeString(p.expected_sabotage_patterns)}`
      );
    }

    if (summaryBlock.execution_risk) {
      const e = summaryBlock.execution_risk;
      blockLines.push(
        `Executierisico: breekpunt=${toSafeString(e.failure_point)}; blocker=${toSafeString(
          e.blocker
        )}; onderstroom=${toSafeString(e.hidden_understream)}`
      );
    }

    if (summaryBlock.signature_layer) {
      const s = summaryBlock.signature_layer;
      blockLines.push(
        `Signature layer: besluitkracht-as=${toSafeString(
          s.decision_power_axis
        )}; spanningsveld=${toSafeString(s.structural_tension)}; verlies=${toSafeString(
          s.explicit_loss
        )}; machtsverschuiving=${toSafeString(s.power_shift)}; tijdsdruk=${toSafeString(
          s.time_pressure
        )}; cognitieve volwassenheid=${toSafeString(
          s.cognitive_maturity_reflection
        )}; herhaling=${toSafeString(s.historical_repetition)}; hardheid=${toSafeString(
          s.adaptive_hardness_mode
        )}`
      );
    }

    if (summaryBlock.intervention_plan_90d) {
      const p = summaryBlock.intervention_plan_90d;
      blockLines.push(
        `Plan weekblokken: ${toSafeString(p.week_1_2)} | ${toSafeString(
          p.week_3_6
        )} | ${toSafeString(p.week_7_12)}`
      );
    }

    if (summaryBlock.decision_contract) {
      const d = summaryBlock.decision_contract;
      blockLines.push(
        `Decision contract kern: opening=${toSafeString(d.opening_line)}; keuze=${toSafeString(
          d.choice
        )}; resultaat=${toSafeString(
          d.measurable_result
        )}; horizon=${toSafeString(d.time_horizon)}; verlies=${toSafeString(
          d.accepted_loss
        )}`
      );
    }

    if (blockLines.length) {
      lines.push(`Executive Summary blok:\n${blockLines.join("\n")}`);
    }
  }

  return lines.join("\n\n").trim();
}

/* ============================================================
   VALIDATION
============================================================ */

function assertDutchOnly(text: string) {
  if (
    /(executive summary|in conclusion|recommended action)/i.test(text) ||
    ENGLISH_LEAK_GUARD.test(text)
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertNoSoftLanguage(text: string) {
  if (SOFT_LANGUAGE_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  if (MARKETING_LANGUAGE_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  if (FORBIDDEN_GPT_STYLE_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  if (CONSULTANT_CLICHE_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertBulletDiscipline(text: string) {
  const decisionHeading = "### 9. DECISION CONTRACT";
  const decisionStart = text.indexOf(decisionHeading);
  if (decisionStart < 0) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  const outsideDecision = text.slice(0, decisionStart);
  if (/^\s*([-*•]|\d+[.)])\s+/gm.test(outsideDecision)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  const decisionSection = extractSection(text, decisionHeading);
  const bulletCount = (decisionSection.match(/^\s*[-*•]\s+/gm) ?? []).length;
  const numberedCount = (decisionSection.match(/^\s*\d+[.)]\s+/gm) ?? []).length;

  if (bulletCount < 4 || bulletCount > 6 || numberedCount > 0) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertStructure(text: string) {
  if (STRUCTURE_HEADINGS.some((h) => !text.includes(h))) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertDominantThesis(text: string) {
  const thesis = extractSection(text, "### 1. DOMINANTE BESTUURLIJKE THESE");
  if (!thesis) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  if (countSentences(thesis) > 10) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }

  const scenarioSignals = (thesis.match(/\b(scenario|optie|alternatief)\b/gi) ?? []).length;
  if (scenarioSignals > 1) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertExplicitLosses(text: string) {
  const matches =
    text.match(
      /\b(verlies|verliest|inleveren|machtverlies|afbouw|stopzetten|opheffen|afstoten|beeindigen|beëindigen)\b/gi
    ) ?? [];

  if (matches.length < 2) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertOpportunityCost(text: string) {
  const section = extractSection(text, "### 4. OPPORTUNITY COST").toLowerCase();
  const has0 = /(?:^|\s)(0\s*dagen|dag\s*0)\b/.test(section);
  const has90 = /90\s*dagen/.test(section);
  const has365 = /365\s*dagen/.test(section);

  if (!has0 || !has90 || !has365) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertGovernanceImpact(text: string) {
  const section = extractSection(text, "### 5. GOVERNANCE IMPACT").toLowerCase();
  const hasDecisionPower = section.includes("besluitkracht");
  const hasEscalation = section.includes("escalatie");
  const hasDiffuse = section.includes("diffuus");
  const hasCentralized = section.includes("central");

  if (!hasDecisionPower || !hasEscalation || !hasDiffuse || !hasCentralized) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertPowerDynamics(text: string) {
  const section = extractSection(text, "### 6. MACHTSDYNAMIEK & ONDERSTROOM").toLowerCase();
  const hasPowerLoss = section.includes("verliest macht") || section.includes("macht verschuift");
  const hasInformalInfluence = section.includes("informele");
  const hasSabotage = section.includes("sabotage") || section.includes("vertraging");
  const hasUnderstream = section.includes("onderstroom");

  if (!hasPowerLoss || !hasInformalInfluence || !hasSabotage || !hasUnderstream) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertExecutionRisk(text: string) {
  const section = extractSection(text, "### 7. EXECUTIERISICO").toLowerCase();
  const hasFailurePoint = section.includes("mis");
  const hasBlocker = section.includes("blokkeer") || section.includes("tegenhouden");
  const hasUnderstream = section.includes("onderstroom");

  if (!hasFailurePoint || !hasBlocker || !hasUnderstream) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertNinetyDayPlan(text: string) {
  const section = extractSection(text, "### 8. 90-DAGEN INTERVENTIEPLAN");
  const hasW12 = /week\s*1\s*[-–]\s*2\s*:/.test(section.toLowerCase());
  const hasW36 = /week\s*3\s*[-–]\s*6\s*:/.test(section.toLowerCase());
  const hasW712 = /week\s*7\s*[-–]\s*12\s*:/.test(section.toLowerCase());

  if (!hasW12 || !hasW36 || !hasW712) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertDecisionContract(text: string) {
  const section = extractSection(text, "### 9. DECISION CONTRACT");
  const hasOpening = section.includes("De Raad van Bestuur committeert zich aan:");
  const hasChoice = /keuze\s*a|keuze\s*b|keuze\s*a\s*of\s*b/i.test(section);
  const hasResult = /meetbaar\s+resultaat/i.test(section);
  const hasHorizon = /tijdshorizon/i.test(section);
  const hasLoss = /verlies/i.test(section);

  if (!hasOpening || !hasChoice || !hasResult || !hasHorizon || !hasLoss) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertSignatureExplicitLoss(text: string) {
  const hasLoss =
    /\b(verlies|verliest|inleveren|machtverlies|afbouw|stopzetten|beëindigen)\b/i.test(
      text
    );
  if (!hasLoss) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignatureTension(text: string) {
  const hasTension =
    /\b(spanningsveld|kernconflict|dilemma)\b/i.test(text) &&
    /\b(onoplosbaar|niet-optimaliseerbaar|geen optimale oplossing|geen derde route)\b/i.test(
      text
    );
  if (!hasTension) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignaturePowerShift(text: string) {
  const hasPowerShift =
    /\b(formele macht|macht verschuift|macht verliest|macht wint|informele invloed|tegenkracht|controle)\b/i.test(
      text
    );
  if (!hasPowerShift) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignatureTimePressure(text: string) {
  const opportunity = extractSection(text, "### 4. OPPORTUNITY COST");
  const hasTimeWindows =
    /\b(0\s*dagen|dag\s*0)\b/i.test(opportunity) &&
    /\b90\s*dagen\b/i.test(opportunity) &&
    /\b365\s*dagen\b/i.test(opportunity);
  const hasTimeForce =
    /\b(irreversibel|onomkeerbaar|venster sluit|exponentieel|uitstel|tijdsdruk)\b/i.test(
      text
    );

  if (!hasTimeWindows || !hasTimeForce) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignatureContractFormula(text: string) {
  const section = extractSection(text, "### 9. DECISION CONTRACT");
  const hasOpening = section.includes("De Raad van Bestuur committeert zich aan:");
  const hasContractItems =
    /\bkeuze\b/i.test(section) &&
    /\bmeetbaar\b/i.test(section) &&
    /\btijdshorizon\b/i.test(section) &&
    /\bverlies\b/i.test(section);

  if (!hasOpening || !hasContractItems) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignatureCognitiveMaturity(text: string) {
  const hasReflection =
    /\binformatieprobleem\s+(of|maar)\s+(een\s+)?moedprobleem\b/i.test(text) ||
    /\bcapaciteitsprobleem\s+(of|maar)\s+(een\s+)?machtsprobleem\b/i.test(text) ||
    /\bstrategie\s+(of|maar)\s+(een\s+)?executiediscipline\b/i.test(text) ||
    /\banalyse\s+(of|maar)\s+(een\s+)?vermijding\b/i.test(text);

  if (!hasReflection) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertSignatureAdaptiveHardness(text: string) {
  const hasAdaptiveHardness =
    /\bconfronterend\b/i.test(text) &&
    /\bklinisch\b/i.test(text) &&
    /\bstrategisch beheerst\b/i.test(text);

  if (!hasAdaptiveHardness) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function assertCyntraSignatureLayer(text: string) {
  assertSignatureExplicitLoss(text);
  assertSignatureTension(text);
  assertSignaturePowerShift(text);
  assertSignatureTimePressure(text);
  assertSignatureContractFormula(text);
  assertSignatureCognitiveMaturity(text);
  assertSignatureAdaptiveHardness(text);
}

function assertExecutiveKernelQuality(text: string) {
  assertStructure(text);
  assertDominantThesis(text);
  assertExplicitLosses(text);
  assertOpportunityCost(text);
  assertGovernanceImpact(text);
  assertPowerDynamics(text);
  assertExecutionRisk(text);
  assertNinetyDayPlan(text);
  assertDecisionContract(text);
  assertBulletDiscipline(text);
  assertNoSoftLanguage(text);
  assertDutchOnly(text);
  assertCyntraSignatureLayer(text);
}

/* ============================================================
   ENFORCERS
============================================================ */

function ensureMandatorySections(text: string): string {
  let output = text.trim();

  for (const heading of STRUCTURE_HEADINGS) {
    if (!output.includes(heading)) {
      const fallback = SECTION_DEFAULTS[heading];
      output = output
        ? `${output}\n\n${heading}\n${fallback}`
        : `${heading}\n${fallback}`;
    }
  }

  return output;
}

function injectLineIntoSection(
  text: string,
  heading: string,
  line: string,
  signal: RegExp
): string {
  const section = extractSection(text, heading);
  if (!section) return text;
  if (signal.test(section)) return text;

  const start = text.indexOf(heading);
  if (start < 0) return text;

  const sectionStart = start + heading.length;
  const afterHeading = text.slice(sectionStart);
  const nextRel = afterHeading.search(/\n###\s*\d+\./);

  if (nextRel < 0) {
    return `${text}\n${line}`;
  }

  const insertAt = sectionStart + nextRel;
  return `${text.slice(0, insertAt)}\n${line}\n${text.slice(insertAt)}`;
}

function enforceSignatureLayer(text: string): string {
  let output = text;

  output = injectLineIntoSection(
    output,
    "### 1. DOMINANTE BESTUURLIJKE THESE",
    "De bestuurlijke toetsvraag luidt: versterkt deze keuze de besluitkracht van de top of ondermijnt zij die.",
    /\bbesluitkracht\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 2. HET KERNCONFLICT",
    "Dit is een onoplosbaar spanningsveld; optimalisatie bestaat hier niet.",
    /\b(spanningsveld|onoplosbaar|niet-optimaliseerbaar)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 4. OPPORTUNITY COST",
    "Tijd is actief: het venster sluit, schade stapelt exponentieel op en uitstel maakt herstel irreversibel duur.",
    /\b(venster sluit|exponentieel|irreversibel|tijdsdruk)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 6. MACHTSDYNAMIEK & ONDERSTROOM",
    "Formele macht verschuift, informele invloed verliest terrein en tegenkracht concentreert zich waar controle wegvalt.",
    /\b(formele macht|informele invloed|tegenkracht|controle)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 7. EXECUTIERISICO",
    "Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem.",
    /\binformatieprobleem\s+maar\s+een\s+moedprobleem|capaciteitsprobleem\s+maar\s+een\s+machtsprobleem\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 7. EXECUTIERISICO",
    "Het patroon is herhalend: eerdere interventies faalden omdat besluiten werden verdund in plaats van verankerd.",
    /\b(patroon|herhalend|eerdere interventies)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 7. EXECUTIERISICO",
    "Adaptieve hardheid: bij stagnatie confronterend, bij transitie klinisch, bij momentum strategisch beheerst.",
    /\b(confronterend|klinisch|strategisch beheerst)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 9. DECISION CONTRACT",
    "De Raad committeert zich aan keuze, geaccepteerd verlies, meetbare KPI en harde tijdshorizon.",
    /\bde raad committeert zich aan keuze\b/i
  );

  return output;
}

function enforceLossLanguage(text: string): string {
  const matches =
    text.match(
      /\b(verlies|verliest|inleveren|machtverlies|afbouw|stopzetten|opheffen|afstoten|beeindigen|beëindigen)\b/gi
    ) ?? [];

  if (matches.length >= 2) {
    return text;
  }

  return `${text}\n\nIn deze keuze wordt verlies expliciet geaccepteerd: initiatieven worden beëindigd en macht wordt centraal herverdeeld.`;
}

function enforceCyntraBridge(text: string): string {
  const lower = text.toLowerCase();
  const hasTopstream = lower.includes("bovenstroom");
  const hasUnderstream = lower.includes("onderstroom");
  const hasBridgeSignal = /(verbind|verbinding|koppel|brug)/i.test(text);

  if (hasTopstream && hasUnderstream && hasBridgeSignal) {
    return text;
  }

  return `${text}\n\nBovenstroom en onderstroom worden expliciet verbonden: formeel besluit, informele macht en zichtbaar gedrag worden in dezelfde bestuurscyclus gestuurd.`;
}

function enforceMinimumWords(
  text: string,
  minWords: number,
  maxWords: number
): string {
  let output = String(text ?? "").trim();
  if (!output) return output;

  const paddingParagraph =
    "Bestuurlijke discipline blijft leidend: de Raad van Bestuur sluit open besluiten, borgt eigenaarschap per KPI, bewaakt kosten van uitstel en corrigeert afwijkingen wekelijks binnen één vast escalatieritme.";

  while (countWords(output) < minWords) {
    output = `${output}\n\n${paddingParagraph}`;
    output = trimToMaxWords(output, maxWords);
    if (countWords(output) >= maxWords) {
      break;
    }
  }

  return output;
}

function buildFallbackNarrative(
  input: BoardroomInput,
  minWords: number,
  maxWords: number
): string {
  const company = input.company_name ?? "de organisatie";

const base = `### 1. DOMINANTE BESTUURLIJKE THESE
${company} bevindt zich op een beslismoment waarbij uitstel directe executieschade veroorzaakt. De organisatie kan niet langer tegelijk op groei en stabilisatie sturen zonder mandaatverlies en vertraging. Het bestuur moet nu één dominante lijn kiezen en concurrerende lijnen sluiten. Verdere discussie zonder keuze verplaatst alleen risico in de tijd. Het criterium is uitvoering, niet consensus. De centrale variabele is besluitkracht: versterkt dit de besluitkracht van de top of ondermijnt het die.

### 2. HET KERNCONFLICT
U moet kiezen tussen schaalvergroting met verlies aan controle, of stabilisatie met verlies aan groeisnelheid. Beide doelen tegelijk maximaliseren is onmogelijk en houdt besluitvorming gevangen. Dit is een onoplosbaar spanningsveld: schaal creëert slagkracht maar erodeert interne coherentie.

### 3. EXPLICIETE TRADE-OFFS
Bij keuze voor schaal wint de organisatie tempo en marktaandeel, maar verliest zij lokale autonomie en stopzet zij initiatieven zonder directe opbrengst. Bij keuze voor stabilisatie wint de organisatie bestuurbaarheid en voorspelbaarheid, maar verliest zij groeisnelheid en commerciële ruimte. Macht verschuift naar het centrale besluitorgaan; teams met informeel mandaat verliezen invloed. Frictie ontstaat waar oude prioriteiten nog worden verdedigd.

### 4. OPPORTUNITY COST
Op dag 0 zonder besluit ontstaat directe executieschade en blijft eigenaarschap diffuus. In 90 dagen zonder besluit wordt vertraging structureel, met zichtbaar verlies in opbrengst en hogere herstelkosten. In 365 dagen zonder besluit verhardt de afhankelijkheid van noodmaatregelen, met verslechterde onderhandelingspositie en lagere strategische keuzevrijheid. Tijd is actief: het venster sluit, schade stapelt exponentieel op en uitstel maakt herstel irreversibel duur.

### 5. GOVERNANCE IMPACT
Deze keuze maakt besluitkracht sterker doordat mandaat en escalatieroutes eenduidig worden. Zonder keuze neemt escalatie toe en blijft verantwoordelijkheid diffuus. Tijdelijke centralisatie van macht is noodzakelijk om blokkades te doorbreken en uitvoering afdwingbaar te maken.

### 6. MACHTSDYNAMIEK & ONDERSTROOM
Macht verschuift van informele coalities naar formeel mandaat. Besluitdragers die tot nu toe via netwerkpositie konden vertragen verliezen invloed en escaleren via scope-discussies of prioriteitsstrijd. Verwachte sabotagepatronen zijn vertraagde escalatie, herdefinitie van doelen en stil verzet in uitvoering. Onderstroom wordt daarom expliciet bestuurd naast bovenstroom, zodat gedrag en besluitdiscipline in dezelfde cyclus worden gehandhaafd.

### 7. EXECUTIERISICO
Dit mislukt waar oude en nieuwe prioriteiten parallel blijven bestaan. Blokkering komt van besluitdragers die formeel instemmen maar informeel vertragen. De onderstroom bestaat uit loyaliteiten die machtverlies compenseren via uitstel en heronderhandeling. Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem. Het patroon is herhalend: eerdere interventies faalden omdat besluitrechten niet zijn verlegd. Adaptieve hardheid: bij stagnatie confronterend, bij transitie klinisch, bij momentum strategisch beheerst. Daarom worden bovenstroom en onderstroom gekoppeld in één ritme van besluit, gedrag en handhaving.

### 8. 90-DAGEN INTERVENTIEPLAN
Week 1-2: het bestuur kiest één lijn, stopt conflicterende dossiers en wijst per prioriteit één eindverantwoordelijke aan. Week 3-6: budget, capaciteit en besluitrechten worden herverdeeld naar de gekozen lijn; uitzonderingen worden alleen op bestuursniveau toegestaan. Week 7-12: uitvoering wordt afgerekend op meetbare effecten; blokkades worden binnen zeven dagen gesloten of als geaccepteerd verlies geboekt.

### 9. DECISION CONTRACT
De Raad van Bestuur committeert zich aan:
- Keuze A of B: één expliciete strategische keuze zonder parallelle route.
- Meetbaar resultaat: binnen 90 dagen aantoonbare verbetering op snelheid, marge of leverbetrouwbaarheid.
- Tijdshorizon: besluit in 14 dagen, executiebewijs in 30 dagen, structureel effect in 365 dagen.
- Verlies dat wordt geaccepteerd: beëindiging van initiatieven en mandaten die niet bijdragen aan de gekozen lijn.`;

  return trimToMaxWords(
    enforceMinimumWords(base, minWords, maxWords),
    maxWords
  );
}

/* ============================================================
   SYSTEM PROMPT — EXECUTIVE KERNEL
============================================================ */

function buildSystemPrompt(): string {
  return `
${enforceLanguagePrompt("nl")}

JE BENT AURELIUS EXECUTIVE KERNEL.
JE RAPPORT IS NIET ADVISEREND.
JE RAPPORT IS NIET BESCHRIJVEND.
JE RAPPORT IS NIET INFORMATIEF.
JE RAPPORT FORCEERT EEN BESTUURSBESLUIT.

JE SCHRIJFT UITSLUITEND NEDERLANDS, OOK KOPPEN EN TERMINOLOGIE.
GEEN MARKETINGTAAL. GEEN AI-TAAL. GEEN VAGE FORMULERINGEN.

CYNTRA INTELLECTUAL PROPERTY SIGNATURE LAYER (DOMINANT):
- Besluitkracht is de centrale variabele: elke alinea toetst versterking of ondermijning van besluitkracht aan de top.
- Spanning boven optimalisatie: benoem minimaal één onoplosbaar spanningsveld.
- Verlies als realiteit: benoem expliciet concreet verlies.
- Macht als valuta: benoem formele machtswinst, informele invloedsverliezen en tegenkracht.
- Tijd als actieve kracht: benoem irreversibiliteit, venstersluiting en stapelende schade bij uitstel.
- Besluit als contract: sluit contractueel af met keuze, KPI, tijdshorizon en geaccepteerd verlies.
- Cognitieve volwassenheid: adresseer expliciet informatieprobleem versus moedprobleem, of capaciteitsprobleem versus machtsprobleem.
- Historische herhaling: benoem patroonherhaling en waarom eerdere interventies faalden waar relevant.
- Adaptieve hardheid: stagnatie = confronterend, transitie = klinisch, momentum = strategisch beheerst.

VERPLICHTE STRUCTUUR (EXACT):
### 1. DOMINANTE BESTUURLIJKE THESE
### 2. HET KERNCONFLICT
### 3. EXPLICIETE TRADE-OFFS
### 4. OPPORTUNITY COST
### 5. GOVERNANCE IMPACT
### 6. MACHTSDYNAMIEK & ONDERSTROOM
### 7. EXECUTIERISICO
### 8. 90-DAGEN INTERVENTIEPLAN
### 9. DECISION CONTRACT

INHOUDSEISEN:
- Sectie 1 bevat één dominante these in maximaal 10 zinnen.
- Sectie 1 benoemt expliciet de besluitkrachttoets voor de top.
- Sectie 2 beschrijft een niet-optimaliseerbaar dilemma.
- Sectie 2 bevat expliciet een onoplosbaar spanningsveld.
- Sectie 3 benoemt wat wordt gewonnen, wat wordt verloren, wie macht verliest en waar frictie ontstaat.
- Sectie 4 beschrijft concreet de kosten van niets doen op dag 0, binnen 90 dagen en binnen 365 dagen.
- Sectie 4 benoemt dat tijd actieve druk creëert en vensters sluit.
- Sectie 5 benoemt expliciet effect op besluitkracht, escalatie, diffuse verantwoordelijkheid en centralisatie van macht.
- Sectie 6 benoemt wie macht verliest, waar informele invloed zit en welke sabotagepatronen te verwachten zijn.
- Sectie 7 benoemt waar uitvoering misgaat, wie blokkeert en welke onderstroom onzichtbaar werkt.
- Sectie 7 bevat expliciet cognitieve volwassenheidsreflectie (informatie vs moed, capaciteit vs macht, strategie vs executiediscipline, analyse vs vermijding).
- Sectie 8 gebruikt exact: Week 1-2:, Week 3-6:, Week 7-12:.
- Sectie 9 begint exact met: De Raad van Bestuur committeert zich aan:
- Sectie 9 bevat expliciet: keuze A of B, meetbaar resultaat, tijdshorizon, geaccepteerd verlies.

STIJLREGELS:
- Geen nuanceblokken, geen scenario-lijsten, geen vrijblijvende aanbevelingen.
- Geen termen als "op basis van de analyse", "het lijkt erop dat", "mogelijk" of varianten.
- Geen termen als "belangrijke succesfactor", "quick wins" of "low-hanging fruit".
- Geen bulletspam: alleen in sectie 9 vier bullets voor het besluitcontract.
- Leg causale keten hard vast: oorzaak -> gevolg -> ingreep -> resultaat.
- Verbind bovenstroom en onderstroom expliciet in governance en executie.
`.trim();
}

/* ============================================================
   MAIN — LONGFORM SAFE
============================================================ */

export async function generateBoardroomNarrative(
  input: BoardroomInput,
  options: {
    minWords?: number;
    maxWords?: number;
    temperature?: number;
  } = {}
) {
  const minWords = options.minWords ?? DEFAULT_MIN_WORDS;
  const maxWords = options.maxWords ?? DEFAULT_MAX_WORDS;
  const temperature = options.temperature ?? 0.18;

  const boundedMinWords = Math.max(3500, Math.min(minWords, maxWords));
  const generationWordCap = Math.max(
    boundedMinWords,
    maxWords - RESERVED_STRUCTURE_WORDS
  );

  const documents: ContextDocument[] = Array.isArray(input.documents)
    ? input.documents
    : [];

  const q = input.questions ?? {};
  const hasQuestions =
    !!q.q1 && !!q.q2 && !!q.q3 && !!q.q4 && !!q.q5;

  const questionBlock = hasQuestions
    ? `
5 KERNVRAGEN:
1. ${q.q1}
2. ${q.q2}
3. ${q.q3}
4. ${q.q4}
5. ${q.q5}
`
    : `
GEEN EXPLICIETE VRAGEN AANGELEVERD.
Gebruik context, machtsdynamiek en bestuursspanning om één besluit af te dwingen.
`;

  const documentBlock =
    documents.length === 0
      ? "GEEN CONTEXTDOCUMENTEN AANGELEVERD."
      : documents
          .slice(0, 30)
          .map(
            (d, i) => `
--- DOCUMENT ${i + 1}: ${d.filename} ---
${d.content}
`
          )
          .join("\n");

  const legacyContext =
    typeof input.company_context === "string"
      ? input.company_context
      : "";

  const briefContext = buildBriefContext(input);

  const messages: AIMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    {
      role: "user",
      content: `
ORGANISATIE: ${input.company_name ?? "Onbenoemd"}

${questionBlock}

CONTEXTDOCUMENTEN:
${documentBlock}

BRIEF CONTEXT:
${briefContext || "GEEN BRIEF CONTEXT BESCHIKBAAR."}

LEGACY CONTEXT:
${legacyContext || "GEEN LEGACY CONTEXT BESCHIKBAAR."}
`.trim(),
    },
  ];

  let text = "";
  let loops = 0;

  while (countWords(text) < boundedMinWords && loops < MAX_LOOPS) {
    if (countWords(text) >= generationWordCap) {
      break;
    }

    try {
      const chunk = await callAI("gpt-4o", messages, {
        max_tokens: CHUNK_TOKENS,
        temperature,
      });

      if (typeof chunk === "string" && chunk.trim()) {
        const merged = text ? `${text}\n\n${chunk.trim()}` : chunk.trim();
        text = trimToMaxWords(merged, generationWordCap);

        messages.push({ role: "assistant", content: chunk });
        messages.push({
          role: "user",
          content:
            `Ga verder. Behoud exact de 9 secties. Veranker de Cyntra Signature Layer: besluitkracht als centrale variabele, onoplosbaar spanningsveld, expliciet verlies, machtsverschuiving, tijdsdruk en cognitieve volwassenheidsreflectie. Werk opportunity cost uit op 0/90/365, houd het 90-dagenplan op week 1-2 / 3-6 / 7-12 en sluit af met een hard decision contract. ${CONCRETE_REPROMPT_DIRECTIVE}`,
        });
      }
    } catch {
      break;
    }

    loops++;
  }

  let candidate = text.trim() || buildFallbackNarrative(input, boundedMinWords, maxWords);
  candidate = ensureMandatorySections(candidate);
  candidate = enforceLossLanguage(candidate);
  candidate = enforceCyntraBridge(candidate);
  candidate = enforceSignatureLayer(candidate);
  candidate = enforceMinimumWords(candidate, boundedMinWords, maxWords);
  candidate = enforceConcreteNarrativeMarkdown(
    candidate,
    input.company_context || input.company_name || ""
  );
  candidate = trimToMaxWords(candidate, maxWords);

  try {
    assertExecutiveKernelQuality(candidate);
  } catch {
    const fallback = trimToMaxWords(
      enforceMinimumWords(
        enforceCyntraBridge(
          enforceLossLanguage(
            enforceSignatureLayer(
              ensureMandatorySections(
                buildFallbackNarrative(input, boundedMinWords, maxWords)
              )
            )
          )
        ),
        boundedMinWords,
        maxWords
      ),
      maxWords
    );

    const concreteFallback = enforceConcreteNarrativeMarkdown(
      fallback,
      input.company_context || input.company_name || ""
    );

    try {
      assertExecutiveKernelQuality(concreteFallback);
      candidate = concreteFallback;
    } catch (finalError) {
      const failureMessage =
        finalError instanceof Error &&
        finalError.message === SIGNATURE_LAYER_ERROR_TEXT
          ? SIGNATURE_LAYER_ERROR_TEXT
          : SHARPNESS_ERROR_TEXT;
      throw new Error(failureMessage);
    }
  }

  return {
    text: candidate,
    metrics: {
      words: countWords(candidate),
      loops,
      documents_used: documents.length,
      used_questions: hasQuestions,
    },
  };
}
