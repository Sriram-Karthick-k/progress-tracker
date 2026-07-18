"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  BookOpen,
  MessagesSquare,
  GitBranch,
  Boxes,
  CalendarCheck,
  NotebookPen,
  Database,
  Brain,
  Search as SearchIcon,
  type LucideIcon,
} from "lucide-react";
import { PROBLEMS } from "@/lib/seed-data";
import { SQL_PROBLEMS } from "@/lib/sql-problems";
import { TOPIC_DOMAINS, resourceDomainByKey, domainTopicIds } from "@/lib/learn";
import { weightedPct } from "@/lib/status";
import { roundStatuses, STORAGE_MODE } from "@/lib/progress";
import { useProgress } from "./ProgressProvider";
import { ThemeToggle } from "./ThemeToggle";
import { domainIcon } from "./learn/domainIcons";

export function Sidebar({
  mobileOpen = false,
  onNavigate,
}: {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}) {
  const path = usePathname();
  const { get, ready } = useProgress();

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
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "border-white/10 bg-white/[0.06] text-white"
          : "border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {pct !== null && ready && (
        <span className={`tabular-nums text-xs ${active ? "text-indigo-300" : "text-slate-600"}`}>
          {pct}%
        </span>
      )}
    </Link>
  );

  const heading = (text: string) => (
    <div className="mt-3 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">{text}</div>
  );

  const lcPct = weightedPct(PROBLEMS.map((p) => get(p.id).status));
  const sqlPct = weightedPct(SQL_PROBLEMS.map((p) => get(p.id).status));
  const dsAlgo = resourceDomainByKey("ds-algo");
  const dsAlgoPct = dsAlgo ? weightedPct(domainTopicIds(dsAlgo).map((id) => get(id).status)) : null;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-white/10 bg-slate-950/95 p-4 backdrop-blur transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 lg:bg-slate-950/60 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="mb-4 flex items-center gap-3 px-1">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-extrabold text-onaccent shadow-card">
          IP
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight text-white">Interview Prep</div>
          <div className="text-xs text-slate-400">Sriram Karthick K</div>
        </div>
      </div>

      <button
        onClick={() => {
          onNavigate?.();
          window.dispatchEvent(new Event("open-cmdk"));
        }}
        className="mb-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-500 transition hover:border-white/20 hover:text-slate-300"
      >
        <SearchIcon size={16} className="shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      {link("/", "Dashboard", LayoutDashboard, null, path === "/")}
      {link("/today", "Study Today", CalendarCheck, null, path === "/today")}
      {link("/flashcards", "Flashcards", Brain, null, path === "/flashcards" || path.startsWith("/flashcards/"))}
      {link("/roadmap", "Roadmaps", GitBranch, null, path === "/roadmap" || path.startsWith("/roadmap/"))}
      {link("/notes", "Notes & Bookmarks", NotebookPen, null, path === "/notes")}

      {heading("DSA")}
      {link("/problems", "Problems", ListChecks, lcPct, path === "/problems")}
      {link("/topics/ds-algo", "Data Structures", Boxes, dsAlgoPct, path === "/topics/ds-algo")}

      {heading("Topics")}
      {TOPIC_DOMAINS.map((d) =>
        link(
          `/topics/${d.key}`,
          d.name,
          domainIcon(d.icon),
          weightedPct(domainTopicIds(d).map((id) => get(id).status)),
          path === `/topics/${d.key}`
        )
      )}

      {heading("Interview")}
      {link("/rounds/behavioral", "Behavioral", MessagesSquare, weightedPct(roundStatuses("behavioral", get)), path === "/rounds/behavioral")}

      {heading("Reference")}
      {link("/sql-practice", "SQL Practice", Database, sqlPct, path === "/sql-practice")}
      {link("/cheatsheets", "Cheat Sheets", BookOpen, null, path === "/cheatsheets")}

      <div className="flex-1" />
      <div className="mb-2">
        <div className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Theme</div>
        <ThemeToggle />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-500">
        {STORAGE_MODE === "db" ? (
          <>Progress saves to <span className="text-slate-300">SQLite (prisma/dev.db)</span>.</>
        ) : (
          <>Progress saves in this <span className="text-slate-300">browser</span> (localStorage).</>
        )}
      </div>
    </aside>
  );
}
