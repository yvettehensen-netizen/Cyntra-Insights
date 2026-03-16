export type DiscoveredOrganisation = {
  organisation_name: string;
  sector: string;
  website: string;
  location: string;
};

export type OrganisationContext = {
  bedrijfsnaam: string;
  sector: string;
  aantal_werknemers: string;
  producten: string[];
  markt: string;
  groeifase: string;
  website?: string;
  locatie?: string;
};

export type StrategicContext = {
  organisatiecontext: string;
  sectorcontext: string;
  strategische_spanningen: string[];
};
