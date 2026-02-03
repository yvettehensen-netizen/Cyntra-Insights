// ============================================================
// src/aurelius/synthesis/synthesizeCyntraProposal.ts
// CYNTRA EXECUTIVE DECISION PROPOSAL — NL • BOARDROOM • MAXIMAAL
//
// DOEL (ONVERANDERD):
// - Formuleert een helder eindvoorstel namens Cyntra
// - Biedt keuzes, geen beslissingen
// - Nederlands
// - Gebruikt bestaande callAI v4.4 (ONAANGETAST)
//
// ➕ ADD ONLY:
// - Besluitkaders: Porter • PESTEL • McKinsey 7S • GROW • VIBAAAN • HGBCO
// - Bestuurlijke scherpte & expliciete niet-keuzes
// - Volledig backward compatible
// ============================================================

import { callAI } from "@/aurelius/engine/utils/callAI";
import type { AureliusAnalysisResult } from "@/aurelius/engine/types/AureliusAnalysisResult";

/* =====================
   OUTPUT TYPE (ONVERANDERD)
===================== */

export interface CyntraDecisionProposal {
  rol_en_mandaat: string;
  strategische_positie: string;
  voorstel_aan_bestuur: string;
  mogelijke_interventietrajecten: string[];
  randvoorwaarden_en_grenzen: string;
  expliciete_niet_keuzes: string;
}

/* =====================
   SYNTHESIS
===================== */

export async function synthesizeCyntraDecisionProposal(
  analysis: AureliusAnalysisResult
): Promise<CyntraDecisionProposal> {
  const systemPrompt = `
Je bent een Nederlandse senior partner van Cyntra.
Je opereert op bestuursniveau.

Je schrijft GEEN rapport.
Je schrijft GEEN analyse.
Je schrijft GEEN samenvatting.

Je formuleert een bestuurlijk VOORSTEL namens Cyntra.

Je denkt expliciet vanuit de volgende kaders om tot scherpte te komen,
maar JE NOEMT DEZE KADERS NIET IN DE OUTPUT:
- Porter 5 Forces (externe druk & marktpositie)
- PESTEL (juridische, politieke en maatschappelijke randvoorwaarden)
- McKinsey 7S (structurele en organisatorische haalbaarheid)
- GROW (Reality → Options)
- VIBAAAN (waarom besluitvorming vastloopt)
- HGBCO (bestuurlijke ruggengraat)

Belangrijk:
- Cyntra neemt GEEN besluiten voor de klant
- Cyntra dwingt WEL helderheid af over keuzes en mandaat
- Toon senioriteit, rust en besluitkracht
- Geen marketingtaal
- Geen bullets, geen markdown, geen streepjes
- Schrijf in duidelijke alinea’s met heldere kopjes in platte tekst
`;

  const userPrompt = `
INPUT — ANALYSE (vertrouwelijk):
${JSON.stringify(analysis, null, 2)}

OPDRACHT:

Formuleer een helder eindvoorstel namens Cyntra aan bestuur/directie.

Het voorstel moet expliciet maken:
1. Welke rol Cyntra inneemt (en welke niet)
2. Welke strategische positie Cyntra kiest t.o.v. deze organisatie
3. Welke interventievormen Cyntra aanbiedt als KEUZE-OPTIES
4. Welke interventies alleen mogelijk zijn bij expliciet mandaat
5. Welke activiteiten Cyntra bewust NIET zal uitvoeren
6. Waarom dit voorstel logisch en onafwendbaar volgt uit de analyse

REGELS:
- Bied keuzes, geen beslissingen
- Geen advies-taal
- Geen nuanceringen of mitsen en maren
- Geen contextuitleg over analyse
- Geen markdown
- Geen extra tekst buiten JSON

SCHRIJF IN HET NEDERLANDS.

OUTPUT EXACT ALS JSON MET DEZE STRUCTUUR (NIET AFWIJKEN):

{
  "rol_en_mandaat": string,
  "strategische_positie": string,
  "voorstel_aan_bestuur": string,
  "mogelijke_interventietrajecten": string[],
  "randvoorwaarden_en_grenzen": string,
  "expliciete_niet_keuzes": string
}
`;

  const raw = await callAI(
    "aurelius-longform",
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    {
      temperature: 0.2,
    }
  );

  return JSON.parse(raw) as CyntraDecisionProposal;
}
