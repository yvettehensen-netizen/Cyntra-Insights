// ============================================================
// ZORG BESLUITVORMINGSKAART CONSULTANT — CANON
// ============================================================

import type {
  Consultant,
  ConsultantContext,
  ConsultantResult,
} from "../orchestrator/consultantTypes";

export const zorgBesluitkaartConsultant: Consultant = {
  key: "zorg_besluitvormingskaart",
  name: "Zorg Besluitvormingskaart Consultant",
  domain: "healthcare-decision-governance",

  async execute(context: ConsultantContext): Promise<ConsultantResult> {
    return {
      content: [
        {
          node: "Initiatief / Incident",
          functie: "Besluit ontstaat door druk (kwaliteit, personeel, incident).",
          spanning: "Reactie ↔ Strategie",
          failure_mode: "Besluit start in stress, niet in richting.",
          signal: "Ad-hoc escalaties domineren.",
          interventie: "Codificeer vaste besluittriggers.",

          // ======================================================
          // ✅ ADD ONLY — V2 OUTPUT COMPATIBILITY FIELDS
          // Frontend verwacht deze naming
          // ======================================================
          fase: "Initiatief / Incident",
          arena: "Werkvloer trigger",
          structurele_spanning: "Reactie ↔ Strategie",
          signaal: "Ad-hoc escalaties domineren.",
        },
        {
          node: "MT Overleg",
          functie: "Eerste formele bespreking.",
          spanning: "Consensus ↔ Closure",
          failure_mode: "Besluit wordt rondgesproken, niet genomen.",
          signal: "Herhaling zonder besluitmoment.",
          interventie: "Verplicht closure per cyclus.",

          // ✅ ADD ONLY — V2 fields
          fase: "MT Overleg",
          arena: "Managementteam",
          structurele_spanning: "Consensus ↔ Closure",
          signaal: "Herhaling zonder besluitmoment.",
        },
        {
          node: "Bestuur / RvB Arena",
          functie: "Governance autoriseert.",
          spanning: "Mandaat ↔ Vermijding",
          failure_mode: "Besluit schuift door naar commissies.",
          signal: "Escalatie zonder ownership.",
          interventie: "Besluitrecht expliciet toewijzen.",

          // ✅ ADD ONLY — V2 fields
          fase: "Bestuur / RvB Arena",
          arena: "Boardroom governance",
          structurele_spanning: "Mandaat ↔ Vermijding",
          signaal: "Escalatie zonder ownership.",
        },
        {
          node: "Werkvloer Uitvoering",
          functie: "Implementatie realiteit.",
          spanning: "Protocol ↔ Menselijkheid",
          failure_mode: "Besluit botst op morele druk en werkdruk.",
          signal: "Stille weerstand en uitputting.",
          interventie: "Onderstroom zichtbaar maken vóór implementatie.",

          // ✅ ADD ONLY — V2 fields
          fase: "Werkvloer Uitvoering",
          arena: "Uitvoering",
          structurele_spanning: "Protocol ↔ Menselijkheid",
          signaal: "Stille weerstand en uitputting.",
        },
        {
          node: "Closure & Accountability",
          functie: "Afronding, feedback, borging.",
          spanning: "Verantwoordelijkheid ↔ Verdamping",
          failure_mode: "Geen echte afronding → besluit verdwijnt.",
          signal: "Nieuwe ronde, zelfde onderwerp.",
          interventie: "Boardroom audit trail verplicht.",

          // ✅ ADD ONLY — V2 fields
          fase: "Closure & Accountability",
          arena: "Ownership layer",
          structurele_spanning: "Verantwoordelijkheid ↔ Verdamping",
          signaal: "Nieuwe ronde, zelfde onderwerp.",
        },
      ],
      confidence: 0.86,
    };
  },
};
