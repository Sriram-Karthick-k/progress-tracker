"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";

// The Notebook sidebar has to look the same after every click. Each note page
// renders its own <NotebookShell>, so React remounts the tree on every
// navigation and plain useState would forget which folders were open and how far
// the list was scrolled. This module-level store outlives those remounts and
// mirrors itself to localStorage so a reload keeps the shape too.

const KEY = "notebookOpenFolders.v1";
type Open = Readonly<Record<string, boolean>>; // folder slug "a/b" -> open? (absent = never touched)

const EMPTY: Open = {};
let state: Open = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (raw && typeof raw === "object") state = raw;
  } catch {
    /* private mode / corrupt value: start empty */
  }
}

function commit(next: Open) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: the in-memory copy still survives client navigation */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snapshot = () => {
  load();
  return state;
};
const serverSnapshot = () => EMPTY;

/** Folder slugs ("a", "a/b") that contain the note at `active` ("a/b/note"). */
export const ancestorsOf = (active: string) => {
  const parts = active.split("/").filter(Boolean).slice(0, -1);
  return parts.map((_, i) => parts.slice(0, i + 1).join("/"));
};

/** Is `folder` open? The user's own choice wins; an untouched folder opens only if it holds the current note. */
export function useFolderOpen(folder: string, active: string): boolean {
  const s = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return s[folder] ?? ancestorsOf(active).includes(folder);
}

export function setFolderOpen(folder: string, open: boolean) {
  load();
  if (state[folder] !== open) commit({ ...state, [folder]: open });
}

/** Open every folder on the way to the note being read, so it is never hidden inside a collapsed folder. */
export function revealNote(active: string) {
  load();
  const need = ancestorsOf(active).filter((f) => state[f] !== true);
  if (need.length) commit({ ...state, ...Object.fromEntries(need.map((f) => [f, true])) });
}

// ------------------------------ scroll position ------------------------------

let savedScroll = 0;
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Put on the sidebar's scrolling element: it comes back at the same scroll position after a navigation. */
export function useKeepScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useIsoLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = savedScroll;
  }, []);
  const onScroll = (e: React.UIEvent<T>) => {
    // a display:none sidebar (desktop one on a phone, or the reverse) reports 0; ignore it so it can't wipe the saved spot
    if (e.currentTarget.getClientRects().length) savedScroll = e.currentTarget.scrollTop;
  };
  return { ref, onScroll };
}
