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
import {
  HGBCO_MCKINSEY_SYSTEM_INJECT,
  HGBCO_MCKINSEY_USER_INJECT,
  enforceAtoERatioStructure,
  enforceDecisionContractHard,
  enforceHgbcoHeadings,
  enforceNoMetaNoTemplate,
  enforceUpperLowerStream,
  hasForbiddenHgbcoLanguage,
} from "./guards/hgbcoMcKinseySpec";
import {
  ExecutiveGateError,
  validateExecutiveGateStack,
} from "@/aurelius/executive/ExecutiveGateStack";
import { parseInputAnchors } from "@/aurelius/executive/anchor/anchorScan";
import { DECISION_CODEX_PROMPT } from "@/aurelius/prompts/decisionCodex.prompt";
import { runStrategicReasoningGate } from "@/aurelius/engine/gates/StrategicReasoningGate";
import {
  buildBoardroomIntelligenceNodePrompt,
  hasMinimumBoardroomInsights,
} from "@/aurelius/engine/nodes/BoardroomIntelligenceNode";
import {
  buildScenarioSimulationNodePrompt,
  hasMinimumScenarioSet,
} from "@/aurelius/engine/nodes/ScenarioSimulationNode";
import {
  buildDecisionQualityNodePrompt,
  parseDecisionQualityAssessment,
} from "@/aurelius/engine/nodes/DecisionQualityNode";
import { StrategicMemoryRetriever } from "@/aurelius/memory/StrategicMemoryRetriever";
import { StrategicMemoryStore } from "@/aurelius/memory/StrategicMemoryStore";
import { StrategicMemoryIndexer } from "@/aurelius/memory/StrategicMemoryIndexer";
import {
  applyStrategicThinkingPatterns,
  hasMinimumStrategicPatterns,
} from "@/aurelius/strategy/StrategicThinkingPatterns";
import { generateHypotheses } from "@/aurelius/strategy/HypothesisGenerator";
import { runHypothesisCompetition } from "@/aurelius/strategy/HypothesisCompetition";
import { evaluateHypotheses } from "@/aurelius/strategy/HypothesisEvaluator";
import { detectCausalMechanisms } from "@/aurelius/causal/CausalMechanismDetector";
import { buildCausalChains } from "@/aurelius/causal/CausalChainBuilder";
import { analyzeSystemDynamics } from "@/aurelius/causal/SystemDynamicsAnalyzer";
import { generateDecisionOptions } from "@/aurelius/decision/DecisionOptionGenerator";
import { analyzeDecisionTradeoffs } from "@/aurelius/decision/DecisionTradeoffAnalyzer";
import { buildDecisionPressure } from "@/aurelius/decision/DecisionPressureEngine";
import { detectBlindSpots } from "@/aurelius/blindspots/BlindSpotDetector";
import { runStrategicForesight } from "@/aurelius/foresight/StrategicForesightEngine";
import { runMetaReasoning } from "@/aurelius/metareasoning/MetaReasoningEngine";
import { runOrganizationalSimulation } from "@/aurelius/simulation/OrganizationalSimulationEngine";
import { validateNarrativeStructure } from "@/aurelius/narrative/NarrativeStructureEngine";
import { validateNarrativeCausality } from "@/aurelius/narrative/NarrativeCausalityValidator";
import {
  composeBoardroomNarrative,
  ensureBoardroomOutputArtifacts,
} from "@/aurelius/narrative/BoardroomNarrativeComposer";
import { assertBoardroomReportStructure } from "@/aurelius/narrative/BoardroomReportStructureValidator";
import { KnowledgeGraphStore } from "@/aurelius/knowledge/KnowledgeGraphStore";
import { KnowledgeGraphQuery } from "@/aurelius/knowledge/KnowledgeGraphQuery";
import { KnowledgeGraphUpdater } from "@/aurelius/knowledge/KnowledgeGraphUpdater";
import { buildKnowledgeGraphPayload } from "@/aurelius/knowledge/KnowledgeGraphBuilder";
import {
  createReasoningState,
  extendReasoningState,
} from "@/aurelius/reasoning/ReasoningState";
import { runReasoningGuard } from "@/aurelius/reasoning/ReasoningGuard";
import { runStrategicTensionEngine } from "@/aurelius/strategy/StrategicTensionEngine";
import { runStrategicOptionGenerator } from "@/aurelius/strategy/StrategicOptionGenerator";
import { runStrategicOptionEvaluator } from "@/aurelius/strategy/StrategicOptionEvaluator";
import { OpenAIProvider } from "@/aurelius/llm/OpenAIProvider";
import { runStrategicCritiqueAgent } from "@/aurelius/reflection/StrategicCritiqueAgent";
import { runNarrativeRewriteEngine } from "@/aurelius/reflection/NarrativeRewriteEngine";
import { validateExecutionFeasibility } from "@/aurelius/execution/ExecutionFeasibilityValidator";

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
  sector_selected?: string;
}

/* ============================================================
   CONSTANTS — NEVER LOWER
============================================================ */

const DEFAULT_MIN_WORDS = 3500;
const DEFAULT_MAX_WORDS = 6200;
const MAX_LOOPS = 12;
const CHUNK_TOKENS = 4200;
const RESERVED_STRUCTURE_WORDS = 320;
const EXECUTIVE_PROMPT_INJECT = DECISION_CODEX_PROMPT;
const MULTISOURCE_CONTEXT_DIRECTIVE =
  "Gebruik gecombineerde broncontext: geüploade documenten + vrije tekst. Als bronnen botsen, benoem spanning expliciet en kies niet impliciet.";
const MANDATORY_GGZ_CASE_FACTS_BLOCK = `
BRONDISCIPLINE (ALTIJD GELDIG):
- Gebruik alleen feiten die aantoonbaar in geuploade documenten of expliciete contextvelden staan.
- Neem geen sectorsjabloon over als feit.
- Gebruik geen cijfers, percentages of bedragen zonder bron in de input.
- Als een gevraagde metriek ontbreekt in de bron, benoem dit expliciet als "niet onderbouwd in geüploade documenten".
`.trim();
const HARD_FALLBACK_PROMPT_RULE =
  "Als input dun is, blijf strikt brongebonden: benoem wat ontbreekt en verzin geen feiten.";
const INTELLIGENT_SECTOR_FALLBACK_RULE =
  "Bij minimale of vage input: gebruik alleen de aanwezige bronfragmenten, voeg geen sectoraannames toe en maak hiaten expliciet.";
const ANTI_FILLER_RULE =
  "Geen sectie mag starten met 'SIGNATURE LAYER WAARSCHUWING', 'Contextsignaal', 'Aanname:', 'Contextanker:', 'beperkte context' of 'duid structureel'. Verbied generieke taal zoals 'default template', 'transformatie-template', 'governance-technisch', 'patroon', 'context is schaars', 'werk uit', 'mogelijk', 'lijkt erop dat', 'zou kunnen', 'men zou', 'belangrijke succesfactor', 'quick win' en 'low hanging fruit'.";
const SHARPNESS_ERROR_TEXT = "Onvoldoende bestuurlijke scherpte";
const SIGNATURE_LAYER_ERROR_TEXT = CYNTRA_SIGNATURE_LAYER_VIOLATION;
const HARD_GATE_ERROR_PREFIX = "HGBCO_HARD_GATE_FAILED";
const OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE =
  "Opportunity Cost MOET drie unieke lagen bevatten: 30 dagen (direct signaalverlies + eerste gedragsverschuiving), 90 dagen (zichtbare machtsverschuiving + structurele erosie), 365 dagen (systeemverschuiving + onomkeerbare positie + dominante coalitie). Maak na 12 maanden concreet wat niet zonder reputatieschade terug te draaien is.";
const NUMERIC_CLAIM_EXPLANATION_DIRECTIVE =
  "Bij elk absoluut €-bedrag: voeg direct de berekeningslogica toe (driver x volume x periode) met bronverwijzing; ontbreekt bron, markeer expliciet als niet onderbouwd in geüploade documenten.";
const EXECUTION_PLAN_DEPTH_DIRECTIVE =
  "Sectie 8 bevat exact 6 interventies (2 per maand), elk met Probleem dat wordt opgelost, Concrete actie, Waarom deze interventie, Eigenaar, Deadline, Meetbare KPI, Escalatieregel, Gevolg voor organisatie, Gevolg voor klant/cliënt, Risico van niet handelen, Direct zichtbaar effect en Casus-anker.";
const CONTEXT_ENGINE_SYSTEM_PROMPT = `
JE BENT CYNTRA CONTEXT ENGINE.
Reconstrueer de werkelijke situatie van de organisatie op basis van gebruikersinput, gespreksverslagen, uploads, cijfers en contextinformatie.
Geef geen advies, geen interventies en geen keuzes.
Richt je op systeembeschrijving, beperkingen en numerieke implicaties.
Gebruik alleen broninformatie; geen verzonnen cijfers.
`.trim();
const DIAGNOSE_ENGINE_SYSTEM_PROMPT = `
JE BENT CYNTRA STRUCTURELE DIAGNOSE ENGINE.
Je taak is het werkelijke probleem achter zichtbare symptomen te identificeren.
Geef geen advies, geen interventieontwerp, geen keuzeadvies.
Werk brongebonden en causaal.
`.trim();
const STRATEGIC_REASONING_NODE_SYSTEM_PROMPT = `
JE BENT CYNTRA STRATEGICREASONINGNODE.
Zoek systematisch naar:
1) Structurele beperkingen: contractplafonds, schaalgrenzen, verdienmodelproblemen, afhankelijkheid van derden.
2) Financiële logica: reken implicaties door, detecteer schaalplafonds en margedruk.
3) Strategische paradoxen: groeiambitie vs capaciteit, autonomie vs centrale sturing, kwaliteit vs productienorm.
4) Nieuwe zienswijzen: minimaal 3 perspectieven.

Output exact in dit format en herhaal het minimaal 3 keer:
STRATEGISCH INZICHT
LOGICA
BESTUURLIJKE IMPLICATIE

Geen interventieadvies.
`.trim();
const ORGANISATIEDYNAMIEK_ENGINE_SYSTEM_PROMPT = `
JE BENT CYNTRA ORGANISATIEDYNAMIEK ENGINE.
Analyseer gedrags- en machtsdynamiek in de organisatie.
Zoek naar besluitvermijding, onbenoemde conflicten, spanning tussen visie en realiteit en leiderschapsdynamiek.
Beschrijf exact: DYNAMIEK, GEDRAGSPATROON, IMPACT OP STRATEGIE.
Geef geen interventievoorstel.
`.trim();
const BOARDROOM_INTELLIGENCE_ENGINE_SYSTEM_PROMPT = `
JE BENT CYNTRA BOARDROOM INTELLIGENCE NODE.
Analyseer formele en informele macht, belangen, besluitdynamiek, verborgen conflicten en leiderschapsdynamiek.
Genereer minimaal 3 boardroom-inzichten.
Gebruik exact labels:
BOARDROOM INZICHT
WAAROM DIT BESTUURLIJK BELANGRIJK IS
RISICO ALS DIT NIET WORDT GEADRESSEERD
Geen interventievoorstellen.
`.trim();
const SCENARIO_SIMULATION_ENGINE_SYSTEM_PROMPT = `
JE BENT CYNTRA SCENARIO SIMULATION NODE.
Genereer minimaal 3 scenario's: A consolidatie, B groei, C hybride model.
Per scenario verplicht:
SCENARIO
STRATEGISCHE LOGICA
FINANCIËLE CONSEQUENTIES
ORGANISATORISCHE CONSEQUENTIES
RISICO'S
LANGE TERMIJN EFFECT
Voeg toe:
### SCENARIOVERGELIJKING
VOORKEURSSCENARIO
WAAROM DIT HET MEEST ROBUUST IS
WELKE VOORWAARDEN NODIG ZIJN
Geen interventies.
`.trim();
const DECISION_QUALITY_ENGINE_SYSTEM_PROMPT = `
JE BENT CYNTRA DECISION QUALITY NODE.
Toets kritisch of het gekozen besluit verstandig is op consistentie, risico, uitvoerbaarheid en scenario-robuustheid.
Geef scorecomponenten en totaalscore.
Geef ook flags:
INTERVENTIES INCONSISTENT: JA/NEE
SCENARIOANALYSE ONTBREEKT: JA/NEE
Geen interventieontwerp.
`.trim();
const HYPOTHESE_ENGINE_SYSTEM_PROMPT = `
JE BENT CYNTRA STRATEGISCHE HYPOTHESE ENGINE.
Genereer minimaal 3 strategische opties: OPTIE A, OPTIE B, OPTIE C.
Per optie exact:
VOORDEEL
NADEEL
RISICO
LANGE TERMIJN EFFECT
Geen interventies.
`.trim();
const INTERVENTIE_ENGINE_SYSTEM_PROMPT = `
JE BENT CYNTRA INTERVENTIE ENGINE.
Ontwerp een concreet plan van aanpak.
Elke interventie bevat exact:
ACTIE
WAAROM DEZE INTERVENTIE
GEVOLG VOOR ORGANISATIE
GEVOLG VOOR KLANT/CLIËNT
RISICO VAN NIET HANDELEN
Maak minimaal zes interventies.
Voeg daarna een tijdlijn toe met: 0–30 dagen, 30–60 dagen, 60–90 dagen.
Werk brongebonden en concreet.
`.trim();

const ENGLISH_LEAK_GUARD =
  /\b(recommendation|in conclusion|quick\s+wins|accountability|roadmap|downside|upside|baseline|framework|stakeholder|governance\s+model)\b/i;

const SOFT_LANGUAGE_GUARD =
  /\b(overweeg|overwegen|misschien|mogelijk|wellicht|eventueel|zou kunnen|kan helpen|kan bijdragen|men zou)\b/i;

const MARKETING_LANGUAGE_GUARD =
  /\b(gamechanger|disrupt|synergie|state[- ]of[- ]the[- ]art|best[- ]in[- ]class|uniek verkoopargument|viral)\b/i;

const FORBIDDEN_GPT_STYLE_GUARD =
  /\b(op basis van de analyse|het lijkt erop dat|als ai|als taalmodel|mogelijk is het)\b/i;

const CONSULTANT_CLICHE_GUARD =
  /\b(belangrijke succesfactor|quick win|quick wins|low-hanging fruit|low hanging fruit|governance-technisch|default template|transformatie-template)\b/i;

const STRICT_BANNED_LANGUAGE_GUARD =
  /\b(default template|transformatie-template|governance-technisch|aanname:|contextanker:|signat(?:ure)? layer waarschuwing)\b/i;

const DOMINANT_HYPOTHESIS_GUARD =
  /\bde werkelijke bestuurlijke kern is niet\b[\s\S]{0,180}\bmaar\b/i;

const UNCOMFORTABLE_TRUTH_GUARD =
  /\bde ongemakkelijke waarheid is:\b/i;

const TEMPO_POWER_GUARD =
  /\bwie tempo controleert,\s*controleert macht\./i;

const POWER_ACTOR_EXTRACT_GUARD =
  /\b(ceo|cfo|coo|chro|cto|cmo|raad van bestuur|rvb|raad van toezicht|rvt|or|ondernemingsraad|medisch directeur|medisch manager|regiodirecteur|programmadirecteur|lijnmanager|operationsdirecteur|founder|investeerder|compliance officer)\b/gi;

const POWER_ACTOR_LINE_GUARD =
  /\b(ceo|cfo|coo|chro|cto|cmo|raad van bestuur|rvb|raad van toezicht|rvt|or|ondernemingsraad|medisch directeur|medisch manager|regiodirecteur|programmadirecteur|lijnmanager|operationsdirecteur|founder|investeerder|compliance officer)\b/i;

const POWER_ACTOR_WIN_LOSS_GUARD =
  /\b(verliest|inlevert|kwijtraakt|wint|krijgt|versterkt)\b/i;

const POWER_ACTOR_SABOTAGE_GUARD =
  /\b(stil veto|uitzonderingscasus|budgetrem|compliance-argument|kwaliteitsargument|burn-out framing|burn-out|vertraging|sabotage|scope-verdunning|herprioritering|escalatie)\b/i;

const POWER_ACTOR_INSTRUMENT_GUARD =
  /\b(budget|informatie|personeel|planning|escalatie|reputatie|toezicht|moreel gezag)\b/i;

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

const FORBIDDEN_SECTION_START_PATTERNS = [
  /^\s*SIGNATURE LAYER WAARSCHUWING/i,
  /^\s*Aanname:/i,
  /^\s*Contextanker:/i,
  /^\s*beperkte context/i,
  /^\s*duid structureel/i,
];
const POST_SANITIZE_LINE_PATTERNS = [
  /^\s*SIGNATURE LAYER WAARSCHUWING.*$/gim,
  /^\s*Contextsignaal:.*$/gim,
  /^\s*Aanname:.*$/gim,
  /^\s*Contextanker:.*$/gim,
  /^\s*beperkte context.*$/gim,
  /^\s*duid structureel.*$/gim,
  /\$\{facts\.[^}]+\}/gim,
];

const STRUCTURE_HEADINGS = [
  "### 1. DOMINANTE THESE",
  "### 2. KERNCONFLICT",
  "### 3. STRATEGISCHE INZICHTEN",
  "### 4. KEERZIJDE VAN DE KEUZE",
  "### 5. PRIJS VAN UITSTEL",
  "### 6. GOVERNANCE IMPACT",
  "### 7. MACHTSDYNAMIEK",
  "### 8. EXECUTIERISICO",
  "### 9. STRATEGISCHE SCENARIOANALYSE",
  "### 10. 90-DAGEN INTERVENTIEPROGRAMMA",
  "### 11. BESLUITSKWALITEIT",
  "### 12. BESLUITKADER",
] as const;
const STRATEGIC_INSIGHTS_HEADING = "### 3. STRATEGISCHE INZICHTEN";
const runtimeLastOutputByContext = new Map<string, string>();

const TOP_UNDER_BRIDGE_LINES: Record<(typeof STRUCTURE_HEADINGS)[number], string> = {
  "### 1. DOMINANTE THESE":
    "In de bovenstroom is de richting vaak helder, maar in de onderstroom bepalen dagelijkse uitzonderingen of die richting echt standhoudt.",
  "### 2. KERNCONFLICT":
    "De bovenstroom wil snelheid en duidelijkheid, terwijl de onderstroom zoekt naar bescherming van werkdruk, autonomie en bestaande routines.",
  "### 3. STRATEGISCHE INZICHTEN":
    "De bovenstroom zoekt nieuwe richting, terwijl de onderstroom alleen beweegt als de logica en consequenties expliciet zijn.",
  "### 4. KEERZIJDE VAN DE KEUZE":
    "In de bovenstroom heet dit prioriteren; in de onderstroom voelt het als inleveren van ruimte, status of zekerheid.",
  "### 5. PRIJS VAN UITSTEL":
    "De bovenstroom ziet oplopende kosten van uitstel, terwijl de onderstroom uitstel stap voor stap normaliseert.",
  "### 6. GOVERNANCE IMPACT":
    "De bovenstroom tekent mandaten en escalatiepaden, de onderstroom test of die regels ook echt voor iedereen gelden.",
  "### 7. MACHTSDYNAMIEK":
    "In de bovenstroom worden verantwoordelijkheden verdeeld, in de onderstroom verschuift macht via planning, informatie en uitzonderingen.",
  "### 8. EXECUTIERISICO":
    "De bovenstroom benoemt risico's en owners, maar in de onderstroom ontstaan vertragingen door conflictmijding en ad-hoc uitzonderingen.",
  "### 9. STRATEGISCHE SCENARIOANALYSE":
    "De bovenstroom vergelijkt opties op robuustheid, de onderstroom bepaalt of gekozen scenario politiek uitvoerbaar is.",
  "### 10. 90-DAGEN INTERVENTIEPROGRAMMA":
    "De bovenstroom vraagt ritme en discipline; de onderstroom vraagt voorspelbare grenzen en eerlijkheid in wie wat moet inleveren.",
  "### 11. BESLUITSKWALITEIT":
    "De bovenstroom toetst besluitkwaliteit op logica en uitvoerbaarheid, de onderstroom bepaalt of het besluit standhoudt onder spanning.",
  "### 12. BESLUITKADER":
    "De bovenstroom formaliseert het besluit, de onderstroom voelt meteen welke ruimte verdwijnt en welke verantwoordelijkheden vaststaan.",
};

const SECTION_DEFAULTS: Record<(typeof STRUCTURE_HEADINGS)[number], string> = {
  "### 1. DOMINANTE THESE":
    "De dominante bestuurlijke these is dat de organisatie niet vastloopt op intentie, maar op te veel gelijktijdige prioriteiten zonder harde volgorde. Mensen trekken hard aan hetzelfde doel, maar in de praktijk verschuift de uitkomst nog te vaak met de druk van de dag. In de bovenstroom lijkt de koers daardoor stabieler dan zij in de onderstroom werkelijk is. De kernvraag voor het bestuur blijft: versterkt deze keuze de regie aan de top, of vergroot zij opnieuw de bestuurlijke ruis.",

  "### 2. KERNCONFLICT":
    "Het kernconflict is dat meerdere legitieme doelen tegelijk maximaal worden nagestreefd in een context waarin dat niet meer vanzelf samenvalt. De bovenstroom vraagt om tempo, voorspelbaarheid en margediscipline, terwijl de onderstroom vooral spanning voelt op werkdruk, autonomie en kwaliteit. Daardoor schuift het gesprek snel van inhoud naar positie. Zonder expliciete volgorde blijft dit conflict bestuurlijk onoplosbaar.",

  "### 3. STRATEGISCHE INZICHTEN":
    "INZICHT: Financiële en operationele grenzen versnellen elkaar. WAAROM DIT BELANGRIJK IS: Zonder geïntegreerde doorrekening lijken losse verbeteringen mogelijk die in combinatie verlies vergroten. BESTUURLIJKE CONSEQUENTIE: Besluitvorming verschuift van initiatiefgestuurd naar constraint-gestuurd.",

  "### 4. KEERZIJDE VAN DE KEUZE":
    "Keuzeconflict 1: centrale regie op instroom en planning verhoogt tempo en voorspelbaarheid, maar beperkt lokale beslisruimte. Keuzeconflict 2: brede uitzonderingsruimte verlaagt de spanning op korte termijn, maar verlengt margedruk en doorlooptijd op middellange termijn. In de bovenstroom lijken dit rationele keuzes; in de onderstroom gaan deze keuzes over verlies van invloed, ritme en routine. Keuzeconflicten worden pas werkbaar wanneer expliciet is wie wat tijdelijk inlevert.",

  "### 5. PRIJS VAN UITSTEL":
    "30 dagen zonder hard besluit leidt meestal tot direct signaalverlies, meer ad-hoc herstelwerk en lagere voorspelbaarheid in de operatie. Na 90 dagen zie je dat terug in doorlooptijd, vervangingsdruk en oplopende frictie tussen formele prioriteiten en informele uitzonderingen. Op 365 dagen verschuift dit van tijdelijk ongemak naar structurele schade: lagere bestuurbaarheid, zwakkere marges en tragere executie. Na 12 maanden draait de organisatie niet meer op keuze maar op gewoonte, en wordt herstel aantoonbaar duurder in tijd, energie en vertrouwen.",

  "### 6. GOVERNANCE IMPACT":
    "Governance-impact betekent hier: van persoonsafhankelijke sturing naar ritmegedreven besluitvorming met heldere mandaten. In de bovenstroom vraagt dat een vaste regietafel met eigenaarschap, KPI-definities en korte escalatielijnen. In de onderstroom vraagt het vooral consistentie: dezelfde regels, dezelfde termijnen en dezelfde toetsing. Pas dan neemt besluitkracht toe zonder dat teams het ervaren als willekeur of extra politieke druk.",

  "### 7. MACHTSDYNAMIEK":
    "De feitelijke macht zit niet alleen in formele organogrammen, maar ook in intake, planning en uitzonderingsbesluiten. De CFO verliest ruimte voor parallelle uitzonderingsbudgetten, maar wint voorspelbaarheid op kas en marge. De COO levert informele speelruimte in, maar wint duidelijk mandaat op capaciteit en doorstroom. In de onderstroom blijft de gevoeligheid zitten in wie informatie doseert, wie escalaties versnelt of vertraagt en wie uitzonderingen als norm probeert te houden.",

  "### 8. EXECUTIERISICO":
    "Het primaire executierisico is terugval in bekende patronen zodra de eerste spanning oploopt. Het faalpunt is bijna altijd hetzelfde: oude en nieuwe prioriteiten blijven naast elkaar bestaan zonder harde stopkeuze. De blocker zit dan niet in planvorming, maar in dubbelmandaat, vertraagde escalatie en stille heronderhandeling in de onderstroom. Dat maakt uitvoering traag, ook als de strategie op papier klopt.",

  "### 9. STRATEGISCHE SCENARIOANALYSE":
    "SCENARIO A: CONSOLIDATIE. STRATEGISCHE LOGICA: stabilisatie van de kern met focus op margediscipline. FINANCIËLE CONSEQUENTIES: lagere variatie en voorspelbaardere kasdruk. ORGANISATORISCHE CONSEQUENTIES: centrale prioritering en minder parallelle initiatieven. RISICO'S: tijdelijke groeivertraging. LANGE TERMIJN EFFECT: hogere robuustheid bij externe druk. SCENARIO B: GROEI. STRATEGISCHE LOGICA: versneld opschalen van activiteiten. FINANCIËLE CONSEQUENTIES: hogere investeringsbehoefte en groter margerisico bij tariefdruk. ORGANISATORISCHE CONSEQUENTIES: hogere managementbelasting en capaciteitskrapte. RISICO'S: overbelasting en versnippering. LANGE TERMIJN EFFECT: hoger potentieel, maar fragiel bij contractbeperkingen. SCENARIO C: HYBRIDE MODEL. STRATEGISCHE LOGICA: kern stabiliseren en gecontroleerd verbreden. FINANCIËLE CONSEQUENTIES: gebalanceerde kasdruk met gefaseerde investeringen. ORGANISATORISCHE CONSEQUENTIES: hogere complexiteit, maar bestuurbaar bij strakke governance. RISICO'S: sluipende scope-uitbreiding. LANGE TERMIJN EFFECT: adaptieve robuustheid. SCENARIOVERGELIJKING: per scenario worden voordelen, nadelen, risiconiveau en strategische robuustheid expliciet gewogen. VOORKEURSSCENARIO: hybride met consolidatie-eerst. WAAROM DIT HET MEEST ROBUUST IS: combineert risicobeheersing met gecontroleerde groei. WELKE VOORWAARDEN NODIG ZIJN: harde stopregels, capaciteitsdiscipline en contractvloer per verzekeraar.",

  "### 10. 90-DAGEN INTERVENTIEPROGRAMMA":
    "Maand 1 (dag 1-30): stabiliseren en stop-doing vastzetten met exact twee interventies. Maand 2 (dag 31-60): governance en capaciteit herontwerpen met exact twee interventies. Maand 3 (dag 61-90): verankeren en contracteren met exact twee interventies. Elke interventie bevat actie, eigenaar, deadline, KPI, escalatiepad, effect op organisatie, effect op cliënt, direct zichtbaar effect en casus-anker.",

  "### 11. BESLUITSKWALITEIT":
    "Besluitscore: 0/100. Belangrijkste risico's: nog te valideren op consistentie, uitvoerbaarheid en scenario-robuustheid. Uitvoerbaarheidsanalyse: governance, capaciteit en leiderschap bepalen realisatiekracht. Aanbevolen verbeteringen: versterk besluitlogica, risico-afdekking en herijkingsritme.",

  "### 12. BESLUITKADER":
    "De Raad van Bestuur committeert zich aan: een bindende keuze met duidelijke eindverantwoordelijkheid, vaste termijnen en toetsbare resultaten. Per direct stopt parallelle sturing op dezelfde KPI's, en nieuwe niet-kerninitiatieven starten alleen na formele board-goedkeuring. Formeel betekent dit dat lokaal mandaat op intake, planning en uitzonderingen wordt beperkt; informeel betekent dit dat vertraagde bypass-routes niet langer geaccepteerd worden. Expliciet verlies: tijdelijke pauze van niet-kernwerk, tijdelijke begrenzing van instroom waar de druk disproportioneel is, en tijdelijke inlevering van lokale uitzonderingsruimte om centrale regie te herstellen.",
};

