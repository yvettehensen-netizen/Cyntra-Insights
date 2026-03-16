import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const defaultRoles = ["executive", "risk", "compliance"];

export async function GET(request: NextRequest): Promise<NextResponse> {
  const roleHeader = request.headers.get("x-cyntra-roles");
  const actorHeader = request.headers.get("x-cyntra-actor");

  const roles = roleHeader
    ? roleHeader
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : defaultRoles;

  return NextResponse.json(
    {
      user: {
        id: actorHeader ?? "cyntra.platform.operator",
        name: actorHeader ?? "Cyntra Platform Operator",
        roles,
        permissions: roles,
      },
    },
    { status: 200 }
  );
}
