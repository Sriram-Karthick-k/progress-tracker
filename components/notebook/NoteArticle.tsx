import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, ListTree, CalendarDays } from "lucide-react";
import type { LoadedNote } from "@/lib/notes";
import { NotebookContent } from "@/components/notebook/NotebookContent";
import { NoteEditButton } from "@/components/notebook/NoteEditButton";
import { TableOfContents, MobileContents } from "@/components/notebook/TableOfContents";

const href = (slug: string[]) => `/notebook/${slug.join("/")}`;

export function NoteArticle({ note, editable }: { note: LoadedNote; editable: boolean }) {
  const updated = new Date(note.updatedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
  const sections = note.headings.filter((h) => h.depth === 2).length;

  return (
    <div className="flex gap-10">
      <article className="min-w-0 max-w-[46rem] flex-1">
        <header className="mb-8 border-b border-white/10 pb-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <Link href="/notebook" className="transition hover:text-white">
                Notebook
              </Link>
              {note.breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="text-slate-700">/</span>
                  <span className="truncate">{b}</span>
                </span>
              ))}
            </nav>
            {editable && <NoteEditButton slug={note.slug} title={note.title} />}
          </div>
          <h1 className="text-[1.65rem] font-bold leading-tight tracking-tight text-white [overflow-wrap:anywhere] sm:text-[2.1rem]">{note.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} /> {note.readingMinutes} min read
            </span>
            {sections > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <ListTree size={13} /> {sections} section{sections === 1 ? "" : "s"}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} /> Updated {updated}
            </span>
          </div>
        </header>

        <MobileContents headings={note.headings} />
        <NotebookContent html={note.html} />

        {(note.prev || note.next) && (
          <nav aria-label="More notes" className="mt-14 grid grid-cols-1 gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
            {note.prev ? (
              <Link
                href={href(note.prev.slug)}
                className="group min-w-0 rounded-xl border border-white/10 p-4 transition hover:border-indigo-400/50 hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ArrowLeft size={13} className="transition group-hover:-translate-x-0.5" /> Previous
                </div>
                <div className="mt-1 truncate font-medium text-white">{note.prev.title}</div>
              </Link>
            ) : (
              <span />
            )}
            {note.next && (
              <Link
                href={href(note.next.slug)}
                className="group min-w-0 rounded-xl border border-white/10 p-4 text-right transition hover:border-indigo-400/50 hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400">
                  Next <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                </div>
                <div className="mt-1 truncate font-medium text-white">{note.next.title}</div>
              </Link>
            )}
          </nav>
        )}
      </article>
      <TableOfContents headings={note.headings} />
    </div>
  );
}
