import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRunAnalysisJob, mockFrom } = vi.hoisted(() => ({
  mockRunAnalysisJob: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

vi.mock("@/lib/run-analysis", () => ({
  runAnalysisJob: mockRunAnalysisJob,
}));

import { POST } from "@/app/api/analyses/route";

function mockSingle(data: any, error: any = null) {
  return vi.fn().mockResolvedValue({ data, error });
}

describe("POST /api/analyses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a pending analysis", async () => {
    const organizationSingle = mockSingle({ id: "1e2d3c4b-1111-2222-3333-aaaaaaaaaaaa" });
    const analysisSingle = mockSingle({
      id: "2e2d3c4b-1111-2222-3333-bbbbbbbbbbbb",
      organization_id: "1e2d3c4b-1111-2222-3333-aaaaaaaaaaaa",
      status: "pending",
      input_payload: {
        organization_name: "Demo BV",
        description: "Bestuurlijke Intelligentielaag Analyse",
        context: {},
        requested_at: new Date().toISOString(),
      },
      result_payload: null,
      error_message: null,
      started_at: null,
      finished_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "organizations") {
        return {
          upsert: () => ({
            select: () => ({ single: organizationSingle }),
          }),
        };
      }

      if (table === "analyses") {
        return {
          insert: () => ({
            select: () => ({ single: analysisSingle }),
          }),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    const req = new NextRequest("http://localhost:3000/api/analyses", {
      method: "POST",
      body: JSON.stringify({
        organization: "Demo BV",
        description: "Bestuurlijke Intelligentielaag Analyse",
        runImmediately: false,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.analysis.status).toBe("pending");
    expect(mockRunAnalysisJob).not.toHaveBeenCalled();
  });

  it("can run inline processing when runImmediately=true", async () => {
    const insertedAnalysis = {
      id: "2e2d3c4b-1111-2222-3333-bbbbbbbbbbbb",
      organization_id: "1e2d3c4b-1111-2222-3333-aaaaaaaaaaaa",
      status: "pending",
      input_payload: {
        organization_name: "Demo BV",
        description: "Bestuurlijke Intelligentielaag Analyse",
        context: {},
        requested_at: new Date().toISOString(),
      },
      result_payload: null,
      error_message: null,
      started_at: null,
      finished_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const organizationSingle = mockSingle({ id: "1e2d3c4b-1111-2222-3333-aaaaaaaaaaaa" });
    const analysisSingle = mockSingle(insertedAnalysis);

    mockFrom.mockImplementation((table: string) => {
      if (table === "organizations") {
        return {
          upsert: () => ({
            select: () => ({ single: organizationSingle }),
          }),
        };
      }

      if (table === "analyses") {
        return {
          insert: () => ({
            select: () => ({ single: analysisSingle }),
          }),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    mockRunAnalysisJob.mockResolvedValueOnce({
      ...insertedAnalysis,
      status: "done",
      result_payload: {
        executive_summary: "Ready",
      },
    });

    const req = new NextRequest("http://localhost:3000/api/analyses", {
      method: "POST",
      body: JSON.stringify({
        organization: "Demo BV",
        description: "Bestuurlijke Intelligentielaag Analyse",
        runImmediately: true,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.analysis.status).toBe("done");
    expect(mockRunAnalysisJob).toHaveBeenCalledTimes(1);
  });
});
