"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CHEATSHEETS } from "@/lib/cheatsheets";
import { CodeBlock } from "@/components/CodeBlock";
import { SqlSheet } from "@/components/SqlSheet";
import { ScrollSpyNav } from "@/components/ScrollSpyNav";
import { PageHeader } from "@/components/ui";

const TAB_COLORS: Record<string, string> = {
  java: "from-orange-500 to-amber-600",
  cpp: "from-sky-500 to-blue-600",
  javascript: "from-yellow-400 to-amber-500",
  sql: "from-indigo-500 to-violet-600",
};

// Tabs: the code-snippet sheets (Java/C++/JS) plus SQL (its own richer view).
const TABS = [...CHEATSHEETS.map((s) => ({ key: s.key, lang: s.lang })), { key: "sql", lang: "SQL" }];

export default function CheatSheetsPage() {
  const [active, setActive] = useState(CHEATSHEETS[0].key);
  const [q, setQ] = useState("");

  // honor a ?tab=sql deep-link (e.g. from search) after mount, without forcing
  // the whole page to render client-only.
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab && TABS.some((t) => t.key === tab)) setActive(tab);
  }, []);

  const isSql = active === "sql";
  const sheet = CHEATSHEETS.find((s) => s.key === active);
  const query = q.trim().toLowerCase();

  const sections = useMemo(() => {
    if (!sheet) return [];
    if (!query) return sheet.sections;
    return sheet.sections
      .map((sec) => ({
        ...sec,
        snippets: sec.snippets.filter(
          (sn) =>
            sn.title.toLowerCase().includes(query) ||
            sn.code.toLowerCase().includes(query) ||
            (sn.note ?? "").toLowerCase().includes(query) ||
            sec.title.toLowerCase().includes(query)
        ),
      }))
      .filter((sec) => sec.snippets.length > 0);
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

      {isSql ? (
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
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                    <span className="h-4 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                    {sec.title}
                  </h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {sec.snippets.map((sn, i) => (
                      <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/40 p-4 shadow-card">
                        <div className="mb-2 text-sm font-semibold text-slate-100">{sn.title}</div>
                        {sn.note && (
                          <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-200/90">
                            {sn.note}
                          </div>
                        )}
                        <CodeBlock code={sn.code} />
                      </div>
                    ))}
                  </div>
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
