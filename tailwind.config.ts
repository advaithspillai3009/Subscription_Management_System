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
        studio: {
          bg: "#F8FAF9",
          card: "#FFFFFF",
          subtle: "#F3F5F4",
          elevated: "#FFFFFF",
          border: "#E1E6E3",
          borderLight: "#ECEFEA",
          teal: "#2F7D72",
          tealHover: "#26675E",
          tealMuted: "rgba(47, 125, 114, 0.08)",
          tealLight: "rgba(47, 125, 114, 0.12)",
          textPrimary: "#111819",
          textSecondary: "#5D6B6C",
          coral: "#D95C68",
          amber: "#C98C2E",
        },
        surface: {
          DEFAULT: "#F8FAF9",
          dim: "#D9DAD9",
          bright: "#F8FAF9",
          lowest: "#FFFFFF",
          low: "#F3F4F3",
          card: "#FFFFFF",
          muted: "#F3F5F4",
          container: "#EDEEED",
          high: "#E7E8E7",
          highest: "#E1E3E2",
          highlight: "#E8F2EF",
        },
        "on-surface": {
          DEFAULT: "#111819",
          variant: "#5D6B6C",
        },
        primary: {
          DEFAULT: "#12191A",
          foreground: "#FFFFFF",
          action: "#12191A",
          teal: "#2F7D72",
          dark: "#23635A",
        },
        secondary: {
          DEFAULT: "#2F7D72",
          foreground: "#FFFFFF",
          container: "#A6F1E2",
          "on-container": "#217064",
          fixed: "#A6F1E2",
          "on-fixed": "#00201B",
          accent: "#C85A65",
        },
        outline: {
          DEFAULT: "#737878",
          variant: "#E1E6E3",
          subtle: "#E5EAE7",
        },
        error: {
          DEFAULT: "#BA1A1A",
          container: "#FFDAD6",
          "on-container": "#93000A",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "'Plus Jakarta Sans'", "Geist", "sans-serif"],
        display: ["var(--font-space)", "'Space Grotesk'", "sans-serif"],
        mono: ["var(--font-mono)", "'JetBrains Mono'", "'Space Mono'", "monospace"],
      },
      boxShadow: {
        "card-subtle": "0 1px 3px rgba(17, 24, 25, 0.03), 0 1px 2px rgba(17, 24, 25, 0.02)",
        "cassette-depth": "0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 8px 16px -6px rgba(0, 0, 0, 0.08)",
        "2xs": "0 1px 2px rgba(0,0,0,0.03)",
        "xs": "0 1px 2px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
};

export default config;
