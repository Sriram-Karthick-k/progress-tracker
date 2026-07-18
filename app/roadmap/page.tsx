"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ROADMAPS, roadmapProgressIds, stepProgressIds } from "@/lib/roadmap";
import { weightedPct } from "@/lib/status";
import { Card, PageHeader } from "@/components/ui";
import { useProgress } from "@/components/ProgressProvider";
import { domainIcon } from "@/components/learn/domainIcons";

export default function RoadmapOverview() {
  const { get } = useProgress();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="Roadmaps"
        subtitle="A guided, ordered path to master each track — follow it top to bottom and watch your progress fill in."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {ROADMAPS.map((r) => {
          const pct = weightedPct(roadmapProgressIds(r).map((id) => get(id).status));
          const Icon = domainIcon(r.icon);
          return (
            <Link key={r.key} href={`/roadmap/${r.key}`} className="group">
              <Card className="p-5 transition group-hover:border-white/25">
                <div className="flex items-start gap-4">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-onaccent shadow-card ${r.accent}`}>
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{r.name}</h2>
                      <ChevronRight size={16} className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
                      <span className="ml-auto text-sm font-semibold tabular-nums text-slate-300">{pct}%</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-400">{r.tagline}</p>
                    {/* stepper: one segment per step, coloured by its completion */}
                    <div className="mt-3 flex items-center gap-1">
                      {r.steps.map((s) => {
                        const sp = weightedPct(stepProgressIds(s).map((id) => get(id).status));
                        const cls = sp >= 100 ? "bg-emerald-400" : sp > 0 ? "bg-sky-400" : "bg-slate-700";
                        return <div key={s.id} title={`${s.title} — ${sp}%`} className={`h-1.5 flex-1 rounded-full ${cls}`} />;
                      })}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{r.steps.length} steps to mastery</div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
