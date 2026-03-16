export const CyntraDesignTokens = {
  colors: {
    blue: "#0B1F3A",
    gold: "#C6A461",
    executiveGrey: "#4A4A4A",
    lightGrey: "#F5F6F8",
    divider: "#E6E8EB",
    blueDeep: "#09172B",
    ink: "#0F1720",
    white: "#FFFFFF",
    goldSoft: "#D7B56D",
  },
  typography: {
    fontPrimary: "Aptos, 'Aptos Display', 'Segoe UI', Inter, system-ui, sans-serif",
    fontDisplay: "Aptos, 'Aptos Display', 'Segoe UI', Inter, system-ui, sans-serif",
    fontPdf: "helvetica",
    h1: {
      size: 36,
      weight: 600,
      lineHeight: 1.1,
      tracking: "-0.03em",
    },
    h2: {
      size: 28,
      weight: 600,
      lineHeight: 1.16,
      tracking: "-0.02em",
    },
    h3: {
      size: 22,
      weight: 500,
      lineHeight: 1.2,
      tracking: "-0.01em",
    },
    body: {
      size: 16,
      weight: 400,
      lineHeight: 1.6,
      tracking: "0em",
    },
    meta: {
      size: 12,
      weight: 600,
      lineHeight: 1.4,
      tracking: "0.24em",
    },
  },
  spacing: {
    sectionGap: 48,
    paragraphGap: 16,
    blockGap: 24,
    titleGap: 16,
    pageMargin: 42,
  },
  layout: {
    maxWidth: 900,
  },
  accent: {
    summaryLine: "#C6A461",
    insightLine: "#0B1F3A",
  },
} as const;

export type CyntraDesignTokensType = typeof CyntraDesignTokens;
