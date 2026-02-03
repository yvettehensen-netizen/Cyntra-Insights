export type ReportAccessLevel = "free" | "premium" | "confidential";

export interface ReportSecurity {
  access: ReportAccessLevel;
  exportAllowed: boolean;
  watermark: boolean;
}
