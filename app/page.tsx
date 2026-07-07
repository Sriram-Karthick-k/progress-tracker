"use client";

import { useRef } from "react";
import Link from "next/link";
import { Flag, ChevronRight, Download, Upload } from "lucide-react";
import { ROUNDS, TOPICS, PROBLEMS, topicsForRound } from "@/lib/seed-data";
import { weightedPct, statusCounts, STATUS_META, STATUSES, DIFF_COLOR } from "@/lib/status";
import { Card, SectionTitle, PageHeader } from "@/components/ui";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusDonut, HorizontalBars } from "@/components/Charts";
import { useProgress } from "@/components/ProgressProvider";
import { exportJson } from "@/lib/progress";

export default function Dashboard() {
  const { get, map, replaceAll } = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);

  const topicStatuses = TOPICS.map((t) => get(t.id).status);
  const problemStatuses = PROBLEMS.map((p) => get(p.id).status);
  const allStatuses = [...topicStatuses, ...problemStatuses];
  const total = allStatuses.length;

  const overall = weightedPct(allStatuses);
  const counts = statusCounts(allStatuses);
  const solved = PROBLEMS.filter((p) => get(p.id).status === "DONE").length;

  const diffData = ["Easy", "Medium", "Hard"].map((d) => {
    const list = PROBLEMS.filter((p) => p.difficulty === d);
    const done = list.filter((p) => get(p.id).status === "DONE").length;
    return { name: d, pct: list.length ? Math.round((100 * done) / list.length) : 0, label: `${done}/${list.length}`, color: DIFF_COLOR[d] };
  });

  const comp: Record<string, { done: number; total: number }> = {};
  PROBLEMS.forEach((p) => {
    p.companies.split(",").map((s) => s.trim()).filter(Boolean).forEach((c) => {
      comp[c] = comp[c] ?? { done: 0, total: 0 };
      comp[c].total++;
      if (get(p.id).status === "DONE") comp[c].done++;
    });
  });
  const compData = Object.entries(comp)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, v]) => ({ name, pct: Math.round((100 * v.done) / v.total), label: `${v.done}/${v.total}`, color: "#6366f1" }));

  const revisit: { kind: string; title: string; sub: string }[] = [];
  TOPICS.filter((t) => get(t.id).revisit).forEach((t) =>
    revisit.push({ kind: t.roundKey.toUpperCase(), title: t.name, sub: t.category })
  );
  PROBLEMS.filter((p) => get(p.id).revisit).forEach((p) =>
    revisit.push({ kind: "LC", title: `${p.lcNumber}. ${p.title}`, sub: p.pattern })
  );

  const donutData = STATUSES.map((s) => ({ name: STATUS_META[s].label, value: counts[s], color: STATUS_META[s].color }));

  const stats = [
    { label: "Overall", value: `${overall}%`, sub: `${counts.DONE} of ${total} items done`, accent: "text-white" },
    { label: "Topics", value: TOPICS.length, sub: `across ${ROUNDS.length} rounds`, accent: "text-white" },
    { label: "LeetCode", value: `${solved}/${PROBLEMS.length}`, sub: `${weightedPct(problemStatuses)}% weighted`, accent: "text-white" },
    { label: "Needs revisit", value: revisit.length, sub: "topics + problems", accent: "text-orange-400" },
  ];

  function doExport() {
    const blob = new Blob([exportJson(map)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `interview-prep-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }
  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        replaceAll(JSON.parse(String(rd.result)));
      } catch {
        alert("Invalid backup file.");
      }
    };
    rd.readAsText(f);
    e.target.value = "";
  }

  return (
    <div className="px-8 py-8 lg:px-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="Dashboard"
          subtitle={`Overall progress across ${ROUNDS.length} interview rounds + ${PROBLEMS.length} LeetCode problems.`}
        />
        <div className="flex gap-2">
          <button onClick={doExport} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white">
            <Download size={14} /> Export
          </button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white">
            <Upload size={14} /> Import
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={onImport} className="hidden" />
        </div>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className={`mt-2 text-3xl font-extrabold tabular-nums ${s.accent}`}>{s.value}</div>
            <div className="mt-1 text-xs text-slate-500">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>Progress by round</SectionTitle>
          <div className="space-y-1">
            {ROUNDS.map((r) => {
              const s = topicsForRound(r.key).map((t) => get(t.id).status);
              if (r.key === "dsa") s.push(...problemStatuses);
              return (
                <Link key={r.key} href={`/rounds/${r.key}`} className="group flex items-center gap-4 rounded-lg px-2 py-2.5 transition hover:bg-white/[0.03]">
                  <div className="w-44 shrink-0 text-sm font-semibold text-slate-200 group-hover:text-white">{r.name}</div>
                  <ProgressBar counts={statusCounts(s)} total={s.length} />
                  <div className="w-12 shrink-0 text-right text-sm tabular-nums text-slate-400">{weightedPct(s)}%</div>
                  <ChevronRight size={16} className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle>Status breakdown</SectionTitle>
          <div className="flex items-center gap-5">
            <StatusDonut data={donutData} centerLabel={`${overall}%`} centerSub="Complete" />
            <div className="flex flex-col gap-2.5">
              {STATUSES.map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded" style={{ background: STATUS_META[s].color }} />
                  <span className="text-slate-300">{STATUS_META[s].label}</span>
                  <span className="ml-2 tabular-nums text-slate-500">{counts[s]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionTitle>
            Company readiness <span className="font-normal text-slate-600">· % LeetCode solved</span>
          </SectionTitle>
          <HorizontalBars data={compData} />
        </Card>

        <Card className="p-5">
          <SectionTitle>LeetCode by difficulty</SectionTitle>
          <HorizontalBars data={diffData} />
        </Card>

        <Card className="p-5 lg:col-span-3">
          <SectionTitle>Needs revisit</SectionTitle>
          {revisit.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nothing flagged yet — hit the <Flag size={13} className="inline -translate-y-0.5 text-orange-400" /> flag on any item to circle back later.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {revisit.map((x, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                  <span className="shrink-0 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-300">{x.kind}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{x.title}</span>
                  <span className="shrink-0 truncate text-xs text-slate-500">{x.sub}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
