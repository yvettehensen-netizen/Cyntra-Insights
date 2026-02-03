// src/cie/contextBuilder.ts

/**
 * Type definitie voor de intake gegevens van een Aurelius analyse.
 * Centrale bron van waarheid voor de input van de strategische analyse.
 */
export interface IntakeValues {
  companyName?: string;
  situation?: string;
  goals?: string;
  challenges?: string;
  teamDescription?: string;
  includeCulture?: boolean;
  culture?: {
    clarity: number;      // 1-5
    execution: number;    // 1-5
    feedback: number;     // 1-5
  };
}

/**
 * Bouwt de volledige context prompt op voor Aurelius 3.5 LLM analyse.
 * Output is een schone, gestructureerde system prompt met alle beschikbare informatie.
 */
export function buildAureliusContext(
  analysisType: string,
  intake: IntakeValues,
  documentData: string = ""
): string {
  const trimmedDocument = documentData.trim();

  const cultureSection = intake.includeCulture && intake.culture
    ? `
[ORGANISATIECULTUUR SCORES]
• Strategische duidelijkheid: ${intake.culture.clarity}/5
• Executiekracht: ${intake.culture.execution}/5
• Feedback- en leercultuur: ${intake.culture.feedback}/5`
    : "";

  return `
[AURELIUS 3.5 — STRATEGISCHE ANALYSE]
Analyse type: ${analysisType}

[ORGANISATIE CONTEXT]
Bedrijfsnaam: ${intake.companyName?.trim() || "Onbekend"}
Huidige situatie: ${intake.situation?.trim() || "Geen situatie beschreven"}

[STRATEGISCHE DOELSTELLINGEN]
${intake.goals?.trim() || "Geen doelen gespecificeerd"}

[KERNUITDAGINGEN & OBSTAKELS]
${intake.challenges?.trim() || "Geen uitdagingen benoemd"}

[TEAM & CULTUUR]
Teamdynamiek: ${intake.teamDescription?.trim() || "Geen teaminformatie"}${cultureSection}

[DOCUMENT BIJLAGE]
${trimmedDocument || "Geen documenten geüpload"}

[STRICTE OUTPUT INSTRUCTIE]
Je bent een senior strateeg bij een top-tier adviesbureau.
Genereer uitsluitend geldige JSON volgens onderstaand schema. Geen extra tekst, geen uitleg, geen markdown.

{
  "executive_summary": "Krachtige samenvatting in max 300 woorden — scherp, eerlijk en actiegericht",
  "insights": ["4-6 kerninzichten, concreet en prioriteit"],
  "risks": ["3-6 kritieke risico's, met impact en waarschijnlijkheid"],
  "opportunities": ["4-6 groeikansen, met potentieel en uitvoerbaarheid"],
  "roadmap_90d": {
    "month1": ["4-6 prioritaire acties", "focus: snelle wins, fundament versterken"],
    "month2": ["4-6 groeiacties", "focus: tractie opbouwen, systemen activeren"],
    "month3": ["3-5 schaalacties", "focus: consolidatie, duurzaamheid, volgende fase voorbereiden"]
  },
  "ceo_message": "Persoonlijk, motiverend advies in 2-3 zinnen — als van een ervaren mentor",
  "confidence_score": 0.XX
}

Gebruik alleen informatie uit bovenstaande context.
Wees professioneel, direct en uitvoerbaar.
`.trim();
}