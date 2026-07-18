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
  BookText,
  Bookmark,
  Database,
  Brain,
  PanelLeftClose,
  Search as SearchIcon,
  type LucideIcon,
} from "lucide-react";
import { PROBLEMS } from "@/lib/seed-data";
import { SQL_PROBLEMS } from "@/lib/sql-problems";
import { TOPIC_DOMAINS, resourceDomainByKey, domainTopicIds } from "@/lib/learn";
import { weightedPct } from "@/lib/status";
import { roundStatuses } from "@/lib/progress";
import { useProgress } from "./ProgressProvider";
import { ThemeToggle } from "./ThemeToggle";
import { SyncButton } from "./notebook/SyncButton";
import { NOTES_EDITABLE } from "./notebook/editable";
import { domainIcon } from "./learn/domainIcons";

export function Sidebar({
  mobileOpen = false,
  collapsed = false,
  onNavigate,
  onHide,
}: {
  mobileOpen?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
  onHide?: () => void;
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
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-white/10 bg-slate-950/95 p-4 backdrop-blur transition-transform duration-200 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "lg:hidden" : "lg:sticky lg:top-0 lg:z-auto lg:flex lg:translate-x-0 lg:bg-slate-950/60"}`}
    >
      <div className="mb-4 flex items-center gap-3 px-1">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-extrabold text-onaccent shadow-card">
          IP
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-tight text-white">Interview Prep</div>
          <div className="truncate text-xs text-slate-400">Sriram Karthick K</div>
        </div>
        <button
          onClick={onHide}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          <PanelLeftClose size={16} />
        </button>
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
      {link("/notebook", "Notebook", BookText, null, path === "/notebook" || path.startsWith("/notebook/"))}
      {link("/roadmap", "Roadmaps", GitBranch, null, path === "/roadmap" || path.startsWith("/roadmap/"))}
      {link("/notes", "Bookmarks", Bookmark, null, path === "/notes")}

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
      {NOTES_EDITABLE && (
        <div className="mb-2">
          <div className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Notes</div>
          <SyncButton />
        </div>
      )}
      <div className="mb-2">
        <div className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Theme</div>
        <ThemeToggle />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-500">
        Progress saves in this <span className="text-slate-300">browser</span> (localStorage). Use Export on the dashboard to snapshot it to a file.
      </div>
    </aside>
  );
}
