export const STATUSES = ["TODO", "ATTEMPTED", "LEARNING", "DONE"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_META: Record<
  Status,
  { label: string; color: string; pill: string; dot: string }
> = {
  TODO: {
    label: "To do",
    color: "#64748b",
    pill: "text-slate-400 border-slate-700 hover:border-slate-500",
    dot: "bg-slate-500",
  },
  ATTEMPTED: {
    label: "Attempted",
    color: "#e0a23b",
    pill: "text-amber-300 border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20",
    dot: "bg-amber-400",
  },
  LEARNING: {
    label: "Learning",
    color: "#38bdf8",
    pill: "text-sky-300 border-sky-500/60 bg-sky-500/10 hover:bg-sky-500/20",
    dot: "bg-sky-400",
  },
  DONE: {
    label: "Done",
    color: "#34d399",
    pill: "text-emerald-300 border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20",
    dot: "bg-emerald-400",
  },
};

// Weighted completion: partial credit for in-flight statuses.
export const WEIGHT: Record<Status, number> = {
  TODO: 0,
  ATTEMPTED: 0.34,
  LEARNING: 0.67,
  DONE: 1,
};

export function nextStatus(s: Status): Status {
  return STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length];
}

export function weightedPct(statuses: string[]): number {
  if (!statuses.length) return 0;
  const sum = statuses.reduce((a, s) => a + (WEIGHT[s as Status] ?? 0), 0);
  return Math.round((100 * sum) / statuses.length);
}

export function statusCounts(statuses: string[]): Record<Status, number> {
  const c: Record<Status, number> = { TODO: 0, ATTEMPTED: 0, LEARNING: 0, DONE: 0 };
  statuses.forEach((s) => {
    if (s in c) c[s as Status]++;
  });
  return c;
}

export const DIFF_COLOR: Record<string, string> = {
  Easy: "#34d399",
  Medium: "#e0a23b",
  Hard: "#fb7185",
};
