"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, MessageSquareText, Youtube, ArrowUpRight } from "lucide-react";
import { PageHeader, Card } from "@/components/ui";
import { StatusToggle } from "@/components/StatusToggle";
import { RevisitFlag } from "@/components/RevisitFlag";
import { NotesBox } from "@/components/NotesBox";
import { useProgress } from "@/components/ProgressProvider";
import { weightedPct, DIFF_COLOR } from "@/lib/status";
import { SQL_PROBLEMS, SQL_CATEGORIES, sqlProblemUrl, SQL_50_PLAN_URL, SqlProblem } from "@/lib/sql-problems";

function Row({ p }: { p: SqlProblem }) {
  const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${p.title} leetcode ${p.lc} sql solution`)}`;
  return (
    <div id={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 scroll-mt-6 border-b border-white/5 px-4 py-3 transition last:border-b-0 hover:bg-white/[0.02]">
      <div className="w-10 shrink-0 text-sm tabular-nums text-slate-500">{p.lc}</div>
      <div className="min-w-0 flex-1">
        <Link href={sqlProblemUrl(p)} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 font-medium text-slate-100 hover:text-indigo-300">
          {p.title}
          <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-300" />
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold" style={{ color: DIFF_COLOR[p.difficulty] }}>{p.difficulty}</span>
          <a href={`${sqlProblemUrl(p)}solutions/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-slate-500 transition hover:text-indigo-300">
            <MessageSquareText size={12} /> Solutions
          </a>
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-slate-500 transition hover:text-rose-300">
            <Youtube size={12} /> Video
          </a>
        </div>
      </div>
      <StatusToggle id={p.id} />
      <RevisitFlag id={p.id} />
      <NotesBox id={p.id} />
    </div>
  );
}

export default function SqlPracticePage() {
  const { get } = useProgress();
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");

  const solved = SQL_PROBLEMS.filter((p) => get(p.id).status === "DONE").length;
  const pct = weightedPct(SQL_PROBLEMS.map((p) => get(p.id).status));

  const groups = useMemo(() => {
    return SQL_CATEGORIES.map((cat) => ({
      cat,
      items: SQL_PROBLEMS.filter((p) => {
        if (p.category !== cat) return false;
        if (difficulty && p.difficulty !== difficulty) return false;
        if (status && get(p.id).status !== status) return false;
        return true;
      }),
    })).filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, status, get]);

  const selectCls =
    "rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 outline-none transition hover:border-white/20 focus:border-indigo-500";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="SQL Practice"
          subtitle={`${solved} of ${SQL_PROBLEMS.length} solved · ${pct}% · LeetCode's Top SQL 50, grouped by topic.`}
        />
        <a href={SQL_50_PLAN_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white">
          Open on LeetCode <ArrowUpRight size={14} />
        </a>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <select className={selectCls} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All difficulties</option>
          {["Easy", "Medium", "Hard"].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {["TODO", "ATTEMPTED", "LEARNING", "DONE"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Link href="/cheatsheets?tab=sql" className="ml-auto text-sm font-medium text-indigo-300 transition hover:text-indigo-200">
          SQL cheat sheet →
        </Link>
      </div>

      <div className="space-y-5">
        {groups.map((g) => (
          <Card key={g.cat} className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
              <h2 className="text-sm font-bold text-white">{g.cat}</h2>
              <span className="text-xs text-slate-500">
                {g.items.filter((p) => get(p.id).status === "DONE").length}/{g.items.length}
              </span>
            </div>
            {g.items.map((p) => (
              <Row key={p.id} p={p} />
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
