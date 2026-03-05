// ============================================================
// src/aurelius/pdf/AureliusReportPDF.tsx
// AURELIUS — HGBCO BOARDROOM PDF EXPORT (FINAL • TS SAFE)
//
// ✅ Page 1 = HGBCO Decision Card (mandatory if present)
// ✅ Page 2 = Executive Verdict + Closure Interventions
// ✅ Page 3 = Legacy Signals (Insights/Risks/Opportunities)
// ✅ Fully TS-safe: no possibly-undefined crashes
// ============================================================

import { Page, Text, View, Document } from "@react-pdf/renderer";
import { aureliusPdfStyles as s } from "./pdfStyles";
import {
  WhiteLabelConfig,
  defaultWhiteLabel,
} from "./whiteLabelConfig";
import { applyBoardEditorialPolicy } from "@/aurelius/utils/boardOutputSanitizer";

/* ================= TYPES ================= */

export type HGBCOCard = {
  H: string;
  G: string;
  B: string[];
  C: string[];
  O: string;
};

export type Intervention = {
  priority: number;
  title: string;
  rationale?: string;
  why?: string;
  owner: string;
  deliverable: string;
  deadline_days?: number;
};

export type ReportResult = {
  hgbco?: HGBCOCard;

  executive_summary?: string;

  interventions?: Intervention[];

  insights?: string[];
  risks?: string[];
  opportunities?: string[];

  cyntra_insights_score?: number;

  besluitkaart?: Array<{
    fase: string;
    owner?: string;
    irreversibility_deadline?: string;
  }>;
  contactPerson?: string;
  contactpersoon?: string;
  contact_person?: string;
  primaryContact?: string;
  primary_contact?: string;
  requestedBy?: string;
  requested_by?: string;
  aanvrager?: string;
  owner?: string;
};

export type AureliusReportPDFProps = {
  title: string;
  company: string;
  date: string;
  result: ReportResult;
  contactPerson?: string;
  whiteLabel?: WhiteLabelConfig;
};

/* ================= COMPONENT ================= */

