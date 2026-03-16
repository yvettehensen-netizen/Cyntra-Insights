import type { AnalysisContext } from "@/aurelius/engine/types";
import {
  clampConfidence,
  uniqueLines,
  type StrategicEngineResult,
} from "@/aurelius/engine/contracts/StrategicEngineResult";

export type CaseStructureTheme = {
  theme: string;
  description: string;
  signals: string[];
};

export type StructuralSynthesisInput = {
  analysisContext: AnalysisContext | string;
};

const THEME_CATALOG: Array<{
  theme: string;
  description: string;
  patterns: RegExp[];
}> = [
  {
    theme: "Cultuur & Eigenaarschap",
    description: "Mechanismen die retentie, kwaliteit en verantwoordelijk gedrag dragen.",
    patterns: [
      /\beigenaarschap\b/i,
      /\bcultuur\b/i,
      /\bmede-?eigenaar\b/i,
      /\bwerkplezier\b/i,
      /\bziekteverzuim\b/i,
      /\bbetrokkenheid\b/i,
    ],
  },
  {
    theme: "Netwerkstrategie",
    description: "Opschaling via partners, licenties en overdraagbare kennis.",
    patterns: [
      /\bnetwerk\b/i,
      /\bpartner(?:s|schap)?\b/i,
      /\blicentie\b/i,
      /\bkennisdeling\b/i,
      /\bmodeladoptie\b/i,
    ],
  },
  {
    theme: "Wachttijdinnovatie",
    description: "Toegang, triage en doorstroom als capaciteitshefboom.",
    patterns: [
      /\bwachttijd\b/i,
      /\btriage\b/i,
      /\bintake\b/i,
      /\bdoorstroom\b/i,
      /\bkort traject\b/i,
      /\bwachtlijst\b/i,
    ],
  },
  {
    theme: "Beleidsinvloed",
    description: "Systeembeinvloeding via gemeenten, VWS/VNG en sectorallianties.",
    patterns: [
      /\bbeleid\b/i,
      /\bgemeente\b/i,
      /\bvws\b/i,
      /\bvng\b/i,
      /\bbeweging van nul\b/i,
      /\blobby\b/i,
    ],
  },
  {
    theme: "Financiele Druk",
    description: "Tariefdruk, loonkosten en marge-erosie in de kernoperatie.",
    patterns: [
      /\bmarge\b/i,
      /\btarief\b/i,
      /\bcontract\b/i,
      /\bloonkosten?\b/i,
      /\bkosten\b/i,
      /\bvergrijzing\b/i,
    ],
  },
];

function toText(input: AnalysisContext | string): string {
  if (typeof input === "string") return input;
  const docs = Array.isArray(input.documents) ? input.documents : [];
  return [input.rawText, ...docs].filter(Boolean).join("\n");
}

function toSignals(text: string): string[] {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 12)
    .slice(0, 200);
}

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export class StructuralSynthesisNode {
  readonly name = "StructuralSynthesisNode";

  analyze(input: StructuralSynthesisInput): CaseStructureTheme[] {
    const source = normalize(toText(input.analysisContext));
    const signals = toSignals(source);
    const clusters: CaseStructureTheme[] = THEME_CATALOG.map((item) => {
      const matches = signals.filter((signal) =>
        item.patterns.some((pattern) => pattern.test(signal))
      );
      return {
        theme: item.theme,
        description: item.description,
        signals: uniqueLines(matches).slice(0, 4),
      };
    })
      .filter((cluster) => cluster.signals.length > 0)
      .sort((a, b) => b.signals.length - a.signals.length)
      .slice(0, 5);

    if (clusters.length > 0) return clusters;

    return [
      {
        theme: "Capaciteit & Kwaliteit",
        description: "Balans tussen zorgkwaliteit en uitvoerbare capaciteit.",
        signals: signals.slice(0, 3),
      },
    ];
  }

  analyzeStandard(input: StructuralSynthesisInput): StrategicEngineResult {
    const structure = this.analyze(input);
    return {
      insights: uniqueLines(structure.map((item) => `${item.theme}: ${item.description}`)),
      risks: uniqueLines(
        structure.map(
          (item) =>
            `${item.theme}: zonder expliciete prioritering blijft dit thema reactief in plaats van bestuurbaar.`
        )
      ),
      opportunities: uniqueLines(
        structure.map((item) => `${item.theme}: bundel signalen tot een besluitbaar strategiethema.`)
      ),
      recommendations: uniqueLines(
        structure.map((item) => `Veranker '${item.theme}' als apart board-topic met vaste KPI-ritmiek.`)
      ),
      confidence: clampConfidence(structure.length >= 3 ? 0.82 : 0.66),
    };
  }
}

