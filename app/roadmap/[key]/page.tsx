"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, ArrowUpRight } from "lucide-react";
import { roadmapByKey, roadmapProgressIds } from "@/lib/roadmap";
import { weightedPct } from "@/lib/status";
import { useProgress } from "@/components/ProgressProvider";
import { domainIcon } from "@/components/learn/domainIcons";

// React Flow measures the DOM, so render it client-only.
const RoadmapGraph = dynamic(
  () => import("@/components/RoadmapGraph").then((m) => m.RoadmapGraph),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[560px] place-items-center rounded-2xl border border-white/10 bg-slate-950/40 text-sm text-slate-500">
        Loading roadmap…
      </div>
    ),
  }
);

const LEGEND = [
  { c: "bg-emerald-400", label: "Done" },
  { c: "bg-amber-400", label: "In progress" },
  { c: "bg-rose-400/80", label: "Not started" },
];

export default function RoadmapTrackPage({ params }: { params: { key: string } }) {
  const { get } = useProgress();
  const roadmap = roadmapByKey(params.key);

  if (!roadmap) {
    return <div className="px-8 py-16 text-center text-slate-400">Unknown roadmap.</div>;
  }

  const pct = weightedPct(roadmapProgressIds(roadmap).map((id) => get(id).status));
  const Icon = domainIcon(roadmap.icon);
  const isDsa = roadmap.key === "dsa";
  const secondaryHref = isDsa ? "/problems" : `/topics/${roadmap.key}`;
  const secondaryLabel = isDsa ? "Open the problem list" : "Open topic resources";

  return (
    <div className="flex h-[calc(100dvh-3.25rem)] flex-col px-4 py-4 sm:px-6 lg:h-screen lg:px-10 lg:py-6">
      <Link href="/roadmap" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-200">
        <ChevronLeft size={15} /> All roadmaps
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-onaccent shadow-card ${roadmap.accent}`}>
            <Icon size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">{roadmap.name} roadmap</h1>
            <p className="text-xs text-slate-500">Follow it top to bottom · click a node to open the work · drag to pan, scroll to zoom</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <span className="text-2xl font-extrabold tabular-nums text-white">{pct}%</span>
          <span className="text-xs text-slate-500">complete</span>
        </div>

        <div className="flex items-center gap-3">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`h-2.5 w-2.5 rounded-full ${l.c}`} /> {l.label}
            </span>
          ))}
        </div>

        <Link
          href={secondaryHref}
          className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
        >
          {secondaryLabel} <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="min-h-0 flex-1">
        <RoadmapGraph roadmap={roadmap} />
      </div>
    </div>
  );
}
