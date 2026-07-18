"use client";

import { useEffect, useState, useCallback } from "react";
import { Flame, Minus, Plus, Trophy } from "lucide-react";
import { loadActivity, ActivityMap } from "@/lib/progress";
import { computeStreak, getGoal, setGoal, DEFAULT_GOAL } from "@/lib/streak";
import { Card } from "@/components/ui";

export function StreakGoal() {
  const [activity, setActivity] = useState<ActivityMap>({});
  const [goal, setGoalState] = useState(DEFAULT_GOAL);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => setActivity(loadActivity()), []);

  useEffect(() => {
    setMounted(true);
    setActivity(loadActivity());
    setGoalState(getGoal());
    window.addEventListener("prep-activity", refresh);
    return () => window.removeEventListener("prep-activity", refresh);
  }, [refresh]);

  const { current, best, today } = computeStreak(activity);
  const pct = Math.min(100, Math.round((100 * today) / goal));
  const met = today >= goal;

  function bump(delta: number) {
    const next = Math.max(1, Math.min(50, goal + delta));
    setGoal(next);
    setGoalState(next);
  }

  // avoid hydration mismatch (activity/goal are client-only)
  if (!mounted) return <Card className="h-[104px] p-5"><span /></Card>;

  return (
    <Card className="flex flex-wrap items-center gap-x-6 gap-y-4 p-5">
      <div className="flex items-center gap-3">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${current > 0 ? "bg-orange-500/15 text-orange-400" : "bg-white/[0.04] text-slate-500"}`}>
          <Flame size={24} className={current > 0 ? "fill-orange-400/30" : ""} />
        </div>
        <div>
          <div className="text-2xl font-extrabold tabular-nums text-white">
            {current} <span className="text-sm font-semibold text-slate-400">day{current === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Trophy size={12} className="text-amber-400/80" /> best {best}
          </div>
        </div>
      </div>

      <div className="min-w-[180px] flex-1">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            Today {met && <span className="text-emerald-400">· goal met 🎉</span>}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => bump(-1)} aria-label="Lower goal" className="grid h-5 w-5 place-items-center rounded border border-white/10 text-slate-400 transition hover:text-white">
              <Minus size={11} />
            </button>
            <span className="tabular-nums text-slate-400">
              {today}/{goal}
            </span>
            <button onClick={() => bump(1)} aria-label="Raise goal" className="grid h-5 w-5 place-items-center rounded border border-white/10 text-slate-400 transition hover:text-white">
              <Plus size={11} />
            </button>
          </div>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950/70 ring-1 ring-inset ring-white/5">
          <div
            className={`h-full rounded-full transition-all ${met ? "bg-emerald-400" : "bg-indigo-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 text-[11px] text-slate-600">Daily goal — items worked today (any status, note, or flag counts).</div>
      </div>
    </Card>
  );
}
