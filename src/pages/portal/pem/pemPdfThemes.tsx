import { Circle, Svg, StyleSheet } from "@react-pdf/renderer";

export type PemPdfTheme = {
  key: string;
  background: string;
  accent: string;
  title: string;
  subtitle: string;
  muted: string;
  map: string;
  panel: string;
  line: string;
};

const THEMES: Record<string, PemPdfTheme> = {
  teal: {
    key: "teal",
    background: "#061D1B",
    accent: "#30D5C8",
    title: "#FFFFFF",
    subtitle: "#BCEFE9",
    muted: "#8FBAB2",
    map: "#1C7A74",
    panel: "#0B2A27",
    line: "#1E3A36",
  },
  violet: {
    key: "violet",
    background: "#120C24",
    accent: "#8F77FF",
    title: "#FFFFFF",
    subtitle: "#D9D2FF",
    muted: "#A79CD3",
    map: "#3E2B72",
    panel: "#1A1236",
    line: "#2B2052",
  },
  amber: {
    key: "amber",
    background: "#1B1408",
    accent: "#F5C542",
    title: "#FFFFFF",
    subtitle: "#FBE8B2",
    muted: "#C6B27C",
    map: "#6D4E12",
    panel: "#2A1D0C",
    line: "#3A2B10",
  },
  sky: {
    key: "sky",
    background: "#0A1624",
    accent: "#5FCBFF",
    title: "#FFFFFF",
    subtitle: "#CFEFFF",
    muted: "#91B7C8",
    map: "#1E5B7A",
    panel: "#102236",
    line: "#1E2D42",
  },
  emerald: {
    key: "emerald",
    background: "#081A13",
    accent: "#3EE08A",
    title: "#FFFFFF",
    subtitle: "#C6F2DA",
    muted: "#8AB9A2",
    map: "#1D6B44",
    panel: "#0E2A1C",
    line: "#173728",
  },
  orange: {
    key: "orange",
    background: "#1E140B",
    accent: "#F59E5B",
    title: "#FFFFFF",
    subtitle: "#FCD7B6",
    muted: "#C9A07D",
    map: "#7A3D12",
    panel: "#2B1A0F",
    line: "#3C2415",
  },
  fuchsia: {
    key: "fuchsia",
    background: "#1D0E1D",
    accent: "#E879F9",
    title: "#FFFFFF",
    subtitle: "#F7D0FF",
    muted: "#C6A2CF",
    map: "#6C2E7A",
    panel: "#2B1530",
    line: "#3A1C40",
  },
  rose: {
    key: "rose",
    background: "#1C0B12",
    accent: "#F8719D",
    title: "#FFFFFF",
    subtitle: "#FBD0DF",
    muted: "#C79AAA",
    map: "#6D2B44",
    panel: "#2A111B",
    line: "#3A1723",
  },
  lime: {
    key: "lime",
    background: "#121A08",
    accent: "#A3E635",
    title: "#FFFFFF",
    subtitle: "#E5F8B8",
    muted: "#B0C58D",
    map: "#4A6B18",
    panel: "#1C2A0C",
    line: "#263815",
  },
  indigo: {
    key: "indigo",
    background: "#0B1120",
    accent: "#6366F1",
    title: "#FFFFFF",
    subtitle: "#CBD5FF",
    muted: "#9CA3C7",
    map: "#2A3570",
    panel: "#141C34",
    line: "#1F294A",
  },
  default: {
    key: "default",
    background: "#0B1220",
    accent: "#D4AF37",
    title: "#FFFFFF",
    subtitle: "#E5E7EB",
    muted: "#9CA3AF",
    map: "#404B6A",
    panel: "#111827",
    line: "#1F2937",
  },
};

export const getPemPdfTheme = (accentKey?: string): PemPdfTheme => {
  if (accentKey && accentKey in THEMES) {
    return THEMES[accentKey];
  }
  return THEMES.default;
};

const dotStyles = StyleSheet.create({
  dots: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});

const WORLD_DOTS: Array<[number, number, number]> = [
  [90, 170, 3],
  [120, 150, 3],
  [140, 165, 2.5],
  [165, 180, 2.5],
  [185, 195, 2.5],
  [210, 175, 2.5],
  [240, 190, 2.5],
  [265, 210, 2.5],
  [300, 175, 2.5],
  [330, 160, 2.5],
  [360, 175, 2.5],
  [390, 190, 2.5],
  [420, 175, 2.5],
  [450, 160, 2.5],
  [475, 175, 2.5],
  [505, 190, 2.5],
  [130, 280, 2.5],
  [150, 300, 2.5],
  [170, 320, 2.5],
  [190, 340, 2.5],
  [210, 360, 2.5],
  [310, 290, 2.5],
  [330, 310, 2.5],
  [350, 330, 2.5],
  [370, 350, 2.5],
  [400, 330, 2.5],
  [430, 310, 2.5],
  [460, 330, 2.5],
  [490, 350, 2.5],
  [520, 370, 2.5],
];

export const CoverDots = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 600 800" style={dotStyles.dots}>
    {WORLD_DOTS.map(([x, y, r], idx) => (
      <Circle key={idx} cx={x} cy={y} r={r} fill={color} opacity={0.14} />
    ))}
  </Svg>
);
