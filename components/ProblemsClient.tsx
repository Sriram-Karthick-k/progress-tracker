"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { ProblemRow } from "./ProblemRow";
import { STATUSES, STATUS_META } from "@/lib/status";
import { PROBLEMS, PATTERN_ORDER } from "@/lib/seed-data";
import { useProgress } from "./ProgressProvider";

type Filters = {
  q: string;
  company: string;
  pattern: string;
  difficulty: string;
  status: string;
};

const FILTER_KEYS: (keyof Filters)[] = ["q", "company", "pattern", "difficulty", "status"];

function fromParams(params: URLSearchParams): Filters {
  return {
    q: params.get("q") ?? "",
    company: params.get("company") ?? "",
    pattern: params.get("pattern") ?? "",
    difficulty: params.get("difficulty") ?? "",
    status: params.get("status") ?? "",
  };
}

export function ProblemsClient() {
  const { get } = useProgress();
  // Filters live in the URL: /problems?pattern=Two%20Pointers&difficulty=Hard&q=125
  // so refresh, back/forward, and shared links all restore the same view.
  const params = useSearchParams();
  const [f, setF] = useState<Filters>(() => fromParams(new URLSearchParams(params)));

  // If the URL changes from outside (deep link click, back/forward), adopt it.
  useEffect(() => {
    const next = fromParams(new URLSearchParams(params));
    setF((prev) => (FILTER_KEYS.every((k) => prev[k] === next[k]) ? prev : next));
  }, [params]);

  function update(patch: Partial<Filters>) {
    setF((prev) => {
      const next = { ...prev, ...patch };
      const sp = new URLSearchParams();
      FILTER_KEYS.forEach((k) => {
        if (next[k]) sp.set(k, next[k]);
      });
      const qs = sp.toString();
      // replaceState: persists without spamming history on every keystroke
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
      return next;
    });
  }

  const hasFilters = FILTER_KEYS.some((k) => f[k] !== "");

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
    if (f.pattern && p.pattern !== f.pattern && !p.also.includes(f.pattern)) return false;
    if (f.difficulty && p.difficulty !== f.difficulty) return false;
    if (f.status && get(p.id).status !== f.status) return false;
    if (f.company && !p.companies.includes(f.company)) return false;
    if (f.q) {
      const s = f.q.toLowerCase();
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
            value={f.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search title or number…"
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
        <select className={selectCls} value={f.company} onChange={(e) => update({ company: e.target.value })}>
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className={selectCls} value={f.pattern} onChange={(e) => update({ pattern: e.target.value })}>
          <option value="">All patterns</option>
          {patterns.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className={selectCls} value={f.difficulty} onChange={(e) => update({ difficulty: e.target.value })}>
          <option value="">All difficulties</option>
          {["Easy", "Medium", "Hard"].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className={selectCls} value={f.status} onChange={(e) => update({ status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => update({ q: "", company: "", pattern: "", difficulty: "", status: "" })}
            className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 transition hover:border-white/20 hover:text-slate-200"
            title="Clear all filters"
          >
            <X size={14} /> Clear
          </button>
        )}
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
