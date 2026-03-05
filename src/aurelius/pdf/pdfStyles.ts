import { StyleSheet } from "@react-pdf/renderer";

/* ============================================================================
   AURELIUS PDF DESIGN SYSTEM — HGBCO DECISION CANON (FINAL)
   • Decision-grade hierarchy
   • HGBCO spine built into layout
   • Blockers → Closure → Outcome styling
   • Boardroom minimal elite
============================================================================ */

const GOLD = "#C6A75E";

const DARK = "#0B0F19";
const MUTED = "#6B7280";
const LIGHT = "#E5E7EB";

/* HGBCO LAYER COLORS */

const BLOCKER = "#991B1B"; // B-layer
const CLOSURE = "#1D4ED8"; // C-layer
const OUTCOME = "#15803D"; // O-layer

export const aureliusPdfStyles = StyleSheet.create({
  /* ================= PAGE BASE ================= */

  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 32,
    fontFamily: "Helvetica",
    fontSize: 18,
    lineHeight: 1.6,
    color: DARK,
    backgroundColor: "#FFFFFF",
  },

  /* ================= WATERMARK ================= */

  watermark: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    alignItems: "center",
    transform: "rotate(-30deg)",
    pointerEvents: "none",
  },

  watermarkText: {
    fontSize: 68,
    letterSpacing: 6,
    fontWeight: "bold",
    color: "#111827",
  },

  /* ================= HEADER ================= */

  header: {
    position: "absolute",
    top: 32,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brandLabel: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: GOLD,
  },

  confidentialLabel: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 0.8,
  },

  /* ================= TITLE BLOCK ================= */

  titleSection: {
    marginTop: 96,
    marginBottom: 52,
  },

  title: {
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: -0.5,
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    color: MUTED,
    marginBottom: 26,
  },

  metaText: {
    fontSize: 10,
  },

  divider: {
    height: 2,
    backgroundColor: GOLD,
    width: 140,
  },

  /* ================= SECTION TITLES ================= */

  sectionLarge: {
    marginBottom: 56,
  },

  sectionLabel: {
    fontSize: 9.5,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 14,
    fontWeight: "bold",
    color: GOLD,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.4,
    marginBottom: 18,
    color: DARK,
  },

  /* ============================================================
     ✅ HGBCO DECISION CARD BLOCKS
  ============================================================ */

  hgbcoBlock: {
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    paddingLeft: 20,
    marginBottom: 18,
  },

  hgbcoText: {
    fontSize: 12.3,
    lineHeight: 1.55,
    color: DARK,
    maxWidth: 420,
  },

  /* ================= B — BLOCKERS ================= */

  blockerBlock: {
    borderLeftWidth: 3,
    borderLeftColor: BLOCKER,
    paddingLeft: 18,
    marginBottom: 14,
  },

  blockerText: {
    fontSize: 11.5,
    lineHeight: 1.55,
    color: BLOCKER,
    fontStyle: "italic",
    maxWidth: 420,
  },

  /* ================= C — CLOSURE PLAN ================= */

  closureBlock: {
    borderLeftWidth: 3,
    borderLeftColor: CLOSURE,
    paddingLeft: 18,
    marginBottom: 14,
  },

  closureText: {
    fontSize: 11.5,
    lineHeight: 1.55,
    color: CLOSURE,
    maxWidth: 420,
  },

  /* ================= O — OUTCOME ================= */

  outcomeBlock: {
    borderLeftWidth: 3,
    borderLeftColor: OUTCOME,
    paddingLeft: 18,
    marginBottom: 18,
  },

  outcomeText: {
    fontSize: 12,
    lineHeight: 1.6,
    color: OUTCOME,
    fontWeight: "bold",
    maxWidth: 420,
  },

  /* ============================================================
     ✅ EXECUTIVE VERDICT BLOCK
  ============================================================ */

  verdictBlock: {
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    paddingLeft: 22,
    marginBottom: 18,
  },

  verdictText: {
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 1.65,
    color: "#111827",
    maxWidth: 420,
  },

  /* ============================================================
     ✅ INTERVENTIONS — EXECUTION ROWS
  ============================================================ */

  interventionBlock: {
    borderLeftWidth: 3,
    borderLeftColor: CLOSURE,
    paddingLeft: 18,
    marginBottom: 16,
  },

  interventionTitle: {
    fontSize: 11.8,
    fontWeight: "bold",
    marginBottom: 4,
    color: DARK,
  },

  interventionMeta: {
    fontSize: 10,
    color: MUTED,
    lineHeight: 1.4,
    maxWidth: 420,
  },

  /* ================= INSIGHTS ================= */

  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  insightNumber: {
    width: 32,
    fontSize: 15,
    fontWeight: "bold",
    color: GOLD,
    textAlign: "right",
    paddingRight: 12,
  },

  insightText: {
    flex: 1,
    fontSize: 11.6,
    lineHeight: 1.55,
    maxWidth: 420,
  },

  /* ================= RISKS ================= */

  riskBlock: {
    borderLeftWidth: 2.5,
    borderLeftColor: BLOCKER,
    paddingLeft: 16,
    marginBottom: 12,
  },

  riskText: {
    fontSize: 11.3,
    lineHeight: 1.55,
    color: BLOCKER,
    maxWidth: 420,
  },

  /* ================= OPPORTUNITIES ================= */

  opportunityItem: {
    flexDirection: "row",
    marginBottom: 13,
    gap: 10,
  },

  opportunityNumber: {
    fontWeight: "bold",
    color: GOLD,
  },

  opportunityText: {
    flex: 1,
    fontSize: 11.6,
    lineHeight: 1.55,
    maxWidth: 420,
  },

  /* ================= FOOTER ================= */

  footer: {
    position: "absolute",
    bottom: 36,
    left: 64,
    right: 64,
    borderTopWidth: 0.8,
    borderTopColor: LIGHT,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: MUTED,
  },

  footerText: {
    fontSize: 9,
    letterSpacing: 0.6,
  },

  pageNumber: {
    fontSize: 9,
  },
});
