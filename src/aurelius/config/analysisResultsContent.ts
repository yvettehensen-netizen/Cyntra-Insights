// src/aurelius/config/analysisResultsContent.ts (je code is goed, maar voeg toe als nodig voor lucide-react types)
import type { LucideIcon } from "lucide-react";
import {
  Target,
  LineChart,
  TrendingUp,
  Users,
  HeartHandshake,
  BarChart3,
  Workflow,
  Shield,
  Leaf,
  Boxes,
  Cpu,
  Crown,
  Lightbulb,
  DollarSign,
} from "lucide-react";

export interface AnalysisResultContent {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly exposes: string;
  readonly painPoints: readonly string[];
  readonly consequence: string;
  readonly outcome: readonly string[];
  readonly icon: LucideIcon;
}

export const ANALYSIS_RESULTS = {
  strategy: {
    id: "strategy",
    slug: "strategie",
    title: "Strategische Analyse",
    subtitle: "Waar groei faalt door uitgestelde keuzes",
    seoTitle: "Strategische analyse voor directie & board | Aurelius",
    seoDescription: "Ontdek waar strategische besluitvorming vastloopt.",
    exposes: "Vermeden keuzes en schijnconsensus.",
    painPoints: [
      "Geen echte prioriteit",
      "Uitstelgedrag",
      "Schijnconsensus",
    ],
    consequence: "Strategische stilstand.",
    outcome: [
      "Heldere keuzes",
      "Trade-offs",
      "Richting",
    ],
    icon: Target,
  },

  finance: {
    id: "finance",
    slug: "finance",
    title: "Financiële Gezondheid",
    subtitle: "Waar waarde structureel weglekt",
    seoTitle: "Financiële analyse | Aurelius",
    seoDescription: "Cash, marge en risico’s.",
    exposes: "Cijfers zonder waarheid.",
    painPoints: [
      "Cashflowproblemen",
      "Margedruk",
      "Kostenverhulling",
    ],
    consequence: "Financiële kwetsbaarheid.",
    outcome: [
      "Inzicht",
      "Prioriteit",
      "Risicobeheersing",
    ],
    icon: LineChart,
  },

  financial_strategy: {
    id: "financial_strategy",
    slug: "financiele-strategie",
    title: "Financiële Strategie",
    subtitle: "Waar kapitaal compoundt of sterft",
    seoTitle: "Financiële strategie | Aurelius",
    seoDescription: "Kapitaaldiscipline en returns.",
    exposes: "Groei zonder rendement.",
    painPoints: [
      "Lage returns",
      "Slechte allocatie",
      "Schijnpricing",
    ],
    consequence: "Kapitaalvernietiging.",
    outcome: [
      "Heldere allocatie",
      "Focus",
      "Duurzame groei",
    ],
    icon: DollarSign,
  },

  growth: {
    id: "growth",
    slug: "groei",
    title: "Groei & Schaling",
    subtitle: "Waarom schaalbaarheid breekt",
    seoTitle: "Groei analyse | Aurelius",
    seoDescription: "Groei zonder stabiliteit.",
    exposes: "Schaalillusie.",
    painPoints: [
      "Chaos",
      "Werkdruk",
      "Besluitachterstand",
    ],
    consequence: "Kwaliteitsverlies.",
    outcome: [
      "Grenzen",
      "Focus",
      "Tempo",
    ],
    icon: TrendingUp,
  },

  market: {
    id: "market",
    slug: "markt",
    title: "Markt & Concurrentie",
    subtitle: "Waarom positionering vervaagt",
    seoTitle: "Marktanalyse | Aurelius",
    seoDescription: "Concurrentiedruk en inwisselbaarheid.",
    exposes: "Reactieve positionering.",
    painPoints: [
      "Prijsdruk",
      "Inwisselbaarheid",
      "Vage propositie",
    ],
    consequence: "Erosie van waarde.",
    outcome: [
      "Differentiatie",
      "Focus",
      "Scherpte",
    ],
    icon: BarChart3,
  },

  process: {
    id: "process",
    slug: "processen",
    title: "Proces & Operatie",
    subtitle: "Waar frictie ontstaat",
    seoTitle: "Procesanalyse | Aurelius",
    seoDescription: "Operationele knelpunten.",
    exposes: "Complexiteit.",
    painPoints: [
      "Herhaling",
      "Fouten",
      "Overdracht",
    ],
    consequence: "Geen schaal.",
    outcome: [
      "Flow",
      "Eenvoud",
      "Voorspelbaarheid",
    ],
    icon: Workflow,
  },

  team: {
    id: "team",
    slug: "team",
    title: "Team & Dynamiek",
    subtitle: "Wie stuurt écht?",
    seoTitle: "Teamdynamiek | Aurelius",
    seoDescription: "Macht en eigenaarschap.",
    exposes: "Informele macht.",
    painPoints: [
      "Besluitstilstand",
      "Vermijding",
      "Onduidelijkheid",
    ],
    consequence: "Trage besluiten.",
    outcome: [
      "Eigenaarschap",
      "Helderheid",
      "Bestuurbaarheid",
    ],
    icon: Users,
  },

  culture: {
    id: "culture",
    slug: "cultuur",
    title: "Onderstroom Analyse",
    subtitle: "Wat niemand durft te zeggen",
    seoTitle: "Cultuur analyse | Aurelius",
    seoDescription: "Verborgen spanningen.",
    exposes: "Onbenoemde realiteit.",
    painPoints: [
      "Geen feedback",
      "Ondergraving",
      "Spanning",
    ],
    consequence: "Mislukte verandering.",
    outcome: [
      "Zichtbaarheid",
      "Draagvlak",
      "Eerlijkheid",
    ],
    icon: HeartHandshake,
  },

  change: {
    id: "change",
    slug: "verandering",
    title: "Veranderkracht",
    subtitle: "Waarom verandering strandt",
    seoTitle: "Veranderanalyse | Aurelius",
    seoDescription: "Adoptie en weerstand.",
    exposes: "Structurele weerstand.",
    painPoints: [
      "Verandermoeheid",
      "Stille sabotage",
      "Geen eigenaarschap",
    ],
    consequence: "Verlies van vertrouwen.",
    outcome: [
      "Realistisch tempo",
      "Draagvlak",
      "Bestuurbaarheid",
    ],
    icon: Shield,
  },

  esg: {
    id: "esg",
    slug: "esg",
    title: "ESG & Duurzaamheid",
    subtitle: "Waar risico’s ontstaan",
    seoTitle: "ESG analyse | Aurelius",
    seoDescription: "Echte ESG-risico’s.",
    exposes: "Papieren beleid.",
    painPoints: [
      "Greenwashing",
      "Geen eigenaarschap",
      "Geen impact",
    ],
    consequence: "Reputatieschade.",
    outcome: [
      "Governance",
      "Risicobeheersing",
      "Keuzes",
    ],
    icon: Leaf,
  },

  swot: {
    id: "swot",
    slug: "swot",
    title: "Integrale SWOT",
    subtitle: "Zonder zelfbedrog",
    seoTitle: "SWOT analyse | Aurelius",
    seoDescription: "Strategische realiteit.",
    exposes: "Blinde vlekken.",
    painPoints: [
      "Overschatting",
      "Ontkenning",
      "Wishful thinking",
    ],
    consequence: "Gemiste risico’s.",
    outcome: [
      "Realiteit",
      "Keuzes",
      "Richting",
    ],
    icon: Boxes,
  },

  ai_data: {
    id: "ai_data",
    slug: "ai-data",
    title: "AI & Data Volwassenheid",
    subtitle: "Wanneer AI faalt",
    seoTitle: "AI & data analyse | Aurelius",
    seoDescription: "Datakwaliteit en governance.",
    exposes: "Hype zonder fundament.",
    painPoints: [
      "Slechte data",
      "Geen governance",
      "Geen impact",
    ],
    consequence: "Slechte beslissingen.",
    outcome: [
      "Datakwaliteit",
      "Eigenaarschap",
      "Impact",
    ],
    icon: Cpu,
  },

  leadership: {
    id: "leadership",
    slug: "leiderschap",
    title: "Leiderschap & Accountability",
    subtitle: "Waarom leiderschap faalt",
    seoTitle: "Leiderschap analyse | Aurelius",
    seoDescription: "Mandaat en besluitkracht.",
    exposes: "Onduidelijk leiderschap.",
    painPoints: [
      "Geen eigenaar",
      "Escalaties",
      "Onhelder mandaat",
    ],
    consequence: "Verlies van snelheid.",
    outcome: [
      "Mandaat",
      "Eigenaarschap",
      "Bestuurbaarheid",
    ],
    icon: Crown,
  },

  synthese: {
    id: "synthese",
    slug: "synthese",
    title: "Aurelius Synthese",
    subtitle: "Eén besliskader",
    seoTitle: "Strategische synthese | Aurelius",
    seoDescription: "Integrale waarheid.",
    exposes: "Versnippering.",
    painPoints: [
      "Losse inzichten",
      "Geen prioriteit",
      "Complexiteit",
    ],
    consequence: "Momentumverlies.",
    outcome: [
      "Besliskader",
      "Richting",
      "90-dagen plan",
    ],
    icon: Lightbulb,
  },
} as const satisfies Record<string, AnalysisResultContent>;