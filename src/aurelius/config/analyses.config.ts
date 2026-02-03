// ============================================================
// ANALYSIS REGISTRY — CANONICAL & TYPE-SAFE
// Pad: src/aurelius/config/analyses.config.ts
// ============================================================

import {
  Target,
  LineChart,
  Users,
  BarChart3,
  Crown,
  Workflow,
  ShieldAlert,
  Cpu,
  Boxes,
  Lightbulb,
} from "lucide-react";

import type { CyntraAnalysisConfig } from "@/aurelius/config/CyntraAnalysisConfig";

/* ============================================================
   ANALYSIS REGISTRY
============================================================ */

export const ANALYSES: Record<string, CyntraAnalysisConfig> = {
  strategy: {
    title: "Strategische Analyse",
    subtitle: "Waar moet deze organisatie écht voor kiezen?",
    analysisType: "strategy",
    accent: "#7A1E2B",
    icon: Target,
    minWords: 9000,
    depthDefault: "boardroom",
    strategicWeight: 5,

    /* ✅ ADDITION — EXECUTIVE INTAKE QUESTIONS */
    intakeQuestions: [
      "Wat is de belangrijkste strategische keuze die nu moet vallen?",
      "Waar zit de grootste spanning tussen ambitie en realiteit?",
      "Welke richting wordt intern vermeden of uitgesteld?",
      "Wat zou over 12 maanden een strategische mislukking betekenen?",
      "Wat is het ene besluit dat alles versnelt?",
    ],
  },

  finance: {
    title: "Financiële Gezondheid",
    subtitle: "Waar ontstaat waarde — en waar verdampt zij?",
    analysisType: "finance",
    accent: "#8B1538",
    icon: LineChart,
    minWords: 8000,
    depthDefault: "boardroom",
    strategicWeight: 4,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Wat is de huidige omzet en cash runway (in maanden)?",
      "Waar lekt geld weg zonder duidelijke ROI?",
      "Welke kostenpost is structureel onbeheersbaar geworden?",
      "Wat is de grootste financiële bottleneck vandaag?",
      "Welke beslissing moet deze maand vallen om stabiliteit te behouden?",
    ],
  },

  financial_strategy: {
    title: "Financiële Strategie",
    subtitle: "Kapitaal, investeringen en rendement",
    analysisType: "financial_strategy",
    accent: "#5E0F2E",
    icon: LineChart,
    minWords: 9000,
    depthDefault: "boardroom",
    strategicWeight: 5,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Welke investeringen zijn de komende 12 maanden cruciaal?",
      "Wat moet rendement opleveren — en wat is ballast?",
      "Hoe ziet een gezonde kapitaalstructuur eruit voor deze organisatie?",
      "Welke financiële keuze is onomkeerbaar als je te lang wacht?",
      "Wat moet prioriteit krijgen: winst, groei of stabiliteit?",
    ],
  },

  growth: {
    title: "Groei & Schaalbaarheid",
    subtitle: "Wat houdt groei tegen — en wat versnelt haar?",
    analysisType: "growth",
    accent: "#4F1D2C",
    icon: BarChart3,
    minWords: 8000,
    depthDefault: "boardroom",
    strategicWeight: 4,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Waar stokt groei vandaag concreet?",
      "Wat is het grootste schaalprobleem in people/process/tech?",
      "Welke klantgroep of marktsegment groeit sneller dan jullie capaciteit?",
      "Wat is de groeifout die jullie steeds herhalen?",
      "Wat moet radicaal anders om door te breken?",
    ],
  },

  market: {
    title: "Markt & Concurrentie",
    subtitle: "Positionering onder druk of klaar voor versnelling?",
    analysisType: "market",
    accent: "#6E2338",
    icon: BarChart3,
    minWords: 8000,
    depthDefault: "boardroom",
    strategicWeight: 4,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Wie is jullie echte concurrent (niet op papier, maar in gedrag)?",
      "Waar verliezen jullie positionering of pricing power?",
      "Wat is de belangrijkste marktverschuiving nu?",
      "Waar zit het unieke voordeel dat onvoldoende benut wordt?",
      "Wat is het risico als je niets verandert?",
    ],
  },

  process: {
    title: "Proces & Operatie",
    subtitle: "Efficiëntie is geen toeval — bottlenecks wel.",
    analysisType: "process",
    accent: "#3D0E1E",
    icon: Workflow,
    minWords: 7000,
    depthDefault: "full",
    strategicWeight: 3,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Waar loopt execution structureel vast?",
      "Welke bottleneck vertraagt alles?",
      "Waar ontstaat onnodige complexiteit of verspilling?",
      "Wat kost vandaag energie zonder output?",
      "Welke procesbeslissing moet nu genomen worden?",
    ],
  },

  leadership: {
    title: "Leiderschap & Governance",
    subtitle: "Wie stuurt écht — en wie zou moeten sturen?",
    analysisType: "leadership",
    accent: "#8B1538",
    icon: Crown,
    minWords: 8000,
    depthDefault: "boardroom",
    strategicWeight: 5,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Wie neemt daadwerkelijk beslissingen vs. formeel leiderschap?",
      "Waar zit governance-frictie of besluiteloosheid?",
      "Welke leiderschapskwestie wordt niet uitgesproken?",
      "Wat is de grootste blokkade in accountability?",
      "Welke CEO-beslissing wordt vermeden?",
    ],
  },

  team_culture: {
    title: "Team & Cultuur",
    subtitle: "De onderstroom bepaalt alles wat boven water gebeurt.",
    analysisType: "team_culture",
    accent: "#7A1E2B",
    icon: Users,
    minWords: 7000,
    depthDefault: "full",
    strategicWeight: 3,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Wat wordt intern gevoeld maar niet gezegd?",
      "Waar zit spanning tussen teams of lagen?",
      "Welke cultuur is ontstaan ondanks intenties?",
      "Waar verdwijnt ownership?",
      "Wat moet besproken worden om verder te kunnen?",
    ],
  },

  team_dynamics: {
    title: "Teamdynamiek",
    subtitle: "Samenwerking, spanning en besluitvorming",
    analysisType: "team_dynamics",
    accent: "#6E2338",
    icon: Users,
    minWords: 7000,
    depthDefault: "full",
    strategicWeight: 3,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Waar botst samenwerking structureel?",
      "Welke personen of rollen houden spanning vast?",
      "Welke besluiten blijven hangen door teamfrictie?",
      "Wat gebeurt er als druk stijgt?",
      "Wat moet nu uitgesproken worden?",
    ],
  },

  change_resilience: {
    title: "Veranderkracht",
    subtitle: "Hoe veerkrachtig is de organisatie écht?",
    analysisType: "change_resilience",
    accent: "#4F1D2C",
    icon: ShieldAlert,
    minWords: 8000,
    depthDefault: "boardroom",
    strategicWeight: 4,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Welke verandering is urgent maar wordt uitgesteld?",
      "Wat breekt als de druk stijgt?",
      "Waar zit verandermoeheid?",
      "Wat is het vermogen tot executie onder onzekerheid?",
      "Welke stap is nodig om momentum terug te krijgen?",
    ],
  },

  onderstroom: {
    title: "Onderstroom",
    subtitle: "Wat wordt niet gezegd, maar stuurt alles?",
    analysisType: "onderstroom",
    accent: "#5E0F2E",
    icon: Users,
    minWords: 8000,
    depthDefault: "full",
    strategicWeight: 4,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Wat wordt hier structureel vermeden?",
      "Welke spanning bepaalt gedrag achter de schermen?",
      "Wat is de echte machtstructuur?",
      "Waar zit angst of statusbescherming?",
      "Wat zou gezegd moeten worden om vrij te komen?",
    ],
  },

  esg: {
    title: "ESG & Duurzaamheid",
    subtitle: "Impact, compliance en toekomstbestendigheid",
    analysisType: "esg",
    accent: "#3D0E1E",
    icon: ShieldAlert,
    minWords: 8000,
    depthDefault: "boardroom",
    strategicWeight: 4,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Welke ESG-druk komt eraan vanuit markt of regelgeving?",
      "Waar zit reputatierisico of compliance exposure?",
      "Wat is duurzame strategie vs. marketinglaag?",
      "Welke investering maakt jullie toekomstbestendig?",
      "Wat is het ESG-besluit dat nu moet vallen?",
    ],
  },

  ai_data: {
    title: "AI & Data Volwassenheid",
    subtitle: "Ambitie groter dan fundament?",
    analysisType: "ai_data",
    accent: "#7A1E2B",
    icon: Cpu,
    minWords: 8000,
    depthDefault: "boardroom",
    strategicWeight: 4,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Wat is jullie AI-ambitie in 12 maanden?",
      "Waar ontbreekt datafundament of governance?",
      "Welke processen zijn ripe for automation?",
      "Wat is het grootste AI-risico intern?",
      "Wat moet eerst gebouwd worden voordat AI waarde levert?",
    ],
  },

  marketing: {
    title: "Marketing",
    subtitle: "Zichtbaarheid, propositie en conversie",
    analysisType: "marketing",
    accent: "#8B1538",
    icon: Lightbulb,
    minWords: 7000,
    depthDefault: "full",
    strategicWeight: 3,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Wat is jullie huidige positionering in één zin?",
      "Waar faalt conversie of propositie helderheid?",
      "Welke kanaalstrategie werkt niet meer?",
      "Waar zit de marketinglekkage?",
      "Wat moet komende maand groeien: leads, merk of sales?",
    ],
  },

  sales: {
    title: "Sales",
    subtitle: "Pipeline, closing en klantwaarde",
    analysisType: "sales",
    accent: "#6E2338",
    icon: Lightbulb,
    minWords: 7000,
    depthDefault: "full",
    strategicWeight: 3,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Waar stokt closing vandaag?",
      "Wat is de zwakste schakel in pipeline?",
      "Welke klantgroep levert meeste waarde?",
      "Welke salesbeslissing wordt uitgesteld?",
      "Wat moet nu veranderen om voorspelbaar te verkopen?",
    ],
  },

  swot: {
    title: "Integrale SWOT",
    subtitle: "Geen klassiek schema — strategische waarheid",
    analysisType: "swot",
    accent: "#5E0F2E",
    icon: Boxes,
    minWords: 9000,
    depthDefault: "boardroom",
    strategicWeight: 5,

    /* ✅ ADDITION */
    intakeQuestions: [
      "Wat is jullie grootste kracht die nog niet geëxploiteerd wordt?",
      "Wat is de zwakte die jullie groei beperkt?",
      "Welke externe kans wordt nu gemist?",
      "Welke bedreiging is reëel binnen 12 maanden?",
      "Welke keuze maakt het verschil tussen winst en irrelevantie?",
    ],
  },
};