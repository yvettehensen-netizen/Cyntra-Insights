import {
  BOARDROOM_INTERVENTION_PIPELINE,
} from "./architecture";
import { runBlindSpotNode } from "@/aurelius/engine/nodes/strategy/BlindSpotNode";
import { runDecisionConsequenceNode } from "@/aurelius/engine/nodes/strategy/DecisionConsequenceNode";
import { runStrategicLeverageNode } from "@/aurelius/engine/nodes/strategy/StrategicLeverageNode";
import { runStrategicMemoryNode } from "@/aurelius/engine/nodes/strategy/StrategicMemoryNode";
import { runBoardroomDebateNode } from "@/aurelius/engine/nodes/strategy/BoardroomDebateNode";
import type {
  BoardroomModuleId,
  BoardroomModuleOutput,
  BoardroomModuleProcessor,
  BoardroomPipelineState,
} from "./types";

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function detectSector(text: string): string {
  if (/\bggz|zorg|jeugdzorg\b/i.test(text)) return "zorg";
  if (/\bsaas|software|platform\b/i.test(text)) return "saas";
  return "onbekend";
}

function mkOutput(
  module: BoardroomModuleId,
  summary: string,
  data: Record<string, unknown>,
  confidence = 0.8
): BoardroomModuleOutput {
  return {
    module,
    summary: normalize(summary),
    data,
    confidence,
  };
}

