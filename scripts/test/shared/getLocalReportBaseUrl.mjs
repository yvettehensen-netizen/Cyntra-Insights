export function getLocalReportBaseUrl() {
  return process.env.REPORT_E2E_BASE_URL || process.env.CYNTRA_REPORT_BASE_URL || "http://127.0.0.1:4174";
}
