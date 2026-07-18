"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RotateCcw, Flag, PlayCircle, Sparkles, ArrowRight, Brain } from "lucide-react";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { ItemRow } from "@/components/ItemRow";
import { StreakGoal } from "@/components/StreakGoal";
import { StatusToggle } from "@/components/StatusToggle";
import { RevisitFlag } from "@/components/RevisitFlag";
import { ConfidenceStars } from "@/components/ConfidenceStars";
import { useProgress } from "@/components/ProgressProvider";
import { dueForReview, inProgressItems, suggestedProblems } from "@/lib/study";
import { seedCards, getCustomCards, cardDue, Flashcard } from "@/lib/flashcards";

function overdueLabel(days: number) {
  if (days < 1) return "due today";
  const d = Math.floor(days);
  return `${d}d overdue`;
}

export default function TodayPage() {
  const { get, ready, map } = useProgress();

  // recompute whenever progress changes
  const due = useMemo(() => dueForReview(get), [get, map]);
  const inProgress = useMemo(() => {
    const dueIds = new Set(due.map((d) => d.id));
    return inProgressItems(get).filter((i) => !dueIds.has(i.id));
  }, [get, map, due]);
  const suggestions = useMemo(() => suggestedProblems(get, 5), [get, map]);

  const [customCards, setCustomCards] = useState<Flashcard[]>([]);
  useEffect(() => setCustomCards(getCustomCards()), []);
  const fcDue = useMemo(
    () => [...seedCards(), ...customCards].filter((c) => cardDue(get(c.id))).length,
    [get, map, customCards]
  );

  const flagged = due.filter((d) => d.reason === "flagged").length;
  const reviews = due.length - flagged;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="Study Today"
        subtitle="Your review queue (spaced repetition + flags), what to finish, and what to start next."
      />

      <div className="mb-5">
        <StreakGoal />
      </div>

      {/* flashcards callout */}
      <Link
        href="/flashcards/due"
        className="mb-5 flex items-center gap-3 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/[0.12] to-violet-500/[0.06] px-5 py-4 transition hover:border-indigo-500/40"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300">
          <Brain size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-white">Flashcards — active recall</div>
          <div className="truncate text-xs text-slate-400">
            {fcDue > 0 ? `${fcDue} card${fcDue === 1 ? "" : "s"} due — test yourself, don't just re-read` : "Caught up — the best kind of review is the one you can't skip"}
          </div>
        </div>
        <ArrowRight size={16} className="shrink-0 text-indigo-300" />
      </Link>

      {/* summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Due for review", value: due.length, sub: `${flagged} flagged · ${reviews} scheduled`, icon: RotateCcw },
          { label: "In progress", value: inProgress.length, sub: "attempted or learning", icon: PlayCircle },
          { label: "Suggested next", value: suggestions.length, sub: "from your weakest patterns", icon: Sparkles },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-slate-300">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-extrabold tabular-nums text-white">{ready ? s.value : "—"}</div>
                <div className="truncate text-xs text-slate-500">{s.label} · {s.sub}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* due for review */}
      <Card className="mb-4 p-5">
        <SectionTitle>
          Due for review <span className="font-normal text-slate-600">· flagged first, then most overdue</span>
        </SectionTitle>
        {due.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            {ready ? (
              <>Nothing due — you&apos;re all caught up. Flag items with the <Flag size={12} className="inline -translate-y-0.5 text-orange-400" /> button to schedule a revisit.</>
            ) : (
              "Loading your queue…"
            )}
          </p>
        ) : (
          <div className="space-y-2">
            {due.map((d) => (
              <ItemRow
                key={d.id}
                item={d}
                right={
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        d.reason === "flagged"
                          ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {d.reason === "flagged" ? "flagged" : overdueLabel(d.overdueDays)}
                    </span>
                    <ConfidenceStars id={d.id} />
                    <StatusToggle id={d.id} />
                    <RevisitFlag id={d.id} />
                  </div>
                }
              />
            ))}
          </div>
        )}
      </Card>

      {/* finish what you started */}
      {inProgress.length > 0 && (
        <Card className="mb-4 p-5">
          <SectionTitle>Finish what you started</SectionTitle>
          <div className="space-y-2">
            {inProgress.slice(0, 20).map((i) => (
              <ItemRow key={i.id} item={i} right={<StatusToggle id={i.id} />} />
            ))}
          </div>
        </Card>
      )}

      {/* start something new */}
      {suggestions.length > 0 && (
        <Card className="p-5">
          <SectionTitle>
            Start something new <span className="font-normal text-slate-600">· next problem in your weakest patterns</span>
          </SectionTitle>
          <div className="space-y-2">
            {suggestions.map((i) => (
              <ItemRow key={i.id} item={i} right={<StatusToggle id={i.id} />} />
            ))}
          </div>
          <Link href="/problems" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-300 transition hover:text-indigo-200">
            Browse all problems <ArrowRight size={14} />
          </Link>
        </Card>
      )}
    </div>
  );
}
