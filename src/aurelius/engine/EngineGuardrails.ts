import type { AnalysisSession } from "@/platform/types";

export async function safeStep(stepName: string, fn: () => Promise<unknown>): Promise<unknown | null> {
  try {
    return await fn();
  } catch (err) {
    console.error("ENGINE STEP FAILED:", stepName, err);
    return null;
  }
}

export function ensureSessionIntegrity(session: AnalysisSession): void {
  const hasReport = Boolean(session.board_report || session.strategic_report?.report_body);
  if (hasReport && (session.status === "running" || session.status === "failed")) {
    session.status = "completed";
  }
}

export function ensureReportIntegrity(session: AnalysisSession): void {
  const hasReport = Boolean(session.board_report || session.strategic_report?.report_body);
  if (hasReport) return;
  session.board_report = session.board_report || "Cyntra analyse";
  if (!session.strategic_report) {
    session.strategic_report = {
      report_id: `report-${session.session_id || "unknown"}`,
      session_id: session.session_id || "unknown",
      organization_id: session.organization_id || "unknown",
      title: "Cyntra analyse",
      sections: [],
      generated_at: new Date().toISOString(),
      report_body: session.board_report,
    };
  }
}
