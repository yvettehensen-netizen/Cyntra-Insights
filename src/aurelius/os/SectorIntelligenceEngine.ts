export type SectorPattern = {
  pattern: string;
  evidence: string;
  strategic_implication: string;
};

export type SectorIntelligenceInput = {
  sector: string;
  contextText: string;
  mechanisms: string[];
  insights: string[];
};

export type SectorIntelligenceOutput = {
  sector: string;
  sector_patterns: SectorPattern[];
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function hasAny(source: string, terms: string[]): boolean {
  const low = source.toLowerCase();
  return terms.some((term) => low.includes(term.toLowerCase()));
}

export class SectorIntelligenceEngine {
  readonly name = "Sector Intelligence Engine";

  analyze(input: SectorIntelligenceInput): SectorIntelligenceOutput {
    const source = [
      input.contextText,
      ...input.mechanisms,
      ...input.insights,
      input.sector,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const patterns: SectorPattern[] = [];

    if (hasAny(source, ["contract", "plafond", "verzekeraar", "tarief"])) {
      patterns.push({
        pattern: "Contractplafonds blokkeren schaalgroei",
        evidence: "Herhaalde signalen op contractruimte, tariefdruk en plafondwerking.",
        strategic_implication: "Groei vereist eerst contractdiscipline en margevloer.",
      });
    }

    if (hasAny(source, ["werkdruk", "capaciteit", "fte", "planning", "productiviteit"])) {
      patterns.push({
        pattern: "Arbeidsintensief model begrenst uitvoeringssnelheid",
        evidence: "Capaciteits- en productiviteitssignalen zijn dominant in de analyse.",
        strategic_implication: "Sturing op casemix en capaciteit moet vóór verbreding worden versterkt.",
      });
    }

    if (hasAny(source, ["ggz", "zorg", "jeugdzorg", "wachtlijst"])) {
      patterns.push({
        pattern: "Zorgcontinuiteit staat onder druk bij financiële frictie",
        evidence: "Zorgcontext combineert operationele druk met contractafhankelijkheid.",
        strategic_implication: "Besluitvolgorde moet continuïteit van kernzorg expliciet beschermen.",
      });
    }

    if (!patterns.length) {
      patterns.push({
        pattern: "Sectorpatroon nog beperkt onderbouwd",
        evidence: "Beschikbare context bevat onvoldoende sectorspecifieke markers.",
        strategic_implication: "Gebruik first-principles sturing met snelle sectorvalidatie.",
      });
    }

    return {
      sector: normalize(input.sector) || "Onbekende sector",
      sector_patterns: patterns.slice(0, 6),
    };
  }
}
