import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { asList, sanitizeList, sanitizeText, toScore } from "../pem/pemResultUtils";
import { CoverDots, getPemPdfTheme, type PemPdfTheme } from "../pem/pemPdfThemes";

const createStyles = (theme: PemPdfTheme) =>
  StyleSheet.create({
    page: {
      padding: 48,
      fontSize: 11,
      fontFamily: "Helvetica",
      color: "#0F172A",
      lineHeight: 1.5,
    },
    coverPage: {
      padding: 0,
      fontFamily: "Helvetica",
      color: theme.title,
      backgroundColor: theme.background,
      position: "relative",
    },
    coverInner: {
      paddingTop: 90,
      paddingHorizontal: 52,
    },
    coverBrand: {
      fontSize: 11,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: theme.subtitle,
      marginBottom: 18,
    },
    coverTitle: {
      fontSize: 34,
      fontWeight: 700,
      color: theme.title,
      marginBottom: 12,
    },
    coverSubtitle: {
      fontSize: 14,
      color: theme.subtitle,
      marginBottom: 18,
    },
    coverMeta: {
      fontSize: 11,
      color: theme.muted,
      marginTop: 6,
    },
    coverTag: {
      fontSize: 10,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: theme.accent,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 700,
      marginTop: 18,
      marginBottom: 8,
      color: theme.accent,
    },
    sectionSubtitle: {
      fontSize: 9,
      color: theme.muted,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    paragraph: {
      marginBottom: 8,
      color: "#0F172A",
    },
    listItem: {
      marginBottom: 4,
      color: "#0F172A",
    },
    grid: {
      flexDirection: "row",
      gap: 12,
    },
    card: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.line,
      padding: 10,
      borderRadius: 8,
      backgroundColor: theme.panel,
    },
    cardTitle: {
      fontSize: 10,
      fontWeight: 700,
      color: "#1E293B",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    score: {
      fontSize: 18,
      fontWeight: 700,
      color: "#0F172A",
    },
    muted: {
      color: theme.muted,
    },
  });

function normalizeList(value: any): string[] {
  return sanitizeList(asList(value));
}

function normalizeVrr(entry: any) {
  if (!entry) return { score: null, text: "" };
  if (typeof entry === "number") return { score: toScore(entry), text: "" };
  if (typeof entry === "string")
    return { score: null, text: sanitizeText(entry) };
  if (typeof entry === "object") {
    return {
      score: toScore(entry.level ?? entry.score ?? entry.value ?? 0) || null,
      text: sanitizeText(entry.text ?? entry.description ?? entry.summary ?? ""),
    };
  }
  return { score: null, text: "" };
}

function normalizeTensions(value: any) {
  const items = Array.isArray(value) ? value : [];
  return items.map((entry: any) => {
    if (!entry || typeof entry !== "object") {
      return {
        label: sanitizeText(String(entry ?? "")),
        description: "",
        support: null,
        temporal: "",
      };
    }
    const supportRaw = entry.support ?? entry.strength ?? entry.score ?? null;
    const supportNum = Number(supportRaw);
    return {
      label: sanitizeText(entry.label ?? entry.tension ?? entry.title ?? ""),
      description: sanitizeText(entry.description ?? entry.detail ?? ""),
      support: Number.isFinite(supportNum) && supportNum > 0 ? supportNum : null,
      temporal: sanitizeText(entry.temporal_status ?? entry.persistence ?? entry.status ?? ""),
    };
  });
}

function resolveOrganisation(report: any) {
  return (
    report?.organisation ||
    report?.organisatie ||
    report?.organisation_name ||
    report?.organisationContext ||
    report?.organisation_context ||
    report?.company ||
    "Organisatie"
  );
}

export function BoardTensionReportPDF({
  report,
  scanLabel,
  scanTagline,
  organisation,
  accentKey,
}: {
  report: any;
  scanLabel: string;
  scanTagline?: string;
  organisation?: string;
  accentKey?: string;
}) {
  const theme = getPemPdfTheme(accentKey ?? "amber");
  const styles = createStyles(theme);
  const orgName = organisation ?? resolveOrganisation(report);
  const summary = sanitizeText(
    report?.summary ??
      report?.executive_summary ??
      report?.narrative ??
      ""
  );
  const boardBlockade = sanitizeText(
    report?.board_blockade ?? report?.bestuurlijke_blokkade ?? report?.failure ?? ""
  );
  const coreSignal = sanitizeText(
    report?.core_signal ?? report?.primary_signal ?? report?.primary_structural_failure ?? ""
  );
  const keyInsights = normalizeList(
    report?.key_insights ?? report?.highlights ?? report?.insights
  );

  const tensions = normalizeTensions(
    report?.tension_map ?? report?.tensions ?? report?.boardroom_tensions ?? []
  );

  const vrr = report?.vrr_analysis ?? report?.vrr ?? {};
  const vulnerability = normalizeVrr(vrr?.vulnerability ?? vrr?.Vulnerability);
  const resilience = normalizeVrr(vrr?.resilience ?? vrr?.Resilience);
  const risk = normalizeVrr(vrr?.risk ?? vrr?.Risk);

  const layered = report?.layered_suffering ?? report?.layered_tensions ?? {};
  const layeredPsych = sanitizeText(layered?.psychological ?? layered?.psych ?? "");
  const layeredExistential = sanitizeText(layered?.existential ?? "");
  const layeredSystemic = sanitizeText(layered?.systemic ?? "");

  const priorities = normalizeList(
    report?.top_priorities ?? report?.priorities ?? report?.focus_areas
  );
  const shortTerm = normalizeList(
    report?.short_term_actions ?? report?.next_actions
  );
  const longTerm = normalizeList(
    report?.long_term_actions ?? report?.longer_term_actions
  );

  const documentsSummary = sanitizeText(report?.documents_summary ?? "");
  const cleanedDocSummary = documentsSummary
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/geen tekstextractie beschikbaar\.?/gi, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)
    .join("\n");
  const hasMeaningfulDocSummary =
    cleanedDocSummary && cleanedDocSummary.length > 80;
  const documentsStorage = Array.isArray(report?.documents_storage)
    ? report.documents_storage
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.coverPage}>
        <CoverDots color={theme.map} />
        <View style={styles.coverInner}>
          <Text style={styles.coverBrand}>CYNTRA INSIGHTS</Text>
          <Text style={styles.coverTag}>Boardroom scan</Text>
          <Text style={styles.coverTitle}>{scanLabel}</Text>
          <Text style={styles.coverSubtitle}>
            {scanTagline ?? "Cyntra Board Tension Scan"}
          </Text>
          <Text style={styles.coverMeta}>Organisatie: {orgName}</Text>
          <Text style={styles.coverMeta}>
            {new Date().toLocaleDateString("nl-NL")}
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.sectionTitle}>Samenvatting</Text>
        <Text style={styles.paragraph}>{summary}</Text>

        {boardBlockade && (
          <>
            <Text style={styles.sectionTitle}>Bestuurlijke blokkade</Text>
            <Text style={styles.paragraph}>{boardBlockade}</Text>
          </>
        )}

        {coreSignal && (
          <>
            <Text style={styles.sectionTitle}>Kernsignaal</Text>
            <Text style={styles.paragraph}>{coreSignal}</Text>
          </>
        )}

        {keyInsights.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Kerninzichten</Text>
            {keyInsights.map((item, idx) => (
              <Text key={`ki-${idx}`} style={styles.listItem}>
                {idx + 1}. {item}
              </Text>
            ))}
          </>
        )}

        {tensions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Spanningskaart</Text>
            {tensions.map((entry, idx) => (
              <View key={`t-${idx}`} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {entry.temporal || "Spanning"}
                </Text>
                <Text style={styles.paragraph}>{entry.label}</Text>
                {entry.support !== null && (
                  <Text style={styles.listItem}>
                    Support: {entry.support}
                  </Text>
                )}
                {entry.description && (
                  <Text style={styles.paragraph}>{entry.description}</Text>
                )}
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>VRR-profiel</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vulnerability</Text>
            {vulnerability.score !== null && (
              <Text style={styles.score}>{vulnerability.score}/10</Text>
            )}
            {vulnerability.text ? (
              <Text style={styles.paragraph}>{vulnerability.text}</Text>
            ) : null}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resilience</Text>
            {resilience.score !== null && (
              <Text style={styles.score}>{resilience.score}/10</Text>
            )}
            {resilience.text ? (
              <Text style={styles.paragraph}>{resilience.text}</Text>
            ) : null}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Risk</Text>
            {risk.score !== null && (
              <Text style={styles.score}>{risk.score}/10</Text>
            )}
            {risk.text ? <Text style={styles.paragraph}>{risk.text}</Text> : null}
          </View>
        </View>

        {(layeredPsych || layeredExistential || layeredSystemic) && (
          <>
            <Text style={styles.sectionTitle}>Gelaagde spanning</Text>
            {layeredPsych && (
              <>
                <Text style={styles.sectionSubtitle}>Psychologisch</Text>
                <Text style={styles.paragraph}>{layeredPsych}</Text>
              </>
            )}
            {layeredExistential && (
              <>
                <Text style={styles.sectionSubtitle}>Existentieel</Text>
                <Text style={styles.paragraph}>{layeredExistential}</Text>
              </>
            )}
            {layeredSystemic && (
              <>
                <Text style={styles.sectionSubtitle}>Systemisch</Text>
                <Text style={styles.paragraph}>{layeredSystemic}</Text>
              </>
            )}
          </>
        )}

        {priorities.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Topprioriteiten (90 dagen)</Text>
            {priorities.map((item, idx) => (
              <Text key={`p-${idx}`} style={styles.listItem}>
                {idx + 1}. {item}
              </Text>
            ))}
          </>
        )}

        {(shortTerm.length > 0 || longTerm.length > 0) && (
          <>
            <Text style={styles.sectionTitle}>Interventies (acties)</Text>
            {shortTerm.length > 0 && (
              <>
                <Text style={styles.sectionSubtitle}>Korte termijn</Text>
                {shortTerm.map((item, idx) => (
                  <Text key={`s-${idx}`} style={styles.listItem}>
                    {idx + 1}. {item}
                  </Text>
                ))}
              </>
            )}
            {longTerm.length > 0 && (
              <>
                <Text style={styles.sectionSubtitle}>Lange termijn</Text>
                {longTerm.map((item, idx) => (
                  <Text key={`l-${idx}`} style={styles.listItem}>
                    {idx + 1}. {item}
                  </Text>
                ))}
              </>
            )}
          </>
        )}

        {(hasMeaningfulDocSummary || documentsStorage.length > 0) && (
          <>
            <Text style={styles.sectionTitle}>Documenten</Text>
            {hasMeaningfulDocSummary ? (
              <Text style={styles.paragraph}>{cleanedDocSummary}</Text>
            ) : null}

            {documentsStorage.length > 0 && (
              <View>
                {documentsStorage.map((doc: any, idx: number) => {
                  const link = doc?.public_url ?? doc?.signed_url ?? null;
                  return (
                    <Text key={`doc-${idx}`} style={styles.listItem}>
                      {idx + 1}.{" "}
                      {link ? (
                        <Link src={link}>
                          {doc?.name ?? `Document ${idx + 1}`}
                        </Link>
                      ) : (
                        doc?.name ?? `Document ${idx + 1}`
                      )}
                    </Text>
                  );
                })}
              </View>
            )}
          </>
        )}
      </Page>
    </Document>
  );
}
