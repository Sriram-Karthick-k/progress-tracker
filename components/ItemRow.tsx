"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { StudyItem } from "@/lib/study";

const KIND_CLS: Record<string, string> = {
  LC: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  TOPIC: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  BEHAVIORAL: "border-sky-500/30 bg-sky-500/10 text-sky-300",
};

export function kindClass(kind: string) {
  return KIND_CLS[kind] ?? "border-white/15 bg-white/[0.04] text-slate-300";
}

// A compact, linkable row for an item, with an optional right-side control slot
// and optional body (e.g. a note preview) below.
export function ItemRow({
  item,
  right,
  body,
}: {
  item: StudyItem;
  right?: ReactNode;
  body?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${kindClass(item.kind)}`}>
          {item.kind}
        </span>
        <Link href={item.href} className="min-w-0 flex-1 truncate text-sm font-medium text-slate-100 transition hover:text-indigo-300">
          {item.title}
        </Link>
        <span className="hidden shrink-0 truncate text-xs text-slate-500 sm:block">{item.sub}</span>
        {right}
      </div>
      {body}
    </div>
  );
}
