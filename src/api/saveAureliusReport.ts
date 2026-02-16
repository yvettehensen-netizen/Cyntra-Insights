// Legacy helper kept for compatibility.
// Report persistence now happens server-side via POST /api/analyses.

export async function saveAureliusReport(
  _type: string,
  _company: string,
  _result: unknown
) {
  return {
    success: false,
    error:
      "saveAureliusReport is gedeactiveerd. Gebruik runAureliusEngine() met backend route /api/analyses.",
  };
}

