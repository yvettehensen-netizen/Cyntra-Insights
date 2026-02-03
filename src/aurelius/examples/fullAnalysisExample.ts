// src/aurelius/examples/fullAnalysisExample.ts

// Import alleen wat écht bestaat
import { aureliusFormatter } from "../engine/formatter";

// Lokale type-definities – geen import-fouten meer
interface AnalysisContext {
  analysisType?: string;
  companyName?: string;
  industry?: string;
  revenue?: string;
  employees?: number;
  companyContext?: string;
  textInput?: string;
  [key: string]: any;
}

interface AureliusResult {
  executive_summary: string;
  insights: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  roadmap_90d: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
  ceo_message?: string;
  confidence_score?: number;
}

/**
 * Voorbeeld analyse – draait zonder orchestrator of nodes
 * Simuleert een volledige Aurelius analyse voor demo doeleinden
 */
async function runFullAnalysis() {
  console.log("🚀 Aurelius Full Analysis Example\n");

  const context: AnalysisContext = {
    companyName: "Acme SaaS Corp",
    industry: "SaaS",
    revenue: "€12M",
    employees: 65,
    companyContext: `
We zijn een B2B SaaS bedrijf met €12M ARR en 65 medewerkers. Groei van 40% YoY maar we lopen tegen een aantal uitdagingen aan:
- Team moraal lijkt laag de laatste tijd, meerdere key mensen vertrokken in laatste 6 maanden
- Cashflow wordt krapper ondanks omzetgroei
- Sales cycle verlengd van 30 naar 50 dagen
- Onze top 2 klanten vertegenwoordigen 40% van de omzet
- We praten over 'customer-obsessed' zijn maar hebben al 8 maanden geen klantinterviews gedaan
- Leadership team overbelast, werken 60+ uur weken
- Iedereen is het eens dat we moeten schalen maar onduidelijk hoe
- Marketing budget 3x verhoogd maar omzet slechts 1.5x gestegen
- Technische schuld stapelt op, product velocity vertraagt
We hebben ambitieuze groeidoelen maar executie voelt versnipperd. We hebben strategische helderheid nodig over waar we op moeten focussen.
    `.trim(),
  };

  try {
    // Simuleer een resultaat (in echte app komt dit van je orchestrator)
    const simulatedResult: AureliusResult = {
      executive_summary: "Acme SaaS Corp bevindt zich in een kritieke groeifase waarin snelle omzetgroei gepaard gaat met toenemende operationele en culturele spanningen. De organisatie heeft sterke fundamenten maar riskeert een plateau als de huidige knelpunten niet worden aangepakt. Prioriteit ligt bij het versterken van cashflow resilience, team retentie, klantdiversificatie en strategische focus.",
      insights: [
        "Snelle groei maskeert onderliggende kwetsbaarheden in cashflow en teamdynamiek",
        "Klantconcentratie van 40% vormt significant risico",
        "Marketing ROI daalt terwijl budget stijgt – indicatie van inefficiëntie",
        "Technische schuld remt productontwikkeling",
        "Leiderschap overbelast – risico op burn-out en slechte beslissingen",
      ],
      risks: [
        "Cashflow crunch door groei + vertraagde betalingen",
        "Talent exodus van key medewerkers",
        "Klantconcentratie risico",
        "Marketing inefficiëntie",
        "Strategische versnippering",
      ],
      opportunities: [
        "Klantenbasis diversifiëren voor stabielere omzet",
        "Marketing optimaliseren voor hogere ROI",
        "Technische schuld aanpakken voor snellere innovatie",
        "Team cultuur versterken voor hogere retentie",
        "Strategische focus aanscherpen voor betere executie",
      ],
      recommendations: [
        "Implementeer wekelijkse cashflow forecasting",
        "Start klantdiversificatie plan (doel: geen klant >15% omzet binnen 12 maanden)",
        "Voer marketing ROI analyse uit en heralloceer budget",
        "Plan technische schuld sprint in Q1",
        "Organiseer leadership off-site voor strategische alignment",
      ],
      roadmap_90d: {
        month1: [
          "Wekelijkse cashflow forecasting implementeren",
          "Top 10 risicoklanten identificeren en retentieplan maken",
          "Marketing spend analyse afronden",
          "Team engagement survey uitvoeren",
        ],
        month2: [
          "Nieuwe klantacquisitie versnellen (doel: 20% nieuwe omzet)",
          "Marketing campagnes optimaliseren op basis van ROI data",
          "Technische schuld backlog prioriteren",
          "Leadership coaching traject starten",
        ],
        month3: [
          "Klantconcentratie reduceren tot <25%",
          "Nieuwe product features lanceren",
          "OKR systeem implementeren",
          "Strategische review sessie met board",
        ],
      },
      ceo_message: "We staan op een kruispunt. De groei is indrukwekkend, maar zonder gerichte actie riskeren we een plateau. Dit is het moment om moeilijke keuzes te maken, prioriteiten scherp te stellen en te investeren in onze mensen en processen. Laten we dit samen doen – met focus, discipline en transparantie.",
      confidence_score: 0.91,
    };

    console.log("✅ Simulated Analysis Complete!\n");
    console.log("=".repeat(80));
    console.log("EXECUTIVE SUMMARY");
    console.log("=".repeat(80));
    console.log(simulatedResult.executive_summary);
    console.log("=".repeat(80));

    // Gebruik de echte formatter voor mooie output
    console.log(`\n📄 Full Formatted Report:\n`);
    console.log(aureliusFormatter.formatForDisplay(simulatedResult));

    console.log(`\n✅ Example completed successfully!`);
    return simulatedResult;
  } catch (error) {
    console.error("❌ Example failed:", error);
    throw error;
  }
}

// Run wanneer direct uitgevoerd
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullAnalysis().catch((err) => {
    console.error("Example failed:", err);
    process.exit(1);
  });
}

export { runFullAnalysis };