"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ProblemRow } from "./ProblemRow";
import { STATUSES, STATUS_META } from "@/lib/status";
import { PROBLEMS, PATTERN_ORDER } from "@/lib/seed-data";
import { useProgress } from "./ProgressProvider";

export function ProblemsClient() {
  const { get } = useProgress();
  // deep-linkable: /problems?pattern=Two%20Pointers&q=125 (used by search + mastery cards)
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [company, setCompany] = useState(params.get("company") ?? "");
  const [pattern, setPattern] = useState(params.get("pattern") ?? "");
  const [difficulty, setDifficulty] = useState(params.get("difficulty") ?? "");
  const [status, setStatus] = useState(params.get("status") ?? "");

  // keep the spreadsheet's drilling order rather than alphabetical
  const patterns = PATTERN_ORDER;
  const companies = useMemo(
    () =>
      Array.from(
        new Set(
          PROBLEMS.flatMap((p) => p.companies.split(",").map((s) => s.trim()).filter(Boolean))
        )
      ).sort(),
    []
  );

  const filtered = PROBLEMS.filter((p) => {
    // a cross-listed problem shows under either of its patterns
    if (pattern && p.pattern !== pattern && !p.also.includes(pattern)) return false;
    if (difficulty && p.difficulty !== difficulty) return false;
    if (status && get(p.id).status !== status) return false;
    if (company && !p.companies.includes(company)) return false;
    if (q) {
      const s = q.toLowerCase();
      const hay = `${p.title} ${p.lcNumber} ${p.group} ${p.mechanic}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  const selectCls =
    "rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 outline-none transition hover:border-white/20 focus:border-indigo-500";

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or number…"
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
        <select className={selectCls} value={company} onChange={(e) => setCompany(e.target.value)}>
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className={selectCls} value={pattern} onChange={(e) => setPattern(e.target.value)}>
          <option value="">All patterns</option>
          {patterns.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className={selectCls} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All difficulties</option>
          {["Easy", "Medium", "Hard"].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/40 shadow-card">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>{filtered.length} problems</span>
          <span>Confidence · Status · Flag · Notes</span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-slate-500">
            No problems match these filters.
          </div>
        ) : (
          filtered.map((p) => <ProblemRow key={p.id} p={p} />)
        )}
      </div>
    </>
  );
}
