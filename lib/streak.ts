// Streak + daily-goal helpers over the activity log (localStorage only — see
// loadActivity/recordActivity in progress.ts). Activity = one count per day of
// progress updates. A "day" is a UTC date key (matches recordActivity).

import { ActivityMap } from "./progress";

const DAY = 86_400_000;
const GOAL_KEY = "dailyGoal.v1";
export const DEFAULT_GOAL = 5;

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function todayKey() {
  return ymd(new Date());
}

export type Streaks = { current: number; best: number; today: number };

export function computeStreak(activity: ActivityMap): Streaks {
  const now = new Date();
  const tKey = ymd(now);
  const yKey = ymd(new Date(now.getTime() - DAY));
  const active = (k: string) => (activity[k] ?? 0) > 0;

  // current streak counts back from today; if today is idle, a one-day grace
  // keeps yesterday's streak alive until a full day is missed.
  let current = 0;
  if (active(tKey) || active(yKey)) {
    let i = active(tKey) ? 0 : 1;
    for (;;) {
      const k = ymd(new Date(now.getTime() - i * DAY));
      if (active(k)) {
        current++;
        i++;
      } else break;
    }
  }

  // best run over all recorded days
  const days = Object.keys(activity)
    .filter((k) => (activity[k] ?? 0) > 0)
    .map((k) => Date.parse(k))
    .sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const t of days) {
    if (prev !== null && t - prev === DAY) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = t;
  }

  return { current, best, today: activity[tKey] ?? 0 };
}

export function getGoal(): number {
  if (typeof window === "undefined") return DEFAULT_GOAL;
  const v = Number(localStorage.getItem(GOAL_KEY));
  return v > 0 ? v : DEFAULT_GOAL;
}

export function setGoal(n: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GOAL_KEY, String(Math.max(1, Math.min(50, Math.round(n)))));
}
