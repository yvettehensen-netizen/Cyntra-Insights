// ---------------------------------------------
// Aurelius 3.5 — Central Solutions Config
// ---------------------------------------------
export const SOLUTIONS: Record<
  string,
  {
    title: string;
    description: string;
    includeCulture: boolean;
    premium: boolean;
  }
> = {
  full: {
    title: "Executive Quickscan",
    description: "Gratis strategische scan — binnen 10 minuten resultaat.",
    includeCulture: true,
    premium: false,
  },

  strategy: {
    title: "Strategische Analyse",
    description: "Volledige strategische analyse van je organisatie.",
    includeCulture: false,
    premium: true,
  },

  finance: {
    title: "Financiële Analyse",
    description: "Cashflow, marges, scenario's en financiële gezondheid.",
    includeCulture: false,
    premium: true,
  },

  onderstroom: {
    title: "Onderstroom Analyse",
    description: "Teamdynamiek, gedragspatronen en spanningen.",
    includeCulture: true,
    premium: true,
  },

  team: {
    title: "Team & Cultuur Analyse",
    description: "Samenwerking, feedback, executie en leiderschap.",
    includeCulture: true,
    premium: true,
  },

  growth: {
    title: "Groei & Schaal Analyse",
    description: "Groeikansen, schaalbaarheid en systemen.",
    includeCulture: false,
    premium: true,
  },
};
