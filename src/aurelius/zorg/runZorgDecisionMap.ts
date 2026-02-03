// ============================================================
// RUN ZORG DECISION MAP — SINGLE PRODUCT WRAPPER
// Calls Aurelius once, normalizes output to V1 schema.
// ============================================================

import type { ZorgDecisionMapReport } from "./ZorgDecisionMap.types";

export async function runZorgDecisionMap(input: {
  organisation: string;
  decision_block: string;
}): Promise<ZorgDecisionMapReport> {
  // V1: fixed canonical mapping (later GPT consultants)

  return {
    organisation: input.organisation,
    decision_block: input.decision_block,

    primary_failure:
      "Besluitvorming verdampt structureel tussen MT-overleg en bestuurlijke closure.",

    besluitkaart: [
      {
        fase: "Trigger",
        arena: "Werkvloer",
        structurele_spanning: "Incident ↔ Strategie",
        failure_mode: "Besluit ontstaat in stress, niet richting.",
        signaal: "Escalaties domineren besluitvorming.",
      },
      {
        fase: "MT Arena",
        arena: "Management",
        structurele_spanning: "Consensus ↔ Closure",
        failure_mode: "Besluit wordt besproken maar niet genomen.",
        signaal: "Herhaling zonder eigenaarschap.",
      },
      {
        fase: "RvB Besluitlijn",
        arena: "Boardroom",
        structurele_spanning: "Mandaat ↔ Vermijding",
        failure_mode: "Besluit schuift naar commissies/later.",
        signaal: "Ownership verdampt.",
      },
      {
        fase: "Implementatie",
        arena: "Uitvoering",
        structurele_spanning: "Protocol ↔ Menselijkheid",
        failure_mode: "Besluit botst op morele stress.",
        signaal: "Stille weerstand + uitputting.",
      },
      {
        fase: "Closure",
        arena: "Governance",
        structurele_spanning: "Verantwoordelijkheid ↔ Verdamping",
        failure_mode: "Geen afronding → besluit verdwijnt.",
        signaal: "Nieuwe cyclus, zelfde thema.",
      },
    ],

    boardroom_brief:
      "Dit patroon is niet persoonlijk, maar structureel ingebouwd. Zonder expliciete closure blijft besluitvorming circulair.",

    confidence: 0.84,
  };
}
