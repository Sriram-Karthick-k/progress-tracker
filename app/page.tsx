import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { weightedPct, statusCounts, STATUS_META, STATUSES, DIFF_COLOR } from "@/lib/status";
import { Card, SectionTitle, PageHeader } from "@/components/ui";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusDonut, HorizontalBars } from "@/components/Charts";
import { Flag, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [rounds, problems] = await Promise.all([
    prisma.round.findMany({ orderBy: { order: "asc" }, include: { topics: true } }),
    prisma.problem.findMany({ orderBy: { order: "asc" } }),
  ]);

  const topicStatuses = rounds.flatMap((r) => r.topics.map((t) => t.status));
  const problemStatuses = problems.map((p) => p.status);
  const allStatuses = [...topicStatuses, ...problemStatuses];
  const total = allStatuses.length;

  const overall = weightedPct(allStatuses);
  const counts = statusCounts(allStatuses);
  const topicCount = topicStatuses.length;
  const solved = problems.filter((p) => p.status === "DONE").length;

  // difficulty breakdown
  const diffs = ["Easy", "Medium", "Hard"];
  const diffData = diffs.map((d) => {
    const list = problems.filter((p) => p.difficulty === d);
    const done = list.filter((p) => p.status === "DONE").length;
    const pct = list.length ? Math.round((100 * done) / list.length) : 0;
    return { name: d, pct, label: `${done}/${list.length}`, color: DIFF_COLOR[d] };
  });

  // company readiness
  const comp: Record<string, { done: number; total: number }> = {};
  problems.forEach((p) => {
    p.companies
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((c) => {
        comp[c] = comp[c] ?? { done: 0, total: 0 };
        comp[c].total++;
        if (p.status === "DONE") comp[c].done++;
      });
  });
  const compData = Object.entries(comp)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, v]) => ({
      name,
      pct: Math.round((100 * v.done) / v.total),
      label: `${v.done}/${v.total}`,
      color: "#6366f1",
    }));

  // revisit list
  const revisit: { kind: string; title: string; sub: string }[] = [];
  rounds.forEach((r) =>
    r.topics
      .filter((t) => t.revisit)
      .forEach((t) => revisit.push({ kind: r.key.toUpperCase(), title: t.name, sub: t.category }))
  );
  problems
    .filter((p) => p.revisit)
    .forEach((p) =>
      revisit.push({ kind: "LC", title: `${p.lcNumber}. ${p.title}`, sub: p.pattern })
    );

  const donutData = STATUSES.map((s) => ({
    name: STATUS_META[s].label,
    value: counts[s],
    color: STATUS_META[s].color,
  }));

  const stats = [
    { label: "Overall", value: `${overall}%`, sub: `${counts.DONE} of ${total} items done`, accent: "text-white" },
    { label: "Topics", value: topicCount, sub: `across ${rounds.length} rounds`, accent: "text-white" },
    { label: "LeetCode", value: `${solved}/${problems.length}`, sub: `${weightedPct(problemStatuses)}% weighted`, accent: "text-white" },
    { label: "Needs revisit", value: revisit.length, sub: "topics + problems", accent: "text-orange-400" },
  ];

  return (
    <div className="px-8 py-8 lg:px-10">
      <PageHeader
        title="Dashboard"
        subtitle={`Overall progress across ${rounds.length} interview rounds + ${problems.length} LeetCode problems.`}
      />

      {/* stat cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {s.label}
            </div>
            <div className={`mt-2 text-3xl font-extrabold tabular-nums ${s.accent}`}>
              {s.value}
            </div>
            <div className="mt-1 text-xs text-slate-500">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* progress by round */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>Progress by round</SectionTitle>
          <div className="space-y-1">
            {rounds.map((r) => {
              const s = r.topics.map((t) => t.status);
              if (r.key === "dsa") s.push(...problemStatuses);
              const pct = weightedPct(s);
              return (
                <Link
                  key={r.id}
                  href={`/rounds/${r.key}`}
                  className="group flex items-center gap-4 rounded-lg px-2 py-2.5 transition hover:bg-white/[0.03]"
                >
                  <div className="w-44 shrink-0 text-sm font-semibold text-slate-200 group-hover:text-white">
                    {r.name}
                  </div>
                  <ProgressBar counts={statusCounts(s)} total={s.length} />
                  <div className="w-12 shrink-0 text-right text-sm tabular-nums text-slate-400">
                    {pct}%
                  </div>
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300"
                  />
                </Link>
              );
            })}
          </div>
        </Card>

        {/* status donut */}
        <Card className="p-5">
          <SectionTitle>Status breakdown</SectionTitle>
          <div className="flex items-center gap-5">
            <StatusDonut data={donutData} centerLabel={`${overall}%`} centerSub="Complete" />
            <div className="flex flex-col gap-2.5">
              {STATUSES.map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 rounded"
                    style={{ background: STATUS_META[s].color }}
                  />
                  <span className="text-slate-300">{STATUS_META[s].label}</span>
                  <span className="ml-2 tabular-nums text-slate-500">{counts[s]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* company readiness */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>
            Company readiness <span className="font-normal text-slate-600">· % LeetCode solved</span>
          </SectionTitle>
          <HorizontalBars data={compData} />
        </Card>

        {/* difficulty */}
        <Card className="p-5">
          <SectionTitle>LeetCode by difficulty</SectionTitle>
          <HorizontalBars data={diffData} />
        </Card>

        {/* revisit */}
        <Card className="p-5 lg:col-span-3">
          <SectionTitle>Needs revisit</SectionTitle>
          {revisit.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nothing flagged yet — hit the{" "}
              <Flag size={13} className="inline -translate-y-0.5 text-orange-400" /> flag on
              any item to circle back later.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {revisit.map((x, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <span className="shrink-0 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-300">
                    {x.kind}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                    {x.title}
                  </span>
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