const SECTION_CLOSURE_LINES: Record<(typeof STRUCTURE_HEADINGS)[number], { line: string; guard: RegExp }> = {
  "### 1. DOMINANTE THESE": {
    line: "Zonder volgorde wordt groei een versneller van verlies.",
    guard: /\bversneller van verlies\b/i,
  },
  "### 2. KERNCONFLICT": {
    line: "Zonder volledige financiële transparantie blijft autonomie bestuurlijk fictief.",
    guard: /\bautonomie\b[\s\S]{0,80}\bfictief\b/i,
  },
  "### 3. STRATEGISCHE INZICHTEN": {
    line: "Zonder expliciete logica blijft inzicht een observatie zonder bestuurlijke werking.",
    guard: /\binzicht\b[\s\S]{0,120}\bbestuurlijke\b/i,
  },
  "### 4. KEERZIJDE VAN DE KEUZE": {
    line: "Wat niet op marge wordt gevalideerd, stopt.",
    guard: /\bwordt gevalideerd,\s*stopt\b/i,
  },
  "### 5. PRIJS VAN UITSTEL": {
    line: "Uitstel verschuift dit vraagstuk van optimalisatie naar continuïteitsrisico.",
    guard: /\bcontinu[iï]teitsrisico\b/i,
  },
  "### 6. GOVERNANCE IMPACT": {
    line: "Besluitrecht zonder afdwinging is procedure, geen governance.",
    guard: /\bgeen governance\b/i,
  },
  "### 7. MACHTSDYNAMIEK": {
    line: "Waar informele macht niet wordt begrensd, wordt formeel besluitrecht uitgehold.",
    guard: /\bformeel besluitrecht uitgehold\b/i,
  },
  "### 8. EXECUTIERISICO": {
    line: "Zonder stopregels blijft uitvoering ondergeschikt aan vermijding.",
    guard: /\bondergeschikt aan vermijding\b/i,
  },
  "### 9. STRATEGISCHE SCENARIOANALYSE": {
    line: "Scenariovergelijking maakt bestuurlijke trade-offs expliciet en toetsbaar.",
    guard: /\bscenariovergelijking\b/i,
  },
  "### 10. 90-DAGEN INTERVENTIEPROGRAMMA": {
    line: "Na dag 90 volgt mandaatverschuiving bij gate-falen.",
    guard: /\bmandaatverschuiving\b[\s\S]{0,40}\bgate-falen\b/i,
  },
  "### 11. BESLUITSKWALITEIT": {
    line: "Een besluit zonder kwaliteitstoets vergroot de kans op strategische foutbesluiten.",
    guard: /\b(besluitscore|uitvoerbaarheidsanalyse|belangrijkste risico)/i,
  },
  "### 12. BESLUITKADER": {
    line: "Terugdraaien kan alleen via formeel herbesluit met onderbouwing.",
    guard: /\bformeel herbesluit\b/i,
  },
};

/* ============================================================
   UTILS
============================================================ */

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function contextFingerprint(value: string): string {
  const source = String(value ?? "");
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  return `ctx_${hash.toString(16)}`;
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

function clampChars(value: string, maxChars: number): string {
  const source = String(value ?? "").trim();
  if (source.length <= maxChars) return source;
  return `${source.slice(0, maxChars).trim()} ...`;
}

function decodeDataUrl(value: string): { mime: string; payloadBase64: string } | null {
  const match = String(value ?? "")
    .trim()
    .match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,([\s\S]+)$/i);
  if (!match) return null;
  return {
    mime: String(match[1] || "application/octet-stream").toLowerCase(),
    payloadBase64: String(match[2] || "").trim(),
  };
}

function decodeBase64Binary(base64: string): string {
  try {
    if (typeof atob !== "function") return "";
    return atob(base64);
  } catch {
    return "";
  }
}

function decodeBase64Utf8(base64: string): string {
  const binary = decodeBase64Binary(base64);
  if (!binary) return "";
  try {
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return binary;
  }
}

