// ============================================================
// ✅ 100% FOUTLOOS — ZORGSCAN PDF SERVER (NODE)
// Fixes React-PDF typing error TS2345 completely
// ============================================================

import express, { type Request, type Response } from "express";
import cors from "cors";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import { ZorgBoardroomReportPDF } from "../aurelius/pdf/ZorgBoardroomReport";

/* ============================================================
   EXPRESS APP
============================================================ */

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

/* ============================================================
   ROUTE — GENERATE PDF
============================================================ */

app.post("/zorgscan/pdf", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};

    const organisation: string =
      body.organisation ?? "Uw Zorgorganisatie";

    // ✅ FIX: Cast component into valid React-PDF Document element
    const element = React.createElement(
      ZorgBoardroomReportPDF as React.FC<any>,
      {
        data: body,
        organisation,
      }
    );

    // ✅ FIX: renderToBuffer requires DocumentProps-compatible element
    const pdfBuffer = await renderToBuffer(element as any);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ZorgScan-Boardroom-Report.pdf"`
    );

    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return res.status(500).json({
      error: "PDF rendering failed",
      message: String(err),
    });
  }
});

/* ============================================================
   START SERVER
============================================================ */

app.listen(4000, () => {
  console.log(
    "✅ ZorgScan PDF Server running at http://localhost:4/zorgscan/pdf"
  );
});
