// Roadmaps: an ordered, visual "how to master this" path for each track, with
// live % completion — like Striver's A2Z tree. Built entirely from EXISTING
// content + progress (no new data to maintain):
//   • DSA  → the 33 patterns grouped into an ordered mastery path; each pattern's
//            % comes from its LeetCode problems.
//   • Each resource domain (Java, Spring, React, LLD, HLD, CS) → its sections in
//            order; each topic's % comes from its tracked resource-topic status.

import { RESOURCE_DOMAINS, allTopics, topicProgressId, resourceDomainByKey } from "./learn";
import { PROBLEMS, PATTERN_ORDER } from "./seed-data";

export type RoadmapItem = {
  label: string;
  /** progress ids whose statuses aggregate to this item's completion */
  progressIds: string[];
  href?: string;
  note?: string;
};

export type RoadmapStep = {
  id: string;
  title: string;
  desc?: string;
  items: RoadmapItem[];
};

export type Roadmap = {
  key: string; // route: /roadmap/<key>
  name: string;
  tagline: string;
  icon: string; // resolved via domainIcon
  accent: string; // tailwind gradient
  steps: RoadmapStep[];
};

// ---- DSA: the 33 patterns grouped into an ordered learning path ----
const DSA_LEVELS: { title: string; desc: string; patterns: string[] }[] = [
  {
    title: "Arrays & Two Pointers",
    desc: "Start here — scanning, shrinking, and pre-computing over a linear array.",
    patterns: ["Two Pointers", "Sliding Window", "Prefix Sum", "Sorting", "Cyclic Sort"],
  },
  {
    title: "Hashing, Stack & Simulation",
    desc: "O(1) lookups, monotonic structures, and walking a grid.",
    patterns: ["Hashing / Hash Map", "Stack", "Matrix / Simulation"],
  },
  {
    title: "Binary Search",
    desc: "Halving a sorted space — and searching the answer space with a monotonic predicate.",
    patterns: ["Binary Search"],
  },
  {
    title: "Linked Lists",
    desc: "In-place pointer surgery and the tortoise/hare family.",
    patterns: ["Linked List", "Fast & Slow Pointers"],
  },
  {
    title: "Trees & Heaps",
    desc: "Recurse over children, sweep level by level, and keep the k-best on hand.",
    patterns: ["Trees – DFS", "Trees – BFS", "Heap / Priority Queue", "Trie"],
  },
  {
    title: "Graphs",
    desc: "Connectivity, ordering, grouping, and weighted shortest paths.",
    patterns: [
      "Graphs – Traversal",
      "Graphs – Topological Sort",
      "Graphs – Union-Find",
      "Graphs – Shortest Path",
    ],
  },
  {
    title: "Recursion & Backtracking",
    desc: "Explore-and-undo over all choices; split-solve-combine.",
    patterns: ["Backtracking", "Divide & Conquer"],
  },
  {
    title: "Dynamic Programming & Greedy",
    desc: "The hardest tier — overlapping subproblems, and provably-optimal local choices.",
    patterns: ["Dynamic Programming – 1D", "Dynamic Programming – 2D", "Greedy", "Intervals"],
  },
  {
    title: "Advanced & Specialised",
    desc: "The long tail — reach for these once the core is solid.",
    patterns: [
      "Bit Manipulation",
      "Math & Number Theory",
      "Geometry & Spatial",
      "Strings & Parsing",
      "Design & OOD",
      "Segment Tree & Fenwick",
      "Randomized & Sampling",
      "Concurrency (Threads)",
    ],
  },
];

function dsaRoadmap(): Roadmap {
  const steps: RoadmapStep[] = DSA_LEVELS.map((lvl, i) => ({
    id: `dsa-${i + 1}`,
    title: lvl.title,
    desc: lvl.desc,
    items: lvl.patterns.map((pattern) => {
      const problems = PROBLEMS.filter((p) => p.pattern === pattern);
      return {
        label: pattern,
        progressIds: problems.map((p) => p.id),
        href: `/problems?pattern=${encodeURIComponent(pattern)}`,
        note: `${problems.length} problems`,
      };
    }),
  }));
  // sanity: every pattern placed exactly once
  return {
    key: "dsa",
    name: "DSA",
    tagline: "Master the 33 patterns in order — each unlocked by the last. Progress tracks your solved LeetCode problems.",
    icon: "ListChecks",
    accent: "from-indigo-500 to-violet-600",
    steps,
  };
}

function domainRoadmap(domainKey: string): Roadmap {
  const d = resourceDomainByKey(domainKey)!;
  const steps: RoadmapStep[] = d.sections.map((s) => ({
    id: s.id,
    title: s.title,
    desc: s.desc,
    items: s.topics.map((t) => ({
      label: t.title,
      progressIds: [topicProgressId(d.key, t.id)],
      href: `/topics/${d.key}#${topicProgressId(d.key, t.id)}`,
      note: `${t.resources.length} resources`,
    })),
  }));
  return {
    key: d.key,
    name: d.name,
    tagline: d.tagline,
    icon: d.icon,
    accent: d.accent,
    steps,
  };
}

export const ROADMAPS: Roadmap[] = [
  dsaRoadmap(),
  ...RESOURCE_DOMAINS.map((d) => domainRoadmap(d.key)),
];

export function roadmapByKey(key: string): Roadmap | undefined {
  return ROADMAPS.find((r) => r.key === key);
}

/** All progress ids in a step (for aggregate %). */
export function stepProgressIds(s: RoadmapStep): string[] {
  return s.items.flatMap((i) => i.progressIds);
}

/** All progress ids in a whole roadmap (for the headline %). */
export function roadmapProgressIds(r: Roadmap): string[] {
  return r.steps.flatMap(stepProgressIds);
}
