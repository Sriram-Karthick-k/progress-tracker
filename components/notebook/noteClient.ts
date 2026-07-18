// Client helpers for the Notebook editor (used by client components only).

export async function noteApi(action: string, slug: string[], content?: string) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, slug, content }),
  });
  if (!res.ok) {
    const m = await res.json().catch(() => ({}));
    throw new Error(m.error || res.statusText);
  }
}

export async function readNote(slug: string[]): Promise<{ exists: boolean; content: string }> {
  const res = await fetch(`/api/notes?slug=${encodeURIComponent(slug.join("/"))}`);
  if (!res.ok) return { exists: false, content: "" };
  return res.json();
}

/** Open the full-screen editor for a note (creates it on save if new). */
export function openNoteEditor(slug: string[], title?: string) {
  window.dispatchEvent(new CustomEvent("open-note-editor", { detail: { slug, title } }));
}

export function cleanPath(p: string): string[] {
  return p
    .trim()
    .replace(/\.md$/i, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .split("/")
    .map((s) => s.replace(/[^a-z0-9-_]/g, ""))
    .filter(Boolean);
}

export function humanize(s: string) {
  return s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
