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
          black: "#000000",
          gray: "#80848E",
          "gray-light": "#A8ACB4",
          "gray-dark": "#4A4D54",
          yellow: "#FFD200",
          "yellow-hover": "#E6BD00",
          "yellow-muted": "#FFF3B0",
          surface: "#0A0A0A",
          card: "#111111",
          border: "#2A2A2A",
        },
      },
      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        brand: "0 4px 24px rgba(0, 0, 0, 0.25)",
        "brand-lg": "0 8px 40px rgba(0, 0, 0, 0.35)",
        glow: "0 0 24px rgba(255, 210, 0, 0.25)",
        "glow-lg": "0 0 40px rgba(255, 210, 0, 0.35)",
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
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 210, 0, 0.3)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(255, 210, 0, 0.15)" },
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
