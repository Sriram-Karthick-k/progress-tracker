"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { History, Search, CheckCircle2, Star, Flag, RefreshCw } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { useProgress } from "@/components/ProgressProvider";
import { getFeed, groupByDay, FeedEntry } from "@/lib/activityFeed";
import type { ActivityEvent } from "@/lib/progress";

const PAGE_SIZE = 60;

function iconFor(changes: ActivityEvent["changes"]) {
  if (changes.status) return changes.status.to === "DONE" ? CheckCircle2 : RefreshCw;
  if (changes.confidence) return Star;
  if (changes.revisit) return Flag;
  return RefreshCw;
}

function iconColor(changes: ActivityEvent["changes"]) {
  if (changes.status?.to === "DONE") return "text-emerald-400 bg-emerald-500/15";
  if (changes.status) return "text-sky-400 bg-sky-500/15";
  if (changes.confidence) return "text-amber-400 bg-amber-500/15";
  if (changes.revisit?.to) return "text-orange-400 bg-orange-500/15";
  return "text-slate-400 bg-white/[0.06]";
}

function timeOf(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ActivityPage() {
  const { ready, map } = useProgress();
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  // events live in the same file-backed store as progress but aren't part of
  // React state, so refresh on the same "prep-activity" ping everything else uses.
  useEffect(() => {
    const refresh = () => setFeed(getFeed());
    refresh();
    window.addEventListener("prep-activity", refresh);
    return () => window.removeEventListener("prep-activity", refresh);
  }, [map]);

  const kinds = useMemo(() => Array.from(new Set(feed.map((e) => e.item.kind))).sort(), [feed]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return feed.filter((e) => {
      if (kind && e.item.kind !== kind) return false;
      if (query && !e.item.label.toLowerCase().includes(query) && !e.summary.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [feed, kind, q]);

  const groups = useMemo(() => groupByDay(filtered.slice(0, limit)), [filtered, limit]);
  const hasMore = filtered.length > limit;

  const selectCls =
    "rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 outline-none transition hover:border-white/20 focus:border-indigo-500";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="Activity Log"
        subtitle="Every status change, confidence update, and revisit flag you've made — newest first."
      />

      {!ready ? (
        <Card className="p-10 text-center text-sm text-slate-500">Loading…</Card>
      ) : feed.length === 0 ? (
        <Card className="p-10 text-center">
          <History size={28} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-400">
            Nothing logged yet. Mark a problem or topic's status, rate your confidence, or flag something for
            revisit — it'll show up here.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px] flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setLimit(PAGE_SIZE);
                }}
                placeholder="Search activity…"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
              />
            </div>
            <select
              className={selectCls}
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setLimit(PAGE_SIZE);
              }}
            >
              <option value="">All areas</option>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-10 text-center text-sm text-slate-500">No activity matches these filters.</Card>
          ) : (
            <div className="space-y-6">
              {groups.map((g) => (
                <div key={g.key}>
                  <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-500">{g.label}</div>
                  <Card className="overflow-hidden">
                    <div className="divide-y divide-white/5">
                      {g.entries.map((e) => {
                        const Icon = iconFor(e.event.changes);
                        return (
                          <Link
                            key={e.event.id}
                            href={e.item.href}
                            className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03]"
                          >
                            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconColor(e.event.changes)}`}>
                              <Icon size={15} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-slate-100">{e.item.label}</div>
                              <div className="truncate text-xs text-slate-500">
                                {e.summary} · {e.item.sub}
                              </div>
                            </div>
                            <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              {e.item.kind}
                            </span>
                            <span className="w-14 shrink-0 text-right text-xs tabular-nums text-slate-500">
                              {timeOf(e.event.ts)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              ))}
              {hasMore && (
                <button
                  onClick={() => setLimit((n) => n + PAGE_SIZE)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  Show more ({filtered.length - limit} remaining)
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
