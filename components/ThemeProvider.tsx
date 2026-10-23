"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";

type Mode = "light" | "dark";

// Every concrete theme flips the whole app at once via CSS variables on
// [data-theme="..."] (see globals.css) — adding one only needs a CSS block +
// an entry here, no component changes. The mode feeds [data-mode] (light-only
// CSS overrides) and libraries that only know light/dark (Mermaid, Excalidraw,
// React Flow).
export const THEME_MODE = {
  dark: "dark",
  light: "light",
  dracula: "dark",
  nord: "dark",
  solarized: "dark",
  "tokyo-night": "dark",
  "catppuccin-mocha": "dark",
  gruvbox: "dark",
  "one-dark": "dark",
  "rose-pine": "dark",
  monokai: "dark",
  sepia: "light",
  "catppuccin-latte": "light",
  "solarized-light": "light",
  "rose-pine-dawn": "light",
} as const satisfies Record<string, Mode>;
export type ThemeName = keyof typeof THEME_MODE;
export type ThemePref = ThemeName | "system";
const isTheme = (v: string): v is ThemeName => Object.hasOwn(THEME_MODE, v);

const KEY = "theme.v1";

type Ctx = { pref: ThemePref; theme: ThemeName; mode: Mode; setPref: (p: ThemePref) => void };
const ThemeContext = createContext<Ctx | null>(null);

function systemMode(): Mode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(pref: ThemePref): ThemeName {
  const theme = pref !== "system" && isTheme(pref) ? pref : systemMode();
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.mode = THEME_MODE[theme];
  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("system");
  const [theme, setTheme] = useState<ThemeName>("dark");

  // hydrate from storage on mount (the no-flash script already set the attribute)
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    const stored: ThemePref = raw && (raw === "system" || isTheme(raw)) ? raw : "system";
    setPrefState(stored);
    setTheme(apply(stored));
  }, []);

  // when following the system, react to OS theme changes live
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme(apply("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const setPref = useCallback((p: ThemePref) => {
    localStorage.setItem(KEY, p);
    setPrefState(p);
    setTheme(apply(p));
  }, []);

  return (
    <ThemeContext.Provider value={{ pref, theme, mode: THEME_MODE[theme], setPref }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

// Inline script injected before paint to avoid a theme-flip flash. The theme
// map is serialized in from THEME_MODE, so it can't drift out of sync.
export const THEME_NO_FLASH_SCRIPT = `(function(){var d=document.documentElement;try{var M=${JSON.stringify(THEME_MODE)};var p=localStorage.getItem('${KEY}')||'system';var t=Object.prototype.hasOwnProperty.call(M,p)?p:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');d.dataset.theme=t;d.dataset.mode=M[t];}catch(e){d.dataset.theme='dark';d.dataset.mode='dark';}})();`;
