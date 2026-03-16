export const colors = {
  primaryBackground: "#0F1114",
  secondarySurface: "#16181D",
  cardSurface: "#1C1F25",
  primaryText: "#F2F2F0",
  secondaryText: "#A7A9AD",
  accentGold: "#C4A762",
  goldHover: "#D4B878",
  danger: "#8B2E2E",
  success: "#3C5E47",
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
} as const;

export const typography = {
  heading1: "clamp(40px, 4vw, 48px)",
  heading2: "clamp(30px, 3vw, 36px)",
  heading3: "24px",
  body: "16px",
  bodyLarge: "18px",
  lineHeightBody: 1.6,
  letterSpacingHeading: "0.03em",
} as const;

export const radii = {
  sm: "8px",
  md: "12px",
  lg: "16px",
} as const;

export const shadows = {
  card: "0 10px 28px rgba(0, 0, 0, 0.28)",
  subtle: "0 4px 12px rgba(0, 0, 0, 0.2)",
} as const;
