// src/aurelius/decision/translateReportToHGBCO.ts
// 🔒 HEILIGE FUNCTIE — IDENTIEKE SIGNATURE & OUTPUT
// ➕ ADDITIEF UPGRADED NAAR: Porter • PESTEL • McKinsey 7S • GROW • VIBAAAN • HGBCO

import { callAI } from "@/aurelius/engine/utils/callAI";

export async function translateReportToHGBCO(
  reportText: string
) {
  const prompt = `
Je bent een senior McKinsey Partner én eindverantwoordelijk bestuurder.
Je taak is niet adviseren maar bestuurlijk DESTILLEREN.

Je ontvangt een volledig strategisch rapport.
Dit rapport is opgebouwd vanuit meerdere analysekaders, waaronder:
- Porter 5 Forces
- PESTEL
- McKinsey 7S
- GROW
- VIBAAAN
- Onderstroomanalyse

NOEM DEZE KADERS NIET IN JE OUTPUT.
Gebruik ze uitsluitend om scherper te kiezen.

INPUT:
${reportText}

OPDRACHT:
Vertaal dit rapport naar één HGBCO-besluitkaart.

WERKWIJZE (ADD ONLY):
- Destilleer, verzin niets
- Kies één dominante waarheid als analyses conflicteren
- Benoem expliciet waarom besluitvorming vastloopt
- Maak keuzes bestuurlijk onomkeerbaar

REGELS (ONVERANDERD):
- Geen nieuwe inhoud verzinnen
- Alleen destilleren
- Bestuurlijk scherp
- Onomkeerbaar
- Geen toelichting
- Geen context
- Geen markdown

OUTPUT: ALLEEN VALIDE JSON
Start exact met {
Eindig exact met }

JSON STRUCTUUR (IDENTIEK — NIET WIJZIGEN):

{
  "hgbco": {
    "H": "Huidige harde realiteit",
    "G": "Waarom besluitvorming nu faalt",
    "B": ["Top 3 blockers"],
    "C": ["Top 3 closure acties"],
    "O": "Outcome na besluit"
  },
  "executive_summary": "1 boardroom alinea",
  "confidence": 0.0
}
`;

  const raw = await callAI("gpt-4o", [
    { role: "system", content: prompt },
  ]);

  return JSON.parse(raw);
}
