// ============================================================
// src/aurelius/utils/validateHGBCO.ts
// AURELIUS — HGBCO DECISION VALIDATOR (FINAL CANON)
// ============================================================

import type {
  AureliusDecisionCard,
  DecisionArena,
  InterventionLayer,
} from "@/aurelius/decision/types/AureliusDecisionCard";

/* =========================
   HELPERS
========================= */

function sentenceCount(text: string): number {
  return text
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function assertNonEmpty(value: unknown, label: string): void {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && !value.trim())
  ) {
    throw new Error(`${label} ontbreekt of is leeg`);
  }
}

function assertISODate(date: string, label: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${label} moet YYYY-MM-DD zijn`);
  }
}

/* =========================
   MAIN VALIDATOR
========================= */

export function validateHGBCO(
  card: AureliusDecisionCard
): true {
  if (!card || !card.besluitkaart) {
    throw new Error("HGBCO besluitkaart ontbreekt");
  }

  const { H, G, B, C, O } = card.besluitkaart;

  /* ========================================================
     H — HUIDIGE REALITEIT
  ======================================================== */

  assertNonEmpty(H.samenvatting, "H.samenvatting");

  if (sentenceCount(H.samenvatting) > 4) {
    throw new Error("H.samenvatting mag maximaal 4 zinnen bevatten");
  }

  if (!Array.isArray(H.dominante_spanningen) || H.dominante_spanningen.length < 1) {
    throw new Error("H.dominante_spanningen moet minimaal 1 spanning bevatten");
  }

  H.dominante_spanningen.forEach((s, i) => {
    assertNonEmpty(s.structurele_spanning, `H.dominante_spanningen[${i}].structurele_spanning`);
    assertNonEmpty(s.failure_mode, `H.dominante_spanningen[${i}].failure_mode`);
    assertNonEmpty(s.waarneembaar_signaal, `H.dominante_spanningen[${i}].waarneembaar_signaal`);
  });

  /* ========================================================
     G — GEKOZEN RICHTING
  ======================================================== */

  assertNonEmpty(G.richting, "G.richting");

  if (sentenceCount(G.richting) !== 1) {
    throw new Error("G.richting moet exact 1 zin zijn");
  }

  if (!Array.isArray(G.expliciet_verlaten_richtingen) || G.expliciet_verlaten_richtingen.length < 1) {
    throw new Error("G.expliciet_verlaten_richtingen moet minimaal 1 verlaten richting bevatten");
  }

  /* ========================================================
     B — BLOKKADES (VIBAAAN)
  ======================================================== */

  if (!Array.isArray(B) || B.length !== 3) {
    throw new Error("B moet exact 3 structurele blokkades bevatten");
  }

  B.forEach((b, i) => {
    assertNonEmpty(b.blokkade, `B[${i}].blokkade`);
    assertNonEmpty(b.waarom_blijft_bestaan, `B[${i}].waarom_blijft_bestaan`);
    assertNonEmpty(b.risico_bij_niet_ingrijpen, `B[${i}].risico_bij_niet_ingrijpen`);
  });

  /* ========================================================
     C — CLOSURE INTERVENTIES
  ======================================================== */

  if (!Array.isArray(C) || C.length !== 3) {
    throw new Error("C moet exact 3 closure-interventies bevatten");
  }

  C.forEach((c, i) => {
    assertNonEmpty(c.interventie, `C[${i}].interventie`);
    assertNonEmpty(c.owner, `C[${i}].owner`);
    assertNonEmpty(c.afdwingmechanisme, `C[${i}].afdwingmechanisme`);
    assertNonEmpty(
      c.wat_wordt_onmogelijk_na_deze_keuze,
      `C[${i}].wat_wordt_onmogelijk_na_deze_keuze`
    );

    assertISODate(
      c.irreversibility_deadline,
      `C[${i}].irreversibility_deadline`
    );
  });

  /* ========================================================
     O — EXECUTIECONTRACT
  ======================================================== */

  assertNonEmpty(O.eindverantwoordelijke, "O.eindverantwoordelijke");

  if (!Array.isArray(O.eerste_90_dagen) || O.eerste_90_dagen.length < 1) {
    throw new Error("O.eerste_90_dagen moet minimaal 1 actie bevatten");
  }

  assertISODate(O.review_moment, "O.review_moment");

  if (!Array.isArray(O.stopcriteria) || O.stopcriteria.length < 1) {
    throw new Error("O.stopcriteria moet minimaal 1 stopcriterium bevatten");
  }

  /* ========================================================
     META — CONFIDENCE
  ======================================================== */

  if (
    typeof card.confidence !== "number" ||
    card.confidence < 0 ||
    card.confidence > 1
  ) {
    throw new Error("confidence moet een getal tussen 0.0 en 1.0 zijn");
  }

  /* ========================================================
     FINAL
  ======================================================== */

  return true;
}
