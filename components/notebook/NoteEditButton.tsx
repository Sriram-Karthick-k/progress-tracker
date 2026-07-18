"use client";

import { Pencil } from "lucide-react";
import { openNoteEditor } from "@/components/notebook/noteClient";

// "Edit" button at the top of a notebook note — opens the full-screen editor.
export function NoteEditButton({ slug, title }: { slug: string[]; title: string }) {
  return (
    <button
      onClick={() => openNoteEditor(slug, title)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-indigo-400/50 hover:text-white"
    >
      <Pencil size={14} /> Edit
    </button>
  );
}
