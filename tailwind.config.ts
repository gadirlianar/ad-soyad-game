import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        apple: {
          blue: "#007AFF",
          "blue-hover": "#0062CC",
          mint: "#34C759",
          red: "#FF3B30",
          orange: "#FF9500",
          yellow: "#FFCC00",
          purple: "#AF52DE",
        },
        surface: {
          light: "#FFFFFF",
          "light-secondary": "#F5F5F7",
          "light-tertiary": "#E8E8ED",
          dark: "#000000",
          "dark-secondary": "#161618",
          "dark-tertiary": "#242426",
          "dark-elevated": "#2C2C2E",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "var(--font-inter)",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "ui-monospace",
          "Menlo",
          "Monaco",
          "monospace",
        ],
      },
      boxShadow: {
        "apple-card": "0 8px 30px rgba(0, 0, 0, 0.04)",
        "apple-card-dark": "0 12px 40px rgba(0, 0, 0, 0.4)",
        "apple-glow": "0 0 24px rgba(0, 122, 255, 0.25)",
        "apple-pill": "0 4px 16px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        "apple-sm": "10px",
        "apple-md": "14px",
        "apple-lg": "20px",
        "apple-xl": "28px",
      },
    },
  },
  plugins: [],
};

export default config;
