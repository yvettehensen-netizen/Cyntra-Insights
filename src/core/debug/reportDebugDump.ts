export function dumpReportEnvelope(envelope: any) {
  const narrative =
    typeof envelope?.narrative === "string"
      ? envelope.narrative
      : typeof envelope?.raw_markdown === "string"
      ? envelope.raw_markdown
      : "";

  const sections =
    envelope?.sections && typeof envelope.sections === "object"
      ? (envelope.sections as Record<string, unknown>)
      : {};

  const keys = Object.keys(sections);

  console.table({
    narrativeLength: narrative.trim().length,
    sectionsCount: keys.length,
    keys: keys.join(", "),
  });
}
