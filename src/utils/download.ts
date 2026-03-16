export function getBoardroomFileName(
  reportType: "analysis" | "decision",
  clientName: string
): string {
  const safeClientName = clientName.replace(/[<>:"/\\|?*]+/g, "").trim();
  const resolvedClientName = safeClientName || "Onbenoemd";

  if (reportType === "analysis") {
    return `Bestuurlijke Analyse & Interventie – ${resolvedClientName}.pdf`;
  }

  return `Besluitdocument Raad van Bestuur – ${resolvedClientName}.pdf`;
}
