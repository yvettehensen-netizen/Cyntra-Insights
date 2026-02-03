// ============================================================
// src/aurelius/utils/generate90DayActionPlan.ts
// CYNTRA — GENERATE 90 DAY ACTIONPLAN (FINAL CANON)
//
// RULES:
// - Every analysis gets a boardroom-grade 90D closure roadmap
// - ZorgScan = governance-first besluit-sluiting
// - Distinct logic per domein (no generic templates)
// - STRICT TypeScript safe
// - ADD ONLY — NEVER DOWNGRADE
// ============================================================

/* ============================================================
   TYPES
============================================================ */

export type AureliusAnalysisType =
  | "zorgscan"
  | "strategy"
  | "strategic"
  | "financial"
  | "financial_strategy"
  | "growth"
  | "market"
  | "process"
  | "leadership"
  | "team_dynamics"
  | "team_culture"
  | "change_resilience"
  | "onderstroom"
  | "swot"
  | "esg"
  | "ai_data"
  | "deep_dive";

export interface ActionItem {
  number: number;
  title: string;
  owner: string;
  deadline: string;
}

export interface ActionMonth {
  month: number;
  title: string;
  phase: string;
  actions: ActionItem[];
  gradientFrom: string;
  gradientTo: string;
  badgeBg: string;
  numberBg: string;
}

/* ============================================================
   MAIN GENERATOR
============================================================ */

