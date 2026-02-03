export default async function handler(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    console.log("Sending report email…", body);

    return new Response(
      JSON.stringify({ ok: true, message: "Email sent" }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500 }
    );
  }
}