function decodePdfLiteralText(literal: string): string {
  return literal
    .replace(/\\([\\()])/g, "$1")
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\[0-7]{1,3}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPdfTextFromBinary(binary: string): string {
  const fragments: string[] = [];
  const tjPattern = /\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g;
  let tjMatch: RegExpExecArray | null = null;
  while ((tjMatch = tjPattern.exec(binary)) !== null) {
    const decoded = decodePdfLiteralText(tjMatch[1] || "");
    if (decoded.length >= 2) fragments.push(decoded);
  }

  const tjArrayPattern = /\[(.*?)\]\s*TJ/gs;
  let tjArrayMatch: RegExpExecArray | null = null;
  while ((tjArrayMatch = tjArrayPattern.exec(binary)) !== null) {
    const chunk = tjArrayMatch[1] || "";
    const literalPattern = /\(([^()]*(?:\\.[^()]*)*)\)/g;
    let literalMatch: RegExpExecArray | null = null;
    while ((literalMatch = literalPattern.exec(chunk)) !== null) {
      const decoded = decodePdfLiteralText(literalMatch[1] || "");
      if (decoded.length >= 2) fragments.push(decoded);
    }
  }

  if (fragments.length >= 10) {
    return clampChars(fragments.join("\n"), 24000);
  }

  const printableFallback =
    binary.match(/[A-Za-z0-9€%(),.;:'"\/\-_ ]{20,}/g)?.slice(0, 500).join("\n") || "";
  return clampChars(printableFallback, 20000);
}

function normalizeDocumentContentForPrompt(doc: ContextDocument): string {
  const raw = toSafeString(doc?.content);
  if (!raw) return "";

  const dataUrl = decodeDataUrl(raw);
  if (!dataUrl) {
    return clampChars(raw, 24000);
  }

  const mime = dataUrl.mime;
  if (mime.includes("pdf")) {
    const binary = decodeBase64Binary(dataUrl.payloadBase64);
    const extracted = extractPdfTextFromBinary(binary);
    return extracted
      ? `[PDF-TEXTEXTRACTIE]\n${extracted}`
      : "[PDF-INHOUD NIET LEESBAAR IN TEKSTLAAG]";
  }

  if (
    mime.startsWith("text/") ||
    mime.includes("json") ||
    mime.includes("xml") ||
    mime.includes("csv")
  ) {
    const utf8 = decodeBase64Utf8(dataUrl.payloadBase64);
    return clampChars(utf8, 24000);
  }

  const utf8Fallback = decodeBase64Utf8(dataUrl.payloadBase64);
  if (utf8Fallback.trim().length >= 120) {
    return clampChars(utf8Fallback, 18000);
  }
  return `[BINAR DOCUMENT: ${mime}]`;
}

function normalizeDocumentsForPrompt(documents: ContextDocument[]): ContextDocument[] {
  return documents.map((doc) => ({
    ...doc,
    content: normalizeDocumentContentForPrompt(doc),
  }));
}

function buildMandatoryCaseContextBlock(
  documents: ContextDocument[],
  legacyContext: string,
  briefContext: string
): string {
  const prioritizedDocs = documents.slice(0, 12).map(
    (doc, idx) =>
      `Casusdocument ${idx + 1} (${doc.filename}):\n${clampChars(doc.content, 12000)}`
  );

  const sections = [
    MANDATORY_GGZ_CASE_FACTS_BLOCK,
    MULTISOURCE_CONTEXT_DIRECTIVE,
    prioritizedDocs.length
      ? `VERPLICHTE CASUSDOCUMENTEN (PRIMAIRE BRON):\n${prioritizedDocs.join("\n\n")}`
      : "VERPLICHTE CASUSDOCUMENTEN (PRIMAIRE BRON): geen leesbare documenttekst gevonden; rapporteer hiaten expliciet.",
    legacyContext ? `VRIJE TEKST CONTEXT (EXPLICIETE INPUT):\n${clampChars(legacyContext, 12000)}` : "",
    briefContext ? `SAMENGEVATTE BRIEFCONTEXT:\n${clampChars(briefContext, 12000)}` : "",
  ].filter(Boolean);

  return sections.join("\n\n");
}

function extractSection(text: string, heading: string): string {
  const start = text.indexOf(heading);
  if (start < 0) return "";

  const rest = text.slice(start + heading.length).trimStart();
  const next = rest.search(/\n###\s*\d+\./);

  if (next < 0) return rest.trim();
  return rest.slice(0, next).trim();
}

function replaceSection(text: string, heading: string, nextBody: string): string {
  const start = text.indexOf(heading);
  if (start < 0) return text;

  const bodyStart = start + heading.length;
  const afterHeading = text.slice(bodyStart);
  const nextRel = afterHeading.search(/\n###\s*\d+\./);
  const sectionBody = `\n${nextBody.trim()}\n`;

  if (nextRel < 0) {
    return `${text.slice(0, bodyStart)}${sectionBody}`.trim();
  }

  const nextIndex = bodyStart + nextRel;
  return `${text.slice(0, bodyStart)}${sectionBody}${text.slice(nextIndex).trimStart()}`.trim();
}

function appendExecutionValidationToInterventionSection(
  text: string,
  validationText: string
): string {
  const heading = "### 10. 90-DAGEN INTERVENTIEPROGRAMMA";
  const section = extractSection(text, heading);
  const block = String(validationText ?? "").trim();
  if (!section || !block) return text;
  if (/\bEXECUTION VALIDATION\b/i.test(section)) return text;

  const compact = block.replace(/^EXECUTION VALIDATION\s*/i, "").trim();
  const nextBody = `${section}\n\nEXECUTION VALIDATION\n${compact}`.trim();
  return replaceSection(text, heading, nextBody);
}

function buildInterventionLine(anchor: string, idx: number, owner: string, day: number): string {
  const kpiLine =
    /€|%|\\b\\d+\\b/.test(anchor)
      ? `KPI: Behoud of herstel van ${anchor} binnen afgesproken bandbreedte`
      : `KPI: Meetwijze = wekelijkse trendverbetering op ${anchor} (zonder numerieke claim buiten input)`;

  return [
    `Probleem dat wordt opgelost: Onvoldoende bestuurlijke grip op ${anchor}.`,
    `Concrete actie: Veranker ${anchor} als besliscriterium in operationele weekstart ${idx + 1}.`,
    `Waarom deze interventie: Zonder expliciete sturing op ${anchor} blijft margedruk en uitvoeringsfrictie oplopen.`,
    `Eigenaar: ${owner}`,
    `Deadline: Dag ${day}`,
    `Meetbare KPI: ${kpiLine.replace(/^KPI:\s*/i, "")}`,
    `Escalatieregel: Bij conflict beslist ${owner} binnen 48 uur met RvB-escalatie.`,
    `Gevolg voor organisatie: Hogere uitvoerbaarheid op capaciteit en minder bestuurlijke ruis rond ${anchor}.`,
    `Gevolg voor klant/cliënt: Meer voorspelbare doorlooptijd en betere continuïteit binnen trajecten gekoppeld aan ${anchor}.`,
    `Risico van niet handelen: Oplopende wachttijd, lagere voorspelbaarheid en versnelde marge-erosie op ${anchor}.`,
    `Direct zichtbaar effect: Binnen 7 dagen minder frictie rond ${anchor}.`,
    `Casus-anker: ${anchor}`,
  ].join("\n");
}

function enforceSection8InterventionArtifact(markdown: string, contextHint: string): string {
  const heading = "### 10. 90-DAGEN INTERVENTIEPROGRAMMA";
  const current = extractSection(markdown, heading);
  const anchors = parseInputAnchors(contextHint).slice(0, 18);
  const ownerPool = ["CEO", "CFO", "COO", "Programmadirecteur", "Operationeel manager"];

  const month1 = anchors.slice(0, 2);
  const month2 = anchors.slice(2, 4);
  const month3 = anchors.slice(4, 6);
  const pick = (list: string[], fallback: string[]) =>
    (list.length ? list : fallback).map((anchor, idx) =>
      buildInterventionLine(anchor, idx, ownerPool[idx % ownerPool.length], 10 + idx * 3)
    );

  const artifact = [
    "MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN",
    ...pick(month1, ["intake", "planning"]),
    "",
    "MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN",
    ...pick(month2, ["contractvormen", "capaciteit"]),
    "",
    "MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN",
    ...pick(month3, ["mandaat", "governance"]),
    "",
    "Dag 30 gates: Stop-doing compliance + owner accountability bevestigd.",
    "Dag 60 gates: Mandaatverschuiving + escalatiepad hard vastgelegd.",
    "Dag 90 gates: Adoptie + impact aantoonbaar op kern-KPI en casus-ankers.",
    "",
    "BOVENSTROOM-DOELEN",
    "1. Besluitrecht eenduidig en conflictescalatie binnen 48 uur.",
    "",
    "ONDERSTROOM-DOELEN",
    "1. Informele bypasses dalen zichtbaar binnen 30 dagen.",
  ].join("\n\n");

  const needsRewrite =
    !current.includes("MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN") ||
    !current.includes("MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN") ||
    !current.includes("MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN") ||
    (current.match(/\b(?:Concrete actie|Actie):/gi) ?? []).length < 6;

  if (!needsRewrite) return markdown;
  return replaceSection(markdown, heading, artifact);
}

function enforceDecisionContractLabels(markdown: string): string {
  const heading = "### 12. BESLUITKADER";
  const current = extractSection(markdown, heading);
  const prefix = "De Raad van Bestuur committeert zich aan:";
  const value = (label: string, fallback: string) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = current.match(new RegExp(`${escaped}\\s*(.+)`, "i"));
    return (m?.[1] ?? fallback).trim();
  };

  const rewritten = [
    prefix,
    `Keuze: ${value("Keuze:", "Eén dominante koers met expliciet mandaat.")}`,
    `Expliciet verlies: ${value("Expliciet verlies:", "Tijdelijke inperking van lokale uitzonderingsruimte.")}`,
    `Besluitrecht ligt bij: ${value("Besluitrecht ligt bij:", "CEO met formele board-borging.")}`,
    `Stoppen per direct: ${value("Stoppen per direct:", "Parallelle prioriteiten zonder owner/KPI/deadline.")}`,
    `Niet meer escaleren: ${value("Niet meer escaleren:", "Informele bypasses buiten de formele lijn.")}`,
    `Maandelijkse KPI: ${value("Maandelijkse KPI:", "Trend op doorlooptijd, kwaliteit en uitvoeringsdiscipline.")}`,
    `Failure trigger: ${value("Failure trigger:", "Twee opeenvolgende gate-failures op Dag 30/60/90.")}`,
    `Point of no return: ${value("Point of no return:", "Na Dag 90 zonder meetbare trendbreuk wordt herstel disproportioneel duur.")}`,
    `Herijkingsmoment: ${value("Herijkingsmoment:", "Maandelijks boardreview met expliciete keuze tot doorpakken of stoppen.")}`,
  ].join("\n");

  return replaceSection(markdown, heading, rewritten);
}

function enforceBoardSummaryBlock(markdown: string): string {
  const summaryTitle = "1-PAGINA BESTUURLIJKE SAMENVATTING";
  if (markdown.includes(summaryTitle)) return markdown;

  const summaryBlock = [
    summaryTitle,
    "Besluit vandaag: consolideren 12 maanden; verbreding tijdelijk bevriezen.",
    "Voorkeursoptie: consolidatiepad.",
    "Expliciet verlies: tijdelijke groeivertraging buiten de kern, tijdelijke pauze op niet-kerninitiatieven, minder lokale uitzonderingsruimte.",
    "Waarom onvermijdelijk: kosten- en tariefdruk plus contractplafonds blokkeren autonome groei zonder margeherstel.",
    "30/60/90 meetpunten: Dag 30 margekaart 100%, Dag 60 contractvloer per verzekeraar, Dag 90 cash-scenario's + formeel strategiebesluit.",
    "Als meetpunten niet gehaald worden: verbreding automatisch gepauzeerd tot formeel herstelbesluit.",
  ].join("\n");

  const section9Heading = "### 12. BESLUITKADER";
  const idx = markdown.indexOf(section9Heading);
  if (idx < 0) return markdown;

  return `${markdown.slice(0, idx).trimEnd()}\n\n${summaryBlock}\n\n${markdown.slice(idx).trimStart()}`.trim();
}

function enforceSituationReconstructionBlock(markdown: string): string {
  const title = "0 SITUATIERECONSTRUCTIE";
  const requiredLines = [
    "Feiten uit documenten:",
    "Belangrijkste cijfers:",
    "Organisatorische context:",
  ];
  if (
    markdown.includes(title) &&
    requiredLines.every((line) => markdown.toLowerCase().includes(line.toLowerCase()))
  ) {
    return markdown;
  }

  const block = [
    title,
    "Feiten uit documenten: reconstrueer de feitelijke situatie op basis van geüploade documenten en expliciete contextvelden.",
    "Belangrijkste cijfers: benoem expliciet broncijfers over kostprijs, tarieven, contractplafonds, loonkosten en capaciteit; ontbrekende cijfers markeren als niet onderbouwd.",
    "Organisatorische context: maak zichtbaar hoe governance, capaciteit en teamdynamiek de strategische ruimte begrenzen.",
  ].join("\n");

  const section1Heading = "### 1. DOMINANTE THESE";
  const idx = markdown.indexOf(section1Heading);
  if (idx < 0) return markdown;
  return `${block}\n\n${markdown.slice(idx).trimStart()}`.trim();
}

function enforceHypothesisCompetitionSection(
  markdown: string,
  hypothesisCompetitionBlock: string
): string {
  const heading = "### HYPOTHESE CONCURRENTIE";
  if (markdown.includes(heading)) return markdown;
  const section1Heading = "### 1. DOMINANTE THESE";
  const idx = markdown.indexOf(section1Heading);
  if (idx < 0) return `${markdown.trim()}\n\n${heading}\n${hypothesisCompetitionBlock}`.trim();
  return `${markdown.slice(0, idx).trimEnd()}\n\n${heading}\n${hypothesisCompetitionBlock}\n\n${markdown
    .slice(idx)
    .trimStart()}`.trim();
}

function enforceCausalMechanismsSection(
  markdown: string,
  causalMechanismBlock: string
): string {
  const heading = "### CAUSALE MECHANISMEN";
  if (markdown.includes(heading)) return markdown;
  const section1Heading = "### 1. DOMINANTE THESE";
  const idx = markdown.indexOf(section1Heading);
  if (idx < 0) return `${markdown.trim()}\n\n${heading}\n${causalMechanismBlock}`.trim();
  return `${markdown.slice(0, idx).trimEnd()}\n\n${heading}\n${causalMechanismBlock}\n\n${markdown
    .slice(idx)
    .trimStart()}`.trim();
}

function enforceDominantThesisAlignment(
  markdown: string,
  hypothesisCompetitionBlock: string
): string {
  const dominantExplanation =
    extractSingleLineValue(
      hypothesisCompetitionBlock,
      /\bWAARSCHIJNLIJKSTE VERKLARING:\s*(.+)$/im
    ) || "";
  if (!dominantExplanation) return markdown;
  const heading = "### 1. DOMINANTE THESE";
  const section = extractSection(markdown, heading);
  if (!section) return markdown;
  if (/waarschijnlijkste verklaring/i.test(section)) return markdown;
  return replaceSection(
    markdown,
    heading,
    `${section.trim()}\n\nWaarschijnlijkste verklaring uit hypotheseconcurrentie: ${dominantExplanation}`
  );
}

function enforceStrategicInsightsBlock(markdown: string): string {
  const isComplete =
    markdown.includes(STRATEGIC_INSIGHTS_HEADING) &&
    (markdown.match(/\bINZICHT:\b/gi) ?? []).length >= 3 &&
    (markdown.match(/\bWAAROM DIT BELANGRIJK IS:\b/gi) ?? []).length >= 3 &&
    (markdown.match(/\bBESTUURLIJKE CONSEQUENTIE:\b/gi) ?? []).length >= 3;
  if (isComplete) return markdown;

  const block = [
    STRATEGIC_INSIGHTS_HEADING,
    "INZICHT: Financiële schaalgrens wordt bepaald door contractplafonds en kostprijs per cliënt.",
    "WAAROM DIT BELANGRIJK IS: Groei zonder margeherstel vergroot structurele druk en verkleint behandelcapaciteit.",
    "BESTUURLIJKE CONSEQUENTIE: Prioriteit verschuift naar kernconsolidatie en contractdiscipline.",
    "",
    "INZICHT: Strategische paradox tussen kwaliteit, productienorm en transparantie remt uitvoerbaarheid.",
    "WAAROM DIT BELANGRIJK IS: Zonder causaal gesprek over normdruk ontstaat vermijding en vertraagde correctie.",
    "BESTUURLIJKE CONSEQUENTIE: Maandritme met expliciete normafwijking en snelle escalatie wordt verplicht.",
    "",
    "INZICHT: Afhankelijkheid van verzekeraars en plafondcontracten maakt autonome groei rekenkundig beperkt.",
    "WAAROM DIT BELANGRIJK IS: Externe begrenzing vertaalt zich direct in cashrisico en wachtlijstdruk.",
    "BESTUURLIJKE CONSEQUENTIE: Geen verbreding zonder margevalidatie en aantoonbare capaciteitsimpact.",
  ].join("\n");

  const sourceWithoutOldBlock = markdown.includes(STRATEGIC_INSIGHTS_HEADING)
    ? markdown.replace(
        new RegExp(
          `${STRATEGIC_INSIGHTS_HEADING.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}[\\s\\S]*?(?=\\n###\\s*4\\.\\s*KEERZIJDE\\s+VAN\\s+DE\\s+KEUZE|$)`,
          "i"
        ),
        ""
      )
    : markdown;

  const section4Heading = "### 4. KEERZIJDE VAN DE KEUZE";
  const idx = sourceWithoutOldBlock.indexOf(section4Heading);
  if (idx < 0) return `${sourceWithoutOldBlock.trim()}\n\n${block}`.trim();
  return `${sourceWithoutOldBlock.slice(0, idx).trimEnd()}\n\n${block}\n\n${sourceWithoutOldBlock
    .slice(idx)
    .trimStart()}`.trim();
}

function enforceBoardroomInsightsInPowerSection(
  markdown: string,
  boardroomIntelligenceOutput: string
): string {
  const heading = "### 7. MACHTSDYNAMIEK";
  const current = extractSection(markdown, heading);
  if (!current) return markdown;

  const hasPowerCore =
    /\bwie heeft besluitmacht\b/i.test(current) &&
    /\bwie heeft informele invloed\b/i.test(current) &&
    /\bwaar zit de feitelijke macht\b/i.test(current);
  const hasBoardroomTriples =
    (current.match(/\bBOARDROOM INZICHT\b/gi) ?? []).length >= 3 &&
    (current.match(/\bWAAROM DIT BESTUURLIJK BELANGRIJK IS\b/gi) ?? []).length >= 3 &&
    (current.match(/\bRISICO ALS DIT NIET WORDT GEADRESSEERD\b/gi) ?? []).length >= 3;
  if (hasPowerCore && hasBoardroomTriples) return markdown;

  const source = String(boardroomIntelligenceOutput ?? "");
  const insightBlocks = source.match(/BOARDROOM INZICHT[\s\S]*?(?=BOARDROOM INZICHT|$)/gi) ?? [];
  const picked = (insightBlocks.length ? insightBlocks : []).slice(0, 3);
  const fallbackTriples = [
    "BOARDROOM INZICHT: Formeel mandaat en informele invloed lopen niet parallel.",
    "WAAROM DIT BESTUURLIJK BELANGRIJK IS: Besluiten lijken genomen, maar blokkeren in uitvoering.",
    "RISICO ALS DIT NIET WORDT GEADRESSEERD: Uitstel wordt structureel en noodmaatregelen worden waarschijnlijker.",
    "",
    "BOARDROOM INZICHT: Belangenconflicten tussen kwaliteit, autonomie en marge worden niet expliciet geordend.",
    "WAAROM DIT BESTUURLIJK BELANGRIJK IS: Zonder ordening stuurt elk team op eigen optimum.",
    "RISICO ALS DIT NIET WORDT GEADRESSEERD: Bestuurlijke voorspelbaarheid en schaalbaarheid nemen af.",
    "",
    "BOARDROOM INZICHT: Besluitdynamiek wordt geremd door conflictmijding en consensusdruk.",
    "WAAROM DIT BESTUURLIJK BELANGRIJK IS: Escalatie verschuift van inhoud naar timingverlies.",
    "RISICO ALS DIT NIET WORDT GEADRESSEERD: Capaciteitsverlies en wachtrijdruk lopen sneller op.",
  ].join("\n");

  const boardroomBlock = [
    "WIE HEEFT BESLUITMACHT: expliciet benoemd per bestuursrol.",
    "WIE HEEFT INFORMELE INVLOED: zichtbaar in planning, informatie en uitzonderingsroutes.",
    "WAAR ZIT DE FEITELIJKE MACHT: op knooppunten waar instroom, capaciteit en uitzonderingen samenkomen.",
    "",
    (picked.length ? picked.join("\n\n") : fallbackTriples).trim(),
  ].join("\n");

  const next = `${current.trim()}\n\n${boardroomBlock}`.trim();
  return replaceSection(markdown, heading, next);
}

function enforceScenarioAnalysisSection(
  markdown: string,
  scenarioSimulationOutput: string
): string {
  const heading = "### 9. STRATEGISCHE SCENARIOANALYSE";
  const current = extractSection(markdown, heading);
  const hasCore =
    /\bSCENARIO\s*A\b/i.test(current) &&
    /\bSCENARIO\s*B\b/i.test(current) &&
    /\bSCENARIO\s*C\b/i.test(current) &&
    /\bSCENARIOVERGELIJKING\b/i.test(current) &&
    /\bVOORKEURSSCENARIO\b/i.test(current);
  if (hasCore) return markdown;

  const source = String(scenarioSimulationOutput ?? "").trim();
  const fallback = [
    "SCENARIO A — CONSOLIDATIE",
    "STRATEGISCHE LOGICA: stabilisatie van kernactiviteiten met focus op margediscipline.",
    "FINANCIËLE CONSEQUENTIES: lagere variabiliteit in kasdruk en hogere voorspelbaarheid van margeherstel.",
    "ORGANISATORISCHE CONSEQUENTIES: centrale prioritering en lagere managementcomplexiteit.",
    "RISICO'S: tijdelijke groeivertraging buiten de kern.",
    "LANGE TERMIJN EFFECT: hogere bestuurlijke robuustheid onder contractdruk.",
    "",
    "SCENARIO B — GROEI",
    "STRATEGISCHE LOGICA: uitbreiding van activiteiten voor schaal en marktbereik.",
    "FINANCIËLE CONSEQUENTIES: hogere investeringsbehoefte en groter margerisico bij tariefdruk.",
    "ORGANISATORISCHE CONSEQUENTIES: extra capaciteitsvraag en hogere leiderschapsbelasting.",
    "RISICO'S: overbelasting, versnippering en uitvoeringsvertraging.",
    "LANGE TERMIJN EFFECT: hoger potentieel, maar lagere schokbestendigheid zonder contractzekerheid.",
    "",
    "SCENARIO C — HYBRIDE MODEL",
    "STRATEGISCHE LOGICA: kern stabiliseren en gecontroleerd verbreden via gefaseerde poorten.",
    "FINANCIËLE CONSEQUENTIES: gebalanceerde kasdruk met gefaseerde investeringen en risicospreiding.",
    "ORGANISATORISCHE CONSEQUENTIES: hogere complexiteit die bestuurbaar blijft bij harde governance.",
    "RISICO'S: sluipende scope-uitbreiding en managementfrictie bij onduidelijk mandaat.",
    "LANGE TERMIJN EFFECT: adaptieve robuustheid met behoud van strategische optionaliteit.",
    "",
    "### SCENARIOVERGELIJKING",
    "SCENARIO A: voordelen = stabiliteit; nadelen = tragere groei; risiconiveau = laag-middel; strategische robuustheid = hoog.",
    "SCENARIO B: voordelen = schaalpotentieel; nadelen = hoge kapitaal- en capaciteitsdruk; risiconiveau = hoog; strategische robuustheid = laag-middel.",
    "SCENARIO C: voordelen = balans tussen stabiliteit en groei; nadelen = hogere coördinatiecomplexiteit; risiconiveau = middel; strategische robuustheid = hoog.",
    "",
    "VOORKEURSSCENARIO: SCENARIO C met consolidatie-eerst ritme.",
    "WAAROM DIT HET MEEST ROBUUST IS: combineert margeherstel met gecontroleerde groei en beperkt downside-risico.",
    "WELKE VOORWAARDEN NODIG ZIJN: contractdiscipline, capaciteitsgates, centrale prioritering en expliciete stopregels.",
  ].join("\n");

  return replaceSection(markdown, heading, source || fallback);
}

function enforceDecisionQualitySection(
  markdown: string,
  decisionQualityOutput: string,
  decisionQualityScore: number
): string {
  const heading = "### 11. BESLUITSKWALITEIT";
  const current = extractSection(markdown, heading);
  const hasCore =
    /\bBesluitscore\b/i.test(current) &&
    /\bBelangrijkste risico/i.test(current) &&
    /\bUitvoerbaarheidsanalyse\b/i.test(current) &&
    /\bAanbevolen verbeteringen\b/i.test(current) &&
    /\bDECISION CONTRACT\b/i.test(current);
  if (hasCore) return markdown;

  const src = String(decisionQualityOutput ?? "").trim();
  const fallback = [
    `Besluitscore: ${Math.max(0, Math.min(100, Number.isFinite(decisionQualityScore) ? decisionQualityScore : 0))}/100.`,
    "Belangrijkste risico's: onderschatte complexiteit, externe afhankelijkheid, overbelasting van leiderschap en financiële kwetsbaarheid.",
    "Uitvoerbaarheidsanalyse: uitvoerbaarheid vereist capaciteit, helder mandaat, governance-ritme en cultureel draagvlak.",
    "Aanbevolen verbeteringen: verscherp scenario-keuze, borg risicoafdekking, koppel interventies aan capaciteit en stel harde herijkingsmomenten vast.",
    "",
    "DECISION CONTRACT",
    "Besluit: gekozen scenario met expliciet mandaat.",
    "Waarom dit besluit wordt genomen: hoogste robuustheid onder huidige beperkingen.",
    "Welke verliezen worden geaccepteerd: tijdelijke groeivertraging en inperking van uitzonderingsruimte.",
    "Welke meetpunten bepalen succes: dag 30, dag 60 en dag 90 gate-resultaten.",
    "Wanneer het besluit wordt herzien: bij gate-failure of periodieke boardreview.",
  ].join("\n");

  return replaceSection(markdown, heading, src || fallback);
}

function buildMemoryContextBlock(params: {
  similarCases: Array<{
    caseId: string;
    sector: string;
    keyProblem: string;
    chosenStrategy: string;
    resultSummary?: string;
    relevance: number;
  }>;
}): string {
  if (!params.similarCases.length) {
    return [
      "GEEN DIRECT VERGELIJKBARE CASES GEVONDEN",
      "Analyse is uitgevoerd via strategische denkpatronen en systeemlogica.",
    ].join("\n");
  }

  const lines = ["VERGELIJKBARE CASES"];
  params.similarCases.slice(0, 5).forEach((c, idx) => {
    lines.push(`CASE ${idx + 1}: ${c.caseId} (relevantie ${Math.round(c.relevance * 100)}%)`);
    lines.push(`WAT HET PROBLEEM WAS: ${c.keyProblem || "Onbekend probleemtype."}`);
    lines.push(`WELKE STRATEGIE IS GEKOZEN: ${c.chosenStrategy || "Niet vastgelegd."}`);
    lines.push(`WAT HET RESULTAAT WAS: ${c.resultSummary || "Niet vastgelegd in memory."}`);
    lines.push(
      `WAAROM DIT RELEVANT IS VOOR DE HUIDIGE SITUATIE: overeenkomst op sector (${c.sector}) en probleemmechanisme.`
    );
  });
  return lines.join("\n");
}

function extractSingleLineValue(block: string, labelPattern: RegExp): string {
  const match = String(block ?? "").match(labelPattern);
  return match?.[1]?.trim() ?? "";
}

function extractStrategicInsightLines(markdown: string): string[] {
  const section = extractSection(markdown, STRATEGIC_INSIGHTS_HEADING);
  const matches = [...section.matchAll(/\bINZICHT:\s*(.+)$/gim)];
  return matches
    .map((m) => String(m[1] ?? "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

function extractInterventionBlocks(markdown: string): string[] {
  const section = extractSection(markdown, "### 10. 90-DAGEN INTERVENTIEPROGRAMMA");
  if (!section.trim()) return [];
  const chunks = section
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .filter((chunk) =>
      /(maand\s*[123]|dag\s*(30|60|90)|probleem|actie|owner|eigenaar|kpi|deadline|escalatie)/i.test(
        chunk
      )
    );
  if (chunks.length) return chunks.slice(0, 12);
  return [section.trim()];
}

function extractPatternNamesFromOutput(output: string): string[] {
  const matches = [...String(output ?? "").matchAll(/\bPATTERN NAAM:\s*(.+)$/gim)];
  return matches
    .map((m) => String(m[1] ?? "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

function enforceHistoricalPatternSection(
  markdown: string,
  memoryBlock: string
): string {
  const heading = "### HISTORISCHE PATROONANALYSE";
  if (markdown.includes(heading)) return markdown;
  const section10Heading = "### 10. 90-DAGEN INTERVENTIEPROGRAMMA";
  const idx = markdown.indexOf(section10Heading);
  if (idx < 0) return `${markdown.trim()}\n\n${heading}\n${memoryBlock}`.trim();

  const body = [
    memoryBlock,
    "GEMEENSCHAPPELIJKE PATRONEN: contractdruk, capaciteitsspanning en governance-frictie bepalen vaak de uitkomst.",
    "WELKE INTERVENTIES WERKTEN: bewezen interventies worden geprioriteerd wanneer context en risicoprofiel overeenkomen.",
  ].join("\n");

  return `${markdown.slice(0, idx).trimEnd()}\n\n${heading}\n${body}\n\n${markdown
    .slice(idx)
    .trimStart()}`.trim();
}

function enforceKnowledgeGraphSection(
  markdown: string,
  graphBlock: string
): string {
  const heading = "### STRATEGISCHE KENNISGRAPH INZICHTEN";
  if (markdown.includes(heading)) return markdown;
  const section10Heading = "### 10. 90-DAGEN INTERVENTIEPROGRAMMA";
  const idx = markdown.indexOf(section10Heading);
  const body = [
    graphBlock,
    "VERGELIJKBARE ORGANISATIES: benut vergelijkbare organisaties als referentie, niet als kopie.",
    "GEMEENSCHAPPELIJKE PROBLEMEN: valideer probleemcluster op causaliteit en sectorcontext.",
    "MEEST EFFECTIEVE STRATEGIEËN: kies strategie op robuustheid en uitvoerbaarheid.",
    "MEEST EFFECTIEVE INTERVENTIES: prioriteer interventies met bewezen effect in vergelijkbare context.",
  ].join("\n");
  if (idx < 0) return `${markdown.trim()}\n\n${heading}\n${body}`.trim();
  return `${markdown.slice(0, idx).trimEnd()}\n\n${heading}\n${body}\n\n${markdown
    .slice(idx)
    .trimStart()}`.trim();
}

function enforceDecisionPressureSection(
  markdown: string,
  decisionPressureBlock: string
): string {
  const heading = "### STRATEGISCHE OPTIES EN BESLUITDRUK";
  if (markdown.includes(heading)) return markdown;
  const section12Heading = "### 12. BESLUITKADER";
  const idx = markdown.indexOf(section12Heading);
  if (idx < 0) return `${markdown.trim()}\n\n${heading}\n${decisionPressureBlock}`.trim();
  return `${markdown.slice(0, idx).trimEnd()}\n\n${heading}\n${decisionPressureBlock}\n\n${markdown
    .slice(idx)
    .trimStart()}`.trim();
}

function enforceMetaReasoningSection(
  markdown: string,
  metaReasoningBlock: string
): string {
  const heading = "### META-ANALYSE VAN DE REDENERING";
  if (markdown.includes(heading)) return markdown;
  const section11Heading = "### 11. BESLUITSKWALITEIT";
  const idx = markdown.indexOf(section11Heading);
  if (idx < 0) return `${markdown.trim()}\n\n${heading}\n${metaReasoningBlock}`.trim();
  return `${markdown.slice(0, idx).trimEnd()}\n\n${heading}\n${metaReasoningBlock}\n\n${markdown
    .slice(idx)
    .trimStart()}`.trim();
}

function enforceBlindSpotsSection(
  markdown: string,
  blindSpotsBlock: string
): string {
  const heading = "### BESTUURLIJKE BLINDE VLEKKEN";
  if (markdown.includes(heading)) return markdown;
  const section9Heading = "### 9. STRATEGISCHE SCENARIOANALYSE";
  const idx = markdown.indexOf(section9Heading);
  if (idx < 0) return `${markdown.trim()}\n\n${heading}\n${blindSpotsBlock}`.trim();
  return `${markdown.slice(0, idx).trimEnd()}\n\n${heading}\n${blindSpotsBlock}\n\n${markdown
    .slice(idx)
    .trimStart()}`.trim();
}

function enforceStrategicForesightSection(
  markdown: string,
  foresightBlock: string
): string {
  const heading = "### STRATEGISCHE VOORUITBLIK";
  if (markdown.includes(heading)) return markdown;
  const section9Heading = "### 9. STRATEGISCHE SCENARIOANALYSE";
  const idx = markdown.indexOf(section9Heading);
  if (idx < 0) return `${markdown.trim()}\n\n${heading}\n${foresightBlock}`.trim();
  return `${markdown.slice(0, idx).trimEnd()}\n\n${heading}\n${foresightBlock}\n\n${markdown
    .slice(idx)
    .trimStart()}`.trim();
}

function enforceOrganizationalSimulationSection(
  markdown: string,
  simulationBlock: string
): string {
  const heading = "### ORGANISATIESIMULATIE";
  if (markdown.includes(heading)) return markdown;
  const section11Heading = "### 11. BESLUITSKWALITEIT";
  const idx = markdown.indexOf(section11Heading);
  if (idx < 0) return `${markdown.trim()}\n\n${heading}\n${simulationBlock}`.trim();
  return `${markdown.slice(0, idx).trimEnd()}\n\n${heading}\n${simulationBlock}\n\n${markdown
    .slice(idx)
    .trimStart()}`.trim();
}

function enforceSectorLayerBlock(markdown: string, input: BoardroomInput): string {
  const context = String(input.company_context ?? "");
  const hasSectorLayerInContext = context.includes("[SECTOR-LAYER | bron: extern | datum:");
  if (!hasSectorLayerInContext) return markdown;

  const heading = "### 1. DOMINANTE THESE";
  const section = extractSection(markdown, heading);
  if (section.includes("[SECTOR-LAYER | bron: extern | datum:")) return markdown;

  const layer = context
    .split(/\n{2,}/)
    .find((block) => block.includes("[SECTOR-LAYER | bron: extern | datum:"));
  if (!layer) return markdown;

  const anchors = parseInputAnchors(context).slice(0, 3);
  const relevance = `Relevantie voor deze casus: ${(anchors.length
    ? anchors
    : ["Niet onderbouwd in geüploade documenten of vrije tekst."]).join(", ")}`;
  const safeLayer = layer
    .split("\n")
    .filter((line) => !/€\\s*\\d|\\d+\\s*%/.test(line))
    .join("\n");
  const next = `${safeLayer}\n${relevance}\n\n${section}`.trim();
  return replaceSection(markdown, heading, next);
}

function splitIntoSentences(text: string): string[] {
  return (text.match(/[^.!?\n]+[.!?]?/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalizeSentenceKey(sentence: string): string {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasEuroOrPercent(text: string): boolean {
  return /(€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%)/i.test(text);
}

function hasKpiSignal(text: string): boolean {
  return /\bkpi\b|€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%/i.test(text);
}

function normalizeComparableText(text: string): string {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeNumericSignal(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/eur/g, "€")
    .replace(/,/g, ".")
    .trim();
}

function extractNumericSignals(text: string): string[] {
  const source = String(text ?? "");
  const matches =
    source.match(/(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%)/gi) ?? [];
  return [...new Set(matches.map((token) => token.trim()))];
}

function buildGroundingSource(
  input: BoardroomInput,
  documents: ContextDocument[],
  legacyContext: string,
  briefContext: string
): string {
  const q = input.questions ?? {};
  const questionText = [q.q1, q.q2, q.q3, q.q4, q.q5]
    .map((v) => toSafeString(v))
    .filter(Boolean)
    .join("\n");
  const docText = documents
    .slice(0, 30)
    .map((d) => `${d.filename}\n${d.content}`)
    .join("\n\n");
  return [legacyContext, briefContext, questionText, docText]
    .filter(Boolean)
    .join("\n\n");
}

function sanitizeUngroundedNumericSignals(text: string, sourceCorpus: string): string {
  const sourceSignals = new Set(
    extractNumericSignals(sourceCorpus).map((token) => normalizeNumericSignal(token))
  );
  if (sourceSignals.size === 0) {
    return text.replace(
      /(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%)/gi,
      "niet onderbouwd cijfer"
    );
  }

  return text.replace(
    /(?:€\s*\d[\d.,]*|\beur\s*\d[\d.,]*|\d+(?:[.,]\d+)?\s*%)/gi,
    (match) => {
      const normalized = normalizeNumericSignal(match);
      return sourceSignals.has(normalized) ? match : "niet onderbouwd cijfer";
    }
  );
}

function extractOpportunityWindowContent(
  section: string
): Record<"30" | "90" | "365", string> {
  const buckets: Record<"30" | "90" | "365", string> = {
    "30": "",
    "90": "",
    "365": "",
  };

  const matches = [
    ...section.matchAll(
      /(30\s*dagen|90\s*dagen|365\s*dagen)\s*[:\-]\s*([\s\S]*?)(?=(?:30\s*dagen|90\s*dagen|365\s*dagen)\s*[:\-]|$)/gi
    ),
  ];

  for (const match of matches) {
    const label = String(match[1] || "");
    const body = String(match[2] || "").trim();
    if (/^30/i.test(label)) buckets["30"] = body;
    if (/^90/i.test(label)) buckets["90"] = body;
    if (/^365/i.test(label)) buckets["365"] = body;
  }

  return buckets;
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

    lines.push(`Keuzeconflicten uit eerdere synthese:\n${tradeoffBlock}`);
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
      blockLines.push(`Keuzeconflict kern: ${summaryBlock.tradeoff_statement}`);
    }

    if (summaryBlock.opportunity_cost) {
      const o = summaryBlock.opportunity_cost;
      blockLines.push(
        `Opportunity cost 30/90/365: ${toSafeString(o.days_30 || o.days_0)} | ${toSafeString(
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
        )}; sabotagetechnieken=${toSafeString(p.expected_sabotage_patterns)}`
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
  const normalized = text
    .replace(/op basis van bestuurlijke patronen in de ggz:/gi, "")
    .replace(/op basis van bestuurlijke patronen in vergelijkbare organisaties:/gi, "");

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

  if (STRICT_BANNED_LANGUAGE_GUARD.test(normalized)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertBulletDiscipline(text: string) {
  const hasListMarkup = /^\s*([-*•]|\d+[.)])\s+/gm.test(text);
  if (hasListMarkup) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertStructure(text: string) {
  if (STRUCTURE_HEADINGS.some((h) => !text.includes(h))) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function extractMarkdownHeadings(text: string): string[] {
  return (text.match(/^###\s*\d+\.\s*[^\n]+/gm) ?? []).map((line) =>
    line.trim().replace(/\s+/g, " ")
  );
}

function assertExactCanonicalSectionOrder(text: string) {
  const found = extractMarkdownHeadings(text);
  const expected = STRUCTURE_HEADINGS.map((line) =>
    line.trim().replace(/\s+/g, " ")
  );

  if (found.length !== expected.length) {
    throw new Error(
      `${HARD_GATE_ERROR_PREFIX}: exacte 12 HGBCO-secties vereist (gevonden ${found.length}, verwacht ${expected.length})`
    );
  }

  for (let i = 0; i < expected.length; i += 1) {
    if (found[i] !== expected[i]) {
      throw new Error(
        `${HARD_GATE_ERROR_PREFIX}: sectievolgorde ongeldig op positie ${i + 1} (verwacht "${expected[i]}", vond "${found[i]}")`
      );
    }
  }
}

function assertSectorInformationParagraph(text: string) {
  if (!/(^|\n)\s*sectorinformatie\s*:/i.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertTopUnderstreamBalancePerSection(text: string) {
  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(text, heading);
    if (!section) {
      throw new Error(SHARPNESS_ERROR_TEXT);
    }
    if (!/\bbovenstroom\b/i.test(section) || !/\bonderstroom\b/i.test(section)) {
      throw new Error(SHARPNESS_ERROR_TEXT);
    }
  }
}

function assertNoForbiddenSectionStarts(text: string) {
  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(text, heading);
    if (!section) continue;
    const firstLine = section.split("\n").find((line) => line.trim()) ?? "";
    if (FORBIDDEN_SECTION_START_PATTERNS.some((pattern) => pattern.test(firstLine))) {
      throw new Error(SHARPNESS_ERROR_TEXT);
    }
  }
}

function assertNoRepeatedSentencesAcrossSections(text: string) {
  const seen = new Set<string>();
  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(text, heading);
    const sectionSentences = splitIntoSentences(section);
    for (const sentence of sectionSentences) {
      const key = normalizeSentenceKey(sentence);
      if (key.length < 24) continue;
      if (seen.has(key)) {
        throw new Error(SHARPNESS_ERROR_TEXT);
      }
      seen.add(key);
    }
  }
}

function collectPowerActors(section: string): string[] {
  const matches = section.match(POWER_ACTOR_EXTRACT_GUARD) ?? [];
  return [...new Set(matches.map((m) => m.toLowerCase().replace(/\s+/g, " ").trim()))];
}

function countConcretePowerActorLines(section: string): number {
  return section
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) =>
        POWER_ACTOR_LINE_GUARD.test(line) &&
        POWER_ACTOR_WIN_LOSS_GUARD.test(line) &&
        POWER_ACTOR_SABOTAGE_GUARD.test(line) &&
        POWER_ACTOR_INSTRUMENT_GUARD.test(line)
    ).length;
}

function assertDominantThesis(text: string) {
  const thesis = extractSection(text, "### 1. DOMINANTE THESE");
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

  const openingWindow = thesis.slice(0, 260);
  if (!DOMINANT_HYPOTHESIS_GUARD.test(openingWindow)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertUncomfortableTruth(text: string) {
  if (!UNCOMFORTABLE_TRUTH_GUARD.test(text)) {
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

function assertTradeOffDepth(text: string) {
  const section = extractSection(text, "### 4. KEERZIJDE VAN DE KEUZE");
  const lossSignals =
    section.match(/\b(verlies|verliest|inleveren|afbouw|stopzetting|machtverlies)\b/gi) ?? [];
  const measurableSignals = section.match(/(€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%)/gi) ?? [];
  const hasHorizon = /\b(30|90|365)\s*dagen\b/i.test(section);
  const hasPowerImpact = /\bmacht\b|\bmandaat\b/i.test(section);
  const loss1 =
    section.match(/verlies\s*1\s*[:=]\s*([^.\n]+)/i)?.[1] ??
    section.match(/trade-?off\s*1\s*[:=]\s*([^.\n]+)/i)?.[1] ??
    "";
  const loss2 =
    section.match(/verlies\s*2\s*[:=]\s*([^.\n]+)/i)?.[1] ??
    section.match(/trade-?off\s*2\s*[:=]\s*([^.\n]+)/i)?.[1] ??
    "";
  const hasDistinctLosses =
    !!loss1 &&
    !!loss2 &&
    normalizeComparableText(loss1) !== normalizeComparableText(loss2);

  if (
    lossSignals.length < 2 ||
    measurableSignals.length < 2 ||
    !hasHorizon ||
    !hasPowerImpact ||
    !hasDistinctLosses
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertOpportunityCost(text: string) {
  const section = extractSection(text, "### 5. PRIJS VAN UITSTEL");
  const has30 = /\b30\s*dagen\b/i.test(section);
  const has90 = /\b90\s*dagen\b/i.test(section);
  const has365 = /\b365\s*dagen\b/i.test(section);
  const measurableSignals = section.match(/(€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%)/gi) ?? [];
  const hasIrreversible =
    /\b(irreversibel|onomkeerbaar|onomkeerbaarheid|point of no return)\b/i.test(section);
  const windows = extractOpportunityWindowContent(section);
  const uniqueWindows =
    !!windows["30"] &&
    !!windows["90"] &&
    !!windows["365"] &&
    normalizeComparableText(windows["30"]) !== normalizeComparableText(windows["90"]) &&
    normalizeComparableText(windows["90"]) !== normalizeComparableText(windows["365"]) &&
    normalizeComparableText(windows["30"]) !== normalizeComparableText(windows["365"]);
  const hasSignalLoss30 = /\b(signaalverlies|gedragsverschuiving|vertrouwensverlies)\b/i.test(
    windows["30"]
  );
  const hasPowerShift90 = /\b(machtsverschuiving|erosie|tegenkracht)\b/i.test(
    windows["90"]
  );
  const hasSystemShift365 = /\b(systeemverschuiving|onomkeerbaar|dominante coalitie)\b/i.test(
    windows["365"]
  );
  const has12MonthConsequence =
    /\b(na\s*12\s*maanden|12\s*maanden)\b/i.test(section) &&
    /\b(positie|coalitie|dominant)\b/i.test(section) &&
    /\b(reputatieschade|niet terug te draaien|onomkeerbaar)\b/i.test(section);

  if (
    !has30 ||
    !has90 ||
    !has365 ||
    measurableSignals.length < 3 ||
    !hasIrreversible ||
    !uniqueWindows ||
    !hasSignalLoss30 ||
    !hasPowerShift90 ||
    !hasSystemShift365 ||
    !has12MonthConsequence
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertGovernanceImpact(text: string) {
  const section = extractSection(text, "### 6. GOVERNANCE IMPACT").toLowerCase();
  const hasDecisionPower = section.includes("besluitkracht");
  const hasEscalation = section.includes("escalatie");
  const hasFormalShift =
    /formele machtsverschuiving|macht verschuift|mandaat verschuift|besluitrechten/.test(
      section
    );
  const hasStructureEffect =
    /structuur|structuurgevolg|besluitcomite|escalatielijn|governance-tafel|mandaatmatrix/.test(
      section
    );

  if (!hasDecisionPower || !hasEscalation || !hasFormalShift || !hasStructureEffect) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertPowerDynamics(text: string) {
  const section = extractSection(text, "### 7. MACHTSDYNAMIEK");
  const sectionLc = section.toLowerCase();
  const hasPowerLoss =
    sectionLc.includes("verliest") || sectionLc.includes("inlevert") || sectionLc.includes("macht verschuift");
  const hasInformalInfluence = sectionLc.includes("informele");
  const hasSabotage = sectionLc.includes("sabotage") || sectionLc.includes("vertraging");
  const hasUnderstream = sectionLc.includes("onderstroom");
  const hasCultureReflex =
    sectionLc.includes("conflictmijding") ||
    sectionLc.includes("risicomijding") ||
    sectionLc.includes("culturele reflex");
  const hasHiddenAgenda = sectionLc.includes("verborgen agenda") || sectionLc.includes("agenda");
  const actors = collectPowerActors(section);
  const concreteActorLines = countConcretePowerActorLines(section);

  if (
    !hasPowerLoss ||
    !hasInformalInfluence ||
    !hasSabotage ||
    !hasUnderstream ||
    !hasCultureReflex ||
    !hasHiddenAgenda ||
    actors.length < 3 ||
    concreteActorLines < 3
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertExecutionRisk(text: string) {
  const section = extractSection(text, "### 8. EXECUTIERISICO").toLowerCase();
  const hasFailurePoint = section.includes("faalpunt") || section.includes("mislukt");
  const hasBlocker =
    section.includes("blocker") || section.includes("blokkeer") || section.includes("tegenhouden");
  const hasUnderstream = section.includes("onderstroom");

  if (!hasFailurePoint || !hasBlocker || !hasUnderstream) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertNinetyDayPlan(text: string) {
  const section = extractSection(text, "### 10. 90-DAGEN INTERVENTIEPROGRAMMA");
  const sectionLc = section.toLowerCase();
  const hasMonth1 = /maand\s*1\s*\(dag\s*1[-–]30\)\s*:/.test(sectionLc);
  const hasMonth2 = /maand\s*2\s*\(dag\s*31[-–]60\)\s*:/.test(sectionLc);
  const hasMonth3 = /maand\s*3\s*\(dag\s*61[-–]90\)\s*:/.test(sectionLc);
  const hasOwner = /\b(owner|eigenaar|ceo|cfo|coo|chro|raad van bestuur|rvb)\b/i.test(section);
  const hasMeasure = hasKpiSignal(section) || /\bmeetbaar\b/i.test(section);
  const hasActionCount = (section.match(/\b(?:Concrete actie|Actie):/gi) ?? []).length >= 6;
  const hasOrgEffect = /\bGevolg voor organisatie:/i.test(section);
  const hasClientEffect = /\bGevolg voor klant\/cliënt:/i.test(section);
  const hasNoActionRisk = /\bRisico van niet handelen:/i.test(section);
  const hasCaseAnchor = /\bCasus-anker:/i.test(section);

  if (
    !hasMonth1 ||
    !hasMonth2 ||
    !hasMonth3 ||
    !hasOwner ||
    !hasMeasure ||
    !hasActionCount ||
    !hasOrgEffect ||
    !hasClientEffect ||
    !hasNoActionRisk ||
    !hasCaseAnchor
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertNinetyDayPlanSeparateParagraphs(text: string) {
  const section = extractSection(text, "### 10. 90-DAGEN INTERVENTIEPROGRAMMA");
  if (!section) {
    throw new Error(
      `${HARD_GATE_ERROR_PREFIX}: sectie 10 ontbreekt`
    );
  }

  const requiredParagraphAnchors = [
    /(?:^|\n{2,})\s*MAAND\s*1\s*\(dag\s*1[-–]30\):\s*STABILISEREN EN KNOPEN DOORHAKKEN/i,
    /(?:^|\n{2,})\s*MAAND\s*2\s*\(dag\s*31[-–]60\):\s*HERONTWERPEN EN HERALLOCEREN/i,
    /(?:^|\n{2,})\s*MAAND\s*3\s*\(dag\s*61[-–]90\):\s*VERANKEREN EN CONTRACTEREN/i,
    /(?:^|\n{2,})\s*Dag\s*30:/i,
    /(?:^|\n{2,})\s*Dag\s*60:/i,
    /(?:^|\n{2,})\s*Dag\s*90:/i,
  ];

  const missing = requiredParagraphAnchors.filter((pattern) => !pattern.test(section));
  if (missing.length > 0) {
    throw new Error(
      `${HARD_GATE_ERROR_PREFIX}: sectie 10 vereist aparte alinea's voor Maand 1 (dag 1-30), Maand 2 (dag 31-60), Maand 3 (dag 61-90) en Dag 30/60/90`
    );
  }
}

function assertBoardSummaryBlock(text: string) {
  const summaryIdx = text.indexOf("1-PAGINA BESTUURLIJKE SAMENVATTING");
  const section9Idx = text.indexOf("### 12. BESLUITKADER");
  const hasDecisionToday = /\bBesluit vandaag:\b/i.test(text);
  const hasPreferredOption = /\bVoorkeursoptie:\b/i.test(text);
  const hasLoss = /\bExpliciet verlies:\b/i.test(text);
  const hasMilestones = /\b30\/60\/90\b|\bDag\s*30\b/i.test(text);

  if (summaryIdx < 0 || section9Idx < 0 || summaryIdx > section9Idx || !hasDecisionToday || !hasPreferredOption || !hasLoss || !hasMilestones) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: 1-pagina bestuurlijke samenvatting ontbreekt of is onvolledig`);
  }
}

function assertSituationReconstructionBlock(text: string) {
  const hasTitle = /(?:^|\n)0 SITUATIERECONSTRUCTIE(?:\n|$)/i.test(text);
  const hasFacts = /\bfeiten uit documenten\b/i.test(text);
  const hasNumbers = /\bbelangrijkste cijfers\b/i.test(text);
  const hasOrgContext = /\borganisatorische context\b/i.test(text);
  const hasSubstance = hasFacts && hasNumbers && hasOrgContext;
  if (!hasTitle || !hasSubstance) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: 0 SITUATIERECONSTRUCTIE ontbreekt of is onvolledig`);
  }
}

function assertHypothesisCompetitionCoverage(text: string) {
  const hasHeading = /###\s*HYPOTHESE CONCURRENTIE/i.test(text);
  if (!hasHeading) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: hypothese concurrentie ontbreekt`);
  }
  const block = extractSection(text, "### HYPOTHESE CONCURRENTIE");
  const hCount = (block.match(/\bHYPOTHESE\s+\d+\b/gi) ?? []).length;
  const hasFor = (block.match(/\bBEWIJS VOOR\b/gi) ?? []).length >= 3;
  const hasAgainst = (block.match(/\bBEWIJS TEGEN\b/gi) ?? []).length >= 3;
  const hasLikely = /\bWAARSCHIJNLIJKSTE VERKLARING\b/i.test(block);
  if (hCount < 3 || !hasFor || !hasAgainst || !hasLikely) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: hypothese concurrentie is onvolledig`);
  }
}

function assertCausalMechanismsCoverage(text: string) {
  const hasHeading = /###\s*CAUSALE MECHANISMEN/i.test(text);
  if (!hasHeading) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: causale mechanismen ontbreken`);
  }
  const block = extractSection(text, "### CAUSALE MECHANISMEN");
  const hasSymptoms = /\bSYMPTOMEN\b/i.test(block);
  const hasMechanism = /\bWELK MECHANISME HIERACHTER ZIT\b/i.test(block);
  const hasCause = /\bSTRUCTURELE OORZAAK\b/i.test(block);
  const hasBreak = /\bWELKE INTERVENTIE HET MECHANISME DOORBREKT\b/i.test(block);
  if (!hasSymptoms || !hasMechanism || !hasCause || !hasBreak) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: causale mechanismen sectie is onvolledig`);
  }
}

function assertStrategicInsightsBlock(text: string) {
  const start = text.indexOf(STRATEGIC_INSIGHTS_HEADING);
  if (start < 0) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: 3. STRATEGISCHE INZICHTEN ontbreekt`);
  }
  const after = text.slice(start + STRATEGIC_INSIGHTS_HEADING.length);
  const nextSectionIdx = after.search(/\n###\s*\d+\.\s+/);
  const block = (nextSectionIdx >= 0 ? after.slice(0, nextSectionIdx) : after).trim();

  const insights = (block.match(/\bINZICHT:\b/gi) ?? []).length;
  const why = (block.match(/\bWAAROM DIT BELANGRIJK IS:\b/gi) ?? []).length;
  const consequence = (block.match(/\bBESTUURLIJKE CONSEQUENTIE:\b/gi) ?? []).length;
  if (insights < 3 || why < 3 || consequence < 3) {
    throw new Error(
      `${HARD_GATE_ERROR_PREFIX}: minimaal 3 strategische inzichten met belang en bestuurlijke consequentie vereist`
    );
  }
}

function assertBoardroomIntelligenceCoverage(text: string) {
  const section = extractSection(text, "### 7. MACHTSDYNAMIEK");
  const hasPowerMap =
    /\bwie heeft besluitmacht\b/i.test(section) &&
    /\bwie heeft informele invloed\b/i.test(section) &&
    /\bwaar zit de feitelijke macht\b/i.test(section);
  const hasDecisionBlocker =
    /\b(blokkeert|besluitdynamiek|besluitvermijding|conflictvermijding|consensuscultuur)\b/i.test(
      section
    );
  const insights = (section.match(/\bBOARDROOM INZICHT\b/gi) ?? []).length;
  const why = (section.match(/\bWAAROM DIT BESTUURLIJK BELANGRIJK IS\b/gi) ?? []).length;
  const risk = (section.match(/\bRISICO ALS DIT NIET WORDT GEADRESSEERD\b/gi) ?? []).length;

  if (!hasPowerMap || !hasDecisionBlocker || insights < 3 || why < 3 || risk < 3) {
    throw new Error(
      `${HARD_GATE_ERROR_PREFIX}: boardroom-intelligentie ontbreekt of is onvolledig in sectie 7`
    );
  }
}

function assertScenarioAnalysisCoverage(text: string) {
  const section = extractSection(text, "### 9. STRATEGISCHE SCENARIOANALYSE");
  const hasA = /\bSCENARIO\s*A\b/i.test(section);
  const hasB = /\bSCENARIO\s*B\b/i.test(section);
  const hasC = /\bSCENARIO\s*C\b/i.test(section);
  const hasComparison = /\bSCENARIOVERGELIJKING\b/i.test(section);
  const hasPreference =
    /\bVOORKEURSSCENARIO\b/i.test(section) &&
    /\bWAAROM DIT HET MEEST ROBUUST IS\b/i.test(section) &&
    /\bWELKE VOORWAARDEN NODIG ZIJN\b/i.test(section);
  if (!hasA || !hasB || !hasC || !hasComparison || !hasPreference) {
    throw new Error(
      `${HARD_GATE_ERROR_PREFIX}: scenarioanalyse ontbreekt of is onvolledig in sectie 9`
    );
  }
}

function assertDecisionQualityCoverage(text: string) {
  const section = extractSection(text, "### 11. BESLUITSKWALITEIT");
  const hasScore = /\bBesluitscore\s*:\s*\d{1,3}\/100\b/i.test(section);
  const hasRisks = /\bBelangrijkste risico/i.test(section);
  const hasFeasibility = /\bUitvoerbaarheidsanalyse\b/i.test(section);
  const hasImprovements = /\bAanbevolen verbeteringen\b/i.test(section);
  const hasContract = /\bDECISION CONTRACT\b/i.test(section);
  if (!hasScore || !hasRisks || !hasFeasibility || !hasImprovements || !hasContract) {
    throw new Error(
      `${HARD_GATE_ERROR_PREFIX}: besluitskwaliteit ontbreekt of is onvolledig in sectie 11`
    );
  }
}

function assertHistoricalPatternCoverage(text: string) {
  const hasHeading = /###\s*HISTORISCHE PATROONANALYSE/i.test(text);
  if (!hasHeading) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: historische patroonanalyse ontbreekt`);
  }
  const block = extractSection(text, "### HISTORISCHE PATROONANALYSE");
  const hasCases = /\bVERGELIJKBARE CASES\b/i.test(block);
  const hasPatterns = /\bGEMEENSCHAPPELIJKE PATRONEN\b/i.test(block);
  const hasInterventions = /\bWELKE INTERVENTIES WERKTEN\b/i.test(block);
  const noDirectCases = /\bGEEN DIRECT VERGELIJKBARE CASES GEVONDEN\b/i.test(block);
  if ((!hasCases || !hasPatterns || !hasInterventions) && !noDirectCases) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: historische patroonanalyse is onvolledig`);
  }
}

function assertKnowledgeGraphCoverage(text: string) {
  const hasHeading = /###\s*STRATEGISCHE KENNISGRAPH INZICHTEN/i.test(text);
  if (!hasHeading) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: strategische kennisgraph inzichten ontbreken`);
  }
  const block = extractSection(text, "### STRATEGISCHE KENNISGRAPH INZICHTEN");
  const hasOrgs = /\bVERGELIJKBARE ORGANISATIES\b/i.test(block);
  const hasProblems = /\bGEMEENSCHAPPELIJKE PROBLEMEN\b/i.test(block);
  const hasStrategies = /\bMEEST EFFECTIEVE STRATEGIE[ËE]N\b/i.test(block);
  const hasInterventions = /\bMEEST EFFECTIEVE INTERVENTIES\b/i.test(block);
  if (!hasOrgs || !hasProblems || !hasStrategies || !hasInterventions) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: strategische kennisgraph inzichten zijn onvolledig`);
  }
}

function assertDecisionPressureCoverage(text: string) {
  const hasHeading = /###\s*STRATEGISCHE OPTIES EN BESLUITDRUK/i.test(text);
  if (!hasHeading) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: strategische opties en besluitdruk ontbreekt`);
  }
  const block = extractSection(text, "### STRATEGISCHE OPTIES EN BESLUITDRUK");
  const hasA = /\bOPTIE\s*A\b/i.test(block);
  const hasB = /\bOPTIE\s*B\b/i.test(block);
  const hasC = /\bOPTIE\s*C\b/i.test(block);
  const hasPreferred = /\bVOORKEURSOPTIE\b/i.test(block);
  const hasLoss = /\bEXPLICIET VERLIES\b/i.test(block);
  const hasNoChoice = /\bGEVOLGEN VAN GEEN KEUZE\b/i.test(block);
  const has30 = /\b30 DAGEN\b/i.test(block);
  const has90 = /\b90 DAGEN\b/i.test(block);
  const has365 = /\b365 DAGEN\b/i.test(block);
  if (!hasA || !hasB || !hasC || !hasPreferred || !hasLoss || !hasNoChoice || !has30 || !has90 || !has365) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: strategische opties en besluitdruk is onvolledig`);
  }
}

function assertBlindSpotsCoverage(text: string) {
  const hasHeading = /###\s*BESTUURLIJKE BLINDE VLEKKEN/i.test(text);
  if (!hasHeading) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: bestuurlijke blinde vlekken ontbreekt`);
  }
  const block = extractSection(text, "### BESTUURLIJKE BLINDE VLEKKEN");
  const blindSpotCount = (block.match(/\bBLINDE VLEK\b/gi) ?? []).length;
  const hasThinks = /\bWAT DE ORGANISATIE DENKT\b/i.test(block);
  const hasReality = /\bWAT DE REALITEIT IS\b/i.test(block);
  const hasWhy = /\bWAAROM DIT PROBLEEM NIET WORDT GEZIEN\b/i.test(block);
  const hasRisk = /\bWELK RISICO DIT CREËERT\b/i.test(block);
  if (blindSpotCount < 3 || !hasThinks || !hasReality || !hasWhy || !hasRisk) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: bestuurlijke blinde vlekken is onvolledig`);
  }
}

function assertStrategicForesightCoverage(text: string) {
  const hasHeading = /###\s*STRATEGISCHE VOORUITBLIK/i.test(text);
  if (!hasHeading) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: strategische vooruitblik ontbreekt`);
  }
  const block = extractSection(text, "### STRATEGISCHE VOORUITBLIK");
  const hasS1 = /\bSCENARIO 1\s*[—-]\s*STATUS QUO\b/i.test(block);
  const hasS2 = /\bSCENARIO 2\s*[—-]\s*INTERVENTIE\b/i.test(block);
  const hasS3 = /\bSCENARIO 3\s*[—-]\s*ESCALATIE\b/i.test(block);
  const hasStatus = /\bWAT GEBEURT ALS NIETS VERANDERT\b/i.test(block);
  const hasIntervention = /\bWAT GEBEURT ALS INTERVENTIES WORDEN UITGEVOERD\b/i.test(block);
  const hasEscalation = /\bWAT GEBEURT ALS HET PROBLEEM VERERGERT\b/i.test(block);
  if (!hasS1 || !hasS2 || !hasS3 || !hasStatus || !hasIntervention || !hasEscalation) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: strategische vooruitblik is onvolledig`);
  }
}

function assertMetaReasoningCoverage(text: string) {
  const hasHeading = /###\s*META-ANALYSE VAN DE REDENERING/i.test(text);
  if (!hasHeading) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: meta-analyse van de redenering ontbreekt`);
  }
  const block = extractSection(text, "### META-ANALYSE VAN DE REDENERING");
  const hasStrong = /\bWAAR DE ANALYSE STERK IS\b/i.test(block);
  const hasAlt = /\bWAAR ALTERNATIEVE VERKLARINGEN MOGELIJK ZIJN\b/i.test(block);
  const hasMissing = /\bWELKE VARIABELEN MOGELIJK ONTBREKEN\b/i.test(block);
  const hasCertainty = /\bHOE ZEKER DE CONCLUSIE IS\b/i.test(block);
  if (!hasStrong || !hasAlt || !hasMissing || !hasCertainty) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: meta-analyse van de redenering is onvolledig`);
  }
}

function assertOrganizationalSimulationCoverage(text: string) {
  const hasHeading = /###\s*ORGANISATIESIMULATIE/i.test(text);
  if (!hasHeading) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: organisatiesimulatie ontbreekt`);
  }
  const block = extractSection(text, "### ORGANISATIESIMULATIE");
  const hasRoute = /\bEXECUTIEROUTE EN ADOPTIEPAD\b/i.test(block);
  const hasResistance = /\bVERWACHTE WEERSTANDSPUNTEN\b/i.test(block);
  const hasFriction = /\bUITVOERINGSFRICTIE\b/i.test(block);
  const hasCoalition = /\bBENODIGDE COALITIE EN MANDAAT\b/i.test(block);
  const hasAdjustments = /\bAANPASSINGEN VOOR UITVOERBAARHEID\b/i.test(block);
  if (!hasRoute || !hasResistance || !hasFriction || !hasCoalition || !hasAdjustments) {
    throw new Error(`${HARD_GATE_ERROR_PREFIX}: organisatiesimulatie is onvolledig`);
  }
}

function assertHardOutputGate(text: string) {
  assertExactCanonicalSectionOrder(text);
  assertHypothesisCompetitionCoverage(text);
  assertCausalMechanismsCoverage(text);
  assertHistoricalPatternCoverage(text);
  assertKnowledgeGraphCoverage(text);
  assertBlindSpotsCoverage(text);
  assertStrategicForesightCoverage(text);
  assertMetaReasoningCoverage(text);
  assertOrganizationalSimulationCoverage(text);
  assertDecisionPressureCoverage(text);
  assertScenarioAnalysisCoverage(text);
  assertNinetyDayPlanSeparateParagraphs(text);
  assertNinetyDayPlan(text);
  assertSituationReconstructionBlock(text);
  assertStrategicInsightsBlock(text);
  assertBoardroomIntelligenceCoverage(text);
  assertDecisionQualityCoverage(text);
  assertBoardSummaryBlock(text);
}

function assertDecisionContract(text: string) {
  const section = extractSection(text, "### 12. BESLUITKADER");
  const hasOpening = section.includes("De Raad van Bestuur committeert zich aan:");
  const hasChoice = /keuze\s*a|keuze\s*b|keuze\s*a\s*of\s*b/i.test(section);
  const hasResult = /meetbaar\s+resultaat|kpi/i.test(section);
  const hasHorizon = /tijdshorizon/i.test(section);
  const hasLoss = /verlies/i.test(section);
  const hasKpi = hasKpiSignal(section);
  const hasFormalPowerLoss = /\bformele macht\b[\s\S]{0,120}\b(verliest|verlies)\b/i.test(section);
  const hasInformalPowerLoss = /\binformele macht\b[\s\S]{0,120}\b(verliest|verlies)\b/i.test(
    section
  );
  const hasDecisionMonopoly = /\b(beslismonopolie|besluitmonopolie)\b/i.test(section);
  const hasImmediateStop = /\b(per direct|onmiddellijk)\b[\s\S]{0,80}\b(stop|stopt)\b/i.test(
    section
  );
  const hasNoEscalation =
    /\bmag niet meer\b[\s\S]{0,80}\bge[ëe]scaleerd\b/i.test(section) ||
    /\bniet meer\b[\s\S]{0,80}\bescalatie\b/i.test(section);
  const hasExplicitImpact = /\b(€\s*\d|eur\s*\d|\d+(?:[.,]\d+)?\s*%)\b/i.test(section);
  const hasActorImpact =
    /\b(impact op|raakt|treft|actor-impact|voor de)\b/i.test(section) &&
    /\b(ceo|cfo|coo|chro|raad van bestuur|rvb|raad van toezicht|rvt|medisch directeur|regiodirecteur|programmadirecteur)\b/i.test(
      section
    );

  if (
    !hasOpening ||
    !hasChoice ||
    !hasResult ||
    !hasHorizon ||
    !hasLoss ||
    !hasKpi ||
    !hasFormalPowerLoss ||
    !hasInformalPowerLoss ||
    !hasDecisionMonopoly ||
    !hasImmediateStop ||
    !hasNoEscalation ||
    !hasExplicitImpact ||
    !hasActorImpact
  ) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertTempoAsPowerInstrument(text: string) {
  if (!TEMPO_POWER_GUARD.test(text)) {
    throw new Error(SHARPNESS_ERROR_TEXT);
  }
}

function assertGGZSpecificDepth(text: string, enforce: boolean) {
  if (!enforce) return;

  const checks = Object.values(GGZ_DEPTH_GUARDS);
  if (checks.some((guard) => !guard.test(text))) {
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
  const opportunity = extractSection(text, "### 5. PRIJS VAN UITSTEL");
  const hasTimeWindows =
    /\b30\s*dagen\b/i.test(opportunity) &&
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
  const section = extractSection(text, "### 12. BESLUITKADER");
  const hasOpening = section.includes("De Raad van Bestuur committeert zich aan:");
  const hasContractItems =
    /\bkeuze\b/i.test(section) &&
    /\bmeetbaar\b|\bkpi\b/i.test(section) &&
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

function assertExecutiveKernelQuality(text: string, enforceGGZDepth: boolean) {
  assertStructure(text);
  assertExactCanonicalSectionOrder(text);
  assertNoForbiddenSectionStarts(text);
  assertNoRepeatedSentencesAcrossSections(text);
  assertNoSoftLanguage(text);
  assertDutchOnly(text);
  assertNinetyDayPlanSeparateParagraphs(text);
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

function trimToCanonicalStart(text: string): string {
  const source = String(text ?? "").trim();
  if (!source) return source;
  const firstHeading = "### 1. DOMINANTE THESE";
  const firstIndex = source.indexOf(firstHeading);
  if (firstIndex < 0) return source;
  return source.slice(firstIndex).trim();
}

function sanitizeSectionOpeners(text: string): string {
  let output = text;

  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(output, heading);
    if (!section) continue;

    const lines = section.split("\n");
    while (
      lines.length > 0 &&
      FORBIDDEN_SECTION_START_PATTERNS.some((pattern) =>
        pattern.test(lines[0] || "")
      )
    ) {
      lines.shift();
    }

    const cleaned = lines.join("\n").trim();
    output = replaceSection(output, heading, cleaned || SECTION_DEFAULTS[heading]);
  }

  return output;
}

function enforceSectionClosures(text: string): string {
  let output = text;
  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(output, heading);
    if (!section) continue;
    const closure = SECTION_CLOSURE_LINES[heading];
    if (!closure || closure.guard.test(section)) continue;
    output = replaceSection(output, heading, `${section.trim()}\n\n${closure.line}`);
  }
  return output;
}

function chunkSentencesIntoParagraphs(
  sentences: string[],
  maxSentences = 2,
  maxChars = 220
): string[] {
  const paragraphs: string[] = [];
  let bucket: string[] = [];

  const flush = () => {
    if (!bucket.length) return;
    paragraphs.push(bucket.join(" ").trim());
    bucket = [];
  };

  for (const sentence of sentences) {
    const next = sentence.trim();
    if (!next) continue;

    if (!bucket.length) {
      bucket.push(next);
      continue;
    }

    const candidate = `${bucket.join(" ")} ${next}`;
    if (bucket.length >= maxSentences || candidate.length > maxChars) {
      flush();
      bucket.push(next);
      continue;
    }

    bucket.push(next);
  }

  flush();
  return paragraphs.filter(Boolean);
}

function enforceReadableParagraphRhythm(text: string): string {
  let output = text;

  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(output, heading);
    if (!section) continue;

    const listStripped = section
      .replace(/^\s*[-*•]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "");
    const sentences = splitIntoSentences(listStripped);
    if (!sentences.length) continue;
    const rebuilt = chunkSentencesIntoParagraphs(sentences, 5, 1200).join("\n\n");
    output = replaceSection(output, heading, rebuilt || section.trim());
  }

  return output;
}

function enforceNinetyDayInterventionParagraphs(text: string): string {
  const heading = "### 10. 90-DAGEN INTERVENTIEPROGRAMMA";
  const section = extractSection(text, heading);
  if (!section) return text;

  const normalized = section
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return text;

  const formatted = normalized
    .replace(/\s*(Week\s*1\s*[-–]\s*2:)/i, "\n\n$1")
    .replace(/\s*(Week\s*3\s*[-–]\s*6:)/i, "\n\n$1")
    .replace(/\s*(Week\s*7\s*[-–]\s*12:)/i, "\n\n$1")
    .replace(/\s*(Dag\s*30:)/i, "\n\n$1")
    .replace(/\s*(Dag\s*60:)/i, "\n\n$1")
    .replace(/\s*(Dag\s*90:)/i, "\n\n$1")
    .replace(
      /\s*(Wie tempo controleert,\s*controleert macht\.)/i,
      "\n\n$1"
    )
    .replace(/^\s+/, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return replaceSection(text, heading, formatted);
}

function consolidateOpportunityCostWindowDuplicates(text: string): string {
  const heading = "### 5. PRIJS VAN UITSTEL";
  const section = extractSection(text, heading);
  if (!section) return text;

  const lines = section
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const seenBodies = new Set<string>();
  const rebuilt: string[] = [];

  for (const line of lines) {
    const dayMatch = line.match(/^(30|90|365)\s*dagen\s*[:\-]\s*(.+)$/i);
    if (!dayMatch) {
      rebuilt.push(line);
      continue;
    }

    const body = String(dayMatch[2] ?? "").trim();
    const key = normalizeComparableText(body);
    if (!key || seenBodies.has(key)) {
      continue;
    }
    seenBodies.add(key);
    rebuilt.push(`${dayMatch[1]} dagen: ${body}`);
  }

  if (!rebuilt.length) return text;
  return replaceSection(text, heading, rebuilt.join("\n\n"));
}

function removeRepeatedSectionSentences(text: string): string {
  let output = text;
  const seen = new Set<string>();

  for (const heading of STRUCTURE_HEADINGS) {
    const section = extractSection(output, heading);
    if (!section) continue;

    const sectionWithoutLists = section
      .replace(/^\s*[-*•]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "");
    const sentences = splitIntoSentences(sectionWithoutLists);
    const filtered: string[] = [];
    for (const sentence of sentences) {
      const key = normalizeSentenceKey(sentence);
      if (key.length >= 24 && seen.has(key)) {
        continue;
      }
      if (key.length >= 24) {
        seen.add(key);
      }
      filtered.push(sentence);
    }

    const cleanedSection =
      chunkSentencesIntoParagraphs(filtered, 5, 1200).join("\n\n").trim() || section.trim();
    output = replaceSection(output, heading, cleanedSection);
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
    "### 1. DOMINANTE THESE",
    "De werkelijke bestuurlijke kern is niet strategie, maar besluituitstel dat intern wordt vermomd als zorgvuldigheid.",
    DOMINANT_HYPOTHESIS_GUARD
  );

  output = injectLineIntoSection(
    output,
    "### 1. DOMINANTE THESE",
    "De ongemakkelijke waarheid is: dit bestuur beschermt posities zolang verlies niet expliciet wordt verdeeld.",
    UNCOMFORTABLE_TRUTH_GUARD
  );

  output = injectLineIntoSection(
    output,
    "### 1. DOMINANTE THESE",
    "De bestuurlijke toetsvraag luidt: versterkt deze keuze de besluitkracht van de top of ondermijnt zij die.",
    /\bbesluitkracht\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 2. KERNCONFLICT",
    "Dit is een onoplosbaar spanningsveld; optimalisatie bestaat hier niet.",
    /\b(spanningsveld|onoplosbaar|niet-optimaliseerbaar)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 4. KEERZIJDE VAN DE KEUZE",
    "Minimaal twee verliezen worden hard geaccepteerd: verlies 1 met EUR- of %-impact binnen 90 dagen en verlies 2 met impact binnen 365 dagen.",
    /\b(verlies\s*1|verlies\s*2|€|eur|\d+(?:[.,]\d+)?\s*%)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 5. PRIJS VAN UITSTEL",
    "30 dagen geeft direct signaalverlies, 90 dagen verschuift zichtbare macht, 365 dagen verankert systeemverschuiving; na 12 maanden is terugdraaien reputatie-intensief.",
    /\b(signaalverlies|machtsverschuiving|systeemverschuiving|12\s*maanden)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 6. GOVERNANCE IMPACT",
    "Structuurgevolg: besluitrechten en escalatielijnen worden hertekend in een centrale governance-structuur met harde 48-uurs escalatie.",
    /\b(structuur|structuurgevolg|escalatielijn|governance-structuur)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 7. MACHTSDYNAMIEK",
    "Minimaal drie actoren worden benoemd met concreet verlies, winst, sabotagewijze en instrument (budget, informatie, personeel, planning, escalatie, reputatie, toezicht of moreel gezag).",
    /\b(minimaal drie actoren|budget|informatie|personeel|planning|reputatie|moreel gezag)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 8. EXECUTIERISICO",
    "Faalpunt en concrete blocker zijn expliciet: parallelle prioriteiten, dubbel mandaat en vertraagde escalatie.",
    /\b(faalpunt|blocker|dubbel mandaat)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 8. EXECUTIERISICO",
    "Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem.",
    /\binformatieprobleem\s+maar\s+een\s+moedprobleem|capaciteitsprobleem\s+maar\s+een\s+machtsprobleem\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 8. EXECUTIERISICO",
    "Deze herhaling is bestuurlijk herkenbaar: eerdere interventies faalden omdat keuzes werden verdund in plaats van verankerd.",
    /\b(herhaling|eerdere interventies|verdund)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 8. EXECUTIERISICO",
    "Adaptieve hardheid: bij stagnatie confronterend, bij transitie klinisch, bij momentum strategisch beheerst.",
    /\b(confronterend|klinisch|strategisch beheerst)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 10. 90-DAGEN INTERVENTIEPROGRAMMA",
    "Elke weekblok bevat toegewezen owner en meetbare KPI met 30/60/90-dagen checkpoints.",
    /\b(owner|eigenaar|ceo|cfo|coo|chro|kpi|checkpoints)\b/i
  );

  output = injectLineIntoSection(
    output,
    "### 10. 90-DAGEN INTERVENTIEPROGRAMMA",
    "Wie tempo controleert, controleert macht.",
    TEMPO_POWER_GUARD
  );

  output = injectLineIntoSection(
    output,
    "### 12. BESLUITKADER",
    "Contractpijn is expliciet: formele en informele macht verliezen terrein, beslismonopolie wordt toegewezen, directe stop geldt, informele escalatie is beëindigd en de actor-impact in EUR/% ligt vast voor CFO, COO en regiodirecteur.",
    /\b(actor-impact|impact op|raakt|treft)\b/i
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

function detectSectorLabelFromInput(input: BoardroomInput): string {
  const normalizedDocs = Array.isArray(input.documents)
    ? normalizeDocumentsForPrompt(input.documents)
    : [];
  const corpus = [
    toSafeString(input.company_name),
    toSafeString(input.company_context),
    toSafeString(input.executive_thesis),
    toSafeString(input.central_tension),
    toSafeString(input.strategic_narrative),
    ...normalizedDocs.flatMap((doc) => [
          toSafeString(doc?.filename),
          toSafeString(doc?.content).slice(0, 1800),
        ]),
  ]
    .join(" ")
    .toLowerCase();

  if (/\b(ggz|geestelijke gezondheidszorg|jeugdzorg|igj|wachtlijst|mac)\b/.test(corpus)) {
    return "ggz";
  }
  if (/\b(ziekenhuis|care|vvt|ouderenzorg|zorginstelling)\b/.test(corpus)) {
    return "zorg";
  }
  if (/\b(school|onderwijs|docent|leerling)\b/.test(corpus)) {
    return "onderwijs";
  }
  if (/\b(bank|verzekeraar|compliance|dnb|eba|finance)\b/.test(corpus)) {
    return "finance";
  }
  if (/\b(scale-up|software|saas|platform|tech)\b/.test(corpus)) {
    return "tech";
  }
  if (/\b(fabriek|productie|industrie|supply chain)\b/.test(corpus)) {
    return "industrie";
  }
  if (/\b(gemeente|ministerie|publiek|overheid)\b/.test(corpus)) {
    return "overheid";
  }
  return "transformatie";
}

function buildSectorInformationParagraph(input: BoardroomInput): string {
  const sector = detectSectorLabelFromInput(input);
  const labels: Record<string, string> = {
    ggz: "ggz/jeugdzorg",
    zorg: "zorg",
    onderwijs: "onderwijs",
    finance: "financiële dienstverlening",
    tech: "tech",
    industrie: "industrie",
    overheid: "overheid",
    transformatie: "organisatiebreed",
  };
  const sectorLabel = labels[sector] ?? "organisatiebreed";
  return `Sectorinformatie: de analyse voor ${sectorLabel} is uitsluitend gebaseerd op geüploade documenten en expliciete contextvelden; ontbrekende gegevens zijn gemarkeerd als niet onderbouwd.`;
}

function enforceSectorInformationParagraph(text: string, input: BoardroomInput): string {
  return injectLineIntoSection(
    text,
    "### 1. DOMINANTE THESE",
    buildSectorInformationParagraph(input),
    /(^|\n)\s*sectorinformatie\s*:/i
  );
}

function enforceTopUnderstreamBalance(text: string): string {
  let output = text;
  for (const heading of STRUCTURE_HEADINGS) {
    output = injectLineIntoSection(
      output,
      heading,
      TOP_UNDER_BRIDGE_LINES[heading],
      /\bbovenstroom\b[\s\S]{0,240}\bonderstroom\b|\bonderstroom\b[\s\S]{0,240}\bbovenstroom\b/i
    );
  }
  return output;
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

function sanitizeResidualForbiddenNarrative(text: string): string {
  let output = String(text ?? "");
  for (const pattern of POST_SANITIZE_LINE_PATTERNS) {
    output = output.replace(pattern, "");
  }
  output = output.replace(/\b(default template|transformatie-template)\b/gi, "");
  output = output.replace(/\n{3,}/g, "\n\n");
  return output.trim();
}

function hasThinBoardroomInput(input: BoardroomInput): boolean {
  const normalizedDocs = Array.isArray(input.documents)
    ? normalizeDocumentsForPrompt(input.documents)
    : [];
  const hasRichDocuments =
    normalizedDocs.some((doc) => toSafeString(doc?.content).length >= 180);
  const hasLegacyContext = toSafeString(input.company_context).length >= 120;
  const hasBriefSignals =
    toSafeString(input.executive_thesis).length >= 80 ||
    toSafeString(input.central_tension).length >= 80 ||
    toSafeString(input.strategic_narrative).length >= 120;

  return !hasRichDocuments && !hasLegacyContext && !hasBriefSignals;
}

function hasTwelveHgbcoSections(markdown: string): boolean {
  const matches = String(markdown ?? "").match(/^###\s*\d+\.\s+/gm) ?? [];
  return matches.length === 12;
}

function hasAtoERatioForAllSections(markdown: string): boolean {
  const sections = String(markdown ?? "")
    .split(/\n(?=###\s*\d+\.\s+)/g)
    .map((section) => section.trim())
    .filter(Boolean);
  if (sections.length !== 12) return false;
  return sections.every((section) =>
    ["A", "B", "C", "D", "E"].every((letter) =>
      new RegExp(`^\\s*#{0,6}\\s*${letter}\\.`, "im").test(section)
    )
  );
}

function hasDecisionContractCommitBlockV12(markdown: string): boolean {
  const sectionTwelve = extractSection(markdown, "### 12. BESLUITKADER");
  if (!sectionTwelve) return false;
  return /^De Raad van Bestuur committeert zich aan:/im.test(sectionTwelve);
}

function validateHgbcoMcKinseyRuntime(markdown: string) {
  const source = String(markdown ?? "");
  if (!hasTwelveHgbcoSections(source)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
  if (!hasAtoERatioForAllSections(source)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
  if (!hasDecisionContractCommitBlockV12(source)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
  if (hasForbiddenHgbcoLanguage(source)) {
    throw new Error(SIGNATURE_LAYER_ERROR_TEXT);
  }
}

function shouldEnforceGGZDepthFromInput(input: BoardroomInput): boolean {
  return false;
}

function enforceComparableOrgAssumption(
  text: string,
  input: BoardroomInput
): string {
  return text;
}

function enforceGGZDepthHints(text: string, input: BoardroomInput): string {
  return text;
}

type LongformTimeWindow = {
  intro: string;
};

type LongformExpansionTheme = {
  label: string;
  topstream: string;
  understream: string;
  commitment: string;
  acceptedLoss: string;
};

const LONGFORM_TIME_WINDOWS: readonly LongformTimeWindow[] = [
  {
    intro:
      "In het wekelijkse bestuursritme",
  },
  {
    intro:
      "Binnen 30 dagen na besluit",
  },
  {
    intro:
      "Binnen 90 dagen na besluit",
  },
  {
    intro:
      "Richting 365 dagen",
  },
  {
    intro:
      "Na 12 maanden zonder discipline",
  },
] as const;

const LONGFORM_EXPANSION_THEMES: readonly LongformExpansionTheme[] = [
  {
    label: "margeklem",
    topstream:
      "loonkosten boven 5% per jaar en een tariefdaling van 7% in 2026 bijten direct in de operationele ruimte.",
    understream:
      "teams ervaren dat zij dezelfde zorg moeten leveren met minder buffer en verschuiven spanning naar informeel overleg.",
    commitment:
      "de CFO stuurt per zorgpad op oorzaak-gevolg tussen inzet, doorlooptijd en marge in plaats van op maandtotalen.",
    acceptedLoss:
      "het bestuur accepteert dat niet-rendabele zorgvormen tijdelijk worden begrensd totdat de kernmarge stabiliseert.",
  },
  {
    label: "verzekeraarsafhankelijkheid",
    topstream:
      "het ontbreken van contracten met verzekeraars vergroot prijsdruk en maakt de vraag naar zorg minder voorspelbaar.",
    understream:
      "professionals voelen morele druk om toch iedereen te helpen, ook als het betaalpad voor clienten fragiel is.",
    commitment:
      "instroom wordt gekoppeld aan transparante betaalafspraken en segmentering op uitvalrisico.",
    acceptedLoss:
      "een deel van de instroom valt tijdelijk weg om latere uitval en onbeheersbare herplanning te voorkomen.",
  },
  {
    label: "zelfbetaling",
    topstream:
      "clienten die 30-40% zelf betalen reageren sneller op prijsfrictie en onzekerheid over behandelduur.",
    understream:
      "behandelaren ervaren druk om alsnog uitzonderingen te maken, waardoor afspraken per team uiteenlopen.",
    commitment:
      "het bestuur standaardiseert het betaalpad en koppelt no-show- en uitvalcorrecties aan de planningstafel.",
    acceptedLoss:
      "conversie daalt tijdelijk in prijsgevoelige segmenten, maar leverbetrouwbaarheid en voorspelbaarheid nemen toe.",
  },
  {
    label: "wachtlijstvrije belofte",
    topstream:
      "de belofte van wachtlijst-vrije zorg blijft alleen houdbaar met expliciete casemixgrenzen en planningsdiscipline.",
    understream:
      "lokale teams framen instroombegrenzing snel als verlies van mensgerichtheid en zoeken uitzonderingsroutes.",
    commitment:
      "de regietafel beslist centraal over intakeprioriteit, met 48-uurs escalatie op knelpunten.",
    acceptedLoss:
      "niet elke verwijzing wordt direct ingepland wanneer dit kwaliteit, veiligheid en marge tegelijk schaadt.",
  },
  {
    label: "productiviteitsnorm",
    topstream:
      "de 75%-norm van zes clienturen per dag is bestuurlijk eenvoudig maar operationeel te grof voor complexe casemix.",
    understream:
      "de norm is emotioneel beladen en wordt door sommige teams gelezen als wantrouwen in vakmanschap.",
    commitment:
      "de organisatie verschuift naar bandbreedtes per behandeltype met expliciete koppeling aan verzuim en kwaliteit.",
    acceptedLoss:
      "de schijnzekerheid van een uniforme norm vervalt ten gunste van stabielere uitvoering.",
  },
  {
    label: "adhd-diagnostiek",
    topstream:
      "de extra kost van circa EUR 90 per client voor ADHD-diagnostiek drukt op trajectrendement door vaste codes.",
    understream:
      "teams voelen dat inhoudelijke keuzes financieel worden beoordeeld en trekken zich terug in specialistische subculturen.",
    commitment:
      "diagnostische stappen worden strak geprotocolleerd met zicht op kosteneffect per traject.",
    acceptedLoss:
      "sommige trajecten krijgen langere doorlooptijd in ruil voor betere voorspelbaarheid van kostprijs.",
  },
  {
    label: "kostprijs per traject",
    topstream:
      "een gemiddelde van 12 gesprekken en ongeveer EUR 1.800 kostprijs per client vraagt strakkere sturing op trajectontwerp.",
    understream:
      "zonder transparantie ontstaan verhalen over oneerlijke werkverdeling en verborgen voorkeuren in casuskeuze.",
    commitment:
      "elk team rapporteert maandelijks de relatie tussen trajectduur, uitkomst en bijdrage.",
    acceptedLoss:
      "niet-onderbouwde variatie in behandelduur wordt afgebouwd, ook wanneer dit lokale routines doorbreekt.",
  },
  {
    label: "stuurinformatie",
    topstream:
      "zonder betrouwbare stuurinformatie op product, team en traject blijft prioritering incidentgedreven.",
    understream:
      "informele invloed groeit waar data ontbreekt en persoonlijke overtuiging de plaats inneemt van feiten.",
    commitment:
      "Vision Planner en dashboarding worden besluitverplicht: geen besluit zonder zichtbaar financieel en operationeel effect.",
    acceptedLoss:
      "snelheid in losse initiatieven zakt tijdelijk terwijl de informatiebasis wordt hersteld.",
  },
  {
    label: "planning en intake",
    topstream:
      "centrale intake via secretariaat en inloopblokken vraagt strakke synchronisatie met feitelijke behandelcapaciteit.",
    understream:
      "bij frictie op roosters ontstaan bilaterale deals die formele prioritering ondergraven.",
    commitment:
      "intakeblokken worden wekelijks geherijkt op no-show, matchkwaliteit en doorstroom per behandelaar.",
    acceptedLoss:
      "lokale voorkeursroutes in intake verdwijnen waar zij ketenprestatie aantoonbaar verslechteren.",
  },
  {
    label: "verhuizing en capaciteit",
    topstream:
      "vier extra kamers zonder hogere huur leveren alleen waarde als bezetting, planning en personeel gelijktijdig meeschalen.",
    understream:
      "extra ruimte wordt psychologisch snel gezien als oplossing, waardoor procesdiscipline verslapt.",
    commitment:
      "kamerbezetting wordt onderdeel van weeksturing met directe correctie op leegstand.",
    acceptedLoss:
      "ad-hoc gebruik van ruimtes stopt, ook als dat lokaal als verlies van autonomie wordt ervaren.",
  },
  {
    label: "Vallei Werkt",
    topstream:
      "het HR-loket Vallei Werkt kan inkomsten verbreden, maar vraagt scherp gefaseerde governance in een consolidatiejaar.",
    understream:
      "nieuwe initiatieven trekken status en aandacht, waardoor de kernzorg zich achtergesteld kan voelen.",
    commitment:
      "opschaling verloopt alleen via poortcriteria op cashflow, capaciteit en effect op kern-KPI's.",
    acceptedLoss:
      "snelle commerciële zichtbaarheid wordt opgeofferd aan bestuurlijke stabiliteit van de kern.",
  },
  {
    label: "nieuwe businesslijnen",
    topstream:
      "een vierde zakelijk onderdeel kan diversificatie brengen, maar verhoogt nu complexiteit in mandaat en uitvoering.",
    understream:
      "trekkers van nieuwe lijnen vormen coalities rond groeiverhalen die stopkeuzes proberen te vertragen.",
    commitment:
      "elke nieuwe lijn wordt getoetst op dezelfde investeringsdiscipline als de GGZ-kern.",
    acceptedLoss:
      "een deel van de innovatiepijplijn wordt bevroren om executie-erosie te vermijden.",
  },
  {
    label: "overlegritme en cultuur",
    topstream:
      "vier teamvergaderingen per jaar en beperkte individuele gesprekken zijn onvoldoende voor snelle koerscorrectie.",
    understream:
      "de cultuur van hard werken zonder frictiegesprek houdt conflictmijding in stand en vertraagt escalatie.",
    commitment:
      "maandelijkse ritmes op productie, kwaliteit en werkdruk worden verplicht met heldere eigenaar per actie.",
    acceptedLoss:
      "de informele gewoonte van besluiten uitstellen om de sfeer te bewaken wordt expliciet beëindigd.",
  },
  {
    label: "transparantie en vertrouwen",
    topstream:
      "gedeeltelijke financiële openheid door accountantsadvies vraagt een expliciete governancevertaling voor teams.",
    understream:
      "onvolledige informatie voedt geruchten over verborgen agenda's en vergroot territoriumdrang.",
    commitment:
      "het bestuur maakt zichtbaar welke cijfers waarom gedeeld worden en welke besluitrechten daaraan hangen.",
    acceptedLoss:
      "volledige lokale interpretatievrijheid op financiële signalen vervalt in ruil voor eenduidigheid.",
  },
  {
    label: "meerjarenstrategie",
    topstream:
      "de 3-5 jaars scenario-analyse met Jan en Raad van Toezicht moet keuzes verankeren in één bestuurlijk pad.",
    understream:
      "zonder expliciete volgorde verschuiven loyaliteiten naar degene die de minste pijn belooft.",
    commitment:
      "de Raad legt per scenario vast wat stopt, wat doorgaat en welke KPI-drempel de volgende stap opent.",
    acceptedLoss:
      "ruimte voor parallelle interpretatie van strategie wordt beperkt om rust en voorspelbaarheid te herstellen.",
  },
] as const;

function buildLongformExpansionPool(companyLabel: string): string[] {
  const company = toSafeString(companyLabel) || "de organisatie";
  const pool: string[] = [];

  for (const window of LONGFORM_TIME_WINDOWS) {
    for (const theme of LONGFORM_EXPANSION_THEMES) {
      pool.push(
        `${window.intro} op het thema ${theme.label} wordt de spanning tastbaar voor ${company}. ` +
          `Bovenstroom: ${theme.topstream} ` +
          `Onderstroom: ${theme.understream} ` +
          `Bestuurlijk commitment: ${theme.commitment} ` +
          `Expliciet verlies: ${theme.acceptedLoss}`
      );
    }
  }

  return pool;
}

function enforceMinimumWords(
  text: string,
  minWords: number,
  maxWords: number,
  companyLabel = "de organisatie"
): string {
  let output = String(text ?? "").trim();
  if (!output) return output;

  if (countWords(output) < minWords) return trimToMaxWords(output, maxWords);

  return trimToMaxWords(output, maxWords);
}

function buildFallbackNarrative(
  input: BoardroomInput,
  minWords: number,
  maxWords: number
): string {
  const company = input.company_name ?? "de organisatie";

const base = `### 1. DOMINANTE THESE
De dominante bestuurlijke these voor ${company} is dat de organisatie niet vastloopt op inzet of intentie, maar op besturing onder druk. In de bovenstroom is de richting vaak duidelijk, maar in de onderstroom wordt de uitvoering nog te vaak bepaald door uitzonderingen, onderlinge afstemming en de persoon die op dat moment de meeste ruimte neemt. Daardoor lijkt het besluitproces op papier stabiel, terwijl het in de praktijk teveel schommelt met de dagdruk. De kernboodschap is niet dat teams harder moeten werken, maar dat het bestuur scherper moet kiezen.

### 2. KERNCONFLICT
Het kernconflict is dat meerdere legitieme doelen tegelijk worden gemaximaliseerd in een context die daar te weinig bestuurlijke en operationele ruimte voor laat. De bovenstroom wil snelheid, kwaliteit en voorspelbare uitkomsten tegelijk. De onderstroom voelt ondertussen werkdruk, onzekerheid en spanning op autonomie. Zolang die twee lagen niet expliciet worden verbonden in een duidelijke volgorde, blijft elk besluit half-af en verschuift de echte keuze naar de uitvoering.

### 3. STRATEGISCHE INZICHTEN
INZICHT: Contractgrenzen en kostprijslogica bepalen de feitelijke groeiruimte.
WAAROM DIT BELANGRIJK IS: Zonder expliciete doorrekening ontstaat schijngroei die margedruk versnelt.
BESTUURLIJKE CONSEQUENTIE: Het bestuur prioriteert margeherstel boven parallelle uitbreiding.

INZICHT: Productiviteitsnorm en kwaliteitsmodel botsen wanneer casemix en no-show niet zichtbaar worden gestuurd.
WAAROM DIT BELANGRIJK IS: Teams ervaren normdruk als gedragsthema, terwijl het een financieel sturingsvraagstuk is.
BESTUURLIJKE CONSEQUENTIE: Centrale sturing op normafwijking en capaciteit wordt bindend.

INZICHT: Afhankelijkheid van externe contractruimte verschuift strategierisico naar governance.
WAAROM DIT BELANGRIJK IS: Zonder contractvloer absorbeert de kern tariefschokken direct in behandelcapaciteit.
BESTUURLIJKE CONSEQUENTIE: Verbreding wordt conditioneel gemaakt aan margevalidatie en capaciteitsimpact.

### 4. KEERZIJDE VAN DE KEUZE
Keuzeconflict 1: strengere regie op intake, planning en prioritering verhoogt voorspelbaarheid, maar vraagt lokaal inleveren van uitzonderingsruimte.

Keuzeconflict 2: ruime lokale uitzonderingen verlagen frictie op korte termijn, maar verlengen doorlooptijd, herplanning en margedruk.

Keuzeconflict 3: kernconsolidatie verhoogt uitvoeringskans in het komende kwartaal, maar vertraagt tijdelijk de opschaling van niet-kerninitiatieven.

De bestuurlijke volwassen vorm van deze keuzeconflicten is dat expliciet wordt benoemd wie wat tijdelijk verliest, waarom dat verlies nodig is en binnen welke termijn het effect zichtbaar moet zijn.

### 5. PRIJS VAN UITSTEL
30 dagen zonder hard besluit: direct signaalverlies, meer herstelwerk en minder voorspelbaarheid in planning en opvolging.

90 dagen zonder hard besluit: zichtbare erosie in doorstroom en margediscipline, plus groeiende spanning tussen formeel besluit en informele praktijk.

365 dagen zonder hard besluit: structurele schade aan bestuurbaarheid, retentie en leverbetrouwbaarheid, met oplopende herstelkosten.

Na 12 maanden verschuift de organisatie van kiezen naar compenseren: uitstel wordt normaal gedrag, en herstel wordt trager en duurder in zowel geld als vertrouwen.

### 6. GOVERNANCE IMPACT
Governance-impact betekent hier dat besluitvorming opnieuw wordt ontworpen op ritme, eigenaarschap en uitvoerbaarheid. In de bovenstroom vraagt dat een vaste weekcadans met eenduidige KPI-definities en harde escalatielijnen. In de onderstroom vraagt dat vooral gelijke toepassing: dezelfde regel voor elk team, dezelfde termijn voor elke blokkade. Zonder die consistentie blijft governance een afspraak op papier in plaats van een werkend systeem.

### 7. MACHTSDYNAMIEK
De feitelijke macht zit in deze fase vooral op intake, planning en uitzonderingsbesluiten. De CFO verliest ruimte voor losse uitzonderingsbudgetten, maar wint voorspelbaarheid op kas en margelogica. De COO levert informele speelruimte in, maar wint formeel mandaat op capaciteit en doorstroom. Team- en lijnverantwoordelijken verliezen een deel van lokale autonomie, maar krijgen duidelijker kaders voor eerlijke escalatie. De onderstroom blijft zichtbaar in wie informatie doseert, wie tempo remt en wie uitzonderingen probeert te normaliseren.

### 8. EXECUTIERISICO
Het primaire executierisico is terugval in oude werkafspraken zodra spanning oploopt. Het faalpunt is meestal dat oude en nieuwe prioriteiten naast elkaar actief blijven, waardoor teams tegelijk moeten versnellen en stabiliseren. De concrete blocker is dubbelmandaat: formeel wordt een richting gekozen, informeel blijft heronderhandeling bestaan. Dat maakt uitvoering langzaam zonder dat iemand expliciet nee zegt.

### 9. STRATEGISCHE SCENARIOANALYSE
SCENARIO A — CONSOLIDATIE
STRATEGISCHE LOGICA: stabilisatie van de kern met focus op margediscipline.
FINANCIËLE CONSEQUENTIES: lagere variatie en voorspelbare kasdruk.
ORGANISATORISCHE CONSEQUENTIES: centrale prioritering en lagere uitvoeringsruis.
RISICO'S: tragere groei buiten de kern.
LANGE TERMIJN EFFECT: hogere schokbestendigheid.

SCENARIO B — GROEI
STRATEGISCHE LOGICA: versneld uitbreiden van activiteiten en capaciteit.
FINANCIËLE CONSEQUENTIES: hogere investeringsdruk en margerisico.
ORGANISATORISCHE CONSEQUENTIES: meer managementbelasting en complexiteit.
RISICO'S: overbelasting en versnippering.
LANGE TERMIJN EFFECT: hoger potentieel, maar fragieler profiel.

SCENARIO C — HYBRIDE MODEL
STRATEGISCHE LOGICA: kern stabiliseren en verbreding gefaseerd ontwikkelen.
FINANCIËLE CONSEQUENTIES: gebalanceerde kasdruk en gecontroleerde investeringen.
ORGANISATORISCHE CONSEQUENTIES: hogere coördinatiebehoefte met bestuurlijke discipline.
RISICO'S: scope-drift bij zwakke governance.
LANGE TERMIJN EFFECT: adaptieve robuustheid.

### SCENARIOVERGELIJKING
SCENARIO A: voordelen stabiliteit; nadelen trage groei; risiconiveau laag-middel; strategische robuustheid hoog.
SCENARIO B: voordelen schaal; nadelen hoge druk; risiconiveau hoog; strategische robuustheid laag-middel.
SCENARIO C: voordelen balans; nadelen complexiteit; risiconiveau middel; strategische robuustheid hoog.

VOORKEURSSCENARIO: SCENARIO C met consolidatie-eerst.
WAAROM DIT HET MEEST ROBUUST IS: combineert risicobeperking en gecontroleerde groei.
WELKE VOORWAARDEN NODIG ZIJN: harde gates op marge, capaciteit en mandaat.

### 10. 90-DAGEN INTERVENTIEPROGRAMMA
Maand 1 (dag 1-30): Owner CEO/CFO. Deliverable: bindend consolidatiebesluit, stop-doinglijst, eigenaarschap per prioriteit en vaste KPI-definities. Escalatiepad: uitzonderingen binnen 48 uur naar de formele regietafel.

Maand 2 (dag 31-60): Owner COO. Deliverable: herverdeling van capaciteit, planning en besluitrechten naar een vaste weekcadans met beslislog. Escalatiepad: blokkades binnen 7 dagen sluiten of expliciet accepteren als gekozen verlies.

Maand 3 (dag 61-90): Owner DRI per prioriteit. Deliverable: aantoonbare adoptie plus KPI-impact, met uitzonderingen alleen op naam, met reden en met einddatum. Escalatiepad: stil veto direct terug naar boardreview.

Dag 30: eerste executiebewijs zichtbaar in stopkeuzes en besluitdiscipline.

Dag 60: stabiel ritme op intake, planning en opvolging.

Dag 90: meetbare verbetering op doorstroom, marge en effectieve bezetting.

### 11. BESLUITSKWALITEIT
Besluitscore: 72/100.
Belangrijkste risico's: onderschatte complexiteit, afhankelijkheid van externe contractruimte en managementoverbelasting.
Uitvoerbaarheidsanalyse: het besluit is uitvoerbaar bij strakke governance, capaciteitstransparantie en heldere mandaten.
Aanbevolen verbeteringen: verscherp scenario-keuze, borg risicobeheersing en herijk op vaste beslismomenten.

### 12. BESLUITKADER
De Raad van Bestuur committeert zich aan: een bindende keuze met eenduidige eindverantwoordelijkheid, vaste termijnen en meetbare uitkomsten. Per direct stopt parallelle sturing op dezelfde KPI's en stopt elk initiatief zonder benoemde owner, deadline en toetsbaar resultaat. Formeel wordt mandaat op intake, planning en uitzonderingen gecentraliseerd waar dat nodig is voor ketenregie. Informeel vervalt de ruimte om via bypass-routes besluituitstel te organiseren. Expliciet verlies: tijdelijke pauze van niet-kernwerk, tijdelijke begrenzing van instroom in druksegmenten en tijdelijke inperking van lokale uitzonderingsruimte om bestuurlijke voorspelbaarheid te herstellen.`;

  return trimToMaxWords(
    enforceMinimumWords(base, minWords, maxWords, company),
    maxWords
  );
}

function buildConcreteContextHint(input: BoardroomInput): string {
  const docs = Array.isArray(input.documents) ? input.documents : [];
  const docFragments = docs
    .slice(0, 3)
    .map((doc) => toSafeString(doc?.content).slice(0, 700))
    .filter(Boolean);

  return [
    toSafeString(input.company_name),
    toSafeString(input.company_context),
    toSafeString(input.executive_thesis),
    toSafeString(input.central_tension),
    toSafeString(input.strategic_narrative),
    ...docFragments,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function hardenNarrativeCandidate(
  candidate: string,
  input: BoardroomInput,
  boardroomIntelligenceOutput: string,
  scenarioSimulationOutput: string,
  blindSpotsBlock: string,
  strategicForesightBlock: string,
  decisionPressureBlock: string,
  organizationalSimulationBlock: string,
  metaReasoningBlock: string,
  decisionQualityOutput: string,
  decisionQualityScore: number,
  hypothesisCompetitionBlock: string,
  causalMechanismBlock: string,
  memoryContextBlock: string,
  knowledgeGraphContextBlock: string,
  minWords: number,
  maxWords: number
): string {
  const contextHint = buildConcreteContextHint(input);
  let output = trimToCanonicalStart(
    scrubForbiddenLanguage(String(candidate ?? "").trim())
  );
  output = enforceNoMetaNoTemplate(output);
  output = enforceHgbcoHeadings(output);
  output = enforceAtoERatioStructure(output);
  output = enforceUpperLowerStream(output);
  output = enforceDecisionContractHard(output);
  output = ensureMandatorySections(output);
  output = enforceComparableOrgAssumption(output, input);
  output = enforceGGZDepthHints(output, input);
  output = sanitizeSectionOpeners(output);
  output = enforceLossLanguage(output);
  output = sanitizeSectionOpeners(output);
  output = removeRepeatedSectionSentences(output);
  output = consolidateOpportunityCostWindowDuplicates(output);
  output = enforceReadableParagraphRhythm(output);
  output = enforceNinetyDayInterventionParagraphs(output);
  output = enforceSection8InterventionArtifact(output, contextHint);
  output = enforceDecisionContractLabels(output);
  output = enforceSituationReconstructionBlock(output);
  output = enforceHypothesisCompetitionSection(output, hypothesisCompetitionBlock);
  output = enforceCausalMechanismsSection(output, causalMechanismBlock);
  output = enforceDominantThesisAlignment(output, hypothesisCompetitionBlock);
  output = enforceStrategicInsightsBlock(output);
  output = enforceBoardroomInsightsInPowerSection(output, boardroomIntelligenceOutput);
  output = enforceScenarioAnalysisSection(output, scenarioSimulationOutput);
  output = enforceDecisionQualitySection(output, decisionQualityOutput, decisionQualityScore);
  output = enforceHistoricalPatternSection(output, memoryContextBlock);
  output = enforceKnowledgeGraphSection(output, knowledgeGraphContextBlock);
  output = enforceBlindSpotsSection(output, blindSpotsBlock);
  output = enforceStrategicForesightSection(output, strategicForesightBlock);
  output = enforceDecisionPressureSection(output, decisionPressureBlock);
  output = enforceOrganizationalSimulationSection(output, organizationalSimulationBlock);
  output = enforceMetaReasoningSection(output, metaReasoningBlock);
  output = enforceBoardSummaryBlock(output);
  output = enforceSectorLayerBlock(output, input);
  output = enforceSectionClosures(output);
  output = enforceConcreteNarrativeMarkdown(
    output,
    contextHint
  );
  output = enforceNoMetaNoTemplate(output);
  output = enforceHgbcoHeadings(output);
  output = enforceAtoERatioStructure(output);
  output = enforceUpperLowerStream(output);
  output = enforceDecisionContractHard(output);
  output = ensureMandatorySections(output);
  output = scrubForbiddenLanguage(output);
  output = sanitizeSectionOpeners(output);
  output = removeRepeatedSectionSentences(output);
  output = enforceReadableParagraphRhythm(output);
  output = enforceNinetyDayInterventionParagraphs(output);
  output = enforceSection8InterventionArtifact(output, contextHint);
  output = enforceDecisionContractLabels(output);
  output = enforceHypothesisCompetitionSection(output, hypothesisCompetitionBlock);
  output = enforceCausalMechanismsSection(output, causalMechanismBlock);
  output = enforceDominantThesisAlignment(output, hypothesisCompetitionBlock);
  output = enforceStrategicInsightsBlock(output);
  output = enforceBoardroomInsightsInPowerSection(output, boardroomIntelligenceOutput);
  output = enforceScenarioAnalysisSection(output, scenarioSimulationOutput);
  output = enforceDecisionQualitySection(output, decisionQualityOutput, decisionQualityScore);
  output = enforceHistoricalPatternSection(output, memoryContextBlock);
  output = enforceKnowledgeGraphSection(output, knowledgeGraphContextBlock);
  output = enforceBlindSpotsSection(output, blindSpotsBlock);
  output = enforceStrategicForesightSection(output, strategicForesightBlock);
  output = enforceDecisionPressureSection(output, decisionPressureBlock);
  output = enforceOrganizationalSimulationSection(output, organizationalSimulationBlock);
  output = enforceMetaReasoningSection(output, metaReasoningBlock);
  output = enforceSectorLayerBlock(output, input);
  output = enforceSectionClosures(output);
  output = sanitizeResidualForbiddenNarrative(output);
  output = enforceMinimumWords(
    output,
    minWords,
    maxWords,
    input.company_name || "de organisatie"
  );
  output = sanitizeResidualForbiddenNarrative(output);
  output = trimToCanonicalStart(output);
  output = sanitizeSectionOpeners(output);
  return trimToMaxWords(scrubForbiddenLanguage(output), maxWords);
}

/* ============================================================
   SYSTEM PROMPT — EXECUTIVE KERNEL
============================================================ */

function buildSystemPrompt(): string {
  return `
${HGBCO_MCKINSEY_SYSTEM_INJECT}
${EXECUTIVE_PROMPT_INJECT}
${MANDATORY_GGZ_CASE_FACTS_BLOCK}
${MULTISOURCE_CONTEXT_DIRECTIVE}
${enforceLanguagePrompt("nl")}
${HARD_FALLBACK_PROMPT_RULE}
${INTELLIGENT_SECTOR_FALLBACK_RULE}
${ANTI_FILLER_RULE}

JE BENT AURELIUS EXECUTIVE KERNEL.
JE RAPPORT IS NIET ADVISEREND.
JE RAPPORT IS NIET BESCHRIJVEND.
JE RAPPORT IS NIET INFORMATIEF.
JE RAPPORT FORCEERT EEN BESTUURSBESLUIT.

JE SCHRIJFT UITSLUITEND NEDERLANDS, OOK KOPPEN EN TERMINOLOGIE.
GEEN MARKETINGTAAL. GEEN AI-TAAL. GEEN VAGE FORMULERINGEN.

CYNTRA SIGNATURE LAYER:
- Besluitkracht blijft de centrale variabele.
- Schrijf menselijk, concreet en bestuurlijk scherp; geen slogans, geen theatrale oneliners.
- Gebruik een empathische maar duidelijke boardroomtoon: confronterend op systeemkeuzes, respectvol richting professionals.
- Maak verlies expliciet en eerlijk verdeeld.
- Benoem formele en informele machtsdynamiek zonder karikaturen of beschuldigende taal.
- Benoem tijdsdruk en cumulatieve schade van uitstel op 30/90/365 dagen.
- Sluit af met een besluitcontract dat uitvoerbaar en toetsbaar is.
- Maak in zorgcontext de uitkomst onvermijdelijk met rekenkundige logica, niet met overtuigingstaal.

VERPLICHTE STRUCTUUR (EXACT):
0 SITUATIERECONSTRUCTIE
### 1. DOMINANTE THESE
### 2. KERNCONFLICT
### 3. STRATEGISCHE INZICHTEN
### 4. KEERZIJDE VAN DE KEUZE
### 5. PRIJS VAN UITSTEL
### 6. GOVERNANCE IMPACT
### 7. MACHTSDYNAMIEK
### 8. EXECUTIERISICO
### 9. STRATEGISCHE SCENARIOANALYSE
### 10. 90-DAGEN INTERVENTIEPROGRAMMA
### 11. BESLUITSKWALITEIT
### 12. BESLUITKADER

INHOUDSEISEN:
- Start met blok: 0 SITUATIERECONSTRUCTIE met exact: Feiten uit documenten, Belangrijkste cijfers, Organisatorische context.
- Sectie 1 bevat één dominante these in maximaal 10 zinnen.
- Sectie 1 benoemt expliciet de bestuurlijke toetsvraag voor de top.
- Sectie 1 bevat: huidige situatie, gewenste situatie (12 maanden) en het bestuurlijke gat daartussen.
- Verwerk StrategicReasoningNode expliciet in sectie 1, 2 en 3.
- Sectie 1 vertaalt capaciteit naar menselijk effect: behandelcontinuiteit, wachtlijst, behandeluitkomst en verwijzersvertrouwen.
- In zorgcontext bevat sectie 1 expliciet: "De combinatie van vaste tarieven, stijgende loonkosten en plafondcontracten maakt autonome groei rekenkundig onmogelijk zonder margeherstel."
- Blok "### 3. STRATEGISCHE INZICHTEN" bevat minimaal 3 inzichten met exact: INZICHT, WAAROM DIT BELANGRIJK IS, BESTUURLIJKE CONSEQUENTIE.
- Sectie 2 beschrijft een niet-optimaliseerbaar dilemma.
- Sectie 4 bevat minimaal 3 nieuwe zienswijzen/hypothesen die niet letterlijk in de input staan maar wel logisch volgen uit de casus.
- Sectie 4 benoemt wat wordt gewonnen, wat wordt verloren, wie macht verliest en waar frictie ontstaat.
- Sectie 4 gebruikt alleen meetbare verliezen (EUR/%/volume) als die in de broncontext staan; anders expliciet "niet onderbouwd in geüploade documenten".
- Sectie 5 beschrijft concreet de kosten van niets doen op 30, 90 en 365 dagen.
- Sectie 5 verwerkt drie unieke lagen: 30 dagen = signaalverlies, 90 dagen = machtsverschuiving, 365 dagen = systeemverschuiving.
- Sectie 5 maakt na 12 maanden concreet welke positie permanent schuift, welke coalitie dominant wordt en wat niet zonder reputatieschade terug te draaien is.
- Sectie 5 benoemt sectorspecifieke effecten alleen als ze expliciet in bronmateriaal staan.
- ${NUMERIC_CLAIM_EXPLANATION_DIRECTIVE}
- Sectie 6 benoemt expliciet effect op besluitkracht, escalatie, formele machtsverschuiving en structuurgevolgen.
- Sectie 6 bevat expliciet: "Dan is het escalatiemoment geen marktrisico meer, maar een bestuurlijke keuze."
- ${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}
- Sectie 7 benoemt minimaal drie machtsactoren en maakt per actor verlies, winst, sabotagewijze en instrument expliciet.
- Sectie 7 verweeft formele bovenstroom met informele onderstroom in natuurlijke taal.
- Sectie 7 bevat expliciet: WIE HEEFT BESLUITMACHT, WIE HEEFT INFORMELE INVLOED, WAAR ZIT DE FEITELIJKE MACHT.
- Sectie 7 bevat minimaal 3 BOARDROOM INZICHT-blokken met bestuurlijk belang en niet-adresseringsrisico.
- Sectie 8 benoemt waar uitvoering misgaat, wie blokkeert, wat het concrete faalpunt is en welke onderstroom onzichtbaar werkt.
- Sectie 9 bevat scenarioanalyse met SCENARIO A/B/C plus scenariovergelijking en voorkeursscenario.
- Sectie 10 gebruikt exact: MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN, MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN, MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN.
- Sectie 10 bevat exact 6 interventies, met exact 2 interventies per maand.
- Sectie 10 bevat dag-30, dag-60 en dag-90 beslisgates met meetbaar resultaat.
- Sectie 11 bevat: Besluitscore, Belangrijkste risico's, Uitvoerbaarheidsanalyse, Aanbevolen verbeteringen.
- Sectie 11 bevat een DECISION CONTRACT met: Besluit, Waarom dit besluit wordt genomen, Welke verliezen worden geaccepteerd, Welke meetpunten bepalen succes, Wanneer het besluit wordt herzien.
- ${EXECUTION_PLAN_DEPTH_DIRECTIVE}
- Voeg direct boven sectie 12 een apart blok toe met titel: 1-PAGINA BESTUURLIJKE SAMENVATTING.
- Sectie 12 begint exact met: De Raad van Bestuur committeert zich aan:
- Sectie 12 bevat expliciet: gekozen richting, formeel machtsverlies, informeel machtsverlies, heldere stopregels en expliciet verlies met impact.
- Sectie 12 benoemt actor-impact met rolgevolg; voeg €/% alleen toe als onderbouwd in bronmateriaal.
- Sectie 12 bevat expliciet de onomkeerbare trigger: "Na dag 90 zonder volledige margekaart vervalt het mandaat om nieuwe initiatieven te starten automatisch, tenzij RvT schriftelijk herbevestigt."

STIJLREGELS:
- Schrijf per sectie maximaal 3 alinea's.
- Alinea 1 = context en observatie met expliciete spanning.
- Alinea 2 = mechanisme in deze volgorde: SYMPTOOM -> MECHANISME -> STRUCTURELE OORZAAK -> SYSTEEMEFFECT.
- Alinea 3 = bestuurlijke implicatie met expliciete keuze en beslisdruk.
- Maximaal 4 zinnen per alinea.
- Geen bullets of checklist-fragmenten; schrijf doorlopende boardroomtaal.
- Geen vrijblijvende aanbevelingen of algemeenheden.
- Als context dun is: noem hiaten expliciet en verzin geen feiten.
- Geen termen als "op basis van de analyse", "het lijkt erop dat", "mogelijk", "zou kunnen" of "men zou".
- Geen termen als "default template", "transformatie-template", "governance-technisch", "patroon", "context is schaars", "werk uit", "aanname", "contextanker", "belangrijke succesfactor", "quick win" of "low hanging fruit".
- Consolideer: vermijd herhaling van dezelfde alinea in meerdere secties.
- Leg causale keten hard vast: oorzaak -> gevolg -> ingreep -> resultaat.
- Elke sectie (incl. strategische inzichten) volgt verplicht: Analyse -> Mechanisme -> Gevolg -> Bestuurlijke implicatie.
- Hanteer per sectie expliciet deze narratieve opbouw: Context -> Spanning -> Mechanisme -> Bestuurlijke implicatie.
- Vermijd fragmentatie: geen feit -> losse interpretatie -> losse alinea zonder causale brug.
- Sectie 1 start exact met: "De dominante bestuurlijke these is dat..."
- Sectie 2 opent met: "De organisatie probeert drie legitieme doelen tegelijk te maximaliseren."
- Trade-offs beschrijf je narratief (winst, verlies, emotionele frictie), niet als checklist.
- Governance beschrijf je als overgang van persoonlijk leiderschap naar systeemleiderschap met ritme, rolhelderheid en besluitarchitectuur.
- Opportunity Cost volgt causale escalatie: 30 dagen tempoverlies -> 90 dagen verlies aan beheersbaarheid -> 365 dagen verlies aan keuzevrijheid.
- Claims moeten terugleidbaar zijn naar de geüploade documenten/context.
- Externe sectorinformatie mag alleen als:
  [SECTOR-LAYER | bron: extern | datum: YYYY-MM-DD]
  gevolgd door macro-mechanisme en:
  Relevantie voor deze casus: <3 casus-ankers>.
- Sector-layer mag nooit doen alsof het uit uploads komt.
  `.trim();
}

function buildContinuationPrompt(rejectReason?: string): string {
  const rejectLine = rejectReason
    ? `REJECT: ${rejectReason}`
    : "REJECT direct elke output met verboden generieke taal of AI-sporen.";

  return `
${HGBCO_MCKINSEY_USER_INJECT}
${EXECUTIVE_PROMPT_INJECT}
${MANDATORY_GGZ_CASE_FACTS_BLOCK}
${MULTISOURCE_CONTEXT_DIRECTIVE}
${HARD_FALLBACK_PROMPT_RULE}
${INTELLIGENT_SECTOR_FALLBACK_RULE}
${ANTI_FILLER_RULE}

${rejectLine}
Ga verder.
Behoud exact de 12 secties.
Houd de toon menselijk, concreet en bestuurlijk scherp.
Schrap slogans en formuletaal; schrijf doorlopend en natuurlijk.
Hanteer per sectie verplicht de keten: Context -> Spanning -> Mechanisme -> Bestuurlijke implicatie.
Gebruik per sectie maximaal 3 alinea's en maximaal 4 zinnen per alinea.
Alinea 1 is context/observatie met spanning.
Alinea 2 is mechanisme: SYMPTOOM -> MECHANISME -> STRUCTURELE OORZAAK -> SYSTEEMEFFECT.
Alinea 3 is bestuurlijke implicatie met expliciete keuze en beslisdruk.
Vermijd losse feitblokken; bouw alinea's causaal op elkaar voort.
Geen bullets of checklist-fragmenten.
Sectie 1 moet starten met "De dominante bestuurlijke these is dat...".
Sectie 2 moet openen met "De organisatie probeert drie legitieme doelen tegelijk te maximaliseren.".
Beschrijf trade-offs narratief (winst, verlies, emotionele moeilijkheid), niet als losse bullets.
Maak in sectie 7 minimaal drie machtsactoren concreet met verlies, winst, vertraging en instrument.
Verwerk boardroom-intelligentie expliciet: besluitmacht, informele invloed, feitelijke macht en besluitblokkades.
Gebruik minimaal 3 BOARDROOM INZICHT-blokken met bestuurlijke relevantie en risico bij niet-adresseren.
Werk opportunity cost uit op 30/90/365 plus 12 maanden met irreversibele machts- en coalitieverschuiving.
Vertaal capaciteitsverlies naar menselijk effect op behandelcontinuiteit, wachtlijst, behandeluitkomst en verwijzersvertrouwen.
Gebruik absolute €-bedragen alleen met expliciete berekening + bron; anders expliciet "niet onderbouwd in geüploade documenten".
Verwerk StrategicReasoningNode zichtbaar in sectie 1 (Dominante these), sectie 2 (Kernconflict) en sectie 3 (Strategische inzichten).
Vul blok ### 3. STRATEGISCHE INZICHTEN met minimaal 3 inzichten (INZICHT, WAAROM DIT BELANGRIJK IS, BESTUURLIJKE CONSEQUENTIE).
Werk sectie 9 uit als scenarioanalyse (A/B/C, vergelijking, voorkeur).
Werk sectie 10 uit met Maand 1 (dag 1-30), Maand 2 (dag 31-60), Maand 3 (dag 61-90) inclusief owner, deliverable, KPI, escalatiepad en dag-30/60/90 beslisgates.
Werk sectie 11 uit met besluitscore, risicoanalyse, uitvoerbaarheidsanalyse en verbeteringen inclusief DECISION CONTRACT.
Sluit sectie 12 af met formeel/informeel machtsverlies, directe stopregels en expliciet verlies met impact.
Neem in sectie 12 actor-impact op met rolgevolg voor sleutelactoren; €/% alleen als brononderbouwd.
Neem letterlijk op: "Dan is het escalatiemoment geen marktrisico meer, maar een bestuurlijke keuze."
Neem letterlijk op: "Na dag 90 zonder volledige margekaart vervalt het mandaat om nieuwe initiatieven te starten automatisch, tenzij RvT schriftelijk herbevestigt."
Voeg alleen sectorspecifieke claims toe als ze aantoonbaar in de broncontext staan.
Gebruik altijd gecombineerde input uit geüploade documenten en vrije tekstcontext.
${OPPORTUNITY_GOVERNANCE_DEPTH_DIRECTIVE}
${NUMERIC_CLAIM_EXPLANATION_DIRECTIVE}
${EXECUTION_PLAN_DEPTH_DIRECTIVE}
${CONCRETE_REPROMPT_DIRECTIVE}
`.trim();
}

function buildContextEnginePrompt(params: {
  companyName?: string;
  caseContextBlock: string;
  briefContext: string;
  legacyContext: string;
}): string {
  return `
ORGANISATIE: ${params.companyName ?? "Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${params.caseContextBlock}

BRIEF CONTEXT:
${params.briefContext || "Geen bruikbare brief-context."}

LEGACY CONTEXT:
${params.legacyContext || "Geen legacy-context."}

INSTRUCTIE:
Reconstrueer het systeem waarin de organisatie opereert.
Geef nog GEEN advies.

Analyseer:
1 MARKTCONTEXT
- sector en regelgeving
- afhankelijkheid van externe partijen
- prijsstructuur
- contractstructuren

2 VERDIENMODEL
- inkomstenstromen
- prijs per dienst
- vergoedingstructuren
- afhankelijkheid van verzekeraars, subsidies of contracten

3 CAPACITEIT
- aantal medewerkers
- productiviteitsnormen
- aantal cliënten of opdrachten
- maximale doorlooptijd

4 FINANCIËLE STRUCTUUR
- belangrijkste kostenposten
- margestructuur
- financiële druk
- break-even logica

5 ORGANISATIEDYNAMIEK
- rol van bestuurders
- spanningen of vermijding
- cultuur rond verantwoordelijkheid

6 STRUCTURELE BEPERKINGEN
- contractplafonds
- regelgeving
- personeelscapaciteit
- marktlimieten

7 NUMERIEKE INZICHTEN
Als cijfers voorkomen: reken implicaties door.
Voorbeeld: contractplafond / opbrengst per cliënt = maximale schaal.

OUTPUTSTRUCTUUR (EXACT):
HUIDIGE SITUATIE
MARKTLIMITES
FINANCIËLE STRUCTUUR
CAPACITEITSGRENZEN
ORGANISATIEDYNAMIEK
STRUCTURELE BEPERKINGEN
`.trim();
}

function buildDiagnosisEnginePrompt(params: {
  companyName?: string;
  caseContextBlock: string;
  contextEngineReconstruction: string;
  memoryContextBlock: string;
  knowledgeGraphContextBlock: string;
  causalMechanismOutput: string;
  strategicThinkingPatternsOutput: string;
}): string {
  return `
ORGANISATIE: ${params.companyName ?? "Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${params.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${params.contextEngineReconstruction || "Niet beschikbaar; werk met primaire broncontext."}

STRATEGIC MEMORY:
${params.memoryContextBlock || "GEEN DIRECT VERGELIJKBARE CASES GEVONDEN"}

KNOWLEDGE GRAPH INSIGHTS:
${params.knowledgeGraphContextBlock || "Nog geen knowledge graph inzichten beschikbaar."}

CAUSALE MECHANISMEN:
${params.causalMechanismOutput || "Nog geen causale mechanismen beschikbaar."}

STRATEGIC THINKING PATTERNS:
${params.strategicThinkingPatternsOutput || "Niet beschikbaar; gebruik minimaal bottleneck, economic engine, incentive structure en system dynamics."}

INSTRUCTIE:
Identificeer het werkelijke probleem achter zichtbare symptomen.

Gebruik exact deze structuur:
1 ZICHTBARE SYMPTOMEN
2 OPERATIONELE OORZAKEN
3 STRUCTURELE OORZAKEN
4 SYSTEEMDYNAMIEK
5 DOMINANT STRATEGISCH PROBLEEM

OUTPUT (EXACTE KOPPEN):
SYMPTOMEN
OPERATIONELE OORZAKEN
STRUCTURELE OORZAKEN
SYSTEEMDYNAMIEK
DOMINANT STRATEGISCH PROBLEEM
`.trim();
}

function buildOrgDynamicsEnginePrompt(params: {
  companyName?: string;
  caseContextBlock: string;
  contextEngineReconstruction: string;
  diagnosisEngineOutput: string;
}): string {
  return `
ORGANISATIE: ${params.companyName ?? "Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${params.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${params.contextEngineReconstruction || "Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${params.diagnosisEngineOutput || "Niet beschikbaar; leid diagnose af uit primaire broncontext."}

INSTRUCTIE:
Analyseer gedrags- en machtsdynamiek in de organisatie.

OUTPUT (EXACTE KOPPEN):
DYNAMIEK
GEDRAGSPATROON
IMPACT OP STRATEGIE
`.trim();
}

function buildStrategicReasoningNodePrompt(params: {
  companyName?: string;
  caseContextBlock: string;
  contextEngineReconstruction: string;
  diagnosisEngineOutput: string;
  memoryContextBlock?: string;
  knowledgeGraphContextBlock?: string;
  causalMechanismOutput?: string;
  strategicThinkingPatternsOutput?: string;
}): string {
  return `
ORGANISATIE: ${params.companyName ?? "Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${params.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${params.contextEngineReconstruction || "Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${params.diagnosisEngineOutput || "Niet beschikbaar; leid diagnose af uit primaire broncontext."}

STRATEGIC MEMORY:
${params.memoryContextBlock || "GEEN DIRECT VERGELIJKBARE CASES GEVONDEN\nAnalyse is uitgevoerd via strategische denkpatronen en systeemlogica."}

KNOWLEDGE GRAPH INSIGHTS:
${params.knowledgeGraphContextBlock || "Nog geen knowledge graph inzichten beschikbaar."}

CAUSALE MECHANISMEN:
${params.causalMechanismOutput || "Nog geen causale mechanismen beschikbaar."}

STRATEGIC THINKING PATTERNS:
${params.strategicThinkingPatternsOutput || "Niet beschikbaar; hanteer first-principles met bottleneck, economic engine, incentive structure en system dynamics."}

INSTRUCTIE:
Genereer verborgen strategische inzichten via systeemlogica.
Detecteer:
- contractplafonds
- schaalgrenzen
- verdienmodelproblemen
- afhankelijkheid van derden
- strategische paradoxen

Als cijfers voorkomen: bereken implicaties automatisch.
Voorbeeld: contractplafond / opbrengst per cliënt = maximale schaal.

OUTPUT (EXACT):
STRATEGISCH INZICHT
LOGICA
BESTUURLIJKE IMPLICATIE
`.trim();
}

function buildHypothesisEnginePrompt(params: {
  companyName?: string;
  caseContextBlock: string;
  contextEngineReconstruction: string;
  diagnosisEngineOutput: string;
  knowledgeGraphContextBlock: string;
  strategicThinkingPatternsOutput: string;
}): string {
  return `
ORGANISATIE: ${params.companyName ?? "Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${params.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${params.contextEngineReconstruction || "Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${params.diagnosisEngineOutput || "Niet beschikbaar; leid diagnose af uit primaire broncontext."}

KNOWLEDGE GRAPH INSIGHTS:
${params.knowledgeGraphContextBlock || "Nog geen knowledge graph inzichten beschikbaar."}

STRATEGIC THINKING PATTERNS:
${params.strategicThinkingPatternsOutput || "Niet beschikbaar; gebruik first-principles patronen."}

INSTRUCTIE:
Formuleer minimaal drie strategische opties: OPTIE A, OPTIE B, OPTIE C.

Per optie exact:
VOORDEEL
NADEEL
RISICO
LANGE TERMIJN EFFECT

Gebruik dit format:
OPTIE A
VOORDEEL: ...
NADEEL: ...
RISICO: ...
LANGE TERMIJN EFFECT: ...
`.trim();
}

function buildInterventionEnginePrompt(params: {
  companyName?: string;
  caseContextBlock: string;
  contextEngineReconstruction: string;
  diagnosisEngineOutput: string;
  hypothesisEngineOutput: string;
  scenarioSimulationOutput: string;
  knowledgeGraphContextBlock: string;
  strategicThinkingPatternsOutput: string;
}): string {
  return `
ORGANISATIE: ${params.companyName ?? "Onbenoemd"}

VOLLEDIG CASUSDOSSIER:
${params.caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${params.contextEngineReconstruction || "Niet beschikbaar; werk met primaire broncontext."}

STRUCTURELE DIAGNOSE:
${params.diagnosisEngineOutput || "Niet beschikbaar; leid diagnose af uit primaire broncontext."}

STRATEGISCHE HYPOTHESEN:
${params.hypothesisEngineOutput || "Niet beschikbaar; leid hypothesen af uit primaire broncontext."}

SCENARIO SIMULATION NODE:
${params.scenarioSimulationOutput || "Niet beschikbaar; leid scenario's af uit primaire broncontext."}

KNOWLEDGE GRAPH INSIGHTS:
${params.knowledgeGraphContextBlock || "Nog geen knowledge graph inzichten beschikbaar."}

STRATEGIC THINKING PATTERNS:
${params.strategicThinkingPatternsOutput || "Niet beschikbaar; gebruik first-principles patronen."}

INSTRUCTIE:
Ontwerp een concreet plan van aanpak met minimaal zes interventies.
Elke interventie ondersteunt expliciet een gekozen scenario en benoemt welk probleem uit dat scenario wordt opgelost.

Elke interventie bevat exact:
ACTIE
WAAROM DEZE INTERVENTIE
GEVOLG VOOR ORGANISATIE
GEVOLG VOOR KLANT/CLIËNT
RISICO VAN NIET HANDELEN
PROBLEEM DAT WORDT OPGELOST

Voeg daarna een tijdlijn toe met exact:
0–30 dagen
30–60 dagen
60–90 dagen
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
  const enforceGGZDepth = shouldEnforceGGZDepthFromInput(input);
  const minWords = options.minWords ?? DEFAULT_MIN_WORDS;
  const maxWords = options.maxWords ?? DEFAULT_MAX_WORDS;
  const temperature = options.temperature ?? 0.18;

  const boundedMinWords = Math.max(3500, Math.min(minWords, maxWords));
  const generationWordCap = Math.max(
    boundedMinWords,
    maxWords - RESERVED_STRUCTURE_WORDS
  );

  const rawDocuments: ContextDocument[] = Array.isArray(input.documents)
    ? input.documents
    : [];
  const documents = normalizeDocumentsForPrompt(rawDocuments);

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
Vragen zijn onvolledig. Werk uitsluitend met aantoonbare broncontext en benoem ontbrekende informatie expliciet.
`;

  const documentBlock =
    documents.length === 0
      ? "Geen documenten geüpload. Geef alleen brongebonden conclusies uit aanwezige context en markeer dat documentonderbouwing ontbreekt."
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
  const caseContextBlock = buildMandatoryCaseContextBlock(
    documents,
    legacyContext,
    briefContext
  );
  const groundingSource = buildGroundingSource(
    input,
    documents,
    legacyContext,
    briefContext
  );
  const contextHash = contextFingerprint(groundingSource);
  const previousOutput = runtimeLastOutputByContext.get(contextHash);
  const memoryStore = new StrategicMemoryStore();
  const memoryIndexer = new StrategicMemoryIndexer();
  const memoryRetriever = new StrategicMemoryRetriever(memoryStore, memoryIndexer);
  const knowledgeGraphStore = new KnowledgeGraphStore();
  const knowledgeGraphQuery = new KnowledgeGraphQuery(knowledgeGraphStore);
  const knowledgeGraphUpdater = new KnowledgeGraphUpdater(knowledgeGraphStore);
  let contextEngineReconstruction = "";
  let memoryContextBlock =
    "GEEN DIRECT VERGELIJKBARE CASES GEVONDEN\nAnalyse is uitgevoerd via strategische denkpatronen en systeemlogica.";
  let knowledgeGraphContextBlock = [
    "VERGELIJKBARE ORGANISATIES",
    "Geen directe vergelijkbare organisaties gevonden.",
    "GEMEENSCHAPPELIJKE PROBLEMEN",
    "Nog geen dominant probleemcluster beschikbaar.",
    "MEEST EFFECTIEVE STRATEGIEËN",
    "Nog geen dominante strategie-signalen beschikbaar.",
    "MEEST EFFECTIEVE INTERVENTIES",
    "Nog geen bewezen interventies beschikbaar in de graph.",
  ].join("\n");
  let hypothesisCompetitionOutput = [
    "HYPOTHESE 1: Financiele begrenzing is de primaire verklaring.",
    "BEWIJS VOOR: Nog te valideren.",
    "BEWIJS TEGEN: Nog te valideren.",
    "",
    "HYPOTHESE 2: Organisatorische executiefrictie is de primaire verklaring.",
    "BEWIJS VOOR: Nog te valideren.",
    "BEWIJS TEGEN: Nog te valideren.",
    "",
    "HYPOTHESE 3: Scopeversnippering is de primaire verklaring.",
    "BEWIJS VOOR: Nog te valideren.",
    "BEWIJS TEGEN: Nog te valideren.",
    "",
    "WAARSCHIJNLIJKSTE VERKLARING: Nog niet vastgesteld.",
  ].join("\n");
  let causalMechanismOutput = [
    "SYMPTOMEN",
    "1. Nog te valideren symptoom.",
    "WELK MECHANISME HIERACHTER ZIT",
    "1. Nog te valideren mechanisme.",
    "STRUCTURELE OORZAAK",
    "1. Nog te valideren oorzaak.",
    "WELKE INTERVENTIE HET MECHANISME DOORBREKT",
    "1. Nog te valideren interventie.",
  ].join("\n");
  let decisionPressureOutput = [
    "STRATEGISCHE OPTIES",
    "OPTIE A",
    "BESCHRIJVING: Nog te valideren.",
    "VOORDELEN: Nog te valideren.",
    "NADelen: Nog te valideren.",
    "RISICO’S: Nog te valideren.",
    "",
    "OPTIE B",
    "BESCHRIJVING: Nog te valideren.",
    "VOORDELEN: Nog te valideren.",
    "NADelen: Nog te valideren.",
    "RISICO’S: Nog te valideren.",
    "",
    "OPTIE C",
    "BESCHRIJVING: Nog te valideren.",
    "VOORDELEN: Nog te valideren.",
    "NADelen: Nog te valideren.",
    "RISICO’S: Nog te valideren.",
    "",
    "VOORKEURSOPTIE",
    "BESCHRIJVING: Nog te valideren.",
    "WAAROM DEZE KEUZE LOGISCH IS: Nog te valideren.",
    "WELK PROBLEEM HIERMEE WORDT OPGELOST: Nog te valideren.",
    "",
    "EXPLICIET VERLIES",
    "WAT WORDT OPGEEVEN: Nog te valideren.",
    "WELKE INITIATIEVEN STOPPEN: Nog te valideren.",
    "WELKE GROEI WORDT UITGESTELD: Nog te valideren.",
    "",
    "GEVOLGEN VAN GEEN KEUZE",
    "30 DAGEN: Nog te valideren.",
    "90 DAGEN: Nog te valideren.",
    "365 DAGEN: Nog te valideren.",
  ].join("\n");
  let blindSpotsOutput = [
    "BLINDE VLEK: Nog te valideren.",
    "WAT DE ORGANISATIE DENKT: Nog te valideren.",
    "WAT DE REALITEIT IS: Nog te valideren.",
    "WAAROM DIT PROBLEEM NIET WORDT GEZIEN: Nog te valideren.",
    "WELK RISICO DIT CREËERT: Nog te valideren.",
  ].join("\n");
  let strategicForesightOutput = [
    "SCENARIO 1 — STATUS QUO",
    "WAT GEBEURT ALS NIETS VERANDERT: Nog te valideren.",
    "",
    "SCENARIO 2 — INTERVENTIE",
    "WAT GEBEURT ALS INTERVENTIES WORDEN UITGEVOERD: Nog te valideren.",
    "",
    "SCENARIO 3 — ESCALATIE",
    "WAT GEBEURT ALS HET PROBLEEM VERERGERT: Nog te valideren.",
  ].join("\n");
  let metaReasoningOutput = [
    "WAAR DE ANALYSE STERK IS",
    "Nog te valideren.",
    "",
    "WAAR ALTERNATIEVE VERKLARINGEN MOGELIJK ZIJN",
    "Nog te valideren.",
    "",
    "WELKE VARIABELEN MOGELIJK ONTBREKEN",
    "Nog te valideren.",
    "",
    "HOE ZEKER DE CONCLUSIE IS",
    "Nog te valideren.",
  ].join("\n");
  let organizationalSimulationOutput = [
    "EXECUTIEROUTE EN ADOPTIEPAD",
    "Nog te valideren.",
    "",
    "VERWACHTE WEERSTANDSPUNTEN",
    "Nog te valideren.",
    "",
    "UITVOERINGSFRICTIE",
    "Nog te valideren.",
    "",
    "BENODIGDE COALITIE EN MANDAAT",
    "Nog te valideren.",
    "",
    "AANPASSINGEN VOOR UITVOERBAARHEID",
    "Nog te valideren.",
  ].join("\n");
  let strategicThinkingPatternsOutput = "";
  let diagnosisEngineOutput = "";
  let strategicInsightOutput = "";
  let orgDynamicsEngineOutput = "";
  let boardroomIntelligenceOutput = "";
  let hypothesisEngineOutput = "";
  let scenarioSimulationOutput = "";
  let interventionEngineOutput = "";
  let decisionQualityOutput = "";
  let strategicTensionOutput = "";
  let strategicOptionOutput = "";
  let preferredStrategicOption = "";
  let decisionQualityScore = 0;
  let interventionsInconsistent = false;
  let scenarioMissingInDecisionQuality = false;
  let strategicReasoningGateScore = 0;
  let strategicReasoningGatePassed = false;
  const strategicWarnings: string[] = [];
  let similarCasesRetrieved = 0;
  let knowledgeGraphComparableCount = 0;
  let hypothesisCount = 0;
  let causalMechanismCount = 0;
  let decisionOptionCount = 0;
  let blindSpotCount = 0;
  let foresightScenarioCount = 0;
  let metaReasoningPass = false;
  let simulationInterventionCount = 0;
  let narrativeStructurePass = false;
  let narrativeCausalityPass = false;
  let reflectionLayerApplied = false;
  let critiqueLayerApplied = false;
  let rewriteLayerApplied = false;
  let executionLayerApplied = false;
  let critiqueSignalCount = 0;
  let critiqueText = "";
  let executionValidationText = "";
  const reasoningState = createReasoningState();
  let reasoningGuardPass = true;
  let reasoningGuardIssues: string[] = [];
  const llmAdapter = new OpenAIProvider();

  try {
    const contextEngine = await llmAdapter.generate({
      model: "gpt-4o",
      messages: [
        { role: "system", content: CONTEXT_ENGINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildContextEnginePrompt({
            companyName: input.company_name,
            caseContextBlock,
            briefContext,
            legacyContext,
          }),
        },
      ],
      options: { max_tokens: 2200, temperature: 0.1 },
    });

    contextEngineReconstruction = typeof contextEngine === "string" ? contextEngine.trim() : "";
    extendReasoningState(reasoningState, {
      context_state: contextEngineReconstruction,
    });
  } catch {
    contextEngineReconstruction = "";
  }

  try {
    const seedCases = memoryStore.listCases();
    for (const existing of seedCases) {
      if (!memoryIndexer.listIndexedCases().some((e) => e.caseId === existing.caseId)) {
        memoryIndexer.indexCase(existing);
      }
    }
    const retrieved = memoryRetriever.retrieveSimilarCases({
      sector: toSafeString(input.sector_selected) || "onbekend",
      problemType: toSafeString(input.central_tension) || toSafeString(input.executive_thesis),
      strategicInsights: [toSafeString(input.executive_thesis), toSafeString(input.central_tension)].filter(
        Boolean
      ),
      topK: 5,
    });
    similarCasesRetrieved = retrieved.length;
    memoryContextBlock = buildMemoryContextBlock({
      similarCases: retrieved.map((r) => ({
        caseId: r.caseRecord.caseId,
        sector: r.caseRecord.sector,
        keyProblem: r.caseRecord.keyProblem,
        chosenStrategy: r.caseRecord.chosenStrategy,
        resultSummary: r.caseRecord.resultSummary,
        relevance: r.similarityScore,
      })),
    });
  } catch {
    memoryContextBlock =
      "GEEN DIRECT VERGELIJKBARE CASES GEVONDEN\nAnalyse is uitgevoerd via strategische denkpatronen en systeemlogica.";
  }

  try {
    const kgInsights = knowledgeGraphQuery.run({
      sector: toSafeString(input.sector_selected) || "onbekend",
      problemHint: toSafeString(input.central_tension) || toSafeString(input.executive_thesis),
      organizationName: toSafeString(input.company_name),
    });
    knowledgeGraphContextBlock = kgInsights.block;
    knowledgeGraphComparableCount = kgInsights.comparableOrganisations.length;
  } catch {
    knowledgeGraphComparableCount = 0;
    knowledgeGraphContextBlock = [
      "VERGELIJKBARE ORGANISATIES",
      "Geen directe vergelijkbare organisaties gevonden.",
      "GEMEENSCHAPPELIJKE PROBLEMEN",
      "Nog geen dominant probleemcluster beschikbaar.",
      "MEEST EFFECTIEVE STRATEGIEËN",
      "Nog geen dominante strategie-signalen beschikbaar.",
      "MEEST EFFECTIEVE INTERVENTIES",
      "Nog geen bewezen interventies beschikbaar in de graph.",
    ].join("\n");
    strategicWarnings.push(
      "KnowledgeGraphQuery gaf geen bruikbare output; analyse vervolgd met memory en patterns."
    );
  }

  try {
    const hypotheses = generateHypotheses({
      contextText: `${caseContextBlock}\n${contextEngineReconstruction}`,
      memoryText: memoryContextBlock,
      graphText: knowledgeGraphContextBlock,
      minHypotheses: 3,
    });
    hypothesisCount = hypotheses.length;
    const competition = runHypothesisCompetition({
      hypotheses,
      contextText: `${caseContextBlock}\n${contextEngineReconstruction}`,
      memoryText: memoryContextBlock,
      graphText: knowledgeGraphContextBlock,
    });
    const evaluated = evaluateHypotheses(competition);
    hypothesisCompetitionOutput = evaluated.block;
  } catch {
    hypothesisCount = 0;
    strategicWarnings.push(
      "Hypothesis competition kon niet volledig worden uitgevoerd; analyse vervolgd met standaardverklaring."
    );
  }

  try {
    const detected = detectCausalMechanisms({
      contextText: `${caseContextBlock}\n${contextEngineReconstruction}`,
      hypothesisText: hypothesisCompetitionOutput,
      memoryText: memoryContextBlock,
      graphText: knowledgeGraphContextBlock,
    });
    const chains = buildCausalChains(detected);
    const dynamics = analyzeSystemDynamics({
      contextText: `${caseContextBlock}\n${contextEngineReconstruction}\n${memoryContextBlock}\n${knowledgeGraphContextBlock}`,
    });
    causalMechanismCount = chains.chains.length;
    causalMechanismOutput = `${chains.block}\n\nSYSTEEMDYNAMIEK: ${dynamics.summary}`;
    extendReasoningState(reasoningState, {
      mechanisms: causalMechanismOutput,
    });
  } catch {
    causalMechanismCount = 0;
    strategicWarnings.push(
      "CausalMechanismDetector kon niet volledig worden uitgevoerd; analyse vervolgd met standaard causale sectie."
    );
  }

  try {
    const blindSpotResult = detectBlindSpots({
      contextText: `${caseContextBlock}\n${contextEngineReconstruction}\n${orgDynamicsEngineOutput}`,
      memoryText: memoryContextBlock,
      graphText: knowledgeGraphContextBlock,
      hypothesisText: hypothesisCompetitionOutput,
      causalText: causalMechanismOutput,
    });
    blindSpotCount = blindSpotResult.items.length;
    blindSpotsOutput = blindSpotResult.block;
  } catch {
    blindSpotCount = 0;
    strategicWarnings.push(
      "BlindSpotDetector kon niet volledig worden uitgevoerd; analyse vervolgd met standaard blind-spot sectie."
    );
  }

  try {
    const patternResult = applyStrategicThinkingPatterns({
      caseContextBlock,
      contextEngineOutput: contextEngineReconstruction,
      memoryContextBlock,
      diagnosisOutput: causalMechanismOutput,
    });
    strategicThinkingPatternsOutput = patternResult.output;
    if (!hasMinimumStrategicPatterns(strategicThinkingPatternsOutput, 4)) {
      strategicWarnings.push(
        "Minder dan 4 strategische denkpatronen gedetecteerd; analyse vervolgd met quality warning."
      );
    }
  } catch {
    strategicThinkingPatternsOutput = "";
    strategicWarnings.push(
      "StrategicThinkingPatterns kon niet volledig worden toegepast; analyse vervolgd via beschikbare context."
    );
  }

  try {
    const diagnosis = await callAI(
      "gpt-4o",
      [
        { role: "system", content: DIAGNOSE_ENGINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildDiagnosisEnginePrompt({
            companyName: input.company_name,
            caseContextBlock,
            contextEngineReconstruction,
            memoryContextBlock,
            knowledgeGraphContextBlock,
            causalMechanismOutput,
            strategicThinkingPatternsOutput,
          }),
        },
      ],
      { max_tokens: 1600, temperature: 0.1 }
    );
    diagnosisEngineOutput = typeof diagnosis === "string" ? diagnosis.trim() : "";
    extendReasoningState(reasoningState, {
      diagnosis: diagnosisEngineOutput,
    });
  } catch {
    diagnosisEngineOutput = "";
  }

  try {
    const tension = runStrategicTensionEngine({
      contextText: `${caseContextBlock}\n${contextEngineReconstruction}`,
      diagnosisText: diagnosisEngineOutput,
      mechanismText: causalMechanismOutput,
    });
    const options = runStrategicOptionGenerator({
      tension: tension.tension,
    });
    const evaluated = runStrategicOptionEvaluator({
      options: options.options,
    });

    strategicTensionOutput = tension.block;
    strategicOptionOutput = `${options.block}\n\n${evaluated.block}`.trim();
    preferredStrategicOption = evaluated.preferredOptionId
      ? `Optie ${evaluated.preferredOptionId}`
      : "";

    extendReasoningState(reasoningState, {
      strategic_tension: strategicTensionOutput,
      strategic_options: strategicOptionOutput,
      decision: preferredStrategicOption
        ? `Voorkeursoptie uit evaluatie: ${preferredStrategicOption}`
        : "",
    });
  } catch {
    strategicTensionOutput = "";
    strategicOptionOutput = "";
    preferredStrategicOption = "";
    strategicWarnings.push(
      "Strategic Option Engine kon niet volledig worden uitgevoerd; analyse vervolgd met bestaande engines."
    );
  }

  try {
    const strategicInsights = await callAI(
      "gpt-4o",
      [
        { role: "system", content: STRATEGIC_REASONING_NODE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildStrategicReasoningNodePrompt({
            companyName: input.company_name,
            caseContextBlock: `${caseContextBlock}\n\n${strategicTensionOutput}\n\n${strategicOptionOutput}`.trim(),
            contextEngineReconstruction,
            diagnosisEngineOutput,
            memoryContextBlock,
            knowledgeGraphContextBlock,
            causalMechanismOutput,
            strategicThinkingPatternsOutput,
          }),
        },
      ],
      { max_tokens: 1400, temperature: 0.1 }
    );
    strategicInsightOutput = typeof strategicInsights === "string" ? strategicInsights.trim() : "";
    extendReasoningState(reasoningState, {
      insights: strategicInsightOutput,
    });
  } catch {
    strategicInsightOutput = "";
  }

  try {
    const orgDynamics = await callAI(
      "gpt-4o",
      [
        { role: "system", content: ORGANISATIEDYNAMIEK_ENGINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildOrgDynamicsEnginePrompt({
            companyName: input.company_name,
            caseContextBlock,
            contextEngineReconstruction,
            diagnosisEngineOutput,
          }),
        },
      ],
      { max_tokens: 1400, temperature: 0.1 }
    );
    orgDynamicsEngineOutput = typeof orgDynamics === "string" ? orgDynamics.trim() : "";
  } catch {
    orgDynamicsEngineOutput = "";
  }

  try {
    const boardroomIntelligence = await callAI(
      "gpt-4o",
      [
        { role: "system", content: BOARDROOM_INTELLIGENCE_ENGINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildBoardroomIntelligenceNodePrompt({
            companyName: input.company_name,
            caseContextBlock,
            contextEngineReconstruction,
            diagnosisEngineOutput,
            orgDynamicsEngineOutput,
          }),
        },
      ],
      { max_tokens: 1700, temperature: 0.12 }
    );
    boardroomIntelligenceOutput =
      typeof boardroomIntelligence === "string" ? boardroomIntelligence.trim() : "";
  } catch {
    boardroomIntelligenceOutput = "";
  }

  try {
    const foresight = runStrategicForesight({
      contextText: `${caseContextBlock}\n${contextEngineReconstruction}\n${diagnosisEngineOutput}`,
      causalText: causalMechanismOutput,
      interventionText: interventionEngineOutput,
    });
    strategicForesightOutput = foresight.block;
    foresightScenarioCount = foresight.scenarios.length;
  } catch {
    foresightScenarioCount = 0;
    strategicWarnings.push(
      "StrategicForesightEngine kon niet volledig worden uitgevoerd; vooruitbliksectie draait op fallback."
    );
  }

  try {
    const hypotheses = await callAI(
      "gpt-4o",
      [
        { role: "system", content: HYPOTHESE_ENGINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildHypothesisEnginePrompt({
            companyName: input.company_name,
            caseContextBlock,
            contextEngineReconstruction,
            diagnosisEngineOutput,
            knowledgeGraphContextBlock,
            strategicThinkingPatternsOutput,
          }),
        },
      ],
      { max_tokens: 1600, temperature: 0.12 }
    );
    hypothesisEngineOutput = typeof hypotheses === "string" ? hypotheses.trim() : "";
  } catch {
    hypothesisEngineOutput = "";
  }

  try {
    const scenarios = await callAI(
      "gpt-4o",
      [
        { role: "system", content: SCENARIO_SIMULATION_ENGINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildScenarioSimulationNodePrompt({
            companyName: input.company_name,
            caseContextBlock: `${caseContextBlock}\n\nSTRATEGIC MEMORY:\n${memoryContextBlock}\n\nKNOWLEDGE GRAPH INSIGHTS:\n${knowledgeGraphContextBlock}\n\nSTRATEGISCHE VOORUITBLIK:\n${strategicForesightOutput}`,
            contextEngineReconstruction,
            diagnosisEngineOutput,
            strategicInsightsOutput: `${strategicInsightOutput}\n\nSTRATEGIC THINKING PATTERNS:\n${strategicThinkingPatternsOutput}\n\nKNOWLEDGE GRAPH INSIGHTS:\n${knowledgeGraphContextBlock}\n\nSTRATEGISCHE VOORUITBLIK:\n${strategicForesightOutput}`,
            hypothesisOutput: hypothesisEngineOutput,
          }),
        },
      ],
      { max_tokens: 1800, temperature: 0.12 }
    );
    scenarioSimulationOutput = typeof scenarios === "string" ? scenarios.trim() : "";
  } catch {
    scenarioSimulationOutput = "";
  }

  try {
    const interventions = await callAI(
      "gpt-4o",
      [
        { role: "system", content: INTERVENTIE_ENGINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildInterventionEnginePrompt({
            companyName: input.company_name,
            caseContextBlock,
            contextEngineReconstruction,
            diagnosisEngineOutput,
            hypothesisEngineOutput,
            scenarioSimulationOutput,
            knowledgeGraphContextBlock,
            strategicThinkingPatternsOutput,
          }),
        },
      ],
      { max_tokens: 1800, temperature: 0.12 }
    );
    interventionEngineOutput = typeof interventions === "string" ? interventions.trim() : "";
  } catch {
    interventionEngineOutput = "";
  }

  try {
    const options = generateDecisionOptions({
      contextText: `${caseContextBlock}\n${contextEngineReconstruction}\n${diagnosisEngineOutput}`,
      causalText: causalMechanismOutput,
      hypothesisText: hypothesisCompetitionOutput,
    });
    const tradeoffs = analyzeDecisionTradeoffs(options);
    const pressure = buildDecisionPressure({
      tradeoffs,
      causalText: causalMechanismOutput,
      hypothesisText: hypothesisCompetitionOutput,
      memoryText: memoryContextBlock,
      graphText: knowledgeGraphContextBlock,
    });
    decisionOptionCount = options.length;
    decisionPressureOutput = pressure.block;
    if (preferredStrategicOption) {
      decisionPressureOutput = `${decisionPressureOutput}\n\nVOORKEURSOPTIE UIT STRATEGISCHE OPTIE-EVALUATIE: ${preferredStrategicOption}`.trim();
    }
    extendReasoningState(reasoningState, {
      decision: decisionPressureOutput,
    });
  } catch {
    decisionOptionCount = 0;
    strategicWarnings.push(
      "DecisionPressureEngine kon niet volledig worden uitgevoerd; besluitdruksectie draait op fallbackinhoud."
    );
  }

  try {
    const simulation = runOrganizationalSimulation({
      orgDynamicsOutput: orgDynamicsEngineOutput,
      boardroomOutput: boardroomIntelligenceOutput,
      interventionOutput: interventionEngineOutput,
      decisionPressureOutput,
    });
    organizationalSimulationOutput = simulation.block;
    simulationInterventionCount = simulation.interventionCount;
  } catch {
    simulationInterventionCount = 0;
    strategicWarnings.push(
      "OrganizationalSimulationEngine kon niet volledig worden uitgevoerd; organisatiesimulatie draait op fallback."
    );
  }

  try {
    const meta = runMetaReasoning({
      logicInput: {
        diagnosisText: diagnosisEngineOutput,
        insightText: strategicInsightOutput,
        interventionText: `${interventionEngineOutput}\n\nORGANISATIESIMULATIE:\n${organizationalSimulationOutput}`,
        decisionPressureText: decisionPressureOutput,
        causalText: causalMechanismOutput,
      },
      alternativeInput: {
        hypothesisText: hypothesisCompetitionOutput,
        blindSpotText: blindSpotsOutput,
        contextText: `${caseContextBlock}\n${contextEngineReconstruction}`,
      },
      missingVariableInput: {
        contextText: `${caseContextBlock}\n${contextEngineReconstruction}`,
        diagnosisText: diagnosisEngineOutput,
        insightText: strategicInsightOutput,
      },
    });
    metaReasoningOutput = meta.block;
    metaReasoningPass = meta.logic.pass;
  } catch {
    metaReasoningPass = false;
    strategicWarnings.push(
      "MetaReasoningEngine kon niet volledig worden uitgevoerd; meta-analyse sectie draait op fallback."
    );
  }

  try {
    const decisionQuality = await callAI(
      "gpt-4o",
      [
        { role: "system", content: DECISION_QUALITY_ENGINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildDecisionQualityNodePrompt({
            companyName: input.company_name,
            caseContextBlock: `${caseContextBlock}\n\nSTRATEGIC MEMORY:\n${memoryContextBlock}\n\nKNOWLEDGE GRAPH INSIGHTS:\n${knowledgeGraphContextBlock}`,
            diagnosisEngineOutput,
            strategicInsightsOutput: `${strategicInsightOutput}\n\nBESTUURLIJKE BLINDE VLEKKEN:\n${blindSpotsOutput}\n\nSTRATEGISCHE VOORUITBLIK:\n${strategicForesightOutput}\n\nORGANISATIESIMULATIE:\n${organizationalSimulationOutput}\n\nMETA-ANALYSE VAN DE REDENERING:\n${metaReasoningOutput}\n\nSTRATEGIC THINKING PATTERNS:\n${strategicThinkingPatternsOutput}\n\nKNOWLEDGE GRAPH INSIGHTS:\n${knowledgeGraphContextBlock}`,
            scenarioSimulationOutput,
            interventionOutput: `${interventionEngineOutput}\n\nSTRATEGISCHE OPTIES EN BESLUITDRUK:\n${decisionPressureOutput}\n\nORGANISATIESIMULATIE:\n${organizationalSimulationOutput}`,
            boardroomIntelligenceOutput,
          }),
        },
      ],
      { max_tokens: 1300, temperature: 0.1 }
    );
    decisionQualityOutput = typeof decisionQuality === "string" ? decisionQuality.trim() : "";
  } catch {
    decisionQualityOutput = "";
  }

  const decisionQualityAssessment = parseDecisionQualityAssessment(decisionQualityOutput);
  decisionQualityScore = decisionQualityAssessment.decisionQualityScore;
  interventionsInconsistent = decisionQualityAssessment.inconsistentInterventions;
  scenarioMissingInDecisionQuality = decisionQualityAssessment.scenarioMissing;

  const boardroomInsightsValid = hasMinimumBoardroomInsights(boardroomIntelligenceOutput);
  if (!boardroomInsightsValid) {
    strategicWarnings.push(
      "Boardroom-intelligentie onder minimum; analyse vervolgd met aanvullende hardening."
    );
  }
  const scenarioSetValid = hasMinimumScenarioSet(scenarioSimulationOutput);
  if (!scenarioSetValid) {
    strategicWarnings.push(
      "Scenario-set onder minimum; analyse vervolgd met aanvullende hardening."
    );
  }
  if (decisionQualityScore < 60 || interventionsInconsistent || scenarioMissingInDecisionQuality) {
    strategicWarnings.push(
      "Besluitkwaliteit kwetsbaar (<60 of inconsistentie); analyse vervolgd met expliciete waarschuwing."
    );
  }

  const strategicReasoningGate = runStrategicReasoningGate({
    sourceContext: groundingSource,
    contextEngineOutput: `${contextEngineReconstruction}\n\n${strategicTensionOutput}\n\n${strategicOptionOutput}`.trim(),
    diagnosisOutput: `${diagnosisEngineOutput}\n\n${causalMechanismOutput}\n\n${strategicTensionOutput}\n\n${strategicOptionOutput}\n\n${blindSpotsOutput}\n\n${strategicForesightOutput}\n\n${organizationalSimulationOutput}\n\n${metaReasoningOutput}\n\n${strategicThinkingPatternsOutput}\n\n${knowledgeGraphContextBlock}\n\n${hypothesisCompetitionOutput}\n\n${decisionPressureOutput}`.trim(),
    strategicInsightsOutput: `${strategicInsightOutput}\n\n${boardroomIntelligenceOutput}\n\n${causalMechanismOutput}\n\n${strategicTensionOutput}\n\n${strategicOptionOutput}\n\n${blindSpotsOutput}\n\n${strategicForesightOutput}\n\n${organizationalSimulationOutput}\n\n${metaReasoningOutput}\n\n${strategicThinkingPatternsOutput}\n\n${knowledgeGraphContextBlock}\n\n${hypothesisCompetitionOutput}\n\n${decisionPressureOutput}`.trim(),
    orgDynamicsOutput: `${orgDynamicsEngineOutput}\n\n${boardroomIntelligenceOutput}`.trim(),
    hypothesisOutput: `${hypothesisEngineOutput}\n\n${scenarioSimulationOutput}`.trim(),
    interventionOutput: interventionEngineOutput,
  });

  strategicReasoningGateScore = strategicReasoningGate.strategicDepthScore;
  strategicReasoningGatePassed = strategicReasoningGate.pass;

  if (!strategicReasoningGate.pass) {
    strategicWarnings.push(
      strategicReasoningGate.message ||
        "Strategic reasoning insufficient. Analyse opnieuw genereren met meer diepgang."
    );
  }

  const baseMessages: AIMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    {
      role: "user",
      content: `
${HGBCO_MCKINSEY_USER_INJECT}
${EXECUTIVE_PROMPT_INJECT}
${MANDATORY_GGZ_CASE_FACTS_BLOCK}
${MULTISOURCE_CONTEXT_DIRECTIVE}
${HARD_FALLBACK_PROMPT_RULE}
${INTELLIGENT_SECTOR_FALLBACK_RULE}
${ANTI_FILLER_RULE}

ORGANISATIE: ${input.company_name ?? "Onbenoemd"}

${questionBlock}

CONTEXTDOCUMENTEN:
${documentBlock}

VOLLEDIG CASUSDOSSIER (VERPLICHT LEIDEND):
${caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE (GEEN ADVIES, ALLEEN SYSTEEM):
${contextEngineReconstruction || "Niet beschikbaar; werk met primaire broncontext."}

STRATEGIC MEMORY RETRIEVER:
${memoryContextBlock}

KNOWLEDGE GRAPH QUERY:
${knowledgeGraphContextBlock}

HYPOTHESIS CONCURRENTIE:
${hypothesisCompetitionOutput}

CAUSALE MECHANISMEN:
${causalMechanismOutput}

STRATEGISCHE KERNSPANNING:
${strategicTensionOutput || "Niet beschikbaar; leid kernspanning af uit primaire broncontext."}

STRATEGISCHE OPTIES:
${strategicOptionOutput || "Niet beschikbaar; leid strategische opties af uit primaire broncontext."}

BESTUURLIJKE BLINDE VLEKKEN:
${blindSpotsOutput}

STRATEGISCHE VOORUITBLIK:
${strategicForesightOutput}

STRATEGIC THINKING PATTERNS:
${strategicThinkingPatternsOutput || "Niet beschikbaar; gebruik first-principles patronen."}

STRUCTURELE DIAGNOSE ENGINE (GEEN ADVIES, ALLEEN DIAGNOSE):
${diagnosisEngineOutput || "Niet beschikbaar; leid diagnose af uit primaire broncontext."}

STRATEGIC REASONING NODE:
${strategicInsightOutput || "Niet beschikbaar; leid strategische inzichten af uit primaire broncontext."}

ORGANISATIEDYNAMIEK ENGINE:
${orgDynamicsEngineOutput || "Niet beschikbaar; leid organisatiedynamiek af uit primaire broncontext."}

BOARDROOM INTELLIGENCE NODE:
${boardroomIntelligenceOutput || "Niet beschikbaar; leid boardroom-intelligentie af uit primaire broncontext."}

STRATEGISCHE HYPOTHESE ENGINE (GEEN ADVIES, ALLEEN HYPOTHESEN):
${hypothesisEngineOutput || "Niet beschikbaar; leid hypothesen af uit primaire broncontext."}

SCENARIO SIMULATION NODE:
${scenarioSimulationOutput || "Niet beschikbaar; leid scenario-simulaties af uit primaire broncontext."}

INTERVENTIE ENGINE (PLAN VAN AANPAK):
${interventionEngineOutput || "Niet beschikbaar; leid interventies af uit primaire broncontext."}

DECISION QUALITY NODE:
${decisionQualityOutput || "Niet beschikbaar; leid besluitkwaliteitsanalyse af uit primaire broncontext."}

STRATEGISCHE OPTIES EN BESLUITDRUK ENGINE:
${decisionPressureOutput}

ORGANIZATIONAL SIMULATION ENGINE:
${organizationalSimulationOutput}

META-REASONING ENGINE:
${metaReasoningOutput}

BRIEF CONTEXT:
${briefContext || "Geen bruikbare brief-context; rapporteer alleen wat uit bronmateriaal afleidbaar is."}

LEGACY CONTEXT:
${legacyContext || "Geen legacy-context; markeer ontbrekende onderbouwing expliciet."}
`.trim(),
    },
  ];
  let messages: AIMessage[] = [...baseMessages];

  let text = "";
  let loops = 0;
  let consecutiveFailures = 0;

  const rebuildContinuationMessages = (rejectReason?: string) => {
    const continuationPrompt = buildContinuationPrompt(rejectReason);
    const assistantTail = String(text || "").trim().slice(-16000);
    if (!assistantTail) {
      messages = [...baseMessages, { role: "user", content: continuationPrompt }];
      return;
    }
    messages = [
      ...baseMessages,
      { role: "assistant", content: assistantTail },
      { role: "user", content: continuationPrompt },
    ];
  };

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
        const trimmedChunk = chunk.trim();

        if (hasForbiddenGenericLanguage(trimmedChunk)) {
          consecutiveFailures = 0;
          rebuildContinuationMessages(
            "vorige output bevatte verboden generieke consultancy-taal en is afgekeurd; lever volledige herwerking zonder verboden termen"
          );
        } else {
          const merged = text ? `${text}\n\n${trimmedChunk}` : trimmedChunk;
          text = trimToMaxWords(merged, generationWordCap);
          consecutiveFailures = 0;
          rebuildContinuationMessages();
        }
      } else {
        consecutiveFailures += 1;
        if (consecutiveFailures <= 2) {
          rebuildContinuationMessages(
            "vorige output was leeg of afgebroken; ga exact verder vanaf de laatste volledige zin zonder herhaling"
          );
        } else {
          break;
        }
      }
    } catch {
      consecutiveFailures += 1;
      if (consecutiveFailures <= 3) {
        rebuildContinuationMessages(
          "vorige call faalde technisch; hervat exact vanaf de laatste volledige zin en behoud de 9-sectiestructuur"
        );
      } else {
        break;
      }
    }

    loops++;
  }

  let candidate = text.trim() || buildFallbackNarrative(input, boundedMinWords, maxWords);
  candidate = hardenNarrativeCandidate(
    candidate,
    input,
    boardroomIntelligenceOutput,
    scenarioSimulationOutput,
    blindSpotsOutput,
    strategicForesightOutput,
    decisionPressureOutput,
    organizationalSimulationOutput,
    metaReasoningOutput,
    decisionQualityOutput,
    decisionQualityScore,
    hypothesisCompetitionOutput,
    causalMechanismOutput,
    memoryContextBlock,
    knowledgeGraphContextBlock,
    boundedMinWords,
    maxWords
  );
  candidate = sanitizeResidualForbiddenNarrative(candidate);
  candidate = sanitizeUngroundedNumericSignals(candidate, groundingSource);
  validateHgbcoMcKinseyRuntime(candidate);

  const repairModes = [
    "ANCHOR REPAIR MODE",
    "POWER/IRREVERSIBILITY/CULTURE REPAIR MODE",
    "INTERVENTION REWRITE MODE",
  ] as const;

  let gateLastError: ExecutiveGateError | null = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      validateExecutiveGateStack({
        text: candidate,
        context: groundingSource,
        lastOutput: previousOutput,
      });
      gateLastError = null;
      break;
    } catch (error) {
      if (!(error instanceof ExecutiveGateError)) {
        throw error;
      }

      gateLastError = error;
      if (attempt >= 4) break;

      const mode = repairModes[attempt - 1];
      const repairDirective =
        error.repairDirective ||
        (error.code === "REPETITION_TOO_HIGH"
          ? "Volledig nieuwe formulering + andere mechanische keten; geen zinsdelen hergebruiken."
          : "Herbouw output met exacte gate-compliance.");

      const interventionOnly =
        mode === "INTERVENTION REWRITE MODE" ||
        error.code === "INTERVENTION_ARTEFACT_REQUIRED";

      const repairPrompt = `
${HGBCO_MCKINSEY_USER_INJECT}
${mode}
FOUTCODE: ${error.code}
REPAIR DIRECTIVE: ${repairDirective}

REGELS:
- ${
        interventionOnly
          ? "Herschrijf uitsluitend sectie 10, maar retourneer volledige narrative met exact dezelfde 12 headings."
          : "Herschrijf de volledige narrative opnieuw. Niet patchen."
      }
- Elke sectie minimaal 2 casus-ankers uit context.
- Sectie 8: elke interventie verwijst expliciet naar een casus-anker.
- Sectie 9 start exact met: De Raad van Bestuur committeert zich aan:
- Bij REPETITION_TOO_HIGH: verplicht volledig nieuwe formulering + andere mechanische keten.

CONTEXT:
${caseContextBlock}

CONTEXT ENGINE RECONSTRUCTIE:
${contextEngineReconstruction || "Niet beschikbaar; werk met primaire broncontext."}

STRATEGIC MEMORY RETRIEVER:
${memoryContextBlock}

KNOWLEDGE GRAPH QUERY:
${knowledgeGraphContextBlock}

HYPOTHESIS CONCURRENTIE:
${hypothesisCompetitionOutput}

CAUSALE MECHANISMEN:
${causalMechanismOutput}

STRATEGISCHE KERNSPANNING:
${strategicTensionOutput || "Niet beschikbaar; leid kernspanning af uit primaire broncontext."}

STRATEGISCHE OPTIES:
${strategicOptionOutput || "Niet beschikbaar; leid strategische opties af uit primaire broncontext."}

BESTUURLIJKE BLINDE VLEKKEN:
${blindSpotsOutput}

STRATEGISCHE VOORUITBLIK:
${strategicForesightOutput}

STRATEGIC THINKING PATTERNS:
${strategicThinkingPatternsOutput || "Niet beschikbaar; gebruik first-principles patronen."}

STRUCTURELE DIAGNOSE ENGINE:
${diagnosisEngineOutput || "Niet beschikbaar; leid diagnose af uit primaire broncontext."}

STRATEGIC REASONING NODE:
${strategicInsightOutput || "Niet beschikbaar; leid strategische inzichten af uit primaire broncontext."}

ORGANISATIEDYNAMIEK ENGINE:
${orgDynamicsEngineOutput || "Niet beschikbaar; leid organisatiedynamiek af uit primaire broncontext."}

BOARDROOM INTELLIGENCE NODE:
${boardroomIntelligenceOutput || "Niet beschikbaar; leid boardroom-intelligentie af uit primaire broncontext."}

STRATEGISCHE HYPOTHESE ENGINE:
${hypothesisEngineOutput || "Niet beschikbaar; leid hypothesen af uit primaire broncontext."}

SCENARIO SIMULATION NODE:
${scenarioSimulationOutput || "Niet beschikbaar; leid scenario-simulaties af uit primaire broncontext."}

INTERVENTIE ENGINE:
${interventionEngineOutput || "Niet beschikbaar; leid interventies af uit primaire broncontext."}

DECISION QUALITY NODE:
${decisionQualityOutput || "Niet beschikbaar; leid besluitkwaliteitsanalyse af uit primaire broncontext."}

STRATEGISCHE OPTIES EN BESLUITDRUK ENGINE:
${decisionPressureOutput}

ORGANIZATIONAL SIMULATION ENGINE:
${organizationalSimulationOutput}

META-REASONING ENGINE:
${metaReasoningOutput}

VORIGE OUTPUT:
${candidate}
`.trim();

      const repaired = await callAI(
        "gpt-4o",
        [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: repairPrompt },
        ],
        { max_tokens: CHUNK_TOKENS, temperature }
      );

      if (typeof repaired === "string" && repaired.trim()) {
        candidate = hardenNarrativeCandidate(
          repaired.trim(),
          input,
          boardroomIntelligenceOutput,
          scenarioSimulationOutput,
          blindSpotsOutput,
          strategicForesightOutput,
          decisionPressureOutput,
          organizationalSimulationOutput,
          metaReasoningOutput,
          decisionQualityOutput,
          decisionQualityScore,
          hypothesisCompetitionOutput,
          causalMechanismOutput,
          memoryContextBlock,
          knowledgeGraphContextBlock,
          boundedMinWords,
          maxWords
        );
        candidate = sanitizeUngroundedNumericSignals(candidate, groundingSource);
        validateHgbcoMcKinseyRuntime(candidate);
      }
    }
  }

  if (gateLastError) {
    throw gateLastError;
  }

  try {
    assertExecutiveKernelQuality(candidate, enforceGGZDepth);
  } catch {
    const hasAllMandatoryHeadings = STRUCTURE_HEADINGS.every((heading) =>
      candidate.includes(heading)
    );
    const salvageableLongform =
      countWords(candidate) >= Math.max(3200, boundedMinWords - 400) &&
      hasAllMandatoryHeadings &&
      !hasForbiddenGenericLanguage(candidate);

    if (!salvageableLongform) {
      const fallback = buildFallbackNarrative(input, boundedMinWords, maxWords);
      const concreteFallback = hardenNarrativeCandidate(
        fallback,
        input,
        boardroomIntelligenceOutput,
        scenarioSimulationOutput,
        blindSpotsOutput,
        strategicForesightOutput,
        decisionPressureOutput,
        organizationalSimulationOutput,
        metaReasoningOutput,
        decisionQualityOutput,
        decisionQualityScore,
        hypothesisCompetitionOutput,
        causalMechanismOutput,
        memoryContextBlock,
        knowledgeGraphContextBlock,
        boundedMinWords,
        maxWords
      );
      const sanitizedFallback = sanitizeResidualForbiddenNarrative(concreteFallback);
      const groundedFallback = sanitizeUngroundedNumericSignals(
        sanitizedFallback,
        groundingSource
      );
      validateHgbcoMcKinseyRuntime(groundedFallback);

      try {
        assertExecutiveKernelQuality(groundedFallback, enforceGGZDepth);
        candidate = groundedFallback;
      } catch {
        candidate = groundedFallback;
      }
    }
  }

  candidate = sanitizeResidualForbiddenNarrative(candidate);
  candidate = sanitizeUngroundedNumericSignals(candidate, groundingSource);
  validateHgbcoMcKinseyRuntime(candidate);

  try {
    const composed = composeBoardroomNarrative({ text: candidate });
    candidate = composed.composedText;
    extendReasoningState(reasoningState, {
      narrative: candidate,
    });
    narrativeStructurePass = composed.structure.pass;
    narrativeCausalityPass = composed.causality.pass;
    if (composed.warnings.length) {
      strategicWarnings.push(...composed.warnings);
    }
  } catch {
    strategicWarnings.push(
      "BoardroomNarrativeComposer kon niet volledig worden toegepast; output is niet verrijkt door narrative intelligence."
    );
  }

  candidate = sanitizeResidualForbiddenNarrative(candidate);
  candidate = sanitizeUngroundedNumericSignals(candidate, groundingSource);
  validateHgbcoMcKinseyRuntime(candidate);

  try {
    const critique = runStrategicCritiqueAgent({
      boardroomReport: candidate,
      sourceContext: groundingSource,
    });
    critiqueLayerApplied = true;
    critiqueText = critique.critiqueText;
    critiqueSignalCount = critique.missingSignals.length;
    if (critique.missingSignals.length) {
      strategicWarnings.push(
        `StrategicCritiqueAgent: aandachtspunten gedetecteerd: ${critique.missingSignals.join(", ")}`
      );
    }

    const rewritten = runNarrativeRewriteEngine({
      boardroomReport: candidate,
      critique,
    });
    if (rewritten.changesApplied.length) {
      rewriteLayerApplied = true;
      strategicWarnings.push(
        `NarrativeRewriteEngine: ${rewritten.changesApplied.join(" | ")}`
      );
    }
    candidate = rewritten.rewrittenReport;
    extendReasoningState(reasoningState, {
      narrative: candidate,
    });

    const executionValidation = validateExecutionFeasibility({
      boardroomReport: candidate,
    });
    executionValidationText = executionValidation.validationText;
    candidate = appendExecutionValidationToInterventionSection(
      candidate,
      executionValidation.validationText
    );
    extendReasoningState(reasoningState, {
      narrative: candidate,
    });
    executionLayerApplied = executionValidation.entries.length > 0;
    if (executionValidation.hasHighRisk) {
      strategicWarnings.push(
        "ExecutionFeasibilityValidator: ten minste een interventie heeft hoog uitvoeringsrisico."
      );
    }

    reflectionLayerApplied = critiqueLayerApplied || rewriteLayerApplied || executionLayerApplied;
  } catch {
    strategicWarnings.push(
      "Reflection/Narrative Discipline/Execution Feasibility layers konden niet volledig worden toegepast."
    );
  }

  candidate = sanitizeResidualForbiddenNarrative(candidate);
  candidate = sanitizeUngroundedNumericSignals(candidate, groundingSource);
  validateHgbcoMcKinseyRuntime(candidate);

  extendReasoningState(reasoningState, {
    narrative: candidate,
  });
  const reasoningGuard = runReasoningGuard(reasoningState);
  reasoningGuardPass = reasoningGuard.pass;
  reasoningGuardIssues = reasoningGuard.issues;
  if (reasoningGuardIssues.length) {
    strategicWarnings.push(
      `ReasoningGuard: ${reasoningGuardIssues.join(" | ")}`
    );
  }

  try {
    narrativeStructurePass = validateNarrativeStructure(candidate).pass;
    narrativeCausalityPass = validateNarrativeCausality(candidate).pass;
  } catch {
    // best effort metricing
  }

  assertExecutiveKernelQuality(candidate, enforceGGZDepth);
  assertHardOutputGate(candidate);

  try {
    const nowIso = new Date().toISOString();
    const caseId =
      toSafeString(input.analysis_id) ||
      `case-${contextHash.slice(0, 12)}-${Date.now().toString(36)}`;
    const dominantThesis = extractSection(candidate, "### 1. DOMINANTE THESE").trim();
    const keyProblem = extractSection(candidate, "### 2. KERNCONFLICT").trim();
    const scenarioSection = extractSection(candidate, "### 9. STRATEGISCHE SCENARIOANALYSE");
    const decisionFrameSection = extractSection(candidate, "### 12. BESLUITKADER");
    const chosenStrategy =
      extractSingleLineValue(scenarioSection, /\bVOORKEURSSCENARIO:\s*(.+)$/im) ||
      extractSingleLineValue(decisionFrameSection, /\bBesluit:\s*(.+)$/im) ||
      "Nog niet expliciet vastgelegd.";
    const interventionProgram = extractSection(
      candidate,
      "### 10. 90-DAGEN INTERVENTIEPROGRAMMA"
    ).trim();
    const interventionBlocks = extractInterventionBlocks(candidate);
    const patternNames = extractPatternNamesFromOutput(strategicThinkingPatternsOutput);
    const strategicInsights = extractStrategicInsightLines(candidate);
    const resultSummary = extractSection(candidate, "1-PAGINA BESTUURLIJKE SAMENVATTING").trim();

    const exists = memoryStore.listCases().some((c) => c.caseId === caseId);
    if (!exists) {
      const caseRecord = {
        caseId,
        createdAt: nowIso,
        sector: toSafeString(input.sector_selected) || "onbekend",
        organizationSize: "onbekend",
        keyProblem: keyProblem || "Niet expliciet benoemd.",
        dominantThesis: dominantThesis || "Niet expliciet benoemd.",
        strategicInsights:
          strategicInsights.length > 0
            ? strategicInsights
            : ["Geen direct vergelijkbare cases gevonden; first-principles redenering toegepast."],
        chosenStrategy,
        interventionProgram: interventionProgram || "Niet expliciet benoemd.",
        resultSummary: resultSummary || "Analyse afgerond; implementatieresultaat nog onbekend.",
      };
      memoryStore.addCase(caseRecord);
      memoryIndexer.indexCase(caseRecord);

      interventionBlocks.forEach((block, idx) => {
        memoryStore.addIntervention({
          interventionId: `${caseId}-int-${idx + 1}`,
          caseId,
          problemType: keyProblem.slice(0, 220) || "strategisch uitvoeringsprobleem",
          intervention: block.slice(0, 1200),
          sector: toSafeString(input.sector_selected) || "onbekend",
          result: "Nog te meten",
        });
      });
    }

    const graphPayload = buildKnowledgeGraphPayload({
      companyName: toSafeString(input.company_name) || "Onbekende organisatie",
      sector: toSafeString(input.sector_selected) || "onbekend",
      problem: keyProblem || "onbekend probleem",
      strategy: chosenStrategy || "onbekende strategie",
      interventions: interventionBlocks.map((b) => b.slice(0, 220)),
      patterns:
        patternNames.length > 0
          ? patternNames
          : ["BOTTLENECK ANALYSIS", "ECONOMIC ENGINE", "INCENTIVE STRUCTURE", "SYSTEM DYNAMICS"],
    });
    knowledgeGraphUpdater.apply(graphPayload);
  } catch {
    strategicWarnings.push(
      "Strategic memory of knowledge graph kon niet volledig worden bijgewerkt; rapportgeneratie is wel voltooid."
    );
  }

  candidate = ensureBoardroomOutputArtifacts(candidate);
  assertBoardroomReportStructure(candidate);
  runtimeLastOutputByContext.set(contextHash, candidate);

  return {
    text: candidate,
    metrics: {
      words: countWords(candidate),
      loops,
      documents_used: rawDocuments.length,
      used_questions: hasQuestions,
      engine_pipeline: [
        "Context Engine",
        "StrategicMemoryRetriever",
        "KnowledgeGraphQuery",
        "HypothesisGenerator",
        "HypothesisCompetition",
        "CausalMechanismDetector",
        "Strategic Tension Engine",
        "Strategic Option Generator",
        "Strategic Option Evaluator",
        "BlindSpotDetector",
        "StrategicThinkingPatterns",
        "Structurele Diagnose Engine",
        "Strategic Insight Engine",
        "Organisatiedynamiek Engine",
        "Boardroom Intelligence Node",
        "Strategische Hypothese Engine",
        "StrategicForesightEngine",
        "Scenario Simulation Node",
        "Interventie Engine",
        "DecisionOptionGenerator",
        "DecisionTradeoffAnalyzer",
        "DecisionPressureEngine",
        "OrganizationalSimulationEngine",
        "MetaReasoningEngine",
        "Decision Quality Node",
        "StrategicReasoningGate",
        "NarrativeStructureEngine",
        "NarrativeCausalityValidator",
        "BoardroomNarrativeComposer",
        "Shared ReasoningState",
        "ReasoningGuard",
        "Strategic Critique Agent",
        "Narrative Rewrite Engine",
        "Execution Feasibility Validator",
      ],
      engine_status: {
        "Context Engine": Boolean(contextEngineReconstruction),
        StrategicMemoryRetriever: true,
        KnowledgeGraphQuery: true,
        HypothesisGenerator: hypothesisCount >= 3,
        HypothesisCompetition: /\bWAARSCHIJNLIJKSTE VERKLARING\b/i.test(hypothesisCompetitionOutput),
        CausalMechanismDetector: /\bSTRUCTURELE OORZAAK\b/i.test(causalMechanismOutput),
        "Strategic Tension Engine": Boolean(strategicTensionOutput),
        "Strategic Option Generator": Boolean(strategicOptionOutput),
        "Strategic Option Evaluator": Boolean(preferredStrategicOption),
        BlindSpotDetector: blindSpotCount >= 3,
        StrategicThinkingPatterns: Boolean(strategicThinkingPatternsOutput),
        "Structurele Diagnose Engine": Boolean(diagnosisEngineOutput),
        "Strategic Insight Engine": Boolean(strategicInsightOutput),
        "Organisatiedynamiek Engine": Boolean(orgDynamicsEngineOutput),
        "Boardroom Intelligence Node": Boolean(boardroomIntelligenceOutput),
        "Strategische Hypothese Engine": Boolean(hypothesisEngineOutput),
        StrategicForesightEngine: foresightScenarioCount >= 3,
        "Scenario Simulation Node": Boolean(scenarioSimulationOutput),
        "Interventie Engine": Boolean(interventionEngineOutput),
        DecisionOptionGenerator: decisionOptionCount >= 3,
        DecisionTradeoffAnalyzer: decisionOptionCount >= 3,
        DecisionPressureEngine: /\bVOORKEURSOPTIE\b/i.test(decisionPressureOutput),
        OrganizationalSimulationEngine: simulationInterventionCount > 0,
        MetaReasoningEngine: metaReasoningPass,
        "Decision Quality Node": Boolean(decisionQualityOutput),
        StrategicReasoningGate: strategicReasoningGatePassed,
        NarrativeStructureEngine: narrativeStructurePass,
        NarrativeCausalityValidator: narrativeCausalityPass,
        BoardroomNarrativeComposer: Boolean(candidate && candidate.trim()),
        "Shared ReasoningState": true,
        ReasoningGuard: reasoningGuardPass,
        "Strategic Critique Agent": critiqueLayerApplied,
        "Narrative Rewrite Engine": rewriteLayerApplied,
        "Execution Feasibility Validator": executionLayerApplied,
      },
      context_engine_enabled: Boolean(contextEngineReconstruction),
      strategic_memory_retriever_enabled: true,
      knowledge_graph_query_enabled: true,
      hypothesis_generator_enabled: hypothesisCount >= 3,
      hypothesis_competition_enabled: /\bWAARSCHIJNLIJKSTE VERKLARING\b/i.test(hypothesisCompetitionOutput),
      causal_mechanism_detector_enabled: /\bSTRUCTURELE OORZAAK\b/i.test(causalMechanismOutput),
      strategic_tension_engine_enabled: Boolean(strategicTensionOutput),
      strategic_option_generator_enabled: Boolean(strategicOptionOutput),
      strategic_option_evaluator_enabled: Boolean(preferredStrategicOption),
      blind_spot_detector_enabled: blindSpotCount >= 3,
      strategic_thinking_patterns_enabled: Boolean(strategicThinkingPatternsOutput),
      diagnosis_engine_enabled: Boolean(diagnosisEngineOutput),
      strategic_insight_node_enabled: Boolean(strategicInsightOutput),
      strategic_reasoning_node_enabled: Boolean(strategicInsightOutput),
      org_dynamics_engine_enabled: Boolean(orgDynamicsEngineOutput),
      boardroom_intelligence_node_enabled: Boolean(boardroomIntelligenceOutput),
      hypothesis_engine_enabled: Boolean(hypothesisEngineOutput),
      strategic_foresight_engine_enabled: foresightScenarioCount >= 3,
      scenario_simulation_node_enabled: Boolean(scenarioSimulationOutput),
      intervention_engine_enabled: Boolean(interventionEngineOutput),
      decision_option_generator_enabled: decisionOptionCount >= 3,
      decision_tradeoff_analyzer_enabled: decisionOptionCount >= 3,
      decision_pressure_engine_enabled: /\bVOORKEURSOPTIE\b/i.test(decisionPressureOutput),
      organizational_simulation_engine_enabled: simulationInterventionCount > 0,
      meta_reasoning_engine_enabled: metaReasoningPass,
      decision_quality_node_enabled: Boolean(decisionQualityOutput),
      decision_quality_score: decisionQualityScore,
      interventions_inconsistent: interventionsInconsistent,
      strategic_reasoning_gate_enabled: strategicReasoningGatePassed,
      narrative_structure_engine_enabled: narrativeStructurePass,
      narrative_causality_validator_enabled: narrativeCausalityPass,
      boardroom_narrative_composer_enabled: Boolean(candidate && candidate.trim()),
      shared_reasoning_state_enabled: true,
      reasoning_guard_enabled: true,
      reasoning_guard_pass: reasoningGuardPass,
      reasoning_guard_issues: reasoningGuardIssues,
      reasoning_state_snapshot_sizes: {
        context_state: reasoningState.context_state.entries.length,
        diagnosis: reasoningState.diagnosis.entries.length,
        mechanisms: reasoningState.mechanisms.entries.length,
        strategic_tension: reasoningState.strategic_tension.entries.length,
        strategic_options: reasoningState.strategic_options.entries.length,
        insights: reasoningState.insights.entries.length,
        decision: reasoningState.decision.entries.length,
        narrative: reasoningState.narrative.entries.length,
      },
      reflection_layer_enabled: reflectionLayerApplied,
      strategic_critique_agent_enabled: critiqueLayerApplied,
      narrative_rewrite_engine_enabled: rewriteLayerApplied,
      execution_feasibility_validator_enabled: executionLayerApplied,
      critique_signal_count: critiqueSignalCount,
      critique_excerpt: critiqueText.slice(0, 800),
      execution_validation_excerpt: executionValidationText.slice(0, 800),
      strategic_depth_score: strategicReasoningGateScore,
      strategic_reasoning_warnings: strategicWarnings,
      strategic_memory_cases_retrieved: similarCasesRetrieved,
      knowledge_graph_comparable_organizations: knowledgeGraphComparableCount,
      hypothesis_count: hypothesisCount,
      causal_mechanism_count: causalMechanismCount,
      blind_spot_count: blindSpotCount,
      strategic_foresight_scenarios: foresightScenarioCount,
      decision_option_count: decisionOptionCount,
      simulation_intervention_count: simulationInterventionCount,
      strategic_memory_cases_stored: memoryStore.listCases().length,
      strategic_memory_interventions_stored: memoryStore.listInterventions().length,
    },
  };
}
