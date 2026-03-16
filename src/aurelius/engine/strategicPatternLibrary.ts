export type StrategicPatternDefinition = {
  naam: string;
  beschrijving: string;
  signalen: string[];
  risico: string;
  strategische_reactie: string;
};

export const STRATEGIC_PATTERN_LIBRARY: StrategicPatternDefinition[] = [
  {
    naam: "Fragmented Portfolio",
    beschrijving: "De organisatie bedient te veel markten, klantgroepen of proposities tegelijk.",
    signalen: ["veel verschillende klantgroepen", "grote variatie in marges", "versnipperde capaciteit"],
    risico: "Operationele complexiteit en lage marges.",
    strategische_reactie: "Portfolio versmallen of prioriteren.",
  },
  {
    naam: "Access vs Capacity",
    beschrijving: "De organisatie wil toegankelijk blijven terwijl de capaciteit zichtbaar onder druk staat.",
    signalen: ["wachttijden", "hoge caseload", "stijgende werkdruk"],
    risico: "Kwaliteit en teamstabiliteit komen onder druk.",
    strategische_reactie: "Instroom disciplineren.",
  },
  {
    naam: "Founder Culture",
    beschrijving: "De cultuur en besluitvorming hangen sterk op één leider of klein leiderschapsteam.",
    signalen: ["sterke persoonlijke leiding", "directe betrokkenheid bij teams", "informele sturing"],
    risico: "Schaalbaarheid en overdraagbaarheid blijven beperkt.",
    strategische_reactie: "Cultuur institutionaliseren.",
  },
  {
    naam: "Growth Complexity",
    beschrijving: "Groei maakt de organisatie bestuurlijk zwaarder en minder scherp.",
    signalen: ["meer managementlagen", "trage besluitvorming", "meer afstemming"],
    risico: "Verlies van focus.",
    strategische_reactie: "Structuur vereenvoudigen.",
  },
  {
    naam: "Network Dependency",
    beschrijving: "Instroom of legitimiteit is sterk afhankelijk van partners, verwijzers of een regionaal netwerk.",
    signalen: ["consortium", "verwijzers", "externe toegangspoorten"],
    risico: "Verlies van controle over instroom.",
    strategische_reactie: "Netwerkpositie versterken.",
  },
  {
    naam: "Margin Compression",
    beschrijving: "Kosten stijgen sneller dan inkomsten of tarieven meebewegen.",
    signalen: ["margedruk", "stijgende personeelskosten", "tariefverschillen"],
    risico: "Financiële fragiliteit.",
    strategische_reactie: "Portfolio en kostenstructuur herzien.",
  },
  {
    naam: "Innovation Drift",
    beschrijving: "Innovaties, pilots en nieuwe initiatieven verspreiden energie en aandacht.",
    signalen: ["veel pilots", "experimentele projecten", "nieuwe initiatieven"],
    risico: "Focusverlies.",
    strategische_reactie: "Innovatieportfolio prioriteren.",
  },
  {
    naam: "Governance Gap",
    beschrijving: "Strategie en uitvoering lopen uit elkaar door onduidelijke mandaten of zwakke opvolging.",
    signalen: ["besluiten worden niet uitgevoerd", "onduidelijke mandaten", "herhaalde escalaties"],
    risico: "Strategische inertie.",
    strategische_reactie: "Governance aanscherpen.",
  },
  {
    naam: "Scale vs Culture",
    beschrijving: "Schaal of groei zet de cultuur en identiteit van de organisatie onder druk.",
    signalen: ["snelle groei", "cultuurverandering", "verlies van samenhang"],
    risico: "Verlies van identiteit.",
    strategische_reactie: "Cultuur expliciet maken.",
  },
  {
    naam: "Regional Relevance Trap",
    beschrijving: "De organisatie blijft breed aanwezig om regionaal relevant te blijven, ook waar de economie zwakker wordt.",
    signalen: ["veel regio's", "lage marges in sommige gebieden", "brede aanwezigheid"],
    risico: "Economische houdbaarheid onder druk.",
    strategische_reactie: "Regionale prioritering.",
  },
];
