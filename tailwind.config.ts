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
        basalt: {
          950: "#060708",
          900: "#090A0C", // Root canvas
          850: "#0D0F13",
          800: "#12141A", // Channel strips & bays
          750: "#161922", // Elevated panels
          700: "#1E222D", // Borders & frames
          600: "#2B313F",
          500: "#454D5F",
        },
        signal: {
          orange: "#FF4800", // International Safety Orange
          "orange-hover": "#FF5E1E",
          lime: "#D4FF00",   // Laser Kinetic Lime
          "lime-hover": "#DCFF33",
          amber: "#FFB800",
          cyan: "#00F0FF",
        },
        industrial: {
          muted: "#717684",
          light: "#E1E4EA",
          wire: "rgba(255, 255, 255, 0.08)",
          "wire-bold": "rgba(255, 255, 255, 0.16)",
        }
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        tracked: "0.2em",
        "ultra-tracked": "0.3em",
      },
      boxShadow: {
        "hard-sm": "2px 2px 0px rgba(0, 0, 0, 0.8)",
        "hard-md": "4px 4px 0px rgba(0, 0, 0, 0.9)",
        "hard-orange": "0px 8px 0px #992B00, 0px 14px 28px rgba(255, 72, 0, 0.35)",
        "hard-lime": "0px 6px 0px #7EA800, 0px 12px 24px rgba(212, 255, 0, 0.35)",
        "recessed": "inset 0px 2px 4px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        "scan-line": "scanline 2s linear infinite",
        "flap-flip": "flapFlip 0.15s ease-in-out",
        "pulse-subtle": "pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        flapFlip: {
          "0%": { transform: "rotateX(0deg)" },
          "50%": { transform: "rotateX(-90deg)" },
          "100%": { transform: "rotateX(0deg)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        }
      },
    },
  },
  plugins: [],
};

export default config;
