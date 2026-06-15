import { prisma } from "./prisma";
import { weightedPct } from "./status";

export async function getNav() {
  const [rounds, problems] = await Promise.all([
    prisma.round.findMany({ orderBy: { order: "asc" }, include: { topics: true } }),
    prisma.problem.findMany(),
  ]);

  const roundItems = rounds.map((r) => {
    const statuses = r.topics.map((t) => t.status);
    if (r.key === "dsa") statuses.push(...problems.map((p) => p.status));
    return { key: r.key, name: r.name, icon: r.icon ?? "Circle", pct: weightedPct(statuses) };
  });

  const lcPct = weightedPct(problems.map((p) => p.status));

  return { roundItems, lcPct };
}
