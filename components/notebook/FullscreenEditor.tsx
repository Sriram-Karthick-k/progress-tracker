"use client";

import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { Eye, Pencil, Save, X, Trash2 } from "lucide-react";
import { noteApi } from "@/components/notebook/noteClient";

marked.use({ gfm: true, breaks: false });

// Distraction-free note editor. Fixed full-screen (covers every sidebar).
// Toggle preview with the eye icon or Ctrl/Cmd+Shift+V. Esc closes.
export function FullscreenEditor({
  slug,
  initialContent,
  exists,
  onClose,
}: {
  slug: string[];
  initialContent: string;
  exists: boolean;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialContent);
  const [preview, setPreview] = useState(false);
  const [created, setCreated] = useState(exists);
  const [status, setStatus] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);

  const html = useMemo(() => marked.parse(value) as string, [value]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setPreview((p) => !p);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save() {
    setStatus("Saving…");
    try {
      await noteApi(created ? "save" : "create", slug, value);
      setCreated(true);
      setStatus("Saved ✓");
    } catch (e) {
      setStatus(`Save failed: ${(e as Error).message}`);
    }
  }

  async function del() {
    try {
      await noteApi("delete", slug);
      onClose();
    } catch (e) {
      setStatus(`Delete failed: ${(e as Error).message}`);
    }
  }

  const iconBtn = "grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-white/20 hover:text-white";

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-slate-950">
      <header className="flex items-center gap-2 border-b border-white/10 px-3 py-2 sm:px-4">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-500">content/notes/{slug.join("/")}.md</span>
        {status && <span className="hidden text-xs text-slate-500 sm:inline">{status}</span>}
        <button onClick={() => setPreview((p) => !p)} title="Toggle full preview (Ctrl+Shift+V)" aria-label="Toggle preview" className={iconBtn}>
          {preview ? <Pencil size={16} /> : <Eye size={16} />}
        </button>
        <button
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
        >
          <Save size={15} /> Save
        </button>
        {created && !confirmDel && (
          <button onClick={() => setConfirmDel(true)} title="Delete note" aria-label="Delete note" className={`${iconBtn} hover:border-rose-500/40 hover:text-rose-300`}>
            <Trash2 size={16} />
          </button>
        )}
        {created && confirmDel && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-xs text-rose-200">
            Delete?
            <button onClick={del} className="rounded bg-rose-500/25 px-2 py-0.5 font-semibold text-rose-100 hover:bg-rose-500/40">Yes</button>
            <button onClick={() => setConfirmDel(false)} className="rounded px-2 py-0.5 text-slate-300 hover:text-white">No</button>
          </span>
        )}
        <button onClick={onClose} title="Close (Esc)" aria-label="Close" className={iconBtn}>
          <X size={16} />
        </button>
      </header>

      {/* desktop: editor + LIVE preview side by side; the eye/Ctrl+Shift+V toggle
          switches to full-width preview. mobile: one pane, toggled. */}
      <div className={`grid min-h-0 flex-1 grid-rows-1 ${preview ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          placeholder="# Write your notes in markdown…"
          className={`h-full w-full resize-none bg-[#0b1120] px-5 py-5 font-mono text-[14px] leading-relaxed text-[#e2e8f0] outline-none sm:px-8 ${
            preview ? "hidden" : "block"
          }`}
        />
        <div className={`h-full overflow-auto border-white/10 lg:border-l ${preview ? "block" : "hidden lg:block"}`}>
          <div className="md-body mx-auto max-w-3xl px-5 py-6 sm:px-8" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}
