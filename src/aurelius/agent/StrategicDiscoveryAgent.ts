import {
  OrganisationDiscoveryEngine,
  type DiscoveredOrganisation,
} from "@/aurelius/discovery";

export type StrategicDiscoveryInput = {
  sector: string;
  zoekterm: string;
  max_results?: number;
};

export type StrategicDiscoveredOrganisation = DiscoveredOrganisation & {
  mogelijke_strategische_spanning: string;
  bron: "nieuws" | "sector_database" | "bedrijfslijst";
};

function inferTension(org: DiscoveredOrganisation): string {
  const source = `${org.organisation_name} ${org.sector}`.toLowerCase();
  if (/(zorg|ggz)/.test(source)) return "Kwaliteit versus capaciteit en tariefdruk.";
  if (/(industrie|maak)/.test(source)) return "Operationele schaalbaarheid versus margedruk.";
  if (/(logistiek|supply)/.test(source)) return "Servicebetrouwbaarheid versus prijsdruk.";
  return "Groeiambitie versus uitvoeringsdiscipline.";
}

function sourceByIndex(index: number): StrategicDiscoveredOrganisation["bron"] {
  if (index % 3 === 0) return "nieuws";
  if (index % 3 === 1) return "sector_database";
  return "bedrijfslijst";
}

export class StrategicDiscoveryAgent {
  readonly name = "Strategic Discovery Agent";

  private readonly discovery = new OrganisationDiscoveryEngine();

  discover(input: StrategicDiscoveryInput): StrategicDiscoveredOrganisation[] {
    const max = Math.max(1, Math.min(input.max_results ?? 8, 25));
    const discovered = this.discovery.discover({
      sector: input.sector,
      zoekterm: input.zoekterm,
    });

    return discovered.slice(0, max).map((org, index) => ({
      ...org,
      mogelijke_strategische_spanning: inferTension(org),
      bron: sourceByIndex(index),
    }));
  }
}

