// ============================================================
// CYNTRA INSIGHTS — COVER STRATEGY MAP (CANON)
// Definitieve cover-architectuur per analyse-type
// Discreet · Elite · Luxe · Schaalbaar
// ============================================================

/* ================= TYPES ================= */

export type CyntraAnalysisStyle =
  | "strategy"
  | "market"
  | "governance"
  | "ai_data"
  | "change"
  | "generic";

export interface CyntraCoverConfig {
  style: CyntraAnalysisStyle;

  // Visueel
  background: "sand";
  primaryAccent: "gold";
  secondaryAccent: "muted";

  // Typografie
  titleSize: number;
  subtitleSize: number;
  companySize: number;

  // Layout
  showLogo: boolean;
  logoPosition: "top-left" | "top-right";
  metadataAlignment: "right" | "bottom";
  confidencePosition: "top-right" | "bottom-right";

  // Semantiek
  snapshotLabel: string;
  showUnderstreamHint: boolean;

  // Tone of voice
  subtitleTemplate: string;
}

/* ================= CANONICAL MAP ================= */

export const COVER_STRATEGY_MAP: Record<
  CyntraAnalysisStyle,
  CyntraCoverConfig
> = {
  /* ------------------------------------------------------------
     STRATEGY — rust, overzicht, boardroom
  ------------------------------------------------------------ */
  strategy: {
    style: "strategy",
    background: "sand",
    primaryAccent: "gold",
    secondaryAccent: "muted",

    titleSize: 17,
    subtitleSize: 16,
    companySize: 34,

    showLogo: true,
    logoPosition: "top-left",
    metadataAlignment: "right",
    confidencePosition: "top-right",

    snapshotLabel: "Strategic Intelligence Snapshot",
    showUnderstreamHint: true,

    subtitleTemplate: "Strategic Intelligence Snapshot",
  },

  /* ------------------------------------------------------------
     MARKET — extern, analytisch, objectief
  ------------------------------------------------------------ */
  market: {
    style: "market",
    background: "sand",
    primaryAccent: "gold",
    secondaryAccent: "muted",

    titleSize: 16,
    subtitleSize: 15,
    companySize: 32,

    showLogo: true,
    logoPosition: "top-left",
    metadataAlignment: "right",
    confidencePosition: "top-right",

    snapshotLabel: "Market Intelligence Snapshot",
    showUnderstreamHint: false,

    subtitleTemplate: "Market Intelligence Snapshot",
  },

  /* ------------------------------------------------------------
     GOVERNANCE — klinisch, beheerst, controle
  ------------------------------------------------------------ */
  governance: {
    style: "governance",
    background: "sand",
    primaryAccent: "gold",
    secondaryAccent: "muted",

    titleSize: 15,
    subtitleSize: 14,
    companySize: 30,

    showLogo: false, // bewuste keuze: neutraler
    logoPosition: "top-left",
    metadataAlignment: "right",
    confidencePosition: "bottom-right",

    snapshotLabel: "Governance Intelligence Snapshot",
    showUnderstreamHint: false,

    subtitleTemplate: "Governance Intelligence Snapshot",
  },

  /* ------------------------------------------------------------
     AI / DATA — technisch, scherp, feitelijk
  ------------------------------------------------------------ */
  ai_data: {
    style: "ai_data",
    background: "sand",
    primaryAccent: "gold",
    secondaryAccent: "muted",

    titleSize: 15,
    subtitleSize: 14,
    companySize: 30,

    showLogo: true,
    logoPosition: "top-right",
    metadataAlignment: "right",
    confidencePosition: "top-right",

    snapshotLabel: "Data & AI Intelligence Snapshot",
    showUnderstreamHint: false,

    subtitleTemplate: "Data & AI Intelligence Snapshot",
  },

  /* ------------------------------------------------------------
     CHANGE / ONDERSTROOM — menselijk, psychologisch
  ------------------------------------------------------------ */
  change: {
    style: "change",
    background: "sand",
    primaryAccent: "gold",
    secondaryAccent: "muted",

    titleSize: 16,
    subtitleSize: 15,
    companySize: 32,

    showLogo: true,
    logoPosition: "top-left",
    metadataAlignment: "bottom",
    confidencePosition: "bottom-right",

    snapshotLabel: "Change Intelligence Snapshot",
    showUnderstreamHint: true,

    subtitleTemplate: "Change Intelligence Snapshot",
  },

  /* ------------------------------------------------------------
     GENERIC — fallback, altijd veilig
  ------------------------------------------------------------ */
  generic: {
    style: "generic",
    background: "sand",
    primaryAccent: "gold",
    secondaryAccent: "muted",

    titleSize: 16,
    subtitleSize: 15,
    companySize: 32,

    showLogo: true,
    logoPosition: "top-left",
    metadataAlignment: "right",
    confidencePosition: "top-right",

    snapshotLabel: "Executive Intelligence Snapshot",
    showUnderstreamHint: false,

    subtitleTemplate: "Executive Intelligence Snapshot",
  },
};

/* ================= RESOLVER ================= */

/**
 * Resolveert cover-config op basis van analysisType
 * Altijd fail-safe (valt terug op generic)
 */
export function resolveCoverStrategy(
  analysisType?: string
): CyntraCoverConfig {
  if (!analysisType) return COVER_STRATEGY_MAP.generic;

  if (analysisType in COVER_STRATEGY_MAP) {
    return COVER_STRATEGY_MAP[
      analysisType as CyntraAnalysisStyle
    ];
  }

  return COVER_STRATEGY_MAP.generic;
}
