// ============================================================
// src/aurelius/pdf/AureliusReportTransitionPage.tsx
// AURELIUS — HGBCO TRANSITION PAGE (FINAL DECISION GATE)
//
// ✅ Nederlands only
// ✅ Decision-grade gravity
// ✅ HGBCO closure contract framing
// ============================================================

import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/* ================= CONSTANTS ================= */

const GOLD = "#D4AF37";
const DARK = "#0B0F19";
const MUTED = "#6B7280";

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  page: {
    paddingTop: 118,
    paddingBottom: 96,
    paddingHorizontal: 92,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },

  container: {
    flex: 1,
    justifyContent: "center",
  },

  kicker: {
    fontSize: 9,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 30,
  },

  headline: {
    fontSize: 36,
    fontWeight: "bold",
    color: DARK,
    lineHeight: 1.22,
    letterSpacing: -0.8,
    marginBottom: 34,
    maxWidth: 520,
  },

  divider: {
    width: 140,
    height: 3,
    backgroundColor: GOLD,
    marginBottom: 44,
  },

  statement: {
    fontSize: 15.8,
    lineHeight: 1.75,
    color: "#111827",
    maxWidth: 560,
  },

  emphasis: {
    fontWeight: "bold",
    color: DARK,
  },

  footer: {
    position: "absolute",
    bottom: 46,
    left: 92,
    right: 92,
    textAlign: "center",
    fontSize: 9,
    color: MUTED,
    letterSpacing: 0.8,
  },
});

/* ================= TYPES ================= */

export type AureliusReportTransitionPageProps = {
  analysisType: string;
};

/* ================= COMPONENT ================= */

export default function AureliusReportTransitionPage({
  analysisType,
}: AureliusReportTransitionPageProps) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        {/* KICKER */}
        <Text style={styles.kicker}>
          Aurelius Boardroom Gate · HGBCO Besluitcontract
        </Text>

        {/* HEADLINE */}
        <Text style={styles.headline}>
          Wat volgt is geen rapport.
          {"\n"}
          Het is een bestuursbesluit in wording.
        </Text>

        <View style={styles.divider} />

        {/* STATEMENT */}
        <Text style={styles.statement}>
          Deze analyse over{" "}
          <Text style={styles.emphasis}>
            {analysisType.toLowerCase()}
          </Text>{" "}
          is opgebouwd volgens het HGBCO-principe:
          {"\n\n"}
          <Text style={styles.emphasis}>
            H — realiteit zoals zij nu is.
          </Text>
          {"\n"}
          <Text style={styles.emphasis}>
            B — waar besluitvorming structureel verdampt.
          </Text>
          {"\n"}
          <Text style={styles.emphasis}>
            C — closure interventies die eigenaarschap afdwingen.
          </Text>
          {"\n"}
          <Text style={styles.emphasis}>
            O — outcome die alleen ontstaat na mandaat.
          </Text>
          {"\n\n"}
          Lees dit document alsof uitstel een keuze is.
          {"\n"}
          Lees dit alsof governance consequenties heeft.
        </Text>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        Aurelius Decision Engine™ · HGBCO Transition Page · Confidential
      </Text>
    </Page>
  );
}
