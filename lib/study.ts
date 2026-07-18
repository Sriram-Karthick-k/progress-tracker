// Study helpers over the progress store: pattern mastery (DSA) and resolving a
// progress id back to a display + link (for the "needs revisit" list).

import { Progress } from "./progress";
import { weightedPct } from "./status";
import { PROBLEMS, TOPICS } from "./seed-data";
import { RESOURCE_DOMAINS, allTopics, topicProgressId } from "./learn";
import { SQL_PROBLEMS } from "./sql-problems";

type Get = (id: string) => Progress;

/* ---------- resolve a progress id to something linkable ---------- */

export type StudyItem = { id: string; kind: string; title: string; sub: string; href: string };

export function resolveItem(id: string): StudyItem | null {
  if (id.startsWith("p-lc")) {
    const p = PROBLEMS.find((x) => x.id === id);
    if (!p) return null;
    return { id, kind: "LC", title: `${p.lcNumber}. ${p.title}`, sub: p.pattern, href: `/problems?q=${p.lcNumber}` };
  }
  if (id.startsWith("p-sql-")) {
    const p = SQL_PROBLEMS.find((x) => x.id === id);
    if (!p) return null;
    return { id, kind: "SQL", title: `${p.lc}. ${p.title}`, sub: p.category, href: `/sql-practice#${id}` };
  }
  if (id.startsWith("r-")) {
    for (const d of RESOURCE_DOMAINS) {
      for (const t of allTopics(d)) {
        if (topicProgressId(d.key, t.id) === id) {
          return { id, kind: "TOPIC", title: t.title, sub: d.name, href: `/topics/${d.key}#${id}` };
        }
      }
    }
    return null;
  }
  // round topics (behavioral / company): id starts with t-
  const t = TOPICS.find((x) => x.id === id);
  if (t) return { id, kind: t.roundKey.toUpperCase(), title: t.name, sub: t.category, href: `/rounds/${t.roundKey}` };
  return null;
}

/** Every progress id the app tracks — problems + resource topics + behavioral. */
export function allTrackedIds(): string[] {
  return [
    ...PROBLEMS.map((p) => p.id),
    ...SQL_PROBLEMS.map((p) => p.id),
    ...RESOURCE_DOMAINS.flatMap((d) => allTopics(d).map((t) => topicProgressId(d.key, t.id))),
    ...TOPICS.filter((t) => t.roundKey === "behavioral").map((t) => t.id),
  ];
}

/* ---------- spaced repetition + "study today" ---------- */

const DAY = 86_400_000;

/** Review interval (days) from confidence — higher confidence waits longer. */
export function reviewIntervalDays(confidence: number): number {
  return [1, 1, 3, 7, 14, 30][Math.max(0, Math.min(5, confidence))];
}

export type Reason = "flagged" | "review";
export type DueItem = StudyItem & {
  reason: Reason;
  overdueDays: number;
  confidence: number;
  status: string;
};

/**
 * Items to revisit today: everything flagged, plus worked items (Learning/Done)
 * whose spaced-repetition interval has elapsed. Flagged first, then most overdue.
 * Needs the `touched` epoch (localStorage mode) — in db mode only flags surface.
 */
export function dueForReview(get: Get): DueItem[] {
  const now = Date.now();
  const out: DueItem[] = [];
  for (const id of allTrackedIds()) {
    const pr = get(id);
    let reason: Reason | null = null;
    let overdueDays = 0;
    if (pr.revisit) {
      reason = "flagged";
    } else if ((pr.status === "LEARNING" || pr.status === "DONE") && pr.touched) {
      const days = (now - pr.touched) / DAY;
      const iv = reviewIntervalDays(pr.confidence);
      if (days >= iv) {
        reason = "review";
        overdueDays = days - iv;
      }
    }
    if (!reason) continue;
    const item = resolveItem(id);
    if (!item) continue;
    out.push({ ...item, reason, overdueDays, confidence: pr.confidence, status: pr.status });
  }
  return out.sort((a, b) => {
    if (a.reason !== b.reason) return a.reason === "flagged" ? -1 : 1;
    return b.overdueDays - a.overdueDays;
  });
}

/** In-flight items (Attempted / Learning) — "finish what you started". */
export function inProgressItems(get: Get): StudyItem[] {
  return allTrackedIds()
    .filter((id) => {
      const s = get(id).status;
      return s === "ATTEMPTED" || s === "LEARNING";
    })
    .map((id) => resolveItem(id))
    .filter((x): x is StudyItem => x !== null);
}

/** Suggested next problems: the first unsolved problem in your weakest patterns. */
export function suggestedProblems(get: Get, n = 5): StudyItem[] {
  const out: StudyItem[] = [];
  for (const m of patternMastery(get)) {
    if (out.length >= n) break;
    const next = PROBLEMS.find((p) => p.pattern === m.pattern && get(p.id).status === "TODO");
    if (next) out.push(resolveItem(next.id)!);
  }
  return out;
}

/* ---------- pattern mastery (DSA) ---------- */

export type PatternMastery = { pattern: string; pct: number; done: number; total: number };

export function patternMastery(get: Get): PatternMastery[] {
  const byPattern = new Map<string, string[]>();
  PROBLEMS.forEach((p) => {
    byPattern.set(p.pattern, [...(byPattern.get(p.pattern) ?? []), p.id]);
  });
  return [...byPattern.entries()]
    .map(([pattern, ids]) => ({
      pattern,
      pct: weightedPct(ids.map((id) => get(id).status)),
      done: ids.filter((id) => get(id).status === "DONE").length,
      total: ids.length,
    }))
    .sort((a, b) => a.pct - b.pct);
}
