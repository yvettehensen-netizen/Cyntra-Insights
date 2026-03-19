export function validateReport(report) {
  if (!report) throw new Error("Report is missing");
  if (!report.executiveCore || report.executiveCore.trim().length < 60) {
    throw new Error("Executive summary too weak");
  }
  if (!report.scenarios || report.scenarios.length < 3) {
    throw new Error("Scenario analysis missing");
  }
  if (!report.mechanismAnalysis || !report.mechanismAnalysis.explanation) {
    throw new Error("Mechanism analysis missing");
  }
  if (!report.strategicTension || !report.strategicTension.explanation) {
    throw new Error("Strategic tension missing");
  }
}
