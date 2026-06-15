import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
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
