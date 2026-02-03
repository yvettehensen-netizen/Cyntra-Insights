// src/aurelius/engine/formatter.ts

/**
 * Lichte, lokale definitie van AureliusResult
 * Voldoende voor de formatter – voorkomt import-fouten.
 */
interface AureliusResult {
  executive_summary: string;
  insights?: string[];
  risks?: string[];
  opportunities?: string[];
  recommendations?: string[];
  roadmap_90d?: {
    month1?: string[];
    month2?: string[];
    month3?: string[];
  };
  ceo_message?: string;
  confidence_score?: number;
}

/**
 * Aurelius Formatter
 * Converteert een AureliusResult naar verschillende formaten.
 */
export class AureliusFormatter {
  /**
   * Formatteert voor weergave in de UI (Markdown)
   */
  formatForDisplay(output: AureliusResult): string {
    let formatted = `# Executive Summary\n\n${output.executive_summary || "Geen samenvatting beschikbaar."}\n\n`;

    if (output.insights?.length) {
      formatted += `## Kerninzichten\n\n`;
      output.insights.forEach((insight, idx) => {
        formatted += `${idx + 1}. ${insight}\n`;
      });
      formatted += `\n`;
    }

    if (output.risks?.length) {
      formatted += `## Kritieke Risico's\n\n`;
      output.risks.forEach((risk, idx) => {
        formatted += `${idx + 1}. ${risk}\n`;
      });
      formatted += `\n`;
    }

    if (output.opportunities?.length) {
      formatted += `## Groeikansen\n\n`;
      output.opportunities.forEach((opp, idx) => {
        formatted += `${idx + 1}. ${opp}\n`;
      });
      formatted += `\n`;
    }

    if (output.recommendations?.length) {
      formatted += `## Aanbevelingen\n\n`;
      output.recommendations.forEach((rec, idx) => {
        formatted += `${idx + 1}. ${rec}\n`;
      });
      formatted += `\n`;
    }

    // 90-dagen roadmap
    if (output.roadmap_90d) {
      const { month1 = [], month2 = [], month3 = [] } = output.roadmap_90d;

      if (month1.length || month2.length || month3.length) {
        formatted += `## 90-Dagen Masterplan\n\n`;

        if (month1.length) {
          formatted += `### Maand 1: Fundament & Snelle Wins\n`;
          month1.forEach((action) => formatted += `- ${action}\n`);
          formatted += `\n`;
        }

        if (month2.length) {
          formatted += `### Maand 2: Executie & Tractie\n`;
          month2.forEach((action) => formatted += `- ${action}\n`);
          formatted += `\n`;
        }

        if (month3.length) {
          formatted += `### Maand 3: Schaling & Consolidatie\n`;
          month3.forEach((action) => formatted += `- ${action}\n`);
          formatted += `\n`;
        }
      }
    }

    if (output.ceo_message) {
      formatted += `## Bericht van de Strategische Raad\n\n> ${output.ceo_message}\n\n`;
    }

    // Footer
    formatted += `---\n`;
    formatted += `**Betrouwbaarheidsscore**: ${Math.round((output.confidence_score || 0.88) * 100)}%\n`;
    formatted += `**Gegenereerd op**: ${new Date().toLocaleString("nl-NL")}\n`;
    formatted += `**Powered by**: Aurelius Executive Intelligence\n`;

    return formatted;
  }

  /**
   * Formatteert voor PDF generatie
   */
  formatForPDF(output: AureliusResult): Record<string, any> {
    return {
      title: "Aurelius Strategisch Rapport",
      generated_at: new Date().toISOString(),
      confidence_score: output.confidence_score || 0.88,
      executive_summary: output.executive_summary || "",
      insights: output.insights || [],
      risks: output.risks || [],
      opportunities: output.opportunities || [],
      recommendations: output.recommendations || [],
      roadmap_90d: output.roadmap_90d || { month1: [], month2: [], month3: [] },
      ceo_message: output.ceo_message || "",
    };
  }

  /**
   * Formatteert als JSON string
   */
  formatForJSON(output: AureliusResult): string {
    return JSON.stringify(output, null, 2);
  }
}

// Singleton instance
export const aureliusFormatter = new AureliusFormatter();