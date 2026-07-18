import { getNotesTree, getNote, countNotes } from "@/lib/notes";
import { NotebookShell } from "@/components/notebook/NotebookShell";
import { NotebookContent } from "@/components/notebook/NotebookContent";
import { NoteEditButton } from "@/components/notebook/NoteEditButton";

export default function NotebookIndex() {
  const tree = getNotesTree();
  const welcome = getNote(["welcome"]);
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
        <article className="max-w-3xl">
          <NotebookContent html={welcome.html} />
        </article>
      ) : (
        <p className="text-sm text-slate-500">Add markdown files under <code>content/notes/</code> to get started.</p>
      )}
    </NotebookShell>
  );
}
