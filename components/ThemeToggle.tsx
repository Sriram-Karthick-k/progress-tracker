"use client";

import { Monitor, Check } from "lucide-react";
import { useTheme, THEME_MODE, type ThemeName, type ThemePref } from "@/components/ThemeProvider";

// Swatch = each theme's background + accent, duplicated here on purpose
// (globals.css owns the real tokens) — a picker has to preview every option
// before it's applied. Typed as Record<ThemeName,…> so a new theme without a
// swatch is a compile error.
const THEMES: Record<ThemeName, { label: string; bg: string; accent: string }> = {
  dark: { label: "Midnight", bg: "#070a12", accent: "#a5b4fc" },
  dracula: { label: "Dracula", bg: "#282a36", accent: "#bd93f9" },
  nord: { label: "Nord", bg: "#2e3440", accent: "#88c0d0" },
  solarized: { label: "Solarized", bg: "#002b36", accent: "#268bd2" },
  "tokyo-night": { label: "Tokyo Night", bg: "#1a1b26", accent: "#7aa2f7" },
  "catppuccin-mocha": { label: "Catppuccin", bg: "#1e1e2e", accent: "#cba6f7" },
  gruvbox: { label: "Gruvbox", bg: "#282828", accent: "#fabd2f" },
  "one-dark": { label: "One Dark", bg: "#282c34", accent: "#61afef" },
  "rose-pine": { label: "Rosé Pine", bg: "#191724", accent: "#c4a7e7" },
  monokai: { label: "Monokai", bg: "#272822", accent: "#66d9ef" },
  light: { label: "Daylight", bg: "#f7f9fc", accent: "#4338ca" },
  sepia: { label: "Sepia", bg: "#faf4e6", accent: "#b08968" },
  "catppuccin-latte": { label: "Latte", bg: "#eff1f5", accent: "#8839ef" },
  "solarized-light": { label: "Solarized Light", bg: "#fdf6e3", accent: "#268bd2" },
  "rose-pine-dawn": { label: "Rosé Dawn", bg: "#faf4ed", accent: "#907aa9" },
};

const names = Object.keys(THEMES) as ThemeName[];
const GROUPS = [
  { title: "Dark", items: names.filter((n) => THEME_MODE[n] === "dark") },
  { title: "Light", items: names.filter((n) => THEME_MODE[n] === "light") },
];

function Swatch({ name, size = 14 }: { name: ThemeName; size?: number }) {
  const t = THEMES[name];
  return (
    <span
      aria-hidden
      className="shrink-0 rounded-full border border-white/20"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${t.bg} 52%, ${t.accent} 52%)` }}
    />
  );
}

export function ThemeToggle() {
  const { pref, setPref } = useTheme();

  function choose(e: React.MouseEvent, value: ThemePref) {
    setPref(value);
    e.currentTarget.closest("details")?.removeAttribute("open");
  }

  const item = (value: ThemePref, label: string, icon: React.ReactNode) => {
    const on = pref === value;
    return (
      <button
        key={value}
        onClick={(e) => choose(e, value)}
        aria-pressed={on}
        className={`flex items-center gap-2 rounded-lg px-2 py-1 text-left text-xs transition ${
          on ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        {icon}
        <span className="truncate">{label}</span>
        {on && <Check size={12} className="ml-auto shrink-0" />}
      </button>
    );
  };

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white">
        <span className="flex items-center gap-2">
          {pref === "system" ? <Monitor size={14} /> : <Swatch name={pref} />}
          {pref === "system" ? "System" : THEMES[pref].label}
        </span>
        <span className="text-slate-500 transition group-open:rotate-180">▾</span>
      </summary>
      <div className="absolute bottom-full left-0 z-20 mb-1.5 max-h-[70vh] w-full overflow-y-auto rounded-xl border border-white/10 bg-slate-950 p-1.5 shadow-card">
        {item("system", "System (auto)", <Monitor size={13} className="shrink-0" />)}
        {GROUPS.map((g) => (
          <div key={g.title} className="mt-1.5">
            <div className="px-2 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{g.title}</div>
            <div className="grid gap-0.5">
              {g.items.map((n) => item(n, THEMES[n].label, <Swatch name={n} />))}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
