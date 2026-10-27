// Browser side of live note updates: one shared EventSource per tab (ref-counted, so it only
// stays open while the Notebook or the editor is on screen), plus the "follow edits" setting.
import { useEffect, useRef, useSyncExternalStore } from "react";
import { NOTES_EDITABLE } from "./editable";

export type NoteEvent = { kind: "add" | "change" | "unlink" | "tree"; slug: string[]; at: number };
export type LiveStatus = "off" | "connecting" | "live" | "offline";
type Listener = (e: NoteEvent) => void;

let source: EventSource | null = null;
let status: LiveStatus = NOTES_EDITABLE ? "connecting" : "off";
let dropped = false; // the stream broke after being live, so edits may have been missed
const listeners = new Set<Listener>();
const statusSubs = new Set<() => void>();

function setStatus(next: LiveStatus) {
  if (next === status) return;
  status = next;
  statusSubs.forEach((f) => f());
}
const emit = (e: NoteEvent) => listeners.forEach((l) => l(e));

function connect() {
  const es = new EventSource("/api/notes/events");
  source = es;
  es.onopen = () => {
    setStatus("live");
    if (dropped) {
      dropped = false;
      emit({ kind: "tree", slug: [], at: Date.now() }); // catch up on whatever happened while offline
    }
  };
  es.onerror = () => {
    // CLOSED = the server refused (read-only build); otherwise the browser is retrying by itself
    if (es.readyState === EventSource.CLOSED) setStatus("off");
    else {
      dropped = true;
      setStatus("offline");
    }
  };
  es.addEventListener("note", (m) => {
    try {
      emit(JSON.parse((m as MessageEvent).data) as NoteEvent);
    } catch {
      /* malformed frame — ignore */
    }
  });
}

function subscribeNotes(l: Listener): () => void {
  if (!NOTES_EDITABLE) return () => {};
  listeners.add(l);
  if (!source) connect();
  return () => {
    listeners.delete(l);
    if (listeners.size > 0) return;
    source?.close();
    source = null;
    dropped = false;
    setStatus("connecting");
  };
}

/** Calls `onEvent` for every note change on disk (new, edited, deleted) while the component is mounted. */
export function useLiveNotes(onEvent: Listener) {
  const latest = useRef(onEvent);
  useEffect(() => {
    latest.current = onEvent;
  });
  useEffect(() => subscribeNotes((e) => latest.current(e)), []);
}

export function useLiveStatus(): LiveStatus {
  return useSyncExternalStore(
    (cb) => {
      statusSubs.add(cb);
      return () => statusSubs.delete(cb);
    },
    () => status,
    () => "connecting"
  );
}

/* "Follow edits": scroll to the part of the note that just changed. On by default only on whiteboards. */
const followSubs = new Set<() => void>();
const followKey = (board: boolean) => `notebookFollow:${board ? "board" : "note"}`;

export function isFollowing(board: boolean): boolean {
  try {
    const v = localStorage.getItem(followKey(board));
    return v == null ? board : v === "1";
  } catch {
    return board;
  }
}

export function setFollowing(board: boolean, on: boolean) {
  try {
    localStorage.setItem(followKey(board), on ? "1" : "0");
  } catch {
    /* private mode — the toggle just won't persist */
  }
  followSubs.forEach((f) => f());
}

export function useFollowing(board: boolean): boolean {
  return useSyncExternalStore(
    (cb) => {
      followSubs.add(cb);
      return () => followSubs.delete(cb);
    },
    () => isFollowing(board),
    () => board
  );
}