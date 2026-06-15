import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { weightedPct, statusCounts, STATUS_META, STATUSES } from "@/lib/status";
import { StatusDonut } from "@/components/Charts";
import { CategoryBlock } from "@/components/CategoryBlock";

export const dynamic = "force-dynamic";

export default async function RoundPage({ params }: { params: { key: string } }) {
  const round = await prisma.round.findUnique({
    where: { key: params.key },
    include: { topics: { orderBy: { order: "asc" } } },
  });
  if (!round) notFound();

  const problems =
    round.key === "dsa" ? await prisma.problem.findMany() : [];

  const statuses = [
    ...round.topics.map((t) => t.status),
    ...problems.map((p) => p.status),
  ];
  const pct = weightedPct(statuses);
  const counts = statusCounts(statuses);

  // group topics by category, preserving order
  const groups: { category: string; cue: string | null; topics: typeof round.topics }[] = [];
  for (const t of round.topics) {
    let g = groups.find((x) => x.category === t.category);
    if (!g) {
      g = { category: t.category, cue: t.cue, topics: [] };
      groups.push(g);
    }
    g.topics.push(t);
  }

  const donutData = STATUSES.map((s) => ({
    name: STATUS_META[s].label,
    value: counts[s],
    color: STATUS_META[s].color,
  }));

  return (
    <div className="px-8 py-8 lg:px-10">
      <div className="mb-7 flex flex-wrap items-center gap-6">
        <StatusDonut data={donutData} centerLabel={`${pct}%`} centerSub="Complete" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-white">{round.name}</h1>
          {round.description && (
            <p className="mt-1 max-w-2xl text-sm text-slate-400">{round.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: STATUS_META[s].color }}
                />
                {STATUS_META[s].label}
                <span className="tabular-nums text-slate-500">{counts[s]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {groups.map((g) => (
          <CategoryBlock
            key={g.category}
            category={g.category}
            cue={g.cue}
            topics={g.topics}
          />
        ))}
      </div>
    </div>
  );
}
