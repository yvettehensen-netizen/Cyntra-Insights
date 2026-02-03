/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        burgundy: "#2A0F15",
        burgundyDark: "#1B0A0E",
        executiveBlack: "#0B0B0C",
        softWhite: "#F5F3EE",
        slateGray: "#A0A0A0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        cockpit: "0.35em",
        cockpitWide: "0.45em",
      },
    },
  },
  plugins: [],
};
