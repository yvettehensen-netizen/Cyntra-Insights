import type { OrganizationAccount, SubscriptionType } from "./types";
import { createId, normalize, readArray, writeArray } from "./storage";

const KEY = "cyntra_platform_organizations_v1";

function compositeKey(input: { organisatie_naam: string; sector: string }): string {
  return `${normalize(input.organisatie_naam).toLowerCase()}__${normalize(input.sector).toLowerCase()}`;
}

function compactOrganizations(rows: OrganizationAccount[]): OrganizationAccount[] {
  const byId = new Map<string, OrganizationAccount>();
  for (const row of rows) {
    const id = normalize(row.organization_id);
    if (!id) continue;
    const prev = byId.get(id);
    if (!prev) {
      byId.set(id, row);
      continue;
    }
    byId.set(id, {
      ...prev,
      ...row,
      analyses: Array.from(new Set([...(prev.analyses || []), ...(row.analyses || [])].filter(Boolean))),
      updated_at: prev.updated_at > row.updated_at ? prev.updated_at : row.updated_at,
      created_at: prev.created_at < row.created_at ? prev.created_at : row.created_at,
    });
  }

  const byComposite = new Map<string, OrganizationAccount>();
  for (const row of byId.values()) {
    const key = compositeKey(row);
    const prev = byComposite.get(key);
    if (!prev) {
      byComposite.set(key, row);
      continue;
    }
    byComposite.set(key, {
      ...prev,
      analyses: Array.from(new Set([...(prev.analyses || []), ...(row.analyses || [])].filter(Boolean))),
      updated_at: prev.updated_at > row.updated_at ? prev.updated_at : row.updated_at,
      created_at: prev.created_at < row.created_at ? prev.created_at : row.created_at,
    });
  }

  return Array.from(byComposite.values());
}

export class OrganizationAccountManager {
  readonly name = "Organization Account Manager";

  listOrganizations(): OrganizationAccount[] {
    const compacted = compactOrganizations(readArray<OrganizationAccount>(KEY));
    writeArray(KEY, compacted);
    return compacted
      .sort((a, b) => (a.organisatie_naam || "").localeCompare(b.organisatie_naam || ""));
  }

  getOrganization(organization_id: string): OrganizationAccount | null {
    return this.listOrganizations().find((row) => row.organization_id === organization_id) ?? null;
  }

  upsertOrganization(input: {
    organization_id?: string;
    organisatie_naam: string;
    sector: string;
    organisatie_grootte: string;
    abonnementstype: SubscriptionType;
  }): OrganizationAccount {
    const now = new Date().toISOString();
    const rows = this.listOrganizations();
    const explicitId = normalize(input.organization_id);
    const existingByComposite = rows.find(
      (row) => compositeKey(row) === compositeKey(input)
    );
    const organization_id = explicitId || existingByComposite?.organization_id || createId("org");
    const existing = this.getOrganization(organization_id) || existingByComposite || null;

    const record: OrganizationAccount = {
      organization_id,
      organisatie_naam: normalize(input.organisatie_naam) || "Onbekende organisatie",
      sector: normalize(input.sector) || "Onbekende sector",
      organisatie_grootte: normalize(input.organisatie_grootte) || "Onbekende grootte",
      abonnementstype: input.abonnementstype,
      analyses: existing?.analyses ?? [],
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };

    const idx = rows.findIndex((row) => row.organization_id === organization_id);
    if (idx >= 0) rows[idx] = record;
    else rows.push(record);

    writeArray(KEY, compactOrganizations(rows));
    return record;
  }

  addAnalysisToOrganization(organization_id: string, session_id: string): void {
    const rows = this.listOrganizations();
    const idx = rows.findIndex((row) => row.organization_id === organization_id);
    if (idx < 0) return;

    const current = rows[idx];
    const analyses = Array.from(new Set([...(current.analyses ?? []), normalize(session_id)].filter(Boolean)));
    rows[idx] = {
      ...current,
      analyses,
      updated_at: new Date().toISOString(),
    };
    writeArray(KEY, compactOrganizations(rows));
  }
}
