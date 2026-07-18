"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, ThemePref } from "@/components/ThemeProvider";

const OPTIONS: { value: ThemePref; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export function ThemeToggle() {
  const { pref, setPref } = useTheme();
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const on = pref === o.value;
        return (
          <button
            key={o.value}
            onClick={() => setPref(o.value)}
            title={o.label}
            aria-label={`${o.label} theme`}
            aria-pressed={on}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
              on ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
