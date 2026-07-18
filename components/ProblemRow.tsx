import Link from "next/link";
import { ExternalLink, MessageSquareText, Youtube } from "lucide-react";
import { StatusToggle } from "./StatusToggle";
import { ConfidenceStars } from "./ConfidenceStars";
import { RevisitFlag } from "./RevisitFlag";
import { NotesBox } from "./NotesBox";
import { DIFF_COLOR } from "@/lib/status";
import { ProblemDef } from "@/lib/seed-data";

export function ProblemRow({ p }: { p: ProblemDef }) {
  const companies = p.companies.split(",").map((s) => s.trim()).filter(Boolean);
  // deterministic help links (no per-problem curation needed)
  const solutionsUrl = `${p.url.replace(/\/?$/, "/")}solutions/`;
  const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${p.title} leetcode ${p.lcNumber}`)}`;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/5 px-4 py-3 transition last:border-b-0 hover:bg-white/[0.02]">
      <div className="w-9 shrink-0 text-sm tabular-nums text-slate-500">{p.lcNumber}</div>

      <div className="min-w-0 flex-1">
        <Link
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 font-medium text-slate-100 hover:text-indigo-300"
        >
          {p.title}
          <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-300" />
        </Link>
        {p.mechanic && (
          <div className="mt-0.5 text-sm text-slate-400">{p.mechanic}</div>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold" style={{ color: DIFF_COLOR[p.difficulty] }}>
            {p.difficulty}
          </span>
          <span className="text-slate-700">·</span>
          <span className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-slate-400">
            {p.pattern}
          </span>
          {p.group && (
            <span className="rounded border border-indigo-500/20 bg-indigo-500/[0.07] px-1.5 py-0.5 text-[11px] text-indigo-300/80">
              {p.group}
            </span>
          )}
          {p.also.map((a) => (
            <span
              key={a}
              title="Also drills this pattern"
              className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-slate-500"
            >
              also: {a}
            </span>
          ))}
          {companies.map((c) => (
            <span
              key={c}
              className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-slate-500"
            >
              {c}
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <a
            href={solutionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 transition hover:text-indigo-300"
          >
            <MessageSquareText size={12} /> Solutions
          </a>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 transition hover:text-rose-300"
          >
            <Youtube size={12} /> Video
          </a>
        </div>
      </div>

      <ConfidenceStars id={p.id} />
      <StatusToggle id={p.id} />
      <RevisitFlag id={p.id} />
      <NotesBox id={p.id} />
    </div>
  );
}
