// ============================================================
// src/aurelius/synthesis/synthesizeBoardroomBrief.ts
// AI BESLISSER — NEDERLANDS • BOARDROOM • MAXIMAAL
// PORTER • PESTEL • McKINSEY 7S • GROW • VIBAAAN • HGBCO
// ============================================================

import { callAI } from "@/aurelius/engine/utils/callAI";
import type { AureliusAnalysisResult } from "@/aurelius/engine/types/AureliusAnalysisResult";
import type { BoardroomBrief } from "./types";

/* ============================================================
   BOARDROOM SYNTHESIS — CANON
============================================================ */

export async function synthesizeBoardroomBrief(
  analysis: AureliusAnalysisResult
): Promise<BoardroomBrief> {
  const systemPrompt = `
Jij bent eindverantwoordelijk bestuurlijk beslisser.
Je opereert op Raad-van-Bestuur niveau.

Je schrijft GEEN rapport.
Je doet GEEN aanbevelingen.
Je FORCEERT keuzes.

Je denkt impliciet vanuit:
- Porter 5 Forces
- PESTEL
- McKinsey 7S
- GROW (Reality → Will)
- VIBAAAN
- Onderstroom & macht

Je noemt deze kaders NIET.
Je gebruikt ze om scherper te kiezen.

Taal: Nederlands
Toon: senior partner / bestuurskamer
Geen marketing
Geen nuance
Geen empathische verzachting
`;

  const userPrompt = `
INPUT — VOLLEDIGE AURELIUS ANALYSE (ALLE CONSULTANTS):
${JSON.stringify(analysis, null, 2)}

OPDRACHT:
- Formuleer één dominante bestuurlijke these
- Benoem één niet-oplosbaar spanningsveld
- Schrijf een strategisch narratief dat tot één besluit dwingt
- Maak trade-offs expliciet (geen balans)
- Benoem onomkeerbare beslissingen
- Positioneer Cyntra als afdwingende interventiepartner

REGELS:
- Kies één waarheid als analyses conflicteren
- Geen uitleg
- Geen context
- Geen markdown
- Alleen JSON

OUTPUT — STRICT JSON (VOLG EXACT):

{
  "executive_thesis": string,
  "central_tension": string,
  "strategic_narrative": string,

  "key_tradeoffs": [
    {
      "type": "focus_vs_spread" | "speed_vs_consensus" | "control_vs_autonomy" | "short_term_vs_long_term" | "stability_vs_change",
      "chosen_side": string,
      "abandoned_side": string,
      "consequence": string
    }
  ],

  "irreversible_decisions": [
    {
      "decision": string,
      "why_irreversible": string,
      "point_of_no_return": string
    }
  ],

  "cyntra_proposal": {
    "positioning": string,
    "interventions": [
      {
        "action": string,
        "owner": string,
        "deadline": string,
        "enforcement": string
      }
    ],
    "mandate_required": {
      "level": "informal" | "formal" | "board_level" | "ownership_level",
      "required_from": string,
      "consequence_if_withheld": string
    }
  },

  "governance_risks": string[],
  "execution_risks": string[],
  "confidence_level": number
}
`;

  const raw = await callAI("gpt-4o", [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  return JSON.parse(raw) as BoardroomBrief;
}
