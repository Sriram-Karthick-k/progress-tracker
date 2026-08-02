// Activity Log: turns the raw ActivityEvent stream (lib/progress.ts) into a
// display-ready feed — resolving each event's progress id back to a human
// label/link, and describing what changed in plain English.

import { PROBLEMS, TOPICS, ROUNDS } from "./seed-data";
import { SQL_PROBLEMS } from "./sql-problems";
import { RESOURCE_DOMAINS, topicProgressId } from "./learn";
import { ActivityEvent, loadEvents } from "./progress";
import { STATUS_META } from "./status";

export type ResolvedItem = { label: string; sub: string; href: string; kind: string };
export type FeedEntry = { event: ActivityEvent; item: ResolvedItem; summary: string };

/* ---- id -> {label, sub, href, kind}, built once from static content ---- */

const problemById = new Map(PROBLEMS.map((p) => [p.id, p]));
const sqlById = new Map(SQL_PROBLEMS.map((p) => [p.id, p]));
const topicById = new Map(TOPICS.map((t) => [t.id, t]));
const roundNameByKey = new Map(ROUNDS.map((r) => [r.key, r.name]));

const resourceTopicById = new Map<string, { title: string; sub: string; href: string; kind: string }>();
RESOURCE_DOMAINS.forEach((d) =>
  d.sections.forEach((s) =>
    s.topics.forEach((t) => {
      const id = topicProgressId(d.key, t.id);
      resourceTopicById.set(id, {
        title: t.title,
        sub: `${d.name} · ${s.title}`,
        href: `/topics/${d.key}#${id}`,
        kind: d.name,
      });
    })
  )
);

export function resolveItem(id: string): ResolvedItem {
  const p = problemById.get(id);
  if (p) {
    return {
      label: `${p.lcNumber}. ${p.title}`,
      sub: `${p.difficulty} · ${p.pattern}`,
      href: `/problems?q=${p.lcNumber}`,
      kind: "DSA",
    };
  }
  const sql = sqlById.get(id);
  if (sql) {
    return {
      label: `${sql.lc}. ${sql.title}`,
      sub: `${sql.difficulty} · ${sql.category}`,
      href: `/sql-practice#${sql.id}`,
      kind: "SQL",
    };
  }
  const rt = resourceTopicById.get(id);
  if (rt) return { label: rt.title, sub: rt.sub, href: rt.href, kind: rt.kind };

  const t = topicById.get(id);
  if (t) {
    return {
      label: t.name,
      sub: `${roundNameByKey.get(t.roundKey) ?? t.roundKey} · ${t.category}`,
      href: `/rounds/${t.roundKey}`,
      kind: "Interview",
    };
  }
  return { label: id, sub: "", href: "#", kind: "Item" };
}

/** Every distinct "kind" a filter dropdown should offer, in a sensible order. */
export function feedKinds(): string[] {
  const kinds = new Set<string>(["DSA", "SQL", "Interview"]);
  RESOURCE_DOMAINS.forEach((d) => kinds.add(d.name));
  return Array.from(kinds);
}

/* ---- plain-English summary of what changed in one event ---- */

export function describeChanges(changes: ActivityEvent["changes"]): string {
  const parts: string[] = [];
  if (changes.status) {
    const { from, to } = changes.status;
    parts.push(to === "DONE" ? "Marked Done" : `${STATUS_META[from]?.label ?? from} → ${STATUS_META[to]?.label ?? to}`);
  }
  if (changes.confidence) {
    const { from, to } = changes.confidence;
    parts.push(`confidence ${to > from ? "↑" : "↓"} ${from}→${to}`);
  }
  if (changes.revisit) {
    parts.push(changes.revisit.to ? "flagged for revisit" : "unflagged");
  }
  return parts.join(" · ") || "updated";
}

/* ---- the feed ---- */

export function getFeed(): FeedEntry[] {
  return loadEvents().map((event) => ({
    event,
    item: resolveItem(event.itemId),
    summary: describeChanges(event.changes),
  }));
}

/** Group already-sorted (newest-first) entries by calendar day, in order. */
export function groupByDay(entries: FeedEntry[]): { key: string; label: string; entries: FeedEntry[] }[] {
  const groups: { key: string; label: string; entries: FeedEntry[] }[] = [];
  const today = new Date();
  const todayKey = today.toDateString();
  const yesterdayKey = new Date(today.getTime() - 86_400_000).toDateString();

  for (const e of entries) {
    const d = new Date(e.event.ts);
    const key = d.toDateString();
    let label: string;
    if (key === todayKey) label = "Today";
    else if (key === yesterdayKey) label = "Yesterday";
    else label = d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, label, entries: [] };
      groups.push(group);
    }
    group.entries.push(e);
  }
  return groups;
}
