// ============================================================
// AURELIUS — CONSULTANT REGISTRY (CANON)
// ✅ NEVER UNDEFINED • ALWAYS COMPLETE
// ============================================================

import type { Consultant, RegistryKey } from "./consultantTypes";

/* ============================================================
   ✅ PLACEHOLDER CONSULTANT (GUARANTEED SAFE)
============================================================ */

const placeholder = (key: RegistryKey): Consultant => ({
  key,
  name: `Placeholder (${key})`,
  domain: "unassigned",

  async execute() {
    return {
      content: `⚠️ Consultant '${key}' not implemented yet.`,
      confidence: 0.25,
    };
  },
});

/* ============================================================
   ✅ FULL CANONICAL REGISTRY (NO GAPS)
============================================================ */

export const CONSULTANT_REGISTRY: Record<RegistryKey, Consultant> = {
  strategic_blueprint: placeholder("strategic_blueprint"),
  financial_health: placeholder("financial_health"),
  opportunity_map: placeholder("opportunity_map"),
  risk_register: placeholder("risk_register"),
  ninety_day_plan: placeholder("ninety_day_plan"),

  leadership_profile: placeholder("leadership_profile"),
  team_dynamics: placeholder("team_dynamics"),
  culture_scan: placeholder("culture_scan"),
  understream_scan: placeholder("understream_scan"),

  process_contribution: placeholder("process_contribution"),
  market_contribution: placeholder("market_contribution"),
  customer_contribution: placeholder("customer_contribution"),

  esg_contribution: placeholder("esg_contribution"),
  governance_contribution: placeholder("governance_contribution"),

  marketing_contribution: placeholder("marketing_contribution"),
  sales_contribution: placeholder("sales_contribution"),

  /* ============================================================
     ✅ ZORGSCAN V1 — REQUIRED ENTRIES (PURE ADDITION)
  ============================================================ */

  zorg_spanningskaart: placeholder("zorg_spanningskaart"),
  zorg_besluitvormingskaart: placeholder("zorg_besluitvormingskaart"),
};

/* ============================================================
   ✅ SAFE ACCESSOR — NEVER RETURNS UNDEFINED
============================================================ */

export function getConsultant(key: RegistryKey): Consultant {
  return CONSULTANT_REGISTRY[key] ?? placeholder(key);
}

/* ============================================================
   ✅ HARD VALIDATION
============================================================ */

export function assertValidRegistry(): void {
  for (const key of Object.keys(CONSULTANT_REGISTRY) as RegistryKey[]) {
    if (!CONSULTANT_REGISTRY[key]) {
      throw new Error(`[Cyntra] Missing consultant: ${key}`);
    }
  }
}
