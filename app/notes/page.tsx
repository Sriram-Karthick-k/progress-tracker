"use client";

import { useMemo, useState } from "react";
import { Search, NotebookPen, Flag } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { ItemRow } from "@/components/ItemRow";
import { RevisitFlag } from "@/components/RevisitFlag";
import { NotesBox } from "@/components/NotesBox";
import { useProgress } from "@/components/ProgressProvider";
import { allTrackedIds, resolveItem, StudyItem } from "@/lib/study";

type Entry = { item: StudyItem; notes: string; revisit: boolean };
type Filter = "all" | "notes" | "flagged";

export default function NotesPage() {
  const { get, ready, map } = useProgress();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const entries = useMemo<Entry[]>(() => {
    const out: Entry[] = [];
    for (const id of allTrackedIds()) {
      const pr = get(id);
      const notes = pr.notes?.trim() ?? "";
      if (!notes && !pr.revisit) continue;
      const item = resolveItem(id);
      if (!item) continue;
      out.push({ item, notes, revisit: pr.revisit });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [get, map]);

  const query = q.trim().toLowerCase();
  const shown = entries.filter((e) => {
    if (filter === "notes" && !e.notes) return false;
    if (filter === "flagged" && !e.revisit) return false;
    if (query) {
      const hay = `${e.item.title} ${e.item.sub} ${e.item.kind} ${e.notes}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  const notesCount = entries.filter((e) => e.notes).length;
  const flagCount = entries.filter((e) => e.revisit).length;

  const TABS: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${entries.length})` },
    { key: "notes", label: `Notes (${notesCount})` },
    { key: "flagged", label: `Flagged (${flagCount})` },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="My Notes & Bookmarks"
        subtitle="Every note you've written and everything you've flagged to revisit — in one searchable place."
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[240px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your notes and flagged items…"
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === t.key ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <Card className="px-4 py-16 text-center text-sm text-slate-500">
          {!ready ? (
            "Loading…"
          ) : entries.length === 0 ? (
            <>
              Nothing yet. Add a <NotebookPen size={13} className="inline -translate-y-0.5 text-indigo-300" /> note or hit the{" "}
              <Flag size={13} className="inline -translate-y-0.5 text-orange-400" /> flag on any problem or topic and it shows up here.
            </>
          ) : (
            `No matches for “${q}”.`
          )}
        </Card>
      ) : (
        <div className="space-y-2">
          {shown.map((e) => (
            <ItemRow
              key={e.item.id}
              item={e.item}
              right={
                <div className="flex items-center gap-2">
                  <RevisitFlag id={e.item.id} />
                  <NotesBox id={e.item.id} />
                </div>
              }
              body={
                e.notes ? (
                  <p className="mt-2 whitespace-pre-wrap rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
                    {e.notes}
                  </p>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
