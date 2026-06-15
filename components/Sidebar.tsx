"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Cpu,
  Network,
  MessagesSquare,
  Building2,
  ListChecks,
  Circle,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Boxes,
  Cpu,
  Network,
  MessagesSquare,
  Building2,
  Circle,
};

export type NavItem = { key: string; name: string; icon: string; pct: number };

export function Sidebar({
  roundItems,
  lcPct,
}: {
  roundItems: NavItem[];
  lcPct: number;
}) {
  const path = usePathname();

  const link = (
    href: string,
    label: string,
    Icon: LucideIcon,
    pct: number | null,
    active: boolean
  ) => (
    <Link
      key={href}
      href={href}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "border-white/10 bg-white/[0.06] text-white"
          : "border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {pct !== null && (
        <span
          className={`tabular-nums text-xs ${
            active ? "text-indigo-300" : "text-slate-600"
          }`}
        >
          {pct}%
        </span>
      )}
    </Link>
  );

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-1.5 border-r border-white/10 bg-slate-950/60 p-4 backdrop-blur">
      <div className="mb-4 flex items-center gap-3 px-1">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-extrabold text-white shadow-card">
          IP
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight text-white">
            Interview Prep
          </div>
          <div className="text-xs text-slate-400">Sriram Karthick K</div>
        </div>
      </div>

      {link("/", "Dashboard", LayoutDashboard, null, path === "/")}

      {roundItems.map((r) =>
        link(
          `/rounds/${r.key}`,
          r.name,
          ICONS[r.icon] ?? Circle,
          r.pct,
          path === `/rounds/${r.key}`
        )
      )}

      {link("/problems", "LeetCode", ListChecks, lcPct, path === "/problems")}

      <div className="flex-1" />
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-500">
        Progress saves automatically to{" "}
        <span className="text-slate-300">prisma/dev.db</span>. Back it up by
        copying that file.
      </div>
    </aside>
  );
}
