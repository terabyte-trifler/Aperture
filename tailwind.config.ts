import type { Config } from "tailwindcss";

/**
 * APERTURE design system.
 *
 * The scale, radii and rhythm here are measured from the HomeQuest
 * reference rather than guessed: 1320px container, 30px gutter, 120px
 * section padding, 24px rounded section tops, 80/48/32/24 display scale
 * with negative tracking that tightens as the type grows.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "hsl(var(--ink))",
          muted: "hsl(var(--ink-muted))",
          faint: "hsl(var(--ink-faint))",
          inverse: "hsl(var(--ink-inverse))",
        },
        canvas: "hsl(var(--canvas))",
        sand: {
          DEFAULT: "hsl(var(--sand))",
          deep: "hsl(var(--sand-deep))",
        },
        forest: {
          DEFAULT: "hsl(var(--forest))",
          deep: "hsl(var(--forest-deep))",
          soft: "hsl(var(--forest-soft))",
        },
        lime: {
          DEFAULT: "hsl(var(--lime))",
          deep: "hsl(var(--lime-deep))",
        },
        line: {
          DEFAULT: "hsl(var(--line))",
          strong: "hsl(var(--line-strong))",
        },
        verified: {
          DEFAULT: "hsl(var(--verified))",
          soft: "hsl(var(--verified-soft))",
          edge: "hsl(var(--verified-edge))",
        },
        pending: {
          DEFAULT: "hsl(var(--pending))",
          soft: "hsl(var(--pending-soft))",
        },
        flag: {
          DEFAULT: "hsl(var(--flag))",
          soft: "hsl(var(--flag-soft))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        // Reference measures: h1 80/92/-3, h2 48/60/-2.5, body 16/1.6
        xs: ["0.75rem", { lineHeight: "1.45" }],
        sm: ["0.875rem", { lineHeight: "1.55" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.375rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "3xl": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.03em" }],
        "4xl": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.035em" }],
        "5xl": ["3rem", { lineHeight: "1.25", letterSpacing: "-0.045em" }],
        "6xl": ["4rem", { lineHeight: "1.1", letterSpacing: "-0.05em" }],
        "7xl": ["5rem", { lineHeight: "1.15", letterSpacing: "-0.055em" }],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },
      maxWidth: {
        shell: "1320px",
        measure: "42rem",
      },
      spacing: {
        gutter: "30px",
        section: "120px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
