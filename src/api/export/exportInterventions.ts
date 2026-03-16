export async function exportInterventions(format: "pdf" | "json" | "csv" = "json") {
  const response = await fetch(`/api/export/interventions?format=${encodeURIComponent(format)}`);
  if (!response.ok) {
    throw new Error(`Interventie-export mislukt (${response.status})`);
  }
  const blob = await response.blob();
  const ext = format.toLowerCase();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `interventions.${ext}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
