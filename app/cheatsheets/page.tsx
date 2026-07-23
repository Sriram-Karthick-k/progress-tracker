"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { CHEATSHEETS } from "@/lib/cheatsheets";
import { CheatTable } from "@/components/CheatTable";
import { SqlSheet } from "@/components/SqlSheet";
import { ScrollSpyNav } from "@/components/ScrollSpyNav";
import { PageHeader } from "@/components/ui";

// React Flow measures the DOM — render the class-tree client-only.
const ClassHierarchy = dynamic(
  () => import("@/components/ClassHierarchy").then((m) => m.ClassHierarchy),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[560px] place-items-center rounded-2xl border border-white/10 bg-slate-950/40 text-sm text-slate-500">
        Loading class tree…
      </div>
    ),
  }
);

const TAB_COLORS: Record<string, string> = {
  java: "from-orange-500 to-amber-600",
  cpp: "from-sky-500 to-blue-600",
  javascript: "from-yellow-400 to-amber-500",
  sql: "from-indigo-500 to-violet-600",
  hierarchy: "from-teal-500 to-emerald-600",
};

// Tabs: the code-snippet sheets (Java/C++/JS), SQL, and the Class Tree diagram.
const TABS = [
  ...CHEATSHEETS.map((s) => ({ key: s.key, lang: s.lang })),
  { key: "sql", lang: "SQL" },
  { key: "hierarchy", lang: "Class Tree" },
];

export default function CheatSheetsPage() {
  const [active, setActive] = useState(CHEATSHEETS[0].key);
  const [q, setQ] = useState("");

  // honor a ?tab=sql deep-link (e.g. from search) after mount, without forcing
  // the whole page to render client-only.
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab && TABS.some((t) => t.key === tab)) setActive(tab);
  }, []);

  // node in the Class Tree -> switch to that language tab and scroll to its section
  const openSection = useCallback((tab: string, section: string) => {
    setActive(tab);
    setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  const isSql = active === "sql";
  const isHierarchy = active === "hierarchy";
  const sheet = CHEATSHEETS.find((s) => s.key === active);
  const query = q.trim().toLowerCase();

  const sections = useMemo(() => {
    if (!sheet) return [];
    if (!query) return sheet.sections;
    return sheet.sections
      .map((sec) => {
        // if the section title matches, keep ALL its rows; else keep matching rows
        const sectionHit = sec.title.toLowerCase().includes(query);
        const methods = sectionHit
          ? sec.methods
          : sec.methods.filter(
              (m) =>
                m.name.toLowerCase().includes(query) ||
                m.desc.toLowerCase().includes(query) ||
                (m.ex ?? "").toLowerCase().includes(query) ||
                (m.out ?? "").toLowerCase().includes(query) ||
                (m.note ?? "").toLowerCase().includes(query)
            );
        return { ...sec, methods };
      })
      .filter((sec) => sec.methods.length > 0);
  }, [sheet, query]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="Cheat Sheets"
        subtitle="One reference for everything: copy-paste syntax for Java, C++, JavaScript, and a full SQL sheet."
      />

      {/* tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                on
                  ? `border-transparent bg-gradient-to-br ${TAB_COLORS[t.key]} text-onaccent shadow-card`
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {t.lang}
            </button>
          );
        })}
        {sheet && (
          <code className="ml-1 hidden rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 sm:block">
            {sheet.hint}
          </code>
        )}
      </div>

      {isHierarchy ? (
        <ClassHierarchy onOpen={openSection} />
      ) : isSql ? (
        <SqlSheet />
      ) : (
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            {/* search */}
            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[240px] flex-1">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={`Search ${sheet?.lang} — e.g. "heap", "sort", "frequency", "substring"…`}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              {sections.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-16 text-center text-sm text-slate-500">
                  No snippets match “{q}”.
                </div>
              )}
              {sections.map((sec) => (
                <section key={sec.id} id={sec.id} className="scroll-mt-6">
                  <h2 className="mb-1.5 flex items-center gap-2 text-lg font-bold text-white">
                    <span className="h-4 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                    {sec.title}
                  </h2>
                  {sec.intro && (
                    <p className="mb-3 pl-3 text-[13px] leading-relaxed text-slate-400">{sec.intro}</p>
                  )}
                  <CheatTable methods={sec.methods} />
                </section>
              ))}
            </div>
          </div>

          {!query && sheet && (
            <ScrollSpyNav
              items={sheet.sections.map((sec) => ({ id: sec.id, label: sec.title }))}
              heading={`${sheet.lang} sections`}
            />
          )}
        </div>
      )}
    </div>
  );
}
