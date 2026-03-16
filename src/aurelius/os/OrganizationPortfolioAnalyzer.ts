export type PortfolioCase = {
  case_id: string;
  sector: string;
  dominant_problem: string;
  gekozen_strategie: string;
  resultaat?: string;
};

export type OrganizationPortfolioInput = {
  cases: PortfolioCase[];
};

export type PortfolioPattern = {
  sector: string;
  ratio: string;
  pattern: string;
};

export type OrganizationPortfolioOutput = {
  portfolio_patterns: PortfolioPattern[];
};

function pct(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export class OrganizationPortfolioAnalyzer {
  readonly name = "Organization Portfolio Analyzer";

  analyze(input: OrganizationPortfolioInput): OrganizationPortfolioOutput {
    const rows = input.cases ?? [];
    if (!rows.length) {
      return {
        portfolio_patterns: [
          {
            sector: "onbekend",
            ratio: "0%",
            pattern: "Nog onvoldoende portfolio-data voor sectoroverstijgende patronen.",
          },
        ],
      };
    }

    const bySector = new Map<string, PortfolioCase[]>();
    for (const row of rows) {
      const sector = row.sector || "onbekend";
      const list = bySector.get(sector) ?? [];
      list.push(row);
      bySector.set(sector, list);
    }

    const patterns: PortfolioPattern[] = [];
    for (const [sector, sectorRows] of bySector.entries()) {
      const total = sectorRows.length;
      const contractPressureCount = sectorRows.filter((row) =>
        /contract|plafond|tarief|verzekeraar/i.test(row.dominant_problem)
      ).length;

      patterns.push({
        sector,
        ratio: pct(contractPressureCount, total),
        pattern: `${pct(contractPressureCount, total)} van cases in ${sector} toont contract-/prijsdruk in het dominante probleem.`,
      });
    }

    return {
      portfolio_patterns: patterns.slice(0, 10),
    };
  }
}
