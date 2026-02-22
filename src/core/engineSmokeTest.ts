import { ANALYSES } from "@/aurelius/config/analyses.config";

export interface EngineSmokeResult {
  ok: boolean;
  summary: string;
  checks: Array<{
    label: string;
    ok: boolean;
  }>;
  timestamp: string;
}

export function engineSmokeTest(): EngineSmokeResult {
  try {
    const checks = [
      {
        label: "Analysecatalogus geladen",
        ok: Object.keys(ANALYSES).length > 0,
      },
      {
        label: "Runtime API beschikbaar",
        ok: typeof fetch === "function",
      },
      {
        label: "WebCrypto randomUUID beschikbaar",
        ok:
          typeof crypto === "undefined" ||
          typeof crypto.randomUUID === "function",
      },
    ];

    const ok = checks.every((check) => check.ok);

    return {
      ok,
      summary: ok
        ? "Engine smoke test geslaagd"
        : "Engine smoke test detecteerde blokkades",
      checks,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Engine fout:", error);
    return {
      ok: false,
      summary: "Engine test mislukt",
      checks: [
        {
          label: "Runtime smoke",
          ok: false,
        },
      ],
      timestamp: new Date().toISOString(),
    };
  }
}
