"use client";

import { Suspense } from "react";
import Link from "next/link";
import { GitBranch, Boxes } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { ProblemsClient } from "@/components/ProblemsClient";
import { PROBLEMS } from "@/lib/seed-data";
import { useProgress } from "@/components/ProgressProvider";

export default function ProblemsPage() {
  const { get } = useProgress();
  const solved = PROBLEMS.filter((p) => get(p.id).status === "DONE").length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="LeetCode Problems"
          subtitle={`${solved} of ${PROBLEMS.length} solved · filter by company, pattern, difficulty or status.`}
        />
        <div className="flex gap-2">
          <Link
            href="/roadmap/dsa"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <GitBranch size={15} /> DSA roadmap
          </Link>
          <Link
            href="/topics/ds-algo"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <Boxes size={15} /> Data Structures
          </Link>
        </div>
      </div>
      {/* Suspense: useSearchParams() requires a boundary during static prerender */}
      <Suspense>
        <ProblemsClient />
      </Suspense>
    </div>
  );
}
