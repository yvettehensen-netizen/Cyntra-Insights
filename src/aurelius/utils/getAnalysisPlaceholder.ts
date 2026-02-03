// src/aurelius/utils/getAnalysisPlaceholder.ts

import {
  ANALYSIS_RESULTS,
  type AnalysisResultContent,
} from "@/aurelius/config/analysisResultsContent";

/**
 * Centrale fallback — één waarheid
 */
const DEFAULT_PLACEHOLDER =
  "Beschrijf de huidige situatie, spanningen en observaties die relevant zijn voor deze analyse…";

/**
 * Type-safe helper: haal analyse op
 */
function getAnalysis(slug: keyof typeof ANALYSIS_RESULTS): AnalysisResultContent {
  return ANALYSIS_RESULTS[slug];
}

/**
 * Retourneert een dynamische, analyse-specifieke placeholder
 * → Nooit leeg
 * → Nooit generiek als er context is
 * → UX-first, maar type-safe
 */
export function getAnalysisPlaceholder(
  slug: keyof typeof ANALYSIS_RESULTS
): string {
  const analysis = getAnalysis(slug);

  // 🔮 Future-proof: als we later UI-hints toevoegen
  // if (analysis.ui?.placeholder) return analysis.ui.placeholder;

  const subtitle = analysis.subtitle?.toLowerCase();

  return subtitle
    ? `Beschrijf zo concreet mogelijk:

• Wat speelt er momenteel in de organisatie rondom ${subtitle}?
• Welke spanningen, vermijdingen of onuitgesproken issues merk je op?
• Wat zijn de gevolgen als hier niets aan gedaan wordt?
• Welke patronen zie je terug in gedrag, besluiten of resultaten?`
    : DEFAULT_PLACEHOLDER;
}

/**
 * Title helper — altijd veilig
 */
export function getAnalysisTitle(
  slug: keyof typeof ANALYSIS_RESULTS
): string {
  return ANALYSIS_RESULTS[slug].title;
}

/**
 * Subtitle helper — altijd string
 */
export function getAnalysisSubtitle(
  slug: keyof typeof ANALYSIS_RESULTS
): string {
  return ANALYSIS_RESULTS[slug].subtitle ?? "";
}
