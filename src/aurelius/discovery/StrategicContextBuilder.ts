import type { OrganisationContext, StrategicContext } from "./types";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export class StrategicContextBuilder {
  readonly name = "Strategic Context Builder";

  build(input: { organisationContext: OrganisationContext }): StrategicContext {
    const org = input.organisationContext;
    const organisatiecontext = [
      `Organisatie: ${org.bedrijfsnaam}`,
      `Sector: ${org.sector}`,
      `Werknemers: ${org.aantal_werknemers}`,
      `Groeifase: ${org.groeifase}`,
      `Markt: ${org.markt}`,
      `Producten: ${org.producten.join(", ")}`,
    ].join("\n");

    const sectorcontext = /(zorg|ggz)/i.test(org.sector)
      ? "Sectorcontext: tariefdruk, contractplafonds en capaciteitskrapte vormen de dominante beperkingen."
      : "Sectorcontext: prijsdruk, operationele complexiteit en executierisico bepalen strategische ruimte.";

    const strategische_spanningen = [
      "Groeiambitie versus uitvoerbare capaciteit",
      "Lokale autonomie versus centrale besluitdiscipline",
      "Kwaliteit versus marge- en contractdruk",
    ];

    return {
      organisatiecontext: normalize(organisatiecontext),
      sectorcontext: normalize(sectorcontext),
      strategische_spanningen,
    };
  }
}
