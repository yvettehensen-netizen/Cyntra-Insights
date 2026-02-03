import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

/* ================= TYPES ================= */

export type RiskLevel = "LOW" | "MODERATE" | "HIGH";

export type RGB = readonly [number, number, number];

export interface ThemeConfig {
  id: string;
  name: string;
  dark: boolean;
  accent: RGB;
  watermarkText?: string;
  watermarkLogo?: string;
}

/* ================= DEFAULT THEMES ================= */

const CYNTRA_THEME: ThemeConfig = {
  id: "cyntra",
  name: "Cyntra",
  dark: true,
  accent: [196, 164, 101],
  watermarkText: "STRICTLY CONFIDENTIAL",
};

/* ================= CONTEXT ================= */

interface ThemeContextValue {
  theme: ThemeConfig;
  risk: RiskLevel;
  setTheme: (theme: ThemeConfig) => void;
  setRisk: (risk: RiskLevel) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ================= PROVIDER ================= */

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] =
    useState<ThemeConfig>(CYNTRA_THEME);

  const [risk, setRisk] =
    useState<RiskLevel>("MODERATE");

  return (
    <ThemeContext.Provider
      value={{ theme, risk, setTheme, setRisk }}
    >
      <div
        className={
          theme.dark
            ? "dark bg-gray-900 text-white min-h-screen"
            : "bg-white text-black min-h-screen"
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  return ctx;
}
