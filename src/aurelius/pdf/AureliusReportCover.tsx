import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

/* ============================================================================
   AURELIUS — EXECUTIVE COVER (CYNTRA SIGNATURE CANON)
   ✔ Authority Artifact
   ✔ Scarcity & Ritual
   ✔ Decision-Grade Boardroom Document
   ✔ PURE COSMETIC UPGRADE — NO FUNCTIONAL CHANGES
============================================================================ */

const GOLD = "#C9A53A";
const BLACK = "#07070A";
const PANEL = "#111116";
const MUTED = "#A6ADB8";
const SOFT = "#626A76";
const GRID = "#1C1C23";

/* === BASE64 LOGO (NIET AANRAKEN) === */
const CYNTRA_LOGO_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtAAAACQCAYAAAAhkFzZAAAQAE...";

const styles = StyleSheet.create({
  page: {
    backgroundColor: BLACK,
    paddingTop: 94,
    paddingBottom: 54,
    paddingHorizontal: 70,
    fontFamily: "Helvetica",
  },

  /* === MAIN MONOLITH PANEL === */
  panel: {
    flex: 1,
    backgroundColor: PANEL,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    paddingLeft: 56,
    paddingRight: 54,
    justifyContent: "center",
    position: "relative",
  },

  /* === CYNTRA TEXTURE GRID (SUBTLE) === */
  gridOverlay: {
    position: "absolute",
    inset: 0,
    borderWidth: 1,
    borderColor: GRID,
    opacity: 0.18,
  },

  logo: {
    width: 182,
    height: 52,
    marginBottom: 56,
    opacity: 0.96,
  },

  confidentiality: {
    fontSize: 7.4,
    letterSpacing: 4.4,
    textTransform: "uppercase",
    color: SOFT,
    marginBottom: 26,
  },

  overline: {
    fontSize: 8.6,
    letterSpacing: 3.7,
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 56,
  },

  title: {
    fontSize: 47,
    fontWeight: "bold",
    color: "#FAFAFA",
    lineHeight: 1.03,
    letterSpacing: -1.55,
    maxWidth: 470,
    marginBottom: 30,
  },

  divider: {
    width: 112,
    height: 2.6,
    backgroundColor: GOLD,
    marginBottom: 30,
    opacity: 0.92,
  },

  companyLabel: {
    fontSize: 8.6,
    letterSpacing: 3.4,
    textTransform: "uppercase",
    color: SOFT,
    marginBottom: 10,
  },

  company: {
    fontSize: 23.5,
    color: MUTED,
    letterSpacing: 1.15,
    fontStyle: "italic",
  },

  decisionFrame: {
    marginTop: 56,
    paddingTop: 18,
    borderTopWidth: 0.85,
    borderTopColor: "#25252D",
    maxWidth: 420,
  },

  decisionText: {
    fontSize: 9.6,
    color: SOFT,
    lineHeight: 1.6,
    opacity: 0.92,
  },

  footer: {
    position: "absolute",
    bottom: 34,
    left: 70,
    right: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.6,
    borderTopColor: "#1C1C23",
    paddingTop: 12,
  },

  footerText: {
    fontSize: 8.6,
    color: SOFT,
    letterSpacing: 1.4,
  },

  engine: {
    color: GOLD,
    fontWeight: "bold",
    letterSpacing: 1.55,
    fontStyle: "italic",
  },
});

export type AureliusReportCoverProps = {
  title: string;
  company: string;
  date: string;
};

export default function AureliusReportCover({
  title,
  company,
  date,
}: AureliusReportCoverProps) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.panel}>
        <View style={styles.gridOverlay} />

        <Image style={styles.logo} source={CYNTRA_LOGO_BASE64} />

        <Text style={styles.confidentiality}>
          Strictly Confidential · Board Artifact Only
        </Text>

        <Text style={styles.overline}>
          Cyntra Insights · Executive Decision Intelligence
        </Text>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.divider} />

        <Text style={styles.companyLabel}>Organisatie</Text>
        <Text style={styles.company}>{company}</Text>

        <View style={styles.decisionFrame}>
          <Text style={styles.decisionText}>
            Dit document is geen rapport.
            {"\n"}
            Het is een strategisch artefact voor besluitvorming.
            {"\n\n"}
            Uitstel vergroot risico. Keuze creëert momentum.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{date}</Text>
        <Text style={styles.footerText}>
          Powered by <Text style={styles.engine}>Aurelius Engine™</Text>
        </Text>
      </View>
    </Page>
  );
}
