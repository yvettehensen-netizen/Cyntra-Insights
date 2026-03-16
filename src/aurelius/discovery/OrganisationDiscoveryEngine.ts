import type { DiscoveredOrganisation } from "./types";

export type OrganisationDiscoveryInput = {
  sector: string;
  zoekterm: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

const DIRECTORY: DiscoveredOrganisation[] = [
  { organisation_name: "GGZ Voor Jou", sector: "Zorg/GGZ", website: "https://ggzvoorbeeld.nl", location: "Ede" },
  { organisation_name: "Vallei Zorgcollectief", sector: "Zorg/GGZ", website: "https://valleizorg.example", location: "Wageningen" },
  { organisation_name: "Delta Maakindustrie", sector: "Industrie", website: "https://delta-industrie.example", location: "Rotterdam" },
  { organisation_name: "NoordData Services", sector: "Zakelijke dienstverlening", website: "https://noorddata.example", location: "Groningen" },
  { organisation_name: "Stad Logistics", sector: "Logistiek", website: "https://stadlogistics.example", location: "Utrecht" },
];

export class OrganisationDiscoveryEngine {
  readonly name = "Organisation Discovery Engine";

  discover(input: OrganisationDiscoveryInput): DiscoveredOrganisation[] {
    const sector = normalize(input.sector).toLowerCase();
    const query = normalize(input.zoekterm).toLowerCase();

    const filtered = DIRECTORY.filter((item) => {
      const haystack = `${item.organisation_name} ${item.sector} ${item.location}`.toLowerCase();
      const sectorMatch = !sector || item.sector.toLowerCase().includes(sector);
      const queryMatch = !query || haystack.includes(query);
      return sectorMatch && queryMatch;
    });

    if (filtered.length) return filtered.slice(0, 10);

    if (!query) return DIRECTORY.slice(0, 5);
    return [
      {
        organisation_name: normalize(input.zoekterm),
        sector: normalize(input.sector) || "Onbekende sector",
        website: "https://onbekend.example",
        location: "Onbekende locatie",
      },
    ];
  }
}
