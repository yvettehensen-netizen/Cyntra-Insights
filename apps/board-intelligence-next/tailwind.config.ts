import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        panel: "#101a2e",
        accent: "#0ea5e9",
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b"
      }
    }
  },
  plugins: []
};

export default config;
