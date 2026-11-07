"use client";

import { Lock, Pencil } from "lucide-react";
import { openNoteEditor } from "@/components/notebook/noteClient";
import { isLocked, LOCKED_MESSAGE } from "@/lib/noteLock";

// "Edit" button at the top of a notebook note — opens the full-screen editor.
// Notes in a locked folder (lib/noteLock.ts) get a read-only "Locked" badge instead.
export function NoteEditButton({ slug, title }: { slug: string[]; title: string }) {
  if (isLocked(slug)) {
    return (
      <span
        title={LOCKED_MESSAGE}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-500"
      >
        <Lock size={14} /> Locked
      </span>
    );
  }
  return (
    <button
      onClick={() => openNoteEditor(slug, title)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-indigo-400/50 hover:text-white"
    >
      <Pencil size={14} /> Edit
    </button>
  );
}
