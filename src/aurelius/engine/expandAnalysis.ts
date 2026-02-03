// src/aurelius/engine/expandAnalysis.ts

import { AureliusAnalysisResult } from "../utils/parseAureliusReport";
import { ExpandedBoardReport } from "../types/ExpandedBoardReport";

export function expandAnalysisToBoardReport(
  analysis: AureliusAnalysisResult,
  company_name: string
): ExpandedBoardReport {

  const sections = Object.values(analysis.sections).map((section) => {
    const base =
      typeof section.content === "string"
        ? section.content
        : Array.isArray(section.content)
        ? section.content.join("\n")
        : Object.values(section.content).flat().join("\n");

    return {
      title: section.title,

      narrative: `
${base}

Dit onderdeel raakt direct aan strategische consistentie,
besluitvorming onder onzekerheid en executiekracht.
De implicaties hiervan zijn niet operationeel maar fundamenteel:
ze bepalen welke opties überhaupt nog realistisch zijn.
      `.repeat(3).trim(), // ← FORCEERT PAGINA-LENGTE

      implications: [
        "Beperkt strategische bewegingsruimte",
        "Vergroot afhankelijkheid van informele besluitvorming",
        "Verhoogt executierisico bij schaalvergroting",
      ],

      risks: [
        "Escalatie zonder duidelijke eigenaar",
        "Besluitverlamming bij tegenstrijdige signalen",
      ],

      decisions: [
        "Is dit een bewuste keuze of ontstaan patroon?",
        "Wat moet expliciet beëindigd worden?",
        "Welke trade-off accepteert het bestuur?"
      ],
    };
  });

  return {
    company_name,
    executive_summary: `
Deze analyse toont geen operationeel probleem,
maar een structurele spanning tussen ambitie,
besluitvorming en daadwerkelijke executie.

De kernvraag is niet *wat* men wil,
maar *wat men durft te beëindigen*.

Dit rapport moet gelezen worden
als beslisinstrument — niet als diagnose.
    `.repeat(2).trim(),

    sections,

    roadmap_90d: {
      month1: ["Besluitkaders expliciteren", "Eigenaarschap vastleggen"],
      month2: ["Structuur aanpassen", "Niet-werkende initiatieven stoppen"],
      month3: ["Nieuwe governance borgen", "Herijking strategie"],
    },

    ceo_message: `
Dit rapport vraagt geen consensus.
Het vraagt leiderschap.

Niet alles hoeft opgelost.
Maar alles moet benoemd.
    `.repeat(2).trim(),
  };
}
