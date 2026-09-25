import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Design System: Brand & Hierarchy
        brand: {
          primary: "#FF542E",       // Primary Accent (Rocket Coral)
          "primary-hover": "#FF6B47",
          "primary-subtle": "rgba(255, 84, 46, 0.12)",
          "primary-border": "rgba(255, 84, 46, 0.28)",
          secondary: "#6366F1",     // Secondary Accent (Electric Indigo)
          "secondary-hover": "#4F46E5",
          "secondary-subtle": "rgba(99, 102, 241, 0.12)",
          "secondary-border": "rgba(99, 102, 241, 0.28)",
          // Neutral Backgrounds & Visual Depth
          canvas: "#090D16",        // Base dark background
          surface: "#0E1424",       // Surface 1 (Cards, panels)
          "surface-elevated": "#131B30", // Surface 2 (Input fields, nested containers)
          "surface-overlay": "#1A2440",  // Surface 3 (Hover, elevated popovers)
        },
        // Neutral Typography (WCAG AA & AAA compliant)
        content: {
          primary: "#F8FAFC",       // Slate 50 (AAA contrast 18:1)
          secondary: "#94A3B8",     // Slate 400 (AA contrast 7.6:1)
          muted: "#64748B",         // Slate 500 (AA contrast 4.6:1)
        },
        // Semantic Status Colors
        semantic: {
          success: "#10B981",
          "success-subtle": "rgba(16, 185, 129, 0.12)",
          "success-border": "rgba(16, 185, 129, 0.25)",
          "success-text": "#34D399",
          error: "#F43F5E",
          "error-subtle": "rgba(244, 63, 94, 0.12)",
          "error-border": "rgba(244, 63, 94, 0.25)",
          "error-text": "#FB7185",
          warning: "#F59E0B",
          "warning-subtle": "rgba(245, 158, 11, 0.12)",
          "warning-border": "rgba(245, 158, 11, 0.25)",
          "warning-text": "#FBBF24",
          info: "#0EA5E9",
          "info-subtle": "rgba(14, 165, 233, 0.12)",
          "info-border": "rgba(14, 165, 233, 0.25)",
          "info-text": "#38BDF8",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "Space Grotesk", "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
};
export default config;
