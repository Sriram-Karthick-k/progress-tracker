"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { loadActivity, ActivityMap } from "@/lib/progress";
import { Card, SectionTitle } from "./ui";

const WEEKS = 16;
const DAY_MS = 86_400_000;

function shade(count: number): string {
  if (count === 0) return "bg-white/[0.04]";
  if (count <= 2) return "bg-indigo-900";
  if (count <= 5) return "bg-indigo-700";
  if (count <= 9) return "bg-indigo-500";
  return "bg-indigo-400";
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** GitHub-style activity heatmap + current streak, from the local activity log. */
export function Heatmap() {
  const [activity, setActivity] = useState<ActivityMap | null>(null);
  useEffect(() => {
    const refresh = () => setActivity({ ...loadActivity() });
    refresh(); // store hydrates async from content/progress.json…
    window.addEventListener("prep-activity", refresh); // …and pings this when ready/updated
    return () => window.removeEventListener("prep-activity", refresh);
  }, []);

  const act = activity ?? {};
  const today = new Date();

  // streak: consecutive days with activity, ending today (or yesterday if today is empty)
  let streak = 0;
  let cursor = new Date(today);
  if (!act[dayKey(cursor)]) cursor = new Date(cursor.getTime() - DAY_MS);
  while (act[dayKey(cursor)]) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  // grid: columns = weeks (oldest -> newest), rows = Mon..Sun
  const end = new Date(today);
  const endDow = (end.getDay() + 6) % 7; // Mon=0
  const cols: { key: string; count: number; future: boolean }[][] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const col: { key: string; count: number; future: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const offset = w * 7 + (endDow - d);
      const date = new Date(end.getTime() - offset * DAY_MS);
      const key = dayKey(date);
      col.push({ key, count: act[key] ?? 0, future: date > today });
    }
    cols.push(col.reverse());
  }

  const total = Object.values(act).reduce((a, b) => a + b, 0);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <SectionTitle>Activity</SectionTitle>
        <div
          className={`mb-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
            streak > 0
              ? "border-orange-500/40 bg-orange-500/10 text-orange-300"
              : "border-white/10 bg-white/[0.03] text-slate-500"
          }`}
        >
          <Flame size={13} />
          {streak} day streak
        </div>
      </div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {cols.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((c) =>
              c.future ? (
                <div key={c.key} className="h-3 w-3 rounded-[3px]" />
              ) : (
                <div
                  key={c.key}
                  title={`${c.key}: ${c.count} update${c.count === 1 ? "" : "s"}`}
                  className={`h-3 w-3 rounded-[3px] ${shade(c.count)}`}
                />
              )
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
        <span>last {WEEKS} weeks · {total} updates</span>
        <span className="flex items-center gap-1">
          less
          {[0, 2, 5, 9, 10].map((n) => (
            <span key={n} className={`h-2.5 w-2.5 rounded-[3px] ${shade(n)}`} />
          ))}
          more
        </span>
      </div>
    </Card>
  );
}
