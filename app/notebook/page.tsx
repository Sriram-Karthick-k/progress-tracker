import { getNotesTree, getNote, countNotes } from "@/lib/notes";
import { NotebookShell } from "@/components/notebook/NotebookShell";
import { NotebookContent } from "@/components/notebook/NotebookContent";
import { NoteEditButton } from "@/components/notebook/NoteEditButton";
import { TableOfContents } from "@/components/notebook/TableOfContents";
import { ARTICLE_WIDTH } from "@/components/notebook/layout";

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
      {/* title row + article share one centred column, with the contents rail beside it */}
      <div className="flex justify-center gap-10">
        <div className={`min-w-0 flex-1 ${ARTICLE_WIDTH}`}>
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
            <article>
              <NotebookContent html={welcome.html} />
            </article>
          ) : (
            <p className="text-sm text-slate-500">Add markdown files under <code>content/notes/</code> to get started.</p>
          )}
        </div>
        {welcome && <TableOfContents headings={welcome.headings} />}
      </div>
    </NotebookShell>
  );
}
