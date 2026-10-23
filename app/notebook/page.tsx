import { getNotesTree, getNote, countNotes } from "@/lib/notes";
import { NotebookShell } from "@/components/notebook/NotebookShell";
import { NotebookContent } from "@/components/notebook/NotebookContent";
import { NoteEditButton } from "@/components/notebook/NoteEditButton";
import { TableOfContents } from "@/components/notebook/TableOfContents";

// Same reason as [...slug]/page.tsx: content/notes/**.md changes on disk
// after the build, so this must render fresh per request.
export const dynamic = "force-dynamic";

export default async function NotebookIndex() {
  const tree = getNotesTree();
  const welcome = await getNote(["welcome"]);
  const total = countNotes();
  const editable = process.env.NEXT_PUBLIC_NOTES_READONLY !== "1";

  return (
    <NotebookShell tree={tree} active="">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notebook</h1>
          <p className="mt-1 text-sm text-slate-400">
            {total} note{total === 1 ? "" : "s"} · use the ✎ note button on any topic, or ＋ in the left panel.
          </p>
        </div>
        {editable && welcome && <NoteEditButton slug={["welcome"]} title={welcome.title} />}
      </div>

      {welcome ? (
        <div className="flex gap-8">
          <article className="min-w-0 max-w-3xl flex-1">
            <NotebookContent html={welcome.html} />
          </article>
          <TableOfContents headings={welcome.headings} />
        </div>
      ) : (
        <p className="text-sm text-slate-500">Add markdown files under <code>content/notes/</code> to get started.</p>
      )}
    </NotebookShell>
  );
}
