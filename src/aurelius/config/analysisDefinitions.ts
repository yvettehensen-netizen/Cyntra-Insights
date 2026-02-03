// src/aurelius/config/analysisDefinitions.ts
import {
  Target,
  LineChart,
  TrendingUp,
  Users,
  HeartHandshake,
  BarChart3,
  Workflow,
  ShieldCheck,
  Leaf,
  Boxes,
  Cpu,
  Crown,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type AureliusAnalysis = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  placeholder: string;
  questions: string[];
  icon: LucideIcon;
  allowsDocuments: boolean;
};

export const AURELIUS_ANALYSES: Record<string, AureliusAnalysis> = {
  strategy: {
    id: "strategy",
    slug: "strategie",
    title: "Strategische Analyse",
    subtitle: "Waar moet deze organisatie écht voor kiezen?",
    placeholder:
      "Welke strategische keuzes worden vermeden? Waar zit de echte trade-off? Wat kost het als je niets doet?",
    questions: [
      "Welke keuzes durft het leiderschap expliciet niet te maken?",
      "Waar groeit de organisatie zonder focus?",
      "Welke aannames over markt of klant zijn nooit getoetst?",
    ],
    icon: Target,
    allowsDocuments: true,
  },

  finance: {
    id: "finance",
    slug: "financieel",
    title: "Financiële Gezondheid",
    subtitle: "Waar ontstaat waarde — en waar verdampt zij?",
    placeholder:
      "Marges, cashflow, pricing, kostenstructuur, klantwinstgevendheid, risico’s…",
    questions: [
      "Welke activiteiten zijn winstgevend maar strategisch zwak?",
      "Welke klanten vernietigen marge?",
      "Welke kosten zijn historisch gegroeid zonder heroverweging?",
    ],
    icon: LineChart,
    allowsDocuments: true,
  },

  team: {
    id: "team",
    slug: "team",
    title: "Team & Dynamiek",
    subtitle: "Wie stuurt écht — en wie ontwijkt verantwoordelijkheid?",
    placeholder:
      "Leiderschap, accountability, samenwerking, spanningen, informele macht…",
    questions: [
      "Waar blijven besluiten hangen tussen mensen?",
      "Wie heeft feitelijke invloed zonder formele macht?",
      "Waar wordt harmonie belangrijker dan waarheid?",
    ],
    icon: Users,
    allowsDocuments: true,
  },

  culture: {
    id: "culture",
    slug: "onderstroom",
    title: "Onderstroom Analyse",
    subtitle: "De onderstroom bepaalt alles wat boven water gebeurt.",
    placeholder:
      "Wat wordt niet uitgesproken? Waar zit spanning, wantrouwen of macht?",
    questions: [
      "Wat durft men niet tegen leiders te zeggen?",
      "Waar worden conflicten structureel vermeden?",
      "Wie heeft informele macht zonder verantwoordelijkheid?",
    ],
    icon: HeartHandshake,
    allowsDocuments: false,
  },

  market: {
    id: "market",
    slug: "markt",
    title: "Markt & Concurrentie",
    subtitle: "Positionering onder druk — of klaar voor versnelling?",
    placeholder:
      "Concurrenten, trends, prijsdruk, differentiatie, verschuivende waarde…",
    questions: [
      "Waar wordt de organisatie inwisselbaar?",
      "Welke concurrentiekopie wordt niet beantwoord?",
      "Waar verschuift klantwaarde zonder interne reactie?",
    ],
    icon: BarChart3,
    allowsDocuments: true,
  },

  governance: {
    id: "governance",
    slug: "governance",
    title: "Governance & Risico",
    subtitle: "Waar bestuurlijke risico’s sluimeren.",
    placeholder:
      "Aansprakelijkheid, compliance, reputatie, ESG-exposure…",
    questions: [
      "Waar is governance losgekoppeld van besluitvorming?",
      "Welk risico wordt actief genegeerd?",
      "Waar ontstaat aansprakelijkheid zonder eigenaarschap?",
    ],
    icon: ShieldCheck,
    allowsDocuments: true,
  },

  execution: {
    id: "execution",
    slug: "executie",
    title: "Executie & Momentum",
    subtitle: "Strategie zonder ritme is wensdenken.",
    placeholder:
      "Prioriteiten, accountability, voortgang, blokkades…",
    questions: [
      "Waar verdampt strategie in middle-management?",
      "Welke prioriteit concurreert met brandjes blussen?",
      "Waar ontbreekt ritme in besluit tot actie?",
    ],
    icon: TrendingUp,
    allowsDocuments: false,
  },

  risk: {
    id: "risk",
    slug: "risico",
    title: "Risico & Resilience",
    subtitle: "Wat breekt als het misgaat — en waarom nu al?",
    placeholder:
      "Scenario’s, afhankelijkheden, kwetsbaarheden, black swans…",
    questions: [
      "Welke single point of failure wordt genegeerd?",
      "Waar is resilience afhankelijk van individuen?",
      "Welk scenario wordt nooit besproken?",
    ],
    icon: AlertTriangle,
    allowsDocuments: true,
  },

  ai_data: {
    id: "ai_data",
    slug: "ai-data",
    title: "AI & Data Volwassenheid",
    subtitle: "Wanneer AI slechte beslissingen versnelt.",
    placeholder:
      "Datakwaliteit, governance, beslisimpact, hype vs realiteit…",
    questions: [
      "Waar wordt AI ingezet zonder beslisrijpe data?",
      "Wie is eigenaar van AI-besluiten?",
      "Waar vermenigvuldigt AI bestaande zwaktes?",
    ],
    icon: Cpu,
    allowsDocuments: true,
  },

  synthese: {
    id: "synthese",
    slug: "synthese",
    title: "Aurelius Synthese",
    subtitle: "Waar alles samenkomt — en excuses verdwijnen.",
    placeholder:
      "Integraal overzicht over alle spanningsvelden…",
    questions: [
      "Welke spanningen versterken elkaar?",
      "Waar moet het leiderschap nu écht kiezen?",
      "Wat is de onontkoombare volgende stap?",
    ],
    icon: Lightbulb,
    allowsDocuments: false,
  },
};
