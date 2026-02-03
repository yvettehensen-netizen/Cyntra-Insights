// analysesResultsSelectors.ts (gefixte versie met typing)
import { ANALYSIS_RESULTS } from "./analysisResultsContent";
import type { AnalysisResultContent } from "./analysisResultsContent";

/**
 * Zoekt analyse op basis van slug uit de URL
 */
export function getAnalysisBySlug(
  slug: string
): AnalysisResultContent | undefined {
  return Object.values(ANALYSIS_RESULTS).find(
    (analysis: AnalysisResultContent) => analysis.slug === slug
  );
}

/**
 * Voor overzichten / menus
 */
export function getAllAnalyses(): AnalysisResultContent[] {
  return Object.values(ANALYSIS_RESULTS);
}