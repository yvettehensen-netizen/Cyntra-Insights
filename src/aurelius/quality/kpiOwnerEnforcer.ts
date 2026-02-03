// ============================================================
// src/aurelius/quality/kpiOwnerEnforcer.ts
// KPI OWNER ENFORCER — PRODUCTION SAFE
//
// ✔ Repairs invalid owners ("owner", "team", "tbd", etc.)
// ✔ Never throws (availability-first)
// ✔ Deterministic normalization for KPI/ownership sections
// ✔ Keeps report parser-safe (no markdown added)
// ============================================================

type EnforceResult = {
  text: string;
  fixes: number;
  warnings: string[];
};

const INVALID_OWNER_TOKENS = [
  "owner",
  "owners",
  "team",
  "tbd",
  "nvt",
  "n.v.t",
  "onbekend",
  "nog te bepalen",
  "nog te definiëren",
  "to be decided",
  "to be determined",
  "undefined",
  "null",
  "none",
  "-",
  "—",
];

/**
 * Minimal “valid owner” signal:
 * - must contain at least 3 letters
 * - must NOT be one of the invalid tokens (or repetitions like "owner owner owner")
 * - should not be only generic placeholders
 */
function isValidOwner(ownerRaw: string): boolean {
  const o = ownerRaw.trim().toLowerCase();
  if (!o) return false;

  // collapse repeated words
  const collapsed = o.replace(/\s+/g, " ");
  if (collapsed === "owner owner owner" || collapsed === "team team team") return false;

  // direct token hits
  if (INVALID_OWNER_TOKENS.some((t) => collapsed === t)) return false;

  // contains invalid token as the whole meaning (e.g. "owner / team")
  const stripped = collapsed.replace(/[(){}\[\],;:/\\|]+/g, " ").replace(/\s+/g, " ").trim();
  if (INVALID_OWNER_TOKENS.some((t) => stripped === t)) return false;

  // must have letters
  if (!/[a-zà-ÿ]{3,}/i.test(ownerRaw)) return false;

  return true;
}

/**
 * Deterministic replacement that satisfies your validator:
 * - Concrete role-based owner (never “owner/team/etc.”)
 * - If unknown: “Directie — toewijzing binnen 48 uur”
 */
function fallbackOwner(): string {
  return "Directie — toewijzing binnen 48 uur";
}

/**
 * Repairs common LLM KPI patterns:
 * - "Owner: owner" → "Owner: Directie — toewijzing binnen 48 uur"
 * - "Eigenaar: team" → "Eigenaar: Directie — toewijzing binnen 48 uur"
 * - Repetitions "owner owner owner" removed
 *
 * Works even if KPI section is long prose: it scans globally.
 */
export function enforceKpiOwners(text: string): EnforceResult {
  const warnings: string[] = [];
  let fixes = 0;

  // quick exit
  if (!text || typeof text !== "string") {
    return { text: text ?? "", fixes: 0, warnings: ["Input was empty/non-string"] };
  }

  // Normalize repeated placeholder sequences anywhere
  let out = text.replace(/\b(owner|team)\b(?:\s+\b(owner|team)\b){2,}/gi, (m) => {
    fixes++;
    return fallbackOwner();
  });

  // Replace "Owner:" / "Eigenaar:" fields if invalid
  const patterns: Array<{ label: RegExp; name: string }> = [
    { label: /(^|\n)(Owner)\s*:\s*(.+?)(?=\n|$)/gi, name: "Owner" },
    { label: /(^|\n)(Eigenaar)\s*:\s*(.+?)(?=\n|$)/gi, name: "Eigenaar" },
    { label: /(^|\n)(Verantwoordelijke)\s*:\s*(.+?)(?=\n|$)/gi, name: "Verantwoordelijke" },
  ];

  for (const p of patterns) {
    out = out.replace(p.label, (_full, prefix, label, value) => {
      const raw = String(value ?? "").trim();

      // strip accidental markdown bullets if present (safety)
      const cleaned = raw.replace(/^[\*\-\u2022]+\s*/g, "").trim();

      if (!isValidOwner(cleaned)) {
        fixes++;
        return `${prefix}${label}: ${fallbackOwner()}`;
      }

      // also fix cases like "Owner: owner / team"
      const lc = cleaned.toLowerCase();
      if (INVALID_OWNER_TOKENS.some((t) => lc.includes(t)) && !isValidOwner(cleaned)) {
        fixes++;
        return `${prefix}${label}: ${fallbackOwner()}`;
      }

      return `${prefix}${label}: ${cleaned}`;
    });
  }

  // If we had to fix anything, add a warning (NON-FATAL)
  if (fixes > 0) {
    warnings.push(
      `KPI-owner placeholders gerepareerd: ${fixes}. (Availability-first: geen hard fail)`
    );
  }

  return { text: out, fixes, warnings };
}
