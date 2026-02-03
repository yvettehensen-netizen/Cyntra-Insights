// ============================================================
// PDF RENDER ENGINE — ZORG BOARDROOM REPORT (HGBCO FINAL CANON)
//
// ✅ HGBCO Decision Card Required
// ✅ Organisation auto-derived
// ✅ Output boundary hardened (no schema leaks)
// ============================================================

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ZorgBoardroomReportPDF } from "./ZorgBoardroomReport";

/* ============================================================
   HGBCO SAFETY GUARD
============================================================ */

function assertHGBCO(data: any) {
  const hgbco = data?.hgbco;

  if (!hgbco) {
    throw new Error("❌ HGBCO ontbreekt — PDF render blocked");
  }

  if (!hgbco.H || !hgbco.G || !hgbco.O) {
    throw new Error("❌ HGBCO incompleet — Decision card invalid");
  }
}

/* ============================================================
   CANON RENDER FUNCTION
============================================================ */

export async function renderZorgBoardroomPDF(data: any) {
  /* ======================================================
     ✅ METHOD ENFORCEMENT
  ====================================================== */
  assertHGBCO(data);

  /* ======================================================
     ✅ ORGANISATION DERIVATION
  ====================================================== */
  const organisation =
    data?.organisation ??
    data?.companyName ??
    data?.intake?.companyName ??
    "ZorgScan Client";

  /* ======================================================
     ✅ RENDER CANON OUTPUT
  ====================================================== */
  return renderToBuffer(
    <ZorgBoardroomReportPDF
      data={data}
      organisation={organisation}
    />
  );
}
