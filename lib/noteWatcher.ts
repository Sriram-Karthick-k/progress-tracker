// Server-only: one shared file watcher over content/notes/, fanned out to every open
// browser tab by /api/notes/events (Server-Sent Events). Started lazily by the first
// subscriber and closed a minute after the last one leaves. The state lives on globalThis
// so dev HMR and the separately-bundled route handlers all share a single watcher.

import path from "node:path";
import chokidar, { type FSWatcher } from "chokidar";

const ROOT = path.join(process.cwd(), "content", "notes");
const IDLE_CLOSE_MS = 60_000;
const BATCH_MS = 60; // one save often fires several fs events; send one

export type NoteEvent = {
  kind: "add" | "change" | "unlink" | "tree"; // "tree": a folder appeared/vanished, or "anything may have changed"
  slug: string[];
  at: number;
};
type Listener = (e: NoteEvent) => void;

type State = { watcher: FSWatcher | null; listeners: Set<Listener>; closeTimer: ReturnType<typeof setTimeout> | null };
const g = globalThis as unknown as { __notesWatch?: State };
const state: State = (g.__notesWatch ??= { watcher: null, listeners: new Set(), closeTimer: null });

const rel = (p: string) => path.relative(ROOT, p);
// same rule as the sidebar: dot-folders (like .claude/) are not notes
const hidden = (p: string) => rel(p).split(path.sep).some((s) => s.startsWith("."));
const isNote = (p: string) => p.toLowerCase().endsWith(".md");
const slugOf = (p: string) => rel(p).replace(/\.md$/i, "").split(path.sep);

function start(): FSWatcher {
  const queue = new Map<string, NoteEvent>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const push = (kind: NoteEvent["kind"], slug: string[]) => {
    queue.set(slug.join("/"), { kind, slug, at: Date.now() }); // newest event per path wins
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      const batch = [...queue.values()];
      queue.clear();
      for (const e of batch) state.listeners.forEach((l) => l(e));
    }, BATCH_MS);
  };

  const w = chokidar.watch(ROOT, {
    ignoreInitial: true,
    ignored: hidden,
    // an editor/LLM may still be flushing the file; wait until its size stops changing
    awaitWriteFinish: { stabilityThreshold: 120, pollInterval: 40 },
  });
  for (const kind of ["add", "change", "unlink"] as const) {
    w.on(kind, (p) => isNote(p) && push(kind, slugOf(p)));
  }
  for (const ev of ["addDir", "unlinkDir"] as const) {
    w.on(ev, (p) => p !== ROOT && push("tree", slugOf(p)));
  }
  w.on("error", (e) => console.error("[notes] watcher error", e));
  return w;
}

export function subscribeNotes(listener: Listener): () => void {
  if (state.closeTimer) {
    clearTimeout(state.closeTimer);
    state.closeTimer = null;
  }
  state.listeners.add(listener);
  state.watcher ??= start();

  return () => {
    state.listeners.delete(listener);
    if (state.listeners.size > 0 || state.closeTimer) return;
    state.closeTimer = setTimeout(() => {
      state.closeTimer = null;
      if (state.listeners.size > 0) return;
      void state.watcher?.close();
      state.watcher = null;
    }, IDLE_CLOSE_MS);
    state.closeTimer.unref?.();
  };
}