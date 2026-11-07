import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        // slate / white / black are driven by CSS variables so the whole app
        // flips between light and dark themes centrally (see globals.css).
        white: "rgb(var(--c-white) / <alpha-value>)",
        black: "rgb(var(--c-black) / <alpha-value>)",
        onaccent: "rgb(var(--c-onaccent) / <alpha-value>)", // text/icons on coloured accent chips: white, black on the neon theme
        // the app's accent hue. Same values as Tailwind's indigo / violet, but behind
        // variables so one theme (noir) can swap them for neon. See globals.css.
        indigo: {
          50: "rgb(var(--c-indigo-50) / <alpha-value>)",
          100: "rgb(var(--c-indigo-100) / <alpha-value>)",
          200: "rgb(var(--c-indigo-200) / <alpha-value>)",
          300: "rgb(var(--c-indigo-300) / <alpha-value>)",
          400: "rgb(var(--c-indigo-400) / <alpha-value>)",
          500: "rgb(var(--c-indigo-500) / <alpha-value>)",
          600: "rgb(var(--c-indigo-600) / <alpha-value>)",
          700: "rgb(var(--c-indigo-700) / <alpha-value>)",
          800: "rgb(var(--c-indigo-800) / <alpha-value>)",
          900: "rgb(var(--c-indigo-900) / <alpha-value>)",
          950: "rgb(var(--c-indigo-950) / <alpha-value>)",
        },
        violet: {
          50: "rgb(var(--c-violet-50) / <alpha-value>)",
          100: "rgb(var(--c-violet-100) / <alpha-value>)",
          200: "rgb(var(--c-violet-200) / <alpha-value>)",
          300: "rgb(var(--c-violet-300) / <alpha-value>)",
          400: "rgb(var(--c-violet-400) / <alpha-value>)",
          500: "rgb(var(--c-violet-500) / <alpha-value>)",
          600: "rgb(var(--c-violet-600) / <alpha-value>)",
          700: "rgb(var(--c-violet-700) / <alpha-value>)",
          800: "rgb(var(--c-violet-800) / <alpha-value>)",
          900: "rgb(var(--c-violet-900) / <alpha-value>)",
          950: "rgb(var(--c-violet-950) / <alpha-value>)",
        },
        slate: {
          50: "rgb(var(--c-slate-50) / <alpha-value>)",
          100: "rgb(var(--c-slate-100) / <alpha-value>)",
          200: "rgb(var(--c-slate-200) / <alpha-value>)",
          300: "rgb(var(--c-slate-300) / <alpha-value>)",
          400: "rgb(var(--c-slate-400) / <alpha-value>)",
          500: "rgb(var(--c-slate-500) / <alpha-value>)",
          600: "rgb(var(--c-slate-600) / <alpha-value>)",
          700: "rgb(var(--c-slate-700) / <alpha-value>)",
          800: "rgb(var(--c-slate-800) / <alpha-value>)",
          900: "rgb(var(--c-slate-900) / <alpha-value>)",
          950: "rgb(var(--c-slate-950) / <alpha-value>)",
        },
        status: {
          todo: "#64748b",
          attempted: "#e0a23b",
          learning: "#38bdf8",
          done: "#34d399",
        },
      },
      boxShadow: {
        card: "0 10px 30px -10px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
