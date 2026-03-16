// ============================================================
// AURELIUS — ZORG BESLUITVORMINGSKAART CONSULTANT (BOARDROOM)
// ✅ CANON SAFE • EXECUTIVE-GRADE • ZERO BREAKS
// ============================================================

import type {
  Consultant,
  ConsultantContext,
  ConsultantResult,
} from "../../../orchestrator/consultantTypes";

/* ============================================================
   BOARDROOM OUTPUT — STRUCTURE
============================================================ */

export const zorgBesluitvormingskaartConsultant: Consultant = {
  key: "zorg_besluitvormingskaart",
  name: "Zorg Besluitvormingskaart",
  domain: "zorg_governance",

  async execute(context: ConsultantContext): Promise<ConsultantResult> {
    const org = context.company_context || "de organisatie";

    return {
      confidence: 0.92,

      content: {
        title: "Zorg Besluitvormingskaart — Bestuurlijke Spanningsanalyse",

        executive_snapshot: `
Binnen ${org} zien we een herkenbaar bestuurskundig spanningsveld:
besluitvorming moet versnellen, terwijl governance, capaciteit en toezichtdruk
juist zorgen voor vertraging en fragmentatie.
        `.trim(),

        boardroom_tensions: [
          {
            tension: "Kwaliteit vs. Kostenbeheersing",
            description:
              "De organisatie wordt gestuurd op zorguitkomsten, maar financiële druk leidt tot defensieve besluiten.",
            board_risk:
              "Structurele kwaliteitsverschraling wordt pas zichtbaar bij externe escalatie.",
          },
          {
            tension: "Professionele Autonomie vs. Centrale Regie",
            description:
              "Medisch leiderschap vraagt ruimte, terwijl bestuur uniformiteit en controle nodig heeft.",
            board_risk:
              "Parallelle besluitstructuren veroorzaken vertraging en wantrouwen.",
          },
          {
            tension: "Innovatie vs. Operationele Overbelasting",
            description:
              "Transformatie is noodzakelijk, maar teams draaien structureel boven capaciteit.",
            board_risk:
              "Innovatie blijft projectmatig en sterft buiten de lijnorganisatie.",
          },
          {
            tension: "Toezicht vs. Wendbaarheid",
            description:
              "RVT en externe toezichthouders vragen zekerheid, terwijl verandering snelheid vereist.",
            board_risk:
              "Strategische kansen worden gemist door besluitvormingsfrictie.",
          },
        ],

        governance_pressure_points: [
          "Besluiten worden genomen, maar landen niet in uitvoering.",
          "Escalaties komen laat — informatie stroomt gefilterd omhoog.",
          "Mandaten zijn gedeeld, eigenaarschap diffuus.",
          "Strategische thema’s concurreren met dagelijkse crisiscapaciteit.",
        ],

        recommended_board_moves: [
          {
            move: "Installeer een Besluitvormingskompas (1-pager)",
            impact:
              "Richt besluitvorming opnieuw in: mandaat, eigenaarschap, escalatiepad.",
            board_value:
              "Versnelling zonder verlies van toezicht en legitimiteit.",
          },
          {
            move: "Start een kwartaalcyclus ‘Governance Spanningsdialoog’",
            impact:
              "RVB + Directie + RVT bespreken expliciet de top 3 structurele spanningen.",
            board_value:
              "Spanningen worden gestuurd vóórdat ze escaleren.",
          },
          {
            move: "Maak eigenaarschap hard (1 besluit = 1 eigenaar)",
            impact:
              "Voorkomt bestuurlijke drift en versnelt implementatie.",
            board_value:
              "Strategie wordt uitvoerbaar, niet vrijblijvend.",
          },
        ],

        ninety_day_boardroom_plan: {
          days_0_30: [
            "Governance-besluitvorming in kaart brengen (RVB + Directie)",
            "Top 5 structurele blokkades expliciteren",
            "Mandaten en escalatieroutes vastleggen",
          ],
          days_30_60: [
            "Boardroom Spanningssessie #1 faciliteren",
            "Eigenaarschap per strategisch besluit benoemen",
            "Nieuwe besluitcadans implementeren",
          ],
          days_60_90: [
            "Besluitvorming stabiliseren en sturen op landing",
            "RVT alignment op governance-model",
            "Voorbereiden op schaalbare transformatie",
          ],
        },

        closing_statement: `
Deze kaart is geen rapport, maar een bestuurlijk instrument.
Niet de aanwezigheid van spanningen bepaalt succes —
maar de mate waarin ze expliciet worden bestuurd.
        `.trim(),
      },
    };
  },
};