export function AureliusReportPDF({
  title,
  company,
  date,
  result,
  contactPerson,
  whiteLabel = defaultWhiteLabel,
}: AureliusReportPDFProps) {
  const accent = whiteLabel.primaryAccentColor;

  /* ============================================================
     ✅ SAFE NORMALIZATION (NO UNDEFINED MAP ERRORS)
  ============================================================ */

  const insights = Array.isArray(result.insights) ? result.insights : [];
  const risks = Array.isArray(result.risks) ? result.risks : [];
  const opportunities = Array.isArray(result.opportunities)
    ? result.opportunities
    : [];

  const interventions = Array.isArray(result.interventions)
    ? result.interventions
    : [];
  const resolvedContactPerson =
    [
      contactPerson,
      result.contactPerson,
      result.contactpersoon,
      result.contact_person,
      result.primaryContact,
      result.primary_contact,
      result.requestedBy,
      result.requested_by,
      result.aanvrager,
      result.owner,
    ].find((value) => typeof value === "string" && value.trim()) ?? "Nog niet opgegeven";
  const sanitize = (value: string, title: string) =>
    applyBoardEditorialPolicy(String(value ?? ""), title);

  /* ============================================================
     ✅ HGBCO PAGE 1 — DECISION CARD
  ============================================================ */

  const hasHGBCO =
    result.hgbco &&
    result.hgbco.H &&
    result.hgbco.G &&
    result.hgbco.O;

  return (
    <Document>
      {/* ======================================================
          ✅ PAGE 1 — HGBCO DECISION CARD
      ====================================================== */}
      {hasHGBCO && (
        <Page size="A4" style={s.page}>
          <View style={s.header} fixed>
            <Text style={[s.brandLabel, { color: accent }]}>
              {whiteLabel.brandName}
            </Text>
            <Text style={s.confidentialLabel}>
              Boardroom Decision Card — HGBCO
            </Text>
          </View>

          <View style={s.titleSection}>
            <Text style={s.title}>{company}</Text>
            <View style={s.metaRow}>
              <Text style={s.metaText}>{title}</Text>
              <Text style={s.metaText}>{date}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaText}>
                Organisatie: {sanitize(company || "Onbenoemd", "Organisatie")}
              </Text>
              <Text style={s.metaText}>
                Contactpersoon: {sanitize(String(resolvedContactPerson), "Contactpersoon")}
              </Text>
            </View>
            <View style={[s.divider, { backgroundColor: accent }]} />
          </View>

          <View style={s.sectionLarge}>
            <Text style={s.sectionLabel}>HGBCO Besluitkaart</Text>

            {/* H */}
            <View style={s.hgbcoBlock}>
              <Text style={s.hgbcoText}>
                H — {sanitize(result.hgbco?.H ?? "", "H")}
              </Text>
            </View>

            {/* G */}
            <View style={s.hgbcoBlock}>
              <Text style={s.hgbcoText}>
                G — {sanitize(result.hgbco?.G ?? "", "G")}
              </Text>
            </View>

            {/* B */}
            <View style={s.blockerBlock}>
              <Text style={s.blockerText}>B — Belemmeringen</Text>
              {(result.hgbco?.B ?? []).slice(0, 5).map((b, i) => (
                <Text key={i} style={s.insightText}>
                  • {sanitize(b, "Belemmeringen")}
                </Text>
              ))}
            </View>

            {/* C */}
            <View style={s.closureBlock}>
              <Text style={s.closureText}>C — Closure Plan</Text>
              {(result.hgbco?.C ?? []).slice(0, 5).map((c, i) => (
                <Text key={i} style={s.insightText}>
                  • {sanitize(c, "Closure Plan")}
                </Text>
              ))}
            </View>

            {/* O */}
            <View style={s.outcomeBlock}>
              <Text style={s.outcomeText}>
                O — {sanitize(result.hgbco?.O ?? "", "Outcome")}
              </Text>
            </View>
          </View>

          <View style={s.footer} fixed>
            <Text style={s.footerText}>
              {whiteLabel.footerText}
            </Text>
          </View>
        </Page>
      )}

      {/* ======================================================
          ✅ PAGE 2 — EXECUTIVE VERDICT + INTERVENTIONS
      ====================================================== */}
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          <Text style={[s.brandLabel, { color: accent }]}>
            {whiteLabel.brandName}
          </Text>
          <Text style={s.confidentialLabel}>
            Executive Closure Report
          </Text>
        </View>

        <View style={s.titleSection}>
          <Text style={s.title}>{title}</Text>
          <View style={s.metaRow}>
            <Text style={s.metaText}>{company}</Text>
            <Text style={s.metaText}>{date}</Text>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaText}>
              Organisatie: {sanitize(company || "Onbenoemd", "Organisatie")}
            </Text>
            <Text style={s.metaText}>
              Contactpersoon: {sanitize(String(resolvedContactPerson), "Contactpersoon")}
            </Text>
          </View>
          <View style={[s.divider, { backgroundColor: accent }]} />
        </View>

        {/* EXEC SUMMARY */}
        {result.executive_summary && (
          <View style={s.sectionLarge}>
            <Text style={s.sectionLabel}>Executive Verdict</Text>

            <View style={s.verdictBlock}>
              <Text style={s.verdictText}>
                {sanitize(result.executive_summary, "Executive Verdict")}
              </Text>
            </View>
          </View>
        )}

        {/* INTERVENTIONS */}
        {interventions.length > 0 && (
          <View style={s.sectionLarge}>
            <Text style={s.sectionLabel}>
              Closure Interventies (C-layer)
            </Text>

            {interventions.slice(0, 6).map((x, i) => (
              <View key={i} style={s.interventionBlock}>
                <Text style={s.interventionTitle}>
                  #{x.priority} — {sanitize(x.title, "Interventie")}
                </Text>

                <Text style={s.interventionMeta}>
                  Owner: {sanitize(x.owner, "Owner")} • Deliverable: {sanitize(x.deliverable, "Deliverable")}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {whiteLabel.footerText}
          </Text>
        </View>
      </Page>

      {/* ======================================================
          ✅ PAGE 3 — LEGACY SIGNALS
      ====================================================== */}
      {(insights.length > 0 ||
        risks.length > 0 ||
        opportunities.length > 0) && (
        <Page size="A4" style={s.page}>
          {/* INSIGHTS */}
          {insights.length > 0 && (
            <View style={s.sectionLarge}>
              <Text style={s.sectionTitle}>Kerninzichten</Text>

              {insights.slice(0, 6).map((x, i) => (
                <View key={i} style={s.insightRow}>
                  <Text style={s.insightNumber}>
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <Text style={s.insightText}>{sanitize(x, "Kerninzichten")}</Text>
                </View>
              ))}
            </View>
          )}

          {/* RISKS */}
          {risks.length > 0 && (
            <View style={s.sectionLarge}>
              <Text style={s.sectionTitle}>Risico bij uitstel</Text>

              {risks.slice(0, 6).map((x, i) => (
                <View key={i} style={s.riskBlock}>
                  <Text style={s.riskText}>{sanitize(x, "Risico bij uitstel")}</Text>
                </View>
              ))}
            </View>
          )}

          {/* OPPORTUNITIES */}
          {opportunities.length > 0 && (
            <View style={s.sectionLarge}>
              <Text style={s.sectionTitle}>Strategische kansen</Text>

              {opportunities.slice(0, 6).map((x, i) => (
                <Text key={i} style={s.opportunityText}>
                  • {sanitize(x, "Strategische kansen")}
                </Text>
              ))}
            </View>
          )}

          <View style={s.footer} fixed>
            <Text style={s.footerText}>
              {whiteLabel.footerText}
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
