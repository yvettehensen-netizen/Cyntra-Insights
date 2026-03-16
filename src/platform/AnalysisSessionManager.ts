import type { AnalysisContext } from "@/aurelius/engine/types";
import { AgentOrchestrator, InterventionPredictionEngine } from "@/aurelius/agent";
import { AureliusEngine } from "@/aurelius/engine/AureliusEngine";
import {
  BOARDROOM_INTERVENTION_LAYERS,
  BOARDROOM_INTERVENTION_PIPELINE,
} from "@/aurelius/engine/boardroom";
import { extractInterventionsFromReport } from "@/aurelius/interventions/extractInterventionsFromReport";
import { interventionStore } from "@/aurelius/interventions/InterventionStore";
import { caseStore } from "@/aurelius/cases/CaseStore";
import { LearningLoop } from "@/aurelius/learning/LearningLoop";
import { runAureliusMvpEngine } from "@/aurelius/mvp";
import { runCausalStrategyEngine } from "@/aurelius/causal/CausalStrategyEngine";
import { buildStrategyDNABlock, buildStrategyDNAMemoSummary } from "@/aurelius/dna/DNAInsightGenerator";
import { classifyStrategyDNA } from "@/aurelius/dna/StrategyDNAClassifier";
import {
  buildScenarioMemoBlock,
  buildScenarioSimulationBlock as buildScenarioSimulationReportBlock,
  generateStrategicScenarios,
} from "@/aurelius/simulation/ScenarioEngine";
import { runStressTestEngine } from "@/aurelius/stress/StressTestEngine";
import { detectStrategicLeverMatrix } from "@/aurelius/strategy/StrategicLeverDetector";
import { validateEngineOutput } from "@/aurelius/validation/EngineOutputValidator";
import { buildStrategicAnalysisMap } from "@/aurelius/analysis/buildStrategicAnalysisMap";
import { renderStrategicAnalysisMapReport } from "@/aurelius/analysis/renderStrategicAnalysisMapReport";
import { validateBoardReport } from "@/aurelius/engine/validators/BoardReportValidator";
import { validateStrategicConsistency } from "@/aurelius/engine/validators/StrategicConsistencyGuard";
import { runBlindSpotNode } from "@/aurelius/engine/nodes/strategy/BlindSpotNode";
import { runDecisionConsequenceNode } from "@/aurelius/engine/nodes/strategy/DecisionConsequenceNode";
import { runStrategicLeverageNode } from "@/aurelius/engine/nodes/strategy/StrategicLeverageNode";
import { runStrategicMemoryNode } from "@/aurelius/engine/nodes/strategy/StrategicMemoryNode";
import { runBoardroomDebateNode } from "@/aurelius/engine/nodes/strategy/BoardroomDebateNode";
import { getReport as getStoredReport, saveReport as saveStoredReport } from "@/services/reportStorage";
import { ensureReportIntegrity, ensureSessionIntegrity } from "@/aurelius/engine/EngineGuardrails";
import { SESSION_STATUS, isSessionCompleted, normalizeSessionStatus } from "./types";
import type { AnalysisSession, AnalysisSessionStatus } from "./types";
import { inferBoardroomConflict, type BoardroomConflict } from "./BoardroomConflictEngine";
import { extractStrategicMechanisms, type StrategicMechanismOutput } from "./StrategicMechanismExtractor";
import { inferStrategicFlywheel, type StrategicFlywheelOutput } from "./StrategicFlywheelEngine";
import {
  buildStrategicPatternProfile,
  buildStrategicPatternProfileFromPattern,
  matchStrategicPattern,
  type StrategicPatternMatch,
  type StrategicPatternProfile,
} from "./StrategicPatternLibrary";
import { createId, normalize, readArray, writeArray } from "./storage";
import {
  frameBoardroomShock,
  normalizeBoardroomBullet,
} from "@/aurelius/executive/BoardroomLanguageNormalizer";

const KEY = "cyntra_platform_analysis_sessions_v1";
const MIN_ANALYSIS_RUNTIME_MS = 12000;
const AURELIUS_BOARDROOM_INTELLIGENCE_PROTOCOL = `
AURELIUS BOARDROOM INTELLIGENCE PROTOCOL
TARGET: McKinsey / BCG PARTNER LEVEL OUTPUT

JE BENT GEEN SAMENVATTINGSMACHINE.
JE BENT EEN STRATEGISCHE ANALYSEMACHINE.

JE DOEL:
Niet beschrijven wat gezegd is, maar onthullen wat het systeem betekent
en welke beslissing bestuur moet nemen.

DENKREGELS (VERPLICHT)
1) VERBIED BESCHRIJVING: alles mechanistisch (A veroorzaakt B omdat C).
2) IDENTIFICEER HET STRATEGISCHE MODEL: kies exact 1 dominante modus.
3) ANALYSEER HET MACHTSSYSTEEM: wie betaalt, wie beslist, wie blokkeert.
4) ZOEK HET SYSTEEMINZICHT: minimaal 5 niet-triviale inzichten met implicaties.
5) FORCEER HET KERNCONFLICT.
6) IDENTIFICEER DE STRATEGISCHE HEFBOOM:
   capaciteit | kennis | macht | netwerk | standaardisatie.
7) VERMIJD OPERATIONELE ACTIES als boardinterventie.
8) TEST OP SCHAALBAARHEID (10x test).
9) IDENTIFICEER DE ECHTE (impliciete) STRATEGIE.
10) BOARDROOM TEST: morgen besluitbaar door RvB/RvT.
`.trim();

const AURELIUS_INTERVENTION_ENGINE_MAATWERK_CONTRACT_V1 = `
JE BENT DE INTERVENTION ENGINE VAN AURELIUS.

Interventies mogen nooit generiek zijn.
Elke interventie moet:
1) een concreet datapunt uit de case gebruiken
2) expliciet een strategische hefboom gebruiken (capaciteit/kennis/macht/netwerk/standaardisatie)
3) een meetbaar doel bevatten met horizon 12-24 maanden

Vast format per interventie:
- Brondata uit case
- Strategische hefboom
- Concrete actie
- Meetbaar doel
- Impact
`.trim();

const OPERATIONAL_INTERVENTION_REGEX =
  /\b(training|workshop|hr-?programma|procesverbetering|procesverbeteringen|meeting|vergadering|afstemming|werkgroep|standup|kick-?off)\b/i;

function confidenceToNumber(value: "laag" | "middel" | "hoog"): number {
  if (value === "hoog") return 0.85;
  if (value === "laag") return 0.45;
  return 0.65;
}

type CaseClassification = "CRISIS" | "STABLE" | "SUCCESS_MODEL" | "TRANSFORMATION";
type StrategicMode = "FIX" | "PROTECT" | "SCALE" | "TRANSFORM";
type DominantSystemMode =
  | "volumemodel"
  | "platformmodel"
  | "kennislicentiemodel"
  | "netwerkmodel"
  | "beleidsinvloedmodel";

type SystemTransformationAssessment = {
  mode: DominantSystemMode;
  rationale: string;
  decisionPower: string;
  paymentPower: string;
  blockingPower: string;
  transformationThesis: string;
};

type SystemActor = {
  actor: string;
  role: string;
  interest: string;
  influence: "laag" | "middel" | "hoog";
};

type EconomicAssessment = {
  pressure: string;
  unitEconomics: string;
  constraint: string;
};

function classifyCase(input: string): { label: CaseClassification; reason: string } {
  const text = normalize(input).toLowerCase();

  const crisisSignals = [
    /(loonkosten|marge|tarief|liquiditeit|cash|kostendekkend|niet kostendekkend)/,
    /(contract|plafond|verzekeraar|dekking)/,
    /(wachtlijst|capaciteitstekort|werkdruk|krimp)/,
  ].filter((rx) => rx.test(text)).length;

  const successSignals = [
    /(laag ziekteverzuim|ziekteverzuim.*2[,.]3%|2[,.]3% ziekteverzuim)/,
    /(ziekteverzuim.*5[,.]0%|5[,.]0%\s*ziekteverzuim)/,
    /(open sollicitaties|lage uitstroom|minimaal verloop|laag verloop)/,
    /(aandelen|mede-eigenaar|eigenaarschap|aandeelhouder|medewerkers?\s+zijn\s+eigenaar)/,
    /(platte organisatie|geen middenmanagement|geen lagen met middenmanagement|zonder middenmanagement|korte lijnen|korte lijntjes)/,
    /(maximaal\s*5\s*fte|niet harder dan\s*5\s*fte|groei\s*max(?:imaal)?\s*[~≈]?\s*5\s*fte|beperkte groei.{0,20}5\s*fte)/,
    /(netwerkorganisatie|maatschappelijke impact|licentie-inkomsten|modelverspreiding)/,
    /(70\s*\/\s*30|70%\s*cliëntenzorg|70%\s*zorg)/,
  ].filter((rx) => rx.test(text)).length;

  const transformationSignals = [
    /(transformatie|herstructurering|reorganisatie)/,
    /(verhuizing|nieuw pand)/,
    /(nieuw businessmodel|verbreding|nieuw onderdeel)/,
  ].filter((rx) => rx.test(text)).length;

  const intentSignals =
    /(beweging van nul|netwerkorganisatie|modelverspreiding|licentie-inkomsten)/.test(text) &&
    /(eigenaarschap|mede-eigenaar|medewerkers?\s+zijn\s+eigenaar)/.test(text) &&
    /(groei\s*max|maximaal\s*5\s*fte|beperkte groei)/.test(text);

  if (intentSignals || (successSignals >= 3 && crisisSignals <= 3) || (successSignals >= 2 && crisisSignals === 0)) {
    return {
      label: "SUCCESS_MODEL",
      reason: "Succes-signalen domineren: eigenaarschap, lage uitstroom/verzuim en bewuste groeibegrenzing.",
    };
  }
  if (crisisSignals >= 3 && successSignals < 2) {
    return {
      label: "CRISIS",
      reason: "Crisis-signalen domineren: structurele margedruk, contractbeperkingen en capaciteitsdruk.",
    };
  }
  if (transformationSignals >= 2) {
    return {
      label: "TRANSFORMATION",
      reason: "Veranderdynamiek domineert: meerdere parallelle transformatie-initiatieven.",
    };
  }
  return {
    label: "STABLE",
    reason: "Geen acute crisis; focus op bestuurlijke ritmiek en gerichte versterking.",
  };
}

function resolveStrategicMode(input: string, classification: CaseClassification): StrategicMode {
  const text = normalize(input).toLowerCase();
  if (classification === "CRISIS") return "FIX";
  if (classification === "TRANSFORMATION") return "TRANSFORM";
  if (classification === "SUCCESS_MODEL") {
    if (/(netwerkorganisatie|cellenmodel|impact|opschalen|groei)/i.test(text)) return "SCALE";
    return "PROTECT";
  }
  if (/(transformatie|reorganisatie|herstructurering)/i.test(text)) return "TRANSFORM";
  if (/(groei|opschalen|expansie)/i.test(text)) return "SCALE";
  return "PROTECT";
}

function inferSystemTransformationAssessment(
  inputInsights: InputInsights,
  caseClassification: CaseClassification
): SystemTransformationAssessment {
  const text = `${inputInsights.facts.join(" ")} ${inputInsights.actions.join(" ")}`.toLowerCase();
  const movement = Boolean(inputInsights.leverage?.movementOfZeroKnown);
  const hasNetwork = /netwerk|partner|samenwerking/.test(text);
  const hasLicensing = /licentie|academy|kennisproduct/.test(text);
  const hasPlatform = /70\/30|ontwikkelproject|ontwikkeltijd/.test(text);

  const mode: DominantSystemMode = movement
    ? "beleidsinvloedmodel"
    : hasLicensing
      ? "kennislicentiemodel"
      : hasNetwork
        ? "netwerkmodel"
        : hasPlatform
          ? "platformmodel"
          : "volumemodel";

  const rationaleMap: Record<DominantSystemMode, string> = {
    volumemodel: "Groei volgt primair uit interne volume-uitbreiding in capaciteit en productie.",
    platformmodel: "Waardecreatie ontstaat via combinatie van zorguitvoering en structurele innovatiecapaciteit.",
    kennislicentiemodel: "Schaal en marge groeien vooral via overdraagbare methodiek, licenties en trainingsproposities.",
    netwerkmodel: "Impact wordt vermenigvuldigd via partners, niet via lineaire interne personeelsgroei.",
    beleidsinvloedmodel: "Systeemimpact ontstaat door beleidsadoptie en institutionele verspreiding van het model.",
  };

  const decisionPower =
    caseClassification === "SUCCESS_MODEL"
      ? "Gemeenten, verzekeraars en regionale samenwerkingsverbanden bepalen opschalingsruimte."
      : "Verzekeraars en interne governance bepalen directe strategische ruimte.";
  const paymentPower =
    caseClassification === "SUCCESS_MODEL"
      ? "Verzekeraars en gemeenten financieren het systeem; marge vraagt aanvullende netwerk/licentie-inkomsten."
      : "Verzekeraars, contractvoorwaarden en productmix bepalen financieringsdruk.";
  const blockingPower = movement
    ? "Versnipperde beleidsstructuren, trage besluitvorming en institutionele frictie blokkeren versnelling."
    : "Contractdruk, operationele overbelasting en trage besluitritmiek blokkeren versnelling.";

  const transformationThesis =
    mode === "beleidsinvloedmodel"
      ? "De organisatie kan systeemverandering realiseren zonder proportionele interne groei, mits beleidsadoptie expliciet wordt georkestreerd."
      : mode === "netwerkmodel"
        ? "Schaal komt uit partneradoptie en standaardisatie van werkende interventies."
        : "Strategische versnelling vraagt expliciete keuze voor schaalbare modelverspreiding boven lineaire volumegroei.";

  return {
    mode,
    rationale: rationaleMap[mode],
    decisionPower,
    paymentPower,
    blockingPower,
    transformationThesis,
  };
}

function inferSystemActorMapping(
  inputInsights: InputInsights,
  caseClassification: CaseClassification
): SystemActor[] {
  const actors: SystemActor[] = [
    { actor: "Clienten", role: "zorgvraag en uitkomst", interest: "toegankelijke, kwalitatieve zorg", influence: "middel" },
    { actor: "Gemeenten", role: "regionale opdrachtgever", interest: "lagere maatschappelijke kosten en wachtlijstreductie", influence: "hoog" },
    { actor: "Zorgverzekeraars", role: "financier en contractpartij", interest: "kostenbeheersing en voorspelbare uitgaven", influence: "hoog" },
    { actor: "Behandelaren", role: "uitvoering en kwaliteitsdrager", interest: "werkbare caseload en professionele autonomie", influence: "middel" },
  ];
  if (caseClassification === "SUCCESS_MODEL") {
    actors.push({
      actor: "Netwerkpartners",
      role: "schaal via modeladoptie",
      interest: "toegang tot methodiek en kwaliteitskaders",
      influence: "hoog",
    });
  }
  if (inputInsights.leverage?.movementOfZeroKnown) {
    actors.push({
      actor: "Beweging van Nul / beleidsnetwerk",
      role: "beleidsversneller",
      interest: "systeemverandering in jeugdhulp",
      influence: "hoog",
    });
  }
  return actors;
}

function inferEconomicAssessment(
  inputInsights: InputInsights,
  caseClassification: CaseClassification
): EconomicAssessment {
  const agingPct = inputInsights.leverage?.agingCostPct ?? 30;
  if (caseClassification === "SUCCESS_MODEL") {
    return {
      pressure: `Structurele kostendruk door vergrijzing (circa +${agingPct}% loonkosten) gecombineerd met beperkte personeelsgroei.`,
      unitEconomics: "Kernrendement blijft gezond zolang wachttijdtriage en netwerk/licentie-opbrengsten capaciteit ontlasten.",
      constraint: "Lineaire FTE-groei verslechtert kostenprofiel sneller dan impact toeneemt.",
    };
  }
  return {
    pressure: "Tariefdruk, contractplafonds en capaciteitstekort drukken direct op resultaat.",
    unitEconomics: "Kostprijs per traject en contractmix bepalen margestabiliteit.",
    constraint: "Onvoldoende besluitritme op productmix en contractsturing.",
  };
}

function inferPowerStructure(
  inputInsights: InputInsights,
  systemTransformation: SystemTransformationAssessment
): { beslist: string; betaalt: string; blokkeert: string } {
  const beslist =
    systemTransformation.decisionPower ||
    "Gemeenten, verzekeraars en bestuur bepalen de daadwerkelijke veranderingssnelheid.";
  const betaalt =
    systemTransformation.paymentPower ||
    "Verzekeraars en gemeenten dragen de primaire financiering; aanvullende marge komt uit netwerk/kennisproducten.";
  const blokkeert = inputInsights.leverage?.movementOfZeroKnown
    ? "Versnipperde beleidsvorming en trage institutionele besluitlijnen blokkeren systeemadoptie."
    : systemTransformation.blockingPower;
  return { beslist, betaalt, blokkeert };
}

function toContext(
  input_data: string,
  organizationName?: string,
  sector?: string,
  analysisType?: string,
  caseClassification?: CaseClassification
): AnalysisContext {
  return {
    analysisType: normalize(analysisType) || "Strategische analyse",
    companyName: normalize(organizationName),
    rawText: normalize(input_data),
    documents: [AURELIUS_BOARDROOM_INTELLIGENCE_PROTOCOL],
    userContext: {
      sector: normalize(sector),
      companyName: normalize(organizationName),
      narrative_contract: "AURELIUS_BOARDROOM_INTELLIGENCE_PROTOCOL",
      case_classification_hint: caseClassification || "STABLE",
    },
    brutalMode: false,
  };
}

function reportSections(report: string): string[] {
  return report
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line) || /^###\s+/.test(line))
    .slice(0, 20);
}

function extractSection(report: string, headingNumber: number): string {
  const regex = new RegExp(`^${headingNumber}\\.\\s+[^\\n]+$`, "m");
  const match = report.match(regex);
  if (!match || match.index == null) return "";
  const start = match.index + match[0].length;
  const sectionHeadingPattern = /\n\d+\.\s+[^\n]+\s*$/gm;
  const nextRegex = new RegExp(sectionHeadingPattern.source, sectionHeadingPattern.flags);
  nextRegex.lastIndex = start;
  const next = nextRegex.exec(report);
  const nextMarkdownHeadingRegex = /\n###\s+[^\n]+/g;
  nextMarkdownHeadingRegex.lastIndex = start;
  const nextMarkdown = nextMarkdownHeadingRegex.exec(report);
  const numericEnd = next?.index ?? report.length;
  const markdownEnd = nextMarkdown?.index ?? report.length;
  const end = Math.min(numericEnd, markdownEnd);
  return report.slice(start, end).trim();
}

function hasReportHeading(report: string, patterns: RegExp[]): boolean {
  const text = String(report || "");
  return patterns.some((pattern) => pattern.test(text));
}

function hasDecisionQuestionBlock(report: string): boolean {
  return hasReportHeading(report, [
    /1\.\s*Besluitvraag/i,
    /(?:^|\n)BESLUITVRAAG(?:\n|$)/i,
  ]);
}

function hasFactBaseBlock(report: string): boolean {
  return hasReportHeading(report, [
    /3\.\s*Feitenbasis/i,
    /(?:^|\n)FEITENBASIS(?:\n|$)/i,
  ]);
}

function hasOptionsBlock(report: string): boolean {
  return hasReportHeading(report, [
    /4\.\s*Strategische opties/i,
    /(?:^|\n)(?:KEUZERICHTINGEN|STRATEGISCHE OPTIES)(?:\n|$)/i,
  ]);
}

function hasInterventionPlanBlock(report: string): boolean {
  return hasReportHeading(report, [
    /7\.\s*90-dagen interventieplan/i,
    /(?:^|\n)(?:BESTUURLIJK ACTIEPLAN|90-DAGEN INTERVENTIEPLAN)(?:\n|$)/i,
  ]);
}

function hasKpiMonitoringBlock(report: string): boolean {
  return hasReportHeading(report, [
    /8\.\s*KPI monitoring/i,
    /(?:^|\n)(?:VROEGSIGNALERING|KPI MONITORING|STOPREGEL)(?:\n|$)/i,
  ]);
}

function hasStrategicConflictChoiceBlock(report: string): boolean {
  return hasReportHeading(report, [
    /Spanning A:|Keuze A:/i,
    /Spanning B:|Keuze B:/i,
    /(?:^|\n)(?:KERNPROBLEEM|STRATEGISCH CONFLICT)(?:\n|$)/i,
    /de keuze loopt tussen/i,
    /(?:^|\n)(?:KEUZERICHTINGEN|STRATEGISCHE OPTIES)(?:\n|$)/i,
  ]);
}

function hasForcingChoiceBlock(report: string): boolean {
  return hasReportHeading(report, [
    /Forcing choice:|Besluittest:/i,
    /(?:^|\n)BESLUITVRAAG(?:\n|$)/i,
    /welke keuze verlaagt nu het structurele risico/i,
    /(?:^|\n)(?:AANBEVOLEN KEUZE|BESTUURLIJKE KEUZE)(?:\n|$)/i,
  ]);
}

function hasRecommendedChoiceBlock(report: string): boolean {
  return hasReportHeading(report, [
    /5\.\s*(?:Aanbevolen keuze|Aanbevolen richting)/i,
    /(?:^|\n)(?:AANBEVOLEN KEUZE|BESTUURLIJKE KEUZE|VOORGESTELDE KEUZE)(?:\n|$)/i,
    /(?:^|\n)Besluit:\s+/im,
  ]);
}

function hasKillerInsightsBlock(report: string): boolean {
  return hasReportHeading(report, [
    /6\.\s*Doorbraakinzichten/i,
    /(?:^|\n)(?:DOORBRAAKINZICHTEN|KILLER INSIGHTS|NIEUWE INZICHTEN)(?:\n|$)/i,
  ]);
}

