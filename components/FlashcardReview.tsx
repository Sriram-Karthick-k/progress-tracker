"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw, ArrowLeft, Check } from "lucide-react";
import { useProgress } from "@/components/ProgressProvider";
import { Card } from "@/components/ui";
import { Flashcard, Grade, nextConfidence, gradeIntervals } from "@/lib/flashcards";

const GRADES: { g: Grade; label: string; cls: string }[] = [
  { g: "again", label: "Again", cls: "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" },
  { g: "hard", label: "Hard", cls: "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" },
  { g: "good", label: "Good", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20" },
  { g: "easy", label: "Easy", cls: "border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20" },
];

export function FlashcardReview({ cards, title }: { cards: Flashcard[]; title: string }) {
  const { get, update } = useProgress();
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const card = cards[idx];
  const done = idx >= cards.length;

  const grade = useCallback(
    (g: Grade) => {
      if (!card) return;
      const cur = get(card.id).confidence;
      const nc = nextConfidence(cur, g);
      update(card.id, { confidence: nc, status: nc >= 4 ? "DONE" : "LEARNING" });
      setReviewed((n) => n + 1);
      setRevealed(false);
      setIdx((i) => i + 1);
    },
    [card, get, update]
  );

  // keyboard: Space/Enter reveals; 1-4 grade
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (!revealed && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && e.key >= "1" && e.key <= "4") {
        e.preventDefault();
        grade(GRADES[Number(e.key) - 1].g);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, done, grade]);

  if (cards.length === 0) {
    return (
      <Card className="px-4 py-16 text-center text-sm text-slate-400">
        Nothing to review here right now. 🎉
        <div className="mt-3">
          <Link href="/flashcards" className="text-indigo-300 hover:text-indigo-200">← Back to decks</Link>
        </div>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="px-4 py-16 text-center">
        <div className="mb-2 grid place-items-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
            <Check size={28} />
          </div>
        </div>
        <div className="text-lg font-bold text-white">Session complete</div>
        <p className="mt-1 text-sm text-slate-400">You reviewed {reviewed} card{reviewed === 1 ? "" : "s"}. Come back tomorrow — the scheduler will resurface what needs it.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={() => {
              setIdx(0);
              setReviewed(0);
              setRevealed(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:text-white"
          >
            <RotateCcw size={14} /> Run again
          </button>
          <Link href="/flashcards" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:text-white">
            <ArrowLeft size={14} /> All decks
          </Link>
        </div>
      </Card>
    );
  }

  const cur = get(card.id).confidence;
  const intervals = gradeIntervals(cur);
  const pct = Math.round((100 * idx) / cards.length);

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Link href="/flashcards" className="text-sm text-slate-500 transition hover:text-slate-200">
          <ArrowLeft size={15} className="inline" /> Decks
        </Link>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-950/70 ring-1 ring-inset ring-white/5">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-slate-500">{idx + 1}/{cards.length}</span>
      </div>

      <Card className="min-h-[320px] p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-slate-400">{card.deckTitle}</span>
          <span className="text-[11px] text-slate-600">confidence {cur}/5</span>
        </div>

        <div className="grid min-h-[160px] place-items-center py-4 text-center">
          <div>
            <div className="text-lg font-semibold leading-relaxed text-white sm:text-xl">{card.front}</div>
            {revealed && (
              <>
                <div className="mx-auto my-5 h-px w-24 bg-white/10" />
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-300">{card.back}</div>
              </>
            )}
          </div>
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 w-full rounded-xl border border-indigo-500/40 bg-indigo-500/15 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/25"
          >
            Show answer <span className="ml-1 text-xs text-indigo-300/70">(Space)</span>
          </button>
        ) : (
          <div>
            <div className="mb-2 text-center text-xs text-slate-500">How well did you recall it?</div>
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map((x, i) => (
                <button
                  key={x.g}
                  onClick={() => grade(x.g)}
                  className={`flex flex-col items-center gap-0.5 rounded-xl border py-2.5 text-sm font-semibold transition ${x.cls}`}
                >
                  {x.label}
                  <span className="text-[10px] font-normal opacity-70">{intervals[x.g]}d · {i + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
