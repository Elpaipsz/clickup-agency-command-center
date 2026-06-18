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
      "colors": {
        "primary": "#B47CFD", // Vivid Lavender
        "on-primary": "var(--bg-main)", // Inverted white/dark
        "secondary": "#B47CFD", // Vivid Lavender
        "on-secondary": "var(--bg-main)",
        "background": "var(--bg-main)",
        "on-background": "var(--text-primary)",
        "surface": "var(--bg-card)",
        "on-surface": "var(--text-primary)",
        "on-surface-variant": "var(--text-secondary)",
        "outline": "#B47CFD",
        "outline-variant": "var(--border-glass)",
        "surface-container-lowest": "var(--bg-main)",
        "surface-container-low": "var(--bg-surface)",
        "surface-container": "var(--bg-card)",
        "surface-container-high": "var(--bg-card-hover)",
        "surface-container-highest": "var(--bg-card-hover)",
        "surface-bright": "var(--bg-card)",
        "primary-fixed": "#B47CFD",
        "on-primary-fixed": "var(--bg-main)",
        "secondary-fixed": "#B47CFD",
        "on-secondary-fixed": "var(--bg-main)",
        "error": "#F85149",
        "on-error": "#FFFFFF",
        "error-container": "rgba(248, 81, 73, 0.15)",
        "on-error-container": "#F85149",
      },
      "borderRadius": {
        "DEFAULT": "12px",
        "lg": "16px",
        "xl": "24px",
        "full": "9999px"
      },
      "spacing": {
        "sm": "8px",
        "xs": "4px",
        "container-max": "1440px",
        "xl": "32px",
        "lg": "24px",
        "md": "16px",
        "margin-mobile": "16px",
        "2xl": "48px",
        "base": "4px",
        "3xl": "64px",
        "gutter": "24px"
      },
      "fontFamily": {
        "label-md": ["var(--font-figtree)", "Figtree", "sans-serif"],
        "body-sm": ["var(--font-figtree)", "Figtree", "sans-serif"],
        "headline-md": ["Adam", "var(--font-figtree)", "sans-serif"],
        "headline-lg": ["Aire Pro", "var(--font-figtree)", "sans-serif"],
        "display-lg": ["Aire Pro", "var(--font-figtree)", "sans-serif"],
        "mono-data": ["Fira Code", "monospace"],
        "headline-lg-mobile": ["Aire Pro", "var(--font-figtree)", "sans-serif"],
        "body-lg": ["var(--font-figtree)", "Figtree", "sans-serif"],
        "body-md": ["var(--font-figtree)", "Figtree", "sans-serif"]
      },
      "fontSize": {
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "mono-data": ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
      }
    },
  },
  plugins: [],
};
export default config;
