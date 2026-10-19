import Link from "next/link";
import { getNotesTree, getNote } from "@/lib/notes";
import { NotebookShell } from "@/components/notebook/NotebookShell";
import { NotebookContent } from "@/components/notebook/NotebookContent";
import { NoteEditButton } from "@/components/notebook/NoteEditButton";

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <Link href="/notebook" className="transition hover:text-slate-300">Notebook</Link>
          {params.slug.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-slate-700">/</span>
              <span className={i === params.slug.length - 1 ? "text-slate-300" : ""}>{s}</span>
            </span>
          ))}
        </nav>
        {editable && <NoteEditButton slug={params.slug} title={note.title} />}
      </div>

      <article className="max-w-3xl">
        <NotebookContent html={note.html} />
      </article>
    </NotebookShell>
  );
}
