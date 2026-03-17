export type TensionDescriptor = {
  id: string;
  label: string;
  leftPole: string;
  rightPole: string;
  explanation: string;
  keywords: string[];
};

const TENSION_LIBRARY: TensionDescriptor[] = [
  {
    id: "portfolio-capacity",
    label: "portfolio breadth versus operational capacity",
    leftPole: "Portfoliobreedte",
    rightPole: "Operationele capaciteit",
    explanation:
      "Meer portfolio- of regiobreedte verhoogt relevantie, maar drukt direct op contractdiscipline, planbaarheid en teamstabiliteit.",
    keywords: ["gemeente", "portfolio", "breedte", "caseload", "wachttijd", "consortium", "triage", "capaciteit"],
  },
  {
    id: "growth-culture",
    label: "growth pace versus culture stability",
    leftPole: "Groeitempo",
    rightPole: "Cultuurstabiliteit",
    explanation:
      "Snellere groei vergroot de druk op retentie, kennisoverdracht en besluitritme voordat kwaliteit en leiderschap opschalen.",
    keywords: ["groei", "retentie", "uitstroom", "werkplezier", "cultuur", "flexibele schil", "teamstabiliteit"],
  },
  {
    id: "margin-accessibility",
    label: "margin versus accessibility",
    leftPole: "Marge",
    rightPole: "Toegankelijkheid",
    explanation:
      "Meer toegankelijkheid vergroot bereik en legitimiteit, maar kan onder vaste tarieven of hoge variatie direct de economische ruimte opeten.",
    keywords: ["marge", "toegang", "toegankelijkheid", "wachtlijst", "bijbetaling", "tarief", "prijs", "contractplafond"],
  },
  {
    id: "scale-quality",
    label: "scale versus quality",
    leftPole: "Schaal",
    rightPole: "Kwaliteit",
    explanation:
      "Schaalvergroting levert alleen duurzaam voordeel op als implementatie, kwaliteitsborging en leiderschapscapaciteit meebewegen.",
    keywords: ["schaal", "kwaliteit", "implementatie", "time-to-value", "maatwerk", "leverbetrouwbaarheid", "service"],
  },
  {
    id: "speed-governance",
    label: "speed versus governance",
    leftPole: "Snelheid",
    rightPole: "Governance",
    explanation:
      "Meer snelheid versnelt markt- of veranderbeweging, maar zonder scherp mandaat neemt uitzonderingswerk en besluitverlies toe.",
    keywords: ["governance", "mandaat", "escalatie", "besluit", "partner", "uitzondering", "compliance", "controle"],
  },
];

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

export function detectRelevantTension(source: unknown): TensionDescriptor {
  const haystack = normalize(source);
  if (/\bjeugdzorg|gemeente|consortium|caseload|wachttijd\b/i.test(haystack)) {
    return TENSION_LIBRARY[0];
  }
  const ranked = TENSION_LIBRARY.map((item) => ({
    item,
    score: item.keywords.reduce((sum, keyword) => sum + (haystack.includes(keyword) ? 1 : 0), 0),
  })).sort((left, right) => right.score - left.score);
  return ranked[0]?.score ? ranked[0].item : TENSION_LIBRARY[0];
}
