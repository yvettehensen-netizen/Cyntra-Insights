import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const completion = await client.responses.create({
    model: "gpt-4.1",
    input: prompt,
    max_output_tokens: 32000, // HARD
  });

  return new Response(completion.output_text, {
    headers: { "Content-Type": "text/plain" },
  });
}
