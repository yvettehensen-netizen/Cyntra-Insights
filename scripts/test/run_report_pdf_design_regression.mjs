#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const reportPdfPath = path.resolve(process.cwd(), "src/services/reportPdf.ts");
const source = fs.readFileSync(reportPdfPath, "utf8");

assert(
  source.includes('replace(/Ø=Ý4|Ø=Ý|Ø=ß|&ª|�/g, "")'),
  "pdf renderer verwijdert corrupte encoding nog niet"
);
assert(
  source.includes('^(?:(\\\\d+)\\\\.\\\\s+(.+)') || source.includes('^(?:(\\d+)\\.\\s+(.+)'),
  "pdf renderer parseert genummerde rapportsecties nog niet"
);
assert(
  source.includes("function parseSummaryFields"),
  "pdf renderer mist boardroom summary parsing"
);
assert(
  source.includes('doc.text("BOARDROOM SUMMARY"'),
  "pdf renderer mist boardroom summary pagina"
);
assert(
  !source.includes('doc.roundedRect(margin, y, contentWidth, estimatedHeight'),
  "pdf renderer gebruikt nog boxed secties rond alinea-inhoud"
);
assert(
  source.includes("function formatNlDateTime"),
  "pdf renderer mist lokale datumformatter"
);
assert(
  source.includes("Geen inhoud beschikbaar\\.?\\s*(?=\\n|$)/gim") &&
    source.includes('.replace(/(?:^|\\n)\\s*Geen inhoud beschikbaar'),
  "pdf renderer filtert placeholdertekst nog niet uit body"
);
assert(
  source.includes('Geen contactgegevens gevonden in de broninput'),
  "pdf renderer gebruikt nog oude contact-placeholder"
);

console.log("report pdf design regression passed");
