import { CyntraDesignTokens } from "@/design/cyntraDesignTokens";

export const reportDesignSystem = {
  identity: {
    name: "Cyntra Boardroom Memo",
    positioning: "Strategisch besluitdocument voor directie en Raad van Toezicht",
    tone: ["hard", "scanbaar", "bestuurlijk", "mechanistisch"],
  },
  palette: {
    cyntraBlue: CyntraDesignTokens.colors.blue,
    cyntraBlueDeep: CyntraDesignTokens.colors.blueDeep,
    gold: CyntraDesignTokens.colors.gold,
    goldSoft: CyntraDesignTokens.colors.goldSoft,
    executiveGrey: CyntraDesignTokens.colors.executiveGrey,
    lightGrey: CyntraDesignTokens.colors.lightGrey,
    ink: CyntraDesignTokens.colors.ink,
    white: CyntraDesignTokens.colors.white,
  },
  typography: {
    uiFont: CyntraDesignTokens.typography.fontPrimary,
    displayFont: CyntraDesignTokens.typography.fontDisplay,
    pdfFont: CyntraDesignTokens.typography.fontPdf,
    h1: {
      sizePx: CyntraDesignTokens.typography.h1.size,
      lineHeight: CyntraDesignTokens.typography.h1.lineHeight,
      weight: CyntraDesignTokens.typography.h1.weight,
      tracking: CyntraDesignTokens.typography.h1.tracking,
    },
    h2: {
      sizePx: CyntraDesignTokens.typography.h2.size,
      lineHeight: CyntraDesignTokens.typography.h2.lineHeight,
      weight: CyntraDesignTokens.typography.h2.weight,
      tracking: CyntraDesignTokens.typography.h2.tracking,
    },
    h3: {
      sizePx: CyntraDesignTokens.typography.h3.size,
      lineHeight: CyntraDesignTokens.typography.h3.lineHeight,
      weight: CyntraDesignTokens.typography.h3.weight,
      tracking: CyntraDesignTokens.typography.h3.tracking,
    },
    body: {
      sizePx: CyntraDesignTokens.typography.body.size,
      lineHeight: CyntraDesignTokens.typography.body.lineHeight,
      weight: CyntraDesignTokens.typography.body.weight,
      tracking: CyntraDesignTokens.typography.body.tracking,
    },
    meta: {
      sizePx: CyntraDesignTokens.typography.meta.size,
      lineHeight: CyntraDesignTokens.typography.meta.lineHeight,
      weight: CyntraDesignTokens.typography.meta.weight,
      tracking: CyntraDesignTokens.typography.meta.tracking,
    },
  },
  spacing: {
    sectionGapPx: CyntraDesignTokens.spacing.sectionGap,
    titleGapPx: CyntraDesignTokens.spacing.titleGap,
    paragraphGapPx: CyntraDesignTokens.spacing.paragraphGap,
    pageMarginPx: CyntraDesignTokens.spacing.pageMargin,
    contentMaxWidthPx: CyntraDesignTokens.layout.maxWidth,
  },
  hierarchy: {
    sectionRuleWidthPx: 96,
    sectionRuleOpacity: 0.2,
    useCardsForParagraphs: false,
    useShadowsForParagraphs: false,
    preferredDivider: "rule",
  },
  emphasis: {
    allowedParagraphHighlights: ["Boardroom summary", "Aanbevolen keuze", "Stopregel"],
    allowedAccentLists: [
      "Killer insights",
      "Strategische blinde vlekken",
      "Strategische hefboompunten",
      "Bestuurlijk debat",
    ],
    accentStyle: "left-rule",
    decisionBlockBackground: "subtle",
  },
  pdf: {
    cover: {
      useDarkCover: true,
      useGoldRail: true,
      includeTagline: true,
    },
    print: {
      format: "A4",
      avoidTextOverflow: true,
      maxReadableWidthPx: CyntraDesignTokens.layout.maxWidth,
    },
  },
  writingRules: {
    avoid: ["cards", "dashboard blocks", "rounded paragraph containers", "shadow panels"],
    prefer: ["typography", "whitespace", "section rules", "accent lines", "short summary blocks"],
  },
} as const;

export type CyntraReportDesignSystem = typeof reportDesignSystem;
