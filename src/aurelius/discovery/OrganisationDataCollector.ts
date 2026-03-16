import type { DiscoveredOrganisation, OrganisationContext } from "./types";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function inferGrowthPhase(name: string, sector: string): string {
  const source = `${name} ${sector}`.toLowerCase();
  if (/startup|scale|labs|tech/.test(source)) return "schaalfase";
  if (/groep|collectief|network/.test(source)) return "groeifase";
  return "stabilisatiefase";
}

function inferProducts(sector: string): string[] {
  const low = sector.toLowerCase();
  if (/(zorg|ggz|jeugdzorg)/.test(low)) return ["Diagnostiek", "Behandeling", "Preventieve zorgprogramma's"];
  if (/industrie/.test(low)) return ["Productielijnen", "Kwaliteitsservices", "Supply chain ondersteuning"];
  if (/logistiek/.test(low)) return ["Transportcoördinatie", "Warehouse services", "Last-mile dienstverlening"];
  return ["Adviesdiensten", "Operationele dienstverlening", "Data-ondersteuning"];
}

function inferMarket(sector: string): string {
  const low = sector.toLowerCase();
  if (/(zorg|ggz)/.test(low)) return "Regionale zorgmarkt met contract- en capaciteitsdruk";
  if (/industrie/.test(low)) return "Concurrerende B2B-markt met marge- en ketendruk";
  if (/logistiek/.test(low)) return "Volatiele markt met prijsdruk en serviceverwachtingen";
  return "B2B-markt met toenemende vraag naar voorspelbare executie";
}

export class OrganisationDataCollector {
  readonly name = "Organisation Data Collector";

  collect(organisation: DiscoveredOrganisation): OrganisationContext {
    const name = normalize(organisation.organisation_name);
    const sector = normalize(organisation.sector) || "Onbekende sector";

    return {
      bedrijfsnaam: name,
      sector,
      aantal_werknemers: /ggz|zorg/i.test(sector) ? "25-120" : "50-250",
      producten: inferProducts(sector),
      markt: inferMarket(sector),
      groeifase: inferGrowthPhase(name, sector),
      website: normalize(organisation.website),
      locatie: normalize(organisation.location),
    };
  }
}
