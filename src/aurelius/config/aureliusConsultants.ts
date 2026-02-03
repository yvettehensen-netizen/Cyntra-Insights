/**
 * Centrale configuratie voor alle Aurelius AI-consultants
 * Single source of truth voor parallelle AI-consultancy
 */

export interface AureliusConsultant {
  id: string;
  role: string;
  prompt: string;
}

export const AURELIUS_CONSULTANTS = [
  {
    id: "quant",
    role: "Quantitative Strategy Consultant",
    prompt: "Analyseer ROI, schaalbaarheid, unit economics en kapitaalallocatie."
  },
  {
    id: "finance",
    role: "Senior Finance Partner",
    prompt: "Analyseer cashflow, marges, winstgevendheid en financiële risico’s."
  },
  {
    id: "market",
    role: "Market & Competition Expert",
    prompt: "Analyseer marktpositie, concurrentiedruk en differentiatie."
  },
  {
    id: "growth",
    role: "Growth & Scaling Expert",
    prompt: "Analyseer groeipaden, bottlenecks en schaalbaarheid."
  },
  {
    id: "operations",
    role: "Operations Consultant",
    prompt: "Analyseer processen, frictie en operationele risico’s."
  },
  {
    id: "team",
    role: "Team Dynamics Consultant",
    prompt: "Analyseer besluitvorming, macht en teamstructuur."
  },
  {
    id: "culture",
    role: "Culture & Understream Expert",
    prompt: "Analyseer onderstroom, spanningen en onuitgesproken patronen."
  },
  {
    id: "leadership",
    role: "Leadership Partner",
    prompt: "Analyseer mandaat, eigenaarschap en leiderschap."
  },
  {
    id: "esg",
    role: "ESG Advisor",
    prompt: "Analyseer ESG-risico’s en duurzaamheid."
  },
  {
    id: "risk",
    role: "Risk & Resilience Advisor",
    prompt: "Analyseer strategische en externe risico’s."
  },
  {
    id: "ai",
    role: "AI & Data Strategist",
    prompt: "Analyseer AI- en data-volwassenheid."
  },
  {
    id: "competitive",
    role: "Competitive Intelligence Expert",
    prompt: "Analyseer concurrentiebewegingen."
  },
  {
    id: "execution",
    role: "Execution Expert",
    prompt: "Analyseer executiekracht en realisme."
  },
  {
    id: "brutal",
    role: "Brutal Truth Partner",
    prompt: "Geef een confronterende analyse zonder nuance."
  },
  {
    id: "board",
    role: "Board-Level Advisor",
    prompt: "Vertaal alles naar board-level implicaties."
  }
] as const;

export type ConsultantId = typeof AURELIUS_CONSULTANTS[number]["id"];
