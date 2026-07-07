"use client";

import { PageHeader } from "@/components/ui";
import { ProblemsClient } from "@/components/ProblemsClient";
import { PROBLEMS } from "@/lib/seed-data";
import { useProgress } from "@/components/ProgressProvider";

export default function ProblemsPage() {
  const { get } = useProgress();
  const solved = PROBLEMS.filter((p) => get(p.id).status === "DONE").length;

  return (
    <div className="px-8 py-8 lg:px-10">
      <PageHeader
        title="LeetCode Problems"
        subtitle={`${solved} of ${PROBLEMS.length} solved · filter by company, pattern, difficulty or status.`}
      />
      <ProblemsClient />
    </div>
  );
}
