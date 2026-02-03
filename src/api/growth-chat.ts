export default async function handler(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    console.log("Growth chat received:", body);

    return new Response(
      JSON.stringify({
        ok: true,
        reply: "Growth chat endpoint works!",
      }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
}
