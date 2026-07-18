// Build-time notes loader — reads content/notes/**.md from disk (Node fs) and
// renders markdown to HTML. SERVER-ONLY: import this only from server components
// (the /notebook pages). Never from a "use client" file.

import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const ROOT = path.join(process.cwd(), "content", "notes");

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    // render ```mermaid fences as <pre class="mermaid"> for the client to draw
    code(token: { lang?: string; text: string }) {
      if ((token.lang || "").trim() === "mermaid") {
        return `<pre class="mermaid">${token.text}</pre>`;
      }
      return false; // fall back to marked's default code renderer
    },
  },
});

export type NoteNode =
  | { type: "note"; name: string; title: string; slug: string[] }
  | { type: "folder"; name: string; title: string; slug: string[]; children: NoteNode[] };

function humanize(name: string) {
  return name
    .replace(/\.md$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function titleFromFile(file: string, fallback: string): string {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const m = raw.match(/^\s*#\s+(.+?)\s*$/m);
    if (m) return m[1].trim();
  } catch {
    /* ignore */
  }
  return fallback;
}

function readDir(dir: string, base: string[]): NoteNode[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const folders: NoteNode[] = [];
  const notes: NoteNode[] = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    if (e.isDirectory()) {
      const slug = [...base, e.name];
      const children = readDir(path.join(dir, e.name), slug);
      folders.push({ type: "folder", name: e.name, title: humanize(e.name), slug, children });
    } else if (e.name.toLowerCase().endsWith(".md")) {
      const nameNoExt = e.name.replace(/\.md$/i, "");
      const slug = [...base, nameNoExt];
      notes.push({ type: "note", name: nameNoExt, title: titleFromFile(path.join(dir, e.name), humanize(e.name)), slug });
    }
  }
  const byTitle = (a: NoteNode, b: NoteNode) => a.title.localeCompare(b.title);
  return [...folders.sort(byTitle), ...notes.sort(byTitle)];
}

export function getNotesTree(): NoteNode[] {
  return readDir(ROOT, []);
}

export function getAllNoteSlugs(): string[][] {
  const out: string[][] = [];
  const walk = (nodes: NoteNode[]) => {
    for (const n of nodes) {
      if (n.type === "note") out.push(n.slug);
      else walk(n.children);
    }
  };
  walk(getNotesTree());
  return out;
}

export type LoadedNote = { title: string; html: string; raw: string; slug: string[] };

export function getNote(slug: string[]): LoadedNote | null {
  const safe = slug.map((s) => s.replace(/[^a-zA-Z0-9-_]/g, ""));
  const file = path.join(ROOT, ...safe) + ".md";
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const html = marked.parse(raw) as string;
  const title = titleFromFile(file, humanize(safe[safe.length - 1] || "Note"));
  return { title, html, raw, slug };
}

export function countNotes(): number {
  return getAllNoteSlugs().length;
}
