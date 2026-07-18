"use client";

import { useMemo, useState } from "react";
import { Search, Flag } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { ItemRow } from "@/components/ItemRow";
import { RevisitFlag } from "@/components/RevisitFlag";
import { useProgress } from "@/components/ProgressProvider";
import { allTrackedIds, resolveItem, StudyItem } from "@/lib/study";

export default function BookmarksPage() {
  const { get, ready, map } = useProgress();
  const [q, setQ] = useState("");

  const flagged = useMemo<StudyItem[]>(() => {
    const out: StudyItem[] = [];
    for (const id of allTrackedIds()) {
      if (!get(id).revisit) continue;
      const item = resolveItem(id);
      if (item) out.push(item);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [get, map]);

  const query = q.trim().toLowerCase();
  const shown = flagged.filter(
    (i) => !query || `${i.title} ${i.sub} ${i.kind}`.toLowerCase().includes(query)
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="Bookmarks"
        subtitle="Everything you've flagged to revisit — problems, topics, SQL, and behavioral items. (Long-form notes live in the Notebook.)"
      />

      <div className="relative mb-5 max-w-md">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your bookmarks…"
          className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
        />
      </div>

      {shown.length === 0 ? (
        <Card className="px-4 py-16 text-center text-sm text-slate-500">
          {!ready ? (
            "Loading…"
          ) : flagged.length === 0 ? (
            <>
              No bookmarks yet. Hit the <Flag size={13} className="inline -translate-y-0.5 text-orange-400" /> flag on any
              problem, topic, or SQL question to bookmark it here.
            </>
          ) : (
            `No matches for “${q}”.`
          )}
        </Card>
      ) : (
        <div className="space-y-2">
          {shown.map((i) => (
            <ItemRow key={i.id} item={i} right={<RevisitFlag id={i.id} />} />
          ))}
        </div>
      )}
    </div>
  );
}
