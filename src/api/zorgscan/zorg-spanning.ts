// ============================================================
// ✅ API — ZORG SPANNINGSKAART RUNNER (CANON)
// Endpoint: POST /api/zorg-spanning
// Fix: voorkomt “excess property” error op ConsultantContext (zonder any)
// ============================================================

import { zorgSpanningskaartConsultant } from "../../aurelius/consultants/zorgSpanningskaart";

type ZorgSpanningInput = {
  organisation: string;
  context?: string;
};

type ConsultantCtx = Parameters<typeof zorgSpanningskaartConsultant.execute>[0];

export async function POST(req: Request) {
  const body = (await req.json()) as ZorgSpanningInput;

  // ✅ Belangrijk: via variabele + type-bridge -> geen excess property error
  const ctx = {
    organisation: body.organisation,
    context: body.context ?? "",
  } as unknown as ConsultantCtx;

  const report = await zorgSpanningskaartConsultant.execute(ctx);

  return Response.json({
    id: crypto.randomUUID(),
    report,
  });
}
