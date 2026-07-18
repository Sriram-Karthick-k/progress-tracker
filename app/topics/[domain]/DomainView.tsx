"use client";

import Link from "next/link";
import { ChevronLeft, GitBranch } from "lucide-react";
import { resourceDomainByKey, allTopics, topicProgressId } from "@/lib/learn";
import { weightedPct, statusCounts, STATUS_META, STATUSES } from "@/lib/status";
import { StatusDonut } from "@/components/Charts";
import { ResourceDomainView } from "@/components/learn/ResourceList";
import { useProgress } from "@/components/ProgressProvider";
import { domainIcon } from "@/components/learn/domainIcons";

export function DomainView({ domainKey }: { domainKey: string }) {
  const { get } = useProgress();
  const domain = resourceDomainByKey(domainKey);

  if (!domain) {
    return <div className="px-8 py-16 text-center text-slate-400">Unknown topic.</div>;
  }

  const topics = allTopics(domain);
  const statuses = topics.map((t) => get(topicProgressId(domain.key, t.id)).status);
  const pct = weightedPct(statuses);
  const counts = statusCounts(statuses);
  const Icon = domainIcon(domain.icon);
  const donutData = STATUSES.map((s) => ({ name: STATUS_META[s].label, value: counts[s], color: STATUS_META[s].color }));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <Link href="/topics" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-200">
        <ChevronLeft size={15} /> All topics
      </Link>

      <div className="mb-7 flex flex-wrap items-center gap-6">
        <StatusDonut data={donutData} centerLabel={`${pct}%`} centerSub="Covered" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-onaccent shadow-card ${domain.accent}`}>
              <Icon size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{domain.name}</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">{domain.tagline}</p>
          <p className="mt-2 text-xs text-slate-600">
            All links are free. Mark a topic once you&apos;ve worked through its resources.
          </p>
          <Link
            href={`/roadmap/${domain.key}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <GitBranch size={14} /> View the guided roadmap
          </Link>
        </div>
      </div>

      <ResourceDomainView domain={domain} />
    </div>
  );
}