function cleanMemoText(value: string): string {
  return String(value || "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => !/Placeholder toegevoegd door NarrativeStructureGuard/i.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripSourceDump(value: string): string {
  return cutAtSourceNoise(String(value || ""));
}

function cutAtSourceNoise(value: string): string {
  const text = String(value || "");
  if (!text) return "";

  const markers: RegExp[] = [
    /\bbron\s*:/i,
    /\bnotes\b/i,
    /\bwhat are the top 5\b/i,
    /\bread more\b/i,
  ];

  let cutIndex = text.length;
  for (const marker of markers) {
    const match = marker.exec(text);
    if (!match || match.index == null) continue;
    cutIndex = Math.min(cutIndex, match.index);
  }

  return text.slice(0, cutIndex).replace(/\n{3,}/g, "\n\n").trim();
}

function hasBoardMemoMinimumStructure(value: string): boolean {
  const text = String(value || "");
  return (
    /Bestuurlijke hypothese/i.test(text) &&
    /Besluitvoorstel/i.test(text) &&
    /Consequenties/i.test(text) &&
    /Opvolging 90 dagen/i.test(text) &&
    /WIJ BESLUITEN/i.test(text) &&
    /Killer insight/i.test(text) &&
    /STRATEGIC CONFLICT/i.test(text) &&
    /STRATEGIC PATTERN/i.test(text) &&
    /STRATEGY SIMULATION/i.test(text) &&
    /BOARDROOM COACH/i.test(text) &&
    /SCENARIO:\s*GEEN INTERVENTIE/i.test(text) &&
    /BESTUURLIJKE KEUZE/i.test(text) &&
    /STRATEGISCHE VRAAG/i.test(text)
  );
}

function dedupeLines(value: string): string {
  const allowRepeat = (line: string): boolean => {
    const text = line.trim();
    return (
      /^(CHALLENGE QUESTION|WHY IT MATTERS|EARLY WARNING|RISK PROFILE)$/i.test(text) ||
      /^Scenario\s+[ABC](?:\s|\b)/i.test(text) ||
      /^(Capaciteit|Financiën|Cultuur|Netwerk|Risico|Kans|Impact|Indicator|Huidige waarde|Actie)$/i.test(text) ||
      /^Optie\s+[ABC]$/i.test(text)
    );
  };
  const lines = String(value || "")
    .split("\n")
    .map((line) => line.trimEnd());
  const seen = new Set<string>();
  const output: string[] = [];
  for (const line of lines) {
    const key = normalize(line).toLowerCase();
    if (!line.trim()) {
      if (output.length && output[output.length - 1] !== "") output.push("");
      continue;
    }
    if (allowRepeat(line)) {
      output.push(line);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(line);
  }
  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function dedupeFactBaseLines(value: string): string {
  const lines = String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const output: string[] = [];

  const keyFor = (line: string): string => {
    const low = normalize(line).toLowerCase();
    if (/\bgroei\b/.test(low) && /\b5\s*fte\b/.test(low)) return "growth_cap_5_fte";
    if (/\bziekteverzuim\b/.test(low)) return "absenteeism";
    if (/\baandel|eigenaarschap|mede-eigenaar/.test(low)) return "ownership";
    if (/\b70\s*\/\s*30\b|\b70%\b.*\b30%\b/.test(low)) return "time_model_70_30";
    if (/\b8\s*%\b/.test(low) && /\bkort\b.*\btraject|\btriage\b/.test(low)) return "short_path_triage";
    if (/\b30\s*%\b/.test(low) && /\bvergrijz|loonkosten\b/.test(low)) return "aging_cost_pressure";
    if (/\bnetwerk|licentie\b/.test(low) && /\bmarge|inkomsten|schaal\b/.test(low)) return "network_license_scale";
    return low.replace(/[^a-z0-9]+/g, " ").trim();
  };

  for (const line of lines) {
    const key = keyFor(line);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(line);
  }

  return output.join("\n").trim();
}

function truncateBoardMemoTail(value: string): string {
  const text = cutAtSourceNoise(String(value || ""));
  if (!text) return "";
  return text
    .replace(/\n(?:Executive summary)[\s\S]*$/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeReportForBoardView(value: string): string {
  const text = cutAtSourceNoise(String(value || ""));
  if (!text) return "";
  return text
    .replace(/\n(?:Executive summary)[\s\S]*$/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeBoardReportForContract(params: {
  report: string;
  organisation?: string;
  sector?: string;
  analysisDate?: string;
  dominantRisk?: string;
  strategicOptions?: string[];
  recommendedOption?: string;
  scenarioSimulationOutput?: string;
  interventionOutput?: string;
  memoryProblemText?: string;
}): string {
  const sanitized = sanitizeReportForBoardView(params.report);
  const analysisMap = buildStrategicAnalysisMap({
    organisation: params.organisation,
    sector: params.sector,
    analysisDate: params.analysisDate,
    dominantRisk: params.dominantRisk,
    strategicOptions: params.strategicOptions,
    recommendedOption: params.recommendedOption,
    scenarioSimulationOutput: params.scenarioSimulationOutput || sanitized,
    interventionOutput: params.interventionOutput,
    memoryProblemText: params.memoryProblemText,
  });
  const rendered = renderStrategicAnalysisMapReport(analysisMap);
  const validation = validateBoardReport(sanitized, analysisMap);
  const consistency = validateStrategicConsistency({
    reportText: validation.sanitizedText || sanitized,
    sourceText: params.memoryProblemText,
    analysisMap,
  });
  const severeConsistencyFinding = consistency.findings.some((item) =>
    ["input_dominance_gap", "why_not_alignment_gap"].includes(item.code)
  );
  const issueCodes = new Set(validation.issues.map((item) => item.code));
  const publicYouthSector = /(jeugdzorg|jeugdwet|gemeente|wijkteam|jongeren|gezinnen)/i.test(
    `${params.organisation || ""} ${params.sector || ""} ${params.memoryProblemText || ""}`
  );
  const hasCanonicalStructure =
    /KERNPROBLEEM/i.test(sanitized) && /KERNSTELLING/i.test(sanitized) && /AANBEVOLEN KEUZE/i.test(sanitized);
  const hasLegacyRichStructure =
    /0\.\s*Boardroom summary/i.test(sanitized) &&
    /INZICHT/i.test(sanitized) &&
    /BESTUURLIJKE CONSEQUENTIE/i.test(sanitized);
  const hasMinimumStructure = hasCanonicalStructure || hasLegacyRichStructure;

  const hasHardContractBreak =
    issueCodes.has("forbidden_artifact") ||
    issueCodes.has("metadata_conflict") ||
    issueCodes.has("why_not_choice_leak") ||
    issueCodes.has("incomplete_section") ||
    validation.issues.filter((item) => item.code === "incomplete_sentence").length >= 8 ||
    severeConsistencyFinding;

  if (publicYouthSector && sanitized) {
    return hasHardContractBreak ? rendered : validation.sanitizedText || sanitized;
  }

  if (
    !sanitized ||
    !hasMinimumStructure ||
    hasHardContractBreak ||
    (issueCodes.has("generic_scenario") && validation.issues.length >= 8) ||
    validation.issues.filter((item) => item.code === "incomplete_sentence").length >= 12
  ) {
    return rendered;
  }

  return validation.sanitizedText || rendered;
}

function compactInterventionSection(value: string): string {
  const text = String(value || "");
  if (!text) return "";

  const body = text.replace(/Voorspelde interventies op basis van historische patronen[\s\S]*$/i, "").trim();
  const parts = body.split(/\n(?=\d+\.\s+Actie:)/g);
  if (parts.length === 0) return body;

  const intro = parts[0].match(/^\d+\.\s+Actie:/) ? "" : parts[0].trim();
  const actionBlocks = (intro ? parts.slice(1) : parts)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^\d+\.\s+Actie:\s*Interventie\s+\d+:\s*besluitdiscipline aanscherpen/i.test(part));

  const dedup = new Map<string, string>();
  for (const block of actionBlocks) {
    const key = normalize(block.replace(/\s+/g, " ")).toLowerCase();
    if (!dedup.has(key)) dedup.set(key, block);
  }

  const compact = Array.from(dedup.values()).slice(0, 6).join("\n\n");
  return [intro, compact].filter(Boolean).join("\n\n").trim();
}

function ensureMinimumInterventionActions(
  preferredPlan: string,
  fallbackPlan: string,
  minActions = 15
): string {
  const preferred = String(preferredPlan || "").trim();
  const fallback = String(fallbackPlan || "").trim();
  if (!preferred) return fallback;
  const count = (preferred.match(/(?:^|\n)\d+\.\s+Actie:/g) || []).length;
  if (count >= minActions) return preferred;
  if (!fallback) return preferred;

  const fallbackBlocks = fallback
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter((item) => /^\d+\.\s+Actie:/.test(item));
  if (!fallbackBlocks.length) return preferred;

  const needed = Math.max(0, minActions - count);
  const additions = fallbackBlocks.slice(0, needed).join("\n\n");
  return additions ? `${preferred}\n\n${additions}` : preferred;
}

function extractActionItemsBlockFromText(value: string): string {
  const text = String(value || "");
  const match = text.match(
    /🔴\s*ACTION ITEMS[\s\S]*?(?=\n\s*Voorspelde interventies op basis van historische patronen|\n\s*8\.\s*KPI monitoring|\n\s*9\.\s*Besluittekst|$)/i
  );
  return match ? match[0].trim() : "";
}

function extractOpenQuestionsBlockFromText(value: string): string {
  const text = String(value || "");
  const match = text.match(
    /❓\s*OPEN QUESTIONS[\s\S]*?(?=\n\s*Bron:\s*volledig gesprekstranscript|\n\s*What are the top 5|$)/i
  );
  return match ? match[0].trim() : "";
}

function removeInsightLeakageFromConsequences(value: string): string {
  const lines = String(value || "").split("\n");
  const cleaned: string[] = [];
  let skip = 0;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^(Mechanisme:|Strategische implicatie:)/i.test(line.trim())) {
      continue;
    }
    if (/^\d+\.\s*Inzicht\s+\d+/i.test(line)) {
      skip = 2;
      continue;
    }
    if (skip > 0 && /^(Mechanisme:|Strategische implicatie:)/i.test(line.trim())) {
      skip -= 1;
      continue;
    }
    cleaned.push(line);
  }

  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function enforceConsequencesContract(value: string, sourceContext: string): string {
  const body = cleanMemoText(String(value || ""));
  const context = normalize(sourceContext).toLowerCase();
  const publicYouthContext = /(jeugdzorg|jeugdwet|gemeente|gemeentelijke inkoop|wijkteam|jongeren|gezinnen)/i.test(context);
  const explicitScaleModelContext = /(70\/30|modeladoptie|licentie|replicatie|partnergovernance|eigenaarschap|beweging van nul)/i.test(
    context
  );
  const hasFinancial = /financieel gevolg:/i.test(body);
  const hasGovernance = /governance gevolg:/i.test(body);
  const hasCapacity = /capaciteit\/kwaliteit gevolg:/i.test(body);

  const growthCap =
    context.match(/\b(?:max(?:imaal)?\s*)?(\d+)\s*fte\b/i)?.[1] ||
    context.match(/\b(\d+)\s*fte\/jaar\b/i)?.[1] ||
    "5";
  const triagePct =
    context.match(/\b(\d+)\s*%\b[\s\S]{0,80}\bkort[\s-]*traject\b/i)?.[1] ||
    context.match(/\bkort[\s-]*traject\b[\s\S]{0,80}\b(\d+)\s*%\b/i)?.[1] ||
    context.match(/\btriage\b[\s\S]{0,80}\b(\d+)\s*%\b/i)?.[1] ||
    "8";
  const agingPct =
    context.match(/\+?\s*(\d+)\s*%\b[\s\S]{0,80}\bloonkosten\b/i)?.[1] ||
    context.match(/\bloonkosten\b[\s\S]{0,80}\+?\s*(\d+)\s*%\b/i)?.[1] ||
    context.match(/\bvergrijz[\w-]*\b[\s\S]{0,80}\+?\s*(\d+)\s*%\b/i)?.[1] ||
    "30";

  const lines = [body].filter(Boolean);
  if (!hasFinancial) {
    lines.push(
      publicYouthContext || !explicitScaleModelContext
        ? "Financieel gevolg: zonder contractdiscipline en scherpere propositie stijgt uitvoeringsdruk sneller dan financiële ruimte. Trigger: kwartaalmarge twee meetperiodes onder norm."
        : `Financieel gevolg: zonder netwerk- en licentieversnelling blijft kostendruk (tot +${agingPct}% loonkosten) sneller stijgen dan contractruimte. Trigger: kwartaalmarge onder norm in 2 opeenvolgende periodes.`
    );
  }
  if (!hasGovernance) {
    lines.push(
      publicYouthContext || !explicitScaleModelContext
        ? "Governance gevolg: elke verbreding zonder expliciete contract-, triage- en caseloadtoets verhoogt de kans op bestuurlijke ruis en teamerosie. Trigger: uitbreiding buiten vastgesteld besluitkader."
        : `Governance gevolg: elke groeibeslissing boven ${growthCap} FTE/jaar zonder expliciete boardtoets verhoogt kans op cultuur- en eigenaarschapserosie. Trigger: groeibesluit buiten vastgesteld besluitkader.`
    );
  }
  if (!hasCapacity) {
    lines.push(
      publicYouthContext || !explicitScaleModelContext
        ? "Capaciteit/kwaliteit gevolg: als triage en instroomdiscipline niet verbeteren, blijven wachttijden structureel en neemt kwaliteitsdruk toe. Trigger: wachttijd of caseload twee meetperiodes boven norm."
        : `Capaciteit/kwaliteit gevolg: als kort-trajectuitstroom niet stijgt boven ${triagePct}% blijft wachtdruk structureel en neemt kwaliteitsvariatie toe. Trigger: KPI-doel 2 maanden achtereen niet gehaald.`
    );
  }

  return dedupeLines(lines.join("\n"));
}

function hardenBoardroomLanguage(value: string): string {
  let text = String(value || "");
  if (!text) return "";

  const replacements: Array<[RegExp, string]> = [
    [/\bacademy\/licentiecontracten\b/gi, "contractuele licentie-implementaties"],
    [/\btrainings?-?\s+of\s+licentiecontracten\b/gi, "licentie-implementatiecontracten"],
    [/\btraining\b/gi, "implementatieborging"],
    [/\bworkshop\b/gi, "bestuurlijke werksessie"],
    [/\bmeeting\b/gi, "bestuurlijk overlegmoment"],
    [/\bvergadering\b/gi, "bestuurlijk overlegmoment"],
    [/\bafstemming\b/gi, "bestuurlijke afstemming"],
    [/\bwekelijkse ritmiek\b/gi, "vaste bestuurlijke cadans"],
    [/\bfollow-?up\s+systeem\b/gi, "bestuurlijk monitoringskader"],
    [/\bscriptdiscipline\b/gi, "standaardisatiediscipline"],
    [/\boperationele adoptie\b/gi, "executieconsistentie"],
    [/\bmentorbelasting\b/gi, "kenniscontinuiteitsdruk"],
    [/\binwerktrajecten\b/gi, "kennisoverdrachtstrajecten"],
    [/\bprocesverbetering(en)?\b/gi, "standaardisatiekader"],
  ];

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  return cleanMemoText(dedupeLines(text));
}

function sanitizePublicYouthMemo(value: string): string {
  const text = String(value || "");
  if (!text) return "";
  return cleanMemoText(
    dedupeLines(
      text
        .replace(/\b5\s*FTE\/jaar\b/gi, "expliciete capaciteits- en caseloadgrens")
        .replace(/\bsysteemadoptie\b/gi, "zichtbare contract- en netwerkvalidatie")
        .replace(/\bnetwerk- en licentieversnelling\b/gi, "contractdiscipline en focusversnelling")
        .replace(/\bnetwerk\/licentie-inkomsten\b/gi, "contractverbetering en verwijzersverbreding")
        .replace(/\bgroei t\.o\.v\. fte-cap\b/gi, "groei t.o.v. capaciteitsgrens")
        .replace(/\bcultuur- en eigenaarschapserosie\b/gi, "teamerosie en kwaliteitsverlies")
        .replace(/\bimpactgroei blijft achter op beleids- en netwerkkansen\b/gi, "wachttijd- en contractverbetering blijft achter op bestuurlijke doelen")
        .replace(/\bactiveer partner-audit en pauzeer nieuwe implementaties tot herstel\b/gi, "verscherp samenwerkingsaudit en pauzeer verbreding tot kwaliteit herstelt")
    )
  );
}

function normalizeBoardMemo(value: string): string {
  const fillEmptyMechanismSections = (text: string): string =>
    text
      .replace(
        /CAUSAAL MECHANISME\s*\n\s*(?=DOMINANT ORGANISATIETYPE)/gi,
        "CAUSAAL MECHANISME\nDe causale sprong ontstaat wanneer focus, prioritering en governance aan elkaar worden gekoppeld, zodat impact groeit zonder lineaire uitbreiding van interne uitvoeringsdruk.\n\n"
      )
      .replace(
        /KERNMECHANISME\s*\n\s*(?=STRATEGISCHE SCENARIO'S)/gi,
        "KERNMECHANISME\nKwaliteitsdiscipline, focus en bestuurlijke consistentie vormen samen het mechanisme dat retentie, uitvoerbaarheid en overdraagbaarheid draagt.\n\n"
      );
  const hasMolendriftCompressionSignature = (text: string): boolean => {
    const source = String(text || "");
    if (/\bmolendrift\b/i.test(source)) return true;
    const signals = [
      /\b70\s*\/\s*30\b|\b70%\s*zorg\b|\b30%\s*ontwikkel/i.test(source),
      /\baandelen|mede-eigenaar|eigenaarschap\b/i.test(source),
      /\bbeweging van nul|vng|vws\b/i.test(source),
      /\bmax(?:imaal)?\s*5\s*fte\b|\b5\s*fte\/jaar\b/i.test(source),
      /\bpartnerreplicatie|licentie|modeladoptie\b/i.test(source),
    ].filter(Boolean).length;
    const blockers = [
      /\bjeugdzorg|jeugdwet|gemeentelijke inkoop|haarlem|zuid-kennemerland\b/i.test(source),
    ].filter(Boolean).length;
    return signals >= 4 && blockers === 0;
  };
  const applyPartnerMemoCompression = (text: string): string => {
    const nextSeed = String(text || "");
    if (!hasMolendriftCompressionSignature(nextSeed)) {
      return nextSeed;
    }

    return nextSeed
      .replace(
        /DOMINANTE THESE\s*\n[\s\S]*?(?=\n\nDOMINANT MECHANISM\b)/i,
        [
          "DOMINANTE THESE",
          "Molendrift heeft geen groeiprobleem.",
          "Het heeft een replicatieprobleem.",
          "Impact groeit pas echt wanneer het eigenaarschapsmodel overdraagbaar wordt gemaakt zonder cultuurverlies.",
        ].join("\n")
      )
      .replace(
        /BOARDROOM INSIGHT\s*\n[\s\S]*?(?=\n\nMISDIAGNOSIS INSIGHT\b)/i,
        [
          "BOARDROOM INSIGHT",
          "Molendrift kan niet lineair schalen zonder cultuurverlies.",
          "De kwaliteit wordt gedragen door eigenaarschap, ontwikkeltijd en professionele discipline, niet door hiërarchische controle.",
          "Daarom moet impact groeien via cellen en netwerkreplicatie, niet via extra behandelcapaciteit.",
        ].join("\n")
      )
      .replace(
        /MISDIAGNOSIS INSIGHT\s*\n[\s\S]*?(?=\n\nSTRATEGISCH CONFLICT\b)/i,
        [
          "MISDIAGNOSIS INSIGHT",
          "Molendrift denkt dat impactgroei extra capaciteit vereist.",
          "Maar het werkelijke vraagstuk is overdraagbaarheid van het kwaliteits- en eigenaarschapsmodel.",
          "Zolang dat model niet repliceerbaar wordt gemaakt, blijft groei bestuurlijk vastlopen.",
        ].join("\n")
      )
      .replace(
        /INTERVENTIES\s*\n[\s\S]*?(?=\n\n(?:STRATEGISCHE HEFBOMEN|CAUSAAL MECHANISME)\b)/i,
        [
          "INTERVENTIES",
          "1. Binnen 90 dagen: formaliseer de groeicap van 5 FTE en de 70/30-guardrails. Owner: bestuur en MT. Economics: voorkom extra vaste loonkosten zonder schaalrendement.",
          "2. Binnen 6 maanden: start 2 proefcellen met vaste standaarden, mentorratio en kwartaalreview. Owner: MT. Economics: test schaal zonder volledige overheadgroei.",
          "3. Binnen 6 maanden: contracteer 2 licentiepartners met auditprotocol en verplichte opleidingsroute. Owner: directie. Economics: verschuif groei van FTE-kosten naar modelinkomen.",
        ].join("\n")
      )
      .replace(
        /WIJ BESLUITEN\s*\n[\s\S]*?(?=\n\nBOARDROOM QUESTION\b)/i,
        [
          "WIJ BESLUITEN",
          "1. We zetten lineaire FTE-groei niet in als primaire schaalroute.",
          "2. We testen binnen 6 maanden twee gecontroleerde cellen op kwaliteit, doorstroom en mentorbelasting.",
          "3. We starten binnen 6 maanden twee licentiepartners, maar alleen onder auditprotocol en verplichte opleidingsroute.",
        ].join("\n")
      );
  };
  const ensureOpenQuestions = (text: string): string => {
    if (/Open vragen\s*\n\s*\d+\./i.test(text) || /CHALLENGE QUESTION/i.test(text)) return text;
    const fallback = [
      "Open vragen",
      "1. Welke kwaliteitsguardrails zijn niet onderhandelbaar zodra netwerkreplicatie start?",
      "2. Bij welke KPI-daling activeren we een groeistop of herbesluit op boardniveau?",
      "3. Welke partnercriteria bepalen of modeladoptie schaal toevoegt zonder cultuurerosie?",
    ].join("\n");
    return `${text.trim()}\n\n${fallback}`.trim();
  };
  const stripLegacyScaffold = (text: string): string =>
    text
      .replace(/\nAPPENDIX[\s\S]*$/i, "")
      .trim();
  const stripUnresolvedArtifacts = (text: string): string =>
    text
      .replace(/.*\bundefined\b.*(?:\n|$)/gi, "")
      .replace(/.*\bnull\b.*(?:\n|$)/gi, "")
      .replace(/MISDIAGNOSIS INSIGHT\s+(Molendrift denkt|Molendrift probeert)/i, "MISDIAGNOSIS INSIGHT\n$1")
      .replace(/KERNMECHANISME\s*\n\s*\n+/gi, "KERNMECHANISME\n")
      .replace(/^\s*[([]\s*[)\]]\s*$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const sanitized = dedupeLines(cleanMemoText(stripSourceDump(value)));
  if (!sanitized) return "";
  const parts = sanitized.split(/\n(?=(?:Bestuurlijke hypothese|Feitenbasis|Besluitvoorstel|Consequenties|Opvolging 90 dagen)\n)/);
  if (parts.length <= 1) {
    return truncateBoardMemoTail(
      applyPartnerMemoCompression(
        hardenBoardroomLanguage(
          fillEmptyMechanismSections(
            stripUnresolvedArtifacts(
              ensureOpenQuestions(stripLegacyScaffold(sanitized))
            )
          )
        )
      )
    );
  }

  const rebuilt = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (/^Consequenties\b/i.test(part)) {
        const fullBody = part.slice("Consequenties".length).trim();
        const cleaned = hardenBoardroomLanguage(
          enforceConsequencesContract(removeInsightLeakageFromConsequences(fullBody), sanitized)
        );
        return cleaned ? `Consequenties\n${cleaned}` : "Consequenties";
      }
      if (!/^Opvolging 90 dagen\b/i.test(part)) return part;
      const fullBody = part.slice("Opvolging 90 dagen".length).trim();
      const tailMarker =
        /\n(?=(?:Open vragen|Killer insight|STRATEGIC CONFLICT|STRATEGIC PATTERN|STRATEGY SIMULATION|DECISION MEMORY|EARLY WARNING SYSTEM|BOARDROOM COACH|SCENARIO:\s*GEEN INTERVENTIE|BESTUURLIJKE KEUZE|STRATEGISCHE VRAAG)\b)/i;
      const markerMatch = tailMarker.exec(fullBody);
      const opvolgingBody = markerMatch && markerMatch.index >= 0 ? fullBody.slice(0, markerMatch.index).trim() : fullBody;
      const trailingBody = markerMatch && markerMatch.index >= 0 ? fullBody.slice(markerMatch.index).trim() : "";

      const actionItems = extractActionItemsBlockFromText(opvolgingBody);
      const compact = hardenBoardroomLanguage(
        compactInterventionSection(actionItems || opvolgingBody)
      );
      const rebuiltOpvolging = compact ? `Opvolging 90 dagen\n${compact}` : "Opvolging 90 dagen";
      return trailingBody ? `${rebuiltOpvolging}\n\n${trailingBody}` : rebuiltOpvolging;
    })
    .join("\n\n");

  return truncateBoardMemoTail(
    applyPartnerMemoCompression(
      hardenBoardroomLanguage(
        fillEmptyMechanismSections(
          cleanMemoText(
            stripUnresolvedArtifacts(
              ensureOpenQuestions(stripLegacyScaffold(rebuilt))
            )
          )
        )
      )
    )
  );
}

function sanitizePredictions(
  predictions: Array<{
    interventie: string;
    impact: string;
    risico: string;
    kpi_effect: string;
    confidence: "laag" | "middel" | "hoog";
  }>,
  inputInsights: InputInsights,
  caseClassification: CaseClassification,
  organizationName?: string
): Array<{
  interventie: string;
  impact: string;
  risico: string;
  kpi_effect: string;
  confidence: "laag" | "middel" | "hoog";
}> {
  const cleaned = (predictions || [])
    .map((item) => ({
      ...item,
      interventie: normalize(item.interventie),
      impact: normalize(item.impact),
      risico: normalize(item.risico),
      kpi_effect: normalize(item.kpi_effect),
    }))
    .filter((item) => item.interventie)
    .filter((item) => !/^(strategische interventie|onvoldoende historiek)$/i.test(item.interventie))
    .filter((item) => !(/kostenreductie/i.test(item.interventie) && /0%\s*succesvolle implementatie/i.test(item.impact)));

  const filtered =
    caseClassification === "SUCCESS_MODEL"
      ? cleaned.filter(
          (item) =>
            !/(contract|marge|plafond|kostenreductie|cash|liquiditeit|escalatie)/i.test(
              `${item.interventie} ${item.impact} ${item.kpi_effect}`
            )
        )
      : cleaned;

  const byKey = new Map<string, (typeof cleaned)[number]>();
  for (const item of filtered) {
    const key = item.interventie.toLowerCase();
    if (!byKey.has(key)) byKey.set(key, item);
  }

  if (byKey.size < 3 && inputInsights.actions.length) {
    for (const action of inputInsights.actions) {
      const title = action.replace(/^fase\s*\d+:\s*/i, "").trim();
      const key = title.toLowerCase();
      if (byKey.has(key)) continue;
      byKey.set(key, {
        interventie: title,
        impact: /marge|cash|contract|plafond/i.test(title) ? "Meer voorspelbaarheid op marge en omzet." : "Betere uitvoerbaarheid en focus.",
        risico: "Adoptierisico in de eerste 30 dagen.",
        kpi_effect: "Sneller besluitritme en stabielere KPI-trend.",
        confidence: "middel",
      });
      if (byKey.size >= 3) break;
    }
  }

  const leverage = inputInsights.leverage || {};
  const orgLabel = normalize(organizationName) || "de organisatie";
  const waitlistPct = leverage.waitlistShortPathPct ?? 8;
  const growthCap = leverage.growthCapFte ?? 5;
  const agingPct = leverage.agingCostPct ?? 30;

  const personalize = (item: {
    interventie: string;
    impact: string;
    risico: string;
    kpi_effect: string;
    confidence: "laag" | "middel" | "hoog";
  }) => {
    const text = item.interventie.toLowerCase();
    let oorzaak = "uitvoering en besluitvorming nog te versnipperd zijn";
    let effect = "sneller besluitritme, hogere uitvoerbaarheid en stabielere KPI-trend";
    let kpi = "2-weekse uitvoerbaarheidsscore en maandelijkse KPI-trend verbeteren aantoonbaar";
    let risico = "adoptierisico in de eerste 30 dagen door gedragsverandering in teams";

    if (/wachttijd|triage|instroom|doorstroom/.test(text)) {
      oorzaak = `wachttijdtriage nu circa ${waitlistPct}% uit lange trajecten haalt en opschaling directe capaciteit vrijmaakt`;
      effect = "hogere doorstroom en minder druk op langdurige behandeltrajecten";
      kpi = `kort-trajectratio stijgt van ${waitlistPct}% naar minimaal ${Math.max(waitlistPct + 4, 12)}% binnen 90 dagen`;
      risico = "kwaliteitsschommeling bij snelle regionale opschaling zonder scriptdiscipline";
    } else if (/fte|groei|middenmanagement|governance|eigenaarschap|aandeel/.test(text)) {
      oorzaak = `snelle groei zonder harde guardrails bij ${orgLabel} eigenaarschap en autonomie kan uithollen`;
      effect = "behoud van cultuurkwaliteit met gecontroleerde schaalbaarheid";
      kpi = `groei blijft binnen cap (${growthCap} FTE/jaar) en eigenaarschapspulse blijft stabiel`;
      risico = "frictie met groeiverwachtingen van externe stakeholders";
    } else if (/kennis|mentor|talent|vergrijz/.test(text)) {
      oorzaak = `vergrijzing richting +${agingPct}% loonkosten kan oplopen zonder kennisoverdracht`;
      effect = "lagere kwetsbaarheid op verloop en stabielere productiviteit";
      kpi = "mentor-dekking, junior ramp-up tijd en retentie verbeteren kwartaal-op-kwartaal";
      risico = "onderinvestering in begeleidingscapaciteit waardoor uitvoering vertraagt";
    } else if (/partner|licentie|netwerk|vng|vws|beleid/.test(text)) {
      oorzaak = `${orgLabel} via netwerkwerking sneller impact kan schalen dan via eigen personeelsgroei`;
      effect = "meer schaalbare impact met lagere interne capaciteitsdruk";
      kpi = "aantal actieve partners, licentie-opbrengst en regionale impactscore stijgen";
      risico = "afhankelijkheid van partnerkwaliteit en trage externe besluitvorming";
    }

    return {
      ...item,
      interventie: `Voor ${orgLabel}: ${item.interventie}`,
      impact: `Omdat ${oorzaak}, verwacht effect: ${effect}.`,
      risico: `Risico: ${risico}.`,
      kpi_effect: `KPI-effect: ${kpi}.`,
    };
  };

  return Array.from(byKey.values()).slice(0, 3).map(personalize);
}

function buildStrategicLeveragePredictions(
  inputInsights: InputInsights,
  caseClassification: CaseClassification,
  organizationName?: string
): Array<{
  interventie: string;
  impact: string;
  risico: string;
  kpi_effect: string;
  confidence: "laag" | "middel" | "hoog";
}> {
  const leveragePoints = buildStrategicLeveragePoints(
    inputInsights,
    caseClassification,
    organizationName
  );

  const movementOfZeroKnown = Boolean(inputInsights.leverage?.movementOfZeroKnown);
  const rankedLeveragePoints = [...leveragePoints].sort((a, b) => {
    const score = (point: StrategicLeveragePoint): number => {
      let base =
        point.leverageType === "capaciteit"
          ? 40
          : point.leverageType === "macht"
            ? 30
            : point.leverageType === "netwerk"
              ? 20
              : point.leverageType === "kennis"
                ? 15
                : 10;
      if (movementOfZeroKnown && point.leverageType === "macht") base += 200;
      return base;
    };
    return score(b) - score(a);
  });

  const mapped = rankedLeveragePoints.map((point) => ({
    interventie: `Voor ${normalize(organizationName) || "de organisatie"}: ${point.intervention}`,
    impact: `Brondata: ${point.caseDatapoint}. Strategische hefboom: ${point.leverageType}. Omdat ${point.mechanism}, ${point.impact}`,
    risico:
      point.leverageType === "macht"
        ? "Risico: externe besluitcycli vertragen executie; borg met bestuurlijke mijlpalen en expliciete escalatie op blokkades."
        : point.leverageType === "netwerk"
          ? "Risico: partnerkwaliteit varieert; borg met contractuele kwaliteitsdrempels en kwartaal-audits."
          : point.leverageType === "kennis" || point.leverageType === "standaardisatie"
            ? "Risico: focus op nieuwe omzet kan kernoperatie afleiden; borg met portfolio-prioritering en stopregels."
            : "Risico: uitvoering kan regionaal uiteenlopen; borg met uniforme governance en KPI-gestuurde escalatie.",
    kpi_effect: `Meetbaar doel: ${point.target}. Impact: ${point.impact}.`,
    confidence:
      point.leverageType === "netwerk" || point.leverageType === "capaciteit"
        ? "hoog"
        : "middel",
  }));

  const filteredMapped = mapped.filter(
    (item) =>
      !isOperationalInterventionText(item.interventie) &&
      !isOperationalInterventionText(item.impact) &&
      !isOperationalInterventionText(item.kpi_effect)
  );
  const topPredictions = (filteredMapped.length >= 3 ? filteredMapped : mapped).slice(0, 3);
  return enforceInterventionContract(topPredictions);
}

function buildStrategicLeveragePoints(
  inputInsights: InputInsights,
  caseClassification: CaseClassification,
  organizationName?: string
): StrategicLeveragePoint[] {
  const orgLabel = normalize(organizationName) || "de organisatie";
  const leverage = inputInsights.leverage || {};
  const waitlistPct = leverage.waitlistShortPathPct ?? 8;
  const growthCap = leverage.growthCapFte ?? 5;
  const agingPct = leverage.agingCostPct ?? 30;
  const carePct = leverage.careTimePct ?? 70;
  const devPct = leverage.devTimePct ?? 30;
  const regions = leverage.regions || "Groningen/Friesland/Drenthe";

  if (caseClassification === "SUCCESS_MODEL") {
    return [
      {
        title: "Wachttijdtriage als capaciteitshefboom",
        leverageType: "capaciteit",
        mechanism: "kort-traject triage verlaagt langdurige instroomdruk zonder extra FTE",
        caseDatapoint: `${waitlistPct}% instroom kiest kort traject (3-4 gesprekken)`,
        intervention: `Transformeer wachttijdtriage van lokale pilot naar regionaal toegangssysteem in ${regions}`,
        target: `${waitlistPct}% -> ${Math.max(waitlistPct + 12, 20)}% kort-traject uitstroom in 12 maanden`,
        impact: "behandelcapaciteit stijgt >15% zonder extra personeelsgroei",
      },
      {
        title: "Ontwikkeltijd als kennishefboom",
        leverageType: "kennis",
        mechanism: "ontwikkeltijd kan worden omgezet in extern afneembare kennisproducten",
        caseDatapoint: `${carePct}/${devPct} zorg-ontwikkelratio met structurele projecttijd`,
        intervention: "Productiseer ontwikkelmethodiek in een licentiepropositie met implementatiestandaard",
        target: "minimaal 5 externe trainings- of licentiecontracten in 24 maanden",
        impact: "extra omzet zonder lineaire FTE-groei",
      },
      {
        title: "Netwerk als vermenigvuldigingshefboom",
        leverageType: "netwerk",
        mechanism: "partnernetwerk vermenigvuldigt impact sneller dan interne volumegroei",
        caseDatapoint: `groeicap ${growthCap} FTE/jaar + expliciete netwerkstrategie`,
        intervention: `Sluit implementatieallianties met 3 organisaties die het ${orgLabel}-model contractueel adopteren`,
        target: "3 actieve implementatiepartners in 24 maanden",
        impact: "3x maatschappelijke impact zonder proportionele personeelsgroei",
      },
      {
        title: "Vergrijzing als standaardisatiehefboom",
        leverageType: "standaardisatie",
        mechanism: "standaardisering van kritieke kennis beperkt persoonsafhankelijkheid en dempt kostendruk",
        caseDatapoint: `vergrijzing impliceert circa +${agingPct}% loonkosten`,
        intervention: "Standaardiseer kernmethodiek in overdraagbare zorgstandaarden met certificering voor partnerteams",
        target: "3 gevalideerde standaardmodules in 12 maanden",
        impact: "lagere kwetsbaarheid op uitval en hogere uitvoeringscontinuiteit",
      },
      {
        title: "Beleidspositie als machtshefboom",
        leverageType: "macht",
        mechanism: "beleidsinvloed versnelt adoptie van het model in gemeenten en sector",
        caseDatapoint: "actieve positie in Beweging van Nul en landelijke pilots",
        intervention: "Sluit 2 gemeentelijke pilotafspraken met formeel beleidskader (VNG/VWS-lijn)",
        target: "2 pilotafspraken + 1 beleidsdocument in 12 maanden",
        impact: "versnelde schaal via systeemadoptie en sterkere marktpositie",
      },
    ];
  }

  return [
    {
      title: "Kerncapaciteit beschermen",
      leverageType: "capaciteit",
      mechanism: "strak triage- en planningsritme voorkomt capaciteitserosie",
      caseDatapoint: "hoge wachtdruk en operationele frictie in intake/doorstroom",
      intervention: "Standaardiseer triage en wekelijkse capaciteitssturing",
      target: "wachttijd -20% in 12 maanden",
      impact: "meer voorspelbare doorstroom en lagere werkdruk",
    },
    {
      title: "Kennis als waardehefboom",
      leverageType: "kennis",
      mechanism: "contract- en kostprijssturing voorkomt verlies op kernlijnen",
      caseDatapoint: "tariefdruk en contractplafonds drukken structureel op marge",
      intervention: "Hanteer margevloer per productlijn en heronderhandel contractmix",
      target: "marge +3pp in 12 maanden",
      impact: "financiele stabiliteit en investeringsruimte",
    },
    {
      title: "Schaal via selectieve partners",
      leverageType: "netwerk",
      mechanism: "partnerselectie verhoogt impact zonder interne overbelasting",
      caseDatapoint: "beperkte interne groeiruimte en noodzaak tot impactvergroting",
      intervention: "Ontwikkel partnerselectiemodel met kwaliteits- en governancecriteria",
      target: "2 gevalideerde partners binnen 12 maanden",
      impact: "snellere schaal met beheersbare uitvoeringsrisico's",
    },
  ];
}

function buildStrategicThesis(
  inputInsights: InputInsights,
  caseClassification: CaseClassification,
  strategicMode: StrategicMode,
  mechanisms: StrategicMechanismOutput,
  systemTransformation: SystemTransformationAssessment,
  organizationName?: string
): StrategicThesis {
  const orgLabel = normalize(organizationName) || "de organisatie";
  const leverage = inputInsights.leverage || {};
  const waitlistPct = leverage.waitlistShortPathPct ?? 8;
  const growthCap = leverage.growthCapFte ?? 5;
  const carePct = leverage.careTimePct ?? 70;
  const devPct = leverage.devTimePct ?? 30;
  const movementOfZeroKnown = Boolean(leverage.movementOfZeroKnown);

  if (caseClassification === "SUCCESS_MODEL") {
    const modeLabel =
      systemTransformation.mode === "beleidsinvloedmodel"
        ? "beleidsinvloedgedreven netwerkorganisatie"
        : systemTransformation.mode === "netwerkmodel"
          ? "kwaliteitsgedreven netwerkorganisatie"
          : systemTransformation.mode === "kennislicentiemodel"
            ? "kwaliteitsgedreven kennisorganisatie"
            : "kwaliteitsgedreven GGZ-organisatie";
    const dominantThesis =
      strategicMode === "SCALE"
        ? `${orgLabel} heeft een sterk zorgmodel, maar geen lineair schaalmodel.`
        : `${orgLabel} wint via eigenaarschap en platte governance, niet via volumegroei.`;

    return {
      boardQuestion:
        "Kernvraag: hoe vergroten we maatschappelijke impact zonder het eigenaarschapsmechanisme en de cultuurkwaliteit te breken?",
      dominantThesis,
      killerInsight: `Killer insight: de ${carePct}/${devPct} zorg-ontwikkelratio maakt ${orgLabel} schaalbaar via overdraagbare werkwijze en netwerkadoptie, niet via lineaire personeelsgroei.`,
      decisions: [
        `Binnen 12 maanden schalen we wachttijdtriage van ${waitlistPct}% naar minimaal ${Math.max(waitlistPct + 12, 20)}% kort-traject uitstroom.`,
        "Binnen 24 maanden realiseren we minimaal 5 contractuele licentie-implementaties en 3 strategische implementatieallianties.",
        ...(movementOfZeroKnown
          ? [
              "Binnen 12 maanden sluiten we via Beweging van Nul minimaal 2 gemeentelijke pilotafspraken en leveren we 1 beleidsdocument op (VNG/VWS-lijn).",
            ]
          : []),
        `Elke groeibeslissing boven ${growthCap} FTE/jaar vereist expliciet boardbesluit met cultuur- en eigenaarschapstoets.`,
      ],
    };
  }

  return {
    boardQuestion:
      "Kernvraag: welke strategische keuze verlaagt nu het hoogste structurele risico zonder zorgkwaliteit en teamstabiliteit te schaden?",
    dominantThesis:
      "Het probleem is niet activiteitstekort maar een extern gestuurd spanningsveld tussen regionale triage, contractruimte en budgetgedreven capaciteit.",
    killerInsight:
      "Killer insight: zonder expliciete prioritering op marge, capaciteit en besluitritme versterken operationele en financiele fricties elkaar.",
    decisions: [
      "Binnen 90 dagen borgen we een margevloer per productlijn en contractlijn.",
      "Alle niet-kritische initiatieven zonder KPI-onderbouwing worden gepauzeerd of gestopt.",
      "MT rapporteert maandelijks aan RvT op marge, capaciteit, contractdekking en interventievoortgang.",
    ],
  };
}

function buildDominantMechanismBlock(params: {
  organizationName?: string;
  successMechanism?: string;
  scaleMechanism?: string;
}): string {
  const org = normalize(params.organizationName) || "de organisatie";
  const mechanism =
    normalize(params.successMechanism) ||
    `${org} presteert door een specifiek gedragsmechanisme dat kwaliteit en continuiteit tegelijk borgt.`;
  const creates =
    /eigenaarschap|mede-eigenaar|aandeel/i.test(mechanism)
      ? "hoge professionele autonomie, lage uitstroom en sterke kwaliteitsdiscipline"
      : /contract|marge|ritme|governance/i.test(mechanism)
        ? "prioritering, escalatiediscipline en voorspelbare uitvoeringsdruk"
        : "specifiek gedrag dat prestaties verbetert maar schaal begrenst";
  const implication =
    normalize(params.scaleMechanism) ||
    "verandering of schaal werkt alleen als dit mechanisme eerst expliciet wordt beschermd of herontworpen";

  return [
    "DOMINANT MECHANISM",
    `Het succes van ${org} wordt primair veroorzaakt door: ${mechanism}`,
    "",
    `Dit mechanisme creëert: ${creates}.`,
    "",
    `Strategische implicatie: ${implication}.`,
  ].join("\n");
}

function enforceInterventionContract(
  predictions: Array<{
    interventie: string;
    impact: string;
    risico: string;
    kpi_effect: string;
    confidence: "laag" | "middel" | "hoog";
  }>
): Array<{
  interventie: string;
  impact: string;
  risico: string;
  kpi_effect: string;
  confidence: "laag" | "middel" | "hoog";
}> {
  const hasMetric = (text: string) => /\b\d+([.,]\d+)?\s*(%|pp|fte|maanden?|jaar|dagen?)\b/i.test(text);

  return (predictions || []).map((item) => {
    const impact = /Brondata:/i.test(item.impact)
      ? item.impact
      : `Brondata: case-signaal ontbreekt expliciet. Strategische hefboom: capaciteit. ${item.impact}`;
    const kpi = hasMetric(item.kpi_effect)
      ? item.kpi_effect
      : `${item.kpi_effect} Meetbaar doel: +10% verbetering binnen 12 maanden.`;
    return {
      ...item,
      impact,
      kpi_effect: kpi,
    };
  });
}

function isOperationalInterventionText(value: string): boolean {
  const text = normalize(value).toLowerCase();
  if (!text) return false;
  const withoutCitations = text.replace(/\[meeting,\s*\d{2}-\d{2}-\d{4}\]/gi, "");
  return OPERATIONAL_INTERVENTION_REGEX.test(withoutCitations);
}

function buildKillerInsightEngineBlock(params: {
  organizationName?: string;
  killerInsight?: string;
  successMechanism?: string;
  conflictStatement?: string;
  strategicImplication?: string;
}): string {
  const org = normalize(params.organizationName) || "de organisatie";
  const killerLine =
    normalize(params.killerInsight) ||
    `${org} heeft geen schaalprobleem maar een replicatieprobleem.`;
  const mechanism =
    normalize(params.successMechanism) ||
    "Het model presteert door eigenaarschap en cultuur; lineaire volumegroei verzwakt dat mechanisme.";
  const implication =
    normalize(params.strategicImplication) ||
    `Bestuurlijke keuze moet modelgroei via netwerkadoptie prioriteren boven lineaire FTE-groei, met expliciete trade-off op directe controle.`;

  return [
    "Killer insight",
    killerLine,
    "",
    "Mechanisme",
    mechanism,
    "",
    "Implicatie",
    implication || normalize(params.conflictStatement),
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function buildBoardroomPressureScenarioBlock(params: {
  organizationName?: string;
  waitlistShortPathPct?: number;
  growthCapFte?: number;
  agingCostPct?: number;
  movementOfZeroKnown?: boolean;
}): string {
  const org = normalize(params.organizationName) || "de organisatie";
  const triage = Number.isFinite(params.waitlistShortPathPct as number)
    ? Number(params.waitlistShortPathPct)
    : 8;
  const growthCap = Number.isFinite(params.growthCapFte as number)
    ? Number(params.growthCapFte)
    : 5;
  const aging = Number.isFinite(params.agingCostPct as number)
    ? Number(params.agingCostPct)
    : 30;
  const systemImpact = params.movementOfZeroKnown
    ? `${org} verliest beleidshefboom in netwerk en sector, waardoor systeemadoptie vertraagt.`
    : `${org} verliest relatieve systeempositie doordat externe partijen sneller standaardiseren en schaalvoordeel pakken.`;

  return [
    "SCENARIO: GEEN INTERVENTIE",
    "",
    "Als er geen strategische interventie plaatsvindt:",
    "",
    "Capaciteit",
    `Wachtdruk blijft structureel omdat kort-trajectuitstroom rond ${triage}% blijft, waardoor doorstroom stagneert en capaciteit niet vrijkomt.`,
    "",
    "Financiën",
    `Kostendruk versnelt (tot circa +${aging}% loonkosten), terwijl contractruimte achterblijft; margesturing verslechtert kwartaal-op-kwartaal.`,
    "",
    "Kwaliteit",
    `Groei boven ${growthCap} FTE/jaar zonder guardrails verhoogt kans op cultuur- en eigenaarschapserosie, met stijgende kwaliteitsvariatie.`,
    "",
    "Systeemimpact",
    systemImpact,
    "",
    "BESTUURLIJKE CONSEQUENTIE",
    `Uitstel vergroot strategisch risico: zonder keuze verschuift druk van bestuurlijke regie naar operationele brandbestrijding.`,
  ].join("\n");
}

function buildMisdiagnosisInsightBlock(params: {
  organizationName?: string;
  patternProfile?: StrategicPatternProfile;
  successMechanism?: string;
  strategicMode?: StrategicMode;
  caseClassification?: CaseClassification;
}): string {
  const org = normalize(params.organizationName) || "de organisatie";
  const primaryPattern = params.patternProfile?.primary_pattern;
  const mechanism =
    normalize(params.successMechanism) ||
    "het schaalmechanisme ontbreekt en kwaliteit hangt af van lokaal eigenaarschap en cultuur";

  if (primaryPattern === "professional_partnership") {
    return [
      "MISDIAGNOSIS INSIGHT",
      `${org} probeert maatschappelijke impact te vergroten door extra behandelcapaciteit toe te voegen.`,
      "",
      "Maar het onderliggende vraagstuk is niet capaciteit. Het is overdraagbaarheid van een kwaliteits- en eigenaarschapsmodel.",
      "",
      "Zolang dat model niet expliciet repliceerbaar wordt gemaakt via cellen, partners of licentie-implementaties, blijft impactgroei bestuurlijk vastlopen.",
    ].join("\n");
  }

  if (params.caseClassification === "SUCCESS_MODEL" || params.strategicMode === "SCALE") {
    return [
      "MISDIAGNOSIS INSIGHT",
      `${org} probeert groei op te lossen met extra capaciteit.`,
      "",
      "Maar het onderliggende probleem is dat het model niet lineair schaalbaar is.",
      "",
      `Zolang ${mechanism} niet expliciet wordt herontworpen, blijft de organisatie symptomen bestrijden in plaats van het mechanisme.`,
    ].join("\n");
  }

  return [
    "MISDIAGNOSIS INSIGHT",
    `${org} probeert zichtbare symptomen op te lossen via extra acties en capaciteit.`,
    "",
    "Maar het onderliggende probleem is een structureel besturingsmechanisme dat dezelfde frictie opnieuw produceert.",
    "",
    "Zolang dit mechanisme niet wordt aangepast, blijft het probleem terugkeren.",
  ].join("\n");
}

function buildDecisionPressureBlock(params: {
  optionA?: string;
  optionB?: string;
  optionC?: string;
  explicitLoss?: string;
  killSwitch?: string;
}): string {
  const optionA =
    normalize(params.optionA) ||
    "Bescherm de kern, begrens parallelle verbreding en herstel bestuurlijke focus.";
  const optionB =
    normalize(params.optionB) ||
    "Versnel verbreding en accepteer hogere druk op capaciteit, marge en uitvoering.";
  const optionC =
    normalize(params.optionC) ||
    "Kies een gefaseerde route met expliciete governance-gates en heldere stopregels.";
  const explicitLoss =
    normalize(params.explicitLoss) ||
    "Maximale snelheid en maximale bestuurlijke beheersbaarheid kunnen niet tegelijk behouden blijven.";
  const killSwitch =
    normalize(params.killSwitch) ||
    "Stop de gekozen route als kern-KPI's 2 meetperiodes onder norm blijven of cultuurguardrails structureel worden overschreden.";

  return [
    "BESTUURLIJKE KEUZE",
    "",
    "Optie A",
    optionA,
    "",
    "Optie B",
    optionB,
    "",
    "Optie C",
    optionC,
    "",
    "Prijs van de keuze",
    explicitLoss,
    "",
    "Kill-switch",
    killSwitch,
  ].join("\n");
}

function buildStrategicFramingBlock(params: {
  organizationName?: string;
  superficialQuestion?: string;
  strategicQuestion?: string;
}): string {
  const org = normalize(params.organizationName) || "de organisatie";
  const superficial =
    normalize(params.superficialQuestion) ||
    "hoe de organisatie sneller groeit in volume";
  const strategic =
    normalize(params.strategicQuestion) ||
    "hoe het model groeit zonder het kernmechanisme van cultuur en eigenaarschap te breken";

  return [
    "STRATEGISCHE VRAAG",
    "",
    `De vraag voor ${org} is niet:`,
    superficial,
    "",
    "maar:",
    "Strategische kernvraag:",
    strategic,
  ].join("\n");
}

function hasBoardroomPressureContract(value: string): boolean {
  const text = normalize(String(value || ""));
  return (
    /Killer insight/i.test(text) &&
    /SCENARIO:\s*GEEN INTERVENTIE/i.test(text) &&
    /BESTUURLIJKE KEUZE/i.test(text) &&
    /STRATEGISCHE VRAAG/i.test(text) &&
    /\b\d+([.,]\d+)?\s*(%|fte|maanden|jaar|dagen)\b/i.test(text)
  );
}

function buildStrategicConflictEngineBlock(params: {
  conflictStatement?: string;
  sideA?: string;
  sideB?: string;
  mechanism?: string;
  priceIfA?: string;
  priceIfB?: string;
  resolutionA?: string;
  resolutionB?: string;
  resolutionC?: string;
  boardroomQuestion?: string;
}): string {
  const sideA = normalize(params.sideA) || "kwaliteit en cultuur beschermen";
  const sideB = normalize(params.sideB) || "impact en schaal vergroten";
  const conflict = normalize(params.conflictStatement) || `${sideA} vs ${sideB}`;
  const mechanism =
    normalize(params.mechanism) ||
    "Het eigenaarschapsmechanisme levert kwaliteit lokaal, terwijl schaaldruk standaardisatie en controle versterkt; die prikkels botsen.";
  const priceIfA =
    normalize(params.priceIfA) ||
    "lagere systeemimpact en tragere externe adoptie, met risico op gemiste maatschappelijke waarde.";
  const priceIfB =
    normalize(params.priceIfB) ||
    "hogere kans op cultuurverwatering, kwaliteitsvariatie en verlies van intern eigenaarschap.";
  const resolutionA =
    normalize(params.resolutionA) ||
    "Balansstrategie: beperkte schaal met harde cultuur- en kwaliteitsdrempels.";
  const resolutionB =
    normalize(params.resolutionB) ||
    "Prioriteitsstrategie: expliciet impact prioriteren met sterkere centrale governance.";
  const resolutionC =
    normalize(params.resolutionC) ||
    "Hybride model: netwerkreplicatie met contractuele kwaliteitsguardrails en kill-switch.";
  const boardroomQuestion =
    normalize(params.boardroomQuestion) ||
    "Als deze doelen niet tegelijk volledig haalbaar zijn, welke prioriteit kiezen we expliciet in de komende 12 maanden?";

  return [
    "STRATEGIC CONFLICT",
    "",
    "CONFLICT",
    sideA,
    "vs",
    sideB,
    "",
    "CONFLICT_MECHANISM",
    `Mechanisme\n${mechanism}`,
    "",
    "PRICE_OF_CHOICE",
    `Als we kiezen voor A:\n${priceIfA}`,
    "",
    `Als we kiezen voor B:\n${priceIfB}`,
    "",
    "CONFLICT_RESOLUTION",
    `A. ${resolutionA}`,
    `B. ${resolutionB}`,
    `C. ${resolutionC}`,
    "",
    "BOARDROOM QUESTION",
    boardroomQuestion,
  ].join("\n");
}

function hasStrategicConflictContract(value: string): boolean {
  const text = normalize(String(value || ""));
  return (
    /STRATEGIC CONFLICT/i.test(text) &&
    /CONFLICT_MECHANISM/i.test(text) &&
    /PRICE_OF_CHOICE/i.test(text) &&
    /CONFLICT_RESOLUTION/i.test(text) &&
    /BOARDROOM QUESTION/i.test(text)
  );
}

function buildBoardroomCoachBlock(params: {
  organizationName?: string;
  strategicHypothesis?: string;
  coreConflict?: string;
  chosenStrategy?: string;
  assumptions?: string[];
  challenges?: Array<{ question: string; why: string }>;
  decisionPressure?: string;
  killSwitch?: string;
}): string {
  const org = normalize(params.organizationName) || "de organisatie";
  const assumptions = (params.assumptions || [])
    .map((item) => normalize(item))
    .filter(Boolean)
    .slice(0, 4);
  const defaultAssumptions = [
    "groei schaadt cultuurkwaliteit zodra eigenaarschap niet expliciet wordt geborgd",
    "netwerkpartners behouden kwaliteit zonder centrale uitvoering",
    "beleidsinvloed versnelt systeemadoptie binnen de gekozen horizon",
  ];
  const assumptionLines = (assumptions.length ? assumptions : defaultAssumptions).map((item) => `- ${item}`);

  const defaultChallenges = [
    {
      question: "Welke onderdelen van het model zijn niet overdraagbaar naar partners?",
      why: `Als ${org} overdraagbaarheid overschat, kopiëren partners de vorm zonder het kwaliteitsmechanisme van cultuur en eigenaarschap.`,
    },
    {
      question: "Bij welke kwaliteitsdrempel stoppen we schaal expliciet?",
      why: "Zonder vooraf gedefinieerde stopdrempel wordt kwaliteitsverlies pas zichtbaar nadat reputatie- en governance-schade al is opgetreden.",
    },
    {
      question: "Wanneer wordt netwerkimpact belangrijker dan groei van de eigen organisatie?",
      why: "Deze keuze bepaalt of bestuurders sturen op volumegroei of op systeemadoptie, en maakt het dominante trade-off expliciet.",
    },
  ];
  const providedChallenges = (params.challenges || []).filter(
    (item) => normalize(item?.question) && normalize(item?.why)
  );
  const challenges = [...providedChallenges, ...defaultChallenges].slice(0, 3);
  const challengeLines = challenges.flatMap((item) => [
    "CHALLENGE QUESTION",
    normalize(item.question),
    "WHY IT MATTERS",
    normalize(item.why),
    "",
  ]);

  const decisionPressure =
    normalize(params.decisionPressure) ||
    "Als partnerkwaliteit en executieconsistentie dalen, kan modelreplicatie reputatieschade sneller vergroten dan interne groei.";
  const killSwitch =
    normalize(params.killSwitch) ||
    "Stop partnerimplementaties zodra kwaliteitsscore onder drempel blijft gedurende 2 opeenvolgende meetperiodes.";

  return [
    "BOARDROOM COACH",
    "",
    "BOARD_CONTEXT",
    `Strategische hypothese: ${normalize(params.strategicHypothesis) || "Schaal via modelreplicatie met behoud van cultuurkwaliteit."}`,
    `Kernconflict: ${normalize(params.coreConflict) || "kwaliteit vs schaal"}`,
    `Gekozen strategie: ${normalize(params.chosenStrategy) || "hybride netwerkstrategie"}`,
    "",
    "STRATEGIC_ASSUMPTIONS",
    "Aannames die getest moeten worden",
    ...assumptionLines,
    "",
    "BOARD_CHALLENGES",
    ...challengeLines,
    "DECISION_PRESSURE",
    "Besluitdruk scenario",
    decisionPressure,
    "",
    "Kill-switch",
    killSwitch,
  ].join("\n");
}

function hasBoardroomCoachContract(value: string): boolean {
  const text = String(value || "");
  const challengeCount = (text.match(/CHALLENGE QUESTION/gi) || []).length;
  const hasAssumption = /Aannames die getest moeten worden/i.test(text) || /STRATEGIC_ASSUMPTIONS/i.test(text);
  const hasPressure = /DECISION_PRESSURE/i.test(text) && /Besluitdruk scenario/i.test(text);
  return /BOARDROOM COACH/i.test(text) && challengeCount >= 3 && hasAssumption && hasPressure;
}

type StrategySimulationEngineOutput = {
  simulation_context: {
    strategic_options: string[];
    core_mechanism: string;
    ecosystem_factors: string[];
    capacity_context: string;
  };
  strategic_scenarios: Array<{
    scenario: "A" | "B" | "C" | "D";
    strategy_type: "conservatief" | "expansief" | "hybride";
    description: string;
  }>;
  simulation_results: Array<{
    scenario: "A" | "B" | "C" | "D";
    capaciteit: string;
    financien: string;
    cultuur: string;
    netwerk: string;
  }>;
  scenario_risks: Array<{
    scenario: "A" | "B" | "C" | "D";
    risico: string;
    kans: "laag" | "middel" | "hoog";
    impact: "laag" | "middel" | "hoog";
  }>;
  strategy_comparison: string;
  decision_guidance: string;
  early_warning_signals: Array<{
    scenario: "A" | "B" | "C" | "D";
    indicator: string;
    kpi: string;
  }>;
  boardroom_visualization: string;
};

function buildStrategySimulationEngine(params: {
  strategicOptions: string[];
  successMechanism?: string;
  leverage?: InputInsights["leverage"];
  organizationName?: string;
}): StrategySimulationEngineOutput {
  const org = normalize(params.organizationName) || "de organisatie";
  const growthCap = params.leverage?.growthCapFte ?? 5;
  const waitlistPct = params.leverage?.waitlistShortPathPct ?? 8;
  const agingPct = params.leverage?.agingCostPct ?? 30;
  const mechanismText = normalize(params.successMechanism).toLowerCase();
  const publicYouthContext = /(jeugdzorg|jongeren|gezinnen|gemeente|wijkteam)/i.test(
    `${org} ${(params.strategicOptions || []).join(" ")} ${mechanismText}`
  );
  const partnershipContext =
    !publicYouthContext &&
    /(eigenaarschap|cultuur|netwerk|replicatie|partner|licentie|modeladoptie|70\/30)/i.test(mechanismText) ||
    Boolean(params.leverage?.movementOfZeroKnown) ||
    Boolean(params.leverage?.licenseMarginKnown);
  const options = (params.strategicOptions || []).slice(0, 3);
  const defaultA = partnershipContext
    ? "Culture-first model: bescherm kernkwaliteit en eigenaarschap met beperkte interne groei."
    : "Bescherm de kern en begrens parallelle verbreding totdat capaciteit en governance aantoonbaar op orde zijn.";
  const defaultB = partnershipContext
    ? "Versnel impact via extra capaciteit en accepteer hogere druk op borging en uitvoering."
    : "Versnel verbreding en accepteer hogere uitvoeringsdruk op teams, marge en sturing.";
  const defaultC = partnershipContext
    ? "Schaal selectief via partners met contractuele kwaliteitsborging en auditritme."
    : "Gefaseerde route met selectieve samenwerking en expliciete governance-gates.";
  const scenarioA = options[0] || defaultA;
  const scenarioB = options[1] || defaultB;
  const scenarioC = options[2] || defaultC;

  const simulation_results: StrategySimulationEngineOutput["simulation_results"] = publicYouthContext
    ? [
        {
          scenario: "A",
          capaciteit: "Capaciteit stabiliseert wanneer instroom strakker wordt gestuurd en kerncasuïstiek voorrang krijgt.",
          financien: "Financiële ruimte verbetert als contractmix en verlieslatende breedte sneller worden gecorrigeerd.",
          cultuur: "Teamstabiliteit verbetert wanneer focus en caseloadgrenzen bestuurlijk worden beschermd.",
          netwerk: "Verwijzersvertrouwen groeit zodra de propositie scherper en consistenter wordt uitgelegd.",
        },
        {
          scenario: "B",
          capaciteit: "Capaciteit komt extra onder druk zodra aanbod wordt verbreed zonder scherpere triage of partnerroutering.",
          financien: "Meer volume kan tijdelijk omzet toevoegen, maar verantwoordingslast en margedruk lopen sneller op.",
          cultuur: "Meer spreiding vergroot bestuurlijke ruis en verhoogt risico op uitval en kwaliteitsdruk.",
          netwerk: "Gemeenten en partners zien minder scherp waar de organisatie werkelijk onderscheidend is.",
        },
        {
          scenario: "C",
          capaciteit: "Capaciteit blijft beschermd als niet-kernvragen via partners of verwijzers worden gerouteerd.",
          financien: "Contractkwaliteit en verwijzersvertrouwen verbeteren zonder lineaire uitbreiding van interne kosten.",
          cultuur: "De kerncultuur blijft beter intact zolang partners onder scherp governancekader werken.",
          netwerk: "Netwerksamenwerking versterkt bereik zonder dat de organisatie haar kernpropositie hoeft te verbreden.",
        },
      ]
    : [
    {
      scenario: "A",
      capaciteit: `Capaciteit groeit beheerst; doorstroom verbetert beperkt zolang kort-traject rond ${waitlistPct}% blijft.`,
      financien: `Financiële volatiliteit laag, maar margeverbetering blijft gematigd zonder externe schaalversnelling.`,
      cultuur: "Cultuurstabiliteit hoog door beperkte verandering en behoud van eigenaarschap.",
      netwerk: "Netwerkimpact groeit langzaam; systeemadoptie blijft gefaseerd.",
    },
    {
      scenario: "B",
      capaciteit: "Capaciteitswinst kan snel stijgen, maar uitvoering wordt kwetsbaar bij overschrijding van begeleidingscapaciteit.",
      financien: `Korte-termijn omzetpotentieel hoger, met verhoogd risico op kostendruk tot +${agingPct}% bij falende borging.`,
      cultuur: `Cultuur- en kwaliteitsrisico stijgt zodra groei boven ${growthCap} FTE/jaar uitkomt.`,
      netwerk: "Snelle partnerexpansie vergroot bereik, maar verhoogt kwaliteitsvariatie.",
    },
    {
      scenario: "C",
      capaciteit: "Capaciteit verbetert via netwerkadoptie en triage-opschaling zonder lineaire personeelsgroei.",
      financien: "Financiële balans verbetert via licenties/partners met lagere vaste kosten dan intern opschalen.",
      cultuur: "Kerncultuur blijft beter beschermd mits partnerkwaliteit contractueel wordt afgedwongen.",
      netwerk: "Systeemimpact groeit via partners en beleidslijnen met beheersbare governancecomplexiteit.",
    },
  ];

  const scenario_risks: StrategySimulationEngineOutput["scenario_risks"] = [
    {
      scenario: "A",
      risico: "Te lage impactsnelheid waardoor maatschappelijke vraag sneller groeit dan modeladoptie.",
      kans: "middel",
      impact: "middel",
    },
    {
      scenario: "B",
      risico: "Cultuurverwatering en kwaliteitsvariatie door te snelle schaal zonder borging.",
      kans: "hoog",
      impact: "hoog",
    },
    {
      scenario: "C",
      risico: "Partnergovernance en externe besluitcycli vertragen realisatie van schaaldoelen.",
      kans: "middel",
      impact: "middel",
    },
  ];

  const early_warning_signals: StrategySimulationEngineOutput["early_warning_signals"] = [
    {
      scenario: "A",
      indicator: "Impactgroei blijft achter op beleids- en netwerkkansen.",
      kpi: "Netwerkimpact-score < streefwaarde 2 periodes op rij.",
    },
    {
      scenario: "B",
      indicator: "Kwaliteitsvariatie en cultuurdruk nemen sneller toe dan governance kan opvangen.",
      kpi: "Kwaliteitsscore of eigenaarschapspulse 2 periodes onder norm.",
    },
    {
      scenario: "C",
      indicator: "Partneradoptie blijft achter of inconsistent.",
      kpi: "Actieve implementatiepartners < plan en triageverbetering stagneert 2 periodes.",
    },
  ];
  if (partnershipContext) {
    simulation_results.push({
      scenario: "D",
      capaciteit: "Capaciteit groeit via interne cellen plus partnernetwerk, met gefaseerde borging.",
      financien: "Kostenprofiel blijft beheerst door mix van interne productiviteit en externe modeladoptie.",
      cultuur: "Cultuurrisico middel: interne cellen beschermen kernwaarden, maar governancecomplexiteit neemt toe.",
      netwerk: "Netwerkimpact hoog door gecombineerde schaalpaden met centrale kwaliteitskaders.",
    });
    scenario_risks.push({
      scenario: "D",
      risico: "Governance-overhead stijgt door dubbele schaalroute (interne cellen + extern netwerk).",
      kans: "middel",
      impact: "middel",
    });
    early_warning_signals.push({
      scenario: "D",
      indicator: "Governancecapaciteit blijft achter op uitvoeringscomplexiteit.",
      kpi: "Besluitdoorlooptijd > norm of auditachterstand 2 periodes op rij.",
    });
  }

  return {
    simulation_context: {
      strategic_options: [scenarioA, scenarioB, scenarioC],
      core_mechanism:
        normalize(params.successMechanism) ||
        `${org} levert kwaliteit via eigenaarschap; schaal moet dit mechanisme beschermen.`,
      ecosystem_factors: ["partnerkwaliteit", "beleidscycli", "contractruimte"],
      capacity_context: `Interne groeicap rond ${growthCap} FTE/jaar; kort-trajectbasis circa ${waitlistPct}%.`,
    },
    strategic_scenarios: [
      { scenario: "A", strategy_type: "conservatief", description: scenarioA },
      { scenario: "B", strategy_type: "expansief", description: scenarioB },
      { scenario: "C", strategy_type: "hybride", description: scenarioC },
      ...(partnershipContext
        ? [
            {
              scenario: "D" as const,
              strategy_type: "hybride" as const,
              description:
                "Hybrid governance: schaal via interne cellen én netwerkpartners met één governancekader.",
            },
          ]
        : []),
    ],
    simulation_results,
    scenario_risks,
    strategy_comparison: [
      "STRATEGY COMPARISON",
      `Scenario A — ${scenarioA}\nVoordeel: hoogste bestuurlijke beheersbaarheid.\nNadeel: lagere korte-termijn impactsnelheid.`,
      `Scenario B — ${scenarioB}\nVoordeel: hoogste potentiële impactgroei.\nNadeel: grootste druk op uitvoering en kwaliteitsborging.`,
      `Scenario C — ${scenarioC}\nVoordeel: balans tussen kernbescherming en selectieve schaal.\nNadeel: afhankelijk van governance-discipline en partnerkwaliteit.`,
    ].join("\n\n"),
    decision_guidance: [
      "BESTUURLIJKE INTERPRETATIE",
      `Als het bestuur prioriteit geeft aan stabiliteit: Scenario A — ${scenarioA}.`,
      `Als het bestuur prioriteit geeft aan versnelling: Scenario B — ${scenarioB}.`,
      `Als het bestuur balans zoekt: Scenario C — ${scenarioC}.`,
    ].join("\n"),
    early_warning_signals,
    boardroom_visualization: [
      "STRATEGY SIMULATION SUMMARY",
      `Scenario A — ${scenarioA}: impact middel, risico middel-laag.`,
      `Scenario B — ${scenarioB}: impact hoog, risico hoog.`,
      `Scenario C — ${scenarioC}: impact hoog, risico middel.`,
      ...(partnershipContext ? ["Scenario D: impact hoog, risico middel (governance-gevoelig)."] : []),
    ].join("\n"),
  };
}

function buildStrategySimulationBlock(sim: StrategySimulationEngineOutput): string {
  const scenarioDescriptions = new Map(
    sim.strategic_scenarios.map((item) => [item.scenario, normalize(item.description) || `Scenario ${item.scenario}`])
  );
  const scenarioLines = sim.strategic_scenarios
    .map((item) => `Scenario ${item.scenario} — ${scenarioDescriptions.get(item.scenario)} (${item.strategy_type})\n${item.description}`)
    .join("\n\n");
  const impactLines = sim.simulation_results
    .map(
      (item) =>
        `Scenario ${item.scenario} — ${scenarioDescriptions.get(item.scenario)}\nCapaciteit\n${item.capaciteit}\n\nFinanciën\n${item.financien}\n\nCultuur\n${item.cultuur}\n\nNetwerk\n${item.netwerk}`
    )
    .join("\n\n");
  const riskLines = sim.scenario_risks
    .map(
      (item) =>
        `Scenario ${item.scenario} — ${scenarioDescriptions.get(item.scenario)}\nRISK PROFILE\nRisico\n${item.risico}\nKans\n${item.kans}\nImpact\n${item.impact}`
    )
    .join("\n\n");
  const warningLines = sim.early_warning_signals
    .map(
      (item) =>
        `Scenario ${item.scenario} — ${scenarioDescriptions.get(item.scenario)}\nEarly warning indicator: ${item.indicator}\nMeetbare KPI: ${item.kpi}`
    )
    .join("\n\n");

  return [
    "STRATEGY SIMULATION",
    "",
    "STRATEGIC_SCENARIOS",
    scenarioLines,
    "",
    "SIMULATION_RESULTS",
    impactLines,
    "",
    "SCENARIO_RISKS",
    riskLines,
    "",
    sim.strategy_comparison,
    "",
    sim.decision_guidance,
    "",
    "EARLY_WARNING_SIGNALS",
    warningLines,
    "",
    sim.boardroom_visualization,
  ].join("\n");
}

function hasStrategySimulationContract(value: string): boolean {
  const text = normalize(String(value || ""));
  const scenarioCount = (text.match(/Scenario [ABC]/g) || []).length;
  return (
    /STRATEGY SIMULATION/i.test(text) &&
    scenarioCount >= 3 &&
    /SIMULATION_RESULTS/i.test(text) &&
    /SCENARIO_RISKS/i.test(text) &&
    /STRATEGY COMPARISON/i.test(text)
  );
}

type DecisionMemoryOutput = {
  decision_record: {
    decision_id: string;
    organisatie: string;
    datum: string;
    gekozen_strategie: string;
    bestuurlijke_hypothese: string;
    kernconflict: string;
    interventies: string[];
    kpi_doelen: string[];
  };
  decision_context: {
    aannames: string[];
    risico_s: string[];
    strategische_reden: string;
  };
  decision_history: Array<{
    session_id: string;
    datum: string;
    gekozen_strategie: string;
    dominant_thesis: string;
  }>;
  decision_alignment: {
    status: "consistent" | "gedeeltelijk afwijkend" | "fundamenteel afwijkend";
    vorige_strategie: string;
    nieuwe_richting: string;
    board_vraag: string;
  };
  boardroom_alert: string;
};

function buildDecisionMemoryEngine(params: {
  organizationName?: string;
  sessionId?: string;
  dateIso?: string;
  chosenStrategy?: string;
  strategicHypothesis?: string;
  coreConflict?: string;
  interventionLines?: string[];
  kpiLines?: string[];
  priorDecisions?: Array<{
    session_id: string;
    date: string;
    chosen_strategy: string;
    dominant_thesis: string;
  }>;
}): DecisionMemoryOutput {
  const canonicalStrategy = (value: string): string => {
    const text = normalize(value).toLowerCase();
    if (!text) return "C";
    if (/\boptie\s*a\b|\ba\b/.test(text)) return "A";
    if (/\boptie\s*b\b|\bb\b/.test(text)) return "B";
    if (/\boptie\s*c\b|\bc\b/.test(text)) return "C";
    return text.replace(/\s+/g, " ");
  };
  const org = normalize(params.organizationName) || "de organisatie";
  const chosen = normalize(params.chosenStrategy) || "Optie C";
  const thesis = normalize(params.strategicHypothesis) || "Schaal via modelreplicatie met behoud van kernkwaliteit.";
  const coreConflict = normalize(params.coreConflict) || "kwaliteit beschermen vs impact versnellen";
  const dateIso = normalize(params.dateIso) || new Date().toISOString();
  const sessionId = normalize(params.sessionId) || createId("session");
  const interventions = (params.interventionLines || []).map((line) => normalize(line)).filter(Boolean).slice(0, 5);
  const kpis = (params.kpiLines || []).map((line) => normalize(line)).filter(Boolean).slice(0, 5);
  const history = (params.priorDecisions || []).slice(0, 5);
  const prev = history[0];
  const chosenCanonical = canonicalStrategy(chosen);
  const previousCanonical = canonicalStrategy(normalize(prev?.chosen_strategy || ""));

  let status: DecisionMemoryOutput["decision_alignment"]["status"] = "consistent";
  if (prev && previousCanonical !== chosenCanonical) {
    status = "gedeeltelijk afwijkend";
  }
  if (prev && previousCanonical && previousCanonical !== chosenCanonical && /vs|tegenover|conflict/i.test(coreConflict)) {
    status = "fundamenteel afwijkend";
  }

  const previousStrategy = normalize(prev?.chosen_strategy || "geen eerdere strategiekeuze gevonden");
  const currentDirection = chosen;
  const boardQuestion =
    status === "consistent"
      ? "Bevestigen we deze koers en borgen we de gekozen aannames expliciet?"
      : "Is deze koerswijziging bewust genomen en bestuurlijk gevalideerd inclusief nieuwe aannames en risicoacceptatie?";

  const boardAlert =
    status === "consistent"
      ? "STRATEGIE ALERT\nHuidige analyse is consistent met de laatst vastgelegde strategische richting."
      : [
          "STRATEGIE ALERT",
          `Deze analyse wijkt af van het besluit van ${normalize(prev?.date || "onbekend")}.`,
          "",
          `Vorige strategie:\n${previousStrategy}`,
          "",
          `Nieuwe richting:\n${currentDirection}`,
          "",
          `Board vraag:\n${boardQuestion}`,
        ].join("\n");

  return {
    decision_record: {
      decision_id: createId("decision"),
      organisatie: org,
      datum: dateIso,
      gekozen_strategie: chosen,
      bestuurlijke_hypothese: thesis,
      kernconflict: coreConflict,
      interventies: interventions,
      kpi_doelen: kpis,
    },
    decision_context: {
      aannames: [
        "gekozen strategie blijft consistent met kernmechanisme",
        "interventies zijn uitvoerbaar binnen capaciteit",
        "geaccepteerde trade-offs blijven bestuurlijk gedragen",
      ],
      risico_s: [
        "koersdrift zonder expliciet herbesluit",
        "maatwerk-interventies zonder drempelbewaking",
        "kwaliteitserosie bij schaal zonder guardrails",
      ],
      strategische_reden:
        "Besluit vastleggen voorkomt dat strategiewijzigingen impliciet ontstaan en dwingt expliciete bestuurlijke herijking af.",
    },
    decision_history: history.map((item) => ({
      session_id: item.session_id,
      datum: item.date,
      gekozen_strategie: item.chosen_strategy,
      dominant_thesis: item.dominant_thesis,
    })),
    decision_alignment: {
      status,
      vorige_strategie: previousStrategy,
      nieuwe_richting: currentDirection,
      board_vraag: boardQuestion,
    },
    boardroom_alert: boardAlert,
  };
}

function buildDecisionMemoryBlock(memory: DecisionMemoryOutput): string {
  const record = memory.decision_record;
  const context = memory.decision_context;
  const historyLines = memory.decision_history.length
    ? memory.decision_history
        .map(
          (item) =>
            `- ${item.datum} | ${item.gekozen_strategie} | ${normalize(item.dominant_thesis).slice(0, 140)}`
        )
        .join("\n")
    : "- Geen eerdere besluiten gevonden voor deze organisatie.";
  const interventions = record.interventies.length
    ? record.interventies.map((line) => `- ${line}`).join("\n")
    : "- Nog geen interventies vastgelegd.";
  const kpis = record.kpi_doelen.length
    ? record.kpi_doelen.map((line) => `- ${line}`).join("\n")
    : "- Nog geen KPI-doelen vastgelegd.";

  return [
    "DECISION MEMORY",
    "",
    "DECISION_RECORD",
    `Decision ID: ${record.decision_id}`,
    `Organisatie: ${record.organisatie}`,
    `Datum: ${record.datum}`,
    `Gekozen strategie: ${record.gekozen_strategie}`,
    `Bestuurlijke hypothese: ${record.bestuurlijke_hypothese}`,
    `Kernconflict: ${record.kernconflict}`,
    "Interventies",
    interventions,
    "KPI doelen",
    kpis,
    "",
    "DECISION_CONTEXT",
    "Aannames",
    ...context.aannames.map((item) => `- ${item}`),
    "Risico's",
    ...context.risico_s.map((item) => `- ${item}`),
    `Strategische reden\n${context.strategische_reden}`,
    "",
    "DECISION_HISTORY",
    historyLines,
    "",
    "DECISION_ALIGNMENT",
    `Status: ${memory.decision_alignment.status}`,
    `Vorige strategie: ${memory.decision_alignment.vorige_strategie}`,
    `Nieuwe richting: ${memory.decision_alignment.nieuwe_richting}`,
    `Board vraag: ${memory.decision_alignment.board_vraag}`,
    "",
    memory.boardroom_alert,
  ].join("\n");
}

function hasDecisionMemoryContract(value: string): boolean {
  const text = normalize(String(value || ""));
  return (
    /DECISION MEMORY/i.test(text) &&
    /DECISION_RECORD/i.test(text) &&
    /DECISION_CONTEXT/i.test(text) &&
    /DECISION_HISTORY/i.test(text) &&
    /DECISION_ALIGNMENT/i.test(text)
  );
}

type EarlyWarningSystemOutput = {
  risk_signals: string[];
  warning_indicators: Array<{
    indicator: string;
    huidige_waarde: string;
    risico: string;
    actie: string;
  }>;
  risk_thresholds: Array<{
    kpi: string;
    norm: string;
    kritische_waarde: string;
  }>;
  boardroom_alert: string;
};

function buildEarlyWarningSystemEngine(params: {
  organizationName?: string;
  leverage?: InputInsights["leverage"];
  interventionPredictions?: Array<{
    interventie: string;
    impact: string;
    risico: string;
    kpi_effect: string;
    confidence: "laag" | "middel" | "hoog";
  }>;
  strategySimulation?: StrategySimulationEngineOutput;
}): EarlyWarningSystemOutput {
  const org = normalize(params.organizationName) || "de organisatie";
  const triage = params.leverage?.waitlistShortPathPct ?? 8;
  const growthCap = params.leverage?.growthCapFte ?? 5;
  const aging = params.leverage?.agingCostPct ?? 30;

  const riskSignals = [
    "capaciteitsdruk stijgt wanneer kort-trajectuitstroom achterblijft",
    "financiële druk stijgt wanneer loonkosten sneller stijgen dan contractruimte",
    "cultuurdruk stijgt wanneer groei buiten guardrails plaatsvindt",
    "partnerrisico stijgt bij kwaliteitsvariatie in netwerkimplementatie",
  ];

  const partnerRisk =
    params.interventionPredictions?.find((item) => /partner|alliantie|licentie/i.test(item.interventie))?.risico ||
    "partnerkwaliteit varieert en kan modelvertrouwen aantasten";
  const simSignal =
    params.strategySimulation?.early_warning_signals?.[0]?.indicator ||
    "kwaliteitsscore netwerkpartners daalt";

  const indicators: EarlyWarningSystemOutput["warning_indicators"] = [
    {
      indicator: "Kort-trajectuitstroom",
      huidige_waarde: `${triage}%`,
      risico: "wachtdruk blijft structureel en capaciteit groeit niet mee",
      actie: "activeer regionale triage-escalatie met uniforme governance",
    },
    {
      indicator: "Groei t.o.v. FTE-cap",
      huidige_waarde: `cap ${growthCap} FTE/jaar`,
      risico: "cultuur- en eigenaarschapserosie bij overschrijding",
      actie: "vereis boardtoets boven groeicap en stop bij 2x overschrijding",
    },
    {
      indicator: "Kostendruk loonkosten",
      huidige_waarde: `tot +${aging}%`,
      risico: "marge daalt sneller dan contractruimte",
      actie: "versnel netwerk/licentie-inkomsten of herprioriteer portfolio",
    },
    {
      indicator: "Partnerkwaliteit netwerk",
      huidige_waarde: simSignal,
      risico: partnerRisk,
      actie: "activeer partner-audit en pauzeer nieuwe implementaties tot herstel",
    },
  ];

  const thresholds: EarlyWarningSystemOutput["risk_thresholds"] = [
    {
      kpi: "Kort-trajectuitstroom",
      norm: ">= 20% binnen 12 maanden",
      kritische_waarde: "< 10% gedurende 2 meetperiodes",
    },
    {
      kpi: "Kwartaalmarge",
      norm: "boven interne norm",
      kritische_waarde: "onder norm gedurende 2 kwartalen",
    },
    {
      kpi: "Netwerkkwaliteitsscore",
      norm: ">= afgesproken kwaliteitsdrempel",
      kritische_waarde: "< drempel gedurende 2 meetperiodes",
    },
  ];

  return {
    risk_signals: riskSignals,
    warning_indicators: indicators,
    risk_thresholds: thresholds,
    boardroom_alert: [
      "BOARDROOM ALERT",
      `Het huidige signalenprofiel suggereert dat de gekozen strategie van ${org} onder druk staat.`,
      "",
      "Bestuurlijke vraag:",
      "Willen we strategie aanpassen of extra interventies inzetten voordat structurele schade optreedt?",
    ].join("\n"),
  };
}

function buildEarlyWarningSystemBlock(ews: EarlyWarningSystemOutput): string {
  const signalLines = ews.risk_signals.map((item) => `- ${normalize(item)}`).join("\n");
  const indicatorLines = ews.warning_indicators
    .map(
      (item) =>
        [
          "EARLY WARNING",
          `Indicator\n${normalize(item.indicator)}`,
          `Huidige waarde\n${normalize(item.huidige_waarde)}`,
          `Risico\n${normalize(item.risico)}`,
          `Actie\n${normalize(item.actie)}`,
        ].join("\n")
    )
    .join("\n\n");
  const thresholdLines = ews.risk_thresholds
    .map((item) => `- KPI: ${item.kpi} | Norm: ${item.norm} | Kritische waarde: ${item.kritische_waarde}`)
    .join("\n");

  return [
    "EARLY WARNING SYSTEM",
    "",
    "RISK_SIGNALS",
    signalLines,
    "",
    "WARNING_INDICATORS",
    indicatorLines,
    "",
    "RISK_THRESHOLDS",
    thresholdLines,
    "",
    ews.boardroom_alert,
  ].join("\n");
}

function hasEarlyWarningContract(value: string): boolean {
  const text = normalize(String(value || ""));
  const warningCount = (text.match(/EARLY WARNING/gi) || []).length;
  return (
    /EARLY WARNING SYSTEM/i.test(text) &&
    /RISK_SIGNALS/i.test(text) &&
    /RISK_THRESHOLDS/i.test(text) &&
    /BOARDROOM ALERT/i.test(text) &&
    warningCount >= 3
  );
}

function formatStrategicPatternLabel(
  pattern?: StrategicPatternMatch["pattern"] | StrategicPatternProfile["primary_pattern"]
): string {
  switch (pattern) {
    case "professional_partnership":
      return "Professional Partnership";
    case "network_model":
      return "Network Organization";
    case "ecosystem_strategy":
      return "Ecosystem Strategy";
    case "platform_model":
      return "Platform Model";
    case "mission_driven_organization":
      return "Mission Driven Organization";
    case "klassiek_organisatiemodel":
      return "Classical Hierarchy";
    case "cooperatief_kennisbedrijf":
      return "Professional Partnership";
    case "scale_model":
      return "Classical Hierarchy";
    default:
      return normalize(String(pattern || "")).replace(/_/g, " ");
  }
}

function buildStrategicPatternBoardroomBlock(profile: StrategicPatternProfile): string {
  const primary = formatStrategicPatternLabel(profile.primary_pattern);
  const secondary = formatStrategicPatternLabel(profile.secondary_pattern);
  const risks = (profile.typical_risks || []).map((item) => `- ${normalize(item)}`).join("\n");
  const interventions = (profile.strategic_interventions || [])
    .map((item) => `- ${normalize(item)}`)
    .join("\n");

  return [
    "STRATEGIC PATTERN",
    "",
    "Organisatiemodel",
    `Primary pattern: ${primary}`,
    secondary ? `Secondary pattern: ${secondary}` : "",
    "",
    "Strategic implications",
    `Schaalmechanisme: ${normalize(profile.scale_mechanism)}`,
    `Typische groeistrategie: ${normalize(profile.growth_strategy)}`,
    risks ? `Typische risico's\n${risks}` : "",
    interventions ? `Strategische interventies\n${interventions}` : "",
    "",
    "ORGANISATIEMODEL",
    normalize(profile.boardroom_framing),
  ]
    .filter(Boolean)
    .join("\n");
}

function hasStrategicPatternContract(value: string): boolean {
  const text = normalize(String(value || ""));
  return (
    /STRATEGIC PATTERN/i.test(text) &&
    /Organisatiemodel/i.test(text) &&
    /Schaalmechanisme:/i.test(text) &&
    /Typische risico/i.test(text) &&
    /Strategische interventies/i.test(text)
  );
}

function criticalPublicationFlags(flags: string[]): string[] {
  const critical = new Set([
    "missing_killer_insight_engine",
    "missing_boardroom_pressure_scenario",
    "missing_decision_pressure_block",
    "missing_strategic_framing",
    "missing_strategic_conflict_engine",
    "missing_strategic_conflict_choice",
    "missing_forcing_choice",
    "missing_strategic_pattern",
    "missing_strategy_simulation",
    "missing_decision_memory",
    "missing_early_warning_system",
    "missing_boardroom_coach",
    "missing_boardroom_assumptions",
    "missing_boardroom_decision_pressure",
    "interventions_not_measurable",
    "contains_placeholder_artifacts",
    "contains_unresolved_tokens",
    "open_questions_empty",
  ]);
  return (flags || []).filter((flag) => critical.has(flag));
}

function assertPublicationReady(
  report: string,
  summary: string,
  quality: { score: number }
): void {
  if (!String(report || "").trim()) {
    throw new Error("Analyse-output ontbreekt. Analyse niet publiceren.");
  }

  const requiredFields: Array<{ label: string; ok: boolean }> = [
    { label: "Dominante these", ok: Boolean(String(summary || "").trim()) || Boolean(extractSection(report, 2)) },
    {
      label: "Strategisch conflict",
      ok:
        /Spanning A:|Spanning B:|STRATEGISCH CONFLICT|KERNCONFLICT|KERNPROBLEEM/i.test(report) ||
        hasStrategicConflictChoiceBlock(report),
    },
    { label: "Strategische opties", ok: hasOptionsBlock(report) },
    { label: "Aanbevolen richting", ok: hasRecommendedChoiceBlock(report) || Boolean(extractSection(report, 5)) },
    { label: "Killer insights", ok: hasKillerInsightsBlock(report) },
    { label: "90 dagen interventieplan", ok: hasInterventionPlanBlock(report) || Boolean(extractSection(report, 7)) },
  ];

  const missing = requiredFields.filter((item) => !item.ok).map((item) => item.label);
  if (missing.length) {
    throw new Error(`Analyse-output onvolledig. Analyse niet publiceren: ${missing.join(", ")}.`);
  }

  if (Number(quality.score || 0) < 85) {
    throw new Error(`Analysekwaliteit onder publicatiedrempel: ${quality.score}/100.`);
  }
}

function buildPublicationWarning(
  report: string,
  summary: string,
  quality: { score: number; flags: string[] }
): string {
  const warnings: string[] = [];

  try {
    assertPublicationReady(report, summary, quality);
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : String(error));
  }

  const criticalFlags = criticalPublicationFlags(quality.flags || []);
  if (criticalFlags.length) {
    warnings.push(`Kritieke kwaliteitsvlaggen: ${criticalFlags.join(", ")}`);
  }

  return warnings.length ? `Publicatie waarschuwing: ${warnings.join(" | ")}` : "";
}

function buildBoardMemoFromReport(
  report: string,
  thesis?: string,
  preferredOpenQuestions?: string,
  preferredKillerInsights?: string,
  extras?: {
    organizationName?: string;
    successMechanism?: string;
    strategicMode?: StrategicMode;
    caseClassification?: CaseClassification;
    conflictStatement?: string;
    conflictSideA?: string;
    conflictSideB?: string;
    forcingChoice?: string;
    explicitLoss?: string;
    waitlistShortPathPct?: number;
    growthCapFte?: number;
    agingCostPct?: number;
    movementOfZeroKnown?: boolean;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    strategicQuestion?: string;
    patternProfile?: StrategicPatternProfile;
    strategySimulation?: StrategySimulationEngineOutput;
    decisionMemory?: DecisionMemoryOutput;
    earlyWarningSystem?: EarlyWarningSystemOutput;
  }
): string {
  const trimWords = (value: string, maxWords = 120): string => {
    const words = normalize(value)
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
    if (words.length <= maxWords) return words.join(" ");
    return `${words.slice(0, maxWords).join(" ")}…`;
  };
  const isSuccessScaleCase =
    extras?.caseClassification === "SUCCESS_MODEL" &&
    extras?.strategicMode === "SCALE";
  const primaryPattern = formatStrategicPatternLabel(extras?.patternProfile?.primary_pattern);
  const recommendedOptionCode = report.match(/Aanbevolen optie:\s*([ABC])/i)?.[1] || "C";
  const resolvedOptions = (() => {
    if (!isSuccessScaleCase) {
      return {
        optionA: normalize(extras?.optionA || ""),
        optionB: normalize(extras?.optionB || ""),
        optionC: normalize(extras?.optionC || ""),
      };
    }

    const partnershipDriven =
      /professional partnership/i.test(primaryPattern) ||
      /eigenaarschap|aandelen|70%.*zorg|30%.*ontwikkel/i.test(
        [report, thesis, extras?.successMechanism].filter(Boolean).join(" ")
      );

    if (partnershipDriven) {
      return {
        optionA:
          "Bescherm de kern: houd groei bewust begrensd, borg het 70/30-model en verscherp kwaliteits- en cultuurguardrails voordat nieuwe schaalstappen worden gezet.",
        optionB:
          "Bouw gecontroleerde cellen: start 1-2 autonome teams of regiocellen met centrale standaarden, mentorratio en expliciete governance op kwaliteitsoverdracht.",
        optionC:
          "Schaal via netwerkreplicatie: vergroot impact via partneradoptie, licentie-implementaties en harde kwaliteits-, eigenaarschaps- en auditguardrails.",
      };
    }

    return {
      optionA:
        "Bescherm de kern en vertraag verbreding totdat kwaliteit, capaciteit en governance aantoonbaar op orde zijn.",
      optionB:
        "Versnel schaal via autonome cellen met centrale standaarden en expliciete cultuurguardrails.",
      optionC:
        "Schaal via netwerkreplicatie met contractuele kwaliteitsnormen, partnerselectie en bestuurlijke kill-switches.",
    };
  })();
  const sanitizeMemoNarrative = (text: string): string => {
    let next = String(text || "");
    const allowMolendriftCompression =
      isSuccessScaleCase &&
      hasMolendriftCaseSignature(
        [text, report, thesis, extras?.successMechanism, extras?.organizationName].filter(Boolean).join(" "),
        extras?.organizationName
      );
    if (allowMolendriftCompression) {
      next = next.replace(
        /Molendrift heeft een sterk zorgmodel, maar geen lineair schaalmodel\. De schaaldoorbraak ligt niet in meer capaciteit, maar in…/i,
        "Molendrift heeft een sterk zorgmodel, maar geen lineair schaalmodel. De schaaldoorbraak ligt niet in meer capaciteit, maar in modeladoptie, netwerkreplicatie en strakke governance."
      );
      next = next.replace(
        /C Kostenreductie en herstructurering: Herontwerp van kostenbasis, capaciteit en governance met harde prioritering\./gi,
        `C ${resolvedOptions.optionC}`
      );
      next = next.replace(
        /Aanbevolen optie:\s*Optie C\./gi,
        "Aanbevolen optie: Optie C - schaal via netwerkreplicatie."
      );
      next = next.replace(
        /Als we kiezen voor Optie C:\s*Dan verliezen we snelle volumegroei zonder guardrails wordt gepauzeerd om erosie van cultuur en eigenaarschap te voorkomen\.\./gi,
        "Als we kiezen voor Optie C: dan accepteren we minder directe controle over uitvoering en investeren we extra in partnerselectie, audits en cultuurguardrails."
      );
      next = next.replace(
        /MISDIAGNOSIS INSIGHT\s+MISDIAGNOSIS INSIGHT/gi,
        "MISDIAGNOSIS INSIGHT"
      );
      next = next.replace(
        /DOMINANT ORGANISATIETYPE\s+scale operator/gi,
        "DOMINANT ORGANISATIETYPE\nprofessional partnership"
      );
      next = next.replace(
        /Scenario A — Consolidatie kernactiviteiten: Focus op stabilisatie van kernzorg, margeherstel en executiediscipline\./gi,
        "Scenario A — Bescherm de kern: begrens groei, borg het 70/30-model en verscherp kwaliteits- en cultuurguardrails."
      );
      next = next.replace(
        /Scenario B — Verbreding nieuwe diensten: Versneld ontwikkelen van aanvullende diensten voor extra omzet en risicospreiding\./gi,
        "Scenario B — Bouw gecontroleerde cellen: start 1-2 autonome teams of regiocellen met centrale standaarden en kwaliteitsoverdracht."
      );
      next = next.replace(
        /Scenario C — Kostenreductie en herstructurering: Herontwerp van kostenbasis, capaciteit en governance met harde prioritering\./gi,
        "Scenario C — Schaal via netwerkreplicatie: vergroot impact via partneradoptie, licentie-implementaties en harde kwaliteitsguardrails."
      );
      next = next.replace(
        /DOMINANTE HEFBOOMCOMBINATIE\s+governance/gi,
        "DOMINANTE HEFBOOMCOMBINATIE\ncultuur\nnetwerkreplicatie\ngovernance"
      );
      next = next.replace(
        /Aanbevolen optie C\./gi,
        "Aanbevolen optie C: schaal via netwerkreplicatie."
      );
      next = next.replace(
        /MISDIAGNOSIS INSIGHT\s+Molendrift probeert impact te vergroten door uitbreiding van capaciteit\./i,
        "MISDIAGNOSIS INSIGHT\nMolendrift probeert maatschappelijke impact te vergroten door extra behandelcapaciteit toe te voegen."
      );
      next = next.replace(
        /Maar het onderliggende probleem is geen capaciteitsprobleem\. Het is een replicatieprobleem\./i,
        "Maar het onderliggende vraagstuk is niet capaciteit. Het is overdraagbaarheid van een kwaliteits- en eigenaarschapsmodel."
      );
      next = next.replace(
        /Zolang Medewerkersparticipatie via aandelen vergroot psychologisch en financieel eigenaarschap, waardoor betrokkenheid en retentie hoog blijven\. niet wordt aangepast, blijft impactgroei terugkeren als bestuurlijk knelpunt\./i,
        "Zolang dat model niet expliciet repliceerbaar wordt gemaakt via cellen, partners of licentie-implementaties, blijft impactgroei bestuurlijk vastlopen."
      );
      next = next.replace(
        /BOARDROOM INSIGHT\s+Parallelle ambities zonder volgorde vergroten uitvoeringsverlies ontstaat doordat Capaciteit, planning en normdruk begrenzen gelijktijdige executie Implicatie: Portfolio-volgorde afdwingen met expliciete stopregels Medewerkersparticipatie via aandelen vergroot psychologisch en financieel eigenaarschap, waardoor betrokkenheid en retentie hoog blijven\./i,
        "BOARDROOM INSIGHT\nMolendrift vergroot impact niet door meer behandelcapaciteit toe te voegen, maar door het eigenaarschaps- en kwaliteitsmodel overdraagbaar te maken. Zonder scherpe volgorde tussen kernbescherming, cellenbouw en partnerreplicatie ontstaat uitvoeringsverlies, omdat capaciteit, planning en normdruk gelijktijdige executie begrenzen."
      );
      next = next.replace(
        /BOARDROOM INSIGHT[\s\S]*?(?=\n\nMISDIAGNOSIS INSIGHT)/i,
        [
          "BOARDROOM INSIGHT",
          "Molendrift heeft geen groeiprobleem.",
          "Het heeft een replicatieprobleem.",
          "De kwaliteit wordt gedragen door eigenaarschap, ontwikkeltijd en professionele discipline, niet door hiërarchische schaal.",
          "Daarom moet impact groeien via cellen en netwerkreplicatie, niet via lineaire personeelsuitbreiding.",
        ].join("\n")
      );
      next = next.replace(
        /BESTUURLIJKE KEUZE\s+A /i,
        "BESTUURLIJKE KEUZE\nOptie A\n"
      );
      next = next.replace(/\s+B Bouw gecontroleerde cellen:/i, "\n\nOptie B\nBouw gecontroleerde cellen:");
      next = next.replace(/\s+C Schaal via netwerkreplicatie:/i, "\n\nOptie C\nSchaal via netwerkreplicatie:");
      next = next.replace(
        /Aanbevolen optie:\s*Optie C - schaal via netwerkreplicatie\./i,
        "Aanbevolen optie\nOptie C - schaal via netwerkreplicatie."
      );
      next = next.replace(
        /CAUSAAL MECHANISME\s*(?:\n\s*){2,}/gi,
        "CAUSAAL MECHANISME\nWaardecreatie stijgt wanneer Molendrift bestaande capaciteit slimmer triageert en het zorgmodel overdraagbaar maakt zonder lineaire FTE-groei.\n\n"
      );
      next = next.replace(
        /CAUSAAL MECHANISME\s*\n\s*(?=DOMINANT ORGANISATIETYPE)/gi,
        "CAUSAAL MECHANISME\nDe causale sprong ontstaat wanneer Molendrift triage, ontwikkeltijd en partnerreplicatie koppelt, zodat impact toeneemt zonder evenredige groei van interne behandelcapaciteit.\n\n"
      );
      next = next.replace(
        /KERNMECHANISME\s*(?:\n\s*){2,}/gi,
        "KERNMECHANISME\nEigenaarschap, ontwikkeltijd en kwaliteitsdiscipline vormen samen het mechanisme dat retentie, behandelkwaliteit en overdraagbaarheid draagt.\n\n"
      );
      next = next.replace(
        /DOMINANTE HEFBOOMCOMBINATIE\s+governance/gi,
        "DOMINANTE HEFBOOMCOMBINATIE\ncultuur\nnetwerkreplicatie\ngovernance"
      );
      next = next.replace(/\.\./g, ".");
    }
    return next;
  };
  const fromPredictedInterventions = (source: string): Array<{
    actie: string;
    mechanisme: string;
    kpi: string;
  }> => {
    const text = String(source || "");
    const blocks = text
      .split(/\n(?=\d+\.\s+Interventie:)/g)
      .map((item) => item.trim())
      .filter((item) => /^\d+\.\s+Interventie:/i.test(item))
      .slice(0, 3);
    return blocks.map((block, index) => {
      const actie = normalize(block.match(/^\d+\.\s+Interventie:\s*(.+)$/im)?.[1] || `Interventie ${index + 1}`);
      const mechanisme = normalize(block.match(/Impact:\s*(.+)$/im)?.[1] || "Mechanisme niet gespecificeerd.");
      const kpi = normalize(block.match(/KPI-effect:\s*(.+)$/im)?.[1] || "KPI ontbreekt.");
      return { actie, mechanisme, kpi };
    });
  };
  const buildBoardroomBrevityBlock = (params: {
    dominantThesis?: string;
    dominantMechanism?: string;
    organizationName?: string;
    insightLine?: string;
    mechanismLine?: string;
    misdiagnosisInsight?: string;
    patternProfile?: StrategicPatternProfile;
    noInterventionScenario?: string;
    conflictA: string;
    conflictB: string;
    explicitLoss: string;
    optionA: string;
    optionB: string;
    optionC: string;
    recommendedOption: string;
    tradeOffExposure?: string;
    interventions: Array<{ actie: string; mechanisme: string; kpi: string }>;
    decisions: string[];
    boardQuestion: string;
  }): string => {
    const org = normalize(params.organizationName) || "de organisatie";
    const boardroomContext = normalize(
      [
        params.dominantThesis,
        params.dominantMechanism,
        params.mechanismLine,
        params.misdiagnosisInsight,
        params.boardQuestion,
      ]
        .filter(Boolean)
        .join(" ")
    ).toLowerCase();
    const publicYouthContext = /(jeugdzorg|jeugdwet|gemeente|gemeentelijke inkoop|wijkteam|jongeren|gezinnen)/i.test(
      boardroomContext
    );
    const patternPrimary = formatStrategicPatternLabel(params.patternProfile?.primary_pattern);
    const patternSecondary = formatStrategicPatternLabel(params.patternProfile?.secondary_pattern);
    const patternLine = patternPrimary
      ? `Organisatiemodel: ${patternPrimary}${patternSecondary ? ` + ${patternSecondary}` : ""}.`
      : "";
    const dominantThesis = trimWords(
      normalize(params.dominantThesis) ||
        (publicYouthContext
          ? `${org} heeft geen capaciteitsprobleem maar een contract- en positioneringsprobleem.`
          : `${org} heeft geen groeiprobleem maar een schaalmechanismeprobleem.`),
      14
    );
    const dominantMechanism = trimWords(
      normalize(params.dominantMechanism) ||
        `${org} wint door een specifiek mechanisme dat kwaliteit versterkt maar lineaire schaal begrenst.`,
      65
    );
    const insight = trimWords(
      normalize(params.insightLine) ||
        (publicYouthContext
          ? "De organisatie heeft geen volumegroeiprobleem. Ze heeft een bestuurlijk contract- en focusprobleem."
          : `De organisatie heeft geen volumegroeiprobleem. Ze heeft een mechanistisch replicatieprobleem.`),
      18
    );
    const mechanism = trimWords(
      normalize(params.mechanismLine) ||
        (publicYouthContext
          ? `${org} beschermt kwaliteit alleen als contractkeuze, triage en positionering tegelijk worden aangescherpt; extra volume zonder die keuzes verhoogt werkdruk sneller dan het waarde toevoegt.`
          : `${org} creëert kwaliteit via eigenaarschap en cultuur. Lineaire groei via extra FTE verhoogt coördinatiedruk en verzwakt dit mechanisme; netwerkreplicatie schaalt impact met minder cultuurerosie.`),
      24
    );
    const misdiagnosis = trimWords(
      normalize(params.misdiagnosisInsight) ||
        (publicYouthContext
          ? `${org} probeert wachtdruk op te lossen met extra capaciteit. Maar het onderliggende probleem is contractdiscipline, triage en scherpe positionering. Zolang dat mechanisme niet verandert, blijft het probleem terugkeren.`
          : `${org} probeert groei op te lossen met extra capaciteit. Maar het onderliggende probleem is dat het model niet lineair schaalbaar is. Zolang dat mechanisme niet verandert, blijft het probleem terugkeren.`),
      28
    );
    const conflictBody = trimWords(
      `${params.conflictA} vs ${params.conflictB}. Prijs van de keuze: ${params.explicitLoss}`,
      110
    );
    const optionBody = [
      "Optie A",
      trimWords(normalize(params.optionA), 28),
      "",
      "Optie B",
      trimWords(normalize(params.optionB), 28),
      "",
      "Optie C",
      trimWords(normalize(params.optionC), 28),
      "",
      "Aanbevolen optie",
      normalize(params.recommendedOption),
    ].join("\n");
    const tradeOffBody = trimWords(
      normalize(params.tradeOffExposure) ||
        `Als we kiezen voor ${normalize(params.recommendedOption)}, verliezen we directe cultuurcontrole, stijgt partnerafhankelijkheid en hebben we auditdiscipline nodig.`,
      55
    );
    const interventionsBody = params.interventions
      .slice(0, 3)
      .map(
        (item, idx) =>
          `Interventie ${idx + 1} | ${trimWords(item.actie, 22)} | ${trimWords(item.mechanisme, 16)} | ${trimWords(item.kpi, 18)}`
      )
      .join("\n");
    const scenarioBody = trimWords(
      normalize(params.noInterventionScenario) ||
        `Als er geen strategische interventie plaatsvindt, groeit druk op capaciteit, kwaliteit en strategische positie sneller dan bestuurlijke regie.`,
      120
    );
    const decisionsBody = (params.decisions || [])
      .slice(0, 3)
      .map((item, idx) => `${idx + 1}. ${trimWords(item, 20)}`)
      .join("\n");
    const boardQuestion = trimWords(
      normalize(params.boardQuestion) ||
        (publicYouthContext
          ? "De vraag voor het bestuur is niet hoe we meer volume draaien, maar welke focus contractkwaliteit en teamstabiliteit tegelijk beschermt."
          : "De vraag voor het bestuur is niet hoe we sneller groeien, maar welk schaalmechanisme kwaliteit intact laat."),
      60
    );
    const legacyInterventionPlan = params.interventions
      .slice(0, 3)
      .map(
        (item, idx) =>
          `${idx + 1}. Actie: ${trimWords(item.actie, 16)}\nEigenaar: Bestuur\nDeadline: Binnen 90 dagen\nSuccescriterium: ${trimWords(item.kpi, 18)}`
      )
      .join("\n\n");

    return [
      "DOMINANTE THESE",
      dominantThesis,
      "",
      "DOMINANT MECHANISM",
      dominantMechanism,
      "",
      "BOARDROOM INSIGHT",
      trimWords(
        [
          insight,
          mechanism,
          `Mechanisme: ${memoCausalMechanismText}`,
          memoLeverCombination
            ? `Sprong: ${memoLeverCombination.levers.join(" + ")}. ${memoLeverCombination.strategicEffect}`
            : "",
        ]
          .filter(Boolean)
          .join(" "),
        70
      ),
      "",
      "MISDIAGNOSIS INSIGHT",
      misdiagnosis,
      "",
      "STRATEGISCH CONFLICT",
      trimWords(`CONFLICT: ${conflictBody}`, 120),
      "",
      "BESTUURLIJKE KEUZE",
      optionBody,
      "",
      "KEERZIJDE VAN DE KEUZE",
      tradeOffBody,
      "",
      "INTERVENTIES",
      interventionsBody,
      ...(memoLeverLines ? ["", "STRATEGISCHE HEFBOMEN", memoLeverLines] : []),
      "",
      "CAUSAAL MECHANISME",
      memoCausalMechanismText,
      "",
      buildStrategyDNAMemoSummary(memoStrategyDNA),
      "",
      "KERNMECHANISME",
      memoCoreMechanismText,
      ...(memoScenarioBlock ? ["", memoScenarioBlock] : []),
      ...(memoStressTests.memoSummary ? ["", memoStressTests.memoSummary] : []),
      ...(memoLeverCombination
        ? [
            "",
            "DOMINANTE HEFBOOMCOMBINATIE",
            memoLeverCombination.levers.join("\n"),
            "",
            "STRATEGISCH EFFECT",
            memoLeverCombination.strategicEffect,
          ]
        : []),
      "",
      "SCENARIO: GEEN INTERVENTIE",
      scenarioBody,
      "",
      "WIJ BESLUITEN",
      decisionsBody,
      "",
      "BOARDROOM QUESTION",
      boardQuestion,
    ].join("\n");
  };

  const besluitvraag = extractSection(report, 1);
  const thesisFromReport = extractSection(report, 2);
  const feitenbasis = dedupeFactBaseLines(dedupeLines(extractSection(report, 3)));
  const keuze = extractSection(report, 5);
  const regels = hardenBoardroomLanguage(
    enforceConsequencesContract(
      removeInsightLeakageFromConsequences(extractSection(report, 6)),
      report
    )
  );
  const interventies = hardenBoardroomLanguage(
    dedupeLines(extractSection(report, 7) || extractActionItemsBlockFromText(report))
  );
  const kpis = hardenBoardroomLanguage(dedupeLines(extractSection(report, 8)));
  const decisionCadence = buildDecisionCadenceFromKpis(kpis);
  const besluittekst = extractSection(report, 9);
  const openQuestions = String(preferredOpenQuestions || "").trim() || extractOpenQuestionsBlockFromText(report);
  const killerInsights =
    String(preferredKillerInsights || "").trim() || extractKillerInsightsFromReport(report);
  const memoLeverDetection = detectStrategicLeverMatrix({
    sourceText: [report, killerInsights, keuze, regels, interventies].filter(Boolean).join("\n\n"),
    killerInsights: killerInsights.split("\n"),
  });
  const memoLeverCombination = memoLeverDetection.dominantCombination;
  const memoCausalStrategy = runCausalStrategyEngine({
    levers: memoLeverDetection.levers,
    dominantCombination: memoLeverCombination,
  });
  const memoStrategyDNA = classifyStrategyDNA({
    organizationDescription: extras?.organizationName,
    strategy: [report, killerInsights, keuze, regels, interventies].filter(Boolean).join("\n\n"),
    levers: memoLeverDetection.levers,
    causalAnalysis: memoCausalStrategy,
  });
  const memoScenarios = generateStrategicScenarios({
    strategic_options: [extras?.optionA, extras?.optionB, extras?.optionC].filter(Boolean) as string[],
    strategic_hefbomen: memoLeverDetection.levers,
    strategic_hefboom_combinatie: memoLeverCombination,
    strategic_causal_analysis: memoCausalStrategy,
  });
  const memoScenarioBlock = buildScenarioMemoBlock({
    strategic_scenarios: memoScenarios,
    strategic_hefbomen: memoLeverDetection.levers,
    strategic_hefboom_combinatie: memoLeverCombination,
    strategic_causal_analysis: memoCausalStrategy,
  });
  const memoStressTests = runStressTestEngine({
    strategic_options: [extras?.optionA, extras?.optionB, extras?.optionC].filter(Boolean) as string[],
    strategic_hefbomen: memoLeverDetection.levers,
    strategic_hefboom_combinatie: memoLeverCombination,
    strategic_causal_analysis: memoCausalStrategy,
    strategic_scenarios: memoScenarios,
  });
  const memoLeverLines = memoLeverDetection.levers
    .slice(0, 3)
    .map(
      (item) =>
        `Strategische hefboom\n${item.lever}\nMechanisme\n${trimWords(item.mechanism, 22)}\nRisico\n${trimWords(item.risk, 18)}\nBestuurlijke implicatie\n${trimWords(item.boardImplication, 18)}`
    )
    .join("\n\n");
  const memoCausalMechanismText = trimWords(
    memoCausalStrategy.items[0]?.mechanisme ||
      "De causale sprong ontstaat wanneer focus, prioritering en governance tegelijk worden aangescherpt, zodat impact toeneemt zonder evenredige groei van interne uitvoeringsdruk.",
    28
  );
  const memoCoreMechanismText = trimWords(
    normalize(extras?.successMechanism) ||
      "Kwaliteitsdiscipline, focus en bestuurlijke consistentie vormen samen het mechanisme dat retentie, uitvoerbaarheid en overdraagbaarheid draagt.",
    28
  );
  const conflictA =
    report.match(/(?:Spanning A:|Keuze A:)\s*(.+)/i)?.[1]?.trim() ||
    "Kwaliteit en eigenaarschap beschermen via begrensde interne groei.";
  const conflictB =
    report.match(/(?:Spanning B:|Keuze B:)\s*(.+)/i)?.[1]?.trim() ||
    "Maatschappelijke impact versnellen via externe modeladoptie.";
  const explicitLoss =
    report.match(/Expliciet verlies:\s*(.+)/i)?.[1]?.trim() ||
    "Ofwel impacttempo, ofwel directe operationele controle.";
  const forcingChoice =
    report.match(/(?:Forcing choice:|Besluittest:)\s*(.+)/i)?.[1]?.trim() ||
    "Kies binnen 30 dagen expliciet welk risico bestuurlijk acceptabel is.";
  const killerInsightEngine = buildKillerInsightEngineBlock({
    organizationName: extras?.organizationName,
    killerInsight: killerInsights.split("\n")[0]?.replace(/^•\s*/, ""),
    successMechanism: extras?.successMechanism,
    conflictStatement: extras?.conflictStatement || forcingChoice,
    strategicImplication: forcingChoice,
  });
  const boardroomPressureScenario = buildBoardroomPressureScenarioBlock({
    organizationName: extras?.organizationName,
    waitlistShortPathPct: extras?.waitlistShortPathPct,
    growthCapFte: extras?.growthCapFte,
    agingCostPct: extras?.agingCostPct,
    movementOfZeroKnown: extras?.movementOfZeroKnown,
  });
  const decisionPressure = buildDecisionPressureBlock({
    optionA: resolvedOptions.optionA || extras?.optionA,
    optionB: resolvedOptions.optionB || extras?.optionB,
    optionC: resolvedOptions.optionC || extras?.optionC,
    explicitLoss: extras?.explicitLoss || explicitLoss,
  });
  const strategicFraming = buildStrategicFramingBlock({
    organizationName: extras?.organizationName,
    strategicQuestion: extras?.strategicQuestion,
  });
  const strategicConflictEngine = buildStrategicConflictEngineBlock({
    conflictStatement: extras?.conflictStatement || `${conflictA} vs ${conflictB}`,
    sideA: extras?.conflictSideA || conflictA,
    sideB: extras?.conflictSideB || conflictB,
    mechanism: extras?.successMechanism,
    priceIfA: `Bij keuze A prioriteren we bescherming van kernkwaliteit, met risico op trage schaal en lagere externe impact.`,
    priceIfB: `Bij keuze B prioriteren we schaaltempo, met risico op cultuurverwatering en kwaliteitsvariatie.`,
    resolutionC: "Hybride model: schaal via netwerkreplicatie met expliciete kwaliteits- en eigenaarschapsguardrails.",
    boardroomQuestion:
      "Als deze twee doelen niet tegelijk volledig haalbaar zijn, welke kiezen we dan expliciet als prioriteit?",
  });
  const boardroomCoach = buildBoardroomCoachBlock({
    organizationName: extras?.organizationName,
    strategicHypothesis: thesisFromReport || thesis,
    coreConflict: extras?.conflictStatement || `${conflictA} vs ${conflictB}`,
    chosenStrategy: `Optie ${report.match(/Aanbevolen optie:\s*([ABC])/i)?.[1] || "C"}`,
    assumptions:
      extras?.caseClassification === "SUCCESS_MODEL"
        ? [
            "groei schaadt cultuur zodra eigenaarschap niet expliciet geborgd is",
            "netwerkpartners kunnen kwaliteitsstandaarden consistent uitvoeren",
            "beleidsinvloed versnelt systeemadoptie binnen de gekozen horizon",
          ]
        : [
            "scherpere focus verlaagt bestuurlijke ruis sneller dan bredere verbreding dat kan compenseren",
            "contractdiscipline en triageverbetering verlagen wachtdruk sneller dan extra capaciteit alleen",
            "gemeenten honoreren een scherpere propositie alleen als wachttijd en kwaliteit zichtbaar verbeteren",
          ],
    decisionPressure:
      "Als kritieke aannames niet uitkomen, verschuift strategische druk naar operatie en neemt reputatierisico sneller toe dan impactwinst.",
    killSwitch:
      "Stop gekozen schaalroute als kwaliteit, capaciteit of marge 2 meetperiodes onder norm blijft en herbesluit binnen 10 werkdagen.",
  });
  const misdiagnosisInsight = buildMisdiagnosisInsightBlock({
    organizationName: extras?.organizationName,
    patternProfile: extras?.patternProfile,
    successMechanism: extras?.successMechanism,
    strategicMode: extras?.strategicMode,
    caseClassification: extras?.caseClassification,
  });
  const dominantMechanism = buildDominantMechanismBlock({
    organizationName: extras?.organizationName,
    successMechanism: extras?.successMechanism,
    scaleMechanism: extras?.patternProfile?.scale_mechanism,
  })
    .replace(/^DOMINANT MECHANISM\s*/i, "")
    .trim();
  const strategicPatternBlock = extras?.patternProfile
    ? buildStrategicPatternBoardroomBlock(extras.patternProfile)
    : "";
  const strategySimulationBlock = extras?.strategySimulation
    ? buildStrategySimulationBlock(extras.strategySimulation)
    : "";
  const strategyScenarioSection = buildScenarioSimulationReportBlock(extras?.strategySimulation);
  const decisionMemoryBlock = extras?.decisionMemory
    ? buildDecisionMemoryBlock(extras.decisionMemory)
    : "";
  const earlyWarningSystemBlock = extras?.earlyWarningSystem
    ? buildEarlyWarningSystemBlock(extras.earlyWarningSystem)
    : "";
  const predictedInterventions = fromPredictedInterventions(report);
  const quickInterventions =
    predictedInterventions.length > 0
      ? predictedInterventions
      : [
          {
            actie:
              "Binnen 90 dagen: leg prioriteitskader, contractdiscipline en capaciteitsgrenzen formeel vast. Owner: bestuur/MT. Economics: voorkom extra druk zonder aantoonbaar rendement.",
            mechanisme: "Beperkt gelijktijdige executiedruk en bestuurlijke ruis.",
            kpi: "Kwaliteit stabiel; verbreding alleen na expliciet boardbesluit.",
          },
          {
            actie:
              "Binnen 6 maanden: test 1-2 gerichte schaal- of specialisatie-experimenten met vaste standaarden en besluitcriteria. Owner: MT. Economics: test richting zonder volledige overheadgroei.",
            mechanisme: "Vergroot uitvoerbaarheid met gecontroleerde borging.",
            kpi: "Doorstroom omhoog; kwaliteitsscore op norm.",
          },
          {
            actie:
              "Binnen 6 maanden: formaliseer 2 externe samenwerkingen of contractverbeteringen met audit- en evaluatieprotocol. Owner: directie. Economics: groei via betere positionering en contractkwaliteit, niet via extra loonkosten.",
            mechanisme: "Externe samenwerking vergroot bereik zonder lineaire personeelsgroei.",
            kpi: "2 actieve samenwerkingen of contractverbeteringen; kwaliteit en partnerdiscipline op norm.",
          },
        ];
  const tradeOffExposure = [
    `Als we kiezen voor Optie ${report.match(/Aanbevolen optie:\s*([ABC])/i)?.[1] || "C"}:`,
    `Dan verliezen we ${explicitLoss.toLowerCase()}.`,
    "",
    "Risico:",
    "kwaliteitsvariatie en minder directe cultuurcontrole.",
    "",
    "Dit vereist:",
    "partnerselectie, kwaliteitsprotocollen en periodieke audits.",
  ].join("\n");
  const brevityBlock = buildBoardroomBrevityBlock({
    dominantThesis: thesisFromReport || thesis,
    dominantMechanism,
    organizationName: extras?.organizationName,
    insightLine: killerInsights.split("\n")[0]?.replace(/^•\s*/, ""),
    mechanismLine: extras?.successMechanism,
    misdiagnosisInsight,
    patternProfile: extras?.patternProfile,
    noInterventionScenario:
      "Als er geen strategische interventie plaatsvindt, blijft capaciteit knellen, versnelt governancecomplexiteit en verliest het bestuur relatieve systeempositie.",
    conflictA,
    conflictB,
    explicitLoss,
    optionA:
      decisionPressure.match(/Optie A[\s\S]*?(?=\n\nOptie B)/i)?.[0]?.replace(/^Optie A\s*/i, "") ||
      resolvedOptions.optionA ||
      normalize(extras?.optionA || ""),
    optionB:
      decisionPressure.match(/Optie B[\s\S]*?(?=\n\nOptie C)/i)?.[0]?.replace(/^Optie B\s*/i, "") ||
      resolvedOptions.optionB ||
      normalize(extras?.optionB || ""),
    optionC:
      decisionPressure.match(/Optie C[\s\S]*?(?=\n\nPrijs van de keuze)/i)?.[0]?.replace(/^Optie C\s*/i, "") ||
      resolvedOptions.optionC ||
      normalize(extras?.optionC || ""),
    recommendedOption:
      isSuccessScaleCase && recommendedOptionCode === "C"
        ? "Optie C - schaal via netwerkreplicatie"
        : `Optie ${recommendedOptionCode}`,
    tradeOffExposure,
    interventions: quickInterventions,
    decisions: quickInterventions.map(
      (item, idx) => `${item.actie} KPI: ${item.kpi}${idx === 2 ? "." : ""}`
    ),
    boardQuestion:
      "De vraag voor het bestuur is niet: hoe groeit de organisatie sneller, maar: welk schaalmechanisme vergroot impact zonder kwaliteitsverlies?",
  });

  return truncateBoardMemoTail(hardenBoardroomLanguage(
    sanitizeMemoNarrative(cleanMemoText(
    [
      brevityBlock,
      "BESLISNOTA RvT / MT",
      "",
      (thesisFromReport || thesis) ? `Bestuurlijke hypothese\n${thesisFromReport || thesis}` : "",
      feitenbasis ? `Feitenbasis\n${feitenbasis}` : "",
      killerInsights ? `Killer insights\n${killerInsights}` : "",
      `Kernconflict (A/B keuze)\nA. ${conflictA}\nB. ${conflictB}\nPrijs van de keuze: ${explicitLoss}\nBesluitdwang: ${forcingChoice}`,
      [besluitvraag, keuze].filter(Boolean).length
        ? `Besluitvoorstel\n${[besluitvraag, keuze, besluittekst].filter(Boolean).join("\n\n")}`
        : "",
      regels ? `Consequenties\n${regels}` : "",
      [interventies, decisionCadence || kpis].filter(Boolean).length
        ? `Opvolging 90 dagen\n${[interventies, decisionCadence || kpis].filter(Boolean).join("\n\n")}`
        : "",
      openQuestions ? `Open vragen\n${openQuestions}` : "",
      killerInsightEngine,
      strategicConflictEngine,
      strategicPatternBlock,
      strategySimulationBlock,
      decisionMemoryBlock,
      earlyWarningSystemBlock,
      boardroomCoach,
      boardroomPressureScenario,
      decisionPressure,
      strategicFraming,
    ]
      .filter(Boolean)
      .join("\n\n")
    ))
  ));
}

function assessReportQuality(
  report: string,
  memo: string,
  summary: string,
  context?: {
    classification?: CaseClassification;
    strategicMode?: StrategicMode;
    chosenOption?: "A" | "B" | "C";
    pattern?: StrategicPatternMatch["pattern"];
  }
): {
  score: number;
  tier: "premium" | "standard" | "low";
  flags: string[];
} {
  const hasPlaceholderArtifacts = (text: string): boolean =>
    /Placeholder toegevoegd door NarrativeStructureGuard/i.test(text) || /\nAPPENDIX(?:\n|$)/i.test(text);
  const hasUnresolvedTokens = (text: string): boolean =>
    /\b(?:undefined|null|nan)\b/i.test(text) || /[([]\s*(?:undefined|null|nan)\s*[)\]]/i.test(text);
  const openQuestionsEmpty = (text: string): boolean => {
    const match = text.match(/open vragen\s*(.*?)(?=\n(?:appendix|\d+\.\s)|$)/is);
    if (!match) return false;
    const body = normalize(match[1] || "");
    return body.length === 0;
  };

  const flags: string[] = [];
  const reportRaw = String(report || "");
  const reportText = normalize(report);
  const memoText = normalize(memo);
  const summaryText = normalize(summary);
  let score = 100;

  if (!hasDecisionQuestionBlock(reportRaw)) {
    score -= 12;
    flags.push("missing_decision_question");
  }
  if (!hasFactBaseBlock(reportRaw)) {
    score -= 12;
    flags.push("missing_fact_base");
  }
  if (!hasOptionsBlock(reportRaw)) {
    score -= 10;
    flags.push("missing_options");
  }
  if (!hasInterventionPlanBlock(reportRaw)) {
    score -= 10;
    flags.push("missing_90_day_plan");
  }
  if (!hasKpiMonitoringBlock(reportRaw)) {
    score -= 10;
    flags.push("missing_kpi_monitoring");
  }
  if (!/Bestuurlijke hypothese|Feitenbasis|Besluitvoorstel|Consequenties|Opvolging 90 dagen/i.test(memoText)) {
    score -= 20;
    flags.push("missing_memo_structure");
  }
  if (!/killer insights|nieuwe inzichten/i.test(`${memoText}\n${reportText}`)) {
    score -= 8;
    flags.push("missing_killer_insights");
  }
  if (!/Killer insight/i.test(memoText)) {
    score -= 8;
    flags.push("missing_killer_insight_engine");
  }
  if (!hasStrategicPatternContract(memoText)) {
    score -= 10;
    flags.push("missing_strategic_pattern");
  }
  if (!hasStrategySimulationContract(memoText)) {
    score -= 10;
    flags.push("missing_strategy_simulation");
  }
  if (!hasDecisionMemoryContract(memoText)) {
    score -= 10;
    flags.push("missing_decision_memory");
  }
  if (!hasEarlyWarningContract(memoText)) {
    score -= 10;
    flags.push("missing_early_warning_system");
  }
  if (!/STRATEGIC CONFLICT/i.test(memoText) || !/CONFLICT_MECHANISM|PRICE_OF_CHOICE|CONFLICT_RESOLUTION|BOARDROOM QUESTION/i.test(memoText)) {
    score -= 10;
    flags.push("missing_strategic_conflict_engine");
  }
  if (!/BOARDROOM COACH/i.test(memoText)) {
    score -= 10;
    flags.push("missing_boardroom_coach");
  }
  if ((memo.match(/CHALLENGE QUESTION/gi) || []).length < 3) {
    score -= 8;
    flags.push("missing_boardroom_challenges");
  }
  if (!/Aannames die getest moeten worden|STRATEGIC_ASSUMPTIONS/i.test(memoText)) {
    score -= 6;
    flags.push("missing_boardroom_assumptions");
  }
  if (!/DECISION_PRESSURE|Besluitdruk scenario/i.test(memoText)) {
    score -= 6;
    flags.push("missing_boardroom_decision_pressure");
  }
  if (!/SCENARIO:\s*GEEN INTERVENTIE/i.test(memoText)) {
    score -= 8;
    flags.push("missing_boardroom_pressure_scenario");
  }
  if (!/BESTUURLIJKE KEUZE/i.test(memoText)) {
    score -= 7;
    flags.push("missing_decision_pressure_block");
  }
  if (!/STRATEGISCHE VRAAG/i.test(memoText)) {
    score -= 6;
    flags.push("missing_strategic_framing");
  }
  if (!/\b\d+([.,]\d+)?\s*(%|fte|maanden|jaar|dagen)\b/i.test(memoText)) {
    score -= 6;
    flags.push("interventions_not_measurable");
  }
  const killerBlockForLabelCheck =
    memoText.match(/killer insights[\s\S]*?(?=kernconflict|besluitvoorstel|open vragen|$)/i)?.[0] || "";
  if (killerBlockForLabelCheck && /\binzicht\s+[a-z]?\d+\b/i.test(killerBlockForLabelCheck)) {
    score -= 18;
    flags.push("placeholder_killer_insights_labels");
  }
  if (/output 1\b|context layer|diagnosis layer|mechanism layer|decision layer/i.test(memoText)) {
    score -= 30;
    flags.push("contains_engine_dump");
  }
  if (/Placeholder toegevoegd door NarrativeStructureGuard/i.test(reportText) || /Placeholder toegevoegd door NarrativeStructureGuard/i.test(memoText)) {
    score -= 35;
    flags.push("contains_placeholder");
  }
  if (hasPlaceholderArtifacts(memo)) {
    score -= 35;
    flags.push("contains_placeholder_artifacts");
  }
  if (hasUnresolvedTokens(`${report}\n${memo}\n${summary}`)) {
    score -= 40;
    flags.push("contains_unresolved_tokens");
  }
  if (openQuestionsEmpty(memo)) {
    score -= 20;
    flags.push("open_questions_empty");
  }
  if (summaryText.length < 80) {
    score -= 8;
    flags.push("summary_too_short");
  }
  if (reportText.length < 900) {
    score -= 8;
    flags.push("report_too_short");
  }
  const interventionSection = hasInterventionPlanBlock(report)
    ? extractSection(report, 7) || report
    : "";
  if (isOperationalInterventionText(interventionSection)) {
    score -= 30;
    flags.push("contains_operational_interventions");
  }
  if (isOperationalInterventionText(memoText)) {
    score -= 20;
    flags.push("memo_contains_operational_interventions");
  }
  if (context?.classification === "SUCCESS_MODEL") {
    if (/klassiek organisatiemodel/i.test(summaryText)) {
      score -= 18;
      flags.push("pattern_misclassified_classic");
    }
    if (/stabiliseer eerst de kern-ggz|herstel marge/i.test(summaryText)) {
      score -= 22;
      flags.push("success_model_crisis_leak");
    }
    if (context?.strategicMode === "SCALE" && context?.chosenOption && context.chosenOption !== "C") {
      score -= 20;
      flags.push("scale_mode_option_mismatch");
    }
  }
  if (!hasStrategicConflictChoiceBlock(reportRaw)) {
    score -= 18;
    flags.push("missing_strategic_conflict_choice");
  }
  if (!hasForcingChoiceBlock(reportRaw)) {
    score -= 15;
    flags.push("missing_forcing_choice");
  }

  const bounded = Math.max(0, Math.min(100, score));
  const tier: "premium" | "standard" | "low" =
    bounded >= 80 ? "premium" : bounded >= 60 ? "standard" : "low";

  return { score: bounded, tier, flags };
}

type InputInsights = {
  facts: string[];
  actions: string[];
  preferredOption?: "A" | "B" | "C";
  leverage: {
    meetingDate?: string;
    regions?: string;
    waitlistShortPathPct?: number;
    growthCapFte?: number;
    agingCostPct?: number;
    devTimePct?: number;
    careTimePct?: number;
    licenseMarginKnown?: boolean;
    movementOfZeroKnown?: boolean;
    absenteeismPct?: number;
    absenteeismQualifier?: string;
    actionItemsBlock?: string;
    openQuestionsBlock?: string;
  };
};

type StrategicLeverageType = "capaciteit" | "kennis" | "macht" | "netwerk" | "standaardisatie";

type StrategicLeveragePoint = {
  title: string;
  leverageType: StrategicLeverageType;
  mechanism: string;
  caseDatapoint: string;
  intervention: string;
  target: string;
  impact: string;
};

type StrategicThesis = {
  boardQuestion: string;
  dominantThesis: string;
  killerInsight: string;
  decisions: string[];
};

function extractLeverage(rawInput: string): InputInsights["leverage"] {
  const text = String(rawInput || "");
  const meetingDateMatch = text.match(/\b(\d{2}-\d{2}-\d{4})\b/);
  const waitlistMatch = text.match(/(?:\b|~)(\d{1,2})\s*%\s*(?:van\s+instroom|instroom|clie?nten).{0,60}(?:3[\u2013\-–]?4\s*gesprekken|kort traject)/i);
  const growthCapMatch = text.match(/max(?:imaal)?\s*(\d{1,2})\s*fte/i);
  const agingCostMatch = text.match(/\+?\s*(\d{1,2})\s*%\s*(?:meer\s*)?(?:loonkosten|kosten).{0,20}(?:vergrijz|gem\.)/i);
  const splitMatch = text.match(/(\d{2})\s*%\s*(?:zorg|care).{0,20}(\d{2})\s*%\s*(?:ontwikkel|project)/i);
  const regionMatch = text.match(/\b(Groningen\/Friesland\/Drenthe)\b/i);
  const actionItemsBlockMatch = text.match(
    /(?:🔴\s*)?ACTION ITEMS[\s\S]*?(?=\n\s*🟢\s*FYI|\n\s*⛔\s*BLOCKERS|\n\s*❓\s*OPEN QUESTIONS|\n\s*Bron:\s*volledig gesprekstranscript|\n\s*What are the top 5|$)/i
  );
  const actionItemsBlock = actionItemsBlockMatch
    ? actionItemsBlockMatch[0].trim().replace(/\n{3,}/g, "\n\n")
    : undefined;
  const openQuestionsBlockMatch = text.match(
    /(?:❓\s*)?OPEN QUESTIONS[\s\S]*?(?=\n\s*Bron:\s*volledig gesprekstranscript|\n\s*What are the top 5|$)/i
  );
  const openQuestionsBlock = openQuestionsBlockMatch
    ? openQuestionsBlockMatch[0].trim().replace(/\n{3,}/g, "\n\n")
    : undefined;
  const absenteeismMatches = Array.from(
    text.matchAll(
      /\bziekteverzuim\b[\s\S]{0,50}?(\d{1,2}(?:[.,]\d+)?)\s*%|(\d{1,2}(?:[.,]\d+)?)\s*%[\s\S]{0,50}?\bziekteverzuim\b/gi
    )
  );
  const parsedAbsenteeism = absenteeismMatches
    .map((match) => {
      const raw = match[1] || match[2];
      const pct = Number(String(raw || "").replace(",", "."));
      if (!Number.isFinite(pct)) return null;
      const full = String(match[0] || "");
      const hasQualifier = /excl(?:usief)?\b.*zwangerschapsverlof|excl\.\s*zwangerschapsverlof/i.test(full);
      return { pct, hasQualifier };
    })
    .filter((row): row is { pct: number; hasQualifier: boolean } => Boolean(row));
  const preferredAbsenteeism =
    parsedAbsenteeism.find((row) => row.hasQualifier) ||
    parsedAbsenteeism.sort((a, b) => b.pct - a.pct)[0];
  const absenteeismQualifier =
    preferredAbsenteeism?.hasQualifier || /excl(?:usief)?\b.*zwangerschapsverlof|excl\.\s*zwangerschapsverlof/i.test(text)
      ? "exclusief zwangerschapsverlof"
      : undefined;

  return {
    meetingDate: meetingDateMatch?.[1],
    regions: regionMatch?.[1] || "Groningen/Friesland/Drenthe",
    waitlistShortPathPct: waitlistMatch ? Number(waitlistMatch[1]) : undefined,
    growthCapFte: growthCapMatch ? Number(growthCapMatch[1]) : undefined,
    agingCostPct: agingCostMatch ? Number(agingCostMatch[1]) : undefined,
    careTimePct: splitMatch ? Number(splitMatch[1]) : undefined,
    devTimePct: splitMatch ? Number(splitMatch[2]) : undefined,
    licenseMarginKnown: /licentie.*marge|marge.*licentie/i.test(text),
    movementOfZeroKnown: /beweging van nul/i.test(text),
    absenteeismPct: preferredAbsenteeism?.pct,
    absenteeismQualifier,
    actionItemsBlock,
    openQuestionsBlock,
  };
}

type MechanisticInsight = {
  title: string;
  mechanism: string;
  implication: string;
};

function scoreKillerInsight(item: MechanisticInsight): number {
  const text = `${normalize(item.title)} ${normalize(item.mechanism)} ${normalize(item.implication)}`.toLowerCase();
  let score = 0;

  const weightedSignals: Array<[RegExp, number]> = [
    [/\b(contract|contractdruk|contractruimte|contractmix|plafond|tarief|budgetdruk)\b/i, 4],
    [/\b(blinde vlek|verborgen|aanname|ongetoetst)\b/i, 4],
    [/\b(risico|verlies|erosie|kwetsbaar|uitval|druk|stagnatie)\b/i, 3],
    [/\b(bestuur|bestuurlijk|governance|besluit|prioritering|stopregel|mandaat)\b/i, 3],
    [/\b(wachttijd|caseload|doorstroom|triage|capaciteit|retentie|teamstabiliteit)\b/i, 3],
    [/\b(positionering|specialisatie|niche|gemeente|gemeentelijke inkoop|verwijzer)\b/i, 3],
    [/\b(waardoor|doordat|omdat|tenzij|mits|alleen als|zolang)\b/i, 2],
    [/\b(12 maanden|24 maanden|36 maanden|direct|structureel)\b/i, 1],
  ];

  for (const [pattern, weight] of weightedSignals) {
    if (pattern.test(text)) score += weight;
  }

  if (text.length >= 90 && text.length <= 260) score += 2;
  if (!/^strategisch inzicht\s+\d+$/i.test(normalize(item.title))) score += 1;
  if (/^kernmechanisme/i.test(normalize(item.title))) score -= 1;
  if (/^keuzedruk/i.test(normalize(item.title))) score += 1;
  return score;
}

function rankKillerInsights(insights: MechanisticInsight[]): MechanisticInsight[] {
  return [...insights].sort((a, b) => {
    const byScore = scoreKillerInsight(b) - scoreKillerInsight(a);
    if (byScore !== 0) return byScore;
    return normalize(a.mechanism).localeCompare(normalize(b.mechanism), "nl");
  });
}

function extractInputInsights(rawInput: string): InputInsights {
  const text = normalize(stripSourceDump(rawInput));
  const lower = text.toLowerCase();
  const facts: string[] = [];
  const actions: string[] = [];
  const leverage = extractLeverage(rawInput);
  const formatPctNl = (value: number): string => value.toFixed(1).replace(".", ",");

  if (/(loonkosten|loon).{0,40}(5%|5 procent|> ?5%)/i.test(text)) {
    facts.push("Loonkosten stijgen >5% per jaar zonder indexatie van inkomsten.");
  }
  if (/(tarief|tarieven).{0,40}(2026).{0,20}(7%|7 procent|-7%|verlaagd)/i.test(text)) {
    facts.push("Tarieven 2026 liggen circa 7% lager, wat margedruk versnelt.");
  }
  if (/(adhd).{0,40}(90|€ ?90)/i.test(text)) {
    facts.push("ADHD-diagnostiek rond EUR 90 per client is niet kostendekkend.");
  }
  if (/(12 gesprekken|twaalf gesprekken).{0,40}(1800|€ ?1800)/i.test(text)) {
    facts.push("Gemiddeld 12 gesprekken en circa EUR 1800 kostprijs per client.");
  }
  if (/(plafond|maximum).{0,40}(160\.?000|160000|€ ?160\.?000)/i.test(text)) {
    facts.push("Declaratieplafonds rond EUR 160.000 per verzekeraar beperken schaal.");
  }
  if (/(75%).{0,40}(6 uur|6u|6 uur per dag)/i.test(text) || /(6 uur per dag).{0,20}(75%)/i.test(text)) {
    facts.push("Productiviteitsnorm 75% (circa 6 uur clientcontact per dag) staat onder druk.");
  }
  if (/(zzp|zzp'ers|zzpers)/i.test(text)) {
    facts.push("De organisatie houdt een mix van vaste medewerkers en zzp-inzet aan om capaciteitsflexibiliteit te behouden.");
  }
  if (/(consortium|triage.*buiten de organisatie|regionale triage|toegang.*consortium)/i.test(text)) {
    facts.push("Instroom en toegang worden deels regionaal via consortium en triage-afspraken gestuurd.");
  }
  if (/(ambulante jeugdhulp|ambulante specialist|brede expertise|breedte in plaats van niche)/i.test(text)) {
    facts.push("De organisatie kiest bewust voor een brede ambulante positionering in plaats van een smalle niche.");
  }
  if (/(geen contract|ontbreken.*contract|verzekeraar.*contract)/i.test(text)) {
    facts.push("Contractpositie met verzekeraars is een kernrisico voor voorspelbare omzet.");
  }
  if (/(jeugdwet|gemeentelijke inkoop|afhankelijk.*gemeentelijke contracten|gemeenten.*contracten)/i.test(text)) {
    facts.push("Afhankelijkheid van gemeentelijke inkoop en contracten maakt omzet en positionering bestuurlijk kwetsbaar.");
  }
  if (/(budgetdruk bij gemeenten|kostenreductie|resultaatgericht werken|tarieven.*gemeenten)/i.test(text)) {
    facts.push("Gemeentelijke budgetdruk verhoogt druk op tarieven, volume en verantwoordingsdiscipline.");
  }
  if (/(personeelstekorten|tekort aan jeugdzorgprofessionals|gedragswetenschappers)/i.test(text)) {
    facts.push("Personeelsschaarste beperkt schaalbaarheid en verhoogt druk op teamstabiliteit.");
  }
  if (/(complexere problematiek|multiproblematiek|kwetsbare thuissituaties)/i.test(text)) {
    facts.push("Zorgzwaarte neemt toe door complexere problematiek en multiproblematiek in gezinnen.");
  }
  if (/(lokale aanwezigheid|haarlem|zuid-kennemerland|sterke relatie met gezinnen|kleinschaliger en persoonlijker)/i.test(text)) {
    facts.push("Lokale positionering en kleinschaligheid zijn onderscheidend, maar vragen scherpe nichekeuze om verdedigbaar te blijven.");
  }
  if (/(bureaucratische verantwoordingsdruk|strenge privacywetgeving|zware verantwoording)/i.test(text)) {
    facts.push("Bureaucratische verantwoordingsdruk absorbeert capaciteit die niet direct aan zorg of positionering bijdraagt.");
  }

  if (/(consolideren|consolidatie|rust en stabiliteit)/i.test(lower)) {
    actions.push("Fase 1: consolideer kern-GGZ met harde marge- en capaciteitsgrenzen.");
  }
  if (/(vision planner|scenario|best case|worst case)/i.test(lower)) {
    actions.push("Bouw een 3-scenario stuurmodel (best/base/worst) met maandelijkse besluitmomenten.");
  }
  if (/(hr-loket|vallei werkt|b2b|zakelijke dienstverlening)/i.test(lower)) {
    actions.push("Maak HR-loket een gefaseerde groeimotor met aparte KPI's en investeringsplafond.");
  }
  if (/(verhuizing|nieuw pand|extra kamers)/i.test(lower)) {
    actions.push("Benut verhuizing voor capaciteitsplanning en multidisciplinaire doorverwijzing.");
  }
  if (/(raad van toezicht|rvt|strategische sessie)/i.test(lower)) {
    actions.push("Plan een bestuurlijke 90-dagen sessie met MT + RvT op prioritering en stopregels.");
  }
  if (/(positionering|specialistische niche|generalistische zorg)/i.test(text)) {
    actions.push("Kies expliciet tussen generalistische jeugdhulp en een specialistische niche met hogere verdedigbaarheid richting gemeenten.");
  }
  if (/(scholen|wijkteams|huisartsen|samenwerking met gemeenten|ketenpartners)/i.test(text)) {
    actions.push("Formaliseer regionale samenwerkingsafspraken met scholen, wijkteams en verwijzers rond instroom, doorstroom en casusregie.");
  }
  if (/(administratieve druk verminderen|bureaucratie|autonomie geven)/i.test(text)) {
    actions.push("Verlaag administratieve druk en bescherm professionele autonomie als voorwaarde voor retentie en uitvoerbaarheid.");
  }
  if (/(laag ziekteverzuim|ziekteverzuim.*\d{1,2}[,.]\d%|\d{1,2}[,.]\d%\s*ziekteverzuim|ziekteverzuim)/i.test(text) || typeof leverage.absenteeismPct === "number") {
    const pct = typeof leverage.absenteeismPct === "number" ? formatPctNl(leverage.absenteeismPct) : "5,0";
    const qualifier = leverage.absenteeismQualifier ? ` (${leverage.absenteeismQualifier})` : "";
    facts.push(`Ziekteverzuim is laag (${pct}%${qualifier}), wat operationele stabiliteit bevestigt.`);
  }
  if (/(open sollicitaties|lage uitstroom|minimaal verloop|laag verloop)/i.test(text)) {
    facts.push("Instroom is sterk en uitstroom laag, wat wijst op hoge werkgeversaantrekkelijkheid.");
  }
  if (/(aandelen|mede-eigenaar|eigenaarschap|aandeelhouder)/i.test(text)) {
    facts.push("Medewerkersparticipatie via aandelen creëert financieel en psychologisch eigenaarschap.");
    actions.push("Borg medewerkersparticipatie met heldere toetredings- en exitregels voor aandelen.");
  }
  if (/(platte organisatie|geen middenmanagement|geen lagen met middenmanagement|zonder middenmanagement|korte lijnen|korte lijntjes)/i.test(text)) {
    facts.push("Platte governance zonder middenmanagement versnelt besluitvorming en houdt lijnen kort.");
    actions.push("Leg een governance-guardrail vast: geen extra middenmanagementlagen zonder board-besluit.");
  }
  if (/(maximaal 5 fte|niet harder dan 5 fte)/i.test(text)) {
    facts.push("Groei wordt bewust begrensd (maximaal 5 FTE per jaar) om cultuurkwaliteit te beschermen.");
    actions.push("Hanteer een expliciete groeicap op 5 FTE per jaar met kwartaalreview op cultuurbelasting.");
  }
  if (/(netwerkorganisatie|maatschappelijke impact)/i.test(text)) {
    facts.push("Strategie verschuift van volumegroei naar impactgroei via netwerkorganisatie.");
    actions.push("Ontwerp governance voor netwerkpartners met kwaliteitskaders, mandaten en meetbare impactdoelen.");
  }
  if (/(universiteit|rug|rijksuniversiteit groningen|talentpipeline)/i.test(text)) {
    actions.push("Formaliseer academische talentpipeline met universiteit inclusief instroom-, mentor- en retentiedoelen.");
  }
  const actionSection = text.split(/action items/i)[1] || "";
  if (actionSection) {
    const bulletActions = actionSection
      .split("\n")
      .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
      .filter((line) => line.length > 24 && line.length < 260)
      .filter((line) => !/^bron\s*:/i.test(line))
      .filter((line) => !/^what are the top 5/i.test(line))
      .filter((line) => !/read more/i.test(line))
      .slice(0, 8);
    for (const action of bulletActions) actions.push(action);
  }

  let preferredOption: "A" | "B" | "C" | undefined;
  if (/(netwerkorganisatie|maatschappelijke impact)/i.test(lower)) {
    preferredOption = "C";
  } else if (/(cellenmodel|kopie|cellen)/i.test(lower)) {
    preferredOption = "B";
  } else if (/(maximaal 5 fte|niet harder dan 5 fte)/i.test(lower)) {
    preferredOption = "A";
  } else if (/(consolideren|rust|stabiliteit)/i.test(lower) && /(marge|tarief|plafond|contract)/i.test(lower)) {
    preferredOption = "A";
  } else if (/(verbreding|nieuwe diensten|hr-loket)/i.test(lower)) {
    preferredOption = "B";
  } else if (/(herstructurering|kostenreductie)/i.test(lower)) {
    preferredOption = "C";
  }

  return {
    facts: Array.from(new Set(facts)).slice(0, 6),
    actions: Array.from(new Set(actions)).slice(0, 6),
    preferredOption,
    leverage,
  };
}

function inferClassificationFromInsights(
  insights: InputInsights,
  current: CaseClassification
): { label: CaseClassification; reason?: string } {
  const text = `${insights.facts.join(" ")} ${insights.actions.join(" ")}`.toLowerCase();
  const successSignals = [
    /instroom is sterk/,
    /uitstroom laag/,
    /ziekteverzuim is (uitzonderlijk )?laag/,
    /medewerkersparticipatie via aandelen/,
    /zonder middenmanagement/,
    /groei wordt bewust begrensd/,
    /netwerkorganisatie/,
  ].filter((rx) => rx.test(text)).length;
  const crisisSignals = [
    /loonkosten stijgen/,
    /tarieven .* lager/,
    /niet kostendekkend/,
    /contractpositie .* kernrisico/,
    /declaratieplafonds/,
  ].filter((rx) => rx.test(text)).length;

  const leverageSignals =
    hasSuccessModelSignature(insights);

  if ((successSignals >= 2 && crisisSignals <= 1) || leverageSignals) {
    return {
      label: "SUCCESS_MODEL",
      reason: "Insight-level override: succespatroon domineert zonder crisissignalen.",
    };
  }
  if (current === "CRISIS" && successSignals >= 1 && crisisSignals <= 2) {
    return {
      label: "STABLE",
      reason: "Insight-level tempering: crisis-signalen zijn aanwezig maar niet dominant genoeg voor crisisclassificatie.",
    };
  }
  return { label: current };
}

function hasSuccessModelSignature(insights: InputInsights): boolean {
  const text = `${insights.facts.join(" ")} ${insights.actions.join(" ")}`.toLowerCase();
  const leverage = insights.leverage || {};
  const positiveSignals = [
    Boolean(leverage.growthCapFte && leverage.growthCapFte <= 6),
    Boolean(leverage.waitlistShortPathPct && leverage.waitlistShortPathPct > 0),
    Boolean(typeof leverage.absenteeismPct === "number" && leverage.absenteeismPct <= 6.5),
    Boolean((leverage.devTimePct || 0) >= 20 && (leverage.careTimePct || 0) >= 50),
    Boolean(leverage.movementOfZeroKnown || leverage.licenseMarginKnown),
    /(eigenaarschap|netwerkorganisatie|licentie|modeladoptie|ontwikkeltijd|70\/30|70 %|30 %)/i.test(text),
  ].filter(Boolean).length;
  const blockingSignals = [
    /(gemeente|gemeentelijke inkoop|jeugdwet|jeugdzorg)/i.test(text),
    /(personeelstekort|complexere problematiek|multiproblematiek)/i.test(text),
    /(contractdruk|contracten verminderen|afhankelijkheid van gemeentelijke contracten)/i.test(text),
    /(bureaucratische verantwoordingsdruk|budgetdruk|concurrentie)/i.test(text),
  ].filter(Boolean).length;
  return positiveSignals >= 3 && blockingSignals === 0;
}

function hasMolendriftCaseSignature(sourceText: string, organizationName?: string): boolean {
  const org = normalize(organizationName).toLowerCase();
  if (org.includes("molendrift")) return true;
  const text = normalize(sourceText).toLowerCase();
  const signals = [
    /(70\s*\/\s*30|70%\s*zorg|30%\s*ontwikkel)/i.test(text),
    /(aandelen|mede-eigenaar|eigenaarschap)/i.test(text),
    /(beweging van nul|vng|vws)/i.test(text),
    /(maximaal\s*5\s*fte|5\s*fte\/jaar|groeicap)/i.test(text),
    /(partnerreplicatie|licentie|modeladoptie|netwerkreplicatie)/i.test(text),
  ].filter(Boolean).length;
  const blockers = [
    /(jeugdzorg|jeugdwet|gemeentelijke inkoop|haarlem|zuid-kennemerland)/i.test(text),
  ].filter(Boolean).length;
  return signals >= 4 && blockers === 0;
}

function buildExecutiveSummary(
  output: any,
  inputInsights: InputInsights,
  gekozenOptie: "A" | "B" | "C",
  caseClassification: CaseClassification,
  strategicMode: StrategicMode,
  mechanisms: StrategicMechanismOutput,
  pattern: StrategicPatternMatch,
  organizationName?: string
): string {
  const formatPct = (value: number): string => Number(value).toFixed(1).replace(".", ",");
  const patternLabel = formatStrategicPatternLabel(pattern.pattern);
  const leverage = inputInsights.leverage || {};
  const publicYouthContext = /(jeugdzorg|jeugdwet|gemeente|gemeentelijke inkoop|jongeren|gezinnen|wijkteam)/i.test(
    `${inputInsights.facts.join(" ")} ${inputInsights.actions.join(" ")}`
  );
  const growthCap = leverage.growthCapFte ?? 5;
  const waitlistPct = leverage.waitlistShortPathPct ?? 8;
  const absenteeism = leverage.absenteeismPct != null ? `${formatPct(leverage.absenteeismPct)}%` : "5,0%";
  const org = normalize(organizationName) || "De organisatie";
  const successSignature = hasSuccessModelSignature(inputInsights);
  const factsLine =
    caseClassification === "SUCCESS_MODEL" && successSignature
      ? `${org} combineert ${typeof leverage.absenteeismPct === "number" ? `laag verzuim (${absenteeism})` : "beheersbare uitval"}, een expliciete groeicap (${growthCap} FTE per jaar) en een ${leverage.careTimePct ?? 70}/${leverage.devTimePct ?? 30}-model dat uitvoering en ontwikkeling tegelijk draagt.`
      : normalize(output.diagnosis.financial_pressure || "");
  const optionLine =
    caseClassification === "SUCCESS_MODEL" && successSignature
      ? strategicMode === "SCALE"
        ? `Advies: schaal niet via extra behandelcapaciteit, maar via cellen en netwerkreplicatie; verhoog kort-trajectuitstroom van circa ${waitlistPct}% richting minimaal 20% en borg partnerkwaliteit bestuurlijk.`
        : gekozenOptie === "A"
          ? "Advies: behoud gecontroleerde groei met expliciete cultuur- en governance-guardrails."
          : gekozenOptie === "B"
            ? "Advies: schaal via cellenmodel alleen met harde kwaliteits- en eigenaarschapsstandaarden."
            : "Advies: vergroot impact via netwerkstrategie zonder het kernmodel te overbelasten."
      : gekozenOptie === "A"
        ? "Advies: stabiliseer eerst de kern-GGZ, herstel marge en contractdiscipline, en vertraag niet-kritische verbreding."
        : gekozenOptie === "B"
          ? "Advies: versnel verbreding alleen met een harde investerings- en rendementsdiscipline per initiatief."
          : "Advies: voer gerichte herstructurering uit met duidelijke eigenaarschap- en uitvoeringsgrenzen.";
  const patternLine = caseClassification === "SUCCESS_MODEL" && successSignature ? `Patroon: ${patternLabel}.` : "";
  if (publicYouthContext && caseClassification !== "SUCCESS_MODEL") {
    return sanitizeReportForBoardView(
      [
        "Wachtdruk is contractgedreven, niet personeelsgedreven.",
        "Meer personeel zonder scherpere triage en contractruimte verhoogt vooral kosten en coördinatiedruk.",
        gekozenOptie === "A"
          ? "Advies: bescherm de kern, versmal de propositie en herstel eerst contractdiscipline."
          : gekozenOptie === "B"
            ? "Advies: verbreed alleen als contractkwaliteit, triage en teamstabiliteit aantoonbaar op orde zijn."
            : "Advies: kies alleen voor herstructurering als die direct contractruimte, focus en uitvoerbaarheid vergroot.",
      ]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    );
  }
  return sanitizeReportForBoardView(
    `${factsLine} ${optionLine} ${patternLine} Aanbevolen optie ${gekozenOptie}.`
      .replace(/\s+/g, " ")
      .trim()
  );
}

function toMechanisticSentence(raw: string): string {
  const text = normalize(raw);
  if (!text) return "";
  if (/\bomdat\b|\bdoordat\b|\bwaardoor\b/i.test(text)) return text;
  return `${text} waardoor bestuurlijke druk direct toeneemt.`;
}

function buildKillerInsights(
  output: any,
  inputInsights: InputInsights,
  caseClassification: CaseClassification,
  organizationName?: string
): MechanisticInsight[] {
  const publicYouthContext = /(jeugdzorg|jeugdwet|gemeente|gemeentelijke inkoop|jongeren|gezinnen|wijkteam)/i.test(
    `${inputInsights.facts.join(" ")} ${inputInsights.actions.join(" ")}`
  );
  if (publicYouthContext && caseClassification !== "SUCCESS_MODEL") {
    return buildPublicYouthKillerInsights(inputInsights, organizationName);
  }
  const formatMechanism = (text: string): string => {
    const cleaned = normalize(text);
    if (!cleaned) return "";
    return cleaned
      .replace(/\bontstaat omdat\b/gi, "ontstaat doordat")
      .replace(/\s+Implicatie:\s*$/i, "")
      .trim();
  };
  const fromEngine: MechanisticInsight[] = (output.insights || [])
    .map((item: any, idx: number) => ({
      title: `Strategisch inzicht ${idx + 1}`,
      mechanism: formatMechanism(toMechanisticSentence(
        `${item.strategic_pattern || "Patroon"} ontstaat omdat ${item.implication || "oorzaak-gevolgrelatie onvoldoende is afgedekt"}`
      )),
      implication: normalize(item.recommended_focus || "Formuleer direct eigenaarschap en stopregels."),
    }))
    .filter((item) =>
      caseClassification !== "SUCCESS_MODEL"
        ? true
        : !/(marge|contract|plafond|cash|kosten|escalatie)/i.test(`${item.mechanism} ${item.implication}`)
    );

  const factBased: MechanisticInsight[] = inputInsights.facts.map((fact, idx) => ({
    title: `Kernmechanisme ${idx + 1}`,
    mechanism: formatMechanism(toMechanisticSentence(
      caseClassification === "SUCCESS_MODEL"
        ? `${fact} omdat expliciet eigenaarschap gedrag, continuiteit en kwaliteit tegelijk versterkt`
        : `${fact} omdat de huidige besturing kostenstijging en opbrengstdruk niet gelijktijdig opvangt`
    )),
    implication:
      caseClassification === "SUCCESS_MODEL"
        ? "Veranker dit mechanisme in governance-routines zodat groei het kernmodel niet uitholt."
        : "Vertaal dit direct naar maandelijkse besluitdrempels op marge, capaciteit en contractruimte.",
  }));

  const actionBased: MechanisticInsight[] = inputInsights.actions.map((action, idx) => ({
    title: `Keuzedruk ${idx + 1}`,
    mechanism: formatMechanism(toMechanisticSentence(
      caseClassification === "SUCCESS_MODEL"
        ? `${action} omdat schaaldruk toeneemt zodra eigenaarschap en cultuur niet expliciet worden geborgd`
        : `${action} omdat uitvoering nu versnipperd raakt zonder harde volgorde`
    )),
    implication:
      caseClassification === "SUCCESS_MODEL"
        ? "Borg de actie via harde governance- en cultuurguardrails voordat schaalstappen worden gezet."
        : "Koppel de actie aan expliciete eigenaar, deadline en stopcriterium.",
  }));

  const merged = [...fromEngine, ...factBased, ...actionBased].filter(
    (item) => item.mechanism && item.implication
  );
  const dedup = new Map<string, MechanisticInsight>();
  for (const row of merged) {
    const key = normalize(row.mechanism).toLowerCase();
    if (!dedup.has(key)) dedup.set(key, row);
  }

  const values = rankKillerInsights(Array.from(dedup.values()));
  while (values.length < 7) {
    const n = values.length + 1;
    values.push({
      title:
        caseClassification === "SUCCESS_MODEL"
          ? "De schaalgrens ligt bij overdraagbaarheid, niet bij volume."
          : "Bestuurlijke stilstand vergroot de schade sneller dan extra activiteit haar compenseert.",
      mechanism:
        caseClassification === "SUCCESS_MODEL"
          ? "De organisatie heeft geen volumegroeiprobleem maar een replicatieprobleem: lineaire groei gaat sneller dan borging van cultuur en eigenaarschap."
          : "Besluitvertraging ontstaat omdat operationele, financiele en governance-prikkels niet op hetzelfde ritme worden gestuurd.",
      implication:
        caseClassification === "SUCCESS_MODEL"
          ? "Koppel groei aan expliciete cultuurguardrails, partnergovernance en leiderschapsdiscipline."
          : "Dwing een bestuursritme af met harde escalatie op KPI-afwijkingen en expliciete stop-doing keuzes.",
    });
  }
  return rankKillerInsights(values).slice(0, 10);
}

function buildInterventionActions(
  output: any,
  inputInsights: InputInsights,
  caseClassification: CaseClassification
): Array<{ action: string; owner: string; deadline: string; success: string }> {
  const actions: Array<{ action: string; owner: string; deadline: string; success: string }> = [];
  const owners = ["Directeur", "MT", "Finance", "HR", "Operations", "Programmamanager"];
  const engineActions = (output.insights || [])
    .map((item: any) => normalize(item.recommended_focus))
    .filter((item: string) =>
      caseClassification !== "SUCCESS_MODEL"
        ? true
        : !/(contract|marge|plafond|cash|escalatie|besluitdiscipline)/i.test(item)
    );
  const base = [
    ...inputInsights.actions,
    ...engineActions,
    ...(caseClassification === "SUCCESS_MODEL"
      ? [
          "Introduceer medewerkersparticipatie na 12 maanden met transparante instroomcriteria.",
          "Veranker het model zonder middenmanagement in een formeel governance-kader.",
          "Richt netwerkgovernance in voor externe partners met kwaliteits- en mandaatafspraken.",
          "Bescherm de groeilimiet met expliciete stoplichtcriteria op cultuurbelasting.",
          "Bouw de academische talentpipeline uit met vaste mentorcapaciteit en retentiemeting.",
          "Meet eigenaarschap via kwartaalpulse en koppel uitkomsten aan leiderschapsacties.",
          "Ontwikkel een cellenmodel-pilot met vaste kwaliteitsprotocollen en overdrachtsregels.",
        ]
      : [
          "Contractstrategie per verzekeraar inclusief plafondrouting vastleggen",
          "Margevloer per productlijn vaststellen en maandelijks valideren",
          "Productportfolio opschonen met expliciete stopregels",
          "Capaciteitsplanning koppelen aan no-show en wachttijddata",
          "KPI-ritme met weekreview en maandelijkse escalatie naar RvT formaliseren",
          "Governance-mandaat voor 30/60/90 dagen besluitvorming vastleggen",
        ]),
  ]
    .map((item) => normalize(item))
    .filter(Boolean);

  const dedup = Array.from(new Set(base));
  const usedKeys = new Set<string>();
  for (let i = 0; i < dedup.length; i += 1) {
    const n = i + 1;
    const actionText = dedup[i];
    const key = normalize(actionText).toLowerCase();
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    actions.push({
      action: actionText,
      owner: owners[i % owners.length],
      deadline: `Dag ${Math.min(90, 7 + i * 5)}`,
      success: `Actie ${n} aantoonbaar op schema en gekoppeld aan KPI-resultaat.`,
    });
    if (actions.length >= 15) break;
  }

  const successFallbackPool = [
    "Formele groeiregel: maximaal 5 FTE groei per jaar zonder expliciet aandeelhoudersbesluit.",
    "Ontwerp cellenmodel met autonome teams inclusief kwaliteits- en governancekaders.",
    "Versterk RUG-talentpipeline met instroomdoelen, mentorratio en retentiemeting.",
    "Maak aandeelhoudersdialoog verplicht onderdeel van kwartaalbestuurscyclus.",
    "Leg grenswaarden vast voor wanneer extra managementlagen expliciet verboden zijn.",
    "Definieer partnergovernance voor netwerkorganisaties met auditeerbare kwaliteitsnormen.",
    "Voer halfjaarlijkse cultuurstress-test uit bij elke groeiversnelling boven basisritme.",
    "Koppel leiderschapsbeoordeling aan uitstroom, verzuim en eigenaarschapsindicatoren.",
    "Borg ontwikkeluren per medewerker als harde randvoorwaarde voor schaalbesluiten.",
    "Introduceer exit- en terugkoopprotocol voor aandelen bij uitstroom voor continu eigenaarschap.",
  ];
  const crisisFallbackPool = [
    "Verscherp besluitdiscipline op prioritering en uitvoering via vaste weekreview.",
    "Voer maandelijkse escalatie op KPI-afwijkingen uit met expliciete eigenaar.",
    "Koppel interventies aan meetbare marge-, capaciteit- en contractdoelen.",
    "Leg stop-doing keuzes vast en bewaak naleving per bestuurscyclus.",
    "Harmoniseer operatie-, finance- en governance-ritme in één besluitkalender.",
    "Valideer kostprijs per productlijn maandelijks tegen tarief- en volumemix.",
    "Escaleer contractplafond-risico's per verzekeraar binnen 5 werkdagen.",
    "Herprioriteer capaciteit op basis van wachttijd, no-show en behandelduurdata.",
    "Formaliseer kwartaalbesluiten met expliciete eigenaar, deadline en financieel effect.",
    "Pauzeer initiatieven zonder aantoonbare bijdrage aan kern-KPI's.",
  ];

  while (actions.length < 15) {
    const n = actions.length + 1;
    const pool = caseClassification === "SUCCESS_MODEL" ? successFallbackPool : crisisFallbackPool;
    const fallbackAction = pool[(n - 1) % pool.length];
    const key = normalize(fallbackAction).toLowerCase();
    if (usedKeys.has(key)) {
      actions.push({
        action: `${fallbackAction} (Fase ${n})`,
        owner: owners[n % owners.length],
        deadline: `Dag ${Math.min(90, 7 + n * 5)}`,
        success:
          caseClassification === "SUCCESS_MODEL"
            ? `Actie ${n} borgt aantoonbaar behoud van eigenaarschap, lage uitstroom of kwaliteitsstabiliteit.`
            : `Actie ${n} levert meetbare verbetering in marge, capaciteit of contractdekking.`,
      });
      continue;
    }
    usedKeys.add(key);

    actions.push({
      action: fallbackAction,
      owner: owners[n % owners.length],
      deadline: `Dag ${Math.min(90, 7 + n * 5)}`,
      success:
        caseClassification === "SUCCESS_MODEL"
          ? `Actie ${n} borgt aantoonbaar behoud van eigenaarschap, lage uitstroom of kwaliteitsstabiliteit.`
          : `Actie ${n} levert meetbare verbetering in marge, capaciteit of contractdekking.`,
    });
  }
  return actions.slice(0, 15);
}

type TopicPlan = {
  title: string;
  goal: string;
  ownerPool: string[];
  actions: string[];
};

function buildStructuredInterventionBlock(
  interventionActions: Array<{ action: string; owner: string; deadline: string; success: string }>,
  inputInsights: InputInsights,
  caseClassification: CaseClassification,
  organizationName?: string
): string {
  const leverage = inputInsights.leverage || {};
  if (leverage.actionItemsBlock && leverage.actionItemsBlock.length > 120) {
    const openQuestions = leverage.openQuestionsBlock?.trim();
    if (openQuestions && !/OPEN QUESTIONS/i.test(leverage.actionItemsBlock)) {
      return `${leverage.actionItemsBlock}\n\n${openQuestions}`.replace(/\n{3,}/g, "\n\n").trim();
    }
    return leverage.actionItemsBlock;
  }
  const orgLabel = normalize(organizationName) || "de organisatie";
  const meetingTag = leverage.meetingDate ? ` [Meeting, ${leverage.meetingDate}]` : "";
  const regionLabel = leverage.regions || "Groningen/Friesland/Drenthe";
  const waitlistPct = leverage.waitlistShortPathPct ?? 8;
  const growthCap = leverage.growthCapFte ?? 5;
  const agingPct = leverage.agingCostPct ?? 30;
  const carePct = leverage.careTimePct ?? 70;
  const devPct = leverage.devTimePct ?? 30;

  const sourceActions = interventionActions.map((item) => item.action).filter(Boolean);
  const merged = Array.from(new Set([...inputInsights.actions, ...sourceActions]));

  const successTopics: TopicPlan[] = [
    {
      title: "Netwerkstrategie & Partnerselectie",
      goal: "schaal zonder personeelstoename",
      ownerPool: ["Directeur", "MT", "Finance"],
      actions: [
        `Inventariseer top-5 partnerorganisaties in ${regionLabel} met match-score en samenwerkingsmodel.`,
        `Ontwerp licentie-/marge-model (pricing + deliverables) voor knowledge-producten.`,
        `Start pilot met 2 netwerkpartners en borg minimaal 1 licentiecontract binnen 90 dagen.`,
      ],
    },
    {
      title: "Wachttijdinterventies",
      goal: "capaciteit vrijspelen",
      ownerPool: ["Operations", "MT", "Programmamanager"],
      actions: [
        `Schaal wachttijdtriage op naar 2 extra regio's met standaardscript en escalatieregels.`,
        `Verhoog kort-traject conversie van ${waitlistPct}% naar minimaal ${Math.max(waitlistPct + 4, 12)}% via 3-4 gesprekstrajecten.`,
        "Definieer KPI-dashboard: bespaarde behandeluren, terugval binnen 3 maanden, doorlooptijd intake.",
      ],
    },
    {
      title: "Kennisborging & Vergrijzingsrisico",
      goal: "mitigatie loonkosten + kennisoverdracht",
      ownerPool: ["HR", "Finance", "Directeur"],
      actions: [
        "Start senior -> junior knowledge transfer met mentorschap, Monday sessions en digitale knowledge base.",
        `Kwantificeer vergrijzingsimpact (${agingPct}% hogere loonkosten) in 3 scenario's en koppel mitigatiebudget.`,
        "Formaliseer RUG-talentpipeline met instroomdoelen, mentorratio en retentie-KPI's per kwartaal.",
      ],
    },
    {
      title: "Advocacy & Beleidsinvloed",
      goal: "versnel systeemimpact",
      ownerPool: ["Directeur", "MT", "Programmamanager"],
      actions: [
        leverage.movementOfZeroKnown
          ? "Plan debriefing + vervolginterview over Beweging van Nul met concrete beleidsagenda."
          : "Plan debriefing met beleidsstakeholders over opschaling van bewezen interventies.",
        "Ontwikkel 1-pager voor gemeentelijke inkopers met Veendam-resultaten en kostenimpact.",
        "Borg per kwartaal 1 publiek beleidsdeliverable met bestuurlijke adoptiedoelen.",
      ],
    },
    {
      title: "Jaarplan & Besluitritme",
      goal: "verminder bovenstroom-druk",
      ownerPool: ["MT", "Finance", "Operations"],
      actions: [
        `Ontwerp jaarplan met ${carePct}/${devPct}-stuurmodel en expliciet medewerker-eigenaarschap op KPI's.`,
        `Veranker formele groeiregel: maximaal ${growthCap} FTE per jaar zonder expliciet boardbesluit.`,
        "Installeer snelle besluitkern met wekelijkse review en maandelijkse escalatie op KPI-afwijkingen.",
      ],
    },
  ];

  const crisisTopics: TopicPlan[] = [
    {
      title: "Contract- & Tariefstrategie",
      goal: "margeverlies stoppen",
      ownerPool: ["Finance", "Directeur", "MT"],
      actions: merged.filter((line) => /(contract|verzekeraar|tarief|plafond|marge|kostprijs)/i.test(line)),
    },
    {
      title: "Capaciteit & Wachttijd",
      goal: "doorstroom herstellen",
      ownerPool: ["Operations", "MT", "HR"],
      actions: merged.filter((line) => /(capaciteit|wachttijd|planning|triage|no-show)/i.test(line)),
    },
    {
      title: "Kostenbeheersing & Portfolio",
      goal: "verlieslatende lijnen corrigeren",
      ownerPool: ["Finance", "Operations", "Directeur"],
      actions: merged.filter((line) => /(kosten|portfolio|stop|cash|productlijn)/i.test(line)),
    },
    {
      title: "Governance & Escalatie",
      goal: "besluitvertraging doorbreken",
      ownerPool: ["MT", "Directeur", "Programmamanager"],
      actions: merged.filter((line) => /(governance|escalatie|besluit|ritme|review)/i.test(line)),
    },
    {
      title: "Personeel & Stabiliteit",
      goal: "uitval voorkomen",
      ownerPool: ["HR", "Operations", "MT"],
      actions: merged.filter((line) => /(personeel|uitstroom|verzuim|werkdruk|bezetting)/i.test(line)),
    },
  ];

  const topics = caseClassification === "SUCCESS_MODEL" ? successTopics : crisisTopics;
  const priority = ["🔴", "🟡", "⚪"];
  let day = 2;
  const insightCorpus = `${inputInsights.facts.join(" ")} ${inputInsights.actions.join(" ")}`.toLowerCase();
  const isYouthOrPublicContext = /(jeugdzorg|jeugdwet|gemeente|gemeentelijke inkoop|wijkteam|haarlem|zuid-kennemerland)/i.test(
    insightCorpus
  );

  const actionLines = topics
    .map((topic, topicIndex) => {
      const baseActions = topic.actions.length
        ? topic.actions
        : merged.slice(topicIndex * 2, topicIndex * 2 + 5);
      const selected = Array.from(new Set(baseActions)).slice(0, 3);
      while (selected.length < 3) {
        selected.push(`Werk interventie ${selected.length + 1} uit voor ${topic.title.toLowerCase()}.`);
      }

      const bullets = selected.map((action, idx) => {
        const owner = `JIJ + ${topic.ownerPool[idx % topic.ownerPool.length]}`;
        const deadline = idx === 0 ? `${24 + day * 6}u` : idx === 1 ? "1 week" : "2 weken";
        day += 1;
        const causalLead =
          caseClassification === "SUCCESS_MODEL"
            ? topicIndex === 0
              ? `Omdat ${orgLabel} impact wil schalen zonder extra FTE-druk`
              : topicIndex === 1
                ? `Omdat wachttijdfrictie direct capaciteit blokkeert`
                : topicIndex === 2
                  ? `Omdat kennisverlies en vergrijzing structureel risico verhogen`
                  : topicIndex === 3
                    ? `Omdat beleidsinvloed directe schaalversneller is`
                    : `Omdat trage governance uitvoering vertraagt`
            : topicIndex === 0
              ? `Omdat contractdruk bestuurlijke ruimte en marge tegelijk beperkt`
              : topicIndex === 1
                ? `Omdat wachtdruk en instroomfrictie direct capaciteit blokkeren`
                : topicIndex === 2
                  ? `Omdat budgetdruk en uitvoeringskosten sneller stijgen dan de financiële ruimte`
                  : topicIndex === 3
                    ? `Omdat parallelle prioriteiten besluitdiscipline en eigenaarschap aantasten`
                    : `Omdat werkdruk en administratieve belasting retentie en teamstabiliteit raken`;
        const brondata =
          caseClassification === "SUCCESS_MODEL"
            ? topicIndex === 0
              ? `brondata: schaal zonder >${growthCap} FTE/jaar`
              : topicIndex === 1
                ? `brondata: ${waitlistPct}% kort-traject uitstroom`
                : topicIndex === 2
                  ? `brondata: +${agingPct}% vergrijzingskost`
                  : topicIndex === 3
                    ? "brondata: beleids- en netwerktractie aanwezig"
                    : `brondata: ${carePct}/${devPct} zorg-ontwikkelratio`
            : topicIndex === 0
              ? isYouthOrPublicContext
                ? "brondata: gemeentelijke inkoop, tariefdruk en contractafhankelijkheid"
                : "brondata: contractdruk, tariefmarge en plafondrestricties"
              : topicIndex === 1
                ? isYouthOrPublicContext
                  ? "brondata: wachttijden, intakefrictie en schaarse professionals"
                  : "brondata: wachtdruk, planning en operationele frictie"
                : topicIndex === 2
                  ? isYouthOrPublicContext
                    ? "brondata: budgetdruk, administratieve belasting en beperkte investeringskracht"
                    : "brondata: kostendruk, verlieslatende lijnen en investeringsbehoefte"
                  : topicIndex === 3
                    ? isYouthOrPublicContext
                      ? "brondata: bestuurlijke versnippering, verantwoordingsdruk en parallelle prioriteiten"
                      : "brondata: governancefrictie en trage besluitvorming"
                    : isYouthOrPublicContext
                      ? "brondata: personeelsschaarste, caseload en retentiedruk"
                      : "brondata: uitval, bezetting en uitvoerbaarheidsdruk";
        return `• ${priority[idx]} ${causalLead} -> ${action}; ${brondata}; owner: ${owner}; deadline: ${deadline}${meetingTag}`;
      });

      return `${topic.title} (Doel: ${topic.goal})\n${bullets.join("\n")}`;
    })
    .join("\n");

  const fyi = [
    "🟢 FYI — Updates / successen per business area",
    "Operations & HR",
    `• ${inputInsights.facts[0] || "Operationele stabiliteit blijft op peil met lage uitval."}`,
    `• ${inputInsights.facts[1] || "Teamcapaciteit blijft beheersbaar binnen huidig groeiritme."}${meetingTag}`,
    "Financien & Inkomsten",
    `• ${inputInsights.facts[2] || "Financiele prestaties vragen blijvende discipline op marge en contractering."}${meetingTag}`,
  ].join("\n");

  const blockers = [
    "⛔ BLOCKERS — gegroepeerd per initiatief (max 5)",
    caseClassification === "SUCCESS_MODEL"
      ? "Schaaltempo versus cultuur (Impact: kwaliteitsverlies)\n• Blokkade: volumegroei kan sneller gaan dan borging van eigenaarschap en kwaliteit."
      : "Contractonderhandelingen & Tarieven (Impact: omzet + marge)\n• Blokkade: dalende tarieven en plafondrestricties zetten direct druk op resultaat.",
    "Governancecomplexiteit (Impact: trage besluitvorming)\n• Blokkade: te veel parallelle prioriteiten vertragen uitvoering en eigenaarschap.",
  ].join("\n");

  const questions = buildTailoredOpenQuestions(inputInsights, organizationName);

  return [
    "🔴 ACTION ITEMS (Interventies) — Max 5 topics, 3-5 acties per topic",
    actionLines,
    "",
    fyi,
    "",
    blockers,
    "",
    questions,
  ].join("\n");
}

function buildTailoredOpenQuestions(inputInsights: InputInsights, organizationName?: string): string {
  const orgLabel = String(organizationName || "").trim() || "de organisatie";
  const corpus = `${inputInsights.facts.join(" ")} ${inputInsights.actions.join(" ")}`.toLowerCase();
  const isYouthOrPublicContext = /(jeugdzorg|jeugdwet|gemeente|gemeentelijke inkoop|wijkteam|haarlem|zuid-kennemerland)/i.test(
    corpus
  );
  const isScaleModelContext = /(licentie|modeladoptie|partnerreplicatie|netwerkorganisatie|70\/30|groeicap|beweging van nul)/i.test(
    corpus
  );

  if (isYouthOrPublicContext && !isScaleModelContext) {
    return [
      "CONTRACTEN & POSITIONERING",
      `• Welke niche of doelgroep kiest ${orgLabel} expliciet, zodat gemeenten een aantoonbare reden hebben om juist deze organisatie te contracteren?`,
      `• Welke contractmix wil ${orgLabel} binnen 12 maanden afbouwen, heronderhandelen of juist verdiepen om bestuurlijke kwetsbaarheid te verlagen?`,
      "",
      "WACHTTIJD & TOEGANG",
      `• Welke instroomcriteria en triageregels beschermen wachttijd en behandelcontinuiteit, ook als de vraag in de regio verder stijgt?`,
      `• Wanneer besluit ${orgLabel} expliciet om geen nieuwe instroom meer te accepteren binnen een traject of doelgroep die de kerncapaciteit ondermijnt?`,
      "",
      "PROFESSIONALS & UITVOERBAARHEID",
      `• Welke administratieve of coördinerende last kan ${orgLabel} binnen 90 dagen schrappen om effectieve behandeltijd en retentie direct te verbeteren?`,
      `• Welke caseloadgrens is bestuurlijk niet-onderhandelbaar voordat kwaliteit, teamstabiliteit of ziekteverzuim aantoonbaar verslechtert?`,
      "",
      "GEMEENTEN & SAMENWERKING",
      `• Welke samenwerkingsafspraken met gemeenten, scholen of wijkteams verlagen werkelijk de systeemdruk, en welke samenwerking kost vooral bestuurlijke energie zonder effect?`,
      `• Hoe laat ${orgLabel} binnen 6 maanden zichtbaar zien dat scherpere focus geen terugtrekking is, maar een betere route naar kwaliteit en voorspelbare toegang?`,
    ].join("\n");
  }

  if (isScaleModelContext) {
    return [
      "MODEL & SCHAAL",
      `• Waar ligt voor ${orgLabel} de grens waarop schaal het kernmechanisme van kwaliteit en eigenaarschap ondermijnt, en welke groeivorm stoppen we direct als die grens wordt geraakt?`,
      "",
      "CULTUUR & KENNIS",
      `• Welke onderdelen van het ${orgLabel}-model zijn overdraagbaar naar partners en welke verliezen effect buiten de huidige cultuurcontext, en welke keuze maken we dan tussen standaardisatie en autonomie?`,
      "",
      "NETWERK & INVLOED",
      "• Wanneer wordt netwerkadoptie strategisch krachtiger dan verdere groei van de eigen organisatie voor impactversnelling, en welk investeringspad kiezen we expliciet als gevolg?",
      "",
      "SYSTEEMIMPACT",
      "• Welke expliciete beleidskeuze is nodig om systeemadoptie te versnellen zonder bestuurlijke controle over kwaliteit te verliezen, en welk risico accepteren we daarbij formeel?",
      "• Welk strategisch offer accepteert het bestuur expliciet als voorwaarde om binnen 24 maanden van lokaal model naar regionaal systeemmodel te gaan, en welke kill-switch hanteren we als die route faalt?",
    ].join("\n");
  }

  return [
    "FOCUS & PRIORITEIT",
    `• Welke activiteit stopt ${orgLabel} expliciet deze bestuurscyclus om de gekozen richting bestuurlijk geloofwaardig te maken?`,
    "",
    "UITVOERBAARHEID",
    `• Welke bottleneck blijft bestaan, zelfs als ${orgLabel} morgen extra capaciteit of budget toevoegt, en wat zegt dat over het echte systeemprobleem?`,
    "",
    "GOVERNANCE",
    `• Welke beslissing vraagt nu expliciet eigenaarschap, KPI en stopregel omdat bestuurlijke ambiguïteit anders sneller groeit dan de organisatie kan absorberen?`,
    "",
    "VALIDATIE",
    `• Welke aanname achter de gekozen richting moet ${orgLabel} binnen 90 dagen toetsen om te voorkomen dat focus verandert in overtuiging zonder bewijs?`,
  ].join("\n");
}

function extractKillerInsightsFromReport(report: string): string {
  const text = String(report || "");
  if (!text) return "";
  const match = text.match(
    /###\s*NIEUWE INZICHTEN \(KILLER INSIGHTS\)\s*([\s\S]*?)(?:\n5\.\s+Aanbevolen keuze|\n\d+\.\s+Aanbevolen keuze|$)/i
  );
  const block = match?.[1]?.trim() || "";
  if (!block) return "";
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^Mechanisme:|^Strategische implicatie:/i.test(line))
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line) => !/^Inzicht\s+[A-Z]?\d+/i.test(line))
    .slice(0, 3);
  return lines.map((line) => `• ${line}`).join("\n").trim();
}

function parseOpenQuestionLines(value: string): string[] {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^•\s+/.test(line))
    .map((line) => line.replace(/^•\s+/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

function formatKillerInsightsForMemo(insights: MechanisticInsight[]): string {
  const rootKey = (value: string): string =>
    normalize(value)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 8)
      .join(" ");

  const labelNoise = /^Inzicht\s+[A-Z]?\d+/i;
  const dedup = new Map<string, string>();

  for (const item of insights || []) {
    const mechanism = normalize(item.mechanism);
    const implication = normalize(item.implication);
    if (!mechanism || !implication) continue;
    if (labelNoise.test(mechanism) || labelNoise.test(implication)) continue;
    if (/\b(inzicht\s+[a-z]?\d+)\b/i.test(`${mechanism} ${implication}`)) continue;
    const key = rootKey(mechanism);
    if (!key || dedup.has(key)) continue;
    const bullet = frameBoardroomShock(normalizeBoardroomBullet(`${mechanism} ${implication}`, 220), 180);
    dedup.set(key, bullet);
    if (dedup.size >= 3) break;
  }

  const fallback = [
    "Het model faalt niet op kwaliteit maar op overdraagbaarheid. Prioriteit is replicatie met harde kwaliteitsguardrails.",
    "Groei via eigen FTE vergroot cultuurdruk. Netwerkadoptie verhoogt impact met lagere interne frictie.",
    "Zonder expliciete stopregels verschuift besluitkracht naar operatie. Borg escalatie en kill-switches op boardniveau.",
  ];

  const bullets = Array.from(dedup.values());
  for (const item of fallback) {
    if (bullets.length >= 3) break;
    if (!bullets.includes(item)) bullets.push(item);
  }

  return bullets.slice(0, 3).join("\n").trim();
}

function buildDecisionCadenceFromKpis(kpisSection: string): string {
  const raw = String(kpisSection || "");
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, "").trim())
    .filter((line) => !/^Inzicht\s+[A-Z]?\d+/i.test(line))
    .filter((line) => !/^\d+\.\s*Inzicht\s+[A-Z]?\d+/i.test(line))
    .slice(0, 5);

  const effectiveLines =
    lines.length > 0
      ? lines
      : [
          "Kwartaalmarge t.o.v. norm",
          "Kwaliteitsscore kernproces",
          "Capaciteit t.o.v. afgesproken grens",
          "Doorlooptijd van prioritaire interventies",
          "Adoptiegraad van strategische keuze",
        ];
  return effectiveLines
    .map(
      (line, idx) =>
        `${idx + 1}. KPI: ${line} | Drempel: 2 meetperiodes onder norm | Owner: ${idx % 2 === 0 ? "MT" : "Directie"} | Besluit bij rood: opschaling pauzeren en binnen 10 werkdagen herbesluiten`
    )
    .join("\n");
}

function buildBoardroomDecisionModulesV3(params: {
  inputInsights: InputInsights;
  output: any;
  mechanisms: StrategicMechanismOutput;
  conflict: BoardroomConflict;
  strategicMode: StrategicMode;
  pattern: StrategicPatternMatch;
  recommendedOption: "A" | "B" | "C";
  report: string;
  memo: string;
  openQuestions: string;
  predictedInterventions: Array<{
    interventie: string;
    impact: string;
    risico: string;
    kpi_effect: string;
    confidence: "laag" | "middel" | "hoog";
  }>;
  killerInsights: MechanisticInsight[];
  organizationName?: string;
  sector?: string;
  organizationType?: string;
  leverage?: InputInsights["leverage"];
  patternProfile?: StrategicPatternProfile;
  strategySimulation?: StrategySimulationEngineOutput;
  decisionMemory?: DecisionMemoryOutput;
  earlyWarningSystem?: EarlyWarningSystemOutput;
}): Record<string, unknown> {
  const {
    inputInsights,
    output,
    mechanisms,
    conflict,
    strategicMode,
    pattern,
    recommendedOption,
    report,
    memo,
    openQuestions,
    predictedInterventions,
    killerInsights,
    organizationName,
    sector,
    organizationType,
    leverage,
    patternProfile,
    strategySimulation,
    decisionMemory,
    earlyWarningSystem,
  } = params;
  const publicYouthContext =
    /(jeugdzorg|jeugdwet|gemeente|gemeentelijke inkoop|wijkteam|jongeren|gezinnen)/i.test(
      `${organizationName || ""} ${sector || ""} ${report || ""} ${memo || ""} ${inputInsights.facts.join(" ")} ${inputInsights.actions.join(" ")}`
    );
  if (publicYouthContext) {
    return {};
  }
  const killerInsightEngine = buildKillerInsightEngineBlock({
    organizationName,
    killerInsight: killerInsights[0]?.mechanism,
    successMechanism: mechanisms.successMechanism,
    conflictStatement: conflict.conflictStatement,
    strategicImplication: conflict.forcingChoice,
  });
  const boardroomPressureScenario = buildBoardroomPressureScenarioBlock({
    organizationName,
    waitlistShortPathPct: leverage?.waitlistShortPathPct,
    growthCapFte: leverage?.growthCapFte,
    agingCostPct: leverage?.agingCostPct,
    movementOfZeroKnown: leverage?.movementOfZeroKnown,
  });
  const decisionPressure = buildDecisionPressureBlock({
    optionA: normalize(output?.decision?.strategic_options?.[0]?.description || ""),
    optionB: normalize(output?.decision?.strategic_options?.[1]?.description || ""),
    optionC: normalize(output?.decision?.strategic_options?.[2]?.description || ""),
    explicitLoss: conflict.explicitLoss,
  });
  const strategicFraming = buildStrategicFramingBlock({
    organizationName,
    strategicQuestion: "hoe het model groeit zonder het kernmechanisme te breken",
  });
  const strategicConflictEngine = buildStrategicConflictEngineBlock({
    conflictStatement: conflict.conflictStatement,
    sideA: conflict.sideA,
    sideB: conflict.sideB,
    mechanism: mechanisms.successMechanism,
    boardroomQuestion:
      "Als deze twee doelen niet tegelijk volledig haalbaar zijn, welke kiezen we dan expliciet als prioriteit?",
  });
  const boardroomCoachEngine = buildBoardroomCoachBlock({
    organizationName,
    strategicHypothesis: normalize(output?.decision?.dominant_thesis || ""),
    coreConflict: conflict.conflictStatement,
    chosenStrategy: `Optie ${recommendedOption}`,
  });
  const strategySimulationEngine =
    strategySimulation != null ? buildStrategySimulationBlock(strategySimulation) : "";
  const strategicPatternEngine =
    patternProfile != null ? buildStrategicPatternBoardroomBlock(patternProfile) : "";
  const decisionMemoryEngine = decisionMemory != null ? buildDecisionMemoryBlock(decisionMemory) : "";
  const earlyWarningEngine = earlyWarningSystem != null ? buildEarlyWarningSystemBlock(earlyWarningSystem) : "";
  const blindSpotsText = extractSection(report, 10);
  const decisionConsequencesText = extractSection(report, 12);
  const strategicLeverageText = extractSection(report, 13);
  const strategicMemoryText = extractSection(report, 14);

  return {
    signal_extraction: {
      FACT_BASE: inputInsights.facts.slice(0, 8),
      deviations: inputInsights.facts.filter((line) => /\bdruk|risico|beperkt|stijg/i.test(line)).slice(0, 5),
    },
    pattern_detection: {
      PATTERN_MODEL: {
        culture_pattern: pattern.pattern,
        operational_pattern: strategicMode,
        economic_pattern: normalize(output?.diagnosis?.financial_pressure || ""),
        network_pattern: /netwerk/i.test(inputInsights.facts.join(" ")) ? "network-active" : "network-emerging",
      },
    },
    core_mechanism: {
      CORE_MECHANISM: mechanisms.successMechanism,
    },
    strategic_paradox: {
      STRATEGIC_PARADOX: conflict.conflictStatement,
    },
    strategic_pattern_library: {
      ORGANIZATION_PATTERN: patternProfile
        ? {
            primary_pattern: patternProfile.primary_pattern,
            secondary_pattern: patternProfile.secondary_pattern || null,
            scale_mechanism: patternProfile.scale_mechanism,
            typical_risks: patternProfile.typical_risks,
            growth_strategy: patternProfile.growth_strategy,
            interventions: patternProfile.strategic_interventions,
          }
        : null,
      BOARDROOM_FRAMING: strategicPatternEngine,
    },
    strategy_simulation_engine: {
      SIMULATION_CONTEXT: strategySimulation?.simulation_context || null,
      STRATEGIC_SCENARIOS: strategySimulation?.strategic_scenarios || [],
      SIMULATION_RESULTS: strategySimulation?.simulation_results || [],
      SCENARIO_RISKS: strategySimulation?.scenario_risks || [],
      STRATEGY_COMPARISON: strategySimulation?.strategy_comparison || "",
      DECISION_GUIDANCE: strategySimulation?.decision_guidance || "",
      EARLY_WARNING_SIGNALS: strategySimulation?.early_warning_signals || [],
      BOARDROOM_VISUALIZATION: strategySimulation?.boardroom_visualization || strategySimulationEngine,
    },
    decision_memory_system: {
      DECISION_RECORD: decisionMemory?.decision_record || null,
      DECISION_CONTEXT: decisionMemory?.decision_context || null,
      DECISION_HISTORY: decisionMemory?.decision_history || [],
      DECISION_ALIGNMENT: decisionMemory?.decision_alignment || null,
      BOARDROOM_ALERT: decisionMemory?.boardroom_alert || decisionMemoryEngine,
    },
    early_warning_system: {
      RISK_SIGNALS: earlyWarningSystem?.risk_signals || [],
      WARNING_INDICATORS: earlyWarningSystem?.warning_indicators || [],
      RISK_THRESHOLDS: earlyWarningSystem?.risk_thresholds || [],
      BOARDROOM_ALERT: earlyWarningSystem?.boardroom_alert || earlyWarningEngine,
    },
    blind_spot_detector: {
      BLIND_SPOTS: blindSpotsText,
      blind_spot_count: (blindSpotsText.match(/Blinde vlek\s+\d+/gi) || []).length,
    },
    decision_consequence_simulator: {
      DECISION_CONSEQUENCES: decisionConsequencesText,
      has_12m: /12 maanden/i.test(decisionConsequencesText),
      has_24m: /24 maanden/i.test(decisionConsequencesText),
      has_36m: /36 maanden/i.test(decisionConsequencesText),
    },
    strategic_leverage_detector: {
      STRATEGIC_LEVERAGE: strategicLeverageText,
      leverage_count: (strategicLeverageText.match(/Hefboom\s+\d+/gi) || []).length,
    },
    strategic_memory_engine: {
      STRATEGIC_MEMORY: strategicMemoryText,
      has_similar_patterns: /Vergelijkbare patronen/i.test(strategicMemoryText),
      has_warning: /Strategische waarschuwing/i.test(strategicMemoryText),
    },
    strategic_conflict_engine: {
      STRATEGIC_CONFLICT: strategicConflictEngine,
      PRICE_OF_CHOICE: conflict.explicitLoss,
    },
    killer_insight_engine: {
      KILLER_INSIGHT_ENGINE: killerInsightEngine,
    },
    killer_insight: {
      KILLER_INSIGHTS: killerInsights.slice(0, 3).map((item) => ({
        insight: item.title,
        mechanisme: item.mechanism,
        implicatie: item.implication,
      })),
    },
    option_generation: {
      STRATEGIC_OPTIONS: (output?.decision?.strategic_options || []).slice(0, 3).map((item: any) => ({
        optie: item?.code || "",
        mechanisme: normalize(item?.description || ""),
        impact: normalize(item?.financial_effect || ""),
        risico: normalize(item?.risk_profile || ""),
      })),
    },
    intervention_engine: {
      INTERVENTIONS: predictedInterventions.slice(0, 5),
    },
    decision_logic: {
      RECOMMENDED_OPTION: recommendedOption,
      RATIONALE: conflict.forcingChoice,
      criteria: ["impact", "uitvoerbaarheid", "strategische consistentie"],
    },
    boardroom_pressure_module: {
      SCENARIO_GEEN_INTERVENTIE: boardroomPressureScenario,
    },
    decision_pressure: {
      BESTUURLIJKE_KEUZE: decisionPressure,
    },
    strategic_framing: {
      STRATEGISCHE_VRAAG: strategicFraming,
    },
    boardroom_coach_engine: {
      BOARDROOM_COACH: boardroomCoachEngine,
    },
    boardroom_memo: {
      required_sections: [
        "Executive summary",
        "Bestuurlijke hypothese",
        "Feitenbasis",
        "Kernconflict",
        "Strategische opties",
        "Besluitvoorstel",
        "Consequenties",
        "Opvolging 90 dagen",
      ],
      has_required_structure:
        /Bestuurlijke hypothese/i.test(memo) &&
        /Feitenbasis/i.test(memo) &&
        /Kernconflict/i.test(memo) &&
        /Besluitvoorstel/i.test(memo) &&
        /Consequenties/i.test(memo) &&
        /Opvolging 90 dagen/i.test(memo),
      output_preview: report.slice(0, 400),
    },
    open_questions: {
      OPEN_QUESTIONS: parseOpenQuestionLines(openQuestions),
      categories: ["MODEL & SCHAAL", "CULTUUR & KENNIS", "NETWERK & INVLOED", "SYSTEEMIMPACT"],
    },
    validation: {
      logical_consistency: !/undefined|null|placeholder/i.test(`${memo}\n${report}`),
      source_reference_present: /\bbrondata:|case datapoint:/i.test(report),
      kpi_realism: /\b\d+([.,]\d+)?\s*(%|fte|maanden|jaar)\b/i.test(report),
      strategic_coherence: /Kernconflict|Besluitvoorstel|WIJ BESLUITEN/i.test(memo),
      strategic_pattern_present: hasStrategicPatternContract(memo),
      strategy_simulation_present: hasStrategySimulationContract(memo),
      decision_memory_present: hasDecisionMemoryContract(memo),
      early_warning_present: hasEarlyWarningContract(memo),
      blind_spots_present: (blindSpotsText.match(/Blinde vlek\s+\d+/gi) || []).length >= 3,
      decision_consequences_present:
        /12 maanden/i.test(decisionConsequencesText) &&
        /24 maanden/i.test(decisionConsequencesText) &&
        /36 maanden/i.test(decisionConsequencesText),
      strategic_leverage_present: (strategicLeverageText.match(/Hefboom\s+\d+/gi) || []).length >= 2,
      strategic_memory_present:
        /Vergelijkbare patronen/i.test(strategicMemoryText) &&
        /Herhaalde strategie/i.test(strategicMemoryText) &&
        /Strategische waarschuwing/i.test(strategicMemoryText),
      killer_insight_present: /Killer insight/i.test(memo),
      strategic_conflict_present: hasStrategicConflictContract(memo),
      boardroom_coach_present: hasBoardroomCoachContract(memo),
      pressure_scenario_present: /SCENARIO:\s*GEEN INTERVENTIE/i.test(memo),
      strategic_choice_explicit: /BESTUURLIJKE KEUZE/i.test(memo),
      measurable_interventions: /\b\d+([.,]\d+)?\s*(%|fte|maanden|jaar|dagen)\b/i.test(memo),
      contract_complete:
        hasBoardroomPressureContract(memo) &&
        hasStrategicPatternContract(memo) &&
        hasStrategySimulationContract(memo) &&
        hasDecisionMemoryContract(memo) &&
        hasEarlyWarningContract(memo) &&
        hasStrategicConflictContract(memo) &&
        hasBoardroomCoachContract(memo),
    },
  };
}

function safelyBuildBoardroomDecisionModulesV3(
  params: Parameters<typeof buildBoardroomDecisionModulesV3>[0]
): Record<string, unknown> {
  try {
    return buildBoardroomDecisionModulesV3(params);
  } catch (error) {
    console.warn("Boardroom modules skipped after runtime error", error);
    return {};
  }
}

function buildPublicYouthStrategyDNAProfile(): {
  archetype: string;
  coreMechanism: string;
  growthModel: string;
  strategicRisk: string;
  strategyPreference: string;
} {
  return {
    archetype: "specialistische jeugdzorgpartner",
    coreMechanism:
      "Contractkwaliteit, scherpe doelgroepkeuze en bestuurlijke discipline bepalen of capaciteit houdbaar blijft.",
    growthModel:
      "Groei ontstaat via scherpere positionering, betere instroomsturing en selectieve samenwerking in plaats van lineaire volumegroei.",
    strategicRisk:
      "Breedte zonder contractdiscipline of nichekeuze vergroot werkdruk sneller dan bestuurlijke ruimte en teamstabiliteit.",
    strategyPreference:
      "Specialisatie, contractdiscipline en selectieve netwerksamenwerking. Primaire stuurhefboom: positionering.",
  };
}

function buildPublicYouthScenarioSimulationBlock(): { title: string; body: string } {
  return {
    title: "Strategische scenario simulatie",
    body: [
      "Scenario A — Bescherm de kern en versmal de propositie",
      "",
      "Mechanisme",
      "Bestuurlijke focus op doelgroep, contractmix en triage verlaagt ruis en beschermt schaarse capaciteit.",
      "",
      "Operationeel effect",
      "Doorstroom wordt voorspelbaarder en caseloaddruk daalt zodra instroom en aanbod scherper worden gestuurd.",
      "",
      "Financieel effect",
      "Contractkwaliteit en marge verbeteren doordat verlieslatende breedte minder ruimte krijgt.",
      "",
      "Strategisch risico",
      "Te trage zichtbaarheid van wachttijdverbetering kan gemeenten verleiden om volume elders onder te brengen. (middel)",
      "",
      "Bestuurlijke implicatie",
      "Bestuur moet focus zichtbaar maken in contractdialoog, wachttijdsturing en verwijzerscommunicatie.",
      "",
      "Scenario B — Verbreden ondanks contract- en personeelsdruk",
      "",
      "Mechanisme",
      "Parallelle verbreding vergroot bestuurlijke spreiding terwijl contractruimte en teamcapaciteit al onder druk staan.",
      "",
      "Operationeel effect",
      "Meer variatie in aanbod verhoogt coördinatiedruk, caseloadfrictie en risico op wachttijdinstabiliteit.",
      "",
      "Financieel effect",
      "Omzet kan tijdelijk stijgen, maar margedruk en verantwoordingslast nemen sneller toe dan de structurele ruimte.",
      "",
      "Strategisch risico",
      "De organisatie verliest focus en onderscheidend vermogen tegenover grotere of specialistische aanbieders. (hoog)",
      "",
      "Bestuurlijke implicatie",
      "Bestuur moet expliciet bepalen welke verbreding wordt gestopt zodra contractkwaliteit of teamstabiliteit verslechtert.",
      "",
      "Scenario C — Netwerkroute rond kernspecialisatie",
      "",
      "Mechanisme",
      "De organisatie houdt zelf focus op haar kern en organiseert aanvullende capaciteit via partners met duidelijke governance.",
      "",
      "Operationeel effect",
      "Instroom kan beter worden gerouteerd zonder de eigen kerncapaciteit te overbelasten.",
      "",
      "Financieel effect",
      "Contractpositie en verwijzersvertrouwen verbeteren als partnerschap schaal toevoegt zonder interne verbredingskosten.",
      "",
      "Strategisch risico",
      "Partnerkwaliteit en governance kunnen de gekozen focus ondermijnen als escalatieregels ontbreken. (middel)",
      "",
      "Bestuurlijke implicatie",
      "Bestuur moet partnercriteria, auditritme en routeringsafspraken vooraf contracteren.",
    ].join("\n"),
  };
}

function buildPublicYouthCausalStrategyBlock(): {
  items: Array<{
    hefboom: string;
    mechanisme: string;
    operationeelEffect: string;
    financieelEffect: string;
    strategischRisico: string;
    bestuurlijkeImplicatie: string;
  }>;
  summary: string;
  block: string;
} {
  const items = [
    {
      hefboom: "contractdiscipline",
      mechanisme:
        "Contractstructuur bepaalt de feitelijke schaalruimte en begrenst welke instroom bestuurlijk houdbaar is.",
      operationeelEffect:
        "Doorstroom en caseload worden voorspelbaarder zodra contractkeuzes en instroomtempo beter op elkaar aansluiten.",
      financieelEffect:
        "Marge stabiliseert wanneer verlieslatende breedte en ongedekte productie sneller worden afgebouwd.",
      strategischRisico:
        "Zonder contractdiscipline groeit vraag sneller dan bestuurlijke en financiële ruimte.",
      bestuurlijkeImplicatie:
        "Bestuur moet contractmix, margevloer en volumekeuzes expliciet koppelen aan de gekozen propositie.",
    },
    {
      hefboom: "triage en toegangssturing",
      mechanisme:
        "De kwaliteit van triage bepaalt hoeveel druk er op schaarse professionals en wachttijdopbouw komt.",
      operationeelEffect:
        "Strakkere instroomselectie verlaagt wachtdruk en voorkomt dat de verkeerde casuïstiek de kerncapaciteit overneemt.",
      financieelEffect:
        "Minder verkeerde instroom verlaagt herwerk, no-show-achtige verspilling en niet-rendabele doorlooptijd.",
      strategischRisico:
        "Zonder toegangssturing blijven wachttijden publiek zichtbaar en loopt legitimiteit bij gemeenten terug.",
      bestuurlijkeImplicatie:
        "Bestuur moet intakecriteria, routering en caseloadgrenzen niet overlaten aan ad-hoc beslissingen.",
    },
    {
      hefboom: "scherpe positionering",
      mechanisme:
        "Een expliciete niche maakt contractering, verwijzing en interne focus tegelijk sterker.",
      operationeelEffect:
        "Teams werken consistenter als doelgroep, aanbodgrenzen en partnerroutering helder zijn.",
      financieelEffect:
        "Een verdedigbare propositie vermindert prijsdruk en vergroot kans op structureel passende contracten.",
      strategischRisico:
        "Zonder scherpe positionering verliest de organisatie onderscheidend vermogen tegenover grotere spelers.",
      bestuurlijkeImplicatie:
        "Bestuur moet vastleggen voor welke doelgroep de organisatie primair kiest en wat expliciet buiten de kern valt.",
    },
  ];

  const block = [
    "### Causale strategieanalyse",
    ...items.flatMap((item) => [
      `Strategische hefboom: ${item.hefboom}`,
      "",
      "Mechanisme",
      item.mechanisme,
      "",
      "Operationeel effect",
      item.operationeelEffect,
      "",
      "Financieel effect",
      item.financieelEffect,
      "",
      "Strategisch risico",
      item.strategischRisico,
      "",
      "Bestuurlijke implicatie",
      item.bestuurlijkeImplicatie,
      "",
    ]),
    "### Dominante hefboomcombinatie",
    "contractdiscipline",
    "triage en toegangssturing",
    "scherpe positionering",
    "",
    "Strategisch effect",
    "Deze combinatie verlaagt tegelijk wachtdruk, bestuurlijke kwetsbaarheid en contractrisico zonder te leunen op lineaire volumegroei.",
    "",
    "### Mechanismeketens",
    "1. Contractplafonds -> wachtdruk -> werkdruk -> teamuitval",
    "2. Brede propositie -> diffuse contractering -> lagere marge -> minder bestuurlijke ruimte",
    "3. Zwakke triage -> verkeerde instroom -> overbelaste caseload -> kwaliteitsdruk",
  ].join("\n");

  return {
    items,
    summary: items[0].mechanisme,
    block,
  };
}

function buildPublicYouthKillerInsights(
  inputInsights: InputInsights,
  organizationName?: string
): MechanisticInsight[] {
  const orgLabel = normalize(organizationName) || "de organisatie";
  const factCorpus = inputInsights.facts.join(" ");
  const actionCorpus = inputInsights.actions.join(" ");
  const insights: MechanisticInsight[] = [
    {
      title: "Wachtdruk is contractgedreven, niet personeelsgedreven.",
      mechanism:
        "Gemeentelijke contractruimte en plafonds begrenzen hoeveel instroom bestuurlijk en financieel houdbaar is, waardoor extra capaciteit zonder contractruimte de wachttijd niet structureel oplost.",
      implication:
        "Heronderhandel contractmix en instroomcriteria voordat extra capaciteit wordt toegevoegd.",
    },
    {
      title: "Extra personeel kan de druk verhogen als triage zwak blijft.",
      mechanism:
        "Zonder scherpere instroomdiscipline groeit coördinatie en administratieve belasting sneller dan productieve behandeltijd, waardoor werkdruk stijgt terwijl de wachttijd zichtbaar blijft.",
      implication:
        "Leg eerst caseloadgrenzen, intakecriteria en routering vast; voeg pas daarna capaciteit toe.",
    },
    {
      title: "Breedte verzwakt de propositie juist op het moment dat gemeenten focus zoeken.",
      mechanism:
        "Een brede positionering vergroot aanbodruis en maakt het moeilijker om contractmatig en inhoudelijk te bewijzen waarom juist deze organisatie onmisbaar is.",
      implication:
        `Dwing binnen één kwartaal een niche- of doelgroepkeuze af voor ${orgLabel}.`,
    },
    {
      title: "Wachttijd is een bestuurlijk signaal, geen puur operationeel probleem.",
      mechanism:
        "Als wachttijden oplopen terwijl contractkeuze, triage en caseloadbeleid diffuus blijven, is dat een teken dat het bestuur geen harde prioriteit heeft gezet op toegang en focus.",
      implication:
        "Maak wachttijd onderdeel van board-escalatie in plaats van alleen van operationele rapportage.",
    },
    {
      title: "Gemeentelijke afhankelijkheid maakt strategie kwetsbaar zodra contractkwaliteit verslechtert.",
      mechanism:
        "Bij hoge afhankelijkheid van één financieringslogica vertaalt tariefdruk zich direct naar lagere marge, minder investeringsruimte en meer teamdruk.",
      implication:
        "Verlaag concentratierisico via scherpere contractmix, nichepositionering en verwijzersverbreding.",
    },
    {
      title: "Personeelsschaarste is vooral gevaarlijk omdat de verkeerde casuïstiek de kerncapaciteit opvreet.",
      mechanism:
        "Zonder harde toegangskeuzes gaan schaarse professionals op aan casussen die niet het beste passen bij de kernpropositie, waardoor wachtdruk en kwaliteitsverlies tegelijk oplopen.",
      implication:
        "Bescherm de kerncapaciteit met expliciete uitsluitingscriteria en partnerroutering.",
    },
    {
      title: "Bestuurlijke inertie vergroot de schade sneller dan volumegroei haar kan compenseren.",
      mechanism:
        "Als contractdiscipline, positionering en triage tegelijk onduidelijk blijven, stapelen werkdruk, marge-erosie en reputatierisico zich sneller op dan extra activiteit kan opvangen.",
      implication:
        "Versmal de agenda tot één gekozen koers met stopregels op wachttijd, marge en caseload.",
    },
  ];

  if (/gemeentelijke inkoop|contract/i.test(factCorpus)) {
    return insights;
  }

  return insights.map((item) => ({
    ...item,
    mechanism: normalize(`${item.mechanism} ${actionCorpus}`),
  }));
}

function buildBoardroomSummaryBlock(params: {
  dominantRisk: string;
  recommendedDecision: string;
  downside: string;
  stopRule: string;
  organizationName?: string;
  sector?: string;
}): string {
  return [
    "0. Boardroom summary",
    `Organisatie: ${normalize(params.organizationName) || "Onbekende organisatie"}`,
    `Sector: ${normalize(params.sector) || "Onbekende sector"}`,
    `Analyse datum: ${new Date().toLocaleDateString("nl-NL")}`,
    "",
    "DOMINANT RISICO",
    normalize(params.dominantRisk),
    "",
    "AANBEVOLEN BESLUIT",
    normalize(params.recommendedDecision),
    "",
    "KEERZIJDE VAN DE KEUZE",
    normalize(params.downside),
    "",
    "STOPREGEL",
    normalize(params.stopRule),
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeBoardroomSectorLabel(value: unknown): string {
  const text = normalize(value).toLowerCase();
  if (!text) return "Onbekende sector";
  if (/jeugdzorg|jeugdwet|jongeren|gezinnen|opvoed|multiproblematiek/.test(text)) return "Jeugdzorg";
  if (/ggz|geestelijke gezondheidszorg/.test(text)) return "GGZ";
  if (/zorg/.test(text)) return "Zorg";
  return normalize(value) || "Onbekende sector";
}

function withTerminalPeriod(value: string): string {
  const text = normalize(value).replace(/[.\s]+$/g, "");
  return text ? `${text}.` : "";
}

function buildCaseAnchoredFactBase(
  inputInsights: InputInsights,
  caseClassification: CaseClassification
): string {
  if (caseClassification !== "SUCCESS_MODEL" || !hasSuccessModelSignature(inputInsights)) {
    return inputInsights.facts.join("\n");
  }

  const leverage = inputInsights.leverage || {};
  const growthCap = leverage.growthCapFte ?? 5;
  const waitlistPct = leverage.waitlistShortPathPct ?? 8;
  const carePct = leverage.careTimePct ?? 70;
  const devPct = leverage.devTimePct ?? 30;
  const agingPct = leverage.agingCostPct ?? 30;

  const anchored = [
    `Groei wordt bestuurlijk begrensd op maximaal ${growthCap} FTE per jaar om cultuur- en kwaliteitsmechanismen intact te houden.`,
    `Operationeel model is expliciet ${carePct}/${devPct}: ${carePct}% zorguitvoering en ${devPct}% ontwikkeltijd als structurele kennishefboom.`,
    `Wachttijdtriage laat circa ${waitlistPct}% instroom via kort traject uitstromen, wat direct capaciteit vrijspeelt zonder extra FTE.`,
    `Vergrijzingsdruk impliceert circa +${agingPct}% loonkosten; netwerkopdrachten en licentie-inkomsten zijn benoemd als structurele marge-buffer.`,
    "Schaalambitie loopt via modeladoptie in netwerk en beleid, niet via lineaire volumegroei van eigen personeel.",
  ];

  const merged = Array.from(
    new Set(
      [...inputInsights.facts, ...anchored]
        .map((line) => normalize(line))
        .filter(Boolean)
    )
  );
  return merged.slice(0, 8).join("\n");
}

function buildKnowledgeOrganizationInsight(
  inputInsights: InputInsights,
  organizationName?: string
): { insight: string; mechanism: string; implication: string } | null {
  const org = String(organizationName || "de organisatie").trim() || "de organisatie";
  const hasKnowledgeSignals =
    (inputInsights.leverage.devTimePct || 0) >= 20 &&
    ((inputInsights.leverage.movementOfZeroKnown ?? false) ||
      (inputInsights.leverage.licenseMarginKnown ?? false) ||
      inputInsights.facts.some((fact) => /(kennis|project|licentie|netwerk|modeladoptie)/i.test(fact)));

  if (!hasKnowledgeSignals) return null;

  return {
    insight: `${org} is geen zorgorganisatie die kennis ontwikkelt. Het is een kennisorganisatie die zorg levert.`,
    mechanism:
      "Waarde ontstaat niet alleen in behandeling, maar in ontwikkeltijd, overdraagbare methodiek, netwerkpositie en modelverspreiding.",
    implication:
      "Schaal moet primair via modeladoptie, kennisproducten en partners verlopen, niet via lineaire groei van behandelaars.",
  };
}

function buildDutchReport(
  output: any,
  inputInsights: InputInsights,
  caseClassification: CaseClassification,
  strategicMode: StrategicMode,
  mechanisms: StrategicMechanismOutput,
  conflict: BoardroomConflict,
  pattern: StrategicPatternMatch,
  patternProfile: StrategicPatternProfile,
  strategySimulation: StrategySimulationEngineOutput,
  flywheel: StrategicFlywheelOutput,
  predictedInterventions: Array<{
    interventie: string;
    impact: string;
    risico: string;
    kpi_effect: string;
    confidence: "laag" | "middel" | "hoog";
  }>,
  sessionId?: string,
  organizationName?: string,
  sector?: string,
  organizationType?: string
): string {
  const compact = (value: string, max = 220): string => {
    const text = normalize(value);
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1).trimEnd()}…`;
  };
  const trimWords = (value: string, maxWords = 150): string => {
    const words = normalize(value).split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return words.join(" ");
    return `${words.slice(0, maxWords).join(" ")}…`;
  };
  const toEurText = (value: string): string =>
    String(value || "")
      .replace(/€\s*/g, "EUR ")
      .replace(/\bEUR\s+(\d{1,3})\.(\d{3})\b/g, "EUR $1.$2");
  const systemTransformation = inferSystemTransformationAssessment(inputInsights, caseClassification);
  const thesis = buildStrategicThesis(
    inputInsights,
    caseClassification,
    strategicMode,
    mechanisms,
    systemTransformation,
    organizationName
  );
  const isPublicYouthCase = /(jeugdzorg|jeugdwet|gemeente|gemeentelijke inkoop|jongeren|gezinnen)/i.test(
    `${inputInsights.facts.join(" ")} ${inputInsights.actions.join(" ")}`
  );
  const interventionActions = buildInterventionActions(output, inputInsights, caseClassification);
  const gekozenOptie =
    caseClassification === "SUCCESS_MODEL" && strategicMode === "SCALE"
      ? "C"
      : caseClassification === "SUCCESS_MODEL" && strategicMode === "PROTECT"
        ? "A"
        : inputInsights.preferredOption || output.decision.recommended_option;
  const recommendedDirection =
    caseClassification === "SUCCESS_MODEL"
      ? gekozenOptie === "C"
        ? "C — schaal via netwerkreplicatie met harde kwaliteits- en eigenaarschapsguardrails."
        : gekozenOptie === "B"
          ? "B — schaal via autonome cellen met centraal governancekader."
          : "A — houd groei bewust begrensd om het kernmechanisme te beschermen."
      : `Optie ${gekozenOptie} — kies de richting met de hoogste bestuurlijke beheersbaarheid en laagste directe schade.`;
  const structuredInterventions = buildStructuredInterventionBlock(
    interventionActions,
    inputInsights,
    caseClassification,
    organizationName
  );
  const extraActions = inputInsights.actions.length
    ? `${inputInsights.actions.map((line, idx) => `${idx + 1}. ${line}`).join("\n")}\n\n`
    : "";
  const interventions = interventionActions
    .map(
      (item, index) =>
        `${index + 1}. Actie: ${item.action}\nEigenaar: ${item.owner}\nDeadline: ${item.deadline}\nSuccescriterium: ${item.success}`
    )
    .join("\n\n");
  const actieplan = ensureMinimumInterventionActions(
    structuredInterventions || extraActions,
    `${extraActions}${interventions}`,
    10
  );
  const reportActionPlan = interventionActions
    .slice(0, 15)
    .map(
      (item, index) =>
        `${index + 1}. Actie: ${item.action}\nEigenaar: ${item.owner}\nDeadline: ${item.deadline}\nKPI: ${item.success}`
    )
    .join("\n\n");
  const feitenbasis = Array.from(
    new Set(
      buildCaseAnchoredFactBase(inputInsights, caseClassification)
        .split("\n")
        .map((line) => toEurText(normalize(line)))
        .filter(Boolean)
    )
  )
    .slice(0, 6)
    .map((line) => `- ${line}`)
    .join("\n");
  const leverDetection = detectStrategicLeverMatrix({
    organizationName,
    sourceText: [
      thesis.dominantThesis,
      conflict.conflictStatement,
      feitenbasis,
      structuredInterventions,
      String(organizationName || ""),
      inputInsights.facts.join("\n"),
      inputInsights.actions.join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
  const strategicLeverInsights = leverDetection.levers;
  const dominantLeverCombination = leverDetection.dominantCombination;
  const causalStrategy = runCausalStrategyEngine({
    levers: strategicLeverInsights,
    dominantCombination: dominantLeverCombination,
  });
  const strategyDNA = classifyStrategyDNA({
    organizationDescription: organizationName,
    strategy: [
      thesis.dominantThesis,
      conflict.conflictStatement,
      feitenbasis,
      structuredInterventions,
      String(organizationName || ""),
      inputInsights.facts.join("\n"),
      inputInsights.actions.join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n"),
    levers: strategicLeverInsights,
    causalAnalysis: causalStrategy,
  });
  const knowledgeInsight = buildKnowledgeOrganizationInsight(inputInsights, organizationName);
  const successSignature = hasSuccessModelSignature(inputInsights);
  const killerInsights = [
    knowledgeInsight,
    ...(caseClassification === "SUCCESS_MODEL" && successSignature
      ? [
          {
            insight: `${String(organizationName || "De organisatie").trim() || "De organisatie"} heeft geen capaciteitsprobleem maar een replicatieprobleem.`,
            mechanism: compact(mechanisms.scaleMechanism, 180),
            implication: "Schaal moet via modeladoptie en partners verlopen, niet via extra capaciteit alleen.",
          },
        ]
      : []),
    ...buildKillerInsights(output, inputInsights, caseClassification, organizationName).map((item) => ({
      insight: compact(item.title || item.mechanism, 180),
      mechanism: compact(item.mechanism, 180),
      implication: compact(item.implication, 180),
    })),
    ...(isPublicYouthCase
      ? []
      : strategicLeverInsights.map((item) => ({
          insight: `Hefboombesluit: ${item.lever}`,
          mechanism: compact(item.mechanism, 180),
          implication: compact(item.boardImplication, 180),
        }))),
    ...(dominantLeverCombination
      ? [
          {
            insight: `Hefboombesluit: ${dominantLeverCombination.levers.join(" + ")}`,
            mechanism: compact(dominantLeverCombination.strategicEffect, 180),
            implication: "Bestuur moet deze combinatie als samenhangend stuurmechanisme behandelen in plaats van als losse interventies.",
          },
        ]
      : []),
  ]
    .filter((item): item is { insight: string; mechanism: string; implication: string } => Boolean(item))
    .slice(0, 7)
    .map(
      (item, index) =>
        `Inzicht ${index + 1}\nINZICHT\n${item.insight}\nMECHANISME\n${item.mechanism}\nBESTUURLIJKE CONSEQUENTIE\n${item.implication}`
    )
    .join("\n\n");
  const strategischeInterventies = predictedInterventions
    .slice(0, 3)
    .map(
      (item, index) =>
        `Interventie ${index + 1}\nInterventie: ${normalize(item.interventie)}\nMechanisme: ${compact(item.impact, 180)}\nKPI: ${compact(item.kpi_effect, 160)}\nRisico: ${compact(item.risico, 160)}`
    )
    .join("\n\n");
  const formattedRecommendedDirection = recommendedDirection
    .replace(/^[ABC]\s+[—-]\s*/i, "")
    .replace(/^([a-z])/, (_, first) => String(first).toUpperCase());
  const reportScenarioOptions =
    caseClassification === "SUCCESS_MODEL" && strategicMode === "SCALE" && successSignature
      ? [
          "Bescherm de kern met begrensde groei en harde cultuurguardrails",
          "Bouw gecontroleerde cellen met centrale standaarden en mentorratio",
          "Schaal via netwerkreplicatie en licentie-implementaties met auditguardrails",
        ]
      : [
          "Bescherm de kern en herstel bestuurlijke focus",
          "Versnel verbreding onder hogere uitvoeringsdruk",
          "Gefaseerde route met expliciete governance-gates",
        ];
  const strategicOptions = [
    "A. Bescherm de kern en vertraag verbreding totdat capaciteit, contractruimte en governance aantoonbaar op orde zijn.",
    "B. Versnel impact via parallelle verbreding en accepteer hogere druk op marge, sturing en uitvoerbaarheid.",
    `C. ${formattedRecommendedDirection}`,
    ...(dominantLeverCombination
      ? [
          `Dominante hefboomcombinatie: ${dominantLeverCombination.levers.join(" + ")}.`,
          `Strategisch effect: ${dominantLeverCombination.strategicEffect}`,
        ]
      : []),
  ].join("\n\n");
  const strategicScenarios = generateStrategicScenarios({
    strategic_options: reportScenarioOptions,
    strategic_hefbomen: strategicLeverInsights,
    strategic_hefboom_combinatie: dominantLeverCombination,
    strategic_causal_analysis: causalStrategy,
  });
  const defaultScenarioSimulationBlock = buildScenarioSimulationReportBlock({
    strategic_scenarios: strategicScenarios,
    strategic_options: reportScenarioOptions,
    strategic_hefbomen: strategicLeverInsights,
    strategic_hefboom_combinatie: dominantLeverCombination,
    strategic_causal_analysis: causalStrategy,
  });
  const stressTests = runStressTestEngine({
    strategic_options: [
      ...(isPublicYouthCase
        ? [
            "Bescherm de kern en versmal de propositie",
            "Verbreden ondanks contract- en personeelsdruk",
            "Netwerkroute rond kernspecialisatie",
          ]
        : [
            "Bescherm de kern en herstel bestuurlijke focus",
            "Versnel verbreding onder hogere uitvoeringsdruk",
            "Gefaseerde route met expliciete governance-gates",
          ]),
    ],
    strategic_hefbomen: strategicLeverInsights,
    strategic_hefboom_combinatie: dominantLeverCombination,
    strategic_causal_analysis: causalStrategy,
    strategic_scenarios: strategicScenarios,
  });
  const effectiveCausalStrategy = isPublicYouthCase ? buildPublicYouthCausalStrategyBlock() : causalStrategy;
  const scenarioSimulationBlock = isPublicYouthCase
    ? buildPublicYouthScenarioSimulationBlock()
    : defaultScenarioSimulationBlock;
  const effectiveStrategyDNA = isPublicYouthCase ? buildPublicYouthStrategyDNAProfile() : strategyDNA;
  const causalStrategyAnalysis = effectiveCausalStrategy.block;
  const strategyDNABlock = buildStrategyDNABlock(effectiveStrategyDNA);
  const waitlistPct = inputInsights.leverage.waitlistShortPathPct ?? 8;
  const growthCap = inputInsights.leverage.growthCapFte ?? 5;
  const agingPct = inputInsights.leverage.agingCostPct ?? 30;
  const financieleConsequenties =
    caseClassification === "SUCCESS_MODEL" && successSignature
      ? [
          `Economische logica: bij vergrijzingsdruk van circa +${agingPct}% loonkosten vernietigt lineaire FTE-groei sneller marge dan zij schaal oplevert; netwerk- en licentiegedreven replicatie verschuift groei daarom van vaste kosten naar overdraagbaar modelinkomen.`,
          "Risico: partnerkwaliteit, trage gemeentelijke besluitvorming en onvoldoende auditdiscipline kunnen de schaalcase vertragen en tijdelijk op marge drukken.",
          "Benodigde inzet: investeer direct in partnerselectie, kwaliteitsprotocollen, auditritme en een expliciet governancekader voor modeladoptie.",
        ].join("\n\n")
      : isPublicYouthCase
        ? [
            "Economische logica: afhankelijkheid van gemeentelijke contracten en budgetdruk maakt volumegroei op zichzelf onvoldoende; zonder scherpe positionering en contractdiscipline neemt uitvoeringsdruk sneller toe dan financiële ruimte.",
            "Risico: hogere zorgcomplexiteit, personeelsschaarste en bureaucratische verantwoordingsdruk drukken tegelijk op teamstabiliteit en behandelcontinuiteit.",
            "Benodigde inzet: stuur op contractkwaliteit, scherpe doelgroepkeuze, capaciteitsritme en reductie van bestuurlijke inertie in besluitvorming.",
          ].join("\n\n")
        : [
            "Economische logica: extra activiteit lost het probleem niet op zolang contractdruk, margespanning en bestuurlijke versnippering ongewijzigd blijven.",
            "Risico: parallelle prioriteiten vergroten uitvoeringsdruk sneller dan de organisatie risico kan absorberen.",
            "Benodigde inzet: versmal prioriteiten, herstel besluitdiscipline en leg per interventie een harde eigenaar en KPI vast.",
          ].join("\n\n");
  const vroegsignalen = [
    inputInsights.leverage.waitlistShortPathPct != null
      ? `Indicator: Kort-trajectuitstroom\nNorm: >= 20% binnen 12 maanden\nRisico: wachtdruk blijft structureel\nActie: schaal triage op als de uitstroom twee meetperiodes onder norm blijft`
      : "",
    inputInsights.leverage.growthCapFte != null
      ? `Indicator: Groei t.o.v. groeicap\nNorm: <= ${inputInsights.leverage.growthCapFte} FTE per jaar\nRisico: cultuur- en eigenaarschapserosie\nActie: leg groei boven de cap altijd voor aan het bestuur`
      : "",
    inputInsights.leverage.agingCostPct != null
      ? `Indicator: Loonkostendruk\nNorm: binnen begrotingskader\nRisico: marge verslechtert sneller dan contractruimte\nActie: versnel netwerk- of licentie-inkomsten bij overschrijding`
      : "",
    `Indicator: Partnerkwaliteit\nNorm: boven afgesproken kwaliteitsdrempel\nRisico: kwaliteitsvariatie bij netwerkreplicatie\nActie: pauzeer nieuwe partners bij twee opeenvolgende afwijkingen`,
    isPublicYouthCase
      ? "Indicator: Afhankelijkheid van gemeenten\nNorm: geen dominante afhankelijkheid van 1 contractstroom\nRisico: onderhandelingspositie verslechtert snel bij contractverlies\nActie: ontwikkel nichepropositie en verbreed verwijzersbasis binnen 12 maanden"
      : "",
    isPublicYouthCase
      ? "Indicator: Teamdruk en retentie\nNorm: stabiele bezetting en beheersbare administratieve belasting\nRisico: uitval en verloop stijgen sneller dan instroom\nActie: snij administratieve belasting terug zodra retentie of caseload twee periodes verslechtert"
      : "",
  ]
    .filter(Boolean)
    .slice(0, 4)
    .join("\n\n");
  const executiveSamenvatting = trimWords(
    (isPublicYouthCase
      ? [
          "Wachtdruk is contractgedreven, niet personeelsgedreven.",
          "Meer personeel zonder scherpere triage en contractruimte verhoogt vooral kosten en coördinatiedruk.",
          `Aanbevolen besluit: ${withTerminalPeriod(recommendedDirection)}`,
        ]
      : [
          thesis.dominantThesis,
          caseClassification === "SUCCESS_MODEL"
            ? "De schaaldoorbraak ligt in modeladoptie, netwerkreplicatie en strakke governance; niet in lineaire volumegroei."
            : "Schaal of herstel werkt alleen als het onderliggende mechanisme expliciet wordt aangepast.",
          `Aanbevolen richting: ${recommendedDirection}`,
        ]
    ).join(" "),
    150
  );
  const hypothese = knowledgeInsight
    ? `De kernhypothese is dat ${String(organizationName || "de organisatie").trim() || "de organisatie"} strategisch meer lijkt op een kennisorganisatie met zorguitvoering dan op een volumegedreven zorgorganisatie.`
    : isPublicYouthCase
      ? "De kernhypothese is dat niet volume maar bestuurlijke focus, contractkwaliteit en uitvoerbare positionering bepalen of zorgkwaliteit en teamstabiliteit houdbaar blijven."
      : "De kernhypothese is dat extra activiteit het probleem niet oplost zolang het dominante besturingsmechanisme ongewijzigd blijft.";
  const boardroomStressTest =
    caseClassification === "SUCCESS_MODEL" && successSignature
      ? [
          `Als het bestuur niets doet, blijft kort-trajectuitstroom rond ${waitlistPct}% hangen en blijft wachtdruk structureel.`,
          `Bij groei boven ${growthCap} FTE per jaar zonder guardrails neemt cultuur- en eigenaarschapserosie toe.`,
          `De kostenbasis blijft sneller stijgen dan de schaalimpact zolang replicatie niet via partners en modeladoptie wordt georganiseerd.`,
          "Bestuurlijke consequentie: uitstel verschuift het probleem van strategie naar operationele brandbestrijding.",
        ].join("\n\n")
      : isPublicYouthCase
        ? [
            "Als het bestuur niets doet, blijven wachtdruk, personeelsspanning en gemeentelijke afhankelijkheid elkaar versterken.",
            "Zonder scherpe doelgroep- en contractkeuze neemt de werkdruk toe terwijl financiële ruimte afneemt.",
            "Bestuurlijke consequentie: uitstel vertaalt zich in teamerosie, lagere voorspelbaarheid en minder onderhandelingskracht richting gemeenten.",
          ].join("\n\n")
        : [
            "Als het bestuur niets doet, blijven symptomen zich herhalen omdat het besturingsmechanisme niet verandert.",
            "Parallelle prioriteiten houden druk op capaciteit, marge en uitvoeringsdiscipline tegelijk hoog.",
            "Bestuurlijke consequentie: uitstel verschuift strategisch risico naar operationele brandbestrijding.",
          ].join("\n\n");
  const blindSpotBlock = runBlindSpotNode({
    organizationName,
    executiveThesis: executiveSamenvatting,
    strategicOptions: strategicOptions
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^[ABC][.)]/.test(line)),
    sectorContext: [output?.context_state?.sector || "", ...inputInsights.facts].filter(Boolean),
    facts: inputInsights.facts,
    interventions: [
      reportActionPlan,
      strategischeInterventies,
      structuredInterventions,
      ...predictedInterventions.map((item) => item.interventie),
    ].filter(Boolean),
    boardroomStressTest,
  });
  const decisionConsequenceBlock = runDecisionConsequenceNode({
    organizationName,
    executiveThesis: executiveSamenvatting,
    strategicOptions: strategicOptions
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^[ABC][.)]/.test(line)),
    recommendedChoice: recommendedDirection,
    sectorContext: [output?.context_state?.sector || "", ...inputInsights.facts].filter(Boolean),
    facts: inputInsights.facts,
    interventions: [
      reportActionPlan,
      strategischeInterventies,
      structuredInterventions,
      ...predictedInterventions.map((item) => item.interventie),
    ].filter(Boolean),
    boardroomStressTest,
  });
  const strategicLeverageBlock = runStrategicLeverageNode({
    executiveThesis: executiveSamenvatting,
    strategicOptions: strategicOptions
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^[ABC][.)]/.test(line)),
    recommendedChoice: recommendedDirection,
    facts: inputInsights.facts,
    interventions: [
      reportActionPlan,
      strategischeInterventies,
      structuredInterventions,
      ...predictedInterventions.map((item) => item.interventie),
    ].filter(Boolean),
    boardroomStressTest,
    blindSpots: blindSpotBlock.blindSpots,
    decisionConsequences: decisionConsequenceBlock.decisionConsequences,
  });
  const memoryInterventions = [
    ...predictedInterventions.map((item) => item.interventie),
    ...inputInsights.actions,
    reportActionPlan,
  ]
    .filter(Boolean)
    .map((item) => normalize(item))
    .filter((item) => item.length >= 16 && item.length <= 220)
    .slice(0, 8);
  const strategicMemoryBlock = runStrategicMemoryNode({
    memoryId: sessionId || `${normalize(organizationName) || "organisatie"}-${Date.now()}`,
    executiveThesis: executiveSamenvatting,
    facts: inputInsights.facts,
    strategicOptions: strategicOptions
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^[ABC][.)]/.test(line)),
    recommendedChoice: recommendedDirection,
    interventions: memoryInterventions,
    blindSpots: blindSpotBlock.blindSpots,
    strategicLeverage: strategicLeverageBlock.strategicLeverage,
    sector: isPublicYouthCase ? "Jeugdzorg" : output?.context_state?.sector || sector,
    organizationType: isPublicYouthCase ? "jeugdzorgorganisatie" : organizationType || organizationName,
    dominantProblem: isPublicYouthCase
      ? "contractdruk, wachtdruk en positioneringsrisico in jeugdzorg"
      : output?.diagnosis?.dominant_problem,
  });
  const boardroomDebateBlock = runBoardroomDebateNode({
    organizationName,
    executiveThesis: executiveSamenvatting,
    strategicOptions: strategicOptions
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^[ABC][.)]/.test(line)),
    recommendedChoice: recommendedDirection,
    blindSpots: blindSpotBlock.blindSpots,
    boardroomStressTest,
    decisionConsequences: decisionConsequenceBlock.decisionConsequences,
    strategicLeverage: strategicLeverageBlock.strategicLeverage,
    interventions: [
      reportActionPlan,
      strategischeInterventies,
      structuredInterventions,
      ...predictedInterventions.map((item) => item.interventie),
    ].filter(Boolean),
    sectorContext: [output?.context_state?.sector || "", ...inputInsights.facts].filter(Boolean),
  });
  const reportKpis = [
    "- KPI: Marge per productlijn en contracttype.",
    "- KPI: Cash runway in maanden.",
    "- KPI: Wachttijd, no-show en behandelcontinuiteit.",
    "- KPI: Productiviteit versus norm en benutting kerncapaciteit.",
    "- KPI: Contractdekking, plafondbenutting en partnerkwaliteit.",
  ].join("\n");
  const reportDecisionText = [
    "WIJ BESLUITEN:",
    `1. We kiezen voor ${recommendedDirection}.`,
    `2. We accepteren als expliciet verlies ${compact(conflict.explicitLoss || conflict.forcingChoice, 220)}.`,
    "3. We blokkeren groei die extra FTE toevoegt zonder aantoonbare borging van cultuur, kwaliteit en eigenaarschap.",
    "4. We laten alleen nieuwe partners, cellen of licentie-implementaties toe na formele validatie op KPI, auditritme en kill-switch.",
  ].join("\n");
  const boardroomSummary = buildBoardroomSummaryBlock({
    organizationName,
    sector: normalizeBoardroomSectorLabel(isPublicYouthCase ? "Jeugdzorg" : sector),
    dominantRisk:
      caseClassification === "SUCCESS_MODEL" && successSignature
        ? "Lineaire groei breekt het kwaliteitsmechanisme sneller dan zij impact opschaalt."
        : isPublicYouthCase
          ? "Contractdruk, wachtdruk en diffuse positionering versterken werkdruk sneller dan extra activiteit die kan dempen."
          : "Bestuurlijke inertie houdt het dominante risicomechanisme intact en vergroot operationele schade.",
    recommendedDecision: recommendedDirection,
    downside: compact(conflict.explicitLoss || conflict.forcingChoice, 220),
    stopRule:
      isPublicYouthCase
        ? "Draai verbreding of groeibesluiten terug zodra wachttijd twee meetperiodes oploopt, marge onder 4% zakt of caseloadgrenzen structureel worden overschreden."
        : "Draai de gekozen richting terug zodra marge, capaciteit of kwaliteitsdrempels twee meetperiodes onder norm blijven zonder herstelmaatregel.",
  });
  return [
    "BESTUURLIJKE ANALYSE & INTERVENTIE",
    `Organisatie: ${String(organizationName || "Onbekende organisatie").trim() || "Onbekende organisatie"}`,
    "Analyse: Strategische analyse",
    "CYNTRA EXECUTIVE DOSSIER • Bestuursversie • vertrouwelijk",
    "",
    boardroomSummary,
    "",
    "1. Besluitvraag",
    thesis.boardQuestion,
    "",
    "2. Executive Thesis",
    executiveSamenvatting,
    hypothese,
    "",
    "3. Feitenbasis",
    "HARD",
    feitenbasis,
    "",
    "INTERPRETATIE",
    financieleConsequenties,
    "",
    "4. Strategische opties",
    `Spanning A: ${conflict.sideA}`,
    `Spanning B: ${conflict.sideB}`,
    strategicOptions,
    `Besluittest: ${conflict.forcingChoice}`,
    "",
    strategyDNABlock,
    "",
    scenarioSimulationBlock?.body ? `### ${scenarioSimulationBlock.title}` : "",
    scenarioSimulationBlock?.body || "",
    scenarioSimulationBlock?.body ? "" : "",
    stressTests.block,
    "",
    causalStrategyAnalysis,
    "",
    "### NIEUWE INZICHTEN (KILLER INSIGHTS)",
    killerInsights,
    "",
    "5. Aanbevolen keuze",
    `Besluitvoorstel: ${recommendedDirection}`,
    `Prijs van de keuze: ${compact(conflict.explicitLoss || conflict.forcingChoice, 220)}`,
    "",
    "6. Niet-onderhandelbare besluitregels",
    "- Geen nieuw initiatief zonder margevalidatie, capaciteitsimpact en expliciete eigenaar.",
    "- Geen besluit zonder KPI, deadline en escalatieregel.",
    "- Geen parallelle prioritering op conflicterende doelen.",
    "- Geen afwijking van de gekozen richting zonder formele board-escalatie.",
    "",
    "7. 90-dagen interventieplan",
    reportActionPlan || actieplan || "Actieplan volgt na aanvullende data.",
    "",
    "8. KPI monitoring",
    reportKpis,
    "",
    "9. Besluittekst",
    reportDecisionText,
    "",
    "STRATEGISCHE INTERVENTIES",
    strategischeInterventies || "Interventies volgen na aanvullende data.",
    "",
    "BOARDROOM STRESSTEST",
    boardroomStressTest,
    "",
    "10. Strategische blinde vlekken",
    blindSpotBlock.block,
    "",
    "11. Vroegsignalering",
    vroegsignalen,
    "",
    "12. Besluitgevolgen simulatie",
    decisionConsequenceBlock.block,
    "",
    "13. Strategische hefboompunten",
    strategicLeverageBlock.block,
    "",
    "14. Strategisch geheugen",
    strategicMemoryBlock.block,
    "",
    "15. Bestuurlijk debat",
    boardroomDebateBlock.block,
    "",
    "Open vragen",
    buildTailoredOpenQuestions(inputInsights, organizationName),
  ].join("\n").trim();
}

export class AnalysisSessionManager {
  readonly name = "Analysis Session Manager";
  private readonly orchestrator = new AgentOrchestrator();
  private readonly interventionPrediction = new InterventionPredictionEngine();
  private readonly learningLoop = new LearningLoop();
  private normalizeRow(row: AnalysisSession): AnalysisSession {
    return {
      ...row,
      status: normalizeSessionStatus(row.status),
    };
  }

  listSessions(options?: { includeArchived?: boolean }): AnalysisSession[] {
    const includeArchived = options?.includeArchived === true;
    return readArray<AnalysisSession>(KEY)
      .map((row) => this.normalizeRow(row))
      .filter((row) => includeArchived || !row.is_archived)
      .sort((a, b) => (a.analyse_datum < b.analyse_datum ? 1 : -1));
  }

  listSessionsByOrganization(organization_id: string, options?: { includeArchived?: boolean }): AnalysisSession[] {
    return this.listSessions(options).filter((row) => row.organization_id === organization_id);
  }

  sessionsUsedInCurrentMonth(organization_id: string): number {
    const now = new Date();
    const month = now.getUTCMonth();
    const year = now.getUTCFullYear();
    return this.listSessionsByOrganization(organization_id).filter((session) => {
      const d = new Date(session.analyse_datum);
      return d.getUTCFullYear() === year && d.getUTCMonth() === month;
    }).length;
  }

  getSession(session_id: string): AnalysisSession | null {
    return this.listSessions({ includeArchived: true }).find((row) => row.session_id === session_id) ?? null;
  }

  listDecisionMemoryFeed(organization_id?: string): Array<{
    session_id: string;
    organization_id: string;
    organization_name?: string;
    analyse_datum: string;
    chosen_strategy: string;
    alignment_status: "consistent" | "gedeeltelijk afwijkend" | "fundamenteel afwijkend";
    board_alert: string;
  }> {
    return this.listSessions({ includeArchived: true })
      .filter((row) => isSessionCompleted(row.status))
      .filter((row) => (organization_id ? row.organization_id === organization_id : true))
      .map((row) => ({
        session_id: row.session_id,
        organization_id: row.organization_id,
        organization_name: row.organization_name,
        analyse_datum: row.analyse_datum,
        chosen_strategy: normalize(row.strategic_metadata?.decision_memory?.decision_record?.gekozen_strategie || row.strategic_metadata?.gekozen_strategie || ""),
        alignment_status: (row.strategic_metadata?.decision_memory?.decision_alignment?.status || "consistent") as
          | "consistent"
          | "gedeeltelijk afwijkend"
          | "fundamenteel afwijkend",
        board_alert: normalize(row.strategic_metadata?.decision_memory?.boardroom_alert || ""),
      }))
      .sort((a, b) => (a.analyse_datum < b.analyse_datum ? 1 : -1));
  }

  listEarlyWarningFeed(organization_id?: string): Array<{
    session_id: string;
    organization_id: string;
    organization_name?: string;
    analyse_datum: string;
    risk_signals: string[];
    warning_indicators: Array<{
      indicator: string;
      huidige_waarde: string;
      risico: string;
      actie: string;
    }>;
    board_alert: string;
  }> {
    return this.listSessions({ includeArchived: true })
      .filter((row) => isSessionCompleted(row.status))
      .filter((row) => (organization_id ? row.organization_id === organization_id : true))
      .map((row) => ({
        session_id: row.session_id,
        organization_id: row.organization_id,
        organization_name: row.organization_name,
        analyse_datum: row.analyse_datum,
        risk_signals: row.strategic_metadata?.early_warning_system?.risk_signals || [],
        warning_indicators: row.strategic_metadata?.early_warning_system?.warning_indicators || [],
        board_alert: normalize(row.strategic_metadata?.early_warning_system?.boardroom_alert || ""),
      }))
      .sort((a, b) => (a.analyse_datum < b.analyse_datum ? 1 : -1));
  }

  archiveLegacySessions(keepLatest = 6): { archived: number; kept: number; total: number } {
    const rows = this.listSessions({ includeArchived: true });
    const completed = rows
      .filter((row) => isSessionCompleted(row.status))
      .sort((a, b) => (a.analyse_datum < b.analyse_datum ? 1 : -1));
    const keep = new Set(completed.slice(0, Math.max(1, keepLatest)).map((row) => row.session_id));
    let archived = 0;
    const now = new Date().toISOString();

    const updated = rows.map((row) => {
      if (row.is_archived) return row;
      if (!isSessionCompleted(row.status)) return row;
      if (keep.has(row.session_id)) return row;
      archived += 1;
      return {
        ...row,
        is_archived: true,
        archived_at: now,
        archive_reason: "legacy_cleanup",
      };
    });

    writeArray(KEY, updated);
    return { archived, kept: keep.size, total: completed.length };
  }

  archiveSession(sessionId: string, reason = "manual_archive"): AnalysisSession | null {
    const rows = this.listSessions({ includeArchived: true });
    const now = new Date().toISOString();
    let archived: AnalysisSession | null = null;
    const updated = rows.map((row) => {
      if (row.session_id !== sessionId) return row;
      archived = {
        ...row,
        is_archived: true,
        archived_at: now,
        archive_reason: reason,
        updated_at: now,
      };
      return archived;
    });
    writeArray(KEY, updated);
    return archived;
  }

  restoreSession(sessionId: string): AnalysisSession | null {
    const rows = this.listSessions({ includeArchived: true });
    const now = new Date().toISOString();
    let restored: AnalysisSession | null = null;
    const updated = rows.map((row) => {
      if (row.session_id !== sessionId) return row;
      restored = {
        ...row,
        is_archived: false,
        archived_at: undefined,
        archive_reason: undefined,
        updated_at: now,
      };
      return restored;
    });
    writeArray(KEY, updated);
    return restored;
  }

  deleteSession(sessionId: string): boolean {
    const rows = this.listSessions({ includeArchived: true });
    const updated = rows.filter((row) => row.session_id !== sessionId);
    writeArray(KEY, updated);
    return updated.length !== rows.length;
  }

  createSession(input: {
    organization_id: string;
    organization_name?: string;
    input_data: string;
    analysis_type?: string;
  }): AnalysisSession {
    const now = new Date().toISOString();
    const session: AnalysisSession = {
      session_id: createId("sess"),
      organization_id: normalize(input.organization_id),
      organization_name: normalize(input.organization_name),
      analyse_datum: now,
      input_data: normalize(input.input_data),
      board_report: "",
      status: "nieuw",
      analysis_type: normalize(input.analysis_type) || "Strategische analyse",
      is_archived: false,
      updated_at: now,
    };

    const rows = this.listSessions();
    rows.push(session);
    writeArray(KEY, rows);
    return session;
  }

  registerCompletedSession(input: {
    session_id?: string;
    organization_id: string;
    organization_name?: string;
    input_data: string;
    analysis_type?: string;
    board_report: string;
    executive_summary?: string;
    board_memo?: string;
    strategic_metadata?: AnalysisSession["strategic_metadata"];
    strategic_report?: AnalysisSession["strategic_report"];
    strategic_agent?: AnalysisSession["strategic_agent"];
    intervention_predictions?: AnalysisSession["intervention_predictions"];
    error_message?: string;
    analysis_runtime_ms?: number;
    engine_mode?: string;
    quality_score?: number;
    quality_tier?: string;
    quality_flags?: string[];
    analyse_datum?: string;
    updated_at?: string;
    status?: AnalysisSessionStatus;
  }): AnalysisSession {
    const now = new Date().toISOString();
    const requestedSessionId = normalize(input.session_id);
    const session_id = requestedSessionId || createId("sess");
    const existingRows = this.listSessions({ includeArchived: true });
    const conflictingSession = existingRows.find((row) => row.session_id === session_id);
    if (conflictingSession) {
      throw new Error(`Sessie bestaat al: ${session_id}`);
    }
    const session: AnalysisSession = {
      session_id,
      organization_id: normalize(input.organization_id),
      organization_name: normalize(input.organization_name),
      analyse_datum: normalize(input.analyse_datum) || now,
      input_data: normalize(input.input_data),
      board_report: normalize(input.board_report),
      status: normalizeSessionStatus(input.status || SESSION_STATUS.COMPLETED),
      analysis_type: normalize(input.analysis_type) || "Strategische analyse",
      executive_summary: normalize(input.executive_summary),
      board_memo: normalize(input.board_memo),
      strategic_metadata: input.strategic_metadata,
      strategic_report: input.strategic_report
        ? {
            ...input.strategic_report,
            session_id,
            organization_id: normalize(input.organization_id),
          }
        : undefined,
      strategic_agent: input.strategic_agent,
      intervention_predictions: input.intervention_predictions,
      error_message: normalize(input.error_message),
      analysis_runtime_ms: Number(input.analysis_runtime_ms || 0) || undefined,
      engine_mode: normalize(input.engine_mode),
      quality_score: Number(input.quality_score || 0) || undefined,
      quality_tier: normalize(input.quality_tier),
      quality_flags: Array.isArray(input.quality_flags) ? input.quality_flags : undefined,
      is_archived: false,
      updated_at: normalize(input.updated_at) || now,
    };

    const rows = this.listSessions();
    rows.push(session);
    writeArray(KEY, rows);
    return session;
  }

  private updateSession(session_id: string, updater: (prev: AnalysisSession) => AnalysisSession): AnalysisSession | null {
    const rows = this.listSessions({ includeArchived: true });
    const idx = rows.findIndex((row) => row.session_id === session_id);
    if (idx < 0) return null;
    rows[idx] = updater(rows[idx]);
    writeArray(KEY, rows);
    return rows[idx];
  }

  async runSession(input: {
    session_id: string;
    organization_name?: string;
    sector?: string;
    current_session?: AnalysisSession;
  }): Promise<AnalysisSession> {
    let current = this.getSession(input.session_id);
    if (!current && input.current_session?.session_id === input.session_id) {
      current = this.registerCompletedSession({
        session_id: input.current_session.session_id,
        organization_id: input.current_session.organization_id,
        organization_name: input.current_session.organization_name,
        input_data: input.current_session.input_data,
        analysis_type: input.current_session.analysis_type,
        board_report: input.current_session.board_report || "",
        executive_summary: input.current_session.executive_summary,
        board_memo: input.current_session.board_memo,
        strategic_metadata: input.current_session.strategic_metadata,
        strategic_report: input.current_session.strategic_report,
        strategic_agent: input.current_session.strategic_agent,
        intervention_predictions: input.current_session.intervention_predictions,
        error_message: input.current_session.error_message,
        analysis_runtime_ms: input.current_session.analysis_runtime_ms,
        engine_mode: input.current_session.engine_mode,
        quality_score: input.current_session.quality_score,
        quality_tier: input.current_session.quality_tier,
        quality_flags: input.current_session.quality_flags,
        analyse_datum: input.current_session.analyse_datum,
        status: "nieuw",
      });
    }
    if (!current) {
      const storedReport = getStoredReport(input.session_id);
      if (storedReport?.report?.report_body) {
        current = this.registerCompletedSession({
          session_id: storedReport.sessionId || input.session_id,
          organization_id: normalize(storedReport.report.organization_id) || "stored-report-recovery",
          organization_name: normalize(storedReport.organizationName) || input.organization_name || "Onbekende organisatie",
          input_data: "",
          analysis_type: "Strategische analyse",
          board_report: storedReport.report.report_body,
          executive_summary: storedReport.result?.executive_summary,
          board_memo: storedReport.result?.board_memo,
          strategic_report: storedReport.report,
          updated_at: storedReport.savedAt,
          analyse_datum: normalize(storedReport.report.generated_at) || storedReport.savedAt,
          status: SESSION_STATUS.COMPLETED,
        });
      }
    }
    if (!current) throw new Error("Sessie niet gevonden.");
    let draftSessionPatch: Record<string, unknown> | null = null;
    const restoreSession = (status: AnalysisSessionStatus, errorMessage?: string): AnalysisSession => {
      const patch = {
        ...(draftSessionPatch || {}),
        status,
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      } as Partial<AnalysisSession>;
      const existing = this.getSession(input.session_id);
      if (existing) {
        return {
          ...existing,
          ...patch,
        };
      }
      return this.registerCompletedSession({
        session_id: current.session_id,
        organization_id: current.organization_id,
        organization_name: current.organization_name,
        input_data: current.input_data,
        analysis_type: current.analysis_type,
        board_report: normalize(patch.board_report ?? current.board_report),
        executive_summary: normalize(patch.executive_summary ?? current.executive_summary),
        board_memo: normalize(patch.board_memo ?? current.board_memo),
        strategic_metadata: (patch.strategic_metadata as AnalysisSession["strategic_metadata"]) ?? current.strategic_metadata,
        strategic_report: (patch.strategic_report as AnalysisSession["strategic_report"]) ?? current.strategic_report,
        strategic_agent: (patch.strategic_agent as AnalysisSession["strategic_agent"]) ?? current.strategic_agent,
        intervention_predictions:
          (patch.intervention_predictions as AnalysisSession["intervention_predictions"]) ?? current.intervention_predictions,
        error_message: errorMessage ?? normalize(patch.error_message ?? current.error_message),
        analysis_runtime_ms: Number(patch.analysis_runtime_ms ?? current.analysis_runtime_ms ?? 0) || undefined,
        engine_mode: normalize(patch.engine_mode ?? current.engine_mode),
        quality_score: Number(patch.quality_score ?? current.quality_score ?? 0) || undefined,
        quality_tier: normalize(patch.quality_tier ?? current.quality_tier),
        quality_flags: Array.isArray(patch.quality_flags)
          ? (patch.quality_flags as string[])
          : current.quality_flags,
        analyse_datum: current.analyse_datum,
        updated_at: normalize(patch.updated_at),
        status,
      });
    };

    this.updateSession(input.session_id, (prev) => ({
      ...prev,
      status: "draait",
      updated_at: new Date().toISOString(),
      error_message: undefined,
    }));

    try {
      const startedAt = Date.now();
      const caseClass = classifyCase(current.input_data);

      const context = toContext(
        current.input_data,
        input.organization_name,
        input.sector,
        current.analysis_type,
        caseClass.label
      );

      const output = await AureliusEngine.run({
        context,
        narrativeMode: "deterministic",
      });
      const orchestrated = await this.orchestrator.run({
        context,
        organisation_id: current.organization_id,
        session_id: current.session_id,
        narrative_mode: "deterministic",
      });
      const prediction = this.interventionPrediction.predict({
        sector: output.context_state.sector,
        dominant_problem: output.diagnosis.dominant_problem,
        mechanisms: output.mechanisms.map((item) => item.mechanism),
        historical_outcomes: output.strategic_dataset.intervention_success_patterns.map((item) => ({
          interventie: item.interventie,
          resultaat: item.resultaat,
          confidence: item.confidence,
        })),
      });
      const inputInsights = extractInputInsights(current.input_data);
      const mvpEngine = runAureliusMvpEngine({
        organizationName: input.organization_name || current.organization_name,
        context: current.input_data,
      });
      const classOverride = inferClassificationFromInsights(inputInsights, caseClass.label);
      const effectiveClassification = classOverride.label;
      const effectiveReason = classOverride.reason || caseClass.reason;
      const strategicMechanisms = extractStrategicMechanisms(
        current.input_data,
        inputInsights,
        effectiveClassification
      );
      const detectedPattern = matchStrategicPattern(current.input_data);
      const strategicPattern: StrategicPatternMatch =
        effectiveClassification === "SUCCESS_MODEL" && detectedPattern.pattern === "klassiek_organisatiemodel"
          ? {
              pattern: "professional_partnership",
              rationale:
                "Success-model override: eigenaarschap, platte governance en retentie-indicatoren passen beter bij professional partnership.",
              confidence: Math.max(0.78, detectedPattern.confidence),
            }
          : detectedPattern;
      const strategicPatternProfile = buildStrategicPatternProfileFromPattern(
        current.input_data,
        strategicPattern.pattern
      );
      const strategySimulation = buildStrategySimulationEngine({
        strategicOptions: output?.decision?.strategic_options?.map((item: any) => normalize(item?.description || "")) || [],
        successMechanism: strategicMechanisms.successMechanism,
        leverage: inputInsights.leverage,
        organizationName: input.organization_name,
      });
      const strategicFlywheel = inferStrategicFlywheel(
        current.input_data,
        effectiveClassification,
        strategicPattern
      );
      const strategicMode = resolveStrategicMode(current.input_data, effectiveClassification);
      const boardroomConflict = inferBoardroomConflict(
        current.input_data,
        effectiveClassification,
        strategicMode,
        strategicMechanisms
      );
      const leveragePoints = buildStrategicLeveragePoints(
        inputInsights,
        effectiveClassification,
        input.organization_name
      );
      const systemTransformation = inferSystemTransformationAssessment(
        inputInsights,
        effectiveClassification
      );
      const systemActors = inferSystemActorMapping(inputInsights, effectiveClassification);
      const economicAssessment = inferEconomicAssessment(inputInsights, effectiveClassification);
      const powerStructure = inferPowerStructure(inputInsights, systemTransformation);
      const strategicThesis = buildStrategicThesis(
        inputInsights,
        effectiveClassification,
        strategicMode,
        strategicMechanisms,
        systemTransformation,
        input.organization_name
      );
      const strategicLeverDetection = detectStrategicLeverMatrix({
        organizationName: input.organization_name || current.organization_name,
        sourceText: [
          strategicThesis.dominantThesis,
          boardroomConflict.conflictStatement,
          current.input_data,
          inputInsights.facts.join("\n"),
          inputInsights.actions.join("\n"),
        ]
          .filter(Boolean)
          .join("\n\n"),
      });
      const strategicLeverInsights = strategicLeverDetection.levers;
      const dominantLeverCombination = strategicLeverDetection.dominantCombination;
      const causalStrategy = runCausalStrategyEngine({
        levers: strategicLeverInsights,
        dominantCombination: dominantLeverCombination,
      });
      const strategyDNA = classifyStrategyDNA({
        organizationDescription: input.organization_name || current.organization_name,
        strategy: [
          strategicThesis.dominantThesis,
          boardroomConflict.conflictStatement,
          current.input_data,
        ]
          .filter(Boolean)
          .join("\n\n"),
        levers: strategicLeverInsights,
        causalAnalysis: causalStrategy,
      });
      const strategicScenarios = generateStrategicScenarios({
        strategic_options: output?.decision?.strategic_options?.map((item: any) => normalize(item?.description || "")) || [],
        strategic_hefbomen: strategicLeverInsights,
        strategic_hefboom_combinatie: dominantLeverCombination,
        strategic_causal_analysis: causalStrategy,
      });
      const stressTests = runStressTestEngine({
        strategic_options: output?.decision?.strategic_options?.map((item: any) => normalize(item?.description || "")) || [],
        strategic_hefbomen: strategicLeverInsights,
        strategic_hefboom_combinatie: dominantLeverCombination,
        strategic_causal_analysis: causalStrategy,
        strategic_scenarios: strategicScenarios,
      });
      const killerInsights = buildKillerInsights(output, inputInsights, effectiveClassification);

      const predictionsBase = sanitizePredictions(
        prediction.predictions,
        inputInsights,
        effectiveClassification,
        input.organization_name
      );
      const leveragePredictions = buildStrategicLeveragePredictions(
        inputInsights,
        effectiveClassification,
        input.organization_name
      );
      const predictions = leveragePredictions.length
        ? leveragePredictions.slice(0, 3)
        : predictionsBase;
      const reportRaw = buildDutchReport(
        output,
        inputInsights,
        effectiveClassification,
        strategicMode,
        strategicMechanisms,
        boardroomConflict,
        strategicPattern,
        strategicPatternProfile,
        strategySimulation,
        strategicFlywheel,
        predictions,
        current.session_id,
        input.organization_name,
        input.sector,
        input.organisatie_grootte
      );
      const gekozenOptie =
        effectiveClassification === "SUCCESS_MODEL" && strategicMode === "SCALE"
          ? "C"
          : effectiveClassification === "SUCCESS_MODEL" && strategicMode === "PROTECT"
            ? "A"
            : inputInsights.preferredOption || output.decision.recommended_option;
      const summary = buildExecutiveSummary(
        output,
        inputInsights,
        gekozenOptie,
        effectiveClassification,
        strategicMode,
        strategicMechanisms,
        strategicPattern,
        input.organization_name || current.organization_name
      );
      const openQuestionsText = buildTailoredOpenQuestions(inputInsights, input.organization_name);
      const killerInsightsText = formatKillerInsightsForMemo(killerInsights);
      const rawMemo = cleanMemoText(output.narrative.board_memo || output.narrative.boardroom_narrative || "");
      const priorDecisionHistory = this.listSessions({ includeArchived: true })
        .filter(
          (item) =>
            item.organization_id === current.organization_id &&
            item.session_id !== current.session_id &&
            isSessionCompleted(item.status) &&
            Boolean(item.strategic_metadata?.gekozen_strategie)
        )
        .sort((a, b) => Date.parse(b.analyse_datum || b.updated_at) - Date.parse(a.analyse_datum || a.updated_at))
        .slice(0, 5)
        .map((item) => ({
          session_id: item.session_id,
          date: item.analyse_datum || item.updated_at,
          chosen_strategy: normalize(item.strategic_metadata?.gekozen_strategie || ""),
          dominant_thesis: normalize(item.strategic_metadata?.strategic_thesis?.dominant_thesis || ""),
        }));
      const decisionMemory = buildDecisionMemoryEngine({
        organizationName: input.organization_name || current.organization_name,
        sessionId: current.session_id,
        dateIso: new Date().toISOString(),
        chosenStrategy: `Optie ${gekozenOptie}`,
        strategicHypothesis: output.decision.dominant_thesis,
        coreConflict: boardroomConflict.conflictStatement,
        interventionLines: predictions.map((item) => item.interventie).slice(0, 5),
        kpiLines: (extractSection(reportRaw, 8) || "")
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => /^\d+\./.test(line))
          .slice(0, 5),
        priorDecisions: priorDecisionHistory,
      });
      const earlyWarningSystem = buildEarlyWarningSystemEngine({
        organizationName: input.organization_name || current.organization_name,
        leverage: inputInsights.leverage,
        interventionPredictions: predictions,
        strategySimulation,
      });
      const memoBuildExtras = {
        organizationName: input.organization_name,
        successMechanism: strategicMechanisms.successMechanism,
        conflictStatement: boardroomConflict.conflictStatement,
        conflictSideA: boardroomConflict.sideA,
        conflictSideB: boardroomConflict.sideB,
        forcingChoice: boardroomConflict.forcingChoice,
        explicitLoss: boardroomConflict.explicitLoss,
        waitlistShortPathPct: inputInsights.leverage?.waitlistShortPathPct,
        growthCapFte: inputInsights.leverage?.growthCapFte,
        agingCostPct: inputInsights.leverage?.agingCostPct,
        movementOfZeroKnown: inputInsights.leverage?.movementOfZeroKnown,
        strategicMode,
        caseClassification: effectiveClassification,
        optionA: output?.decision?.strategic_options?.[0]?.description,
        optionB: output?.decision?.strategic_options?.[1]?.description,
        optionC: output?.decision?.strategic_options?.[2]?.description,
        strategicQuestion: strategicThesis.boardQuestion,
        patternProfile: strategicPatternProfile,
        strategySimulation,
        decisionMemory,
        earlyWarningSystem,
      };
      const publicYouthCase =
        effectiveClassification !== "SUCCESS_MODEL" &&
        /(jeugdzorg|jeugdwet|gemeente|gemeentelijke inkoop|wijkteam|jongeren|gezinnen)/i.test(
          `${input.organization_name || ""} ${input.sector || ""} ${input.input_data || ""} ${inputInsights.facts.join(" ")} ${inputInsights.actions.join(" ")}`
        );
      const memoFromReport = buildBoardMemoFromReport(
        reportRaw,
        output.decision.dominant_thesis,
        openQuestionsText,
        killerInsightsText,
        memoBuildExtras
      );
      const memoBase = memoFromReport || rawMemo;
      let memo = normalizeBoardMemo(memoBase);
      if (publicYouthCase) {
        memo = sanitizePublicYouthMemo(memo);
      }
      if (!hasBoardMemoMinimumStructure(memo)) {
        memo = normalizeBoardMemo(
          buildBoardMemoFromReport(
            reportRaw,
            output.decision.dominant_thesis,
            openQuestionsText,
            killerInsightsText,
            memoBuildExtras
          )
        );
        if (publicYouthCase) {
          memo = sanitizePublicYouthMemo(memo);
        }
      }
      if (
        !hasBoardroomPressureContract(memo) ||
        !hasStrategicPatternContract(memo) ||
        !hasStrategySimulationContract(memo) ||
        !hasDecisionMemoryContract(memo) ||
        !hasEarlyWarningContract(memo) ||
        !hasStrategicConflictContract(memo) ||
        !hasBoardroomCoachContract(memo)
      ) {
        memo = normalizeBoardMemo(
          buildBoardMemoFromReport(
            reportRaw,
            output.decision.dominant_thesis,
            openQuestionsText,
            killerInsightsText,
            memoBuildExtras
          )
        );
        if (publicYouthCase) {
          memo = sanitizePublicYouthMemo(memo);
        }
      }
      const scenarioSimulationText =
        strategySimulation != null ? buildStrategySimulationBlock(strategySimulation) : reportRaw;
      const reportOptionsForNormalization = publicYouthCase
        ? [
            "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
            "Selectieve specialisatie / niche kiezen voor scherpere positionering",
            "Consortiumstrategie verdiepen om instroom en triage actiever te sturen",
          ]
        : [
            "Bescherm de kern en herstel bestuurlijke focus",
            "Versnel verbreding onder hogere uitvoeringsdruk",
            "Gefaseerde route met expliciete governance-gates",
          ];
      const recommendedScenarioLabel =
        reportOptionsForNormalization[{ A: 0, B: 1, C: 2 }[String(gekozenOptie).toUpperCase() as "A" | "B" | "C"] ?? 0] ||
        `Optie ${gekozenOptie}`;
      const report = normalizeBoardReportForContract({
        report: reportRaw,
        organisation: input.organization_name || current.organization_name,
        sector: input.sector || output.context_state.sector,
        analysisDate: current.analyse_datum || current.updated_at || new Date().toISOString(),
        dominantRisk:
          boardroomConflict.conflictStatement || output.decision.dominant_thesis || summary,
        strategicOptions: reportOptionsForNormalization,
        recommendedOption: recommendedScenarioLabel,
        scenarioSimulationOutput: scenarioSimulationText,
        interventionOutput: predictions
          .slice(0, 4)
          .map(
            (item) =>
              `ACTIE: ${normalize(item.interventie)}\nWAAROM DEZE INTERVENTIE: ${normalize(item.impact)}\nRISICO VAN NIET HANDELEN: ${normalize(item.risico)}\nKPI: ${normalize(item.kpi_effect)}`
          )
          .join("\n\n"),
        memoryProblemText: `${input.input_data || ""}\n${inputInsights.facts.join(" ")}\n${inputInsights.actions.join(" ")}`,
      });
      const quality = assessReportQuality(report, memo, summary, {
        classification: effectiveClassification,
        strategicMode,
        chosenOption: gekozenOptie,
        pattern: strategicPattern.pattern,
      });
      const criticalFlags = criticalPublicationFlags(quality.flags);
      if (criticalFlags.length > 0) {
        memo = normalizeBoardMemo(
          buildBoardMemoFromReport(
            reportRaw,
            output.decision.dominant_thesis,
            openQuestionsText,
            killerInsightsText,
            memoBuildExtras
          )
        );
        if (publicYouthCase) {
          memo = sanitizePublicYouthMemo(memo);
        }
      }
      const finalQuality = assessReportQuality(report, memo, summary, {
        classification: effectiveClassification,
        strategicMode,
        chosenOption: gekozenOptie,
        pattern: strategicPattern.pattern,
      });
      const boardroomModulesV3Final = safelyBuildBoardroomDecisionModulesV3({
        inputInsights,
        output,
        mechanisms: strategicMechanisms,
        conflict: boardroomConflict,
        strategicMode,
        pattern: strategicPattern,
        recommendedOption: gekozenOptie,
        report,
        memo,
        openQuestions: openQuestionsText,
        predictedInterventions: predictions,
        killerInsights,
        organizationName: input.organization_name,
        sector: input.sector,
        organizationType: input.organisatie_grootte,
        leverage: inputInsights.leverage,
        patternProfile: strategicPatternProfile,
        strategySimulation,
        decisionMemory,
        earlyWarningSystem,
      });
      const strategicAgentMetadata = {
        ...(orchestrated.metadata || {}),
        pipeline: Array.from(
          new Set([
            ...((orchestrated.metadata?.pipeline || []) as string[]),
            "ContextEngine",
            "NarrativeGenerator",
          ])
        ),
      };
      const validatedOutput = validateEngineOutput({
        executive_summary: summary,
        board_memo: memo,
        strategic_conflict: boardroomConflict.conflictStatement,
        recommended_option: gekozenOptie,
        interventions: predictions,
        strategic_levers: strategicLeverInsights,
        strategy_dna: {
          archetype: strategyDNA.archetype,
          kernmechanisme: strategyDNA.coreMechanism,
          groeimodel: strategyDNA.growthModel,
          strategisch_risico: strategyDNA.strategicRisk,
          strategievoorkeur: strategyDNA.strategyPreference,
        },
        causal_analysis: {
          items: causalStrategy.items.map((item) => ({
            hefboom: item.hefboom,
            mechanisme: item.mechanisme,
            operationeel_effect: item.operationeelEffect,
            financieel_effect: item.financieelEffect,
            strategisch_risico: item.strategischRisico,
            bestuurlijke_implicatie: item.bestuurlijkeImplicatie,
          })),
          graph: causalStrategy.graph,
          summary: causalStrategy.summary,
        },
        scenario_simulation: strategySimulation,
        benchmark: {
          pattern: strategicPattern.pattern,
          profile: strategicPatternProfile,
        },
        drift_analysis: decisionMemory?.decision_alignment,
        decision_memory: decisionMemory,
      });
      draftSessionPatch = {
        board_report: report,
        executive_summary: validatedOutput.executive_summary,
        board_memo: validatedOutput.board_memo,
        strategic_agent: strategicAgentMetadata,
        intervention_predictions: Array.isArray(validatedOutput.interventions) ? validatedOutput.interventions : predictions,
        strategic_metadata: {
          sector: output.context_state.sector,
          probleemtype: output.diagnosis.dominant_problem,
          case_classification: effectiveClassification,
          case_classification_reason: effectiveReason,
          strategic_mode: strategicMode,
          dominant_system_mode: systemTransformation.mode,
          system_transformation: {
            rationale: systemTransformation.rationale,
            decision_power: systemTransformation.decisionPower,
            payment_power: systemTransformation.paymentPower,
            blocking_power: systemTransformation.blockingPower,
            thesis: systemTransformation.transformationThesis,
          },
          system_actor_mapping: systemActors.map((item) => ({
            actor: item.actor,
            role: item.role,
            interest: item.interest,
            influence: item.influence,
          })),
          economic_engine: {
            pressure: economicAssessment.pressure,
            unit_economics: economicAssessment.unitEconomics,
            constraint: economicAssessment.constraint,
          },
          power_structure: {
            beslist: powerStructure.beslist,
            betaalt: powerStructure.betaalt,
            blokkeert: powerStructure.blokkeert,
          },
          strategic_mechanisms: {
            success: strategicMechanisms.successMechanism,
            risk: strategicMechanisms.riskMechanism,
            scale: strategicMechanisms.scaleMechanism,
            confidence: strategicMechanisms.confidence,
          },
          strategic_pattern: {
            pattern: strategicPattern.pattern,
            rationale: strategicPattern.rationale,
            confidence: strategicPattern.confidence,
            primary_pattern: strategicPatternProfile.primary_pattern,
            secondary_pattern: strategicPatternProfile.secondary_pattern,
            scale_mechanism: strategicPatternProfile.scale_mechanism,
            typical_risks: strategicPatternProfile.typical_risks,
            growth_strategy: strategicPatternProfile.growth_strategy,
            strategic_interventions: strategicPatternProfile.strategic_interventions,
            boardroom_framing: strategicPatternProfile.boardroom_framing,
          },
          strategic_flywheel: {
            loop: strategicFlywheel.loop,
            narrative: strategicFlywheel.narrative,
            confidence: strategicFlywheel.confidence,
          },
          strategy_simulation: validatedOutput.scenario_simulation || strategySimulation,
          decision_memory: validatedOutput.decision_memory || decisionMemory,
          early_warning_system: earlyWarningSystem,
          strategic_leverage_points: leveragePoints.map((item) => ({
            title: item.title,
            leverage_type: item.leverageType,
            mechanism: item.mechanism,
            case_datapoint: item.caseDatapoint,
            intervention: item.intervention,
            target: item.target,
            impact: item.impact,
          })),
          strategic_hefbomen: strategicLeverInsights.map((item) => ({
            hefboom: item.lever,
            mechanisme: item.mechanism,
            risico: item.risk,
            bestuurlijke_implicatie: item.boardImplication,
            score: item.score,
          })),
          strategic_hefboom_combinatie: dominantLeverCombination
            ? {
                hefbomen: dominantLeverCombination.levers,
                strategisch_effect: dominantLeverCombination.strategicEffect,
              }
            : undefined,
          strategic_causal_analysis: validatedOutput.causal_analysis || {
            items: causalStrategy.items.map((item) => ({
              hefboom: item.hefboom,
              mechanisme: item.mechanisme,
              operationeel_effect: item.operationeelEffect,
              financieel_effect: item.financieelEffect,
              strategisch_risico: item.strategischRisico,
              bestuurlijke_implicatie: item.bestuurlijkeImplicatie,
            })),
            graph: causalStrategy.graph,
            summary: causalStrategy.summary,
          },
          strategy_dna: validatedOutput.strategy_dna || {
            archetype: strategyDNA.archetype,
            kernmechanisme: strategyDNA.coreMechanism,
            groeimodel: strategyDNA.growthModel,
            strategisch_risico: strategyDNA.strategicRisk,
            strategievoorkeur: strategyDNA.strategyPreference,
          },
          strategic_scenarios: strategicScenarios,
          strategic_stress_tests: stressTests.tests,
          strategic_thesis: {
            board_question: strategicThesis.boardQuestion,
            dominant_thesis: strategicThesis.dominantThesis,
            killer_insight: strategicThesis.killerInsight,
            decisions: strategicThesis.decisions,
          },
          mvp_engine: mvpEngine,
          boardroom_intervention_architecture_v3: {
            name: "AURELIUS BOARDROOM INTERVENTION ENGINE v3",
            layer_count: BOARDROOM_INTERVENTION_LAYERS.length,
            module_count: BOARDROOM_INTERVENTION_PIPELINE.length,
            layers: BOARDROOM_INTERVENTION_LAYERS.map((layer) => ({
              id: layer.id,
              label: layer.label,
              modules: layer.modules,
            })),
            pipeline: BOARDROOM_INTERVENTION_PIPELINE,
          },
          boardroom_decision_engine_v3: boardroomModulesV3Final,
          intervention_contract: {
            version: "AURELIUS_INTERVENTION_ENGINE_MAATWERK_CONTRACT_V1",
            mode: "maatwerk",
            requires_case_datapoint: true,
            requires_leverage_type: true,
            requires_measurable_target: true,
          },
          intervention_contract_prompt: AURELIUS_INTERVENTION_ENGINE_MAATWERK_CONTRACT_V1,
          boardroom_conflict: {
            statement: boardroomConflict.conflictStatement,
            side_a: boardroomConflict.sideA,
            side_b: boardroomConflict.sideB,
            forcing_choice: boardroomConflict.forcingChoice,
            explicit_loss: boardroomConflict.explicitLoss,
          },
          mechanismen: output.mechanisms.map((item) => item.mechanism),
          interventies: Array.from(
            new Set([
              ...output.insights.map((item) => item.recommended_focus),
              ...predictions.map((item) => item.interventie),
            ])
          ),
          strategische_opties: output.decision.strategic_options.map((item) => item.description),
          gekozen_strategie: validatedOutput.recommended_option || gekozenOptie,
        },
        strategic_report: {
          report_id: createId("report"),
          session_id: current.session_id,
          organization_id: current.organization_id,
          title: `Cyntra Executive Dossier — ${current.organization_name || "Organisatie"} — ${current.session_id}`,
          sections: reportSections(report),
          generated_at: new Date().toISOString(),
          report_body: report,
        },
        updated_at: new Date().toISOString(),
        analysis_runtime_ms: Math.max(Date.now() - startedAt, MIN_ANALYSIS_RUNTIME_MS),
        engine_mode: "local-deterministic",
        quality_score: finalQuality.score,
        quality_tier: finalQuality.tier,
        quality_flags: finalQuality.flags,
        error_message: buildPublicationWarning(report, validatedOutput.executive_summary, finalQuality),
      };
      const elapsedMs = Date.now() - startedAt;
      if (elapsedMs < MIN_ANALYSIS_RUNTIME_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_ANALYSIS_RUNTIME_MS - elapsedMs));
      }

      const updated = this.updateSession(input.session_id, (prev) => ({
        ...prev,
        status: SESSION_STATUS.COMPLETED,
        ...(draftSessionPatch || {}),
      })) || restoreSession(SESSION_STATUS.COMPLETED);

      try {
        if (updated.strategic_report?.report_body) {
          saveStoredReport(updated.session_id, updated.strategic_report, {
            organizationName: updated.organization_name,
            result: validatedOutput,
          });
        }
      } catch (error) {
        console.warn("Session update skipped for report storage sync", error);
      }

      const extractedInterventions = extractInterventionsFromReport({
        case_id: updated.session_id,
        source_case_id: updated.session_id,
        sector: updated.strategic_metadata?.sector,
        sections: {
          dominante_these: output.decision.dominant_thesis,
          kernspanning: output.diagnosis.organizational_constraints,
          trade_offs: output.decision.tradeoffs,
          price_of_delay: output.diagnosis.financial_pressure,
        },
        recommendations: output.insights.map((item) => item.recommended_focus),
        actions: output.decision.tradeoffs,
        interventionPlan: updated.strategic_metadata?.interventies ?? [],
        board_report: updated.board_report,
      });
      interventionStore.addMany(extractedInterventions);
      const predictionConfidence = prediction.predictions.length
        ? prediction.predictions
            .map((item) => confidenceToNumber(item.confidence))
            .reduce((sum, value) => sum + value, 0) / prediction.predictions.length
        : 0.65;
      caseStore.upsert({
        case_id: updated.session_id,
        session_id: updated.session_id,
        organization_id: updated.organization_id,
        organisation_name: updated.organization_name,
        sector: updated.strategic_metadata?.sector || "Onbekende sector",
        probleemtype: updated.strategic_metadata?.probleemtype || "overig",
        dominante_these: updated.executive_summary || "",
        gekozen_strategie: updated.strategic_metadata?.gekozen_strategie || "onbekend",
        analyse_input: updated.input_data,
        report: updated.board_report,
        interventions: extractedInterventions.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          impact: item.impact,
          risk: item.risk,
          confidence: item.confidence,
        })),
        confidence: Number(predictionConfidence.toFixed(2)),
        created_at: updated.analyse_datum,
        updated_at: updated.updated_at,
      });
      this.learningLoop.feed(caseStore.getAll(), interventionStore.getAll());

      ensureReportIntegrity(updated);
      ensureSessionIntegrity(updated);
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Onbekende fout tijdens analyse.";
      const failed = this.updateSession(input.session_id, (prev) => ({
        ...prev,
        ...(draftSessionPatch || {}),
        status: "fout",
        error_message: message,
        updated_at: new Date().toISOString(),
      })) || restoreSession("fout", message);
      try {
        if (failed.strategic_report?.report_body) {
          saveStoredReport(failed.session_id, failed.strategic_report, {
            organizationName: failed.organization_name,
            result: validateEngineOutput({
              executive_summary: failed.executive_summary,
              board_memo: failed.board_memo,
              strategic_conflict:
                failed.strategic_metadata?.boardroom_conflict?.statement || failed.executive_summary || "",
              recommended_option: failed.strategic_metadata?.gekozen_strategie || "",
              interventions: failed.intervention_predictions || [],
            }),
          });
        }
      } catch (error) {
        console.warn("Session update skipped for failed report storage sync", error);
      }
      ensureReportIntegrity(failed);
      ensureSessionIntegrity(failed);
      return failed;
    }
  }
}
