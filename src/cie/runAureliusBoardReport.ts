import { synthesizeFinalReport } from "./aureliusSynthesis";
import type { AureliusAnalysisResult } from "../aurelius/utils/parseAureliusReport";

/* =========================
   TYPES
========================= */

export interface BoardReport {
  /** Board-ready titel */
  title: string;

  /** Finale, gesynthetiseerde output (enige waarheid voor PDF / deck) */
  final: ReturnType<typeof synthesizeFinalReport>;

  /** Alle onderliggende analyses (read-only, audit trail) */
  analyses: readonly AureliusAnalysisResult[];
}

/* =========================
   MAIN
========================= */

/**
 * Genereert het definitieve Aurelius Board Report.
 *
 * - Combineert meerdere analyses tot één strategisch narratief
 * - Scheidt "signalen" (best) van "frictie" (critique)
 * - Klaar voor latere AI-critique / consensus engine
 */
export function generateAureliusBoardReport(
  analyses: readonly AureliusAnalysisResult[]
): BoardReport {
  if (!analyses.length) {
    throw new Error("Geen analyses aangeleverd voor Board Report");
  }

  /* =========================
     1. INPUT NORMALISATIE
  ========================= */

  const bestText = analyses
    .map((a) => extractBestSignal(a))
    .filter(Boolean)
    .join("\n\n");

  const critiqueText = analyses
    .map((a) => extractCritiqueSignal(a))
    .filter(Boolean)
    .join("\n\n");

  /* =========================
     2. FALLBACKS (VEILIG)
  ========================= */

  const safeBest =
    bestText ||
    analyses.map((a) => a.raw_markdown).join("\n\n---\n\n");

  const safeCritique =
    critiqueText ||
    safeBest; // totdat critique-engine actief is

  /* =========================
     3. SYNTHESIS
  ========================= */

  const final = synthesizeFinalReport(safeBest, safeCritique);

  /* =========================
     4. OUTPUT
  ========================= */

  return {
    title: "Aurelius Strategische Board Analyse",
    final,
    analyses,
  };
}

/* =========================
   HELPERS
========================= */

/**
 * Extraheert het "beste" signaal:
 * - Executive summary
 * - Hoog-niveau conclusies
 */
function extractBestSignal(a: AureliusAnalysisResult): string {
  const parts: string[] = [];

  if (a.executive_summary) {
    parts.push(a.executive_summary.trim());
  }

  Object.values(a.sections).forEach((section) => {
    if (typeof section.content === "string") {
      parts.push(section.content.trim());
    }
  });

  return parts.join("\n");
}

/**
 * Extraheert kritische frictie:
 * - Risico’s
 * - Spanningen
 * - Besluit-loze zones
 *
 * (bewust conservatief → geen hallucinations)
 */
function extractCritiqueSignal(a: AureliusAnalysisResult): string {
  const frictionKeys = [
    "risico",
    "bottleneck",
    "spanningsveld",
    "beperking",
    "afhankelijkheid",
    "zwakte",
  ];

  const hits: string[] = [];

  Object.values(a.sections).forEach((section) => {
    if (typeof section.content !== "string") return;

    const lower = section.content.toLowerCase();

    if (frictionKeys.some((k) => lower.includes(k))) {
      hits.push(section.content.trim());
    }
  });

  return hits.join("\n");
}
