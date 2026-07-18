"use client";

import { useEffect, useMemo, useState } from "react";
import { FlashcardReview } from "@/components/FlashcardReview";
import { useProgress } from "@/components/ProgressProvider";
import {
  seedCards,
  getCustomCards,
  cardDue,
  SEED_DECK_METAS,
  CUSTOM_META,
  Flashcard,
} from "@/lib/flashcards";

function sessionTitle(deck: string): string {
  if (deck === "due") return "Due for review";
  if (deck === "all") return "All cards";
  const meta = [...SEED_DECK_METAS, CUSTOM_META].find((m) => m.key === deck);
  return meta ? meta.title : "Review";
}

export function DeckView({ deckKey: deck }: { deckKey: string }) {
  const { get, ready } = useProgress();

  const [custom, setCustom] = useState<Flashcard[]>([]);
  const [customLoaded, setCustomLoaded] = useState(false);
  const [queue, setQueue] = useState<Flashcard[] | null>(null);

  useEffect(() => {
    setCustom(getCustomCards());
    setCustomLoaded(true);
  }, []);

  // build the review queue ONCE (frozen for the session) after progress + custom load
  useEffect(() => {
    if (queue || !ready || !customLoaded) return;
    const all = [...seedCards(), ...custom];
    let pool: Flashcard[];
    if (deck === "due") pool = all.filter((c) => cardDue(get(c.id)));
    else if (deck === "all") pool = all;
    else pool = all.filter((c) => c.deckKey === deck);
    // within a specific deck, surface due cards first
    if (deck !== "due") {
      pool = [...pool].sort((a, b) => Number(cardDue(get(b.id))) - Number(cardDue(get(a.id))));
    }
    setQueue(pool);
  }, [ready, customLoaded, custom, queue, deck, get]);

  const title = useMemo(() => sessionTitle(deck), [deck]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-10">
      <h1 className="mb-4 text-lg font-bold text-white">{title}</h1>
      {queue === null ? (
        <div className="grid h-40 place-items-center text-sm text-slate-500">Loading cards…</div>
      ) : (
        <FlashcardReview cards={queue} title={title} />
      )}
    </div>
  );
}
