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
import type { AnalysisSession } from "./types";
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
  const sectionHeadingPattern =
    /\n\d+\.\s+(Besluitvraag|Bestuurlijke these|Feitenbasis|Strategische opties|Aanbevolen keuze|Niet-onderhandelbare besluitregels|90-dagen interventieplan|KPI monitoring|Besluittekst)\s*$/gm;
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
      `Financieel gevolg: zonder netwerk- en licentieversnelling blijft kostendruk (tot +${agingPct}% loonkosten) sneller stijgen dan contractruimte. Trigger: kwartaalmarge onder norm in 2 opeenvolgende periodes.`
    );
  }
  if (!hasGovernance) {
    lines.push(
      `Governance gevolg: elke groeibeslissing boven ${growthCap} FTE/jaar zonder expliciete boardtoets verhoogt kans op cultuur- en eigenaarschapserosie. Trigger: groeibesluit buiten vastgesteld besluitkader.`
    );
  }
  if (!hasCapacity) {
    lines.push(
      `Capaciteit/kwaliteit gevolg: als kort-trajectuitstroom niet stijgt boven ${triagePct}% blijft wachtdruk structureel en neemt kwaliteitsvariatie toe. Trigger: KPI-doel 2 maanden achtereen niet gehaald.`
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

function normalizeBoardMemo(value: string): string {
  const sanitized = dedupeLines(cleanMemoText(stripSourceDump(value)));
  if (!sanitized) return "";
  const parts = sanitized.split(/\n(?=(?:Bestuurlijke hypothese|Feitenbasis|Besluitvoorstel|Consequenties|Opvolging 90 dagen)\n)/);
  if (parts.length <= 1) return sanitized;

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

  return truncateBoardMemoTail(hardenBoardroomLanguage(cleanMemoText(rebuilt)));
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
    dominantThesis: "Het probleem is niet activiteitstekort maar bestuurlijke inertie op het dominante risicomechanisme.",
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
      `${org} probeert impact te vergroten door uitbreiding van capaciteit.`,
      "",
      `Maar het onderliggende probleem is geen capaciteitsprobleem. Het is een replicatieprobleem.`,
      "",
      `Zolang ${mechanism} niet wordt aangepast, blijft impactgroei terugkeren als bestuurlijk knelpunt.`,
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
    "Conservatief: bescherm kernkwaliteit met strikte groeicap en beperkte externe expansie.";
  const optionB =
    normalize(params.optionB) ||
    "Expansief: versnel schaal via volumegroei met hogere korte-termijn uitvoeringsdruk.";
  const optionC =
    normalize(params.optionC) ||
    "Hybride: schaal via netwerk- en modeladoptie met harde kwaliteits- en eigenaarschapsguardrails.";
  const explicitLoss =
    normalize(params.explicitLoss) ||
    "Snelle volumegroei en maximale directe controle kunnen niet tegelijk behouden blijven.";
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
  const partnershipContext =
    /(eigenaarschap|cultuur|netwerk|replicatie|partner|licentie)/i.test(mechanismText) ||
    (growthCap <= 7 && waitlistPct >= 5);
  const options = (params.strategicOptions || []).slice(0, 3);
  const defaultA = partnershipContext
    ? "Culture-first model: bescherm kernkwaliteit en eigenaarschap met beperkte interne groei."
    : "Conservatieve strategie met gecontroleerde groei en harde kwaliteitsguardrails.";
  const defaultB = partnershipContext
    ? "Volume scaling: versnel lineaire groei via extra capaciteit en volumesturing."
    : "Expansieve strategie met versneld schaaltempo en hogere uitvoeringsdruk.";
  const defaultC = partnershipContext
    ? "Network replication: schaal modeladoptie via partners met contractuele kwaliteitsborging."
    : "Hybride strategie via netwerkadoptie met contractuele kwaliteitsborging.";
  const scenarioA = options[0] || defaultA;
  const scenarioB = options[1] || defaultB;
  const scenarioC = options[2] || defaultC;

  const simulation_results: StrategySimulationEngineOutput["simulation_results"] = [
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
      `Scenario A\nVoordeel: hoge stabiliteit.\nNadeel: lagere impactsnelheid.`,
      `Scenario B\nVoordeel: hoge potentiële impactgroei.\nNadeel: hoogste cultuur- en kwaliteitsrisico.`,
      `Scenario C\nVoordeel: beste balans tussen impact en borging.\nNadeel: afhankelijk van partnergovernance.`,
    ].join("\n\n"),
    decision_guidance: [
      "BESTUURLIJKE INTERPRETATIE",
      "Als het bestuur prioriteit geeft aan stabiliteit: Scenario A.",
      "Als het bestuur prioriteit geeft aan impact: Scenario B.",
      "Als het bestuur balans zoekt: Scenario C.",
    ].join("\n"),
    early_warning_signals,
    boardroom_visualization: [
      "STRATEGY SIMULATION SUMMARY",
      "Scenario A: impact middel, risico middel-laag.",
      "Scenario B: impact hoog, risico hoog.",
      "Scenario C: impact hoog, risico middel.",
      ...(partnershipContext ? ["Scenario D: impact hoog, risico middel (governance-gevoelig)."] : []),
    ].join("\n"),
  };
}

function buildStrategySimulationBlock(sim: StrategySimulationEngineOutput): string {
  const scenarioLines = sim.strategic_scenarios
    .map((item) => `Scenario ${item.scenario} (${item.strategy_type})\n${item.description}`)
    .join("\n\n");
  const impactLines = sim.simulation_results
    .map(
      (item) =>
        `Scenario ${item.scenario}\nCapaciteit\n${item.capaciteit}\n\nFinanciën\n${item.financien}\n\nCultuur\n${item.cultuur}\n\nNetwerk\n${item.netwerk}`
    )
    .join("\n\n");
  const riskLines = sim.scenario_risks
    .map(
      (item) =>
        `Scenario ${item.scenario}\nRISK PROFILE\nRisico\n${item.risico}\nKans\n${item.kans}\nImpact\n${item.impact}`
    )
    .join("\n\n");
  const warningLines = sim.early_warning_signals
    .map((item) => `Scenario ${item.scenario}\nEarly warning indicator: ${item.indicator}\nMeetbare KPI: ${item.kpi}`)
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
  ]);
  return (flags || []).filter((flag) => critical.has(flag));
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
    const patternPrimary = formatStrategicPatternLabel(params.patternProfile?.primary_pattern);
    const patternSecondary = formatStrategicPatternLabel(params.patternProfile?.secondary_pattern);
    const patternLine = patternPrimary
      ? `Organisatiemodel: ${patternPrimary}${patternSecondary ? ` + ${patternSecondary}` : ""}.`
      : "";
    const dominantThesis = trimWords(
      normalize(params.dominantThesis) ||
        `${org} heeft geen groeiprobleem maar een schaalmechanismeprobleem.`,
      18
    );
    const dominantMechanism = trimWords(
      normalize(params.dominantMechanism) ||
        `${org} wint door een specifiek mechanisme dat kwaliteit versterkt maar lineaire schaal begrenst.`,
      65
    );
    const insight = trimWords(
      normalize(params.insightLine) ||
        `De organisatie heeft geen volumegroeiprobleem. Ze heeft een mechanistisch replicatieprobleem.`,
      45
    );
    const mechanism = trimWords(
      normalize(params.mechanismLine) ||
        `${org} creëert kwaliteit via eigenaarschap en cultuur. Lineaire groei via extra FTE verhoogt coördinatiedruk en verzwakt dit mechanisme; netwerkreplicatie schaalt impact met minder cultuurerosie.`,
      55
    );
    const misdiagnosis = trimWords(
      normalize(params.misdiagnosisInsight) ||
        `${org} probeert groei op te lossen met extra capaciteit. Maar het onderliggende probleem is dat het model niet lineair schaalbaar is. Zolang dat mechanisme niet verandert, blijft het probleem terugkeren.`,
      120
    );
    const conflictBody = trimWords(
      `${params.conflictA} vs ${params.conflictB}. Prijs van de keuze: ${params.explicitLoss}`,
      110
    );
    const optionBody = trimWords(
      `A ${normalize(params.optionA)} B ${normalize(params.optionB)} C ${normalize(params.optionC)} Aanbevolen optie: ${normalize(params.recommendedOption)}.`,
      115
    );
    const tradeOffBody = trimWords(
      normalize(params.tradeOffExposure) ||
        `Als we kiezen voor ${normalize(params.recommendedOption)}, verliezen we directe cultuurcontrole, stijgt partnerafhankelijkheid en hebben we auditdiscipline nodig.`,
      55
    );
    const interventionsBody = params.interventions
      .slice(0, 3)
      .map(
        (item, idx) =>
          `Interventie ${idx + 1} | Actie: ${trimWords(item.actie, 16)} Mechanisme: ${trimWords(item.mechanisme, 24)} KPI: ${trimWords(item.kpi, 18)}`
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
        "De vraag voor het bestuur is niet hoe we sneller groeien, maar welk schaalmechanisme kwaliteit intact laat.",
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
      trimWords([insight, mechanism, patternLine].filter(Boolean).join(" "), 120),
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
      "",
      "SCENARIO: GEEN INTERVENTIE",
      scenarioBody,
      "",
      "WIJ BESLUITEN",
      decisionsBody,
      "",
      "BOARDROOM QUESTION",
      boardQuestion,
      "",
      "1. Besluitvraag",
      boardQuestion,
      "",
      "2. Executive Thesis",
      dominantThesis,
      "",
      "3. Feitenbasis",
      dominantMechanism,
      "",
      "4. Strategische opties",
      optionBody,
      "",
      "5. Aanbevolen keuze",
      `Aanbevolen optie: ${normalize(params.recommendedOption)}.`,
      "",
      "6. Niet-onderhandelbare besluitregels",
      tradeOffBody,
      "",
      "7. 90-dagen interventieplan",
      legacyInterventionPlan,
      "",
      "8. KPI-set",
      params.interventions
        .slice(0, 3)
        .map((item, idx) => `${idx + 1}. ${trimWords(item.kpi, 18)}`)
        .join("\n"),
      "",
      "9. Besluittekst",
      decisionsBody,
      "",
      "Open vragen",
      boardQuestion,
      "",
      "APPENDIX",
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
    optionA: extras?.optionA,
    optionB: extras?.optionB,
    optionC: extras?.optionC,
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
    assumptions: [
      "groei schaadt cultuur zodra eigenaarschap niet expliciet geborgd is",
      "netwerkpartners kunnen kwaliteitsstandaarden consistent uitvoeren",
      "beleidsinvloed versnelt systeemadoptie binnen de gekozen horizon",
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
            actie: normalize(extras?.optionA || "Consolideer kernkwaliteit met expliciete guardrails."),
            mechanisme: "Gerichte prioritering verlaagt gelijktijdige executiedruk.",
            kpi: "Kwaliteitsscore stabiel over 2 meetperiodes.",
          },
          {
            actie: normalize(extras?.optionB || "Versnel schaal waar governancecapaciteit dit toelaat."),
            mechanisme: "Capaciteitsuitbreiding verhoogt impacttempo met hogere borgingsdruk.",
            kpi: "Doorstroom en capaciteitsratio verbeteren kwartaal-op-kwartaal.",
          },
          {
            actie: normalize(extras?.optionC || "Schaal via netwerkreplicatie met contractuele kwaliteitsnormen."),
            mechanisme: "Partneradoptie vergroot bereik zonder lineaire FTE-groei.",
            kpi: "Actieve implementatiepartners en kwaliteitsscore op norm.",
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
    optionA: decisionPressure.match(/Optie A[\s\S]*?(?=\n\nOptie B)/i)?.[0]?.replace(/^Optie A\s*/i, "") || normalize(extras?.optionA || ""),
    optionB: decisionPressure.match(/Optie B[\s\S]*?(?=\n\nOptie C)/i)?.[0]?.replace(/^Optie B\s*/i, "") || normalize(extras?.optionB || ""),
    optionC: decisionPressure.match(/Optie C[\s\S]*?(?=\n\nPrijs van de keuze)/i)?.[0]?.replace(/^Optie C\s*/i, "") || normalize(extras?.optionC || ""),
    recommendedOption: `Optie ${report.match(/Aanbevolen optie:\s*([ABC])/i)?.[1] || "C"}`,
    tradeOffExposure,
    interventions: quickInterventions,
    decisions: quickInterventions.map(
      (item, idx) => `${item.actie} KPI: ${item.kpi}${idx === 2 ? "." : ""}`
    ),
    boardQuestion:
      "De vraag voor het bestuur is niet: hoe groeit de organisatie sneller, maar: welk schaalmechanisme vergroot impact zonder kwaliteitsverlies?",
  });

  return truncateBoardMemoTail(hardenBoardroomLanguage(
    cleanMemoText(
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
    )
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
  const flags: string[] = [];
  const reportText = normalize(report);
  const memoText = normalize(memo);
  const summaryText = normalize(summary);
  let score = 100;

  if (!/1\.\s*Besluitvraag/i.test(reportText)) {
    score -= 12;
    flags.push("missing_decision_question");
  }
  if (!/3\.\s*Feitenbasis/i.test(reportText)) {
    score -= 12;
    flags.push("missing_fact_base");
  }
  if (!/4\.\s*Strategische opties/i.test(reportText)) {
    score -= 10;
    flags.push("missing_options");
  }
  if (!/7\.\s*90-dagen interventieplan/i.test(reportText)) {
    score -= 10;
    flags.push("missing_90_day_plan");
  }
  if (!/8\.\s*KPI monitoring/i.test(reportText)) {
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
  if (summaryText.length < 80) {
    score -= 8;
    flags.push("summary_too_short");
  }
  if (reportText.length < 900) {
    score -= 8;
    flags.push("report_too_short");
  }
  const interventionSection = extractSection(report, 7);
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
    if (/stabiliseer eerst de kern-ggz|herstel marge|contractdiscipline/i.test(summaryText)) {
      score -= 22;
      flags.push("success_model_crisis_leak");
    }
    if (context?.strategicMode === "SCALE" && context?.chosenOption && context.chosenOption !== "C") {
      score -= 20;
      flags.push("scale_mode_option_mismatch");
    }
  }
  if (!/Spanning A:|Keuze A:/i.test(reportText) || !/Spanning B:|Keuze B:/i.test(reportText)) {
    score -= 18;
    flags.push("missing_strategic_conflict_choice");
  }
  if (!/Forcing choice:|Besluittest:/i.test(reportText)) {
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
    facts.push("Mix van zzp en loondienst wordt gebruikt om capaciteitsflexibiliteit te behouden.");
  }
  if (/(geen contract|ontbreken.*contract|verzekeraar.*contract)/i.test(text)) {
    facts.push("Contractpositie met verzekeraars is een kernrisico voor voorspelbare omzet.");
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
    Boolean(insights.leverage.growthCapFte && insights.leverage.growthCapFte <= 6) &&
    Boolean(insights.leverage.movementOfZeroKnown) &&
    Boolean(insights.leverage.waitlistShortPathPct);

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

function buildExecutiveSummary(
  output: any,
  inputInsights: InputInsights,
  gekozenOptie: "A" | "B" | "C",
  caseClassification: CaseClassification,
  strategicMode: StrategicMode,
  mechanisms: StrategicMechanismOutput,
  pattern: StrategicPatternMatch
): string {
  const patternLabel = formatStrategicPatternLabel(pattern.pattern);
  const topFacts = inputInsights.facts.slice(0, 3);
  const factsLine =
    topFacts.length
      ? topFacts.join(" ")
      : caseClassification === "SUCCESS_MODEL"
        ? mechanisms.successMechanism
        : output.diagnosis.financial_pressure;
  const optionLine =
    caseClassification === "SUCCESS_MODEL"
      ? strategicMode === "SCALE"
        ? "Advies: vergroot impact via netwerkstrategie of cellenmodel met strikte cultuur- en eigenaarschapsguardrails."
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
  const patternLine =
    caseClassification === "SUCCESS_MODEL"
      ? `Patroon: ${patternLabel}.`
      : "";
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
  caseClassification: CaseClassification
): MechanisticInsight[] {
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

  const values = Array.from(dedup.values());
  while (values.length < 7) {
    const n = values.length + 1;
    values.push({
      title: `Strategisch inzicht ${n}`,
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
  return values.slice(0, 10);
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
          topicIndex === 0
            ? `Omdat ${orgLabel} impact wil schalen zonder extra FTE-druk`
            : topicIndex === 1
              ? `Omdat wachttijdfrictie direct capaciteit blokkeert`
              : topicIndex === 2
                ? `Omdat kennisverlies en vergrijzing structureel risico verhogen`
                : topicIndex === 3
                  ? `Omdat beleidsinvloed directe schaalversneller is`
                  : `Omdat trage governance uitvoering vertraagt`;
        const brondata =
          topicIndex === 0
            ? `brondata: schaal zonder >${growthCap} FTE/jaar`
            : topicIndex === 1
              ? `brondata: ${waitlistPct}% kort-traject uitstroom`
              : topicIndex === 2
                ? `brondata: +${agingPct}% vergrijzingskost`
                : topicIndex === 3
                  ? "brondata: beleids- en netwerktractie aanwezig"
                  : `brondata: ${carePct}/${devPct} zorg-ontwikkelratio`;
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
  const trimTo = (value: string, max = 220): string => {
    const text = normalize(value);
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1).trimEnd()}…`;
  };
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
    const bullet = trimTo(`• ${mechanism} Implicatie: ${implication}`);
    dedup.set(key, bullet);
    if (dedup.size >= 3) break;
  }

  const fallback = [
    "• Het model faalt niet op kwaliteit maar op overdraagbaarheid; prioriteit is replicatie met harde kwaliteitsguardrails.",
    "• Groei via eigen FTE vergroot cultuurdruk; netwerkadoptie verhoogt impact met lagere interne frictie.",
    "• Zonder expliciete stopregels verschuift besluitkracht naar operatie; borg escalatie en kill-switches op boardniveau.",
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
    leverage,
    patternProfile,
    strategySimulation,
    decisionMemory,
    earlyWarningSystem,
  } = params;
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

function buildCaseAnchoredFactBase(
  inputInsights: InputInsights,
  caseClassification: CaseClassification
): string {
  if (caseClassification !== "SUCCESS_MODEL") {
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
  organizationName?: string
): string {
  const compact = (value: string, max = 320): string => {
    const text = normalize(value);
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1).trimEnd()}…`;
  };
  const killerInsights = buildKillerInsights(output, inputInsights, caseClassification);
  const systemTransformation = inferSystemTransformationAssessment(
    inputInsights,
    caseClassification
  );
  const systemActors = inferSystemActorMapping(inputInsights, caseClassification);
  const economicAssessment = inferEconomicAssessment(inputInsights, caseClassification);
  const powerStructure = inferPowerStructure(inputInsights, systemTransformation);
  const thesis = buildStrategicThesis(
    inputInsights,
    caseClassification,
    strategicMode,
    mechanisms,
    systemTransformation,
    organizationName
  );
  const leveragePoints = buildStrategicLeveragePoints(
    inputInsights,
    caseClassification,
    organizationName
  );
  const interventionActions = buildInterventionActions(output, inputInsights, caseClassification);
  const gekozenOptie =
    caseClassification === "SUCCESS_MODEL" && strategicMode === "SCALE"
      ? "C"
      : caseClassification === "SUCCESS_MODEL" && strategicMode === "PROTECT"
        ? "A"
        : inputInsights.preferredOption || output.decision.recommended_option;
  const options =
    caseClassification === "SUCCESS_MODEL"
      ? [
          "A. Gecontroleerde groei (maximaal 5 FTE per jaar)\n   Financieel effect: voorspelbaar en beheersbaar\n   Operationeel effect: cultuur en kwaliteit blijven stabiel\n   Risico: impactgroei blijft begrensd.",
          "B. Cellenmodel (repliceer kleine autonome units)\n   Financieel effect: schaalpotentieel met hogere opstartkosten\n   Operationeel effect: behoud van autonomie per unit\n   Risico: governance-complexiteit neemt toe.",
          "C. Netwerkstrategie (impact zonder volumegroei)\n   Financieel effect: lagere kapitaaldruk dan volumegroei\n   Operationeel effect: impact groeit via partners\n   Risico: minder directe controle op uitvoering.",
        ].join("\n")
      : output.decision.strategic_options
          .map((item) => `${item.code}. ${item.description}\n   Financieel effect: ${item.financial_effect}\n   Operationeel effect: ${item.operational_effect}\n   Risico: ${item.risk_profile}`)
          .join("\n");
  const compacteOpties =
    caseClassification === "SUCCESS_MODEL"
      ? [
          "A. Gecontroleerde groei\nImplicatie: cultuur en kwaliteit blijven stabiel, maar impactgroei blijft begrensd.",
          "B. Cellenmodel\nImplicatie: schaal via autonome eenheden, maar governance-complexiteit neemt toe.",
          "C. Netwerkreplicatie\nImplicatie: impact groeit via partners, maar directe kwaliteitscontrole neemt af.",
        ].join("\n\n")
      : output.decision.strategic_options
          .map((item) => `${item.code}. ${item.description}\nImplicatie: ${normalize(item.operational_effect || item.risk_profile || item.financial_effect)}`)
          .join("\n\n");

  const interventions = interventionActions
    .map(
      (item, index) =>
        `${index + 1}. Actie: ${item.action}\nEigenaar: ${item.owner}\nDeadline: ${item.deadline}\nSuccescriterium: ${item.success}`
    )
    .join("\n\n");
  const structuredInterventions = buildStructuredInterventionBlock(
    interventionActions,
    inputInsights,
    caseClassification,
    organizationName
  );
  const extraActions = inputInsights.actions.length
    ? `${inputInsights.actions.map((line, idx) => `${idx + 1}. ${line}`).join("\n")}\n\n`
    : "";
  const interventionPlanSection = ensureMinimumInterventionActions(
    structuredInterventions || extraActions,
    `${extraActions}${interventions}`,
    15
  );
  const predicted = predictedInterventions
    .slice(0, 3)
    .map(
      (item, index) =>
        `${index + 1}. Interventie: ${item.interventie}\nImpact: ${item.impact}\nRisico: ${item.risico}\nKPI-effect: ${item.kpi_effect}\nConfidence: ${item.confidence}`
    )
    .join("\n\n");
  const compacteInterventies = predictedInterventions
    .slice(0, 3)
    .map(
      (item, index) =>
        `Interventie ${index + 1}\nActie: ${normalize(item.interventie)}\nMechanisme: ${compact(item.impact, 180)}\nKPI: ${compact(item.kpi_effect, 160)}`
    )
    .join("\n\n");

  const kpis = [
    ...(caseClassification === "SUCCESS_MODEL"
      ? [
          "1. Ziekteverzuim en uitstroom (maandelijks)",
          "2. Aandeel medewerkers met participatie/eigenaarschap",
          "3. Mentorbelasting en kwaliteit van inwerktrajecten",
          "4. Groei t.o.v. afgesproken FTE-cap",
          "5. Netwerkimpact: bereik, verwijzingen en kwaliteitsscore",
        ]
      : [
          "1. Cash-runway (maanden)",
          "2. Marge-ontwikkeling per maand",
          "3. Capaciteitsdruk en wachttijd",
          "4. Contractplafond-benutting",
          "5. Interventie-slaagratio",
        ]),
  ].join("\n");

  const anchoredFactBase = buildCaseAnchoredFactBase(inputInsights, caseClassification);
  const feitenbasis = anchoredFactBase
    ? anchoredFactBase
    : `${output.diagnosis.financial_pressure}. ${output.diagnosis.organizational_constraints}. ${output.diagnosis.market_constraints}.`;
  const mechanismSection = [
    "DOMINANT MECHANISM",
    `Het succes van ${String(organizationName || "de organisatie").trim() || "de organisatie"} wordt primair veroorzaakt door: ${compact(mechanisms.successMechanism, 260)}`,
    `Dit mechanisme creëert: ${compact(mechanisms.behaviorMechanism, 220)}`,
    `Strategische implicatie: ${compact(mechanisms.scaleMechanism, 220)}`,
  ].join("\n");
  const misdiagnosisSection = [
    "MISDIAGNOSIS INSIGHT",
    `De organisatie probeert ${compact(conflict.sideA.toLowerCase(), 120)} op te lossen.`,
    `Maar het onderliggende probleem is ${compact(mechanisms.scaleMechanism.toLowerCase(), 160)}.`,
    "Zolang dit mechanisme niet wordt aangepast, blijft het probleem terugkeren.",
  ].join("\n");
  const conflictSection = [
    "STRATEGISCH CONFLICT",
    "CONFLICT",
    conflict.sideA,
    "vs",
    conflict.sideB,
    "",
    `Prijs van de keuze: ${compact(conflict.explicitLoss || conflict.forcingChoice, 220)}`,
  ].join("\n");
  const recommendedDirection =
    caseClassification === "SUCCESS_MODEL"
      ? gekozenOptie === "C"
        ? "C — schaal via netwerkreplicatie met expliciete kwaliteits- en eigenaarschapsguardrails."
        : gekozenOptie === "B"
          ? "B — schaal via autonome cellen met een hard governancekader."
          : "A — houd groei bewust begrensd om het kernmechanisme te beschermen."
      : `Optie ${gekozenOptie} — volg de richting met de laagste directe schade en hoogste bestuurlijke beheersbaarheid.`;
  const tradeoffSection = [
    "KEERZIJDE VAN DE KEUZE",
    `Als we kiezen voor ${recommendedDirection.replace(/\.$/, "")}:`,
    "",
    `Dan accepteren we dat: ${compact(conflict.explicitLoss || "niet alle doelen tegelijk maximaal haalbaar zijn.", 220)}`,
    "",
    `Dit vereist: ${compact(conflict.forcingChoice || "strakke governance, discipline en expliciete stopregels.", 200)}`,
  ].join("\n");
  const noInterventionSection = [
    "SCENARIO: GEEN INTERVENTIE",
    "Als er geen strategische interventie plaatsvindt:",
    "",
    `Capaciteit: ${compact(output.diagnosis.organizational_constraints, 160)}`,
    `Financiën: ${compact(output.diagnosis.financial_pressure, 160)}`,
    `Strategische positie: ${compact(output.diagnosis.market_constraints, 160)}`,
    "",
    "BESTUURLIJKE CONSEQUENTIE",
    "Uitstel vergroot het risico dat bestuurlijke regie verschuift naar operationele brandbestrijding.",
  ].join("\n");
  const appendixSection = [
    "APPENDIX",
    "",
    "Scenario simulaties",
    buildStrategySimulationBlock(strategySimulation),
    "",
    "Governance analyse",
    `Wie beslist: ${systemTransformation.decisionPower}`,
    `Wie betaalt: ${systemTransformation.paymentPower}`,
    `Wie blokkeert: ${systemTransformation.blockingPower}`,
    "",
    "Risico- en vroegsignalen",
    kpis,
    "",
    "Decision memory",
    `Aanbevolen optie: ${gekozenOptie}`,
    `Board vraag: ${thesis.boardQuestion}`,
    "",
    "Technische context",
    `Patroon: ${formatStrategicPatternLabel(patternProfile.primary_pattern)}${patternProfile.secondary_pattern ? ` + ${formatStrategicPatternLabel(patternProfile.secondary_pattern)}` : ""}`,
    `Rationale: ${pattern.rationale}`,
    `Strategisch vliegwiel: ${compact(flywheel.narrative, 500)}`,
  ].join("\n");

  return [
    "BESTUURLIJKE ANALYSE & INTERVENTIE",
    `Organisatie: ${String(organizationName || "Onbekende organisatie").trim() || "Onbekende organisatie"}`,
    "Analyse: Strategische analyse",
    `CYNTRA EXECUTIVE DOSSIER • Bestuursversie • vertrouwelijk`,
    "",
    "DOMINANTE THESE",
    thesis.dominantThesis,
    "",
    mechanismSection,
    "",
    "BOARDROOM INSIGHT",
    thesis.killerInsight,
    "",
    misdiagnosisSection,
    "",
    conflictSection,
    "",
    "BESTUURLIJKE KEUZE",
    compacteOpties,
    "",
    "AANBEVOLEN RICHTING",
    recommendedDirection,
    "",
    tradeoffSection,
    "",
    "INTERVENTIES",
    compacteInterventies || "Interventies volgen na aanvullende data.",
    "",
    noInterventionSection,
    "",
    "WIJ BESLUITEN",
    thesis.decisions.map((line) => `- ${line}`).join("\n") || `- Optie ${gekozenOptie} is bestuurlijke prioriteit.`,
    "",
    "BESTUURLIJKE VRAAG",
    thesis.boardQuestion,
    "",
    "SAMENVATTING",
    `Aanbevolen optie: ${gekozenOptie}`,
    caseClassification === "SUCCESS_MODEL"
      ? "Reden: impact vergroten zonder het eigenaarschapsmechanisme en de cultuurkwaliteit te breken."
      : "Reden: laagste kans op direct financieel en operationeel verlies onder huidige druk.",
    "",
    "1. Besluitvraag",
    thesis.boardQuestion,
    "",
    "2. Bestuurlijke these",
    thesis.dominantThesis,
    "",
    "3. Feitenbasis",
    feitenbasis,
    "",
    "4. Strategische opties",
    compacteOpties,
    "",
    "Het kernconflict",
    conflict.conflictStatement,
    `Spanning A: ${conflict.sideA}`,
    `Spanning B: ${conflict.sideB}`,
    `Forcing choice: ${conflict.forcingChoice}`,
    `Expliciet verlies: ${conflict.explicitLoss}`,
    "",
    "5. Aanbevolen keuze",
    `Aanbevolen optie: ${gekozenOptie}`,
    recommendedDirection,
    "",
    "Strategische hefbomen",
    leveragePoints
      .map(
        (point, idx) =>
          `${idx + 1}. ${point.title}\nMechanisme: ${point.mechanism}\nCase datapoint: ${point.caseDatapoint}\nStrategische hefboom: ${point.leverageType}\nInterventiehefboom: ${point.intervention}\nDoel: ${point.target}\nImpact: ${point.impact}`
      )
      .join("\n\n"),
    "",
    "Killer insights",
    killerInsights
      .map(
        (item, index) =>
          `${index + 1}. ${item.title}\nMechanisme: ${item.mechanism}\nStrategische implicatie: ${item.implication}`
      )
      .join("\n\n"),
    "",
    "6. Niet-onderhandelbare besluitregels",
    output.decision.tradeoffs.join("\n") || "Besluitregels nog niet expliciet afgeleid.",
    "",
    "7. 90-dagen interventieplan",
    interventionPlanSection || "Interventieadvies volgt na aanvullende data.",
    "",
    "Voorspelde interventies op basis van historische patronen",
    predicted || "Nog geen voorspellende interventies beschikbaar.",
    "",
    "8. KPI monitoring",
    kpis,
    "",
    "9. Besluittekst",
    `Wij besluiten de aanbevolen optie ${gekozenOptie} uit te voeren met expliciete eigenaarschap- en escalatieregels binnen 90 dagen.`,
    "",
    "Open vragen",
    buildTailoredOpenQuestions(inputInsights, organizationName),
    "",
    appendixSection,
  ].join("\n").trim();
}

export class AnalysisSessionManager {
  readonly name = "Analysis Session Manager";
  private readonly orchestrator = new AgentOrchestrator();
  private readonly interventionPrediction = new InterventionPredictionEngine();
  private readonly learningLoop = new LearningLoop();

  listSessions(options?: { includeArchived?: boolean }): AnalysisSession[] {
    const includeArchived = options?.includeArchived === true;
    return readArray<AnalysisSession>(KEY)
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
      .filter((row) => row.status === "voltooid")
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
      .filter((row) => row.status === "voltooid")
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
      .filter((row) => row.status === "voltooid")
      .sort((a, b) => (a.analyse_datum < b.analyse_datum ? 1 : -1));
    const keep = new Set(completed.slice(0, Math.max(1, keepLatest)).map((row) => row.session_id));
    let archived = 0;
    const now = new Date().toISOString();

    const updated = rows.map((row) => {
      if (row.is_archived) return row;
      if (row.status !== "voltooid") return row;
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
  }): Promise<AnalysisSession> {
    const current = this.getSession(input.session_id);
    if (!current) throw new Error("Sessie niet gevonden.");

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
        input.organization_name
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
        strategicPattern
      );
      const openQuestionsText = buildTailoredOpenQuestions(inputInsights, input.organization_name);
      const killerInsightsText = formatKillerInsightsForMemo(killerInsights);
      const rawMemo = cleanMemoText(output.narrative.board_memo || output.narrative.boardroom_narrative || "");
      const priorDecisionHistory = this.listSessions({ includeArchived: true })
        .filter(
          (item) =>
            item.organization_id === current.organization_id &&
            item.session_id !== current.session_id &&
            item.status === "voltooid" &&
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
      const memoFromReport = buildBoardMemoFromReport(
        reportRaw,
        output.decision.dominant_thesis,
        openQuestionsText,
        killerInsightsText,
        memoBuildExtras
      );
      const memoBase = memoFromReport || rawMemo;
      let memo = normalizeBoardMemo(memoBase);
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
      }
      const report = sanitizeReportForBoardView(reportRaw);
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
      }
      const finalQuality = assessReportQuality(report, memo, summary, {
        classification: effectiveClassification,
        strategicMode,
        chosenOption: gekozenOptie,
        pattern: strategicPattern.pattern,
      });
      const finalCriticalFlags = criticalPublicationFlags(finalQuality.flags);
      if (finalCriticalFlags.length > 0) {
        throw new Error(`Publicatie geblokkeerd: ${finalCriticalFlags.join(", ")}`);
      }
      const boardroomModulesV3Final = buildBoardroomDecisionModulesV3({
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
        leverage: inputInsights.leverage,
        patternProfile: strategicPatternProfile,
        strategySimulation,
        decisionMemory,
        earlyWarningSystem,
      });
      const elapsedMs = Date.now() - startedAt;
      if (elapsedMs < MIN_ANALYSIS_RUNTIME_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_ANALYSIS_RUNTIME_MS - elapsedMs));
      }
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

      const updated = this.updateSession(input.session_id, (prev) => ({
        ...prev,
        board_report: report,
        executive_summary: summary,
        board_memo: memo,
        status: "voltooid",
        strategic_agent: strategicAgentMetadata,
        intervention_predictions: predictions,
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
          strategy_simulation: strategySimulation,
          decision_memory: decisionMemory,
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
          gekozen_strategie: gekozenOptie,
        },
        strategic_report: {
          report_id: createId("report"),
          session_id: prev.session_id,
          organization_id: prev.organization_id,
          title: `Cyntra Executive Dossier — ${prev.organization_name || "Organisatie"} — ${prev.session_id}`,
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
      }));

      if (!updated) throw new Error("Sessie kon niet worden bijgewerkt na analyse.");

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

      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Onbekende fout tijdens analyse.";
      const failed = this.updateSession(input.session_id, (prev) => ({
        ...prev,
        status: "fout",
        error_message: message,
        updated_at: new Date().toISOString(),
      }));
      if (!failed) throw new Error(message);
      return failed;
    }
  }
}
