"use client";

import { ROUNDS, topicsForRound, TopicDef } from "@/lib/seed-data";
import { weightedPct, statusCounts, STATUS_META, STATUSES } from "@/lib/status";
import { StatusDonut } from "@/components/Charts";
import { CategoryBlock } from "@/components/CategoryBlock";
import { useProgress } from "@/components/ProgressProvider";
import { roundStatuses } from "@/lib/progress";

export function RoundView({ roundKey }: { roundKey: string }) {
  const { get } = useProgress();
  const round = ROUNDS.find((r) => r.key === roundKey);

  if (!round) {
    return <div className="px-8 py-16 text-center text-slate-400">Unknown round.</div>;
  }

  const statuses = roundStatuses(round.key, get);
  const pct = weightedPct(statuses);
  const counts = statusCounts(statuses);

  // group topics by category, preserving order
  const groups: { category: string; cue: string | null; topics: TopicDef[] }[] = [];
  for (const t of topicsForRound(round.key)) {
    let g = groups.find((x) => x.category === t.category);
    if (!g) {
      g = { category: t.category, cue: t.cue, topics: [] };
      groups.push(g);
    }
    g.topics.push(t);
  }

  const donutData = STATUSES.map((s) => ({ name: STATUS_META[s].label, value: counts[s], color: STATUS_META[s].color }));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mb-7 flex flex-wrap items-center gap-6">
        <StatusDonut data={donutData} centerLabel={`${pct}%`} centerSub="Complete" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-white">{round.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{round.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[s].color }} />
                {STATUS_META[s].label}
                <span className="tabular-nums text-slate-500">{counts[s]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {groups.map((g) => (
          <CategoryBlock key={g.category} category={g.category} cue={g.cue} topics={g.topics} />
        ))}
      </div>
    </div>
  );
}
