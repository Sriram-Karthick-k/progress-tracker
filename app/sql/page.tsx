"use client";

import { useMemo, useState } from "react";
import { Search, Database, ArrowRight } from "lucide-react";
import {
  CONCEPTS,
  SCHEMA_DDL,
  DATA_FACTS,
  EXECUTION_ORDER,
  KEYWORDS,
  GOTCHAS,
} from "@/lib/sqlsheet";
import { CodeBlock } from "@/components/CodeBlock";
import { ResultTable } from "@/components/ResultTable";
import { PageHeader, Card } from "@/components/ui";

export default function SqlPage() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const concepts = useMemo(() => {
    if (!query) return CONCEPTS;
    return CONCEPTS.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.meaning.toLowerCase().includes(query) ||
        (c.note ?? "").toLowerCase().includes(query) ||
        c.examples.some((e) => e.query.toLowerCase().includes(query))
    );
  }, [query]);

  return (
    <div className="px-8 py-8 lg:px-10">
      <PageHeader
        title="SQL — PostgreSQL Cheat Sheet"
        subtitle="Every keyword with its meaning, a runnable query, and the real result — against one practice schema."
      />

      {/* schema */}
      <Card className="mb-6 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <Database size={16} className="text-indigo-300" /> Practice schema
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <CodeBlock code={SCHEMA_DDL} />
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Data facts used in examples
            </div>
            <ul className="space-y-1.5 text-sm text-slate-300">
              {DATA_FACTS.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* search */}
      <div className="mb-5">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search SQL — e.g. "join", "null", "rank", "group by", "exists"…'
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* jump chips */}
      {!query && (
        <div className="mb-6 flex flex-wrap gap-2">
          {CONCEPTS.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-slate-200"
            >
              <span className="text-slate-600">{c.n}.</span>{" "}
              {c.title.split(" — ")[0].split(" (")[0]}
            </a>
          ))}
        </div>
      )}

      {/* concepts */}
      <div className="space-y-4">
        {concepts.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-16 text-center text-sm text-slate-500">
            No concepts match “{q}”.
          </div>
        )}
        {concepts.map((c) => (
          <Card key={c.id} id={c.id} className="scroll-mt-6 p-5">
            <div className="mb-2 flex items-baseline gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-xs font-bold text-indigo-300">
                {c.n}
              </span>
              <h2 className="text-lg font-bold text-white">{c.title}</h2>
            </div>
            <p className="mb-3 text-sm text-slate-300">{c.meaning}</p>
            {c.note && (
              <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-200/90">
                ⚠ {c.note}
              </div>
            )}
            <div className="space-y-4">
              {c.examples.map((ex, i) => (
                <div key={i}>
                  {ex.caption && (
                    <div className="mb-1.5 text-xs font-semibold text-slate-400">
                      {ex.caption}
                    </div>
                  )}
                  <div className="grid gap-3 lg:grid-cols-2">
                    <CodeBlock code={ex.query} />
                    {ex.result && <ResultTable result={ex.result} />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* reference blocks */}
      {!query && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="p-5" id="execution-order">
            <div className="mb-4 text-sm font-bold text-white">
              Execution order (why WHERE can't see aggregates)
            </div>
            <div className="space-y-2">
              {EXECUTION_ORDER.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/[0.04] text-xs font-bold text-slate-400">
                    {i + 1}
                  </span>
                  <code className="font-mono font-semibold text-indigo-300">{s.step}</code>
                  <ArrowRight size={13} className="text-slate-600" />
                  <span className="text-slate-400">{s.detail}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5" id="gotchas">
            <div className="mb-4 text-sm font-bold text-white">
              Top gotchas (where points are lost)
            </div>
            <ol className="space-y-2.5 text-sm text-slate-300">
              {GOTCHAS.map((g, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-500/15 text-xs font-bold text-rose-300">
                    {i + 1}
                  </span>
                  {g}
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-5 lg:col-span-2" id="keywords">
            <div className="mb-4 text-sm font-bold text-white">Keyword cheat-sheet</div>
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="border-b border-white/10 px-3 py-2 text-left font-semibold text-slate-300">
                      Keyword
                    </th>
                    <th className="border-b border-white/10 px-3 py-2 text-left font-semibold text-slate-300">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {KEYWORDS.map(([k, p], i) => (
                    <tr key={i} className="odd:bg-white/[0.015]">
                      <td className="whitespace-nowrap border-b border-white/5 px-3 py-1.5">
                        <code className="font-mono text-indigo-300">{k}</code>
                      </td>
                      <td className="border-b border-white/5 px-3 py-1.5 text-slate-400">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
