import type { AnalysisType } from "../types/analysisTypes";

export interface Solution {
  slug: string;
  name: string;
  description: string;
  analyses: AnalysisType[];
  premium: boolean;
}

export const SOLUTIONS: Solution[] = [
  {
    slug: "strategy",
    name: "Strategic Blueprint",
    description: "Radicale strategische waarheid over positionering en keuzes.",
    analyses: ["strategy", "market", "growth"],
    premium: true,
  },
  {
    slug: "finance",
    name: "Financial Deep Dive",
    description: "Cashflow, marges en structurele risico’s.",
    analyses: ["finance"],
    premium: true,
  },
  {
    slug: "team",
    name: "Team Dynamics",
    description: "Gedrag, onderstroom en leiderschap.",
    analyses: ["team", "onderstroom", "culture"],
    premium: true,
  },
  {
    slug: "ai",
    name: "AI Readiness",
    description: "AI-volwassenheid en datafundament.",
    analyses: ["ai_data", "process"],
    premium: true,
  },
  {
    slug: "risk",
    name: "Risk & Resilience",
    description: "Weerbaarheid en strategische risico’s.",
    analyses: ["swot", "change_resilience"],
    premium: true,
  },
];
