import { Intervention } from "./intervention.types";

export const INTERVENTION_LIBRARY: Record<
  string,
  Record<string, Intervention[]>
> = {
  Strategie: {
    focusverlies: [
      {
        id: "strat-focus-1",
        level: "strategie",
        issue: "focusverlies",
        description: "Stoppen met parallelle strategische prioriteiten",
        behavior_change: "Bestuur dwingt expliciete stop-keuzes af",
        consequence_if_not_done:
          "Executie blijft versnipperd en strategische impact blijft uit",
        impact_level: "Hoog",
        implementation_steps: [
          "Inventariseer alle lopende initiatieven",
          "Bepaal top-3 strategische prioriteiten",
          "Stop expliciet alle overige initiatieven",
          "Heralloceer mensen en budget",
        ],
        metrics: [
          "Aantal actieve strategische initiatieven",
          "Doorlooptijd strategische besluiten",
        ],
        risks: [
          "Politieke weerstand",
          "Tijdelijke productiviteitsdip",
        ],
        related_interventions: ["org-decision-1"],
      },
    ],
  },

  Organisatie: {
    besluiteloosheid: [
      {
        id: "org-decision-1",
        level: "organisatie",
        issue: "besluiteloosheid",
        description: "Herinrichten van besluitrechten",
        behavior_change: "Besluiten worden genomen waar ze horen",
        consequence_if_not_done:
          "Escalaties en vertraging blijven structureel",
        impact_level: "Hoog",
        implementation_steps: [
          "Bepaal top-20 besluiten",
          "Wijs per besluit één eindverantwoordelijke aan",
          "Leg vast in governance-document",
        ],
        metrics: [
          "Besluitdoorlooptijd",
          "Aantal escalaties per kwartaal",
        ],
        risks: [
          "Overbelasting sleutelrollen",
        ],
        related_interventions: ["strat-focus-1"],
      },
    ],
  },
};