export function generate90DayActionPlan(
  type: AureliusAnalysisType
): ActionMonth[] {
  /* ============================================================
     ✅ ZORGSCAN — GOVERNANCE & BESLUITSLUITING
  ============================================================ */
  if (type === "zorgscan") {
    return [
      {
        month: 1,
        title: "Stabilisatie",
        phase: "Stop besluit-verdamping",
        actions: [
          {
            number: 1,
            title:
              "Wijs één finale besluit-owner toe per dossier. Overlegstructuren verliezen besluitrecht.",
            owner: "Directie / MT-voorzitter",
            deadline: "Binnen 14 dagen",
          },
          {
            number: 2,
            title:
              "Definieer irreversibility deadlines voor alle open governancebesluiten.",
            owner: "Governance Office",
            deadline: "Binnen 21 dagen",
          },
          {
            number: 3,
            title:
              "Verplicht closure audit trail: elk besluit krijgt een eindstatus.",
            owner: "Secretaris Raad van Bestuur",
            deadline: "Binnen 30 dagen",
          },
        ],
        gradientFrom: "from-[#d4af37]/40",
        gradientTo: "to-black",
        badgeBg: "bg-black/40",
        numberBg: "bg-[#d4af37]",
      },
      {
        month: 2,
        title: "Interventie",
        phase: "Forceer besluit-sluiting",
        actions: [
          {
            number: 1,
            title:
              "Schrap consensus als default mechanisme. Mandaat > draagvlak.",
            owner: "Raad van Bestuur",
            deadline: "Binnen 45 dagen",
          },
          {
            number: 2,
            title:
              "Introduceer escalatieplicht: >90 dagen open = board review.",
            owner: "Accountability Lead",
            deadline: "Binnen 60 dagen",
          },
          {
            number: 3,
            title:
              "Maak onderstroom expliciet vóór uitvoering van besluiten.",
            owner: "HR & Medisch Leiderschap",
            deadline: "Binnen 65 dagen",
          },
        ],
        gradientFrom: "from-red-800/40",
        gradientTo: "to-black",
        badgeBg: "bg-black/40",
        numberBg: "bg-[#d4af37]",
      },
      {
        month: 3,
        title: "Closure",
        phase: "Institutionaliseer governance-kracht",
        actions: [
          {
            number: 1,
            title:
              "Verplicht Quarterly Board Closure Review voor alle strategische besluiten.",
            owner: "Raad van Toezicht",
            deadline: "Binnen 75 dagen",
          },
          {
            number: 2,
            title:
              "Veranker besluit-sluiting als structuur, niet als cultuurinitiatief.",
            owner: "Strategy Office",
            deadline: "Binnen 85 dagen",
          },
          {
            number: 3,
            title:
              "90D governance reset: open besluiten worden gesloten of beëindigd.",
            owner: "CEO / Directie",
            deadline: "Binnen 90 dagen",
          },
        ],
        gradientFrom: "from-green-800/40",
        gradientTo: "to-black",
        badgeBg: "bg-black/40",
        numberBg: "bg-[#d4af37]",
      },
    ];
  }

  /* ============================================================
     ✅ STRATEGIE / GROEI — RICHTING & FOCUS
  ============================================================ */
  if (
    type === "strategy" ||
    type === "strategic" ||
    type === "growth" ||
    type === "market"
  ) {
    return [
      {
        month: 1,
        title: "Richting",
        phase: "Stop strategische drift",
        actions: [
          {
            number: 1,
            title:
              "Formuleer één dominante strategische keuze. Nevenprioriteiten vervallen.",
            owner: "CEO",
            deadline: "Binnen 14 dagen",
          },
          {
            number: 2,
            title:
              "Beëindig initiatieven die geen direct strategisch voordeel bouwen.",
            owner: "Directieteam",
            deadline: "Binnen 30 dagen",
          },
          {
            number: 3,
            title:
              "Vertaal strategie naar maximaal drie outcome-KPI’s.",
            owner: "COO",
            deadline: "Binnen 30 dagen",
          },
        ],
        gradientFrom: "from-indigo-700/40",
        gradientTo: "to-black",
        badgeBg: "bg-black/40",
        numberBg: "bg-[#d4af37]",
      },
      {
        month: 2,
        title: "Executie",
        phase: "Strategie → operatie",
        actions: [
          {
            number: 1,
            title:
              "Introduceer wekelijkse executive execution cadence.",
            owner: "COO",
            deadline: "Binnen 45 dagen",
          },
          {
            number: 2,
            title:
              "Wijs ownership toe per resultaat, niet per afdeling.",
            owner: "Leadership Team",
            deadline: "Binnen 60 dagen",
          },
        ],
        gradientFrom: "from-purple-800/40",
        gradientTo: "to-black",
        badgeBg: "bg-black/40",
        numberBg: "bg-[#d4af37]",
      },
      {
        month: 3,
        title: "Discipline",
        phase: "Institutionaliseren",
        actions: [
          {
            number: 1,
            title:
              "Quarterly strategy closure review: koers bevestigen of stoppen.",
            owner: "Board",
            deadline: "Binnen 90 dagen",
          },
        ],
        gradientFrom: "from-green-700/40",
        gradientTo: "to-black",
        badgeBg: "bg-black/40",
        numberBg: "bg-[#d4af37]",
      },
    ];
  }

  /* ============================================================
     ✅ FINANCIEEL — OVERLEVING & MARGE
  ============================================================ */
  if (type === "financial" || type === "financial_strategy") {
    return [
      {
        month: 1,
        title: "Cash Control",
        phase: "Stop verlies",
        actions: [
          {
            number: 1,
            title:
              "Maak cash runway exact inzichtelijk (dag-niveau).",
            owner: "CFO",
            deadline: "Binnen 7 dagen",
          },
          {
            number: 2,
            title:
              "Freeze alle non-core uitgaven per direct.",
            owner: "Directie",
            deadline: "Binnen 14 dagen",
          },
          {
            number: 3,
            title:
              "Introduceer marge-overzicht per product of dienst.",
            owner: "Finance Lead",
            deadline: "Binnen 30 dagen",
          },
        ],
        gradientFrom: "from-red-900/50",
        gradientTo: "to-black",
        badgeBg: "bg-black/40",
        numberBg: "bg-[#d4af37]",
      },
      {
        month: 2,
        title: "Herstel",
        phase: "Winstmechaniek",
        actions: [
          {
            number: 1,
            title:
              "Verhoog pricing of beëindig structurele verliesposten.",
            owner: "CEO & Sales",
            deadline: "Binnen 45 dagen",
          },
          {
            number: 2,
            title:
              "Maandelijkse profit-closure review op boardniveau.",
            owner: "Board",
            deadline: "Binnen 60 dagen",
          },
        ],
        gradientFrom: "from-yellow-800/40",
        gradientTo: "to-black",
        badgeBg: "bg-black/40",
        numberBg: "bg-[#d4af37]",
      },
      {
        month: 3,
        title: "Verankering",
        phase: "Geen terugval",
        actions: [
          {
            number: 1,
            title:
              "90D reset: marge wordt formele governance-metric.",
            owner: "CFO & Board",
            deadline: "Binnen 90 dagen",
          },
        ],
        gradientFrom: "from-green-700/40",
        gradientTo: "to-black",
        badgeBg: "bg-black/40",
        numberBg: "bg-[#d4af37]",
      },
    ];
  }

  /* ============================================================
     ✅ DEFAULT — ALL OTHER ANALYSES
  ============================================================ */
  return [
    {
      month: 1,
      title: "Stabilisatie",
      phase: "Stop structurele verdamping",
      actions: [
        {
          number: 1,
          title:
            "Wijs één eindverantwoordelijke toe voor dit domein.",
          owner: "Directie",
          deadline: "Binnen 14 dagen",
        },
        {
          number: 2,
          title:
            "Definieer harde closure deadlines per dossier.",
          owner: "Governance",
          deadline: "Binnen 30 dagen",
        },
      ],
      gradientFrom: "from-[#d4af37]/40",
      gradientTo: "to-black",
      badgeBg: "bg-black/40",
      numberBg: "bg-[#d4af37]",
    },
  ];
}
