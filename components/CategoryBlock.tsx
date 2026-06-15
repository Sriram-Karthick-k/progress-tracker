"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { TopicCard, TopicLike } from "./TopicCard";
import { ProgressBar } from "./ProgressBar";
import { statusCounts, weightedPct } from "@/lib/status";

export function CategoryBlock({
  category,
  cue,
  topics,
}: {
  category: string;
  cue: string | null;
  topics: TopicLike[];
}) {
  const [open, setOpen] = useState(true);
  const statuses = topics.map((t) => t.status);
  const counts = statusCounts(statuses);
  const pct = weightedPct(statuses);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/40 shadow-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03]"
      >
        <ChevronRight
          size={16}
          className={`shrink-0 text-slate-500 transition ${open ? "rotate-90" : ""}`}
        />
        <span className="font-semibold text-white">{category}</span>
        {cue && <span className="hidden text-sm italic text-slate-500 md:inline">{cue}</span>}
        <span className="ml-auto flex items-center gap-3">
          <span className="hidden w-28 sm:block">
            <ProgressBar counts={counts} total={statuses.length} />
          </span>
          <span className="w-12 text-right text-sm tabular-nums text-slate-400">{pct}%</span>
        </span>
      </button>
      {open && (
        <div className="border-t border-white/5">
          {topics.map((t) => (
            <TopicCard key={t.id} topic={t} />
          ))}
        </div>
      )}
    </div>
  );
}
