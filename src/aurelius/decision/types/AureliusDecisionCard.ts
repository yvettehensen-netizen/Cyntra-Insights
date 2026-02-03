// ============================================================
// src/aurelius/decision/types/AureliusDecisionCard.ts
// CANONICAL TYPE — DECISION MACHINE • VAULT + PDF SAFE
// PORTER • PESTEL • McKINSEY 7S • GROW • VIBAAAN • HGBCO
// ============================================================

/* ============================================================
   CORE ENUMS — STRICT & FUTURE-PROOF
============================================================ */

export type DecisionArena =
  | "Initiatief"
  | "MT"
  | "Bestuur"
  | "Governance"
  | "Ownership";

export type TensionSource =
  | "Porter"
  | "PESTEL"
  | "McKinsey7S"
  | "GROW"
  | "Onderstroom"
  | "Governance";

export type InterventionLayer =
  | "Bovenstroom"
  | "Onderstroom"
  | "Structuur"
  | "Gedrag"
  | "Mandaat";

/* ============================================================
   HGBCO — CANONICAL DECISION CARD
   🔒 SCHEMA BEHOUDEN
   ➕ UITSLUITEND ADDITIEF (OPTIONEEL)
============================================================ */

export interface AureliusDecisionCard {
  besluitkaart: {
    /* ========================================================
       H — HUIDIGE REALITEIT (OBJECTIEF • CONFLICTVRIJ)
       Gebouwd uit Porter / PESTEL / 7S / GROW-Reality
    ======================================================== */
    H: {
      samenvatting: string;

      porter_forces: string[];
      pestel_factors: string[];
      mckinsey_7s_mismatches: string[];
      grow_reality: string[];

      non_negotiables: string[];

      dominante_spanningen: Array<{
        bron: TensionSource;
        arena: DecisionArena;
        structurele_spanning: string;
        failure_mode: string;
        waarneembaar_signaal: string;
        escalatie_risico: "laag" | "middel" | "hoog";

        /* ================= ADD ONLY ================= */
        onderliggende_dynamiek?: string; // explicitering onderstroom
        herkomst_bewijs?: string[]; // bronzinnen uit analyses
      }>;

      /* ================= ADD ONLY ================= */
      externe_drukfactoren?: string[]; // Porter / PESTEL samengevat
      interne_misalignment_score?: number; // 0–100 indicatief
    };

    /* ========================================================
       G — GEKOZEN RICHTING (EXCLUSIEF)
       Geen balans • Geen compromis
    ======================================================== */
    G: {
      richting: string;
      expliciet_verlaten_richtingen: string[];
      strategische_tradeoffs: string[];

      /* ================= ADD ONLY ================= */
      gekozen_bestuurlijke_principes?: string[]; // leidende keuzes
      horizon?: "kort" | "middellang" | "lang"; // besluit-horizon
    };

    /* ========================================================
       B — BLOKKADES & BESLUITRISICO’S
       VIBAAAN — waarom besluitvorming faalt
    ======================================================== */
    B: Array<{
      arena: DecisionArena;
      spanning_oorsprong: TensionSource;
      blokkade: string;
      waarom_blijft_bestaan: string;
      risico_bij_niet_ingrijpen: string;

      /* ================= ADD ONLY ================= */
      besluitpatroon?: "uitstel" | "delegatie" | "escalatie" | "vermijding";
      impact_bij_continuering?: "beperkt" | "ernstig" | "existentiëel";
    }>;

    /* ========================================================
       C — CONSEQUENTIES & INTERVENTIES
       Onomkeerbaar • Afdwingbaar • Eigenaarschap
    ======================================================== */
    C: Array<{
      interventie: string;
      laag: InterventionLayer;
      owner: string;
      irreversibility_deadline: string; // YYYY-MM-DD
      afdwingmechanisme: string;
      wat_wordt_onmogelijk_na_deze_keuze: string;

      /* ================= ADD ONLY ================= */
      gekoppelde_blokkade?: string; // verwijzing naar B
      succescriterium?: string; // toetsbaar resultaat
      fallback_bij_mislukking?: string; // bestuurlijk vangnet
    }>;

    /* ========================================================
       O — OWNERSHIP & EXECUTIECONTRACT
       90-DAGEN BESLUITCONTRACT
    ======================================================== */
    O: {
      eindverantwoordelijke: string;
      eerste_90_dagen: string[];
      review_moment: string; // YYYY-MM-DD
      escalatiepad: string;
      stopcriteria: string[];

      /* ================= ADD ONLY ================= */
      monitoring_indicatoren?: string[]; // voortgang & gedrag
      besluit_status?: "actief" | "gesloten" | "geëscaleerd";
    };
  };

  /* ============================================================
     META — BETROUWBAARHEID & AUDIT
  ============================================================ */

  confidence: number; // 0.00 – 1.00

  /* ================= ADD ONLY ================= */
  decision_frameworks_used?: Array<
    "Porter" | "PESTEL" | "McKinsey7S" | "GROW" | "VIBAAAN" | "HGBCO"
  >;
  generated_at?: string; // ISO timestamp
  decision_id?: string; // vault / audit reference
}
