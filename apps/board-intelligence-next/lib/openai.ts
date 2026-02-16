import OpenAI from "openai";
import { z } from "zod";
import type { AnalysisInputPayload, AnalysisResultPayload, ScoreEntry } from "@/lib/types";

const llmSchema = z.object({
  executive_summary: z.string().min(24),
  key_findings: z.array(z.string().min(6)).min(3).max(10),
  risks: z.array(z.string().min(6)).min(2).max(10),
  opportunities: z.array(z.string().min(6)).min(2).max(10),
  actions: z.array(z.string().min(6)).min(3).max(12),
  scores: z
    .array(
      z.object({
        name: z.string().min(2),
        value: z.number().min(0).max(100),
        trend: z.enum(["up", "flat", "down"]),
      })
    )
    .min(3)
    .max(12),
});

function safeParseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    const firstBrace = input.indexOf("{");
    const lastBrace = input.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(input.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("OpenAI response was not valid JSON.");
  }
}

function deterministicFallback(payload: AnalysisInputPayload, model: string): AnalysisResultPayload {
  const text = payload.description.toLowerCase();

  const risks = [
    text.includes("cash") || text.includes("financ")
      ? "Liquiditeitsdruk kan strategische opties beperken binnen 90 dagen."
      : "Besluitvorming wordt vertraagd door onduidelijk eigenaarschap.",
    "Operationele uitvoering kent onvoldoende escalatiepad bij afwijkingen.",
    "Zonder strakke governance stijgt de kans op scope-creep in lopende initiatieven.",
  ];

  const opportunities = [
    "Snelle standaardisatie van besluitritme verhoogt executiesnelheid.",
    "Heldere KPI-owners maken voortgang stuurbaar op bestuursniveau.",
    "Datagedreven prioritering kan resource-allocatie optimaliseren.",
  ];

  const scores: ScoreEntry[] = [
    { name: "Strategische helderheid", value: 67, trend: "up" },
    { name: "Executiekracht", value: 59, trend: "flat" },
    { name: "Governance discipline", value: 53, trend: "down" },
    { name: "Risicobeheersing", value: 61, trend: "flat" },
  ];

  return {
    model,
    executive_summary:
      "De organisatie heeft duidelijke groeipotentie, maar bestuurlijke effectiviteit wordt afgeremd door diffuus eigenaarschap en beperkte operationele follow-through.",
    key_findings: [
      "Prioriteiten zijn inhoudelijk sterk maar missen een expliciete besluitcadans.",
      "Risico-signalen worden herkend, maar niet consequent vertaald naar acties met eigenaar.",
      "Er is voldoende draagvlak voor versnelling zodra governance en accountability worden aangescherpt.",
    ],
    risks,
    opportunities,
    actions: [
      "Benoem binnen 5 werkdagen een eindverantwoordelijke per top-prioriteit.",
      "Introduceer een tweewekelijkse executive review met harde beslismomenten.",
      "Implementeer een risicolog met owner, deadline en mitigerende maatregel.",
      "Koppel investeringsbesluiten aan KPI-verbetering per initiatief.",
    ],
    scores,
    generated_at: new Date().toISOString(),
    raw_response: {
      source: "deterministic_fallback",
      reason: "OPENAI_API_KEY missing or model call unavailable",
    },
  };
}

export async function runOpenAiAnalysis(
  payload: AnalysisInputPayload
): Promise<AnalysisResultPayload> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return deterministicFallback(payload, model);
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a board-level strategy analyst. Return only valid JSON with keys: executive_summary, key_findings, risks, opportunities, actions, scores. Scores must be array with {name,value,trend} and trend in up|flat|down.",
        },
        {
          role: "user",
          content: JSON.stringify({
            organization: payload.organization_name,
            description: payload.description,
            context: payload.context,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    const parsed = safeParseJson(content);
    const validated = llmSchema.parse(parsed);

    return {
      model,
      executive_summary: validated.executive_summary,
      key_findings: validated.key_findings,
      risks: validated.risks,
      opportunities: validated.opportunities,
      actions: validated.actions,
      scores: validated.scores,
      generated_at: new Date().toISOString(),
      raw_response: parsed,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown OpenAI integration error.";
    const fallback = deterministicFallback(payload, model);
    return {
      ...fallback,
      raw_response: {
        source: "deterministic_fallback",
        reason: `openai_error:${message}`,
      },
    };
  }
}
