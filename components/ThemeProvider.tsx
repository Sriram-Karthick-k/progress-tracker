"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const KEY = "theme.v1";

type Ctx = { pref: ThemePref; resolved: Resolved; setPref: (p: ThemePref) => void };
const ThemeContext = createContext<Ctx | null>(null);

function systemResolved(): Resolved {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(pref: ThemePref): Resolved {
  const resolved = pref === "system" ? systemResolved() : pref;
  document.documentElement.dataset.theme = resolved;
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("system");
  const [resolved, setResolved] = useState<Resolved>("dark");

  // hydrate from storage on mount (the no-flash script already set the attribute)
  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as ThemePref | null) ?? "system";
    setPrefState(stored);
    setResolved(apply(stored));
  }, []);

  // when following the system, react to OS theme changes live
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(apply("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const setPref = useCallback((p: ThemePref) => {
    localStorage.setItem(KEY, p);
    setPrefState(p);
    setResolved(apply(p));
  }, []);

  return <ThemeContext.Provider value={{ pref, resolved, setPref }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

// Inline script string injected before paint to avoid a light/dark flash.
export const THEME_NO_FLASH_SCRIPT = `(function(){try{var p=localStorage.getItem('${KEY}')||'system';var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme='dark';}})();`;
