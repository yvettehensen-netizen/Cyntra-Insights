// ============================================================
// CYNTRA INTERVENTION LIBRARY — DECISION-GRADE
// ============================================================

import { CyntraIntervention } from "./cyntraIntervention.types";

export const CYNTRA_INTERVENTIONS: CyntraIntervention[] = [
  {
    id: "CI-001",
    name: "Bestuurlijke Stop-Beslissing",
    systemFailure: "besluitvorming",
    level: "strategie",
    painStatement:
      "Het bestuur weet dat er te veel loopt, maar vermijdt expliciete stop-keuzes uit angst voor interne frictie.",
    forcedStop:
      "Nieuwe initiatieven zonder expliciete beëindiging van bestaande trajecten.",
    enforcedChange:
      "Elke nieuwe strategische keuze vereist een openbaar stop-besluit.",
    decisionOwner: "Voorzitter RvB",
    irreversibility:
      "Budgetten en capaciteit vervallen binnen 14 dagen na besluit.",
    damageIfIgnored:
      "Structurele focuserosie en bestuurlijke aansprakelijkheid bij falen.",
  },

  {
    id: "CI-002",
    name: "Eén-Handtekening-Principe",
    systemFailure: "besluitvorming",
    level: "organisatie",
    painStatement:
      "Besluiten verdwijnen in overlegstructuren omdat niemand eindverantwoordelijkheid neemt.",
    forcedStop:
      "Besluiten zonder expliciete eigenaar of eindverantwoordelijke.",
    enforcedChange:
      "Elk strategisch besluit kent exact één besluitdrager.",
    decisionOwner: "CEO",
    irreversibility:
      "Besluiten zonder handtekening worden niet uitgevoerd.",
    damageIfIgnored:
      "Besluitvorming blijft vrijblijvend en executie faalt structureel.",
  },

  {
    id: "CI-003",
    name: "Strategische Beperking",
    systemFailure: "focus",
    level: "strategie",
    painStatement:
      "De organisatie probeert meerdere strategische richtingen tegelijk te volgen.",
    forcedStop:
      "Parallelle strategische prioriteiten buiten de kern.",
    enforcedChange:
      "Maximaal drie strategische prioriteiten voor de komende 12 maanden.",
    decisionOwner: "RvB",
    irreversibility:
      "Niet-geselecteerde initiatieven verliezen formele status.",
    damageIfIgnored:
      "Verdunning van middelen en verlies van strategische geloofwaardigheid.",
  },

  {
    id: "CI-004",
    name: "Anti-Strategie",
    systemFailure: "focus",
    level: "strategie",
    painStatement:
      "Onduidelijkheid over wat expliciet niet wordt nagestreefd.",
    forcedStop:
      "Stilzwijgende uitzonderingen en informele omwegen.",
    enforcedChange:
      "Publicatie van een expliciete Anti-Strategie.",
    decisionOwner: "RvB",
    irreversibility:
      "Afwijkingen vereisen expliciete bestuursgoedkeuring.",
    damageIfIgnored:
      "Strategische keuzes worden uitgehold door uitzonderingen.",
  },

  {
    id: "CI-005",
    name: "Eigenaarschapssanering",
    systemFailure: "governance",
    level: "organisatie",
    painStatement:
      "Verantwoordelijkheid is verspreid en daardoor betekenisloos.",
    forcedStop:
      "KPI’s zonder expliciete eigenaar.",
    enforcedChange:
      "Elke KPI krijgt één verantwoordelijke functiehouder.",
    decisionOwner: "Directie",
    irreversibility:
      "Niet-toegewezen KPI’s worden niet gerapporteerd.",
    damageIfIgnored:
      "Sturing blijft cosmetisch en prestaties blijven onvoorspelbaar.",
  },

  {
    id: "CI-006",
    name: "Teamcontract",
    systemFailure: "teamdynamiek",
    level: "team",
    painStatement:
      "Teams opereren zonder expliciet mandaat of afbakening.",
    forcedStop:
      "Impliciete verwachtingen en informele afspraken.",
    enforcedChange:
      "Schriftelijk teammandaat met outputdefinitie.",
    decisionOwner: "MT-lid",
    irreversibility:
      "Afwijkingen worden direct geëscaleerd.",
    damageIfIgnored:
      "Interne frictie en structurele misverstanden.",
  },

  {
    id: "CI-007",
    name: "Leiderschapsconfrontatie",
    systemFailure: "leiderschap",
    level: "individu",
    painStatement:
      "Leiders vermijden expliciete positie om relaties te sparen.",
    forcedStop:
      "Meebewegen zonder eigenaarschap.",
    enforcedChange:
      "Leiders spreken expliciet uit: ‘Dit is mijn besluit’.",
    decisionOwner: "Bestuur",
    irreversibility:
      "Besluiten worden persoonlijk toegewezen.",
    damageIfIgnored:
      "Organisatie blijft sturen op impliciete macht.",
  },

  {
    id: "CI-008",
    name: "Besluit-naar-Actie-Vertaling",
    systemFailure: "executie",
    level: "organisatie",
    painStatement:
      "Besluiten blijven abstract en worden niet vertaald naar acties.",
    forcedStop:
      "Strategische besluiten zonder uitvoeringspad.",
    enforcedChange:
      "Elk besluit krijgt acties, eigenaar en deadline.",
    decisionOwner: "Directie",
    irreversibility:
      "Besluiten zonder actieplan vervallen.",
    damageIfIgnored:
      "Strategie blijft papier en vertrouwen erodeert.",
  },
];
