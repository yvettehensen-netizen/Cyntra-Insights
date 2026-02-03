// ============================================================
// CYNTRA — ZORG BOARDROOM REPORT (REACT-PDF)
// Executive-grade rendering for RVB + RVT
// ============================================================

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import { ZorgBoardroomPDFLayout } from "./zorgBoardroomLayout";

/* ============================================================
   STYLES — CYNTRA SIGNATURE
============================================================ */

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: ZorgBoardroomPDFLayout.theme.font,
    color: "#111827",
  },

  cover: {
    paddingTop: 120,
    textAlign: "center",
  },

  coverTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 12,
    color: ZorgBoardroomPDFLayout.theme.primary,
  },

  coverSubtitle: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 20,
  },

  watermark: {
    position: "absolute",
    bottom: 30,
    left: 48,
    fontSize: 9,
    color: "#9CA3AF",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 10,
    marginTop: 24,
    color: ZorgBoardroomPDFLayout.theme.primary,
  },

  paragraph: {
    marginBottom: 10,
    lineHeight: 1.5,
    color: "#111827",
  },

  tensionBox: {
    borderLeftWidth: 3,
    borderLeftColor: ZorgBoardroomPDFLayout.theme.accent,
    paddingLeft: 12,
    marginBottom: 12,
  },

  actionCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  roiBlock: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },

  roiLabel: {
    fontSize: 10,
    color: "#4B5563",
    marginBottom: 4,
  },

  roiValue: {
    fontSize: 18,
    fontWeight: 700,
    color: ZorgBoardroomPDFLayout.theme.primary,
  },

  roadmapItem: {
    marginBottom: 6,
  },
});

/* ============================================================
   TYPES
============================================================ */

interface ZorgBoardroomReportProps {
  data: any; // consultant output
  organisation?: string;
}

/* ============================================================
   REPORT COMPONENT
============================================================ */

export function ZorgBoardroomReportPDF({
  data,
  organisation = "Uw Zorgorganisatie",
}: ZorgBoardroomReportProps) {
  return (
    <Document>
      {/* ========================================================
          COVER PAGE — CYNTRA SIGNATURE
      ======================================================== */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.coverTitle}>ZorgScan Boardroom Report</Text>
          <Text style={styles.coverSubtitle}>
            Raad van Bestuur • Raad van Toezicht
          </Text>

          <Text style={styles.paragraph}>
            Bestuurlijke Spanningsanalyse & Besluitvormingskaart
          </Text>

          <Text style={{ marginTop: 30, fontSize: 12 }}>
            Organisatie: {organisation}
          </Text>

          <Text style={{ marginTop: 10, fontSize: 10, color: "#6B7280" }}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.watermark}>
          {ZorgBoardroomPDFLayout.theme.watermark}
        </Text>
      </Page>

      {/* ========================================================
          CONTENT PAGE
      ======================================================== */}
      <Page size="A4" style={styles.page}>
        {/* Executive Snapshot */}
        <Text style={styles.sectionTitle}>
          Bestuurlijke Samenvatting
        </Text>
        <Text style={styles.paragraph}>
          {data.executive_snapshot}
        </Text>

        {/* Tensions */}
        <Text style={styles.sectionTitle}>
          Structurele Spanningsvelden
        </Text>

        {data.boardroom_tensions?.map((t: any, i: number) => (
          <View key={i} style={styles.tensionBox}>
            <Text style={{ fontWeight: 700 }}>{t.tension}</Text>
            <Text>{t.description}</Text>
            <Text style={{ marginTop: 4, color: "#991B1B" }}>
              Board Risk: {t.board_risk}
            </Text>
          </View>
        ))}

        {/* Recommended Moves */}
        <Text style={styles.sectionTitle}>
          Bestuurlijke Interventies
        </Text>

        {data.recommended_board_moves?.map((m: any, i: number) => (
          <View key={i} style={styles.actionCard}>
            <Text style={{ fontWeight: 700 }}>{m.move}</Text>
            <Text>{m.impact}</Text>
            <Text style={{ marginTop: 4, color: "#065F46" }}>
              Board Value: {m.board_value}
            </Text>
          </View>
        ))}

        {/* Business Case ROI */}
        {data.business_case && (
          <>
            <Text style={styles.sectionTitle}>
              Business Case Overzicht
            </Text>

            <View style={styles.roiBlock}>
              <Text style={styles.roiLabel}>Business Case</Text>
              <Text style={{ fontWeight: 700 }}>
                {data.business_case.title}
              </Text>

              <Text style={{ marginTop: 8 }}>
                {data.business_case.description}
              </Text>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.roiLabel}>Indicatieve ROI</Text>
                <Text style={styles.roiValue}>
                  +{data.business_case.potential_roi}%
                </Text>
              </View>
            </View>
          </>
        )}

        {/* 90 Day Roadmap */}
        <Text style={styles.sectionTitle}>
          90-Dagen Besluitplan
        </Text>

        {data.ninety_day_boardroom_plan?.days_0_30?.map(
          (x: string, i: number) => (
            <Text key={i} style={styles.roadmapItem}>
              • {x}
            </Text>
          )
        )}
      </Page>
    </Document>
  );
}
