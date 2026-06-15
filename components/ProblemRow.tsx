import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StatusToggle } from "./StatusToggle";
import { ConfidenceStars } from "./ConfidenceStars";
import { RevisitFlag } from "./RevisitFlag";
import { NotesBox } from "./NotesBox";
import { Status, DIFF_COLOR } from "@/lib/status";

export type ProblemLike = {
  id: number;
  lcNumber: number | null;
  title: string;
  url: string | null;
  difficulty: string;
  pattern: string;
  companies: string;
  status: string;
  confidence: number;
  revisit: boolean;
  notes: string | null;
};

export function ProblemRow({ p }: { p: ProblemLike }) {
  const companies = p.companies.split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/5 px-4 py-3 transition last:border-b-0 hover:bg-white/[0.02]">
      <div className="w-9 shrink-0 text-sm tabular-nums text-slate-500">
        {p.lcNumber ?? ""}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={p.url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 font-medium text-slate-100 hover:text-indigo-300"
        >
          {p.title}
          <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-300" />
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className="text-xs font-bold"
            style={{ color: DIFF_COLOR[p.difficulty] }}
          >
            {p.difficulty}
          </span>
          <span className="text-slate-700">·</span>
          <span className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-slate-400">
            {p.pattern}
          </span>
          {companies.map((c) => (
            <span
              key={c}
              className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-slate-500"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <ConfidenceStars kind="problem" id={p.id} confidence={p.confidence} />
      <StatusToggle kind="problem" id={p.id} status={p.status as Status} />
      <RevisitFlag kind="problem" id={p.id} revisit={p.revisit} />
      <NotesBox kind="problem" id={p.id} notes={p.notes} />
    </div>
  );
}
