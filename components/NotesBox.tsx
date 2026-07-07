"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Check } from "lucide-react";
import { useProgress } from "./ProgressProvider";

export function NotesBox({ id }: { id: string }) {
  const { get, update } = useProgress();
  const stored = get(id).notes;

  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(stored);
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  // Sync from storage once it has hydrated (only while the box isn't being edited).
  useEffect(() => {
    if (!loaded.current || (!open && saved)) {
      setVal(stored);
      loaded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stored]);

  function onChange(v: string) {
    setVal(v);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      update(id, { notes: v });
      setSaved(true);
    }, 400);
  }

  const hasNotes = stored.trim().length > 0;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notes"
        className={`grid h-8 w-8 place-items-center rounded-lg border transition active:scale-90 ${
          hasNotes || open
            ? "border-indigo-500/70 bg-indigo-500/15 text-indigo-300"
            : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
        }`}
      >
        <Pencil size={14} />
      </button>
      {open && (
        <div className="mt-3 w-full basis-full">
          <textarea
            autoFocus
            value={val}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Notes / approach / cue…"
            className="min-h-[64px] w-full resize-y rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            {saved ? (
              <>
                <Check size={12} /> Saved
              </>
            ) : (
              "Saving…"
            )}
          </div>
        </div>
      )}
    </>
  );
}
