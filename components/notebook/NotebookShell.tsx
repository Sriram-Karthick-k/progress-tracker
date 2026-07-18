"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PanelLeft, PanelLeftClose, X } from "lucide-react";
import { NotebookTree } from "@/components/notebook/NotebookTree";
import type { NoteNode } from "@/lib/notes";

const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

export function NotebookShell({ tree, active, children }: { tree: NoteNode[]; active: string; children: ReactNode }) {
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop tree hidden
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => setCollapsed(localStorage.getItem("notebookTreeCollapsed") === "1"), []);

  function collapseDesktop() {
    setCollapsed(true);
    localStorage.setItem("notebookTreeCollapsed", "1");
  }
  function showContents() {
    if (isDesktop()) {
      setCollapsed(false);
      localStorage.setItem("notebookTreeCollapsed", "0");
    } else setOpen(true);
  }

  const collapseBtn = (
    <button onClick={collapseDesktop} title="Hide contents" aria-label="Hide contents" className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:text-white">
      <PanelLeftClose size={14} />
    </button>
  );
  const closeBtn = (
    <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:text-white">
      <X size={16} />
    </button>
  );

  return (
    <div className="flex">
      {/* desktop tree */}
      <aside className={`sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-white/10 p-3 ${collapsed ? "lg:hidden" : "lg:block"}`}>
        <NotebookTree tree={tree} active={active} trailing={collapseBtn} />
      </aside>

      {/* mobile drawer */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-white/10 bg-slate-950/95 p-3 backdrop-blur transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NotebookTree tree={tree} active={active} trailing={closeBtn} />
      </aside>

      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <button
          onClick={showContents}
          className={`mb-4 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white ${
            collapsed ? "inline-flex" : "inline-flex lg:hidden"
          }`}
        >
          <PanelLeft size={15} /> Contents
        </button>
        {children}
      </div>
    </div>
  );
}
