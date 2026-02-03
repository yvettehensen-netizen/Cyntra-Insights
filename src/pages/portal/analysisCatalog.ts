import type { AnalysisType } from "@/aurelius/types";

export interface AnalysisCard {
  type: AnalysisType;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export const ANALYSIS_CATALOG: readonly AnalysisCard[] = [
  {
    type: "strategy",
    title: "Strategische Analyse",
    subtitle: "Waar groei vastloopt",
    description: "Besluitvorming, focus en strategische frictie.",
    icon: "🎯",
  },
  {
    type: "finance",
    title: "Financiële Gezondheid",
    subtitle: "Waar waarde weglekt",
    description: "Cashflow, marges en structurele zwaktes.",
    icon: "💰",
  },
  {
    type: "financial_strategy",
    title: "Financiële Strategie",
    subtitle: "Kapitaal dat groeit of sterft",
    description: "Allocatie, investeringen en discipline.",
    icon: "📈",
  },
  {
    type: "growth",
    title: "Groei Analyse",
    subtitle: "Waarom groei stokt",
    description: "Hefbomen, prioriteiten en timing.",
    icon: "🚀",
  },
  {
    type: "market",
    title: "Marktpositie",
    subtitle: "Concurrentie & positionering",
    description: "Waar je wint — en waarom.",
    icon: "🌍",
  },
  {
    type: "process",
    title: "Processen & Executie",
    subtitle: "Waar snelheid verdwijnt",
    description: "Bottlenecks, overdracht en schaalbaarheid.",
    icon: "⚙️",
  },
  {
    type: "leadership",
    title: "Leiderschap & Accountability",
    subtitle: "Waarom besluiten uitblijven",
    description: "Eigenaarschap, spanning en macht.",
    icon: "👑",
  },
  {
    type: "team_dynamics",
    title: "Team & Dynamiek",
    subtitle: "Wie stuurt écht",
    description: "Invloed, conflict en samenwerking.",
    icon: "👥",
  },
  {
    type: "change_resilience",
    title: "Veranderkracht",
    subtitle: "Waarom verandering strandt",
    description: "Weerstand, tempo en draagvlak.",
    icon: "🔁",
  },
  {
    type: "onderstroom",
    title: "Onderstroom Analyse",
    subtitle: "Wat niemand durft te zeggen",
    description: "Onzichtbare blokkades en patronen.",
    icon: "🧠",
  },
  {
    type: "swot",
    title: "Integrale SWOT",
    subtitle: "Zonder zelfbedrog",
    description: "Kracht, zwakte en realiteit.",
    icon: "🧩",
  },
  {
    type: "esg",
    title: "ESG & Duurzaamheid",
    subtitle: "Waar risico’s ontstaan",
    description: "Compliance, impact en governance.",
    icon: "🌱",
  },
  {
    type: "ai_data",
    title: "AI & Data Volwassenheid",
    subtitle: "Wanneer AI faalt",
    description: "Governance, data en besluitkwaliteit.",
    icon: "🤖",
  },
  {
    type: "marketing",
    title: "Marketing Analyse",
    subtitle: "Waarom tractie ontbreekt",
    description: "Positionering, kanalen en boodschap.",
    icon: "📣",
  },
  {
    type: "sales",
    title: "Sales Analyse",
    subtitle: "Waarom deals niet sluiten",
    description: "Proces, pipeline en klantfrictie.",
    icon: "💼",
  },
] as const;
