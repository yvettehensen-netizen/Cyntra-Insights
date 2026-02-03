// ============================================================
// API — ZORG SCAN RUNNER
// Single endpoint: one scan → one decision map.
// ============================================================

import { runZorgDecisionMap } from "../../aurelius/zorg/runZorgDecisionMap";

export async function POST(req: Request) {
  const body = await req.json();

  const report = await runZorgDecisionMap({
    organisation: body.organisation,
    decision_block: body.decision_block,
  });

  const id = crypto.randomUUID();

  return Response.json({ id, report });
}
