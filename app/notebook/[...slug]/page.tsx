import Link from "next/link";
import { getNotesTree, getAllNoteSlugs, getNote } from "@/lib/notes";
import { NotebookShell } from "@/components/notebook/NotebookShell";
import { NotebookContent } from "@/components/notebook/NotebookContent";
import { NoteEditButton } from "@/components/notebook/NoteEditButton";

export function generateStaticParams() {
  return getAllNoteSlugs().map((slug) => ({ slug }));
}

export default function NotePage({ params }: { params: { slug: string[] } }) {
  const tree = getNotesTree();
  const note = getNote(params.slug);
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
