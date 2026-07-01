"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CHEATSHEETS } from "@/lib/cheatsheets";
import { CodeBlock } from "@/components/CodeBlock";
import { PageHeader } from "@/components/ui";

const TAB_COLORS: Record<string, string> = {
  java: "from-orange-500 to-amber-600",
  cpp: "from-sky-500 to-blue-600",
  javascript: "from-yellow-400 to-amber-500",
};

export default function CheatSheetsPage() {
  const [active, setActive] = useState(CHEATSHEETS[0].key);
  const [q, setQ] = useState("");

  const sheet = CHEATSHEETS.find((s) => s.key === active)!;
  const query = q.trim().toLowerCase();

  const sections = useMemo(() => {
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
    <div className="px-8 py-8 lg:px-10">
      <PageHeader
        title="Cheat Sheets"
        subtitle="Copy-paste-ready snippets for built-in libraries & methods. Pick a language, search, copy."
      />

      {/* language tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {CHEATSHEETS.map((s) => {
          const on = s.key === active;
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                on
                  ? `border-transparent bg-gradient-to-br ${TAB_COLORS[s.key]} text-white shadow-card`
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {s.lang}
            </button>
          );
        })}
        <code className="ml-1 hidden rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 sm:block">
          {sheet.hint}
        </code>
      </div>

      {/* search + jump chips */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[240px] flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${sheet.lang} — e.g. "heap", "sort", "frequency", "substring"…`}
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
      </div>

      {!query && (
        <div className="mb-6 flex flex-wrap gap-2">
          {sheet.sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-slate-200"
            >
              {sec.title}
            </a>
          ))}
        </div>
      )}

      {/* sections */}
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
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/40 p-4 shadow-card"
                >
                  <div className="mb-2 text-sm font-semibold text-slate-100">
                    {sn.title}
                  </div>
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
  );
}
