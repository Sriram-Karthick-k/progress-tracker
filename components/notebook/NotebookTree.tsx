"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  FilePlus,
  FolderPlus,
  Trash2,
  MoreVertical,
} from "lucide-react";
import type { NoteNode } from "@/lib/notes";
import { noteApi, openNoteEditor, cleanPath } from "@/components/notebook/noteClient";
import { NOTES_EDITABLE as EDITABLE } from "@/components/notebook/editable";

const noteHref = (slug: string[]) => "/notebook/" + slug.join("/");

type MenuState = { node: NoteNode; x: number; y: number } | null;
type Dialog =
  | { kind: "newFile"; parent: string[]; error?: string }
  | { kind: "newFolder"; parent: string[]; error?: string }
  | { kind: "deleteFolder"; slug: string[]; error?: string }
  | { kind: "deleteNote"; slug: string[]; error?: string }
  | null;

// -------------------------------- nodes --------------------------------

function NoteItem({ node, active, depth, onMenu }: { node: Extract<NoteNode, { type: "note" }>; active: string; depth: number; onMenu: (n: NoteNode, x: number, y: number) => void }) {
  const on = active === node.slug.join("/");
  return (
    <div className="group relative flex items-center">
      <Link
        href={noteHref(node.slug)}
        onContextMenu={(e) => { e.preventDefault(); onMenu(node, e.clientX, e.clientY); }}
        style={{ paddingLeft: 8 + depth * 14 }}
        className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1.5 pr-7 text-sm transition ${
          on ? "bg-indigo-500/15 font-medium text-white" : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
        }`}
      >
        <FileText size={14} className="shrink-0 opacity-70" />
        <span className="truncate">{node.title}</span>
      </Link>
      {EDITABLE && (
        <button
          onClick={(e) => { e.preventDefault(); onMenu(node, e.clientX, e.clientY); }}
          aria-label="Note menu"
          className="absolute right-1 grid h-6 w-6 place-items-center rounded text-slate-500 opacity-100 transition hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
        >
          <MoreVertical size={14} />
        </button>
      )}
    </div>
  );
}

function FolderItem({ node, active, depth, onMenu }: { node: Extract<NoteNode, { type: "folder" }>; active: string; depth: number; onMenu: (n: NoteNode, x: number, y: number) => void }) {
  const [open, setOpen] = useState(active.startsWith(node.slug.join("/")));
  return (
    <div>
      <div className="group relative flex items-center">
        <button
          onClick={() => setOpen((o) => !o)}
          onContextMenu={(e) => { e.preventDefault(); onMenu(node, e.clientX, e.clientY); }}
          style={{ paddingLeft: 8 + depth * 14 }}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg py-1.5 pr-7 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.03] hover:text-white"
        >
          <ChevronRight size={13} className={`shrink-0 transition ${open ? "rotate-90" : ""}`} />
          {open ? <FolderOpen size={14} className="shrink-0 text-indigo-300/80" /> : <Folder size={14} className="shrink-0 text-slate-500" />}
          <span className="truncate">{node.title}</span>
        </button>
        {EDITABLE && (
          <button
            onClick={(e) => { e.preventDefault(); onMenu(node, e.clientX, e.clientY); }}
            aria-label="Folder menu"
            className="absolute right-1 grid h-6 w-6 place-items-center rounded text-slate-500 opacity-100 transition hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
          >
            <MoreVertical size={14} />
          </button>
        )}
      </div>
      {open && <TreeNodes nodes={node.children} active={active} depth={depth + 1} onMenu={onMenu} />}
    </div>
  );
}

function TreeNodes({ nodes, active, depth, onMenu }: { nodes: NoteNode[]; active: string; depth: number; onMenu: (n: NoteNode, x: number, y: number) => void }) {
  return (
    <>
      {nodes.map((n) =>
        n.type === "folder" ? (
          <FolderItem key={n.slug.join("/")} node={n} active={active} depth={depth} onMenu={onMenu} />
        ) : (
          <NoteItem key={n.slug.join("/")} node={n} active={active} depth={depth} onMenu={onMenu} />
        )
      )}
    </>
  );
}

// ------------------------------- the tree -------------------------------

export function NotebookTree({ tree, active, trailing }: { tree: NoteNode[]; active: string; trailing?: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [menu, setMenu] = useState<MenuState>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", () => setMenu(null));
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", esc);
    };
  }, [menu]);

  function openDialog(d: Dialog) {
    setInput("");
    setDialog(d);
    setMenu(null);
  }

  async function submit() {
    if (!dialog) return;
    setBusy(true);
    try {
      if (dialog.kind === "newFile" || dialog.kind === "newFolder") {
        const slug = [...dialog.parent, ...cleanPath(input)];
        if (!slug.length) return setBusy(false);
        if (dialog.kind === "newFile") {
          setDialog(null);
          openNoteEditor(slug); // editor creates the file on Save
        } else {
          await noteApi("mkdir", slug);
          setDialog(null);
          router.refresh();
        }
      } else if (dialog.kind === "deleteFolder") {
        await noteApi("deleteFolder", dialog.slug);
        setDialog(null);
        if (path.startsWith(noteHref(dialog.slug))) router.push("/notebook");
        else router.refresh();
      } else if (dialog.kind === "deleteNote") {
        await noteApi("delete", dialog.slug);
        setDialog(null);
        if (path === noteHref(dialog.slug)) router.push("/notebook");
        else router.refresh();
      }
    } catch (e) {
      setDialog((d) => (d ? { ...d, error: (e as Error).message } : d));
    } finally {
      setBusy(false);
    }
  }

  const menuItem = "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white";

  return (
    <>
      {/* header + root create actions */}
      <div className="mb-2 flex items-center gap-1 px-1">
        <span className="mr-auto text-[10px] font-bold uppercase tracking-wider text-slate-600">Notebook</span>
        {EDITABLE && (
          <>
            <button onClick={() => openDialog({ kind: "newFile", parent: [] })} title="New note" aria-label="New note" className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:text-white">
              <FilePlus size={15} />
            </button>
            <button onClick={() => openDialog({ kind: "newFolder", parent: [] })} title="New folder" aria-label="New folder" className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:text-white">
              <FolderPlus size={15} />
            </button>
          </>
        )}
        {trailing}
      </div>

      {tree.length === 0 ? (
        <p className="px-2 py-4 text-xs text-slate-600">No notes yet. Use ＋ above or the note button on any topic.</p>
      ) : (
        <nav className="space-y-0.5">
          <TreeNodes nodes={tree} active={active} depth={0} onMenu={(n, x, y) => setMenu({ node: n, x, y })} />
        </nav>
      )}

      {/* context menu */}
      {menu && (
        <div
          ref={menuRef}
          className="fixed z-[80] min-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-slate-900 py-1 shadow-2xl"
          style={{ top: Math.min(menu.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 160), left: Math.min(menu.x, (typeof window !== "undefined" ? window.innerWidth : 800) - 200) }}
        >
          {menu.node.type === "folder" ? (
            <>
              <button className={menuItem} onClick={() => openDialog({ kind: "newFile", parent: menu.node.slug })}>
                <FilePlus size={14} /> New file here
              </button>
              <button className={menuItem} onClick={() => openDialog({ kind: "newFolder", parent: menu.node.slug })}>
                <FolderPlus size={14} /> New nested folder
              </button>
              <div className="my-1 border-t border-white/10" />
              <button className={`${menuItem} text-rose-300 hover:text-rose-200`} onClick={() => openDialog({ kind: "deleteFolder", slug: menu.node.slug })}>
                <Trash2 size={14} /> Delete folder
              </button>
            </>
          ) : (
            <>
              <button className={menuItem} onClick={() => { const s = menu.node.slug; setMenu(null); router.push(noteHref(s)); }}>
                <FileText size={14} /> Open
              </button>
              <button className={menuItem} onClick={() => openNoteEditor(menu.node.slug)}>
                <FilePlus size={14} /> Edit
              </button>
              <div className="my-1 border-t border-white/10" />
              <button className={`${menuItem} text-rose-300 hover:text-rose-200`} onClick={() => openDialog({ kind: "deleteNote", slug: menu.node.slug })}>
                <Trash2 size={14} /> Delete note
              </button>
            </>
          )}
        </div>
      )}

      {/* dialog */}
      {dialog && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 px-4 backdrop-blur-sm" onClick={() => !busy && setDialog(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {dialog.kind === "deleteFolder" || dialog.kind === "deleteNote" ? (
              <>
                <div className="mb-1 text-sm font-bold text-white">
                  Delete {dialog.kind === "deleteFolder" ? "folder" : "note"}?
                </div>
                <div className="mb-3 text-sm text-slate-400">
                  <code className="text-slate-300">{dialog.slug.join("/")}</code>
                  {dialog.kind === "deleteFolder" && " and everything inside it"} will be permanently removed.
                </div>
              </>
            ) : (
              <>
                <div className="mb-1 text-sm font-bold text-white">
                  New {dialog.kind === "newFile" ? "note" : "folder"}
                </div>
                <div className="mb-3 text-xs text-slate-500">
                  {dialog.parent.length ? <>in <code className="text-slate-400">{dialog.parent.join("/")}/</code></> : "at the top level"}
                </div>
                <input
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setDialog(null); }}
                  placeholder={dialog.kind === "newFile" ? "note name (e.g. two-sum)" : "folder name (e.g. arrays)"}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </>
            )}
            {dialog.error && <div className="mb-3 text-xs text-rose-400">{dialog.error}</div>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setDialog(null)} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-400 transition hover:text-white">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={busy}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
                  dialog.kind === "deleteFolder" || dialog.kind === "deleteNote"
                    ? "border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                    : "border-indigo-500/40 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25"
                }`}
              >
                {dialog.kind === "deleteFolder" || dialog.kind === "deleteNote" ? "Delete" : dialog.kind === "newFile" ? "Create & edit" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
