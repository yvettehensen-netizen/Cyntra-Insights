export default async function handler(): Promise<Response> {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "🟢 API werkt correct!",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}