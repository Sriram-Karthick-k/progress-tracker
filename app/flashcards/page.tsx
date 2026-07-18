"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Brain, Play, Plus, Trash2, ArrowRight } from "lucide-react";
import { PageHeader, Card, SectionTitle } from "@/components/ui";
import { useProgress } from "@/components/ProgressProvider";
import {
  seedCards,
  getCustomCards,
  addCustomCard,
  deleteCustomCard,
  cardDue,
  isNew,
  SEED_DECK_METAS,
  CUSTOM_META,
  Flashcard,
  DeckMeta,
} from "@/lib/flashcards";

export default function FlashcardsPage() {
  const { get, ready, map } = useProgress();
  const [custom, setCustom] = useState<Flashcard[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const refresh = () => setCustom(getCustomCards());
  useEffect(() => {
    refresh();
    window.addEventListener("prep-flashcards", refresh);
    return () => window.removeEventListener("prep-flashcards", refresh);
  }, []);

  const allCards = useMemo(() => [...seedCards(), ...custom], [custom]);

  function statsFor(cards: Flashcard[]) {
    let due = 0;
    let learned = 0;
    let strength = 0;
    for (const c of cards) {
      const pr = get(c.id);
      if (cardDue(pr)) due++;
      if (!isNew(pr) && pr.confidence >= 4) learned++;
      strength += pr.confidence;
    }
    return { total: cards.length, due, learned, strength: cards.length ? strength / (5 * cards.length) : 0 };
  }

  const totalDue = ready ? allCards.filter((c) => cardDue(get(c.id))).length : 0;

  const decks: DeckMeta[] = [...SEED_DECK_METAS, CUSTOM_META];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    addCustomCard(front, back);
    setFront("");
    setBack("");
  }

  // stats depend on progress map
  void map;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="Flashcards"
        subtitle="Active recall wired into your spaced-repetition schedule. Try to answer before flipping — then grade yourself, and the scheduler decides when you see it again."
      />

      {/* review-due CTA */}
      <Link
        href="/flashcards/due"
        className="mb-5 flex items-center gap-3 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/[0.12] to-violet-500/[0.06] px-5 py-4 transition hover:border-indigo-500/40"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300">
          <Brain size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-white">Review due cards</div>
          <div className="truncate text-xs text-slate-400">
            {ready ? (totalDue > 0 ? `${totalDue} card${totalDue === 1 ? "" : "s"} ready to test` : "Nothing due — you're caught up") : "…"}
          </div>
        </div>
        <ArrowRight size={16} className="shrink-0 text-indigo-300" />
      </Link>

      {/* decks */}
      <div className="grid gap-4 lg:grid-cols-2">
        {decks.map((d) => {
          const cards = allCards.filter((c) => c.deckKey === d.key);
          const s = statsFor(cards);
          return (
            <Card key={d.key} className="flex flex-col p-5">
              <div className="mb-1 flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{d.title}</h2>
                {ready && s.due > 0 && (
                  <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                    {s.due} due
                  </span>
                )}
              </div>
              <p className="mb-3 text-sm text-slate-400">{d.desc}</p>

              <div className="mb-3 mt-auto">
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{s.total} cards · {ready ? s.learned : 0} strong</span>
                  <span>{Math.round(s.strength * 100)}% strength</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950/70 ring-1 ring-inset ring-white/5">
                  <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.round(s.strength * 100)}%` }} />
                </div>
              </div>

              {cards.length > 0 ? (
                <Link
                  href={`/flashcards/${d.key}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-400/50 hover:text-white"
                >
                  <Play size={14} /> Review
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 py-2 text-center text-xs text-slate-600">
                  No cards yet — add some below.
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* custom cards */}
      <Card className="mt-6 p-5">
        <SectionTitle>Add your own cards</SectionTitle>
        <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2">
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Front — the question / prompt"
            className="min-h-[70px] resize-y rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Back — the answer"
            className="min-h-[70px] resize-y rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={!front.trim() || !back.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={15} /> Add card
            </button>
          </div>
        </form>

        {custom.length > 0 && (
          <div className="mt-4 space-y-2">
            {custom.map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-200">{c.front}</div>
                  <div className="truncate text-xs text-slate-500">{c.back}</div>
                </div>
                <button
                  onClick={() => deleteCustomCard(c.id)}
                  aria-label="Delete card"
                  className="shrink-0 rounded-md border border-white/10 p-1.5 text-slate-500 transition hover:border-rose-500/40 hover:text-rose-300"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
