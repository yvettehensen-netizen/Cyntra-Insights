import type { AureliusAnalysisResult } from "@/aurelius/utils/parseAureliusReport";
import { callLLM } from "@/cie/llmClient";

/* =========================
   TYPES
========================= */

export interface EnhancedStrategyResult {
  executive_summary: string;
  key_risks: string[];
  key_opportunities: string[];
  roadmap_90d: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
}

/* =========================
   MAIN AI ENHANCER
========================= */

export async function enhanceStrategyWithAI(
  parsed: AureliusAnalysisResult
): Promise<EnhancedStrategyResult> {
  const sourceText = buildSourceText(parsed);

  const [executiveSummary, risksOps, roadmap] = await Promise.all([
    /* -------- EXEC SUMMARY -------- */
    callLLM<string>({
      system:
        "Je bent een McKinsey senior partner. Je schrijft extreem scherp, board-ready, zonder fluff. Elke zin moet strategische betekenis hebben.",
      user: `
Herschrijf de executive summary (max 180 woorden).

Focus strikt op:
- Kernprobleem of kernkans
- Onderliggende oorzaak
- Strategische implicatie voor het bestuur

Bronmateriaal:
${sourceText}
      `,
      temperature: 0.2,
    }),

    /* -------- RISKS & OPPORTUNITIES -------- */
    callLLM<{
      risks: string[];
      opportunities: string[];
    }>({
      system:
        "Je bent een strategy partner gespecialiseerd in board-level risico- en kansanalyse. Je denkt in prioriteit en impact.",
      user: `
Extraheer exact:
- 5 strategische risico's (hoog → laag impact)
- 5 strategische kansen (hoog → laag potentieel)

Regels:
- Concreet
- Actie-implicatie duidelijk
- Geen overlap

Bronmateriaal:
${sourceText}

Retourneer exact JSON:
{
  "risks": string[],
  "opportunities": string[]
}
      `,
      json: true,
      temperature: 0.2,
    }),

    /* -------- 90-DAY ROADMAP -------- */
    callLLM<{
      month1: string[];
      month2: string[];
      month3: string[];
    }>({
      system:
        "Je bent een operating partner. Je ontwerpt realistische, uitvoerbare plannen voor directieteams.",
      user: `
Ontwerp een 90-dagen actieplan.

Richtlijnen:
- Maand 1: Besluiten & fundament
- Maand 2: Implementatie & opschaling
- Maand 3: Borging, KPI's, bijsturing

Max 5 acties per maand. Actiegericht.

Bronmateriaal:
${sourceText}

Retourneer exact JSON:
{
  "month1": string[],
  "month2": string[],
  "month3": string[]
}
      `,
      json: true,
      temperature: 0.2,
    }),
  ]);

  /* =========================
     SAFE NORMALIZATION
  ========================= */

  return {
    executive_summary: executiveSummary.trim(),

    key_risks: Array.isArray(risksOps?.risks)
      ? risksOps.risks.slice(0, 5)
      : [],

    key_opportunities: Array.isArray(risksOps?.opportunities)
      ? risksOps.opportunities.slice(0, 5)
      : [],

    roadmap_90d: {
      month1: roadmap?.month1 ?? [],
      month2: roadmap?.month2 ?? [],
      month3: roadmap?.month3 ?? [],
    },
  };
}

/* =========================
   HELPERS
========================= */

function buildSourceText(parsed: AureliusAnalysisResult): string {
  const blocks: string[] = [];

  if (parsed.executive_summary) {
    blocks.push(
      `EXECUTIVE SUMMARY:\n${parsed.executive_summary.trim()}`
    );
  }

  if (parsed.sections && Object.keys(parsed.sections).length > 0) {
    blocks.push(
      "SECTIONS:\n" +
        Object.values(parsed.sections)
          .map(
            (s) =>
              `## ${s.title}\n${stringifyContent(s.content)}`
          )
          .join("\n\n")
    );
  }

  return blocks.join("\n\n");
}

function stringifyContent(
  content: string | string[] | Record<string, string[]>
): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content.map((i) => `- ${i}`).join("\n");
  }

  return Object.entries(content)
    .map(
      ([key, items]) =>
        `${key.replace(/_/g, " ").toUpperCase()}:\n` +
        items.map((i) => `- ${i}`).join("\n")
    )
    .join("\n\n");
}
