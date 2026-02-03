import type { BoardroomBrief } from "./types";
import type { RunCyntraResult } from "@/aurelius/hooks/useCyntraAnalysis";

export function buildBoardroomBrief(
  intelligence: RunCyntraResult,
  context: string
): BoardroomBrief {
  return {
    executive_thesis:
      intelligence.report?.slice(0, 1200) ??
      "Geen executive thesis gegenereerd.",

    central_tension:
      "Spanning tussen huidige operationele realiteit en strategische noodzaak.",

    strategic_narrative: context,

    key_tradeoffs: [
      "Korte termijn stabiliteit versus lange termijn transformatie",
      "Decentrale autonomie versus centrale sturing",
    ],

    irreversible_decisions: [
      "Structuur van leiderschap",
      "Positionering in de markt",
    ],
  };
}
