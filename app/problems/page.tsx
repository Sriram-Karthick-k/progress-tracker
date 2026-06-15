import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ProblemsClient } from "@/components/ProblemsClient";

export const dynamic = "force-dynamic";

export default async function ProblemsPage() {
  const problems = await prisma.problem.findMany({ orderBy: { order: "asc" } });
  const solved = problems.filter((p) => p.status === "DONE").length;

  return (
    <div className="px-8 py-8 lg:px-10">
      <PageHeader
        title="LeetCode Problems"
        subtitle={`${solved} of ${problems.length} solved · filter by company, pattern, difficulty or status.`}
      />
      <ProblemsClient problems={problems} />
    </div>
  );
}
