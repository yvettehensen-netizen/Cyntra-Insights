import type { StrategicAnalysisMap, StrategicInterventionMapItem, StrategicScenarioMapItem } from "./StrategicAnalysisMap";
import { normalizeMetadata } from "./normalizeMetadata";
import { StrategicTensionEngine } from "@/aurelius/core/StrategicTensionEngine";
import { InterventionEngine } from "@/aurelius/core/InterventionEngine";
import { StrategicMemoryEngine } from "@/aurelius/core/StrategicMemoryEngine";
import { StrategicFailureEngine } from "@/aurelius/core/StrategicFailureEngine";
import { MechanismEngine } from "@/aurelius/core/MechanismEngine";
import { StrategicQuestionEngine } from "@/aurelius/core/StrategicQuestionEngine";
import { StrategicPatternEngine } from "@/aurelius/core/StrategicPatternEngine";
import { BoardroomRedFlagEngine } from "@/aurelius/core/BoardroomRedFlagEngine";
import { runStrategyChallengeNode } from "@/aurelius/engine/nodes/strategy/StrategyChallengeNode";

export type BuildStrategicAnalysisMapInput = {
  organisation?: string;
  sector?: string;
  analysisDate?: string;
  dominantRisk?: string;
  strategicOptions?: string[];
  recommendedOption?: string;
  scenarioSimulationOutput?: string;
  interventionOutput?: string;
  memoryProblemText?: string;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function hasYouthConsortiumSignals(source: string): boolean {
  return /\b(jeugdzorg|ambulant|ambulante|consortium|triage|gemeent|contract|budget)\b/i.test(source);
}

function deriveDominantRisk(input: BuildStrategicAnalysisMapInput): string {
  const source = `${input.dominantRisk || ""}\n${input.memoryProblemText || ""}`;
  const dominantRisk = normalize(input.dominantRisk || "");
  if (
    hasYouthConsortiumSignals(source) &&
    (!dominantRisk ||
      /\bbestuurlijke inertie\b/i.test(dominantRisk) ||
      !/\b(consortium|triage|gemeent|contract|budget|ambulant)\b/i.test(dominantRisk))
  ) {
    return "Regionale triage, gemeentelijke contractruimte en budgetgedreven capaciteit begrenzen verbreding sneller dan extra activiteit oplost";
  }
  return dominantRisk || "onvoldoende informatie beschikbaar";
}

function deriveDecisionOptions(input: BuildStrategicAnalysisMapInput): string[] {
  const provided = (input.strategicOptions ?? []).map((item) => normalize(item)).filter(Boolean);
  const source = `${provided.join(" ")}\n${input.memoryProblemText || ""}\n${input.dominantRisk || ""}`;
  if (hasYouthConsortiumSignals(source)) {
    return [
      "Brede ambulante specialist blijven binnen consortium- en contractdiscipline",
      "Selectieve specialisatie / niche kiezen voor scherpere positionering",
      "Consortiumstrategie verdiepen om instroom en triage actiever te sturen",
    ];
  }
  return provided;
}

function buildFallbackScenarios(options: string[], dominantRisk: string): StrategicScenarioMapItem[] {
  if (options.length >= 3 && hasYouthConsortiumSignals(`${options.join(" ")} ${dominantRisk}`)) {
    return [
      {
        name: options[0],
        mechanism: "Behoud brede ambulante positionering, maar begrens verbreding op kerncapaciteit, contractruimte en kwaliteitsdiscipline.",
        risk: "De organisatie blijft bestuurlijk kwetsbaar als breedte behouden blijft zonder scherpere instroom- en portfoliokeuzes.",
        governanceImplication: "Bestuur moet kerncapaciteit prioriteren en verbreding alleen toestaan achter expliciete consortium- en contractgates.",
      },
      {
        name: options[1],
        mechanism: "Versmal het aanbod zodat teams, kwaliteit en contractonderhandeling rond een scherper profiel georganiseerd worden.",
        risk: "Te snelle versmalling kan regionale relevantie en continuiteit van instroom aantasten.",
        governanceImplication: "Bestuur moet bepalen welke zorgvormen strategisch kern zijn en welke bewust worden afgebouwd.",
      },
      {
        name: options[2],
        mechanism: "Vergroot invloed op regionale toegang door explicietere rol in consortium, triage en contractgesprekken.",
        risk: "Governancecomplexiteit stijgt als mandaat, eigenaarschap en regionale rolverdeling niet helder zijn.",
        governanceImplication: "Bestuur moet consortiumdoelen, mandaat en escalatieritme formeel vastleggen.",
      },
    ];
  }

  return options.slice(0, 3).map((option, index) => ({
    name: option || `Scenario ${String.fromCharCode(65 + index)}`,
    mechanism: "onvoldoende informatie beschikbaar",
    risk: dominantRisk || "onvoldoende informatie beschikbaar",
    governanceImplication: "onvoldoende informatie beschikbaar",
  }));
}

function extractScenarios(source: string, options: string[], dominantRisk: string): StrategicScenarioMapItem[] {
  const blocks = String(source ?? "")
    .match(/SCENARIO\s*[ABC][\s\S]*?(?=SCENARIO\s*[ABC]|###\s*SCENARIOVERGELIJKING|$)/gi) ?? [];

  const scenarios = blocks.map((block, index) => ({
    name:
      block.match(/SCENARIO\s*[ABC]\s*[—-]?\s*(.+)$/im)?.[1]?.trim() ||
      `Scenario ${String.fromCharCode(65 + index)}`,
    mechanism:
      block.match(/STRATEGISCHE LOGICA:\s*(.+)$/im)?.[1]?.trim() ||
      "onvoldoende informatie beschikbaar",
    risk:
      block.match(/RISICO'?S:\s*(.+)$/im)?.[1]?.trim() ||
      "onvoldoende informatie beschikbaar",
    governanceImplication:
      block.match(/BESTUURLIJKE IMPLICATIE:\s*(.+)$/im)?.[1]?.trim() ||
      block.match(/ORGANISATORISCHE CONSEQUENTIES:\s*(.+)$/im)?.[1]?.trim() ||
      "onvoldoende informatie beschikbaar",
  }));

  const hasGenericLabels = scenarios.some((item) =>
    /\b(volumegroei|status quo|hybride|optie a\b|optie b\b|optie c\b)\b/i.test(
      `${item.name} ${item.mechanism} ${item.risk}`
    )
  );

  if (!scenarios.length || hasGenericLabels) {
    return buildFallbackScenarios(options, dominantRisk);
  }

  return scenarios;
}

function fallbackInterventions(): StrategicInterventionMapItem[] {
  return [
    {
      action: "Bestuurlijke prioritering expliciet maken",
      reason: "Voorkomt parallelle prioriteiten zonder keuzevolgorde.",
      risk: "Uitstel vergroot druk op uitvoering en marge.",
      stopRule: "Herzie direct bij wachttijd > 12 weken of marge < 4%",
      owner: "Bestuur",
      deadline: "30 dagen",
      KPI: "Besluitdiscipline en wachtdruk verbeteren aantoonbaar",
    },
  ];
}

export function buildStrategicAnalysisMap(input: BuildStrategicAnalysisMapInput): StrategicAnalysisMap {
  const metadata = normalizeMetadata({
    organisation: input.organisation,
    sector: input.sector,
    analysisDate: input.analysisDate,
  });
  const dominantRisk = deriveDominantRisk(input);
  const decisionOptions = deriveDecisionOptions(input);
  const tensionEngine = new StrategicTensionEngine();
  const tension = tensionEngine.identifyDominantTension(decisionOptions, dominantRisk);
  const interventionEngine = new InterventionEngine();
  const mechanismEngine = new MechanismEngine();
  const strategicQuestionEngine = new StrategicQuestionEngine();
  const strategicPatternEngine = new StrategicPatternEngine();
  const redFlagEngine = new BoardroomRedFlagEngine();
  const rawInterventions = interventionEngine
    .generateInterventions(input.interventionOutput || "")
    .map((item) => interventionEngine.generateKPIs(interventionEngine.generateStopRules(interventionEngine.assignOwner(item))));
  const memoryEngine = new StrategicMemoryEngine();
  const failureEngine = new StrategicFailureEngine();
  const memoryInsights = memoryEngine.trackOutcome(
    normalize(input.memoryProblemText || dominantRisk || "onvoldoende informatie beschikbaar"),
    metadata.sector
  );
  const preferredFromMemory =
    memoryInsights.rankedRecommendations.find((item) =>
      decisionOptions.some((option) => normalize(option).toLowerCase() === item.recommendation.toLowerCase())
    )?.recommendation || memoryInsights.dominantRecommendation;
  const resolvedRecommendation = normalize(
    input.recommendedOption || preferredFromMemory || tension.optionA || "onvoldoende informatie beschikbaar"
  );
  const interventions = rawInterventions.map((item, index) => ({
    ...item,
    action:
      /^Interventie\s+\d+/i.test(item.action)
        ? `${item.action}: borg ${index % 2 === 0 ? "kerncapaciteit" : "contractdiscipline"} rond ${resolvedRecommendation.toLowerCase()}`
        : item.action,
    reason: normalize(
      `${item.reason} Gekoppeld aan ${resolvedRecommendation.toLowerCase()} en ${dominantRisk.toLowerCase()}.`
    ),
  }));
  const strategyChallenge = runStrategyChallengeNode({
    dominantRisk,
    decisionOptions,
    recommendedOption: resolvedRecommendation,
    sourceText: input.memoryProblemText,
  });
  const strategicPattern = strategicPatternEngine.run({
    sector: metadata.sector,
    sourceText: input.memoryProblemText,
    dominantRisk,
    decisionOptions,
    recommendedOption: resolvedRecommendation,
  });

  return {
    organisation: metadata.organisation,
    sector: metadata.sector,
    analysisDate: metadata.analysisDate,
    dominantRisk,
    strategicTension: {
      optionA: tension.optionA,
      optionB: tension.optionB,
    },
    decisionOptions,
    recommendedOption: resolvedRecommendation,
    strategicPattern,
    strategyChallenge,
    systemMechanism: mechanismEngine.run({
      strategy: resolvedRecommendation,
      dominantRisk: strategicPattern.dominantRisk || dominantRisk,
      sourceText: `${input.memoryProblemText || ""} ${strategicPattern.mechanism} ${strategicPattern.primaryPattern} ${strategicPattern.secondaryPattern}`,
      externalPressure: strategyChallenge.externalPressure,
    }),
    strategicQuestions: strategicQuestionEngine.run({
      organisation: metadata.organisation,
      sector: metadata.sector,
      strategy: resolvedRecommendation,
      dominantRisk,
      decisionOptions,
      sourceText: input.memoryProblemText,
    }),
    boardroomRedFlags: redFlagEngine.run({
      sector: metadata.sector,
      dominantRisk,
      sourceText: input.memoryProblemText,
      recommendedOption: resolvedRecommendation,
      decisionOptions,
    }),
    strategicFailurePoints: failureEngine.run({
      strategy: resolvedRecommendation,
      options: decisionOptions,
      dominantRisk,
      sourceText: input.memoryProblemText,
    }),
    memoryInsights: {
      historicalOutcome: memoryInsights.historicalOutcome,
      patternMatchScore: memoryInsights.patternMatchScore,
      dominantRecommendation: memoryInsights.dominantRecommendation,
      rankedRecommendations: memoryInsights.rankedRecommendations,
    },
    scenarios: extractScenarios(input.scenarioSimulationOutput || "", decisionOptions, dominantRisk),
    interventions: interventions.length ? interventions : fallbackInterventions(),
  };
}
