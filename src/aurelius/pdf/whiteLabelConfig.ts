export type WhiteLabelConfig = {
  /** Primaire merknaam (headers, footers, PDF-branding) */
  brandName: string;

  /** Primaire accentkleur (hex) */
  primaryAccentColor: string;

  /** Secundaire accentkleur (optioneel) */
  secondaryAccentColor?: string;

  /** Kleur voor waarschuwingen / risico’s */
  warningColor?: string;

  /** Kleur voor positieve actie / kansen */
  successColor?: string;

  /** Footer-tekst (dashboard + PDF) */
  footerText: string;

  /** Optionele tagline of principle */
  tagline?: string;

  /** Watermark-tekst in PDF */
  pdfWatermarkText?: string;

  /** Watermark-opacity (0.01 – 0.1) */
  pdfWatermarkOpacity?: number;
};

/* =========================
   DEFAULT — CYNTRA SIGNATURE
========================= */
export const defaultWhiteLabel: WhiteLabelConfig = {
  brandName: "Cyntra Insights",
  primaryAccentColor: "#D4AF37", // luxe goud
  secondaryAccentColor: "#F5E8C0",
  warningColor: "#9B2C2C",
  successColor: "#166534",
  footerText:
    "© 2026 Cyntra Insights — Strikt vertrouwelijk en uitsluitend bestemd voor geautoriseerde directie",
  tagline: "Helderheid gaat vooraf aan daadkracht.",
  pdfWatermarkText: "EXECUTIVE ONLY",
  pdfWatermarkOpacity: 0.045,
};

/* =========================
   PRESETS
========================= */

// Klassieke management consultancy
export const classicConsultancy: WhiteLabelConfig = {
  ...defaultWhiteLabel,
  brandName: "Strategic Advisory Partners",
  primaryAccentColor: "#003366",
  secondaryAccentColor: "#E6EAEF",
  warningColor: "#8B0000",
  footerText:
    "Confidential — Prepared exclusively for executive decision-making",
  pdfWatermarkText: "CONFIDENTIAL",
};

// Boutique strategy house
export const boutiqueStrategy: WhiteLabelConfig = {
  ...defaultWhiteLabel,
  brandName: "Aurelius Advisory",
  primaryAccentColor: "#8B6F47",
  footerText: "Proprietary & Confidential — Aurelius Advisory",
  tagline: "Clarity drives conviction.",
};

// Interne corporate strategy
export const internalCorporate: WhiteLabelConfig = {
  ...defaultWhiteLabel,
  brandName: "Corporate Strategy Office",
  primaryAccentColor: "#003366",
  footerText: "Internal Use Only — Corporate Strategy Office",
  pdfWatermarkText: "INTERNAL",
};
