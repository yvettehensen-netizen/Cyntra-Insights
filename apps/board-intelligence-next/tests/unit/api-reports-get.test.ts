import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

import { GET } from "@/app/api/reports/[analysisId]/route";

function mockMaybeSingle(data: any, error: any = null) {
  return vi.fn().mockResolvedValue({ data, error });
}

describe("GET /api/reports/[analysisId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns report metadata", async () => {
    const reportRow = {
      id: "report-id",
      analysis_id: "analysis-id",
      organization_id: "org-id",
      title: "Executive Rapport",
      summary: "Samenvatting",
      html_content: "<html></html>",
      pdf_path: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table !== "reports") throw new Error(`Unexpected table ${table}`);
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: mockMaybeSingle(reportRow),
          }),
        }),
      };
    });

    const req = new NextRequest("http://localhost:3000/api/reports/analysis-id");
    const response = await GET(req, { params: { analysisId: "analysis-id" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.report.analysis_id).toBe("analysis-id");
  });

  it("returns 404 when report does not exist", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table !== "reports") throw new Error(`Unexpected table ${table}`);
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: mockMaybeSingle(null),
          }),
        }),
      };
    });

    const req = new NextRequest("http://localhost:3000/api/reports/missing");
    const response = await GET(req, { params: { analysisId: "missing" } });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toContain("Report not found");
  });
});
