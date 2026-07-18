"use client";

// Renders a resource-hub domain: sections → topic cards → external resource
// links + progress controls. The app organizes and tracks; the depth is in the
// linked references.

import { ExternalLink, FileText, Play, BookOpen, FileCode, Dumbbell, GraduationCap, NotebookPen } from "lucide-react";
import type { Resource, ResourceKind } from "@/lib/learn/resource-types";
import { topicProgressId } from "@/lib/learn/resource-types";
import type { ResourceDomain } from "@/lib/learn/resources";
import { StatusToggle } from "@/components/StatusToggle";
import { RevisitFlag } from "@/components/RevisitFlag";
import { openNoteEditor } from "@/components/notebook/noteClient";
import { NOTES_EDITABLE } from "@/components/notebook/editable";
import { Card } from "@/components/ui";

const KIND_META: Record<ResourceKind, { icon: typeof FileText; label: string; cls: string }> = {
  article: { icon: FileText, label: "Article", cls: "text-sky-300 border-sky-500/30 bg-sky-500/10" },
  video: { icon: Play, label: "Video", cls: "text-rose-300 border-rose-500/30 bg-rose-500/10" },
  book: { icon: BookOpen, label: "Book", cls: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  docs: { icon: FileCode, label: "Docs", cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  practice: { icon: Dumbbell, label: "Practice", cls: "text-violet-300 border-violet-500/30 bg-violet-500/10" },
  course: { icon: GraduationCap, label: "Course", cls: "text-indigo-300 border-indigo-500/30 bg-indigo-500/10" },
};

function ResourceLink({ r }: { r: Resource }) {
  const meta = KIND_META[r.kind];
  const Icon = meta.icon;
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.04]"
    >
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${meta.cls}`}>
        <Icon size={13} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-slate-200 group-hover:text-white">{r.label}</span>
        {r.by && <span className="block truncate text-[11px] text-slate-500">{r.by}</span>}
      </span>
      <span className="shrink-0 rounded border border-white/8 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
        {meta.label}
      </span>
      <ExternalLink size={13} className="shrink-0 text-slate-600 group-hover:text-indigo-300" />
    </a>
  );
}

export function ResourceDomainView({ domain }: { domain: ResourceDomain }) {
  return (
    <div className="space-y-6">
      {domain.sections.map((section) => (
        <section key={section.id}>
          <div className="mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{section.title}</h2>
            {section.desc && <p className="mt-0.5 text-sm text-slate-500">{section.desc}</p>}
          </div>
          <div className="space-y-3">
            {section.topics.map((topic) => {
              const pid = topicProgressId(domain.key, topic.id);
              return (
                <Card key={topic.id} id={pid} className="scroll-mt-6 p-4">
                  <div className="mb-3 flex flex-wrap items-start gap-x-3 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-100">{topic.title}</div>
                      {topic.blurb && <div className="mt-0.5 text-sm text-slate-400">{topic.blurb}</div>}
                    </div>
                    {NOTES_EDITABLE && (
                      <button
                        onClick={() => openNoteEditor([domain.key, topic.id], topic.title)}
                        title={`Take notes on ${topic.title}`}
                        aria-label="Take notes"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-700 text-slate-500 transition hover:border-indigo-400/60 hover:text-indigo-300"
                      >
                        <NotebookPen size={14} />
                      </button>
                    )}
                    <StatusToggle id={pid} />
                    <RevisitFlag id={pid} />
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {topic.resources.map((r, i) => (
                      <ResourceLink key={i} r={r} />
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
