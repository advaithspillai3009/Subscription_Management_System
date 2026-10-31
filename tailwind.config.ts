import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBF5DD",
          light: "#FDF9EC",
          dark: "#F4ECD0",
          card: "#FFFFFF",
        },
        yellow: {
          pale: "#E7E1B1",
          border: "#D8D1A4",
        },
        forest: {
          DEFAULT: "#306D29",
          hover: "#265A20",
          light: "#3E8A35",
          deep: "#0D530E",
          sidebar: "#0D530E",
        },
        border: {
          DEFAULT: "rgba(13, 83, 14, 0.15)",
          subtle: "rgba(13, 83, 14, 0.08)",
          yellow: "#D8D1A4",
          dark: "rgba(13, 83, 14, 0.3)",
        },
        status: {
          active: "#306D29",
          activeBg: "#E3EECD",
          trial: "#B88A1A",
          trialBg: "#F6ECC8",
          pastDue: "#B34A3E",
          pastDueBg: "#F7D8D3",
        },
      },
      fontFamily: {
        serif: ["'DM Serif Display'", "'Playfair Display'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
};

export default config;
