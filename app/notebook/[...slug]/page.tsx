import { getNotesTree, getNote } from "@/lib/notes";
import { NotebookShell } from "@/components/notebook/NotebookShell";
import { NoteArticle } from "@/components/notebook/NoteArticle";

// No generateStaticParams: notes are edited on disk (in-app editor, or
// externally e.g. by an AI) after the build. force-dynamic alone doesn't
// override statically-listed params, so nothing gets pre-rendered here —
// every request reads content/notes/**.md fresh.
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function NotePage({ params }: { params: { slug: string[] } }) {
  const tree = getNotesTree();
  const note = await getNote(params.slug);
  const active = params.slug.join("/");
  const editable = process.env.NEXT_PUBLIC_NOTES_READONLY !== "1";

  if (!note) {
    return (
      <NotebookShell tree={tree} active={active}>
        <div className="text-slate-400">Note not found.</div>
      </NotebookShell>
    );
  }

  return (
    <NotebookShell tree={tree} active={active}>
      <NoteArticle note={note} editable={editable} />
    </NotebookShell>
  );
}
