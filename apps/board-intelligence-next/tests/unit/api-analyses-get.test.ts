import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetAnalysisWithOptionalReport } = vi.hoisted(() => ({
  mockGetAnalysisWithOptionalReport: vi.fn(),
}));

vi.mock("@/lib/run-analysis", () => ({
  getAnalysisWithOptionalReport: mockGetAnalysisWithOptionalReport,
}));

import { GET } from "@/app/api/analyses/[id]/route";

describe("GET /api/analyses/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns analysis and report", async () => {
    mockGetAnalysisWithOptionalReport.mockResolvedValueOnce({
      analysis: {
        id: "analysis-id",
        status: "done",
      },
      report: {
        id: "report-id",
        analysis_id: "analysis-id",
      },
    });

    const req = new NextRequest("http://localhost:3000/api/analyses/analysis-id");
    const response = await GET(req, { params: { id: "analysis-id" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.analysis.id).toBe("analysis-id");
    expect(payload.report.id).toBe("report-id");
  });

  it("returns 404 for missing analysis", async () => {
    mockGetAnalysisWithOptionalReport.mockRejectedValueOnce(new Error("not found"));

    const req = new NextRequest("http://localhost:3000/api/analyses/missing");
    const response = await GET(req, { params: { id: "missing" } });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toContain("not found");
  });
});
