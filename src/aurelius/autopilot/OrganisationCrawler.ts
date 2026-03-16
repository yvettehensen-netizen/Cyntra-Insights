import {
  OrganisationDiscoveryEngine,
  type OrganisationDiscoveryInput,
  type DiscoveredOrganisation,
} from "@/aurelius/discovery";

export type OrganisationCrawlerInput = {
  sector: string;
  zoekterm: string;
  max_results?: number;
};

export type OrganisationCrawlerResult = {
  organisations: DiscoveredOrganisation[];
  crawled_at: string;
};

export class OrganisationCrawler {
  readonly name = "Organisation Crawler";

  constructor(private readonly discovery = new OrganisationDiscoveryEngine()) {}

  crawl(input: OrganisationCrawlerInput): OrganisationCrawlerResult {
    const query: OrganisationDiscoveryInput = {
      sector: input.sector,
      zoekterm: input.zoekterm,
    };
    const discovered = this.discovery.discover(query);
    const max = Math.max(1, Math.min(input.max_results ?? 5, 25));

    return {
      organisations: discovered.slice(0, max),
      crawled_at: new Date().toISOString(),
    };
  }
}

