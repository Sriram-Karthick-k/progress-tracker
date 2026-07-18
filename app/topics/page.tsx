"use client";

import Link from "next/link";
import { ChevronRight, Layers } from "lucide-react";
import { TOPIC_DOMAINS, allTopics, topicProgressId } from "@/lib/learn";
import { weightedPct, statusCounts } from "@/lib/status";
import { Card, PageHeader } from "@/components/ui";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/components/ProgressProvider";
import { domainIcon } from "@/components/learn/domainIcons";

export default function TopicsOverview() {
  const { get } = useProgress();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="Topics"
        subtitle="Curated free resources for each topic — articles, videos, books, docs. Track what you've covered; the depth lives in the linked references."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {TOPIC_DOMAINS.map((d) => {
          const topics = allTopics(d);
          const statuses = topics.map((t) => get(topicProgressId(d.key, t.id)).status);
          const pct = weightedPct(statuses);
          const done = statuses.filter((s) => s === "DONE").length;
          const resourceCount = topics.reduce((a, t) => a + t.resources.length, 0);
          const Icon = domainIcon(d.icon);
          return (
            <Link key={d.key} href={`/topics/${d.key}`} className="group">
              <Card className="p-5 transition group-hover:border-white/25">
                <div className="flex items-start gap-4">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-onaccent shadow-card ${d.accent}`}>
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{d.name}</h2>
                      <ChevronRight size={16} className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-400">{d.tagline}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <ProgressBar counts={statusCounts(statuses)} total={statuses.length} />
                      <span className="shrink-0 text-sm tabular-nums text-slate-400">{pct}%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Layers size={13} />
                      {done}/{topics.length} topics · {resourceCount} resources
                    </div>
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
