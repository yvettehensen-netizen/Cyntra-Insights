// ============================================================
// CYNTRA STRATEGIC RESOLUTION METHOD™
// Boardroom Decision Methodology (IP CORE)
// ============================================================

export const CYNTRA_METHOD = {
  name: "Cyntra Strategic Resolution Method™",

  premise:
    "Niet optimaliseren. Niet verbeteren. Besluiten forceren waar uitstel structureel schade veroorzaakt.",

  principles: [
    "Besluit boven consensus",
    "Oorzaak boven symptoom",
    "Eigenaarschap boven draagvlak",
    "Onomkeerbaarheid boven intentie",
  ],

  phases: [
    {
      id: 1,
      name: "Diagnose",
      mandate:
        "Vaststellen wat feitelijk waar is — los van interpretatie, belangen of narratief.",
      description:
        "Feiten, signalen en terugkerende patronen worden blootgelegd. Geen verklaringen, geen oplossingen, geen verzachting.",
      output:
        "Geverifieerd realiteitsbeeld waarop geen discussie meer mogelijk is.",
    },

    {
      id: 2,
      name: "Structurele pijn",
      mandate:
        "Identificeren waar het systeem zichzelf structureel tegenwerkt.",
      description:
        "De onderliggende oorzaak die alle zichtbare symptomen verklaart en zichzelf reproduceert.",
      output:
        "Eén structurele fout die niet kan worden genegeerd zonder blijvende schade.",
    },

    {
      id: 3,
      name: "Strategische spanning",
      mandate:
        "Expliciteren van het dilemma dat niet kan worden opgelost zonder verlies.",
      description:
        "Het fundamentele spanningsveld waar optimalisatie faalt en een keuze onvermijdelijk is.",
      output:
        "Een keuze die expliciet vraagt: wat offeren we op om verder te kunnen?",
    },

    {
      id: 4,
      name: "Interventies",
      mandate:
        "Ontwerpen van ingrepen die besluitvorming afdwingen.",
      description:
        "Gerichte interventies op governance-, structuur- en eigenaarschapsniveau. Geen initiatieven zonder afdwingbaarheid.",
      output:
        "Beperkt aantal interventies met eigenaar, deadline en consequentie.",
    },

    {
      id: 5,
      name: "Besluit",
      mandate:
        "Formaliseren van bestuurlijke verantwoordelijkheid.",
      description:
        "Het expliciete besluit inclusief keuzeconflicten, stop-keuzes en persoonlijke aansprakelijkheid.",
      output:
        "Een besluit dat niet kan worden teruggedraaid zonder reputatie- of machtsverlies.",
    },

    {
      id: 6,
      name: "Executie",
      mandate:
        "Vertalen van besluit naar onomkeerbare realiteit.",
      description:
        "Korte executiefase gericht op zichtbare uitvoering, ownership en afsluiting.",
      output:
        "Besluit is zichtbaar uitgevoerd of formeel geëscaleerd.",
    },
  ],
} as const;
