// Locked notebook folders: everything inside is READ-ONLY. No editing, no new notes
// or folders inside, no deleting a note, the folder or any parent of it.
//
// Enforced on the server (app/api/notes/route.ts answers 403) and mirrored in the UI
// (edit button, tree menu) so the controls are not even offered. This file has no
// Node imports on purpose: client components import it too.
//
// To unlock a folder, remove it from this list. The check is case-insensitive
// because Windows treats "Cheat-Sheets" and "cheat-sheets" as the same folder.
export const LOCKED_FOLDERS: string[][] = [["cheat-sheets"]];

export const LOCKED_MESSAGE = "This folder is locked: its notes cannot be edited or deleted.";

const norm = (slug: string[]) => slug.map((s) => s.toLowerCase());

/** True when `slug` is inside a locked folder, is one, or is a parent of one (deleting it would delete the locked folder). */
export function isLocked(slug: string[]): boolean {
  const s = norm(slug);
  if (!s.length) return false; // the notes root itself is not a note
  return LOCKED_FOLDERS.some((locked) => {
    const l = norm(locked);
    const n = Math.min(s.length, l.length);
    for (let i = 0; i < n; i++) if (s[i] !== l[i]) return false;
    return true;
  });
}
