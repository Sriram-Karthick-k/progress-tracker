"use client";

import { useRef } from "react";
import Link from "next/link";
import { Flag, ChevronRight, Download, Upload, CalendarCheck, ArrowRight } from "lucide-react";
import { PROBLEMS, TOPICS, topicsForRound } from "@/lib/seed-data";
import { SQL_PROBLEMS } from "@/lib/sql-problems";
import { RESOURCE_DOMAINS, allTopics, topicProgressId } from "@/lib/learn";
import { weightedPct, statusCounts, STATUS_META, STATUSES, DIFF_COLOR } from "@/lib/status";
import { Card, SectionTitle, PageHeader } from "@/components/ui";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusDonut, HorizontalBars } from "@/components/Charts";
import { Heatmap } from "@/components/Heatmap";
import { useProgress } from "@/components/ProgressProvider";
import { exportJson } from "@/lib/progress";
import { patternMastery, dueForReview } from "@/lib/study";
import { domainIcon } from "@/components/learn/domainIcons";

export default function Dashboard() {
  const { get, map, replaceAll } = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);

  const problemStatuses = PROBLEMS.map((p) => get(p.id).status);
  const sqlStatuses = SQL_PROBLEMS.map((p) => get(p.id).status);
  const topicStatuses = RESOURCE_DOMAINS.flatMap((d) =>
    allTopics(d).map((t) => get(topicProgressId(d.key, t.id)).status)
  );
  const interviewStatuses = topicsForRound("behavioral").map((t) => get(t.id).status);
  const allStatuses = [...problemStatuses, ...sqlStatuses, ...topicStatuses, ...interviewStatuses];
  const total = allStatuses.length;

  const overall = weightedPct(allStatuses);
  const counts = statusCounts(allStatuses);
  const solved = PROBLEMS.filter((p) => get(p.id).status === "DONE").length;
  const topicsDone = topicStatuses.filter((s) => s === "DONE").length;

  // "Progress by area": Problems + each topic domain + interview trackers
  const areas: { name: string; href: string; statuses: string[] }[] = [
    { name: "DSA Problems", href: "/problems", statuses: problemStatuses },
    { name: "SQL Practice", href: "/sql-practice", statuses: sqlStatuses },
    ...RESOURCE_DOMAINS.map((d) => ({
      name: d.name,
      href: `/topics/${d.key}`,
      statuses: allTopics(d).map((t) => get(topicProgressId(d.key, t.id)).status),
    })),
    { name: "Behavioral", href: "/rounds/behavioral", statuses: topicsForRound("behavioral").map((t) => get(t.id).status) },
  ];

  const diffData = ["Easy", "Medium", "Hard"].map((d) => {
    const list = PROBLEMS.filter((p) => p.difficulty === d);
    const done = list.filter((p) => get(p.id).status === "DONE").length;
    return { name: d, pct: list.length ? Math.round((100 * done) / list.length) : 0, label: `${done}/${list.length}`, color: DIFF_COLOR[d] };
  });

  const revisit: { kind: string; title: string; sub: string }[] = [];
  PROBLEMS.filter((p) => get(p.id).revisit).forEach((p) =>
    revisit.push({ kind: "LC", title: `${p.lcNumber}. ${p.title}`, sub: p.pattern })
  );
  RESOURCE_DOMAINS.forEach((d) =>
    allTopics(d)
      .filter((t) => get(topicProgressId(d.key, t.id)).revisit)
      .forEach((t) => revisit.push({ kind: "TOPIC", title: t.title, sub: d.name }))
  );
  TOPICS.filter((t) => t.roundKey === "behavioral" && get(t.id).revisit).forEach((t) =>
    revisit.push({ kind: "BEHAVIORAL", title: t.name, sub: t.category })
  );

  const donutData = STATUSES.map((s) => ({ name: STATUS_META[s].label, value: counts[s], color: STATUS_META[s].color }));

  const stats = [
    { label: "Overall", value: `${overall}%`, sub: `${counts.DONE} of ${total} items done` },
    { label: "Problems", value: `${solved}/${PROBLEMS.length}`, sub: `${weightedPct(problemStatuses)}% weighted` },
    { label: "Topics covered", value: `${topicsDone}/${topicStatuses.length}`, sub: `across ${RESOURCE_DOMAINS.length} tracks` },
    { label: "Needs revisit", value: revisit.length, sub: "flagged items" },
  ];

  const mastery = patternMastery(get).slice(0, 12);
  const dueCount = dueForReview(get).length;

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
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Dashboard" subtitle="Your progress across problems, topics, and interview prep." />
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

      <Link
        href="/today"
        className="mb-5 flex items-center gap-3 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/[0.12] to-violet-500/[0.06] px-5 py-4 transition hover:border-indigo-500/40"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300">
          <CalendarCheck size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-white">Study Today</div>
          <div className="truncate text-xs text-slate-400">
            {dueCount > 0 ? `${dueCount} item${dueCount === 1 ? "" : "s"} due for review` : "Your review queue and what to work on next"}
          </div>
        </div>
        <ArrowRight size={16} className="shrink-0 text-indigo-300" />
      </Link>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className="mt-2 text-3xl font-extrabold tabular-nums text-white">{s.value}</div>
            <div className="mt-1 text-xs text-slate-500">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>Progress by area</SectionTitle>
          <div className="space-y-1">
            {areas.map((a) => (
              <Link key={a.name} href={a.href} className="group flex items-center gap-4 rounded-lg px-2 py-2.5 transition hover:bg-white/[0.03]">
                <div className="w-40 shrink-0 text-sm font-semibold text-slate-200 group-hover:text-white">{a.name}</div>
                <ProgressBar counts={statusCounts(a.statuses)} total={a.statuses.length} />
                <div className="w-12 shrink-0 text-right text-sm tabular-nums text-slate-400">{weightedPct(a.statuses)}%</div>
                <ChevronRight size={16} className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
              </Link>
            ))}
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

        <div className="lg:col-span-2">
          <Heatmap />
        </div>

        <Card className="p-5">
          <SectionTitle>Problems by difficulty</SectionTitle>
          <HorizontalBars data={diffData} />
        </Card>

        <Card className="p-5 lg:col-span-3">
          <SectionTitle>
            Pattern mastery <span className="font-normal text-slate-600">· weakest first — drill these on LeetCode</span>
          </SectionTitle>
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {mastery.map((m) => (
              <Link key={m.pattern} href={`/problems?pattern=${encodeURIComponent(m.pattern)}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.03]">
                <div className="w-40 shrink-0 truncate text-sm text-slate-300 group-hover:text-white">{m.pattern}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-950/70 ring-1 ring-inset ring-white/5">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${m.pct}%` }} />
                </div>
                <div className="w-14 shrink-0 text-right text-xs tabular-nums text-slate-500">{m.done}/{m.total}</div>
              </Link>
            ))}
          </div>
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
