// src/api/openai.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function extractSectionsAI(markdown: string) {
  const systemPrompt = `
Je ontvangt een lang strategisch rapport in markdown.
Extraheer ALLE inhoud in exact dit JSON-schema.
Geen markdown. Geen uitleg. Alleen geldig JSON.

Schema:
{
  "executive_summary": string,
  "insights": string[],
  "risks": string[],
  "opportunities": string[],
  "roadmap_90d": {
    "month1": string[],
    "month2": string[],
    "month3": string[]
  }
}

Als iets ontbreekt: lege string of lege array.
`;

  const res = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: markdown },
    ],
  });

  return JSON.parse(res.choices[0].message.content ?? "{}");
}
