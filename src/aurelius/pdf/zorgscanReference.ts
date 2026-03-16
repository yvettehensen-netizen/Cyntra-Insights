export const ZORGSCAN_REFERENCE_REPORT = {
  organisation: "Referentie Zorgorganisatie",
  summary:
    "Deze referentie-uitvoer toont hoe de Besluitvormingsscan moet renderen wanneer alle velden aanwezig zijn. De organisatie opereert onder hoge druk van wachtlijsten, budgetrestricties en governance-frictie. De kernvraag is niet óf er besluiten nodig zijn, maar wie ze expliciet eigent en welke onomkeerbare keuzes nu moeten landen.",
  primary_signal:
    "De besluitvorming blijft circulair omdat het mandaat voor afsluiting verschuift tussen bestuur, MT en uitvoering. Zonder expliciete ownership en closure‑deadlines wordt elk besluit terugverwezen naar ‘nadere afstemming’, waardoor kosten, kwaliteit en vertrouwen tegelijk eroderen.",
  decision_card: {
    executive_thesis:
      "Het bestuur moet binnen 30 dagen besluiten welke zorglijnen worden afgeschaald en welke versneld worden geïnvesteerd, met één eigenaar en een expliciete closure‑deadline.",
    central_tension:
      "Kwaliteit en toegankelijkheid worden publiek beloofd, maar interne besluitstructuur voorkomt dat middelen op tijd worden herverdeeld.",
    recommendation:
      "Leg het besluitcontract neer bij één bestuurlijk eigenaar en stop parallelle escalatielijnen.",
    decision_contract:
      "Besluit: herprioriteer drie kernlijnen, beëindig twee marginale trajecten, en leg het budget per direct vast.",
    execution_plan:
      "Binnen 90 dagen: governance herverdelen, eigenaarschap benoemen, en executie‑signalen wekelijks monitoren.",
  },
  failure_maps: [
    {
      fase: "Besluitvorming",
      arena: "Bestuur",
      structurele_spanning: "Mandaat diffuus tussen bestuur en MT.",
      failure_mode: "Besluit blijft hangen in overlegstructuur.",
      signaal: "Herhaling zonder closure.",
    },
    {
      fase: "Executie",
      arena: "Uitvoering",
      structurele_spanning: "Budget toegezegd zonder harde prioritering.",
      failure_mode: "Uitvoering versnipperd, geen ownership.",
      signaal: "Deadlines schuiven door.",
    },
  ],
  boardroom_tensions: [
    {
      tension: "Kwaliteit vs kosten",
      description:
        "De organisatie kan kwaliteit niet blijven leveren zonder harde keuzes in portfolio en capaciteit.",
      board_risk: "Toezicht en reputatie onder druk.",
    },
  ],
  governance_pressure_points: [
    "Geen eenduidig mandaat voor stop‑besluiten.",
    "Overlegstructuur vervangt eigenaarschap.",
    "Geen harde executie‑deadlines.",
  ],
  recommended_board_moves: [
    {
      move: "Leg besluitcontract neer bij één eigenaar.",
      impact: "Stop tegenstrijdige escalaties.",
      board_value: "Governance‑stabiliteit",
    },
    {
      move: "Maak closure‑deadlines publiek binnen MT en uitvoering.",
      impact: "Zorgt voor executiedruk en duidelijkheid.",
      board_value: "Besluitkracht",
    },
  ],
  ninety_day_boardroom_plan: {
    days_0_30: [
      "Benoem eigenaar en besluitcontract.",
      "Stop parallelle escalaties.",
      "Publiceer closure‑deadlines.",
    ],
    days_31_60: [
      "Verdeel middelen volgens nieuw besluit.",
      "Meet executie‑signalering wekelijks.",
    ],
    days_61_90: [
      "Herijk governance‑structuur op basis van signalen.",
      "Borg mandaat in ritme en besluitkalender.",
    ],
  },
  narrative:
    "Dit is een referentie‑narratief dat laat zien hoe een volledige Besluitvormingsscan eruitziet. Het rapport is lang, lineair en in het Nederlands, zonder bullets of markdown. In de echte output wordt de context van de organisatie veel uitgebreider beschreven, inclusief financiering, governance‑dynamiek en de implicaties van uitstel.",
  documents_summary:
    "DOC 1: Bestuursmemo Q3 (application/pdf, 1.2 MB)\nSamenvatting: memo over wachttijden, governance‑frictie en budgetdruk.\n\nDOC 2: MT‑notulen (text/plain, 34 KB)\nSamenvatting: discussie over mandaat, escalatie en uitvoeringsrisico.",
  documents_storage: [
    {
      bucket: "cyntra-uploads",
      path: "ref/board-memo.pdf",
      name: "Bestuursmemo Q3.pdf",
      public_url: "https://example.com/board-memo.pdf",
    },
    {
      bucket: "cyntra-uploads",
      path: "ref/mt-notulen.txt",
      name: "MT-notulen.txt",
      public_url: "https://example.com/mt-notulen.txt",
    },
  ],
};