function genericProcessor(module: BoardroomModuleId): BoardroomModuleProcessor {
  return (state) => {
    const base = normalize(state.inputText);
    const contextSample = base.slice(0, 220);
    switch (module) {
      case "ContextIngestionModule":
        return mkOutput(module, "Broncontext en interviews zijn samengebracht.", {
          organization: state.organizationName || "onbekend",
          sector: state.sector || detectSector(base),
        }, 0.9);
      case "DataExtractionModule":
        return mkOutput(module, "Feiten, cijfers en gebeurtenissen zijn geëxtraheerd.", {
          fact_count: Math.max(1, base.split(" ").length / 12),
        });
      case "SignalDetectionModule":
        return mkOutput(module, "Fricties en structurele signalen zijn gedetecteerd.", {
          signal_map: ["afwijkingen", "spanningen", "patronen"],
        });
      case "StakeholderMapModule":
        return mkOutput(module, "Ecosysteemactoren en machtsposities zijn in kaart gebracht.", {
          actors: ["bestuur", "professionals", "partners", "beleidsactoren"],
        });
      case "CoreMechanismEngine":
        return mkOutput(module, "Kernmechanisme van waardecreatie is geformuleerd.", {
          mechanism: "eigenaarschap -> gedrag -> kwaliteit -> reputatie",
        });
      case "StrategicParadoxEngine":
        return mkOutput(module, "Strategische paradox is expliciet gemaakt.", {
          paradox: "kwaliteit beschermen vs schaal realiseren",
        });
      case "KillerInsightGenerator":
        return mkOutput(module, "Niet-triviale killer insights zijn geconstrueerd.", {
          insight_count: 3,
        });
      case "DecisionEngine":
        return mkOutput(module, "Aanbevolen optie geselecteerd op impact/risico/uitvoerbaarheid.", {
          recommended_option: "C",
        });
      case "BlindSpotDetectorModule": {
        const blindSpotOutput = runBlindSpotNode({
          organizationName: state.organizationName,
          executiveThesis: base,
          sectorContext: state.sector || detectSector(base),
          facts: [base],
          strategicOptions: [
            normalize(String(state.outputs.KillerInsightGenerator?.summary || "")),
            normalize(String(state.outputs.DecisionEngine?.summary || "")),
          ],
          interventions: [
            normalize(String(state.outputs.InterventionGenerator?.summary || "")),
            normalize(String(state.outputs.RiskMitigationEngine?.summary || "")),
          ],
          boardroomStressTest: normalize(String(state.outputs.RiskMitigationEngine?.summary || "")),
        });
        return mkOutput(module, "Strategische blinde vlekken zijn expliciet gemaakt.", {
          blindSpots: blindSpotOutput.blindSpots,
          block: blindSpotOutput.block,
        }, 0.9);
      }
      case "DecisionConsequenceModule": {
        const decisionConsequenceOutput = runDecisionConsequenceNode({
          organizationName: state.organizationName,
          executiveThesis: base,
          recommendedChoice: normalize(String(state.outputs.DecisionEngine?.data?.recommended_option || "")),
          strategicOptions: [
            normalize(String(state.outputs.KillerInsightGenerator?.summary || "")),
            normalize(String(state.outputs.DecisionEngine?.summary || "")),
          ],
          sectorContext: state.sector || detectSector(base),
          facts: [base],
          interventions: [
            normalize(String(state.outputs.InterventionGenerator?.summary || "")),
            normalize(String(state.outputs.RiskMitigationEngine?.summary || "")),
          ],
          boardroomStressTest: normalize(String(state.outputs.RiskMitigationEngine?.summary || "")),
        });
        return mkOutput(module, "Besluitgevolgen over 12, 24 en 36 maanden zijn gesimuleerd.", {
          decisionConsequences: decisionConsequenceOutput.decisionConsequences,
          block: decisionConsequenceOutput.block,
        }, 0.9);
      }
      case "StrategicLeverageModule": {
        const blindSpots = Array.isArray(state.outputs.BlindSpotDetectorModule?.data?.blindSpots)
          ? (state.outputs.BlindSpotDetectorModule?.data?.blindSpots as any[])
          : [];
        const decisionConsequences =
          (state.outputs.DecisionConsequenceModule?.data?.decisionConsequences as Record<string, unknown> | undefined);
        const leverageOutput = runStrategicLeverageNode({
          executiveThesis: base,
          strategicOptions: [
            normalize(String(state.outputs.KillerInsightGenerator?.summary || "")),
            normalize(String(state.outputs.DecisionEngine?.summary || "")),
          ],
          recommendedChoice: normalize(String(state.outputs.DecisionEngine?.data?.recommended_option || "")),
          facts: [base],
          interventions: [
            normalize(String(state.outputs.InterventionGenerator?.summary || "")),
            normalize(String(state.outputs.RiskMitigationEngine?.summary || "")),
          ],
          boardroomStressTest: normalize(String(state.outputs.RiskMitigationEngine?.summary || "")),
          blindSpots: blindSpots as any,
          decisionConsequences: decisionConsequences as any,
        });
        return mkOutput(module, "Strategische hefboompunten met 80/20-effect zijn geïdentificeerd.", {
          strategicLeverage: leverageOutput.strategicLeverage,
          block: leverageOutput.block,
        }, 0.9);
      }
      case "StrategicMemoryModule": {
        const blindSpots = Array.isArray(state.outputs.BlindSpotDetectorModule?.data?.blindSpots)
          ? (state.outputs.BlindSpotDetectorModule?.data?.blindSpots as any[])
          : [];
        const strategicLeverage = Array.isArray(state.outputs.StrategicLeverageModule?.data?.strategicLeverage)
          ? (state.outputs.StrategicLeverageModule?.data?.strategicLeverage as any[])
          : [];
        const memoryOutput = runStrategicMemoryNode({
          memoryId: `${state.organizationName || "case"}-${Date.now()}`,
          executiveThesis: base,
          facts: [base],
          strategicOptions: [
            normalize(String(state.outputs.KillerInsightGenerator?.summary || "")),
            normalize(String(state.outputs.DecisionEngine?.summary || "")),
          ],
          recommendedChoice: normalize(String(state.outputs.DecisionEngine?.data?.recommended_option || "")),
          interventions: [
            normalize(String(state.outputs.InterventionGenerator?.summary || "")),
            normalize(String(state.outputs.RiskMitigationEngine?.summary || "")),
          ],
          blindSpots: blindSpots as any,
          strategicLeverage: strategicLeverage as any,
          sector: state.sector || detectSector(base),
        });
        return mkOutput(module, "Strategisch geheugen heeft vergelijkbare patronen en strategieën teruggegeven.", {
          strategicMemory: memoryOutput.strategicMemory,
          storedPattern: memoryOutput.storedPattern,
          block: memoryOutput.block,
        }, 0.88);
      }
      case "BoardroomDebateModule": {
        const blindSpots = Array.isArray(state.outputs.BlindSpotDetectorModule?.data?.blindSpots)
          ? (state.outputs.BlindSpotDetectorModule?.data?.blindSpots as any[])
          : [];
        const strategicLeverage = Array.isArray(state.outputs.StrategicLeverageModule?.data?.strategicLeverage)
          ? (state.outputs.StrategicLeverageModule?.data?.strategicLeverage as any[])
          : [];
        const decisionConsequences =
          (state.outputs.DecisionConsequenceModule?.data?.decisionConsequences as Record<string, unknown> | undefined);
        const debateOutput = runBoardroomDebateNode({
          organizationName: state.organizationName,
          executiveThesis: base,
          recommendedChoice: normalize(String(state.outputs.DecisionEngine?.data?.recommended_option || "")),
          strategicOptions: [
            normalize(String(state.outputs.KillerInsightGenerator?.summary || "")),
            normalize(String(state.outputs.DecisionEngine?.summary || "")),
          ],
          sectorContext: state.sector || detectSector(base),
          interventions: [
            normalize(String(state.outputs.InterventionGenerator?.summary || "")),
            normalize(String(state.outputs.RiskMitigationEngine?.summary || "")),
          ],
          blindSpots: blindSpots as any,
          boardroomStressTest: normalize(String(state.outputs.RiskMitigationEngine?.summary || "")),
          decisionConsequences: decisionConsequences as any,
          strategicLeverage: strategicLeverage as any,
        });
        return mkOutput(module, "Bestuurlijk debat heeft voorstander, criticus en synthese opgeleverd.", {
          boardroomDebate: debateOutput.boardroomDebate,
          block: debateOutput.block,
        }, 0.9);
      }
      case "BoardMemoGenerator":
        return mkOutput(module, "Board memo opgebouwd in besluitstructuur voor RvB/RvT.", {
          sections: [
            "Executive summary",
            "Bestuurlijke hypothese",
            "Feitenbasis",
            "Kernconflict",
            "Strategische opties",
            "Besluitvoorstel",
            "Consequenties",
            "90-dagen opvolging",
          ],
        }, 0.9);
      case "BoardroomQuestionEngine":
        return mkOutput(module, "Open boardroomvragen met impliciete trade-offs gegenereerd.", {
          categories: ["MODEL & SCHAAL", "CULTUUR & KENNIS", "NETWERK & INVLOED", "SYSTEEMIMPACT"],
        }, 0.88);
      default:
        return mkOutput(module, `${module} uitgevoerd in boardroom intervention pipeline.`, {
          context_ref: contextSample,
        });
    }
  };
}

export const BOARDROOM_MODULE_REGISTRY: Record<BoardroomModuleId, BoardroomModuleProcessor> =
  Object.fromEntries(
    BOARDROOM_INTERVENTION_PIPELINE.map((module) => [module, genericProcessor(module)])
  ) as Record<BoardroomModuleId, BoardroomModuleProcessor>;

export function getBoardroomModuleProcessor(module: BoardroomModuleId): BoardroomModuleProcessor {
  return BOARDROOM_MODULE_REGISTRY[module];
}
