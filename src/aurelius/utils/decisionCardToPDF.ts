// ============================================================
// src/aurelius/utils/decisionCardToPDF.ts
// AURELIUS BESLUITKAART — PDF EXPORT (BOARDROOM)
// HGBCO v3 SAFE • ADDITIVE • TYPE-SAFE
// ============================================================

import jsPDF from "jspdf";
import type { AureliusDecisionCard } from "@/aurelius/decision/types/AureliusDecisionCard";

/* ============================================================
   HELPERS — SAFE SERIALIZATION
============================================================ */

function stringify(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value.map(v => stringify(v)).join("\n\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${stringify(v)}`)
      .join("\n\n");
  }

  return String(value);
}

/* ============================================================
   PDF EXPORT
============================================================ */

export function exportDecisionCardPDF(
  company: string,
  card: AureliusDecisionCard
) {
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 297, "F");

  doc.setTextColor(212, 175, 55);
  doc.setFontSize(24);
  doc.text("AURELIUS BESLUITKAART", 20, 30);

  doc.setFontSize(14);
  doc.text(company, 20, 44);

  let y = 65;

  const writeBlock = (title: string, text: unknown) => {
    doc.setFontSize(11);
    doc.setTextColor(212, 175, 55);
    doc.text(title, 20, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);

    const lines = doc.splitTextToSize(stringify(text), 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 8;
  };

  /* ============================================================
     H — REALITEIT
  ============================================================ */

  writeBlock(
    "H — Huidige realiteit",
    card.besluitkaart.H
  );

  /* ============================================================
     G — RICHTING
  ============================================================ */

  writeBlock(
    "G — Gekozen richting",
    card.besluitkaart.G
  );

  /* ============================================================
     B — BLOKKADES
  ============================================================ */

  card.besluitkaart.B.forEach((b, i) => {
    writeBlock(
      `B${i + 1} — ${b.arena}`,
      {
        blokkade: b.blokkade,
        waarom: b.waarom_blijft_bestaan,
        risico: b.risico_bij_niet_ingrijpen,
        bron: b.spanning_oorsprong,
      }
    );
  });

  /* ============================================================
     C — INTERVENTIES
  ============================================================ */

  card.besluitkaart.C.forEach((c, i) => {
    writeBlock(
      `C${i + 1} — Interventie`,
      {
        interventie: c.interventie,
        laag: c.laag,
        owner: c.owner,
        deadline: c.irreversibility_deadline,
        afdwinging: c.afdwingmechanisme,
        gevolg: c.wat_wordt_onmogelijk_na_deze_keuze,
      }
    );
  });

  /* ============================================================
     O — EXECUTIECONTRACT
  ============================================================ */

  writeBlock(
    "O — Ownership & executie",
    card.besluitkaart.O
  );

  doc.save(`${company.replace(/[^\w]+/g, "_")}_Aurelius_Besluitkaart.pdf`);
}
