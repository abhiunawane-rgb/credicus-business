import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        credicus: {
          /* Dark grey body text — not pure black */
          ink: "#3D3D3D",
          "ink-secondary": "#525252",
          "ink-muted": "#6B7280",
          /* Logo chevron yellow — primary brand */
          yellow: "#FFD200",
          "yellow-hover": "#E6BD00",
          "yellow-muted": "#FFF8E1",
          "yellow-soft": "#FFFCE8",
          /* Light warm surfaces */
          /* Unified header / footer / sidebar chrome */
          chrome: "#FAFAF8",
          surface: "#FAFAF8",
          "surface-raised": "#ffffff",
          card: "#ffffff",
          /* Warm neutral borders */
          "line-default": "#E0E0DC",
          "line-subtle": "#EDEDEA",
          /* Primary actions = logo yellow (credicus-primary aliases) */
          primary: "#FFD200",
          "primary-hover": "#E6BD00",
          "primary-light": "#FFF4CC",
          "primary-soft": "#FFFBF0",
          /* Semantic */
          success: "#059669",
          "success-light": "#ecfdf5",
          danger: "#dc2626",
          "danger-light": "#fef2f2",
          /* Legacy aliases */
          black: "#3D3D3D",
          gray: "#525252",
          "gray-light": "#6B7280",
          "gray-dark": "#3D3D3D",
          accent: "#FFD200",
          "accent-light": "#FFF4CC",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontSize: {
        caption: ["0.75rem", { lineHeight: "1rem" }],
        label: ["0.875rem", { lineHeight: "1.25rem" }],
        body: ["1rem", { lineHeight: "1.5rem" }],
        title: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        display: ["1.875rem", { lineHeight: "2.25rem", fontWeight: "700" }],
      },
      spacing: {
        touch: "2.75rem",
        "touch-lg": "3rem",
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.625rem",
        lg: "1rem",
        xl: "1.25rem",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(82, 82, 82, 0.06)",
        md: "0 4px 12px rgba(82, 82, 82, 0.08)",
        lg: "0 8px 24px rgba(82, 82, 82, 0.1)",
        brand: "0 4px 20px rgba(255, 210, 0, 0.2)",
        "brand-lg": "0 8px 32px rgba(255, 210, 0, 0.18)",
        glow: "0 0 0 3px rgba(255, 210, 0, 0.25)",
        "glow-lg": "0 0 0 4px rgba(255, 210, 0, 0.3)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 210, 0, 0.2)" },
          "50%": { boxShadow: "0 0 16px 4px rgba(255, 210, 0, 0.15)" },
        },
        "dropdown-in": {
          from: { opacity: "0", transform: "translateY(-8px) scale(0.96)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "scale-in": "scale-in 0.35s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "dropdown-in": "dropdown-in 0.2s ease-out forwards",
        "count-up": "count-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
