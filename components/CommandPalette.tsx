"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, ExternalLink } from "lucide-react";
import { PROBLEMS, PATTERN_ORDER } from "@/lib/seed-data";
import { RESOURCE_DOMAINS, topicProgressId } from "@/lib/learn";
import { ROADMAPS } from "@/lib/roadmap";
import { CHEATSHEETS } from "@/lib/cheatsheets";
import { CONCEPTS } from "@/lib/sqlsheet";
import { SQL_PROBLEMS } from "@/lib/sql-problems";

type Hit = { group: string; title: string; sub: string; href: string; external?: boolean };

// Static search index, built once per session. Indexes everything: pages,
// roadmaps, topic hubs, every topic, every external resource link, patterns,
// problems, behavioral, cheat-sheet sections and SQL concepts.
function buildIndex(): Hit[] {
  const hits: Hit[] = [];

  // top-level pages
  [
    { title: "Dashboard", href: "/" },
    { title: "Study Today", href: "/today" },
    { title: "Activity Log", href: "/activity" },
    { title: "Flashcards", href: "/flashcards" },
    { title: "Notebook", href: "/notebook" },
    { title: "Roadmaps", href: "/roadmap" },
    { title: "Bookmarks", href: "/notes" },
    { title: "LeetCode Problems", href: "/problems" },
    { title: "SQL Practice", href: "/sql-practice" },
    { title: "Topics", href: "/topics" },
    { title: "Cheat Sheets", href: "/cheatsheets" },
    { title: "Class Tree (collections hierarchy)", href: "/cheatsheets?tab=hierarchy" },
  ].forEach((p) => hits.push({ group: "Pages", title: p.title, sub: "go to page", href: p.href }));

  ROADMAPS.forEach((r) =>
    hits.push({ group: "Roadmaps", title: `${r.name} roadmap`, sub: "guided path", href: `/roadmap/${r.key}` })
  );

  RESOURCE_DOMAINS.forEach((d) => {
    hits.push({ group: "Topics", title: d.name, sub: "topic hub", href: `/topics/${d.key}` });
    d.sections.forEach((s) =>
      s.topics.forEach((t) => {
        const anchor = `/topics/${d.key}#${topicProgressId(d.key, t.id)}`;
        hits.push({ group: "Topics", title: t.title, sub: `${d.name} · ${s.title}`, href: anchor });
        // every individual resource link is searchable by label or source
        t.resources.forEach((r) =>
          hits.push({
            group: "Resources",
            title: r.label,
            sub: `${r.by ? r.by + " · " : ""}${d.name}`,
            href: r.url,
            external: true,
          })
        );
      })
    );
  });

  PATTERN_ORDER.forEach((p) =>
    hits.push({ group: "Patterns", title: p, sub: "filter problems", href: `/problems?pattern=${encodeURIComponent(p)}` })
  );
  PROBLEMS.forEach((p) =>
    hits.push({
      group: "Problems",
      title: `${p.lcNumber}. ${p.title}`,
      sub: `${p.difficulty} · ${p.pattern}`,
      href: `/problems?q=${p.lcNumber}`,
    })
  );
  SQL_PROBLEMS.forEach((p) =>
    hits.push({ group: "SQL Practice", title: `${p.lc}. ${p.title}`, sub: `${p.difficulty} · ${p.category}`, href: `/sql-practice#${p.id}` })
  );
  hits.push({ group: "Interview", title: "Behavioral", sub: "tracker", href: "/rounds/behavioral" });
  CHEATSHEETS.forEach((sheet) =>
    sheet.sections.forEach((s) =>
      hits.push({
        group: "Cheat sheets",
        title: `${sheet.lang}: ${s.title}`,
        sub: "syntax reference",
        href: `/cheatsheets#${s.id}`,
      })
    )
  );
  CONCEPTS.forEach((c) =>
    hits.push({ group: "SQL", title: c.title, sub: "SQL cheat sheet", href: `/cheatsheets?tab=sql#${c.id}` })
  );
  return hits;
}

function score(hit: Hit, q: string): number {
  const t = hit.title.toLowerCase();
  const s = hit.sub.toLowerCase();
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  if (s.includes(q)) return 1;
  return 0;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(buildIndex, []);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setSel(0);
  }, []);

  // Cmd/Ctrl+K to open; also a custom event so a sidebar button can trigger it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        close();
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cmdk", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmdk", onOpen);
    };
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return index
      .map((h) => ({ h, sc: score(h, query) }))
      .filter((x) => x.sc > 0)
      .sort((a, b) => b.sc - a.sc)
      .slice(0, 12)
      .map((x) => x.h);
  }, [q, index]);

  function go(hit: Hit) {
    close();
    if (hit.external || hit.href.startsWith("http")) {
      window.open(hit.href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(hit.href);
    // hash links need a manual nudge if already on the page
    const hash = hit.href.split("#")[1];
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 300);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter" && results[sel]) {
      go(results[sel]);
    }
  }

  if (!open) return null;

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search size={17} className="shrink-0 text-slate-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search everything — topics, resources, problems, patterns, roadmaps, SQL…"
            className="w-full bg-transparent py-3.5 text-[15px] text-slate-100 outline-none placeholder:text-slate-600"
          />
          <kbd className="shrink-0 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-slate-500">
            esc
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim() === "" ? (
            <p className="px-3 py-6 text-center text-sm text-slate-600">
              Type to search across {index.length.toLocaleString()} items.
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-600">No matches.</p>
          ) : (
            results.map((r, i) => {
              const header = r.group !== lastGroup ? r.group : null;
              lastGroup = r.group;
              return (
                <div key={`${r.href}-${i}`}>
                  {header && (
                    <div className="px-3 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {header}
                    </div>
                  )}
                  <button
                    onClick={() => go(r)}
                    onMouseEnter={() => setSel(i)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                      i === sel ? "bg-indigo-500/15 text-white" : "text-slate-300"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.title}</span>
                    <span className="shrink-0 text-xs text-slate-500">{r.sub}</span>
                    {r.external ? (
                      <ExternalLink size={12} className="shrink-0 text-slate-500" />
                    ) : (
                      i === sel && <CornerDownLeft size={13} className="shrink-0 text-indigo-400" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
